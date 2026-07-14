// ============================================================
// history.js — Handler tests
// Tests: OPTIONS, auth errors, method validation, error paths
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared mock references
const mockGetUser = vi.fn();

// Inject mock into require cache before any module requires it
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
const supabasePath = req.resolve('@supabase/supabase-js');

// eslint-disable-next-line no-global-assign
require.cache = require.cache || {};
require.cache[supabasePath] = {
  id: supabasePath,
  path: supabasePath,
  filename: supabasePath,
  loaded: true,
  exports: {
    createClient: vi.fn(() => ({
      auth: { getUser: mockGetUser },
    })),
  },
  children: [],
};

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

const history = require('../api/history.js');
const handler = history;

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
    // Vercel lowercases all header names
    const reqHeaders = {};
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) { reqHeaders[k.toLowerCase()] = v; }
    }
    handler({ method: event.httpMethod, headers: reqHeaders }, res);
  });
}

describe('history handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── OPTIONS ───────────────────────────────────────────────
  it('returns 204 for OPTIONS with CORS headers', async () => {
    const resp = await callHandler({ httpMethod: 'OPTIONS' });
    expect(resp.statusCode).toBe(204);
    expect(resp.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(resp.body).toBe('');
  });

  // ── Method Not Allowed ────────────────────────────────────
  it('returns 405 for POST', async () => {
    const resp = await callHandler({ httpMethod: 'POST' });
    expect(resp.statusCode).toBe(405);
  });

  it('returns 405 for PUT', async () => {
    const resp = await callHandler({ httpMethod: 'PUT' });
    expect(resp.statusCode).toBe(405);
  });

  // ── Missing Auth ──────────────────────────────────────────
  it('returns 401 when no Authorization header', async () => {
    const resp = await callHandler({ httpMethod: 'GET', headers: {} });
    expect(resp.statusCode).toBe(401);
    const body = JSON.parse(resp.body);
    expect(body.error).toContain('Authentication required');
  });

  it('returns 401 when Authorization header is empty', async () => {
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: '' } });
    expect(resp.statusCode).toBe(401);
  });

  it('returns 401 for invalid token (user is null)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer bad-token' } });
    expect(resp.statusCode).toBe(401);
  });

  it('returns 500 on database error', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('DB connection failed'));
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer tok' } });
    expect(resp.statusCode).toBe(500);
  });

  // ── Successful History ────────────────────────────────────
  it('returns empty history for new user', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', user_metadata: {} } } });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer tok' } });
    expect(resp.statusCode).toBe(200);
    expect(JSON.parse(resp.body).history).toEqual([]);
  });

  it('returns tweets from user_metadata', async () => {
    const tweets = [{ id: 1, pattern_id: 'metric-lesson', result: 'Test', created_at: new Date().toISOString() }];
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', user_metadata: { tweets } } } });
    const resp = await callHandler({ httpMethod: 'GET', headers: { authorization: 'Bearer tok' } });
    expect(resp.statusCode).toBe(200);
    expect(JSON.parse(resp.body).history).toEqual(tweets);
  });

  it('handles token without Bearer prefix (case-insensitive Authorization header)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1', user_metadata: {} } } });
    const resp = await callHandler({ httpMethod: 'GET', headers: { Authorization: 'raw-token' } });
    expect(resp.statusCode).toBe(200);
  });

  it('includes CORS headers on error responses', async () => {
    const resp = await callHandler({ httpMethod: 'GET', headers: {} });
    expect(resp.statusCode).toBe(401);
    expect(resp.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
