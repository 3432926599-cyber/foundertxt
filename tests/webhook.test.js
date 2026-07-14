// ============================================================
// Webhook functions — waffo-webhook + creem-webhook
// Tests: signature verification, event type → tier mapping
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Shared mock references
const mockGetUserById = vi.fn();
const mockUpdateUserById = vi.fn().mockResolvedValue({});
const mockListUsers = vi.fn();

// Install a mock for @supabase/supabase-js into the Node.js require cache
// before any of our modules try to require it
const mockSupabaseModule = {
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        getUserById: mockGetUserById,
        updateUserById: mockUpdateUserById,
        listUsers: mockListUsers,
      },
    },
  })),
};

// Resolve the real module path and replace it
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
const supabasePath = req.resolve('@supabase/supabase-js');
req.cache[supabasePath] = {
  id: supabasePath,
  path: supabasePath,
  filename: supabasePath,
  loaded: true,
  exports: mockSupabaseModule,
  children: [],
};

process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.CREEM_WEBHOOK_SECRET = 'creem-secret';

// ============================================================
// Creem webhook — verifySignature (CJS module)
// ============================================================
const creem = require('../api/creem-webhook.js');
const creemHandler = creem;
const { verifySignature } = creem._internals;

// ── 兼容包装：Creem handler 需要 stream mock（readBody） ─────
function callCreemHandler(event) {
  return new Promise((resolve) => {
    const headers = {};
    const res = {
      setHeader(n, v) { headers[n] = v; return this; },
      status(c) { this._status = c; return this; },
      json(d) { resolve({ statusCode: this._status, headers, body: JSON.stringify(d) }); },
      send(d) { resolve({ statusCode: this._status, headers, body: d || '' }); },
    };
    const body = event.body || '';
    const req = new (require('events').EventEmitter)();
    req.method = event.httpMethod;
    // Vercel lowercases all header names
    const reqHeaders = {};
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) { reqHeaders[k.toLowerCase()] = v; }
    }
    req.headers = reqHeaders;
    creemHandler(req, res);
    // Simulate stream: emit data then end asynchronously
    setImmediate(() => { req.emit('data', body); req.emit('end'); });
  });
}

describe('creem — verifySignature', () => {
  it('returns true for valid signature', () => {
    const payload = '{"eventType":"checkout.completed"}';
    const sig = crypto.createHmac('sha256', 'creem-secret').update(payload).digest('hex');
    expect(verifySignature(payload, sig, 'creem-secret')).toBe(true);
  });

  it('returns false for wrong secret', () => {
    const payload = '{"eventType":"checkout.completed"}';
    const sig = crypto.createHmac('sha256', 'wrong-secret').update(payload).digest('hex');
    expect(verifySignature(payload, sig, 'creem-secret')).toBe(false);
  });

  it('returns false when secret is missing', () => {
    expect(verifySignature('payload', 'sig', null)).toBe(false);
  });

  it('returns false when signature is missing', () => {
    expect(verifySignature('payload', '', 'secret')).toBe(false);
  });

  it('returns false for tampered payload', () => {
    const original = '{"eventType":"checkout.completed"}';
    const sig = crypto.createHmac('sha256', 'creem-secret').update(original).digest('hex');
    expect(verifySignature('{"eventType":"subscription.canceled"}', sig, 'creem-secret')).toBe(false);
  });
});

// ============================================================
// Creem webhook handler — error paths
// ============================================================
describe('creem handler — error paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 for OPTIONS', async () => {
    const resp = await callCreemHandler({ httpMethod: 'OPTIONS' });
    expect(resp.statusCode).toBe(204);
  });

  it('returns 405 for GET', async () => {
    const resp = await callCreemHandler({ httpMethod: 'GET' });
    expect(resp.statusCode).toBe(405);
  });

  it('returns 401 for missing signature', async () => {
    const resp = await callCreemHandler({
      httpMethod: 'POST', body: '{}', headers: {},
    });
    expect(resp.statusCode).toBe(401);
  });

  it('returns 400 for invalid JSON with valid signature', async () => {
    const payload = 'not-json';
    const sig = crypto.createHmac('sha256', 'creem-secret').update(payload).digest('hex');
    const resp = await callCreemHandler({
      httpMethod: 'POST', body: payload, headers: { 'creem-signature': sig },
    });
    expect(resp.statusCode).toBe(400);
  });

  it('returns 400 when missing eventType', async () => {
    const payload = JSON.stringify({ object: { request_id: 'u1' } });
    const sig = crypto.createHmac('sha256', 'creem-secret').update(payload).digest('hex');
    const resp = await callCreemHandler({
      httpMethod: 'POST', body: payload, headers: { 'creem-signature': sig },
    });
    expect(resp.statusCode).toBe(400);
  });
});

// ============================================================
// Creem webhook handler — tier updates (with mock Supabase)
// ============================================================
describe('creem handler — tier updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function signedEvent(payload) {
    const body = JSON.stringify(payload);
    const sig = crypto.createHmac('sha256', 'creem-secret').update(body).digest('hex');
    return { httpMethod: 'POST', body, headers: { 'creem-signature': sig } };
  }

  it('upgrades user to pro on checkout.completed', async () => {
    mockGetUserById.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com', user_metadata: {} } },
    });
    const resp = await callCreemHandler(signedEvent({
      eventType: 'checkout.completed', object: { request_id: 'u1' },
    }));
    expect(resp.statusCode).toBe(200);
    expect(mockUpdateUserById).toHaveBeenCalledWith('u1', {
      user_metadata: { app_tier: 'pro' },
    });
  });

  it('downgrades user to free on subscription.expired', async () => {
    mockGetUserById.mockResolvedValueOnce({
      data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { app_tier: 'pro' } } },
    });
    const resp = await callCreemHandler(signedEvent({
      eventType: 'subscription.expired', object: { request_id: 'u1' },
    }));
    expect(resp.statusCode).toBe(200);
    expect(mockUpdateUserById).toHaveBeenCalledWith('u1', {
      user_metadata: { app_tier: 'free' },
    });
  });
});

// ============================================================
// Waffo webhook handler
// ============================================================
const waffo = require('../api/waffo-webhook.js');
const waffoHandler = waffo;

// ── 兼容包装：Waffo handler ─────────────────────────────────
function callWaffoHandler(event) {
  return new Promise((resolve) => {
    const headers = {};
    const res = {
      setHeader(n, v) { headers[n] = v; return this; },
      status(c) { this._status = c; return this; },
      json(d) { resolve({ statusCode: this._status, headers, body: JSON.stringify(d) }); },
      send(d) { resolve({ statusCode: this._status, headers, body: d || '' }); },
    };
    let body = event.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    // Vercel lowercases all header names
    const reqHeaders = {};
    if (event.headers) {
      for (const [k, v] of Object.entries(event.headers)) { reqHeaders[k.toLowerCase()] = v; }
    }
    waffoHandler({ method: event.httpMethod, headers: reqHeaders, body }, res);
  });
}

describe('waffo handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 for OPTIONS', async () => {
    const resp = await callWaffoHandler({ httpMethod: 'OPTIONS' });
    expect(resp.statusCode).toBe(204);
  });

  it('returns 405 for GET', async () => {
    const resp = await callWaffoHandler({ httpMethod: 'GET' });
    expect(resp.statusCode).toBe(405);
  });

  it('returns 400 for invalid JSON', async () => {
    const resp = await callWaffoHandler({ httpMethod: 'POST', body: 'not-json' });
    expect(resp.statusCode).toBe(400);
  });

  it('returns 400 when missing type', async () => {
    const resp = await callWaffoHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ data: { metadata: { user_id: 'u1' } } }),
    });
    expect(resp.statusCode).toBe(400);
  });

  it('returns 200 with no user_id when missing from payload', async () => {
    const resp = await callWaffoHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ type: 'subscription.active', data: {} }),
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toContain('no user_id');
  });

  it('upgrades user to pro on subscription.active', async () => {
    mockGetUserById.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'free' } } },
    });
    const resp = await callWaffoHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ type: 'subscription.active', data: { metadata: { user_id: 'u1' } } }),
    });
    expect(resp.statusCode).toBe(200);
    expect(mockUpdateUserById).toHaveBeenCalledWith('u1', {
      user_metadata: { app_tier: 'pro' },
    });
  });

  it('downgrades user to free on subscription.cancelled', async () => {
    mockGetUserById.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'pro' } } },
    });
    const resp = await callWaffoHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ type: 'subscription.cancelled', data: { metadata: { user_id: 'u1' } } }),
    });
    expect(resp.statusCode).toBe(200);
    expect(mockUpdateUserById).toHaveBeenCalledWith('u1', {
      user_metadata: { app_tier: 'free' },
    });
  });

  it('preserves existing user_metadata keys on tier update', async () => {
    mockGetUserById.mockResolvedValueOnce({
      data: { user: { id: 'u1', user_metadata: { app_tier: 'free', tweets: [{ id: 1 }] } } },
    });
    const resp = await callWaffoHandler({
      httpMethod: 'POST',
      body: JSON.stringify({ type: 'subscription.active', data: { metadata: { user_id: 'u1' } } }),
    });
    expect(resp.statusCode).toBe(200);
    expect(mockUpdateUserById).toHaveBeenCalledWith('u1', {
      user_metadata: { app_tier: 'pro', tweets: [{ id: 1 }] },
    });
  });
});
