// ============================================================
// FounderTxt — Vercel Function: POST/GET /api/generate
// 服务端限流 + 输入校验 + JWT 认证 + Tier 检查 + 用量追踪
// 数据存储于 Supabase Auth user_metadata（无需数据库表）
// ============================================================

// ── Supabase Admin ──────────────────────────────────────────
let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.warn('[generate] SUPABASE not configured — auth disabled'); return null; }
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  } catch (e) { console.warn('[generate] @supabase/supabase-js not installed'); return null; }
  return supabase;
}

// ── Pattern Tier Map ────────────────────────────────────────
const PATTERN_TIERS = {
  'metric-lesson': 'free', 'dead-feature': 'free',
  'wrong-assumption': 'free', 'copy-checklist': 'free',
};
function getPatternTier(id) { return PATTERN_TIERS[id] || 'pro'; }

// ── Global System Prompt ────────────────────────────────────
const GLOBAL_SYSTEM_PROMPT = `You are an indie hacker building a SaaS product. Your tweets must follow these rules:

VOICE RULES:
- Write like a real person who codes, not a marketer
- Short sentences. No corporate jargon.
- Specific numbers > adjectives ("47% lower" not "much faster")
- Be honest about failures and uncertain about wins

FORMAT RULES:
- No emoji spam (max 1 emoji per tweet)
- No "thread 🧵" or "a thread 👇"
- No hashtag lists
- No ALL CAPS unless genuinely excited
- Max 280 chars

WHAT TO AVOID:
- "I'm excited to announce..."
- "We're thrilled to share..."
- "Just shipped! 🚀" (without context)
- "Can't believe this happened 🤯"
- Any sentence that could be in a press release`;

// ── IP Rate Limiter ─────────────────────────────────────────
const rateMap = new Map();
const WINDOW_MS = 60_000, MAX_PER_WINDOW = 10;

function getIP(req) {
  return req.headers['x-forwarded-for'] || req.headers['client-ip'] || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  let e = rateMap.get(ip);
  if (!e || now > e.resetAt) { e = { count: 0, resetAt: now + WINDOW_MS }; rateMap.set(ip, e); }
  e.count++;
  if (Math.random() < 0.002) { for (const [k, v] of rateMap) { if (now > v.resetAt) rateMap.delete(k); } }
  return { allowed: e.count <= MAX_PER_WINDOW, remaining: Math.max(0, MAX_PER_WINDOW - e.count) };
}

// ── Input Validation ────────────────────────────────────────
function validateInput(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body' };
  const { patternId, answers } = body;
  if (!patternId || typeof patternId !== 'string') return { ok: false, error: 'Missing patternId' };
  if (patternId.length > 64) return { ok: false, error: 'Invalid patternId' };
  if (!answers || typeof answers !== 'object') return { ok: false, error: 'Missing answers' };
  const hasContent = Object.values(answers).some(v => typeof v === 'string' && v.trim().length > 0);
  if (!hasContent) return { ok: false, error: 'Please fill in at least one blank' };
  const sanitized = {};
  for (const [k, v] of Object.entries(answers)) {
    if (typeof k !== 'string' || k.length > 64) continue;
    if (typeof v !== 'string') continue;
    sanitized[k] = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, 500);
  }
  return { ok: true, sanitized };
}

// ── User helpers (via user_metadata) ────────────────────────
function getMetaTier(user) { return user?.user_metadata?.app_tier || 'free'; }

function getTodayUsageCount(user) {
  const u = user?.user_metadata?.usage;
  if (!u || u.date !== new Date().toISOString().slice(0, 10)) return 0;
  return u.count || 0;
}

async function updateMeta(sb, userId, meta) {
  try { await sb.auth.admin.updateUserById(userId, { user_metadata: meta }); } catch (e) { console.error('[generate] updateMeta failed:', e.message); }
}

// ── DeepSeek ────────────────────────────────────────────────
async function callDeepSeek(systemPrompt, userInput, apiKey, tier) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 15000);
  const modelParams = tier === 'pro'
    ? { max_tokens: 350, temperature: 0.85 }
    : { max_tokens: 280, temperature: 0.70 };
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userInput }],
        ...modelParams,
      }),
      signal: ac.signal,
    });
    if (!res.ok) { const err = await res.text(); throw new Error(`DeepSeek ${res.status}: ${err}`); }
    const data = await res.json();
    return data.choices[0].message.content.trim();
  } finally { clearTimeout(timer); }
}

// ── CORS helper ─────────────────────────────────────────────
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ── Handler ─────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');

  // ── GET /api/generate → 返回用户 tier + usage ──────────────
  if (req.method === 'GET') {
    const sb = getSupabase();
    if (!sb) return res.status(500).json({ error: 'Auth not configured' });
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      const { data: { user } } = await sb.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Invalid token' });
      const tier = getMetaTier(user);
      const used = tier === 'free' ? getTodayUsageCount(user) : null;
      return res.status(200).json({ tier, usage: used !== null ? { used, limit: 3 } : null });
    } catch { return res.status(401).json({ error: 'Invalid token' }); }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. 限流
  const ip = getIP(req);
  const rr = checkRateLimit(ip);
  if (!rr.allowed) return res.status(429).json({ error: 'Too many requests.', retryAfter: 60 });

  // 2. 解析 & 校验（Vercel 已自动解析 JSON body）
  const v = validateInput(req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const { patternId, patternName, systemPrompt } = req.body;
  const answers = v.sanitized;

  // 3. 认证
  const sb = getSupabase();
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let user = null;
  if (sb && token) {
    try { const r = await sb.auth.getUser(token); user = r.data.user; } catch { /* invalid token */ }
  }

  // 4. Tier 检查
  let tier = user ? getMetaTier(user) : 'free';
  const patternTier = getPatternTier(patternId);
  if (patternTier === 'pro' && tier !== 'pro') {
    return res.status(403).json({ error: user ? 'This pattern requires Pro. Upgrade to access all 14 patterns.' : 'Sign in to access Pro patterns.', tier });
  }

  // 5. 用量检查
  if (tier === 'free') {
    const used = user ? getTodayUsageCount(user) : 0;
    if (used >= 3) return res.status(429).json({ error: 'Free tier limit (3/day). Upgrade to Pro for unlimited.', tier, remaining: 0 });
  }

  // 6. AI 调用
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error.' });

  const effectivePrompt = (systemPrompt || `${GLOBAL_SYSTEM_PROMPT}\n\nGenerate ONE tweet (max 280 chars).`).slice(0, 2000);
  const userLines = Object.entries(answers).map(([k, v]) => `${k}: ${v}`);
  const userPrompt = `Generate ONE tweet using these inputs:\n${userLines.join('\n')}`;

  let result;
  try {
    result = await callDeepSeek(effectivePrompt, userPrompt, apiKey, tier);
  } catch (err) {
    console.error('[generate] DeepSeek failed:', err.message);
    return res.status(502).json({ error: 'AI generation failed. Please try again.' });
  }

  // 7. 更新 user_metadata（非关键 — tweet 已生成，写入失败不影响返回）
  let newCount = tier === 'free' ? getTodayUsageCount(user) + 1 : 0;
  if (user) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const newTweet = { id: Date.now(), pattern_id: patternId, result, created_at: new Date().toISOString() };
      const tweets = [newTweet, ...(user.user_metadata?.tweets || [])].slice(0, 50);
      const meta = { ...(user.user_metadata || {}), app_tier: tier, tweets };
      if (tier === 'free') { meta.usage = { date: today, count: newCount }; }
      await updateMeta(sb, user.id, meta);
    } catch (err) {
      console.error('[generate] Metadata write failed:', err.message);
    }
  }

  const remaining = tier === 'free' ? Math.max(0, 3 - newCount) : null;
  return res.status(200).json({ result, pattern: patternId || 'unknown', tier, remaining });
};

// ── Test exports ────────────────────────────────────────────
module.exports._internals = { checkRateLimit, validateInput, getPatternTier, getMetaTier, getTodayUsageCount, getIP };
