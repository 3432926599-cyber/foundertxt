// ============================================================
// generate.js — Internal function + Handler integration tests
// Tests: validateInput, checkRateLimit, tier/usage helpers,
//        handler GET/POST with mocked Supabase + DeepSeek
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Shared mock references
const mockGetUser = vi.fn();
const mockAdminUpdateUserById = vi.fn().mockResolvedValue({});

// Inject mock into require cache (same pattern as history/webhook tests)
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
const supabasePath = req.resolve('@supabase/supabase-js');
req.cache[supabasePath] = {
  id: supabasePath, path: supabasePath, filename: supabasePath, loaded: true,
  exports: {
    createClient: vi.fn(() => ({
      auth: {
        getUser: mockGetUser,
        admin: { updateUserById: mockAdminUpdateUserById },
      },
    })),
  },
  children: [],
};

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.DEEPSEEK_API_KEY = 'sk-test';

const generate = require('../api/generate.js');
const { checkRateLimit, validateInput, getPatternTier, getMetaTier, getTodayUsageCount, getIP } = generate._internals;
const handler = generate;

// ── 兼容包装：Netlify 测试格式 → Vercel handler ─────────────
function callHandler(event) {
  return new Promise((resolve) => {
    const headers = {};
    const res = {
      setHeader(n, v) { headers[n] = v; return this; },
      status(c) { this._status = c; return this; },
      json(d) { resolve({ statusCode: this._status, headers, body: JSON.stringify(d) }); },
      send(d) { resolve({ statusCode: this._status, headers, body: d || '' }); },
    };
    // Vercel auto-parses JSON body — simulate that
    let body = event.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    // Vercel lowercases all header names
    const reqHeaders = {};
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) { reqHeaders[k.toLowerCase()] = v; }
    }
    handler({ method: event.httpMethod, headers: reqHeaders, body }, res);
  });
}

// ============================================================
// getIP
// ============================================================
describe('getIP', () => {
  it('reads x-forwarded-for header', () => {
    expect(getIP({ headers: { 'x-forwarded-for': '1.2.3.4' } })).toBe('1.2.3.4');
  });
  it('falls back to client-ip', () => {
    expect(getIP({ headers: { 'client-ip': '5.6.7.8' } })).toBe('5.6.7.8');
  });
  it('falls back to "unknown" when no headers', () => {
    expect(getIP({ headers: {} })).toBe('unknown');
  });
});

// ============================================================
// checkRateLimit
// ============================================================
describe('checkRateLimit', () => {
  it('allows first request with 9 remaining', () => {
    const r = checkRateLimit('10.0.0.1');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9);
  });

  it('allows up to 10 requests per window', () => {
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit('10.0.0.2').allowed).toBe(true);
    }
  });

  it('blocks the 11th request', () => {
    for (let i = 0; i < 10; i++) checkRateLimit('10.0.0.3');
    const r = checkRateLimit('10.0.0.3');
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it('tracks different IPs independently', () => {
    expect(checkRateLimit('10.0.0.4').allowed).toBe(true);
    expect(checkRateLimit('10.0.0.5').allowed).toBe(true);
  });
});

// ============================================================
// validateInput
// ============================================================
describe('validateInput', () => {
  it('rejects null / non-object body', () => {
    expect(validateInput(null).ok).toBe(false);
    expect(validateInput('string').ok).toBe(false);
  });

  it('rejects missing patternId', () => {
    expect(validateInput({ answers: { a: 'hello' } }).ok).toBe(false);
  });

  it('rejects patternId > 64 chars', () => {
    expect(validateInput({ patternId: 'x'.repeat(65), answers: { a: 'hi' } }).ok).toBe(false);
  });

  it('rejects missing answers', () => {
    expect(validateInput({ patternId: 'metric-lesson' }).ok).toBe(false);
  });

  it('rejects empty/whitespace-only answers', () => {
    expect(validateInput({ patternId: 'metric-lesson', answers: { a: '  ' } }).ok).toBe(false);
  });

  it('accepts valid input and sanitizes', () => {
    const r = validateInput({
      patternId: 'metric-lesson',
      answers: { metric: '70% signups from Reddit', lesson: 'Reply to threads' },
    });
    expect(r.ok).toBe(true);
    expect(r.sanitized.metric).toBe('70% signups from Reddit');
  });

  it('truncates answer values to 500 chars', () => {
    const long = 'x'.repeat(600);
    const r = validateInput({ patternId: 'metric-lesson', answers: { metric: long } });
    expect(r.ok).toBe(true);
    expect(r.sanitized.metric.length).toBe(500);
  });

  it('strips control characters', () => {
    const r = validateInput({
      patternId: 'metric-lesson', answers: { metric: 'hello\x00world\x1F!' },
    });
    expect(r.ok).toBe(true);
    expect(r.sanitized.metric).toBe('helloworld!');
  });

  it('skips non-string values and long keys', () => {
    const r = validateInput({
      patternId: 'metric-lesson',
      answers: { metric: 'valid', extra: 123, ['x'.repeat(65)]: 'skip' },
    });
    expect(r.ok).toBe(true);
    expect(r.sanitized.metric).toBe('valid');
    expect(r.sanitized.extra).toBeUndefined();
  });
});

// ============================================================
// getPatternTier
// ============================================================
describe('getPatternTier', () => {
  it('returns "free" for known free patterns', () => {
    expect(getPatternTier('metric-lesson')).toBe('free');
    expect(getPatternTier('dead-feature')).toBe('free');
    expect(getPatternTier('wrong-assumption')).toBe('free');
    expect(getPatternTier('copy-checklist')).toBe('free');
  });

  it('returns "pro" for unknown patterns', () => {
    expect(getPatternTier('cost-breakdown')).toBe('pro');
    expect(getPatternTier('unknown-pattern')).toBe('pro');
  });
});

// ============================================================
// getMetaTier
// ============================================================
describe('getMetaTier', () => {
  it('returns "free" for users without tier', () => {
    expect(getMetaTier(null)).toBe('free');
    expect(getMetaTier({ user_metadata: {} })).toBe('free');
  });

  it('returns the configured tier from user_metadata', () => {
    expect(getMetaTier({ user_metadata: { app_tier: 'pro' } })).toBe('pro');
    expect(getMetaTier({ user_metadata: { app_tier: 'free' } })).toBe('free');
  });
});

// ============================================================
// getTodayUsageCount
// ============================================================
describe('getTodayUsageCount', () => {
  const today = new Date().toISOString().slice(0, 10);

  it('returns 0 for null / empty metadata', () => {
    expect(getTodayUsageCount(null)).toBe(0);
    expect(getTodayUsageCount({ user_metadata: {} })).toBe(0);
  });

  it('returns 0 when usage date is not today', () => {
    expect(getTodayUsageCount({
      user_metadata: { usage: { date: '2020-01-01', count: 5 } },
    })).toBe(0);
  });

  it('returns count when usage date is today', () => {
    expect(getTodayUsageCount({
      user_metadata: { usage: { date: today, count: 2 } },
    })).toBe(2);
  });
});

// ============================================================
// handler: OPTIONS, method validation, error paths
// ============================================================
describe('handler — basic routing', () => {
  it('returns 204 for OPTIONS with CORS headers', async () => {
    const resp = await callHandler({ httpMethod: 'OPTIONS' });
    expect(resp.statusCode).toBe(204);
    expect(resp.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('returns 405 for unsupported methods', async () => {
    const resp = await callHandler({ httpMethod: 'PUT' });
    expect(resp.statusCode).toBe(405);
  });

  it('returns 400 for invalid JSON body', async () => {
    const resp = await callHandler({ httpMethod: 'POST', body: 'not json', headers: {} });
    expect(resp.statusCode).toBe(400);
    expect(JSON.parse(resp.body).error).toContain('Invalid request body');
  });

  it('returns 400 for missing patternId', async () => {
    const resp = await callHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ answers: { a: 'hello' } }),
      headers: {},
    });
    expect(resp.statusCode).toBe(400);
  });
});

// ============================================================
// handler: rate limiting
// ============================================================
describe('handler — rate limiting', () => {
  it('blocks after 10 POSTs from same IP', async () => {
    const baseEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({ patternId: 'metric-lesson', answers: { metric: 'test' } }),
      headers: { 'x-forwarded-for': '10.0.0.98' },
    };
    for (let i = 0; i < 10; i++) await callHandler({ ...baseEvent });
    const resp = await callHandler({ ...baseEvent });
    expect(resp.statusCode).toBe(429);
    expect(JSON.parse(resp.body).error).toContain('Too many requests');
  });
});

// ============================================================
// handler: GET /api/generate — returns tier + usage
// ============================================================
describe('handler — GET (tier + usage info)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without auth token', async () => {
    const resp = await callHandler({ httpMethod: 'GET', headers: {} });
    expect(resp.statusCode).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer bad' } });
    expect(resp.statusCode).toBe(401);
  });

  it('returns free tier info for free user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'free' } } },
    });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer tok' } });
    expect(resp.statusCode).toBe(200);
    const body = JSON.parse(resp.body);
    expect(body.tier).toBe('free');
    expect(body.usage).toEqual({ used: 0, limit: 3 });
  });

  it('returns pro tier info for pro user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'pro' } } },
    });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer tok' } });
    expect(resp.statusCode).toBe(200);
    const body = JSON.parse(resp.body);
    expect(body.tier).toBe('pro');
    expect(body.usage).toBeNull();
  });
});

// ============================================================
// handler: POST — auth + tier enforcement (no DeepSeek call)
// ============================================================
describe('handler — POST auth + tier', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 for pro pattern by free user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'free' } } },
    });
    const resp = await callHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ patternId: 'cost-breakdown', answers: { total: '100' } }),
      headers: { authorization: 'Bearer tok', 'x-forwarded-for': '10.1.1.1' },
    });
    expect(resp.statusCode).toBe(403);
    expect(JSON.parse(resp.body).error).toContain('Pro');
  });

  it('allows free pattern by free user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'u1',
          user_metadata: { app_tier: 'free', usage: { date: new Date().toISOString().slice(0, 10), count: 0 } },
        },
      },
    });
    const resp = await callHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ patternId: 'metric-lesson', patternName: 'Test', answers: { metric: 'test' } }),
      headers: { authorization: 'Bearer tok', 'x-forwarded-for': '10.2.2.2' },
    });
    // This tries to call DeepSeek which will fail (no real API key)
    // but it should get past the tier check
    expect(resp.statusCode).toBe(502); // DeepSeek fails
    expect(JSON.parse(resp.body).error).toContain('AI generation failed');
  });

  it('allows pro pattern by pro user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'u1',
          user_metadata: { app_tier: 'pro', tweets: [] },
        },
      },
    });
    const resp = await callHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ patternId: 'cost-breakdown', patternName: 'Test', answers: { total: '100' } }),
      headers: { authorization: 'Bearer tok', 'x-forwarded-for': '10.3.3.3' },
    });
    // Gets past tier check, DeepSeek fails
    expect(resp.statusCode).toBe(502);
  });

  it('blocks free user with 3/3 usage', async () => {
    const today = new Date().toISOString().slice(0, 10);
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'u1',
          user_metadata: { app_tier: 'free', usage: { date: today, count: 3 } },
        },
      },
    });
    const resp = await callHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ patternId: 'metric-lesson', patternName: 'Test', answers: { metric: 'test' } }),
      headers: { authorization: 'Bearer tok', 'x-forwarded-for': '10.4.4.4' },
    });
    expect(resp.statusCode).toBe(429);
    expect(JSON.parse(resp.body).error).toContain('Free tier limit');
  });
});
