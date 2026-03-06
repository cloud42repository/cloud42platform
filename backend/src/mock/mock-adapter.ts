import type { AxiosInstance } from 'axios';

// axios-mock-adapter is a CJS module; use require() for compatibility.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockAdapter = require('axios-mock-adapter');

// ─── ID helpers ──────────────────────────────────────────────────────────────

let _seq = 1;
const nextId = () => `mock-${String(_seq++).padStart(4, '0')}`;

// ─── Resource name extraction ─────────────────────────────────────────────────

/**
 * Derive a human-readable resource name from the URL path segment.
 * e.g. "/crm/v6/Leads/123"  →  "Lead"
 *      "/books/v3/contacts" →  "Contact"
 */
function resourceFromUrl(url: string): string {
  const segments = url.split('/').filter(Boolean);
  // Walk backwards and find the first non-ID segment (no digits, dashes only)
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (!/^\d+$/.test(seg) && !seg.startsWith('mock-')) {
      // Capitalize and singularize naively (strip trailing 's')
      const name = seg.charAt(0).toUpperCase() + seg.slice(1);
      return name.endsWith('ses') ? name.slice(0, -2) // analyses → analysi — skip
        : name.endsWith('ies') ? name.slice(0, -3) + 'y'  // categories → category
        : name.endsWith('es')  ? name.slice(0, -2)         // addresses → address
        : name.endsWith('s')   ? name.slice(0, -1)         // contacts → contact
        : name;
    }
  }
  return 'Record';
}

// ─── Response builders ────────────────────────────────────────────────────────

function buildRecord(resourceName: string, id?: string): Record<string, unknown> {
  const recordId = id ?? nextId();
  return {
    id: recordId,
    name: `${resourceName} ${recordId}`,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    status: 'active',
    // Zoho-style owner stub
    owner: { id: 'mock-owner-001', name: 'Mock User', email: 'mock@example.com' },
  };
}

/** GET /resource or /resource/:id */
function buildGetResponse(url: string): unknown {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  const lastSeg = segments[segments.length - 1] ?? '';
  const name = resourceFromUrl(url);

  // If the last segment looks like an ID, return single-item wrapper
  const isSingle = /^\d+$/.test(lastSeg) || lastSeg.startsWith('mock-');

  if (isSingle) {
    return { data: [buildRecord(name, lastSeg)] };
  }

  return {
    data: [buildRecord(name), buildRecord(name)],
    info: { count: 2, more_records: false, page: 1, per_page: 20 },
  };
}

/** POST / PUT / PATCH → Zoho-style success envelope */
function buildMutationResponse(action: 'added' | 'updated'): unknown {
  return {
    data: [
      {
        code: 'SUCCESS',
        status: 'success',
        message: `record ${action}`,
        details: { id: nextId(), created_time: new Date().toISOString() },
      },
    ],
  };
}

/** DELETE → Zoho-style success envelope */
function buildDeleteResponse(url: string): unknown {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  const id = segments[segments.length - 1] ?? nextId();
  return {
    data: [
      {
        code: 'SUCCESS',
        status: 'success',
        message: 'record deleted',
        details: { id },
      },
    ],
  };
}

// ─── Adapter factory ──────────────────────────────────────────────────────────

/**
 * Attaches a MockAdapter to the given Axios instance.
 * All requests are intercepted and answered with realistic stub data.
 *
 * Activated when `MOCK_MODE=true` in the environment.
 */
export function attachMockAdapter(instance: AxiosInstance): void {
  const mock = new MockAdapter(instance, {
    delayResponse: 80, // simulate slight latency
    onNoMatch: 'throwException',
  }) as {
    onAny(url?: RegExp): { reply: (fn: (cfg: { url?: string; method?: string }) => [number, unknown]) => void };
  };

  mock.onAny().reply((config: { url?: string; method?: string }) => {
    const method = (config.method ?? 'get').toLowerCase();
    const url = config.url ?? '/';

    switch (method) {
      case 'get':
        return [200, buildGetResponse(url)];
      case 'post':
        return [201, buildMutationResponse('added')];
      case 'put':
        return [200, buildMutationResponse('updated')];
      case 'patch':
        return [200, buildMutationResponse('updated')];
      case 'delete':
        return [200, buildDeleteResponse(url)];
      default:
        return [200, { message: 'ok' }];
    }
  });

  console.log('[MOCK_MODE] Axios mock adapter attached — all HTTP calls are stubbed.');
}
