// HD-05 · Hidráulica
Academia.modulo('hd',{
teoria:`<p>Quando a água anda dentro do cano, ela esfrega nas paredes e perde energia. Essa perda se chama <b>perda de carga</b> e aparece como pressão a menos na torneira.</p>
<div class="cols"><div class="conceito"><h4>Vazão (Q)</h4><p>Quanto de água passa por segundo. Em instalações prediais, usamos L/s.</p></div>
<div class="conceito"><h4>Velocidade (v)</h4><p>Pela continuidade, Q = v·A. Cano fino com muita vazão vira água rápida, barulho e golpe de aríete.</p></div>
<div class="conceito"><h4>Rugosidade (C)</h4><p>Cano liso perde menos. PVC tem C ≈ 150; ferro galvanizado velho, bem menos.</p></div></div>
<h3>Equações</h3>
<div class="formula">Continuidade:  v = 4·Q / (π·D²)</div>
<div class="formula">Hazen-Williams:  J = 10,643 · Q^1,85 / (C^1,85 · D^4,87)    (J em m/m, Q em m³/s, D em m)</div>
<div class="formula">Perda total no trecho:  hf = J · L</div>
<div class="dica"><b>Limite da norma</b>A NBR 5626 limita a velocidade em 3 m/s nas tubulações de água fria. Acima disso, aumente o diâmetro.</div>`,
exemplo:`<h3>Ramal de 30 m em PVC de 25 mm</h3><p>Um trecho de 30 m de PVC (C = 150) com diâmetro interno de 25 mm leva 0,5 L/s para um banheiro.</p>
<ol class="passos"><li><b>Velocidade.</b> v = 4 × 0,0005 / (π × 0,025²) = <b>1,02 m/s</b> ≤ 3 m/s ✓</li>
<li><b>Perda unitária.</b> J = 10,643 × 0,0005<sup>1,85</sup> / (150<sup>1,85</sup> × 0,025<sup>4,87</sup>) ≈ <b>0,050 m/m</b>.</li>
<li><b>Perda no trecho.</b> hf = 0,050 × 30 ≈ <b>1,49 m</b> de coluna d'água.</li>
<li><b>Leitura.</b> Se a caixa d'água fica 3 m acima da saída, sobram cerca de 1,5 m de pressão, perto do mínimo de 1 m que a norma pede nos pontos de uso. Por isso o último chuveiro costuma ser o mais fraco.</li></ol>
<div class="dica"><b>Confira no simulador</b>Q = 0,5 L/s, D = 25 mm, L = 30 m, PVC.</div>`,
sim:{html:()=>simWrap(rng('hQ','Vazão Q',0.1,5,0.1,0.5,'L/s')+sel('hD','Diâmetro interno',[[20,'20 mm'],[25,'25 mm',1],[32,'32 mm'],[40,'40 mm'],[50,'50 mm'],[60,'60 mm'],[75,'75 mm'],[100,'100 mm']])+rng('hL','Comprimento L',5,200,5,30,'m')+sel('hC','Material',[[150,'PVC (C = 150)',1],[130,'Cobre (C = 130)'],[125,'Ferro galvanizado novo (C = 125)'],[100,'Ferro fundido usado (C = 100)']])+rng('hZ','Desnível disponível',1,30,0.5,3,'m','Altura da caixa d’água acima do ponto')),
update(){const Q=V_('hQ'),D=V_('hD'),L=V_('hL'),C=V_('hC'),Z=V_('hZ'),r=calc.hazen(Q,D,L,C),sobra=Z-r.hf;
$('tiles').innerHTML=tiles([['Velocidade',br(r.v)+' m/s'],['J',br(r.J,4)+' m/m'],['Perda hf',br(r.hf)+' m',1],['Pressão final',br(sobra)+' m.c.a.']])+(r.v<=3?'<span class="pill ok">v ≤ 3 m/s</span>':'<span class="pill alerta">v &gt; 3 m/s · aumente o diâmetro</span>')+' '+(sobra>=1?'<span class="pill ok">Pressão ≥ 1 m.c.a.</span>':'<span class="pill alerta">Pressão insuficiente no ponto</span>');
const top=50,base=230,sz=(base-top)/Math.max(Z,r.hf,1),wl=base-Z*sz,end=wl+Math.min(r.hf,Z+5)*sz;
let s=T(30,20,'LINHA DE CARGA','muted','font-size="10" letter-spacing="1"');
s+=`<rect x="40" y="${wl-10}" width="90" height="${base-wl+20}" style="fill:var(--water-fill);stroke:var(--ink);stroke-width:2"/>`+Ln(40,wl,130,wl,'water',2);
s+=`<rect x="130" y="${base-6}" width="440" height="12" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:1.5"/>`+`<circle cx="575" cy="${base}" r="5" style="fill:var(--water)"/>`;
s+=Ln(130,wl,570,Math.min(end,base+40),r.hf>Z?'neg':'water',2,'stroke-dasharray="8 4"')+Ln(130,wl,570,wl,'muted',1,'stroke-dasharray="2 4"');
s+=Ln(590,wl,590,Math.min(end,base+40),'amber',2)+T(596,(wl+Math.min(end,base+40))/2+4,'hf','amber-ink','font-weight="600"');
s+=T(350,base+30,`L = ${L} m · D = ${D} mm · Q = ${br(Q,1)} L/s`,'muted','text-anchor="middle"')+T(85,wl-16,`Z = ${br(Z,1)} m`,'water','text-anchor="middle"');
s+=T(350,wl-8,'nível da caixa','muted','text-anchor="middle" font-size="10"');
$('draw').innerHTML=SVG(640,290,'Linha de carga ao longo da tubulação',s);
$('memorial').textContent=`1) Q = ${br(Q,1)} L/s = ${br(Q/1000,4)} m³/s · D = ${D} mm = ${br(D/1000,3)} m
2) v = 4·Q/(π·D²) = ${br(r.v,3)} m/s ${r.v<=3?'≤ 3 m/s ✓':'> 3 m/s ✗'}
3) J = 10,643 × Q^1,85 / (C^1,85 × D^4,87) = ${br(r.J,5)} m/m   (C = ${C})
4) hf = J × L = ${br(r.J,5)} × ${L} = ${br(r.hf,3)} m
5) Pressão no ponto = Z − hf = ${br(Z,2)} − ${br(r.hf,3)} = ${br(sobra,3)} m.c.a. ${sobra>=1?'≥ 1,0 ✓':'< 1,0 ✗'}
   (perdas localizadas em conexões não incluídas)`;}}
});
