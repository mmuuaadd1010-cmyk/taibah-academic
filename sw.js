/* TU Academic service worker — offline app shell */
var CACHE='tu-academic-v1';
var CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE).catch(function(){}); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ if(k!==CACHE){ return caches.delete(k); } }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'){ return; }
  var url;
  try{ url=new URL(req.url); }catch(_){ return; }
  if(url.origin!==self.location.origin){ return; }
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(r){
      try{ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put('./index.html',cp); }); }catch(_){}
      return r;
    }).catch(function(){
      return caches.match('./index.html').then(function(r){ return r||caches.match('./'); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function(c){
    return c || fetch(req).then(function(r){
      try{ if(r&&r.status===200){ var cp=r.clone(); caches.open(CACHE).then(function(ch){ ch.put(req,cp); }); } }catch(_){}
      return r;
    }).catch(function(){ return c; });
  }));
});
