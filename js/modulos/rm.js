// RM-01 · Resistência dos Materiais
Academia.modulo('rm',{
teoria:`<p>Pense numa tábua apoiada em dois tijolos com alguém em pé no meio. A tábua enverga, e os tijolos empurram de volta. Resistência dos Materiais estuda exatamente isso: quanto cada peça sofre por dentro quando recebe carga.</p>
<div class="cols"><div class="conceito"><h4>Reações de apoio</h4><p>A força que cada apoio devolve para manter a viga parada. A soma das reações é igual à soma das cargas.</p></div>
<div class="conceito"><h4>Esforço cortante (V)</h4><p>A tendência de uma parte da viga escorregar em relação à outra, como uma tesoura. Medido em kN.</p></div>
<div class="conceito"><h4>Momento fletor (M)</h4><p>A tendência de a viga dobrar. É ele que define quanto aço vai embaixo da viga. Medido em kN·m.</p></div></div>
<h3>As três equações de equilíbrio</h3><div class="formula">ΣFx = 0  |  ΣFy = 0  |  ΣM = 0</div>
<p>Em palavras: nada anda para os lados, nada sobe ou desce, e nada gira. Com essas três regras você encontra as reações de qualquer viga biapoiada.</p>
<h3>Fórmulas que você vai usar muito</h3>
<div class="formula">Carga distribuída q em vão L:  R = q·L/2   Mmáx = q·L²/8</div>
<div class="formula">Carga concentrada P no meio:  R = P/2   Mmáx = P·L/4</div>
<div class="dica"><b>Regra de ouro</b>Onde o cortante passa por zero, o momento é máximo. É ali que a viga mais sofre.</div>`,
exemplo:`<h3>Viga de 5 m com laje apoiada em cima</h3><p>Uma viga biapoiada de 5,00 m recebe uma carga distribuída de 12 kN/m (peso da laje, revestimento e uso). Quais são as reações e o momento máximo?</p>
<ol class="passos"><li><b>Carga total.</b> 12 × 5 = <b>60 kN</b>.</li><li><b>Reações.</b> A carga é simétrica, então cada apoio pega metade: R<sub>A</sub> = R<sub>B</sub> = <b>30 kN</b>.</li>
<li><b>Cortante.</b> Começa em +30 kN no apoio A, cai em linha reta e chega a −30 kN no apoio B. Passa por zero no meio (x = 2,50 m).</li>
<li><b>Momento máximo.</b> M = q·L²/8 = 12 × 25 / 8 = <b>37,5 kN·m</b>.</li>
<li><b>Na obra.</b> Esse valor vai para o dimensionamento da armadura (NBR 6118), com γf = 1,4 → Md = 52,5 kN·m. Veja o módulo CA-03.</li></ol>
<div class="dica"><b>Confira no simulador</b>Coloque L = 5 m, q = 12 kN/m e P = 0. Os números devem bater.</div>`,
exemplos:[{"nivel": "facil", "titulo": "Viga de 3 m com uma carga no meio", "html": "<p>Uma viga biapoiada de 3 m recebe um pilarete que descarrega 12 kN bem no meio do vão. Sem carga distribuída.</p><ol class=\"passos\"><li><b>Reações.</b> Simetria: R<sub>A</sub> = R<sub>B</sub> = 12 / 2 = <b>6 kN</b>.</li><li><b>Cortante.</b> +6 kN do apoio A até o meio, −6 kN do meio até B. Ele troca de sinal exatamente embaixo da carga.</li><li><b>Momento máximo.</b> M = P·L/4 = 12 × 3 / 4 = <b>9 kN·m</b>, embaixo da carga.</li><li><b>Leitura.</b> Com carga concentrada, o diagrama de momento é um triângulo, e não uma parábola.</li></ol><div class=\"dica\"><b>No simulador</b>L = 3 m, q = 0, P = 12 kN e posição 50%.</div>"}, {"nivel": "obra", "titulo": "Viga sob parede de alvenaria", "html": "<p>Uma viga de 14 × 30 cm vence 4 m e carrega uma parede de bloco cerâmico de 14 cm, rebocada, com 2,80 m de altura. Peso usual dessa parede: cerca de 2,0 kN por m² de parede.</p><ol class=\"passos\"><li><b>Carga da parede.</b> 2,0 kN/m² × 2,80 m = <b>5,6 kN/m</b>.</li><li><b>Peso próprio da viga.</b> 25 kN/m³ × 0,14 × 0,30 = <b>1,05 kN/m</b>. Total: q = 6,65 kN/m.</li><li><b>Reações.</b> R = 6,65 × 4 / 2 = <b>13,3 kN</b> em cada pilar.</li><li><b>Momento.</b> M = 6,65 × 4² / 8 = <b>13,3 kN·m</b>. Esse valor segue para o dimensionamento da armadura (CA-03).</li></ol><div class=\"dica\"><b>Erro comum</b>Esquecer o peso da parede ou da própria viga. Juntos, eles costumam ser a maior parte da carga em casas.</div>"}],
obra:{"intro": "Na obra, a Resistência dos Materiais aparece no dia em que alguém quer tirar uma parede, abrir um vão ou apoiar uma caixa d’água sobre a laje. Saber de onde vem cada carga evita improviso perigoso.", "erros": [["Apoiar carga nova sem conferir", "Caixa d’água, ar-condicionado ou parede nova sobre laje e viga que não foram calculadas para isso."], ["Abrir vão sem verga", "Porta ou janela aberta sem verga e contraverga: a parede trinca em diagonal nos cantos."], ["Cortar viga para passar tubo", "Furo ou rasgo na viga, principalmente perto dos apoios, onde o cortante é maior."], ["Confundir kN com kgf", "1 kN ≈ 100 kgf. Errar a unidade multiplica ou divide a carga por 10."]], "checklist": ["Cargas novas (caixa d’água, equipamentos, paredes) foram avaliadas por engenheiro", "Vergas e contravergas passam pelo menos 30 cm de cada lado do vão", "Nenhuma viga foi furada ou rasgada sem autorização do projetista", "Apoios das vigas estão íntegros, sem esmagamento ou fissuras", "Escoramento só foi retirado no prazo indicado", "Flechas visíveis ou fissuras no meio do vão foram registradas e comunicadas"], "dica": "Fissura inclinada perto do apoio indica cortante; fissura vertical no meio do vão, embaixo, indica momento. Fotografe com uma régua ao lado para acompanhar a abertura."},
sim:{html:()=>simWrap(rng('inL','Vão L',2,10,0.5,5,'m')+rng('inQ','Carga distribuída q',0,30,1,12,'kN/m','Peso de laje, parede, revestimento')+rng('inP','Carga concentrada P',0,80,5,20,'kN','Pilar apoiado, equipamento')+rng('inA','Posição de P',0,100,5,40,'% do vão','Medida a partir do apoio A')),
update(){const L=V_('inL'),q=V_('inQ'),P=V_('inP'),a=L*V_('inA')/100,r=calc.viga(L,q,P,a);
$('tiles').innerHTML=tiles([['R_A',br(r.RA)+' kN'],['R_B',br(r.RB)+' kN'],['V máx',br(r.Vmax)+' kN'],['M máx',br(r.Mmax)+' kN·m',1]]);
const W=640,x0=50,x1=590,sx=x=>x0+(x1-x0)*x/L,by=120;let s=T(x0,18,'ESQUEMA ESTÁTICO','muted','font-size="10" letter-spacing="1"');
if(q>0){const n=Math.max(6,Math.round(L*2));for(let i=0;i<=n;i++){const x=sx(L*i/n);s+=Ln(x,70,x,by-8,'steel',1.2)+`<path d="M${x-3} ${by-12} L${x} ${by-6} L${x+3} ${by-12}" style="fill:var(--steel)"/>`}s+=Ln(x0,70,x1,70,'steel',1.5)+T(320,62,`q = ${q} kN/m`,'steel','text-anchor="middle"')}
if(P>0){const px=sx(a);s+=Ln(px,34,px,by-6,'amber',3)+`<path d="M${px-7} ${by-16} L${px} ${by-4} L${px+7} ${by-16}Z" style="fill:var(--amber)"/>`+T(px+8,42,`P = ${P} kN`,'amber-ink','font-weight="600"')}
s+=`<rect x="${x0}" y="${by-4}" width="${x1-x0}" height="10" style="fill:var(--ink)"/><path d="M${x0} ${by+6} l-10 16 h20z" style="fill:none;stroke:var(--ink);stroke-width:1.5"/><path d="M${x1} ${by+6} l-10 16 h20z" style="fill:none;stroke:var(--ink);stroke-width:1.5"/><circle cx="${x1}" cy="${by+26}" r="3" style="fill:none;stroke:var(--ink)"/>`;
s+=T(x0,by+42,'RA = '+br(r.RA),'ink','text-anchor="middle"')+T(x1,by+42,'RB = '+br(r.RB),'ink','text-anchor="middle"')+Ln(x0,by+56,x1,by+56,'line')+T(320,by+70,`L = ${br(L)} m`,'muted','text-anchor="middle"');
s+=diagram(r.xs,r.V,L,x0,x1,330,70,'ESFORÇO CORTANTE V (kN)')+T(x0-6,264,'+'+br(r.V[0],1),'pos','text-anchor="end"')+T(x1+6,334,br(r.V[r.V.length-1],1),'neg');
s+=diagram(r.xs,r.M,L,x0,x1,440,70,'MOMENTO FLETOR M (kN·m)',true);
const mab=Math.max(...r.M.map(Math.abs))||1,mx=sx(r.xM),my=440+70*r.Mmax/mab;
s+=Ln(mx,250,mx,my,'amber',1,'stroke-dasharray="4 3"')+`<circle cx="${mx}" cy="${my}" r="4" style="fill:var(--amber)"/>`+T(mx,my+20,'Mmáx = '+br(r.Mmax),'ink','text-anchor="middle" font-weight="600"')+T(mx,my+34,'x = '+br(r.xM)+' m','muted','text-anchor="middle"');
$('draw').innerHTML=SVG(W,560,'Viga biapoiada com diagramas de cortante e momento',s);
$('memorial').textContent=`1) Carga total      = q·L + P = ${br(q)}×${br(L)} + ${br(P)} = ${br(q*L+P)} kN
2) ΣM em A = 0      → RB = q·L/2 + P·a/L = ${br(q*L/2)} + ${br(P)}×${br(a)}/${br(L)} = ${br(r.RB)} kN
3) ΣFy = 0          → RA = ${br(q*L+P)} − ${br(r.RB)} = ${br(r.RA)} kN
4) V(x) = RA − q·x − P (depois de x = ${br(a)} m)
5) M máx em x = ${br(r.xM)} m (onde V muda de sinal) = ${br(r.Mmax)} kN·m
6) Valor de cálculo  Md = 1,4 × ${br(r.Mmax)} = ${br(1.4*r.Mmax)} kN·m  (γf, NBR 6118)`;}}
});
