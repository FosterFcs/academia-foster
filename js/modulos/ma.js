// MA-10 · Muros de Arrimo
Academia.modulo('ma',{
teoria:`<p>A terra atrás de um muro empurra o tempo todo. Esse empurrão se chama <b>empuxo</b>. O muro de gravidade resiste com o próprio peso: quanto mais pesado e largo na base, mais estável.</p>
<div class="cols"><div class="conceito"><h4>Empuxo ativo (Ea)</h4><p>A força da terra sobre o muro. Cresce com o quadrado da altura: um muro com o dobro da altura recebe quatro vezes mais empuxo.</p></div>
<div class="conceito"><h4>Ângulo de atrito (φ)</h4><p>Mede o quanto o solo se segura sozinho. Areias compactas têm φ alto; argilas moles, baixo.</p></div>
<div class="conceito"><h4>Tipos de muro</h4><p>Gravidade (concreto ciclópico, pedra, gabião), flexão (concreto armado em L) e solo grampeado.</p></div></div>
<h3>Fórmulas (Rankine, terrapleno horizontal)</h3>
<div class="formula">Ka = tg²(45° − φ/2)     Ea = ½ · Ka · γ · H²   aplicado a H/3 da base</div>
<h3>As três verificações</h3>
<div class="formula">Tombamento: FS = M resistente / M atuante ≥ 1,5 a 2,0</div>
<div class="formula">Deslizamento: FS = W · tg φ / Ea ≥ 1,5</div>
<div class="formula">Base: e = B/2 − (Mr − Mt)/W ≤ B/6   →  σmáx = (W/B)·(1 + 6e/B)</div>
<div class="dica"><b>O que mais derruba muro</b>Falta de drenagem. Água acumulada atrás do muro soma pressão hidrostática ao empuxo. Barbacãs, brita e manta geotêxtil são obrigatórios.</div>`,
exemplo:`<h3>Muro de concreto ciclópico com 3 m de altura</h3><p>Topo com 0,50 m, base com 1,80 m, face de trás vertical. Solo com γ = 18 kN/m³ e φ = 30°. Concreto ciclópico com 22 kN/m³. Cálculo por metro de muro.</p>
<ol class="passos"><li><b>Coeficiente.</b> Ka = tg²(45° − 15°) = tg²30° = <b>0,333</b>.</li>
<li><b>Empuxo.</b> Ea = 0,5 × 0,333 × 18 × 3² = <b>27,0 kN/m</b>, a 1,00 m da base.</li>
<li><b>Peso.</b> Triângulo: 1,30 × 3/2 × 22 = 42,9 kN. Retângulo: 0,50 × 3 × 22 = 33,0 kN. W = <b>75,9 kN/m</b>.</li>
<li><b>Tombamento.</b> Mr = 42,9 × 0,867 + 33,0 × 1,55 = 88,3 kN·m. Mt = 27 × 1,0 = 27,0. FS = <b>3,27</b> ✓</li>
<li><b>Deslizamento.</b> FS = 75,9 × tg30° / 27 = <b>1,62</b> ✓</li>
<li><b>Base.</b> e = 0,90 − (88,3 − 27,0)/75,9 = 0,09 m ≤ 0,30 ✓ → σmáx ≈ <b>55 kPa</b>.</li></ol>
<div class="dica"><b>Teste no simulador</b>Diminua a base para 1,20 m e veja qual verificação falha primeiro.</div>`,
sim:{html:()=>simWrap(rng('mH','Altura H',1,6,0.1,3,'m')+rng('mb','Largura do topo b',0.3,1.5,0.05,0.5,'m')+rng('mB','Largura da base B',0.5,4,0.05,1.8,'m')+rng('mF','Ângulo de atrito φ',20,40,1,30,'°')+rng('mG','Peso do solo γ',15,21,0.5,18,'kN/m³')+sel('mM','Material do muro',[[22,'Concreto ciclópico (22 kN/m³)',1],[24,'Concreto simples (24 kN/m³)'],[20,'Pedra argamassada (20 kN/m³)'],[17,'Gabião (17 kN/m³)']])),
update(){const H=V_('mH'),b=V_('mb'),r=calc.muro(H,b,V_('mB'),V_('mF'),V_('mG'),V_('mM')),B=r.B;
const pill=(c,t)=>`<span class="pill ${c?'ok':'alerta'}">${t}</span>`;
$('tiles').innerHTML=tiles([['Empuxo Ea',br(r.Ea)+' kN/m'],['Peso W',br(r.W)+' kN/m'],['FS tombamento',br(r.FSt),1],['FS deslizamento',br(r.FSd),1]])+`<div class="presets">${pill(r.FSt>=1.5,'Tombamento '+(r.FSt>=1.5?'OK':'falha'))}${pill(r.FSd>=1.5,'Deslizamento '+(r.FSd>=1.5?'OK':'falha'))}${pill(r.nucleo,r.nucleo?'Base comprimida':'Base com tração')}</div>`;
const sc=Math.min(260/H,220/B),gx=150,gy=40,Hs=H*sc,Bs=B*sc,bs=b*sc,base=gy+Hs;
let s=T(30,20,'CORTE · POR METRO DE MURO','muted','font-size="10" letter-spacing="1"');
const xBack=gx+Bs;s+=`<rect x="${xBack}" y="${gy}" width="${170}" height="${Hs}" style="fill:var(--soil-fill)"/>`;for(let k=0;k<6;k++)s+=Ln(xBack+20+k*26,gy+4,xBack+8+k*26,gy+16,'soil',1);
s+=`<polygon points="${gx},${base} ${xBack-bs},${gy} ${xBack},${gy} ${xBack},${base}" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:2"/>`;
s+=`<rect x="${gx-40}" y="${base}" width="${Bs+250}" height="14" style="fill:var(--soil-fill)"/>`;
const pk=Math.min(120,r.Ka*V_('mG')*H*8);s+=`<polygon points="${xBack},${gy} ${xBack},${base} ${xBack+pk},${base}" style="fill:var(--neg-fill);stroke:var(--neg)"/>`;
const ya=base-Hs/3;s+=Ln(xBack+pk+50,ya,xBack+6,ya,'neg',2.5)+`<path d="M${xBack+6} ${ya} l10 -6 v12z" style="fill:var(--neg)"/>`+T(xBack+pk+54,ya+4,'Ea = '+br(r.Ea,1),'neg','font-weight="600"');
const xc=gx+(r.W1*r.x1+r.W2*r.x2)/r.W*sc;s+=Ln(xc,gy+Hs*0.35,xc,gy+Hs*0.35+46,'ink',2.5)+`<path d="M${xc} ${gy+Hs*0.35+52} l-6 -10 h12z" style="fill:var(--ink)"/>`+T(xc+8,gy+Hs*0.35+20,'W = '+br(r.W,1),'ink','font-weight="600"');
const xR=gx+r.xr*sc;s+=`<circle cx="${xR}" cy="${base}" r="5" style="fill:var(--amber);stroke:var(--ink)"/>`+Ln(gx+Bs/3,base+20,gx+2*Bs/3,base+20,'pos',3)+T(gx+Bs/2,base+34,'terço central da base','pos','text-anchor="middle" font-size="10"');
s+=Ln(gx,base+44,xBack,base+44,'muted')+T(gx+Bs/2,base+58,'B = '+br(B)+' m','ink','text-anchor="middle"')+Ln(gx-24,gy,gx-24,base,'muted')+T(gx-30,gy+Hs/2,'H = '+br(H,1),'ink','text-anchor="end"');
$('draw').innerHTML=SVG(640,base+70,'Corte do muro de arrimo com empuxo e peso',s);
$('memorial').textContent=`1) Ka = tg²(45° − ${V_('mF')}°/2) = ${br(r.Ka,3)}
2) Ea = ½ × ${br(r.Ka,3)} × ${br(V_('mG'),1)} × ${br(H)}² = ${br(r.Ea)} kN/m  (a ${br(H/3)} m da base)
3) Peso: triângulo ${br(r.W1)} kN (braço ${br(r.x1,3)} m) + retângulo ${br(r.W2)} kN (braço ${br(r.x2,3)} m) = ${br(r.W)} kN/m
4) Tombamento: Mr = ${br(r.Mr)} kN·m · Mt = ${br(r.Mt)} kN·m → FS = ${br(r.FSt)} ${r.FSt>=1.5?'≥ 1,5 ✓':'< 1,5 ✗'}
5) Deslizamento: FS = ${br(r.W)} × tg${V_('mF')}° / ${br(r.Ea)} = ${br(r.FSd)} ${r.FSd>=1.5?'≥ 1,5 ✓':'< 1,5 ✗'}
6) Excentricidade: e = ${br(B/2)} − (${br(r.Mr)} − ${br(r.Mt)})/${br(r.W)} = ${br(r.e,3)} m ${r.nucleo?'≤':'>'} B/6 = ${br(B/6,3)} m
7) Tensões na base: σmáx = ${br(r.smax,1)} kPa · σmín = ${br(r.smin,1)} kPa${r.nucleo?'':'  (tração: aumente a base)'}
   Atrito na base adotado igual a tg φ (concreto moldado sobre o solo). Sem empuxo passivo e sem água.`;}}
});
