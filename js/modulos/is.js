// IS-02 · Isostática
Academia.modulo('is',{
teoria:`<p>Toda estrutura precisa estar presa ao chão de algum jeito. O tipo de apoio define quais movimentos ficam impedidos, e cada movimento impedido gera uma reação.</p>
<div class="cols"><div class="conceito"><h4>Apoio móvel (1º gênero)</h4><p>Rolete. Impede só o movimento vertical: 1 reação.</p></div>
<div class="conceito"><h4>Apoio fixo (2º gênero)</h4><p>Articulação. Impede vertical e horizontal, mas deixa girar: 2 reações.</p></div>
<div class="conceito"><h4>Engaste (3º gênero)</h4><p>Peça chumbada. Impede tudo, inclusive girar: 2 forças e 1 momento.</p></div></div>
<h3>Isostática, hipostática ou hiperestática?</h3>
<p>No plano temos 3 equações de equilíbrio. Se a estrutura tem exatamente as reações necessárias (3, bem distribuídas), ela é <b>isostática</b> e resolvemos só com estática. Menos que isso, ela se move (<b>hipostática</b>). Mais que isso, sobra apoio (<b>hiperestática</b>) e precisamos de outros métodos.</p>
<h3>Viga em balanço (engastada)</h3>
<div class="formula">Reação vertical: R = q·L + P     Momento no engaste: M = q·L²/2 + P·L</div>
<div class="dica"><b>Atenção na obra</b>No balanço o momento é negativo: a parte de cima é tracionada. A armadura principal vai em cima. Marquises que desabam quase sempre têm aço mal posicionado ou corroído.</div>`,
exemplo:`<h3>Marquise de 1,50 m</h3><p>Uma marquise engastada na viga da fachada tem 1,50 m de balanço, carga distribuída de 6 kN/m (laje, impermeabilização e sobrecarga) e uma platibanda na ponta que pesa 2 kN.</p>
<ol class="passos"><li><b>Reação vertical.</b> R = 6 × 1,5 + 2 = <b>11 kN</b>.</li>
<li><b>Momento da carga distribuída.</b> q·L²/2 = 6 × 2,25 / 2 = 6,75 kN·m.</li>
<li><b>Momento da carga na ponta.</b> P·L = 2 × 1,5 = 3,00 kN·m.</li>
<li><b>Momento no engaste.</b> M = 6,75 + 3,00 = <b>9,75 kN·m</b> (negativo: tração em cima).</li>
<li><b>Leitura.</b> O momento é máximo junto à parede e zero na ponta. É justamente junto à parede que a armadura superior precisa estar bem ancorada.</li></ol>
<div class="dica"><b>Confira no simulador</b>L = 1,5 m, q = 6 kN/m, P = 2 kN.</div>`,
sim:{html:()=>simWrap(rng('bL','Balanço L',0.5,5,0.1,1.5,'m')+rng('bQ','Carga distribuída q',0,20,0.5,6,'kN/m')+rng('bP','Carga na ponta P',0,50,1,2,'kN','Platibanda, guarda-corpo')),
update(){const L=V_('bL'),q=V_('bQ'),P=V_('bP'),r=calc.balanco(L,q,P);
$('tiles').innerHTML=tiles([['Reação R',br(r.R)+' kN'],['Cortante no engaste',br(r.R)+' kN'],['Momento no engaste',br(-r.M0)+' kN·m',1],['Md (×1,4)',br(-1.4*r.M0)+' kN·m']]);
const x0=80,x1=590,sx=x=>x0+(x1-x0)*x/L,by=120;
let s=T(30,18,'ESQUEMA ESTÁTICO','muted','font-size="10" letter-spacing="1"');
s+=`<rect x="${x0-24}" y="${by-50}" width="24" height="100" style="fill:var(--line)"/>`;for(let i=0;i<8;i++)s+=Ln(x0-24,by-46+i*12,x0-4,by-56+i*12,'muted',1);
if(q>0){const n=10;for(let i=0;i<=n;i++){const x=sx(L*i/n);s+=Ln(x,70,x,by-8,'steel',1.2)+`<path d="M${x-3} ${by-12} L${x} ${by-6} L${x+3} ${by-12}" style="fill:var(--steel)"/>`}s+=Ln(x0,70,x1,70,'steel',1.5)+T(335,62,`q = ${br(q,1)} kN/m`,'steel','text-anchor="middle"')}
if(P>0){s+=Ln(x1,34,x1,by-6,'amber',3)+`<path d="M${x1-7} ${by-16} L${x1} ${by-4} L${x1+7} ${by-16}Z" style="fill:var(--amber)"/>`+T(x1-8,42,`P = ${P} kN`,'amber-ink','text-anchor="end" font-weight="600"')}
s+=`<rect x="${x0}" y="${by-4}" width="${x1-x0}" height="10" style="fill:var(--ink)"/>`+T(x0,by+30,'Engaste','muted','text-anchor="middle"')+Ln(x0,by+44,x1,by+44,'line')+T(335,by+58,`L = ${br(L)} m`,'muted','text-anchor="middle"');
s+=diagram(r.xs,r.V,L,x0,x1,320,60,'ESFORÇO CORTANTE V (kN)')+T(x0-6,264,br(r.R,1),'pos','text-anchor="end"');
s+=diagram(r.xs,r.M,L,x0,x1,470,70,'MOMENTO FLETOR M (kN·m) — tração em cima',true)+T(x0-6,404,br(-r.M0,1),'neg','text-anchor="end" font-weight="600"');
$('draw').innerHTML=SVG(640,500,'Viga em balanço com diagramas',s);
$('memorial').textContent=`1) ΣFy = 0  → R = q·L + P = ${br(q)}×${br(L)} + ${br(P)} = ${br(r.R)} kN
2) ΣM no engaste = 0
   M = q·L²/2 + P·L = ${br(q)}×${br(L*L)}/2 + ${br(P)}×${br(L)}
   M = ${br(q*L*L/2)} + ${br(P*L)} = ${br(r.M0)} kN·m  (negativo: tração em cima)
3) Valor de cálculo Md = 1,4 × ${br(r.M0)} = ${br(1.4*r.M0)} kN·m`;}}
});
