// CF-28 · Cálculo e Física Aplicados (centroide, momento de inércia, Steiner e tensões de flexão)
Academia.modulo('cf',{
teoria:`<p>Toda viga, laje e pilar usa a mesma física: forças, momentos e a forma da seção. Duas peças com a mesma área de material podem ter resistências muito diferentes, porque o que importa na flexão é <b>onde</b> o material está em relação ao centro da seção.</p>
<figure class="fig"><svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono,ui-monospace,monospace" font-size="11" role="img" aria-label="Seção T com o centroide e o diagrama de tensões de flexão">
<rect x="120" y="30" width="240" height="40" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/><rect x="200" y="70" width="80" height="130" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/>
<line x1="100" y1="92" x2="380" y2="92" style="stroke:var(--amber);stroke-width:2" stroke-dasharray="6 4"/><text x="386" y="96" style="fill:var(--amber-ink)" font-size="10" font-weight="600">linha neutra (centroide)</text>
<path d="M460 30 L520 30 L470 92 L410 200 L470 200Z" style="fill:none"/><line x1="470" y1="30" x2="470" y2="200" style="stroke:var(--ink)"/>
<path d="M470 30 L520 30 L470 92Z" style="fill:var(--steel);opacity:.45;stroke:var(--steel)"/><path d="M470 92 L380 200 L470 200Z" style="fill:var(--neg);opacity:.35;stroke:var(--neg)"/>
<text x="526" y="34" style="fill:var(--steel)" font-size="10">compressão</text><text x="476" y="196" style="fill:var(--neg)" font-size="10">tração</text>
<text x="230" y="54" style="fill:var(--ink)" text-anchor="middle" font-size="10">mesa</text><text x="240" y="150" style="fill:var(--ink)" text-anchor="middle" font-size="10">alma</text></svg><figcaption>Seção T com o centroide e o diagrama de tensões de flexão</figcaption></figure>
<div class="cols"><div class="conceito"><h4>Centroide (yc)</h4><p>O ponto de equilíbrio da área da seção. Na flexão, a linha neutra passa por ele: acima comprime, abaixo traciona.</p></div>
<div class="conceito"><h4>Momento de inércia (I)</h4><p>Mede o quanto a área está afastada do centroide. Quanto mais longe, maior o I e mais rígida a peça na flexão.</p></div>
<div class="conceito"><h4>Módulo resistente (W)</h4><p>I dividido pela distância até a borda. Com ele, a tensão máxima sai de uma divisão: σ = M / W.</p></div></div>
<h3>Fórmulas da seção</h3>
<div class="formula">Centroide de figuras compostas: yc = Σ(Ai × yi) / ΣAi</div>
<div class="formula">Retângulo em torno do próprio centro: I = b × h³ / 12</div>
<div class="formula">Teorema de Steiner (eixos paralelos): I = Σ[ Ii + Ai × di² ]   (di = distância do centro da parte ao centroide)</div>
<div class="formula">Tensão de flexão: σ = M × y / I = M / W   (W = I / y da borda) · 1 kN/cm² = 10 MPa</div>
<div class="dica"><b>A altura manda</b>No retângulo, I cresce com o cubo da altura. Dobrar a altura de uma viga deixa ela 8 vezes mais rígida; dobrar a largura, só 2 vezes.</div>`,
exemplo:`<h3>Viga T com mesa de laje</h3>
<p>Uma viga tem alma de 20 × 40 cm e trabalha junto com uma faixa de laje de 60 × 10 cm por cima (mesa). Altura total de 50 cm. Momento fletor de 50 kN·m.</p>
<ol class="passos"><li><b>Áreas e centros.</b> Mesa: 60 × 10 = 600 cm², centro a 45 cm da base. Alma: 20 × 40 = 800 cm², centro a 20 cm. Total: <b>1.400 cm²</b>.</li>
<li><b>Centroide.</b> yc = (600 × 45 + 800 × 20) / 1400 = 43.000 / 1400 = <b>30,71 cm</b> da base.</li>
<li><b>Inércia (Steiner).</b> Mesa: 5.000 + 600 × 14,29² = 127.449 · Alma: 106.667 + 800 × 10,71² = 198.503 · I = <b>325.952 cm⁴</b>.</li>
<li><b>Módulos.</b> Embaixo: W = 325.952 / 30,71 = <b>10.612 cm³</b> · em cima: 325.952 / 19,29 = <b>16.901 cm³</b>.</li>
<li><b>Tensões.</b> M = 5.000 kN·cm · tração embaixo: 5.000 / 10.612 = 0,471 kN/cm² = <b>4,71 MPa</b> · compressão em cima: <b>2,96 MPa</b>.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
exemplos:[{"nivel":"facil","titulo":"Inércia de uma viga retangular","html":"<p>Viga retangular de 20 cm de largura por 40 cm de altura.</p><ol class=\"passos\"><li><b>Fórmula.</b> I = b × h³ / 12.</li><li><b>Conta.</b> I = 20 × 40³ / 12 = 20 × 64.000 / 12 = <b>106.667 cm⁴</b>.</li><li><b>Módulo resistente.</b> W = I / (h/2) = 106.667 / 20 = <b>5.333 cm³</b> (ou b × h² / 6).</li><li><b>Comparação.</b> A viga T do exemplo, com a laje junto, tem I = 325.952 cm⁴: três vezes mais, por causa da mesa longe do centro.</li></ol>"},
{"nivel":"obra","titulo":"Caibro em pé ou deitado","html":"<p>Na obra, um caibro de madeira de 6 × 16 cm vai vencer um vão como peça de apoio. O carpinteiro quer saber se faz diferença colocar em pé ou deitado.</p><ol class=\"passos\"><li><b>Em pé (h = 16).</b> I = 6 × 16³ / 12 = <b>2.048 cm⁴</b> · W = 2.048 / 8 = <b>256 cm³</b>.</li><li><b>Deitado (h = 6).</b> I = 16 × 6³ / 12 = <b>288 cm⁴</b> · W = 288 / 3 = <b>96 cm³</b>.</li><li><b>Diferença.</b> Em pé, a peça é <b>7,1 vezes</b> mais rígida e aguenta <b>2,7 vezes</b> mais momento, com a mesma madeira.</li><li><b>Regra.</b> Peça que trabalha à flexão vai com a maior dimensão na vertical, travada lateralmente para não tombar.</li></ol><div class=\"dica\"><b>Na forma e no escoramento</b>A mesma lógica vale para as guias e os pontaletes do escoramento de laje: peça deitada flecha muito mais.</div>"}],
obra:{"intro":"Cálculo e física não ficam só no escritório. Furar uma viga, cortar uma peça, virar uma madeira ou mudar uma carga de lugar mexe diretamente na inércia, no momento e nas tensões que o projeto previu.","erros":[["Furo na viga no lugar errado","Passar tubulação furando a viga perto da borda, onde as tensões de flexão são máximas, em vez de no meio da altura."],["Peça deitada","Montar caibro, guia ou viga de madeira com a menor dimensão na vertical, perdendo grande parte da rigidez."],["Rebaixar a viga","Cortar a altura da viga para passar duto ou ganhar pé-direito, sem saber que a inércia cai com o cubo da altura."],["Confundir unidades","Misturar kN·m com kN·cm ou kgf com kN e errar a tensão em 10 ou 100 vezes."]],"checklist":["Furos em vigas só onde o projeto permite, de preferência no meio da altura","Peças de madeira que trabalham à flexão com a maior dimensão na vertical","Nenhuma redução de seção de viga ou pilar sem consulta ao projetista","Unidades conferidas em toda conta (kN, kN·m, cm, MPa)","Mesa colaborante só considerada quando a laje está ligada à viga","Escoramento com peças na posição e na seção previstas"],"dica":"Na dúvida sobre uma conta de obra, refaça com outra unidade. Se em kN·cm e em kN·m o resultado não bate depois da conversão, o erro está nas unidades, não no concreto."},
sim:{html:()=>simWrap(rng('cfBf','Largura da mesa bf',10,120,1,60,'cm','Igual à alma = seção retangular')+rng('cfHf','Altura da mesa hf',4,30,1,10,'cm')+rng('cfBw','Largura da alma bw',10,60,1,20,'cm')+rng('cfHw','Altura da alma hw',10,100,1,40,'cm')+rng('cfM','Momento fletor M',0,300,1,50,'kN·m')),
update(){const bf=V_('cfBf'),hf=V_('cfHf'),bw=V_('cfBw'),hw=V_('cfHw'),M=V_('cfM'),r=calc.secaoT(bf,hf,bw,hw),Mk=M*100,si=10*Mk/r.Winf,ss=10*Mk/r.Wsup;
 $('tiles').innerHTML=tiles([['Centroide yc',br(r.yc)+' cm'],['Inércia I',br(r.I,0)+' cm⁴',1],['Tração embaixo',br(si)+' MPa',1],['Compressão em cima',br(ss)+' MPa']]);
 const sc=180/Math.max(r.h,bf*0.9),cx=200,yb=210,ytop=yb-r.h*sc;let s=T_('SEÇÃO E TENSÕES DE FLEXÃO',20,18);
 s+=`<rect x="${cx-bw*sc/2}" y="${yb-hw*sc}" width="${bw*sc}" height="${hw*sc}" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/><rect x="${cx-bf*sc/2}" y="${ytop}" width="${bf*sc}" height="${hf*sc}" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/>`;
 const yl=yb-r.yc*sc;s+=Ln(Math.min(cx-bf*sc/2,cx-bw*sc/2)-20,yl,Math.max(cx+bf*sc/2,cx+bw*sc/2)+20,yl,'amber',2,'stroke-dasharray="6 4"')+T(14,yl-6,'yc = '+br(r.yc,1),'amber-ink','font-size="10" font-weight="600"');
 const xd=480,smax=Math.max(si,ss,0.01),k=100/smax;s+=Ln(xd,ytop,xd,yb,'ink',1.5)+Ln(xd-110,yl,xd+110,yl,'amber',1,'stroke-dasharray="4 3"');
 if(M>0){s+=`<path d="M${xd} ${yl} L${xd+ss*k} ${ytop} L${xd} ${ytop}Z" style="fill:var(--steel);opacity:.45;stroke:var(--steel)"/><path d="M${xd} ${yl} L${xd-si*k} ${yb} L${xd} ${yb}Z" style="fill:var(--neg);opacity:.35;stroke:var(--neg)"/>`;
  s+=T(xd+ss*k+6,ytop+10,br(ss)+' MPa','steel','font-size="10" font-weight="600"')+T(xd-si*k-6,yb-4,br(si)+' MPa','neg','text-anchor="end" font-size="10" font-weight="600"');}
 s+=T(xd-60,yb+16,'M = '+br(M,0)+' kN·m','ink','font-size="10"');
 $('draw').innerHTML=SVG(640,232,'Seção T com centroide e diagrama de tensões de flexão',s);
 const A1=bf*hf,A2=bw*hw,y1=hw+hf/2,y2=hw/2;
 $('memorial').textContent=`1) Áreas: mesa ${br(A1,0)} cm² (y = ${br(y1,1)}) · alma ${br(A2,0)} cm² (y = ${br(y2,1)}) · A = ${br(r.A,0)} cm²
2) Centroide: yc = (${br(A1,0)} × ${br(y1,1)} + ${br(A2,0)} × ${br(y2,1)}) / ${br(r.A,0)} = ${br(r.yc,2)} cm da base
3) Steiner mesa: ${br(bf*hf**3/12,0)} + ${br(A1,0)} × ${br(y1-r.yc,2)}² = ${br(bf*hf**3/12+A1*(y1-r.yc)**2,0)} cm⁴
4) Steiner alma: ${br(bw*hw**3/12,0)} + ${br(A2,0)} × ${br(y2-r.yc,2)}² = ${br(bw*hw**3/12+A2*(y2-r.yc)**2,0)} cm⁴ · I = ${br(r.I,0)} cm⁴
5) Módulos: W inf = ${br(r.I,0)} / ${br(r.yc,2)} = ${br(r.Winf,0)} cm³ · W sup = ${br(r.I,0)} / ${br(r.h-r.yc,2)} = ${br(r.Wsup,0)} cm³
6) Tensões: M = ${br(Mk,0)} kN·cm → tração ${br(Mk,0)}/${br(r.Winf,0)} = ${br(si/10,3)} kN/cm² = ${br(si)} MPa · compressão ${br(ss)} MPa`;}}
});
