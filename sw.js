/* Memoria de Cálculo APBB — funciona sin internet.
   Al publicar una versión nueva, cambie VERSION para que todos los teléfonos la reciban. */
const VERSION='2026.10.30-8';
const CACHE='calculo-apbb-'+VERSION;
const ARCHIVOS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('calculo-apbb-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  /* Lista de accesos retirados: siempre la más reciente si hay señal */
  if(u.pathname.endsWith('/revocados.json')){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r)));return}
  /* Resto: abre al instante desde el teléfono y, si hay señal, trae la versión nueva para la próxima vez */
  const key=r.mode==='navigate'?'index.html':r;
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(key,{ignoreSearch:true});
    const red=fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put(key,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(red);return hit}const res=await red;return res||new Response('Sin conexión',{status:503})}));
});
