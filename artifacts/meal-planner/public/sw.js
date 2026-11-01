const CACHE_NAME = 'prato-a-prato-shell-v2';
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const base = new URL('./', self.registration.scope);
    await cache.addAll([
      base.href,
      new URL('manifest.webmanifest', base).href,
      new URL('icons/icon.svg', base).href,
      new URL('icons/icon-192.png', base).href,
      new URL('icons/icon-512.png', base).href,
      new URL('icons/apple-touch-icon.png', base).href,
    ]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (request.mode === 'navigate') return (await caches.match(new URL('./', self.registration.scope))) || Response.error();
      return Response.error();
    }
  })());
});
