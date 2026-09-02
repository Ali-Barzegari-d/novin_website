import { afterEach, expect, it, vi } from 'vitest';
import { api, post } from '../../apps/web/src/lib/http.js';
afterEach(() => vi.unstubAllGlobals());
it('returns an actionable network failure without deleting caller state', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  await expect(api('/test')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('اطلاعات این فرم حفظ شده') });
});
it('handles non-JSON upstream failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 502 })));
  await expect(api('/test')).rejects.toMatchObject({ status: 502 });
});
it('posts JSON and keeps private reads out of the cache', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}')); vi.stubGlobal('fetch', fetch);
  await expect(post('/test', { text: 'نمونه' })).resolves.toEqual({ ok: true });
  expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({ cache: 'no-store', method: 'POST', body: '{"text":"نمونه"}' }));
});
