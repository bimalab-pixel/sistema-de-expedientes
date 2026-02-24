const CACHE_NAME = 'siss-cache-v2'; // Cambiamos a V2 para forzar actualización
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación: Forzamos el guardado de lo más básico
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SISS: Intentando cachear archivos críticos...');
      // Usamos map para intentar guardar uno por uno y que un error no detenga todo
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.log(`No se pudo cachear: ${url}`, err));
        })
      );
    })
  );
  self.skipWaiting();
});

// Activación: Borramos cualquier caché vieja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Estrategia: "Network First, Falling back to Cache" 
// (Intenta red, si falla, usa lo guardado)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // Si es una navegación (entrar a la página), devolver el index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
