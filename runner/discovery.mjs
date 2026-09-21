import dns from 'node:dns/promises';

const target = process.env.TARGET || '';
const kind = process.env.SCOPE_KIND || '';
const mode = process.env.SCAN_MODE || 'passive';
const callbackUrl = process.env.CALLBACK_URL || '';
const token = process.env.SCOUTBASE_API_TOKEN || '';

const isDomain = (value) => value.length <= 253 && /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
const isPrivateIPv4 = (ip) => {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
  return octets[0] === 10 || octets[0] === 127 || octets[0] === 0 || (octets[0] === 169 && octets[1] === 254) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168);
};

async function report(status, result = {}, error = '') {
  const response = await fetch(callbackUrl, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ status, result, error })
  });
  if (!response.ok) throw new Error(`Result callback failed with status ${response.status}`);
}

async function run() {
  const callback = new URL(callbackUrl);
  if (!['http:', 'https:'].includes(callback.protocol) || !token) throw new Error('A valid callback URL and API token are required');
  if (kind === 'domain' && !isDomain(target)) throw new Error('The runner received an invalid domain scope');
  if (kind !== 'domain' && kind !== 'cidr') throw new Error('The runner received an invalid scope type');
  if (mode === 'active' && kind !== 'domain') throw new Error('Active jobs require a domain scope');

  const result = { target, kind, mode, addresses: [] };
  if (kind === 'domain') result.addresses = await dns.resolve4(target);
  if (mode === 'active' && (!result.addresses.length || result.addresses.some(isPrivateIPv4))) throw new Error('Active job blocked because the target did not resolve exclusively to public IPv4 addresses');
  if (mode === 'active') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`https://${target}`, { method: 'HEAD', redirect: 'manual', signal: controller.signal });
      result.httpStatus = response.status;
      result.server = response.headers.get('server') || null;
    } finally {
      clearTimeout(timeout);
    }
  }
  await report('completed', result);
}

run().catch(async (error) => {
  try {
    await report('failed', {}, error.message.slice(0, 500));
  } catch (callbackError) {
    console.error(callbackError.message);
  }
  console.error(error.message);
  process.exitCode = 1;
});
