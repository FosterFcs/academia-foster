// Service worker da Academia Foster de Engenharia.
// IMPORTANTE: a cada publicação, aumente VERSAO. É isso que faz os aparelhos baixarem a versão nova.
const VERSAO='af-1.7.0';
importScripts('js/catalogo.js');
const ARQUIVOS=['./','index.html','css/app.css','js/calc.js','js/core.js','js/conta.js','js/certificado.js','validar.html','js/catalogo.js','js/sig.js','manifest.webmanifest',
  'icons/icone-192.png','icons/icone-512.png','icons/icone-mascara-512.png','icons/apple-touch-icon.png','icons/favicon-32.png']
  .concat(CATALOGO.map(m=>'js/modulos/'+m.id+'.js'));
const MAPAS='af-mapas',FONTES='af-fontes',LIMITE_MAPAS=400;

self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQUIVOS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('af-')&&![VERSAO,MAPAS,FONTES].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='pular')self.skipWaiting()});

async function aparar(c){const ks=await c.keys();for(let i=0;i<ks.length-LIMITE_MAPAS;i++)await c.delete(ks[i])}

self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    // Arquivos do app: primeiro do aparelho (funciona offline); se faltar, da rede.
    e.respondWith(caches.open(VERSAO).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});if(hit)return hit;
      try{const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}catch(x){return r.mode==='navigate'?(await c.match('index.html'))||Response.error():Response.error()}}));
    return;
  }
  if(u.hostname==='tile.openstreetmap.org'){
    // Mapa de fundo: mostra o que já está salvo e atualiza em segundo plano.
    e.respondWith(caches.open(MAPAS).then(async c=>{const hit=await c.match(r);
      const rede=fetch(r).then(res=>{if(res.ok){c.put(r,res.clone());aparar(c)}return res}).catch(()=>hit||Response.error());
      return hit||rede}));
    return;
  }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(FONTES).then(async c=>{const hit=await c.match(r);if(hit)return hit;
      try{const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}catch(x){return Response.error()}}));
  }
});
