// GT-04 · Fundações e Solos
Academia.modulo('gt',{
teoria:`<p>Antes de fundar, precisamos saber o quanto o solo aguenta. A sondagem SPT (NBR 6484) crava um amostrador com golpes de um martelo de 65 kg. O número de golpes para os últimos 30 cm é o N<sub>SPT</sub>: quanto maior, mais resistente o solo.</p>
<div class="cols"><div class="conceito"><h4>Tensão admissível</h4><p>Quanto o solo aguenta por metro quadrado sem romper nem recalcar demais. Medida em kPa (kN/m²).</p></div>
<div class="conceito"><h4>Fundação rasa</h4><p>Sapatas e radier: espalham a carga perto da superfície, quando o solo bom está raso.</p></div>
<div class="conceito"><h4>Fundação profunda</h4><p>Estacas e tubulões: levam a carga até camadas mais resistentes lá embaixo.</p></div></div>
<h3>Pré-dimensionamento de sapata</h3>
<div class="formula">σadm (MPa) ≈ NSPT / 50   (estimativa para 5 ≤ N ≤ 20)</div>
<div class="formula">Área = 1,05·N / σadm     (5% para peso próprio da sapata e solo)</div>
<div class="formula">Abas iguais:  L − B = a0 − b0     Sapata rígida: h ≥ (L − a0)/3</div>
<div class="dica"><b>Responsabilidade</b>Essa estimativa serve para estudo e pré-dimensionamento. Fundação de verdade exige sondagem e projeto conforme a NBR 6122.</div>`,
exemplo:`<h3>Pilar 20 × 40 com 800 kN</h3><p>A sondagem indicou N<sub>SPT</sub> = 12 na cota de apoio. O pilar mede 20 × 40 cm.</p>
<ol class="passos"><li><b>Tensão admissível.</b> 12 / 50 = 0,24 MPa = <b>240 kPa</b>.</li>
<li><b>Área necessária.</b> A = 1,05 × 800 / 240 = <b>3,50 m²</b>.</li>
<li><b>Abas iguais.</b> L − B = 0,40 − 0,20 = 0,20 m. Resolvendo B × (B + 0,20) = 3,50 → B ≈ 1,77 → <b>B = 1,80 m</b> e <b>L = 2,00 m</b>.</li>
<li><b>Verificação.</b> σ = 840 / (1,80 × 2,00) = <b>233 kPa ≤ 240 kPa</b> ✓</li>
<li><b>Altura.</b> h ≥ (2,00 − 0,40) / 3 = 0,53 → <b>h = 0,55 m</b>.</li></ol>
<div class="dica"><b>Confira no simulador</b>N = 800 kN, NSPT = 12, pilar 40 × 20.</div>`,
exemplos:[{"nivel": "facil", "titulo": "Pilar quadrado de 30 × 30 com 400 kN", "html": "<p>Sondagem com N<sub>SPT</sub> = 8 na cota de apoio.</p><ol class=\"passos\"><li><b>Tensão admissível.</b> 8 / 50 = 0,16 MPa = <b>160 kPa</b>.</li><li><b>Área.</b> A = 1,05 × 400 / 160 = <b>2,63 m²</b>.</li><li><b>Sapata quadrada.</b> Pilar quadrado, então sapata quadrada: √2,63 = 1,62 → <b>1,65 × 1,65 m</b>.</li><li><b>Altura.</b> h ≥ (1,65 − 0,30) / 3 = 0,45 → <b>h = 0,45 m</b>.</li></ol>"}, {"nivel": "obra", "titulo": "Casa térrea com pilar de 15 × 30", "html": "<p>Pilar de casa com 150 kN e solo fraco, N<sub>SPT</sub> = 6.</p><ol class=\"passos\"><li><b>Tensão admissível.</b> 6 / 50 = <b>120 kPa</b>.</li><li><b>Área.</b> 1,05 × 150 / 120 = 1,31 m².</li><li><b>Abas iguais.</b> L − B = 0,30 − 0,15 = 0,15 m → <b>1,10 × 1,25 m</b>.</li><li><b>Altura.</b> h = <b>0,35 m</b>. Sob a sapata, use 5 cm de concreto magro.</li></ol><div class=\"dica\"><b>Sondagem em casa</b>Mesmo em obra pequena, a NBR 8036 pede sondagem. Uma casa de até 200 m² precisa de pelo menos 2 furos. Fundação \"no olho\" é a maior causa de trincas em casas.</div>"}],
obra:{"intro": "A fundação é a parte da obra que ninguém vê depois de pronta e a mais cara de corrigir. Os problemas quase sempre começam na falta de sondagem ou na escavação mal conferida.", "erros": [["Fundação sem sondagem", "Escolher sapata ou estaca \"pelo costume da região\" e descobrir o aterro mole depois."], ["Fundo da cava com solo solto ou água", "Sapata apoiada em lama ou terra solta recalca."], ["Sapata de divisa sem viga alavanca", "A carga excêntrica gira a sapata e trinca a parede."], ["Fundações diferentes na mesma obra", "Misturar sapata e estaca sem projeto provoca recalque diferencial."]], "checklist": ["Existe laudo de sondagem SPT com número de furos adequado à área", "A cota de apoio e o solo encontrado na escavação conferem com a sondagem", "O fundo da cava foi limpo, apiloado e está sem água", "Lastro de concreto magro de 5 cm foi executado antes da armadura", "Dimensões da sapata e posição do arranque do pilar conferidas com trena", "Impermeabilização da viga baldrame executada antes de levantar a alvenaria", "Aterro interno compactado em camadas de no máximo 20 cm"], "dica": "Se a escavação encontrar solo diferente do previsto (aterro, lixo, argila mole, água), pare e chame o projetista antes de concretar. É muito mais barato do que corrigir depois."},
sim:{html:()=>simWrap(rng('gN','Carga do pilar N',100,3000,50,800,'kN')+rng('gS','NSPT na cota de apoio',5,20,1,12,'golpes')+rng('gA','Pilar: lado maior a0',15,100,5,40,'cm')+rng('gB','Pilar: lado menor b0',15,40,5,20,'cm')),
update(){const N=V_('gN'),ns=V_('gS'),a0=Math.max(V_('gA'),V_('gB')),b0=Math.min(V_('gA'),V_('gB')),r=calc.sapata(N,ns,a0,b0);
$('tiles').innerHTML=tiles([['σ adm',br(r.sadm,0)+' kPa'],['Área necessária',br(r.A)+' m²'],['Sapata B × L',br(r.B)+' × '+br(r.L)+' m',1],['Altura h',br(r.h)+' m']])+(r.sig<=r.sadm?`<span class="pill ok">σ = ${br(r.sig,0)} kPa ≤ σadm</span>`:'<span class="pill alerta">Tensão acima da admissível</span>');
const sc=Math.min(260/r.L,200/r.B),Lw=r.L*sc,Bw=r.B*sc,ox=40+(260-Lw)/2,oy=40+(200-Bw)/2,pa=a0/100*sc,pb=b0/100*sc;
let s=T(40,20,'PLANTA','muted','font-size="10" letter-spacing="1"')+`<rect x="${ox}" y="${oy}" width="${Lw}" height="${Bw}" style="fill:var(--soil-fill);stroke:var(--ink);stroke-width:2"/>`;
s+=`<rect x="${ox+Lw/2-pa/2}" y="${oy+Bw/2-pb/2}" width="${pa}" height="${pb}" style="fill:var(--ink)"/>`;
s+=Ln(ox,oy+Bw+14,ox+Lw,oy+Bw+14,'muted')+T(ox+Lw/2,oy+Bw+28,'L = '+br(r.L)+' m','ink','text-anchor="middle"')+Ln(ox+Lw+14,oy,ox+Lw+14,oy+Bw,'muted')+T(ox+Lw+20,oy+Bw/2+4,'B = '+br(r.B)+' m','ink');
const aba=(r.L-a0/100)/2;s+=T(ox+aba*sc/2,oy+Bw/2+4,'aba '+br(aba),'muted','text-anchor="middle" font-size="9"');
// corte
const cx=420,cy=40,cs=Math.min(140/r.L,120/(r.h+0.6)),cl=r.L*cs,ch=r.h*cs;
s+=T(cx,20,'CORTE','muted','font-size="10" letter-spacing="1"');
s+=`<rect x="${cx-10}" y="${cy+60}" width="${cl+20}" height="${ch+70}" style="fill:var(--soil-fill)"/>`;
s+=`<path d="M${cx} ${cy+60+ch*0.6+40} L${cx} ${cy+60+ch+40} L${cx+cl} ${cy+60+ch+40} L${cx+cl} ${cy+60+ch*0.6+40} L${cx+cl/2+a0/200*cs+4} ${cy+100} L${cx+cl/2-a0/200*cs-4} ${cy+100}Z" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:2"/>`;
s+=`<rect x="${cx+cl/2-a0/200*cs}" y="${cy}" width="${a0/100*cs}" height="100" style="fill:var(--ink)"/>`;
s+=Ln(cx+cl+8,cy+100,cx+cl+8,cy+100+ch,'muted')+T(cx+cl+12,cy+100+ch/2+4,'h = '+br(r.h),'ink');
s+=T(cx+cl/2,cy+60+ch+60,`NSPT = ${ns} · σadm = ${br(r.sadm,0)} kPa`,'soil','text-anchor="middle"');
$('draw').innerHTML=SVG(640,300,'Planta e corte da sapata isolada',s);
$('memorial').textContent=`1) σadm ≈ NSPT/50 = ${ns}/50 = ${br(ns/50,2)} MPa = ${br(r.sadm,0)} kPa
2) A = 1,05 × N / σadm = 1,05 × ${br(N,0)} / ${br(r.sadm,0)} = ${br(r.A,3)} m²
3) Abas iguais: L − B = a0 − b0 = ${br(a0/100)} − ${br(b0/100)} = ${br((a0-b0)/100)} m
   B·(B + ${br((a0-b0)/100)}) = ${br(r.A,3)} → B = ${br(r.B)} m · L = ${br(r.L)} m (múltiplos de 5 cm)
4) σ = 1,05 × ${br(N,0)} / (${br(r.B)} × ${br(r.L)}) = ${br(r.sig,1)} kPa ${r.sig<=r.sadm?'≤':'>'} ${br(r.sadm,0)} kPa
5) Sapata rígida: h ≥ (L − a0)/3 = ${br((r.L-a0/100)/3,3)} m → h = ${br(r.h)} m`;}}
});
