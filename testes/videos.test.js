// Confere o cadastro das vídeo-aulas (VIDEOS e COMPLEMENTARES) em js/catalogo.js.
// Uso: node testes/videos.test.js
const fs=require('fs'),path=require('path');
global.self={};
eval(fs.readFileSync(path.join(__dirname,'..','js','catalogo.js'),'utf8')+';global.C=CATALOGO;global.V=VIDEOS;global.X=COMPLEMENTARES');
let falhas=0,n=0;const ok=(c,m)=>{n++;if(!c){falhas++;console.log('FALHOU:',m)}};
const ids=new Set(C.map(m=>m.id)),cod=/^[\w-]{11}$/,vistos={};
for(const [id,v] of Object.entries(V)){
  ok(ids.has(id),`VIDEOS: disciplina "${id}" não existe no catálogo`);
  const lista=Array.isArray(v)?v:[v];ok(lista.length>0,`VIDEOS.${id}: lista vazia`);
  lista.forEach((a,i)=>{const c=typeof a==='string'?a:a&&a.id;
    ok(cod.test(c||''),`VIDEOS.${id}[${i}]: código do YouTube inválido (${c}). Use só o trecho depois de youtu.be/`);
    if(c){ok(!vistos[c],`VIDEOS.${id}: vídeo ${c} já usado em ${vistos[c]}`);vistos[c]=id}
    if(typeof a==='object'){ok(!a.titulo||a.titulo.length<=40,`VIDEOS.${id}[${i}]: título longo demais para o botão`);
      ok(!/(\d{3,}|crea)/i.test(a.prof||''),`VIDEOS.${id}[${i}]: não coloque número de registro no nome do professor`)}});
}
for(const [id,lista] of Object.entries(X)){
  ok(ids.has(id),`COMPLEMENTARES: disciplina "${id}" não existe`);ok(Array.isArray(lista),`COMPLEMENTARES.${id}: precisa ser uma lista`);
  (lista||[]).forEach((c,i)=>{ok(cod.test(c.id||''),`COMPLEMENTARES.${id}[${i}]: código inválido`);
    ok(c.canal&&c.canal.trim().length>1,`COMPLEMENTARES.${id}[${i}]: falta o nome do canal (crédito obrigatório)`);
    ok(!vistos[c.id],`COMPLEMENTARES.${id}[${i}]: vídeo já é aula oficial em ${vistos[c.id]}`)});
}
console.log(falhas?`${falhas} de ${n} verificações falharam`:`videos: ${n} verificações ok (${Object.keys(V).length} disciplinas com vídeo-aula)`);
process.exit(falhas?1:0);
