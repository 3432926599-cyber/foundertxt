// ============================================================
// FounderTxt — Vercel Function: POST /api/waffo-webhook
// 处理 Waffo 订阅事件 → 更新 Supabase Auth user_metadata.app_tier
// ============================================================

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = require('@supabase/supabase-js');
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  } catch { return null; }
}

module.exports = async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, data } = req.body || {};
  if (!type || !data) return res.status(400).json({ error: 'Missing type or data' });

  const userId = data.metadata?.user_id || data.customer_id || data.user_id;
  if (!userId) {
    console.warn('[waffo-webhook] No user_id in payload');
    return res.status(200).json({ message: 'OK — no user_id' });
  }

  const sb = getSupabase();
  if (!sb) {
    console.error('[waffo-webhook] Supabase not configured');
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const { data: { user } } = await sb.auth.admin.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let newTier = user.user_metadata?.app_tier || 'free';
    switch (type) {
      case 'subscription.active':
      case 'subscription.created':
      case 'subscription.updated':
        newTier = 'pro';
        break;
      case 'subscription.expired':
      case 'subscription.cancelled':
      case 'subscription.payment_failed':
        newTier = 'free';
        break;
    }

    await sb.auth.admin.updateUserById(userId, {
      user_metadata: { ...(user.user_metadata || {}), app_tier: newTier },
    });
    console.log(`[waffo-webhook] User ${userId} tier → ${newTier} (${type})`);
    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('[waffo-webhook] Error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
};
