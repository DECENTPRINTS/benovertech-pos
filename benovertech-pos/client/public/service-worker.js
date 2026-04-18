/**
 * Service Worker for BENOVERTECH POS PWA
 * Handles caching, offline support, and background sync
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `benovertech-pos-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
];

// API routes that should be cached with network-first strategy
const API_ROUTES = [
  '/api/products',
  '/api/analytics',
  '/api/dashboard',
];

/**
 * Install Event
 * Cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets failed to cache:', err);
        // Continue even if some assets fail
        return cache.addAll(['/']);
      });
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

/**
 * Fetch Event
 * Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // HTML: Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // API calls: Network first, fallback to cache
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Static assets: Cache first, fallback to network
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Default: Network first
  event.respondWith(networkFirst(request, CACHE_NAME));
});

/**
 * Network First Strategy
 * Try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    
    if (cached) {
      console.log('Using cached response for:', request.url);
      return cached;
    }
    
    // Cache miss and network error
    return new Response(
      'Offline - Resource not available. Please check your connection.',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      }
    );
  }
}

/**
 * Cache First Strategy
 * Try cache, fall back to network
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Fetch failed for:', request.url, error);
    
    // Return offline page or default response
    return new Response(
      'Offline - Could not load resource',
      {
        status: 503,
        statusText: 'Service Unavailable',
      }
    );
  }
}

/**
 * Background Sync
 * Handle offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncPendingSales());
  }
});

/**
 * Sync Pending Sales
 * Upload sales made while offline
 */
async function syncPendingSales() {
  try {
    // Get pending sales from IndexedDB (not implemented yet, but prepared)
    console.log('Syncing pending sales...');
    // Implementation would fetch from IndexedDB and POST to backend
  } catch (error) {
    console.error('Sync failed:', error);
    throw error; // Retry sync
  }
}

/**
 * Push Notifications
 * Handle incoming push notifications
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('BENOVERTECH POS', options)
  );
});

/**
 * Notification Click
 * Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/**
 * Periodic Background Sync
 * Sync data periodically
 */
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event:', event.tag);
  
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

/**
 * Sync Analytics
 * Update analytics in background
 */
async function syncAnalytics() {
  try {
    console.log('Syncing analytics...');
    // Implementation would update analytics data
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

/**
 * Message Handler
 * Communicate with app clients
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Cache cleared');
    });
  }
});

console.log('Service Worker loaded');
