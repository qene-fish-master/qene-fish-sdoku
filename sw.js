const C='qingyu-sudoku-v3',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='qingyu-cfg').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// 網路優先、離線時用快取,確保更新後能拿到新版
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{
  if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}
  return r;
 }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
async function remind(){
 const c=await caches.open('qingyu-cfg'),r=await c.match('cfg');if(!r)return;
 const cfg=await r.json();if(!cfg.on)return;
 const d=new Date(),k=d.toLocaleDateString('sv');
 if(cfg.last===k||cfg.done===k||d.getHours()*60+d.getMinutes()<cfg.min)return;
 await self.registration.showNotification('青魚數獨 🐟',{body:'今天的每日挑戰在等你,來玩一局吧!',icon:'icon-192.png',badge:'icon-192.png',tag:'daily'});
 cfg.last=k;await c.put('cfg',new Response(JSON.stringify(cfg)));
}
self.addEventListener('periodicsync',e=>{if(e.tag==='daily')e.waitUntil(remind())});
self.addEventListener('message',e=>{
 if(e.data&&e.data.cfg)e.waitUntil(caches.open('qingyu-cfg').then(c=>c.put('cfg',new Response(JSON.stringify(e.data.cfg)))));
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./')));
});
