const CACHE = "casino-night-v1-5";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=1.1.0",
  "./config.js?v=1.1.0",
  "./game.js?v=1.1.0",
  "./manifest.webmanifest",
  "./assets/value-red.png",
  "./assets/value-yellow.png",
  "./assets/value-blue-light.png",
  "./assets/value-blue-dark.png",
  "./assets/celebrating-baby.png",
  "./assets/crying-guy.png",
  "./assets/slot-reference.webp",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Network-first keeps GitHub Pages edits from appearing stale on the iPad,
  // while still falling back to the cached event app if Wi-Fi drops.
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
