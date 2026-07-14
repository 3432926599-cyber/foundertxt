// ============================================================
// FounderTxt — Vercel Function: POST /api/creem-webhook
// 处理 Creem 订阅事件 → 更新 Supabase Auth user_metadata.app_tier
// Vercel config: module.exports.config = { api: { bodyParser: false } }
// ============================================================

const crypto = require('crypto');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, creem-signature',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  } catch { return null; }
}

function verifySignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

// 读取原始 request body（禁用 bodyParser 时需要）
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, creem-signature');

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.CREEM_WEBHOOK_SECRET;
  const signature = req.headers['creem-signature'];
  const rawBody = await readBody(req);

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[creem-webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try { payload = JSON.parse(rawBody); } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { eventType, object } = payload;
  if (!eventType || !object) return res.status(400).json({ error: 'Missing eventType or object' });

  const userId = object.request_id
    || object.metadata?.user_id
    || object.subscription?.metadata?.user_id
    || object.customer?.metadata?.user_id;

  const customerEmail = object.customer?.email;

  const sb = getSupabase();
  if (!sb) {
    console.error('[creem-webhook] Supabase not configured');
    return res.status(500).json({ error: 'Database not configured' });
  }

  let user;
  try {
    if (userId) {
      const { data } = await sb.auth.admin.getUserById(userId);
      user = data?.user;
    }
    if (!user && customerEmail) {
      const { data: { users } } = await sb.auth.admin.listUsers({ filter: `email eq '${customerEmail}'` });
      user = users?.[0];
    }
  } catch (err) {
    console.error('[creem-webhook] User lookup error:', err.message);
    return res.status(500).json({ error: 'Lookup error' });
  }

  if (!user) {
    console.warn(`[creem-webhook] User not found — userId=${userId}, email=${customerEmail}`);
    return res.status(200).json({ message: 'OK — user not found' });
  }

  let newTier = user.user_metadata?.app_tier || 'free';
  switch (eventType) {
    case 'checkout.completed':
    case 'subscription.active':
    case 'subscription.paid':
      newTier = 'pro';
      break;
    case 'subscription.expired':
    case 'subscription.canceled':
    case 'subscription.unpaid':
    case 'subscription.past_due':
      newTier = 'free';
      break;
  }

  try {
    await sb.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata || {}), app_tier: newTier },
    });
    console.log(`[creem-webhook] ${user.id} (${user.email}) tier → ${newTier} (${eventType})`);
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('[creem-webhook] Update error:', err.message);
    return res.status(500).json({ error: 'Update error' });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
module.exports._internals = { verifySignature };
