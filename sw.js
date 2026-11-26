/* network-first: ออนไลน์ได้ของใหม่เสมอ ออฟไลน์ใช้ของที่เคยเปิด */
const V = "th-d71e7739";
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(["/", "/style.css?v=d71e7739", "/config.js?v=d71e7739", "/calc.js?v=d71e7739", "/tools.js?v=d71e7739", "/app.js?v=d71e7739"])).catch(() => {})); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(V).then((ch) => ch.put(r, c)); } return res; }).catch(() => caches.match(r).then((m) => m || caches.match("/"))));
});
