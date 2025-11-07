/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;

// Aset App Shell yang akan di-pre-cache
const ASSETS = [
  './',
  './index.html',
//   './styles/styles.css', // (Benar, dikomen karena ini mode dev)
  './app.bundle.js',
  './favicon.png',
  './manifest.json',
  './images/icon-192x192.png',
  './images/icon-512x512.png',
  './images/icon-maskable.png',
  './images/screenshot-mobile.png',
  './images/screenshot-desktop.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching App Shell...');
        return cache.addAll(ASSETS); 
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version...');
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
        return null;
      }),
    ))
  );
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;
  
    if (requestUrl.startsWith('https://story-api.dicoding.dev/')) {
      
      if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
      }
  
      event.respondWith(
        caches.open(DYNAMIC_CACHE).then(async (cache) => {
          try {
            const networkResponse = await fetch(event.request);
            
            if (networkResponse.ok || networkResponse.type === 'opaque') {
                cache.put(event.request, networkResponse.clone());
              }
            
            return networkResponse;
  
          } catch (error) {
            console.log('[SW] Network fetch failed, trying cache...');
            
            const cacheResponse = await cache.match(event.request);
            if (cacheResponse) {
              console.log('[SW] Serving from DYNAMIC_CACHE');
              return cacheResponse;
            }
            
            console.warn('[SW] No response found in cache or network for API.');
            return new Response(JSON.stringify({ message: 'Offline: Tidak dapat mengambil data baru.' }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          }
        })
      );
      return;
    }
  
    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {
        return cacheResponse || fetch(event.request);
            })
        );
    });

self.addEventListener('push', (event) => {
  console.log('[SW] Push Notification diterima!');

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Push Notification (Basic)',
      body: 'Tidak ada payload data yang dikirim.',
    };
  }

  const title = data.title;
  const options = {
    body: data.body,
    icon: data.icon || './favicon.png', 
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked!');
  const relativeUrl = event.notification.data.url;
  const fullUrl = self.location.origin + '/' + relativeUrl;
  event.notification.close();

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((clientList) => {
    let focusedClient = null;
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        focusedClient = client;
        break;
      }
    }

    if (focusedClient) {
      focusedClient.focus();
      return focusedClient.navigate(fullUrl);
    }

    if (clients.openWindow) {
      return clients.openWindow(fullUrl);
    }
  });

  event.waitUntil(promiseChain);
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    console.log('[SW] skipWaiting() triggered manually');
    self.skipWaiting();
  }
});