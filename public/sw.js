const CACHE_NAME = 'water-reminder-v1';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Handle push notifications for background reminders
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Water Reminder';
  const options = {
    body: data.body || 'Time to drink water! 💧',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'water-reminder',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'drank', title: '💧 Drank!' },
      { action: 'snooze', title: '⏰ Snooze 10min' },
    ],
    data: { type: 'water-reminder' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  let urlToOpen = '/';

  if (action === 'drank') {
    urlToOpen = '/?action=log-water';
  } else if (action === 'snooze') {
    urlToOpen = '/?action=snooze';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    const delay = event.data.delay || 0;
    const message = event.data.message || 'Time to drink water!';
    setTimeout(() => {
      self.registration.showNotification('Water Reminder', {
        body: message,
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'water-reminder',
        renotify: true,
        requireInteraction: true,
      });
    }, delay);
  }
});