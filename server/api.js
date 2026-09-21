import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns/promises';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const apiToken = process.env.SCOUTBASE_API_TOKEN || '';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const readBody = async (req) => {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body too large');
  }
  return body ? JSON.parse(body) : {};
};

const validDomain = (value) => typeof value === 'string' && value.length <= 253 && /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value.trim().replace(/^\*\./, ''));
const scopeKind = (value) => /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(value) ? 'cidr' : validDomain(value) ? 'domain' : null;
const routeParts = (pathname) => pathname.split('/').filter(Boolean);
const authorized = (req) => {
  const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  if (!apiToken || supplied.length !== apiToken.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(apiToken));
};

async function query(text, params = []) {
  return pool.query(text, params);
}

async function api(req, res, pathname) {
  const parts = routeParts(pathname);
  if (pathname === '/api/health') return json(res, 200, { ok: true, service: 'scoutbase-api' });
  if (parts[1] === 'workspaces' && req.method === 'POST' && parts.length === 2) {
    const body = await readBody(req);
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    if (!name) return json(res, 400, { error: 'Workspace name is required' });
    const id = randomUUID();
    await query('INSERT INTO workspaces (id, name) VALUES ($1, $2)', [id, name]);
    return json(res, 201, { id, name });
  }
  if (parts[1] !== 'workspaces' || !parts[2]) return json(res, 404, { error: 'Not found' });

  const workspaceId = parts[2];
  if (req.method === 'GET' && parts[3] === 'summary') {
    const result = await query(`SELECT
      (SELECT COUNT(*) FROM assets WHERE workspace_id = $1) AS assets,
      (SELECT COUNT(*) FROM scopes WHERE workspace_id = $1 AND verification_status = 'verified') AS verified_scopes,
      (SELECT COUNT(*) FROM scan_jobs WHERE workspace_id = $1 AND status IN ('queued', 'running')) AS active_scans,
      (SELECT COUNT(*) FROM findings WHERE workspace_id = $1 AND status = 'open') AS open_findings`, [workspaceId]);
    return json(res, 200, result.rows[0]);
  }
  if (req.method === 'GET' && parts[3] === 'scopes') {
    const result = await query('SELECT id, value, kind, verification_status, verified_at, created_at FROM scopes WHERE workspace_id = $1 ORDER BY created_at DESC', [workspaceId]);
    return json(res, 200, result.rows);
  }
  if (req.method === 'POST' && parts[3] === 'scopes') {
    const body = await readBody(req);
    const value = typeof body.value === 'string' ? body.value.trim().toLowerCase() : '';
    if (value.startsWith('*.')) return json(res, 400, { error: 'Wildcard scopes are not supported; verify each domain explicitly' });
    const kind = scopeKind(value);
    if (!kind) return json(res, 400, { error: 'Scope must be a valid domain or CIDR range' });
    const id = randomUUID();
    const token = randomUUID().replaceAll('-', '');
    await query('INSERT INTO scopes (id, workspace_id, value, kind, verification_token) VALUES ($1, $2, $3, $4, $5)', [id, workspaceId, value, kind, token]);
    await query('INSERT INTO audit_events (workspace_id, action, subject_type, subject_id, metadata) VALUES ($1, $2, $3, $4, $5)', [workspaceId, 'scope.created', 'scope', id, JSON.stringify({ value, kind })]);
    return json(res, 201, { id, value, kind, verificationStatus: 'pending', dnsRecord: kind === 'domain' ? `_scoutbase-challenge.${value}` : null, verificationToken: token });
  }
  if (req.method === 'GET' && parts[3] === 'scans') {
    const result = await query('SELECT id, scope_id, mode, status, error_message, created_at, started_at, completed_at FROM scan_jobs WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 100', [workspaceId]);
    return json(res, 200, result.rows);
  }
  if (req.method === 'POST' && parts[3] === 'scans') {
    const body = await readBody(req);
    const mode = body.mode === 'active' ? 'active' : 'passive';
    const scopeId = typeof body.scopeId === 'string' ? body.scopeId : '';
    const scopeResult = await query('SELECT id, value, kind, verification_status FROM scopes WHERE id = $1 AND workspace_id = $2', [scopeId, workspaceId]);
    const scope = scopeResult.rows[0];
    if (!scope) return json(res, 404, { error: 'Scope not found' });
    if (mode === 'active' && scope.verification_status !== 'verified') return json(res, 403, { error: 'Active scans require a verified scope' });
    if (mode === 'active' && scope.kind !== 'domain') return json(res, 400, { error: 'Active scans currently require a verified domain scope' });
    const id = randomUUID();
    await query('INSERT INTO scan_jobs (id, workspace_id, scope_id, mode) VALUES ($1, $2, $3, $4)', [id, workspaceId, scopeId, mode]);
    await redis.lPush('scan-jobs', JSON.stringify({ id, workspaceId, scopeId, value: scope.value, kind: scope.kind, mode }));
    return json(res, 202, { id, status: 'queued', mode });
  }
  return json(res, 404, { error: 'Not found' });
}

async function verifyScope(req, res, pathname) {
  const parts = routeParts(pathname);
  if (parts[0] !== 'api' || parts[1] !== 'scopes' || !parts[2] || parts[3] !== 'verify' || req.method !== 'POST') return false;
  const result = await query('SELECT id, value, kind, verification_token FROM scopes WHERE id = $1', [parts[2]]);
  const scope = result.rows[0];
  if (!scope) return json(res, 404, { error: 'Scope not found' }), true;
  if (scope.kind !== 'domain') return json(res, 400, { error: 'Only domain scopes support DNS verification' }), true;
  const records = await dns.resolveTxt(`_scoutbase-challenge.${scope.value}`);
  const verified = records.flat().includes(scope.verification_token);
  if (!verified) return json(res, 422, { error: 'Verification record not found' }), true;
  await query('UPDATE scopes SET verification_status = $1, verified_at = NOW() WHERE id = $2', ['verified', scope.id]);
  return json(res, 200, { id: scope.id, verificationStatus: 'verified' }), true;
}

async function serveStatic(req, res, pathname) {
  const dist = resolve(join(root, 'dist'));
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(dist, requested));
  if (!filePath.startsWith(dist)) return json(res, 400, { error: 'Invalid path' });
  try {
    const info = await stat(filePath);
    const file = info.isFile() ? filePath : join(dist, 'index.html');
    const content = await readFile(file);
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    return res.end(content);
  } catch {
    const content = await readFile(join(dist, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(content);
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname !== '/api/health' && !authorized(req)) return json(res, 401, { error: 'Bearer token required' });
      if (await verifyScope(req, res, url.pathname)) return;
      return await api(req, res, url.pathname);
    }
    return await serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: 'Internal server error' });
  }
});

await redis.connect();
server.listen(port, () => console.log(`Scoutbase self-hosted API listening on ${port}`));
