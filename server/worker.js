import dns from 'node:dns/promises';
import dns from 'node:dns/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

const isPrivateIPv4 = (ip) => {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
  return octets[0] === 10 || octets[0] === 127 || octets[0] === 0 || (octets[0] === 169 && octets[1] === 254) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168);
};

const query = (text, params = []) => pool.query(text, params);

async function discover(job) {
  const addresses = job.kind === 'domain' ? await dns.resolve4(job.value).catch(() => []) : [];
  const assetId = randomUUID();
  const technology = [];
  await query(`INSERT INTO assets (id, workspace_id, scope_id, hostname, asset_type, technologies)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (workspace_id, hostname) DO UPDATE SET last_seen_at = NOW(), technologies = EXCLUDED.technologies`, [assetId, job.workspaceId, job.scopeId, job.value, job.kind, JSON.stringify(technology)]);

  if (job.mode !== 'active' || job.kind !== 'domain') return { addresses };
  if (!addresses.length || addresses.some(isPrivateIPv4)) throw new Error('Active scan blocked because the target did not resolve exclusively to public IPv4 addresses');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`https://${job.value}`, { method: 'HEAD', redirect: 'manual', signal: controller.signal });
    await query(`UPDATE assets SET technologies = $1, last_seen_at = NOW() WHERE workspace_id = $2 AND hostname = $3`, [JSON.stringify([`HTTP ${response.status}`, response.headers.get('server')].filter(Boolean)), job.workspaceId, job.value]);
    return { addresses, httpStatus: response.status };
  } finally {
    clearTimeout(timeout);
  }
}

async function processJob(raw) {
  const job = JSON.parse(raw);
  await query('UPDATE scan_jobs SET status = $1, started_at = NOW() WHERE id = $2', ['running', job.id]);
  try {
    const result = await discover(job);
    await query('UPDATE scan_jobs SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', job.id]);
    await query('INSERT INTO audit_events (workspace_id, action, subject_type, subject_id, metadata) VALUES ($1, $2, $3, $4, $5)', [job.workspaceId, 'scan.completed', 'scan_job', job.id, JSON.stringify(result)]);
  } catch (error) {
    await query('UPDATE scan_jobs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3', ['failed', error.message.slice(0, 500), job.id]);
  }
}

await redis.connect();
console.log('Scoutbase discovery worker ready');
while (true) {
  const next = await redis.brPop('scan-jobs', 0);
  if (next?.element) await processJob(next.element);
}
