const CACHE='polyglot-shell-v2';
const pages=new Set(['/','/learn','/offline']);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...pages,'/preview/index.html','/preview/unit-01-fidel-foundations/index.html','/preview/unit-02-first-words/index.html'])))});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.search||request.headers.has('Authorization'))return;
 const eligible=pages.has(url.pathname)||url.pathname.startsWith('/preview/')||url.pathname.startsWith('/_next/static/');
 if(!eligible)return;
 event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)))}return response}).catch(async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(request);if(cached)return cached;if(request.mode==='navigate')return await cache.match('/offline')||Response.error();return Response.error()}));
});
