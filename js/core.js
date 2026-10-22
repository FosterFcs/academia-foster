// Núcleo do app: utilitários de desenho, estado, navegação, carregamento das disciplinas e recursos de PWA.
const VERSAO_APP='1.7.3';
const $=id=>document.getElementById(id);
const br=(n,d=2)=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const R$=n=>'R$ '+br(n);
const dec=s=>(String(s).split('.')[1]||'').length;
// helpers SVG (cores via variáveis de tema)
const T=(x,y,t,c='ink',ex='')=>`<text x="${x}" y="${y}" style="fill:var(--${c})" ${ex}>${t}</text>`;
const Ln=(x1,y1,x2,y2,c='ink',w=1,ex='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--${c});stroke-width:${w}" ${ex}/>`;
const SVG=(w,h,label,body)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono,ui-monospace,monospace" font-size="11" role="img" aria-label="${label}">${body}</svg>`;
function diagram(xs,arr,L,x0,x1,y,h,label,flip){
  const max=Math.max(...arr.map(Math.abs))||1,sx=x=>x0+(x1-x0)*x/L,sy=v=>y-(flip?-1:1)*h*v/max;
  let pp=`M${sx(0)} ${y}`,pn=`M${sx(0)} ${y}`;
  xs.forEach((x,i)=>{pp+=` L${sx(x).toFixed(1)} ${sy(Math.max(arr[i],0)).toFixed(1)}`;pn+=` L${sx(x).toFixed(1)} ${sy(Math.min(arr[i],0)).toFixed(1)}`});
  pp+=` L${sx(L)} ${y}Z`;pn+=` L${sx(L)} ${y}Z`;
  return T(x0,y-h-14,label,'muted','font-size="10" letter-spacing="1"')+
    `<path d="${pp}" style="fill:var(--pos-fill);stroke:var(--pos);stroke-width:1.5"/><path d="${pn}" style="fill:var(--neg-fill);stroke:var(--neg);stroke-width:1.5"/>`+Ln(x0,y,x1,y,'ink',1);
}
const rng=(id,label,min,max,step,val,unit,hint='')=>`<div class="campo"><label for="${id}">${label} <output id="o_${id}"></output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit}">${hint?`<small>${hint}</small>`:''}</div>`;
const sel=(id,label,opts,hint='')=>`<div class="campo"><label for="${id}">${label}</label><select id="${id}">${opts.map(([v,t,s])=>`<option value="${v}"${s?' selected':''}>${t}</option>`).join('')}</select>${hint?`<small>${hint}</small>`:''}</div>`;
const tiles=arr=>`<div class="result">${arr.map(([l,v,d])=>`<div class="res${d?' destaque':''}"><span>${l}</span><b>${v}</b></div>`).join('')}</div>`;
const V_=id=>+$(id).value;
const T_=(t,x,y)=>T(x,y,t,'muted','font-size="10" letter-spacing="1"');
// Barras de aproveitamento (solicitação ÷ resistência) usadas nas verificações
function usoBarras(itens,x,y,w=260){let s='';itens.forEach(([nome,uso,txt],i)=>{const yy=y+i*58,p=Math.min(uso,1),c=uso>1?'neg':uso>0.85?'amber':'pos';
  s+=T(x,yy,nome,'ink','font-weight="600" font-size="11"')+`<rect x="${x}" y="${yy+8}" width="${w}" height="12" style="fill:var(--grid)"/><rect x="${x}" y="${yy+8}" width="${w*p}" height="12" style="fill:var(--${c})"/>`+T(x,yy+34,txt+' · '+br(100*uso,0)+'%'+(uso>1?' · NÃO ATENDE':''),uso>1?'neg':'muted','font-size="10"')});return s}
function outs(){document.querySelectorAll('.ctrl input[type=range]').forEach(i=>{const o=$('o_'+i.id);if(o)o.textContent=br(+i.value,dec(i.step))+' '+i.dataset.unit})}
const simWrap=(ctrl,extraCtrl='')=>`<div class="sim"><div class="ctrl">${ctrl}<div id="tiles"></div>${extraCtrl}</div><div class="draw" id="draw"></div></div><h3>Memorial de cálculo</h3><div class="memorial" id="memorial"></div>`;


const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const cssVar=k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim();
const rgbOf=(()=>{let cx;return c=>{try{if(!cx){const cv=document.createElement('canvas');cv.width=cv.height=1;cx=cv.getContext('2d',{willReadFrequently:true})}cx.clearRect(0,0,1,1);cx.fillStyle=c;cx.fillRect(0,0,1,1);return [...cx.getImageData(0,0,1,1).data]}catch(e){return[200,60,40,255]}}})();
function copiar(el,msg){const t=el.value!==undefined?el.value:el.textContent;
  const fb=()=>{try{if(el.select){el.focus();el.select()}else{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r)}}catch(e){}msg.textContent='Texto selecionado. Use Ctrl+C ou o menu Copiar.'};
  try{navigator.clipboard.writeText(t).then(()=>{msg.textContent='Copiado.'},fb)}catch(e){fb()}}

// Download de arquivo (funciona no app publicado; dentro do Claude o navegador bloqueia)
const podeBaixar=!window.EMBUTIDO;
function baixar(nome,texto,tipo='text/plain'){try{const b=new Blob([texto],{type:tipo+';charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);return true}catch(e){return false}}
// Carregamento das disciplinas sob demanda
const Academia={modulo(id,obj){const m=modById(id);if(!m)return;Object.assign(m,obj);m.carregado=true}};
const _scripts={};
function carregarScript(src){return _scripts[src]||(_scripts[src]=new Promise((ok,erro)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>{delete _scripts[src];s.remove();erro(new Error(src))};document.head.appendChild(s)}))}
async function garantir(m){if(m.carregado)return;for(const d of m.deps||[])await carregarScript(d);await carregarScript('js/modulos/'+m.id+'.js');if(!m.carregado)throw new Error(m.id)}
function renderCarregando(m){
  $('main').innerHTML=`<div class="mod-head"><span class="eyebrow">${m.eyebrow}</span><h2>${m.titulo}</h2></div><section class="painel"><p class="carregando" id="carregando">Carregando a disciplina…</p></section>`;
  garantir(m).then(()=>{if(st.mod===m.id)render()}).catch(()=>{const c=$('carregando');if(c&&st.mod===m.id){c.innerHTML='Não consegui baixar esta disciplina. Verifique a internet e tente de novo. <button class="btn sec" id="tentar">Tentar de novo</button>';$('tentar').onclick=()=>render()}});
}
// ================= ESTADO E RENDER =================
let st={mod:'inicio',tab:'teoria'},prog={},simulado=null;
function load(){try{prog=JSON.parse(localStorage.getItem('af-v2')||'{}')||{}}catch(e){prog={}}}
function save(){try{localStorage.setItem('af-v2',JSON.stringify(prog))}catch(e){}if(typeof Conta!=='undefined')Conta.marcar('progresso')}
const MODS=CATALOGO;MODS.forEach(m=>{m.carregado=false});
const modById=id=>MODS.find(m=>m.id===id);
function placarMod(m){const r=prog[m.id]||{},n=Object.keys(r).length,ok=m.quiz.filter((q,i)=>r[i]===q.c).length;return{n,ok,tot:m.quiz.length}}
function tagMod(m){const p=placarMod(m);return p.n===p.tot?`<span class="tag feito">✓ ${p.ok}/${p.tot}</span>`:p.n?`<span class="tag">${p.n}/${p.tot}</span>`:''}
function bindNav(root){root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{st.mod=b.dataset.m;st.tab='teoria';st.ex=0;st.calc=0;render();$('main').scrollIntoView({block:'start',behavior:'smooth'})})}
function trilha(){
  const mob=matchMedia('(max-width:820px)').matches;
  let h=`<button class="disc${st.mod==='inicio'?' ativo':''}" data-m="inicio"><span class="cod">00</span>Início</button>`;
  AREAS.forEach(([nome,ids])=>{const aberto=!mob||ids.includes(st.mod);
    h+=`<details class="grupo"${aberto?' open':''}><summary>${nome}<span>${ids.length}</span></summary>${ids.map(id=>{const m=modById(id);return `<button class="disc${st.mod===id?' ativo':''}" data-m="${id}"${st.mod===id?' aria-current="true"':''}><span class="cod">${m.cod}</span>${m.nome}${tagMod(m)}</button>`}).join('')}</details>`});
  h+=`<hr><button class="disc${st.mod==='sim'?' ativo':''}" data-m="sim"><span class="cod">SG</span>Simulado geral${simulado&&simulado.fim?`<span class="tag feito">${simulado.ok}/10</span>`:''}</button>`;
  $('trilha').innerHTML=h;bindNav($('trilha'));
  let ok=0,feitos=0;MODS.forEach(m=>{const p=placarMod(m);ok+=p.ok;if(p.n===p.tot)feitos++});
  $('stN').textContent=MODS.length;$('stMod').textContent=`${feitos} CONCLUÍDAS`;$('stQuiz').textContent=`${ok}/${MODS.reduce((t,m)=>t+m.quiz.length,0)} certas`;$('stSim').textContent=simulado&&simulado.fim?`${simulado.ok}/10`:'—';
}
function renderInicio(){
  $('main').innerHTML=`<div class="mod-head"><span class="eyebrow">Início · ${MODS.length} disciplinas em ${AREAS.length} áreas</span><h2>O que você quer aprender hoje?</h2></div>
  <section class="painel"><p>Cada disciplina tem teoria em linguagem simples, três exemplos resolvidos (do básico ao caso de obra), simulador com desenho e memorial de cálculo, a aba <b>Na obra</b> com erros comuns e checklist de fiscalização, um quiz de 15 questões e certificado de 4 horas para quem passar na prova. No fim, teste tudo no simulado geral.</p>
  <div class="areas">${AREAS.map(([n,ids])=>`<div class="area"><h3>${n}</h3>${ids.map(id=>{const m=modById(id);return `<button class="card-mod" data-m="${id}"><span class="cod">${m.cod}</span><b>${m.nome}</b>${tagMod(m)}<small>${m.titulo}</small></button>`}).join('')}</div>`).join('')}</div>
  <h3>Próximas disciplinas</h3><div class="presets">${PROX.map(p=>`<span class="chip off">${p}</span>`).join('')}</div>
  <div><button class="btn" data-m="sim">Fazer o simulado geral</button></div></section>`;
  bindNav($('main'));
}
function render(){
  trilha();
  if(st.mod==='conta'&&typeof Conta!=='undefined'&&Conta.ativo)return Conta.render();
  if(st.mod==='inicio')return renderInicio();
  if(st.mod==='sim')return renderSimulado();
  const m=modById(st.mod);
  if(!m){st.mod='inicio';return render()}
  if(!m.carregado)return renderCarregando(m);
  const tabs=[['teoria','Teoria'],['exemplo',m.exemplos&&m.exemplos.length?'Exemplos':'Exemplo'],['sim','Simulador']];if(m.sig)tabs.push(['sig','Bancada SIG']);if(m.obra)tabs.push(['obra','Na obra']);tabs.push(['quiz','Quiz']);if(typeof Cert!=='undefined')tabs.push(['cert','Certificado']);if(!tabs.some(t=>t[0]===st.tab))st.tab='teoria';
  $('main').innerHTML=`<div class="mod-head"><span class="eyebrow">${m.eyebrow}</span><h2>${m.titulo}</h2></div>
  <div class="tabs" role="tablist">${tabs.map(([k,t],i)=>`<button class="tab" role="tab" id="t-${k}" aria-selected="${st.tab===k}" aria-controls="painel" data-k="${k}"><span class="n">${i+1}</span>${t}</button>`).join('')}</div>
  <section class="painel" id="painel" role="tabpanel" aria-labelledby="t-${st.tab}"></section>`;
  $('main').querySelectorAll('.tab').forEach(b=>b.onclick=()=>{st.tab=b.dataset.k;if(st.tab==='cert'&&typeof Cert!=='undefined'&&!(Cert.provas[m.id]&&!Cert.provas[m.id].fim))delete Cert.sit[m.id];render()});
  const p=$('painel');
  if(st.tab==='teoria')p.innerHTML=m.teoria;
  else if(st.tab==='exemplo')renderExemplos(m,p);
  else if(st.tab==='obra')renderObra(m,p);
  else if(st.tab==='sim'){const lista=[m.sim,...(m.extras||[])],k=Math.min(st.calc||0,lista.length-1),s=lista[k];
    p.innerHTML=(lista.length>1?`<div class="calcs" role="tablist" aria-label="Calculadoras desta disciplina">${lista.map((c,i)=>`<button class="calc-op${i===k?' on':''}" data-calc="${i}" role="tab" aria-selected="${i===k}">${c.nome||'Principal'}</button>`).join('')}</div>`:'')+s.html();
    p.querySelectorAll('[data-calc]').forEach(b=>b.onclick=()=>{st.calc=+b.dataset.calc;render()});
    if(s.init)s.init();
    p.querySelectorAll('.ctrl input[type=range],.ctrl select').forEach(i=>i.addEventListener('input',()=>{outs();s.update()}));outs();s.update();}
  else if(st.tab==='sig'&&m.sig){p.innerHTML=m.sig.html();m.sig.init()}
  else if(st.tab==='cert'&&typeof Cert!=='undefined')Cert.render(m,p);
  else renderQuiz(m,p);
  const ir=$('irSim');if(ir)ir.onclick=()=>{st.tab='sim';render()};
}
function qBlock(q,i,resp,onPick,orig){
  const d=document.createElement('div');d.className='q';
  d.innerHTML=`${orig?`<span class="orig">${orig}</span>`:''}<p>${i+1}. ${q.p}</p><div class="ops"></div><div class="expl" hidden>${q.e}</div>`;
  const ops=d.querySelector('.ops');
  q.o.forEach((t,j)=>{const b=document.createElement('button');b.className='op';b.textContent=t;b.onclick=()=>onPick(j);ops.appendChild(b)});
  if(resp!==undefined){[...ops.children].forEach((b,j)=>{b.disabled=true;if(j===q.c)b.classList.add('certa');else if(j===resp)b.classList.add('errada')});d.querySelector('.expl').hidden=false}
  return d;
}
const NIVEL={facil:['Fácil','pos'],medio:['Médio','steel'],obra:['Caso de obra','amber-ink']};
function renderExemplos(m,p){
  const ex=[{nivel:'medio',titulo:null,html:m.exemplo},...(m.exemplos||[])];
  const idx=Math.min(st.ex||0,ex.length-1);
  p.innerHTML=(ex.length>1?`<div class="presets" role="tablist" aria-label="Exemplos">${ex.map((e,i)=>`<button class="chip${i===idx?' on':''}" data-ex="${i}" role="tab" aria-selected="${i===idx}">Exemplo ${i+1} · ${NIVEL[e.nivel][0]}</button>`).join('')}</div>`:'')+
    `<div class="lista">${ex[idx].titulo?`<h3>${ex[idx].titulo}</h3>`:''}${ex[idx].html}</div><div><button class="btn" id="irSim">Abrir o simulador</button></div>`;
  p.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{st.ex=+b.dataset.ex;render()});
}
function lerChecks(){try{return JSON.parse(localStorage.getItem('af-check')||'{}')||{}}catch(e){return{}}}
function renderObra(m,p){
  const o=m.obra,ch=lerChecks(),meu=ch[m.id]||{};
  p.innerHTML=`<p>${o.intro}</p><h3>Erros comuns</h3><div class="cols">${o.erros.map(([t,d])=>`<div class="conceito erro"><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>
  <h3>Checklist de fiscalização</h3><p class="nota">Marque conforme confere na obra. As marcações ficam salvas neste aparelho.</p>
  <div class="checklist">${o.checklist.map((t,i)=>`<label class="chk"><input type="checkbox" id="ck_${m.id}_${i}" data-i="${i}"${meu[i]?' checked':''}> ${t}</label>`).join('')}</div>
  <div class="presets"><button class="chip" id="ckLimpar">Desmarcar tudo</button><span class="nota" id="ckConta"></span></div>
  ${o.dica?`<div class="dica"><b>Dica de campo</b>${o.dica}</div>`:''}`;
  const conta=()=>{const n=p.querySelectorAll('.checklist input:checked').length;$('ckConta').textContent=`${n} de ${o.checklist.length} itens conferidos`};conta();
  const salvar=()=>{const c=lerChecks();c[m.id]={};p.querySelectorAll('.checklist input').forEach(i=>{if(i.checked)c[m.id][i.dataset.i]=1});try{localStorage.setItem('af-check',JSON.stringify(c))}catch(e){}conta()};
  p.querySelectorAll('.checklist input').forEach(i=>i.onchange=salvar);
  $('ckLimpar').onclick=()=>{p.querySelectorAll('.checklist input').forEach(i=>i.checked=false);salvar()};
}
function renderQuiz(m,p){
  const r=prog[m.id]||{};p.innerHTML='<div class="lista" id="ql"></div><div class="placar"><span id="placar"></span><button class="btn sec" id="refazer">Refazer quiz</button></div>';
  m.quiz.forEach((q,i)=>$('ql').appendChild(qBlock(q,i,r[i],j=>{prog[m.id]=prog[m.id]||{};prog[m.id][i]=j;save();render()})));
  const pl=placarMod(m);$('placar').textContent=pl.n<pl.tot?`${pl.n} de ${pl.tot} respondidas · ${pl.ok} certas`:`Resultado: ${pl.ok} de ${pl.tot} certas`;
  $('refazer').onclick=()=>{delete prog[m.id];save();render()};
}
function novoSimulado(){const todas=[];MODS.forEach(m=>m.quiz.forEach((q,i)=>todas.push({m,q,i})));
  for(let i=todas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[todas[i],todas[j]]=[todas[j],todas[i]]}
  simulado={qs:todas.slice(0,10),resp:{},fim:false,ok:0}}
function historicoSimulados(){try{return JSON.parse(localStorage.getItem('af-simulados')||'[]')||[]}catch(e){return[]}}
function registrarSimulado(){simulado.registrado=true;const h=historicoSimulados();h.push({em:new Date().toISOString(),ok:simulado.ok,tot:10});try{localStorage.setItem('af-simulados',JSON.stringify(h.slice(-30)))}catch(e){}if(typeof Conta!=='undefined')Conta.marcar('simulados')}
function renderSimulado(){
  if(!simulado)novoSimulado();
  $('main').innerHTML=`<div class="mod-head"><span class="eyebrow">SG-10 · Todas as disciplinas</span><h2>Simulado geral com 10 questões sorteadas</h2></div><section class="painel"><p>As questões vêm de todos os módulos. Responda tudo para ver sua nota final. Cada novo simulado sorteia outras perguntas.</p><div class="lista" id="sl"></div><div class="placar"><span id="splac"></span><button class="btn" id="novo">Novo simulado</button></div></section>`;
  simulado.qs.forEach((it,i)=>$('sl').appendChild(qBlock(it.q,i,simulado.resp[i],j=>{simulado.resp[i]=j;const n=Object.keys(simulado.resp).length;simulado.ok=simulado.qs.filter((x,k)=>simulado.resp[k]===x.q.c).length;simulado.fim=n===10;if(simulado.fim&&!simulado.registrado)registrarSimulado();render()},it.m.cod+' · '+it.m.nome)));
  const n=Object.keys(simulado.resp).length;$('splac').textContent=simulado.fim?`Nota final: ${simulado.ok} de 10 · ${simulado.ok>=7?'Aprovado':'Revise as disciplinas e tente de novo'}`:`${n} de 10 respondidas · ${simulado.ok} certas`;
  $('novo').onclick=()=>{novoSimulado();render()};
  const h=historicoSimulados().slice(-5).reverse();
  if(h.length){const d=document.createElement('div');d.className='lista';d.innerHTML='<h3>Seus últimos simulados</h3><div class="tbl-wrap"><table class="ed"><thead><tr><th>Data</th><th>Nota</th></tr></thead><tbody>'+h.map(x=>`<tr><td>${new Date(x.em).toLocaleDateString('pt-BR')} ${new Date(x.em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td><td class="num">${x.ok} de ${x.tot}</td></tr>`).join('')+'</tbody></table></div>';$('main').querySelector('.painel').appendChild(d)}
}

// Recursos de PWA: instalação, atualização e aviso de modo offline
function aviso(html,fixo){const a=$('aviso');if(!a||(aviso.fixo&&!fixo&&!a.hidden))return;aviso.fixo=!!fixo;a.innerHTML=html;a.hidden=false;clearTimeout(aviso._t);if(!fixo)aviso._t=setTimeout(()=>{a.hidden=true},5000)}
function iniciarPWA(){
  if(window.EMBUTIDO)return;
  let adiado=null;const bi=$('btInstalar');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();adiado=e;if(bi)bi.hidden=false});
  if(bi)bi.onclick=async()=>{if(!adiado)return;adiado.prompt();try{await adiado.userChoice}catch(e){}adiado=null;bi.hidden=true};
  window.addEventListener('appinstalled',()=>{if(bi)bi.hidden=true;aviso('App instalado. Ele agora abre direto da tela inicial, mesmo sem internet.')});
  window.addEventListener('offline',()=>aviso('Sem internet. Você continua usando a versão salva no aparelho.'));
  window.addEventListener('online',()=>aviso('Conexão de volta.'));
  if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
  let pediuAtualizar=false,recarregando=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!pediuAtualizar||recarregando)return;recarregando=true;location.reload()});
  navigator.serviceWorker.register('sw.js').then(reg=>{
    const oferecer=w=>{aviso('Nova versão da Academia disponível. <button class="btn" id="btAtualizar">Atualizar agora</button>',true);$('btAtualizar').onclick=()=>{pediuAtualizar=true;$('btAtualizar').disabled=true;w.postMessage('pular')}};
    if(reg.waiting&&navigator.serviceWorker.controller)oferecer(reg.waiting);
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)oferecer(w)})});
    setInterval(()=>reg.update().catch(()=>{}),60*60*1000);
  }).catch(()=>{});
}
function iniciar(){const vs=$('versao');if(vs)vs.textContent='Versão '+VERSAO_APP;load();render();if(typeof Conta!=='undefined')Conta.iniciar();iniciarPWA()}
