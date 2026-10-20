// AP-11 · Águas Pluviais
Academia.modulo('ap',{
teoria:`<p>Toda a chuva que cai no telhado precisa sair por algum lugar. A calha recolhe a água e o condutor vertical leva até o chão. Se a calha for pequena, transborda e a água entra pela parede.</p>
<div class="cols"><div class="conceito"><h4>Intensidade (I)</h4><p>Quantos milímetros de chuva caem por hora numa chuva forte. Depende da cidade e do período de retorno (5 anos para telhados).</p></div>
<div class="conceito"><h4>Área de contribuição</h4><p>A área do telhado que escoa para aquela calha. Em telhado inclinado, a altura da água também conta.</p></div>
<div class="conceito"><h4>Rugosidade (n)</h4><p>Coeficiente de Manning. PVC e metal: 0,011. Concreto alisado: 0,012. Alvenaria sem revestimento: 0,015.</p></div></div>
<h3>Fórmulas da NBR 10844</h3>
<div class="formula">Área de contribuição (telhado inclinado): A = (a + h/2) · b</div>
<div class="formula">Vazão de projeto: Q = I · A / 60     (Q em L/min, I em mm/h, A em m²)</div>
<div class="formula">Capacidade da calha (Manning): Q = 60.000 · (S/n) · Rh^(2/3) · i^(1/2)</div>
<div class="formula">Rh = S / P  (área molhada ÷ perímetro molhado)     declividade mínima da calha: 0,5%</div>
<div class="dica"><b>Condutor vertical</b>A norma exige diâmetro interno mínimo de 70 mm (na prática, tubo de 75 mm). O simulador usa uma regra prática de pré-dimensionamento; o dimensionamento final usa os ábacos da NBR 10844.</div>`,
exemplo:`<h3>Telhado de uma água com 10 m de comprimento</h3><p>Projeção horizontal de 5 m, altura de 1 m, chuva de 150 mm/h. Calha de PVC com 15 cm de largura e lâmina d'água de 5 cm, declividade 0,5%.</p>
<ol class="passos"><li><b>Área.</b> A = (5 + 1/2) × 10 = <b>55 m²</b>.</li>
<li><b>Vazão de projeto.</b> Q = 150 × 55 / 60 = <b>137,5 L/min</b>.</li>
<li><b>Geometria da calha.</b> S = 0,15 × 0,05 = 0,0075 m². P = 0,15 + 2 × 0,05 = 0,25 m. Rh = 0,030 m.</li>
<li><b>Capacidade.</b> Q = 60.000 × (0,0075/0,011) × 0,030<sup>2/3</sup> × 0,005<sup>1/2</sup> ≈ <b>279 L/min</b>.</li>
<li><b>Verificação.</b> 279 ≥ 137,5 ✓ A calha trabalha com cerca de metade da capacidade.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
sim:{html:()=>simWrap(rng('pa','Projeção horizontal a',2,15,0.5,5,'m')+rng('ph','Altura do telhado h',0,4,0.1,1,'m')+rng('pb','Comprimento b',3,30,0.5,10,'m')+rng('pI','Intensidade de chuva I',100,250,5,150,'mm/h','Consulte a tabela da NBR 10844 para sua cidade')+rng('pw','Largura da calha',8,40,1,15,'cm')+rng('py','Lâmina d’água',3,20,0.5,5,'cm','Use no máximo metade da altura da calha')+rng('pi','Declividade da calha',0.5,2,0.1,0.5,'%')+sel('pn','Material da calha',[[0.011,'PVC, chapa metálica (n = 0,011)',1],[0.012,'Concreto alisado (n = 0,012)'],[0.013,'Concreto não alisado (n = 0,013)'],[0.015,'Alvenaria sem revestimento (n = 0,015)']])),
update(){const r=calc.pluvial(V_('pa'),V_('ph'),V_('pb'),V_('pI'),V_('pw'),V_('py'),V_('pi'),V_('pn')),uso=r.Q/r.Qc;
$('tiles').innerHTML=tiles([['Área',br(r.A)+' m²'],['Vazão de projeto',br(r.Q)+' L/min',1],['Capacidade da calha',br(r.Qc)+' L/min',1],['Condutor sugerido','Ø '+r.cond+' mm']])+(r.ok?`<span class="pill ok">Calha OK · ${br(uso*100,0)}% da capacidade</span>`:'<span class="pill alerta">Calha transborda · aumente largura, lâmina ou declividade</span>');
const a=V_('pa'),h=V_('ph');let s=T(30,20,'TELHADO EM CORTE','muted','font-size="10" letter-spacing="1"');
const tw=260,th=Math.max(10,110*h/Math.max(a,1)),tx=40,ty=170;s+=`<polygon points="${tx},${ty} ${tx+tw},${ty} ${tx},${ty-th}" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/>`;
for(let k=0;k<5;k++)s+=Ln(tx+30+k*50,ty-th*(1-(30+k*50)/tw)-30,tx+22+k*50,ty-th*(1-(30+k*50)/tw)-14,'water',1.5);
s+=`<rect x="${tx+tw}" y="${ty-4}" width="22" height="18" style="fill:none;stroke:var(--ink);stroke-width:2"/>`+Ln(tx+tw+11,ty+14,tx+tw+11,250,'ink',6)+T(tx+tw+20,248,'Ø '+r.cond,'ink');
s+=T(tx+tw/2+30,ty+20,'a = '+br(a,1)+' m','muted','text-anchor="middle"')+T(tx,ty+20,'h = '+br(h,1)+' m','muted');
const cw=160,sc=cw/V_('pw'),ch=Math.max(V_('py')*2,V_('pw')*0.6)*sc,cx=400,cy=60,fill=Math.min(1.25,uso)*V_('py')*sc;
s+=T(cx,20,'SEÇÃO DA CALHA','muted','font-size="10" letter-spacing="1"');
s+=`<rect x="${cx}" y="${cy+ch-Math.min(fill,ch)}" width="${cw}" height="${Math.min(fill,ch)}" style="fill:var(--water-fill)"/>`;
s+=`<path d="M${cx} ${cy} V${cy+ch} H${cx+cw} V${cy}" style="fill:none;stroke:var(--ink);stroke-width:3"/>`+Ln(cx,cy+ch-V_('py')*sc,cx+cw,cy+ch-V_('py')*sc,'water',1.5,'stroke-dasharray="5 4"');
s+=T(cx+cw+6,cy+ch-V_('py')*sc+4,'lâmina máx.','water','font-size="10"')+T(cx+cw/2,cy+ch+18,br(V_('pw'),0)+' cm','muted','text-anchor="middle"')+T(cx+cw/2,cy+ch+34,'nível com a chuva de projeto: '+br(uso*100,0)+'%',r.ok?'pos':'neg','text-anchor="middle"');
$('draw').innerHTML=SVG(640,Math.max(270,cy+ch+50),'Telhado em corte e seção da calha',s);
$('memorial').textContent=`1) A = (a + h/2) · b = (${br(a)} + ${br(h)}/2) × ${br(V_('pb'))} = ${br(r.A)} m²
2) Q = I · A / 60 = ${br(V_('pI'),0)} × ${br(r.A)} / 60 = ${br(r.Q)} L/min
3) S = ${br(V_('pw')/100,3)} × ${br(V_('py')/100,3)} = ${br(r.S,5)} m²   P = ${br(r.P,3)} m   Rh = ${br(r.Rh,4)} m
4) Qcalha = 60.000 × (${br(r.S,5)}/${br(V_('pn'),3)}) × ${br(r.Rh,4)}^(2/3) × ${br(V_('pi')/100,3)}^(1/2) = ${br(r.Qc)} L/min
5) ${br(r.Qc)} ${r.ok?'≥':'<'} ${br(r.Q)} → ${r.ok?'calha atende':'calha NÃO atende'}
6) Condutor (regra prática 1 cm² por m² de telhado): Ø ≈ ${br(r.dPrat,0)} mm → adotar ${r.cond} mm (mínimo da norma: 70 mm)`;}}
});
