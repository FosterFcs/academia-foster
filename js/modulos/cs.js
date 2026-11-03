// CS-22 · Compactação de Solos (ensaio de Proctor e controle de campo)
Academia.modulo('cs',{
teoria:`<p>Solo solto tem ar entre os grãos. Compactar é apertar esses grãos para tirar o ar, deixando o solo mais denso, mais resistente e menos sujeito a recalque. O segredo está na <b>água</b>: com pouca, os grãos não deslizam; com muita, a água ocupa o lugar e o solo vira barro.</p>
<figure class="fig"><svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono,ui-monospace,monospace" font-size="11" role="img" aria-label="Curva de compactação: a massa específica seca é máxima na umidade ótima">
<line x1="70" y1="180" x2="560" y2="180" style="stroke:var(--ink);stroke-width:1.5"/><line x1="70" y1="180" x2="70" y2="20" style="stroke:var(--ink);stroke-width:1.5"/>
<path d="M100 160 Q 315 -20 530 160" style="fill:none;stroke:var(--steel);stroke-width:3"/>
<line x1="315" y1="72" x2="315" y2="180" style="stroke:var(--amber);stroke-width:1.5" stroke-dasharray="5 4"/><line x1="70" y1="70" x2="315" y2="70" style="stroke:var(--amber);stroke-width:1.5" stroke-dasharray="5 4"/>
<circle cx="315" cy="70" r="6" style="fill:var(--amber);stroke:var(--ink)"/>
<text x="322" y="62" style="fill:var(--amber-ink)" font-size="11" font-weight="600">γd,máx</text><text x="315" y="196" style="fill:var(--amber-ink)" text-anchor="middle" font-size="11" font-weight="600">w ótima</text>
<text x="120" y="120" style="fill:var(--muted)" font-size="10">ramo seco</text><text x="450" y="120" style="fill:var(--muted)" font-size="10">ramo úmido</text>
<text x="565" y="184" style="fill:var(--muted)" font-size="10">w (%)</text><text x="20" y="26" style="fill:var(--muted)" font-size="10">γd</text></svg><figcaption>Curva de compactação: a massa específica seca é máxima na umidade ótima</figcaption></figure>
<div class="cols"><div class="conceito"><h4>Umidade (w)</h4><p>Quanto de água o solo tem em relação ao peso dos grãos secos, em porcentagem.</p></div>
<div class="conceito"><h4>Peso específico seco (γd)</h4><p>Quanto pesa só o solo, sem a água, por metro cúbico. É ele que mostra o quanto o solo está apertado.</p></div>
<div class="conceito"><h4>Grau de compactação (GC)</h4><p>Compara o que se conseguiu no campo com o máximo do laboratório. GC = 100% é a meta usual em base de pavimento.</p></div></div>
<h3>Ensaio de Proctor (NBR 7182)</h3>
<div class="formula">Compacta-se o solo num cilindro com várias umidades e mede-se o peso específico úmido γh</div>
<div class="formula">Peso específico seco: γd = γh / (1 + w/100)</div>
<div class="formula">O topo da curva γd × w dá a umidade ótima (w ót) e o γd,máx</div>
<h3>Controle de campo</h3>
<div class="formula">GC = 100 × γd,campo / γd,máx     ·     desvio de umidade: Δw = w,campo − w ót</div>
<div class="formula">Usual: GC ≥ 95% em aterros e ≥ 100% em base e sub-base · Δw dentro de ± 2 pontos</div>
<div class="dica"><b>A energia muda a curva</b>Proctor normal, intermediário e modificado usam energias diferentes. Mais energia dá γd,máx maior e umidade ótima menor. O projeto diz qual energia usar.</div>`,
exemplo:`<h3>Ensaio de Proctor com cinco pontos</h3>
<p>No laboratório, o solo foi compactado com cinco umidades. As leituras de peso específico úmido foram:</p>
<ol class="passos"><li><b>Leituras.</b> w = 10, 12, 14, 16 e 18% · γh = 18,70 · 19,71 · 20,29 · 20,42 · 20,06 kN/m³.</li>
<li><b>Peso específico seco.</b> γd = γh / (1 + w): <b>17,00 · 17,60 · 17,80 · 17,60 · 17,00 kN/m³</b>.</li>
<li><b>Topo da curva.</b> A parábola que passa pelos pontos tem o máximo em <b>w ót = 14,0%</b> e <b>γd,máx = 17,80 kN/m³</b>.</li>
<li><b>Controle de campo.</b> Na camada compactada, o ensaio deu γh = 19,6 kN/m³ com w = 13%: γd = 19,6 / 1,13 = <b>17,35 kN/m³</b>.</li>
<li><b>Grau de compactação.</b> GC = 17,35 / 17,80 = <b>97,4%</b>. Serve para aterro (95%), mas <b>não serve para base</b>, que pede 100%.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
exemplos:[{"nivel":"facil","titulo":"Do úmido para o seco","html":"<p>Uma amostra compactada tem peso específico úmido de 20,0 kN/m³ e umidade de 15%.</p><ol class=\"passos\"><li><b>Fórmula.</b> γd = γh / (1 + w/100).</li><li><b>Conta.</b> γd = 20,0 / 1,15 = <b>17,39 kN/m³</b>.</li><li><b>Leitura.</b> Dos 20,0 kN/m³, cerca de 2,6 kN/m³ são só a água. Por isso o controle de compactação sempre usa o peso seco.</li><li><b>Comparação.</b> Se o γd,máx do Proctor for 17,8 kN/m³, o GC dessa amostra é 17,39 / 17,8 = <b>97,7%</b>.</li></ol>"},
{"nivel":"obra","titulo":"Camada aprovada no GC, reprovada na umidade","html":"<p>Base de brita graduada com γd,máx = 21,5 kN/m³ e w ót = 6%. O ensaio de frasco de areia deu γh = 23,2 kN/m³ com w = 9%.</p><ol class=\"passos\"><li><b>Peso seco.</b> γd = 23,2 / 1,09 = <b>21,28 kN/m³</b>.</li><li><b>GC.</b> 21,28 / 21,5 = <b>99,0%</b>: abaixo dos 100% exigidos para base.</li><li><b>Umidade.</b> Δw = 9 − 6 = <b>+3 pontos</b>, fora da tolerância de ± 2.</li><li><b>O que fazer.</b> Aerar e revolver a camada para secar, voltar para perto da umidade ótima e recompactar. Compactar mais com o material encharcado só bombeia água e não aumenta o GC.</li></ol><div class=\"dica\"><b>Sinal de alerta</b>Camada que \"borrachuda\" ou ondula sob o rolo está úmida demais. Pare e corrija a umidade antes de insistir.</div>"}],
obra:{"intro":"Compactação boa não se vê: só o ensaio mostra. Camada mal compactada parece firme no dia e afunda depois, com trinca em piso, recalque de muro e buraco no asfalto.","erros":[["Compactar fora da umidade ótima","Solo seco demais ou encharcado não chega ao grau de compactação, por mais que se passe o rolo."],["Camada grossa demais","Lançar 40 ou 50 cm de uma vez: o fundo fica fofo, porque a energia do rolo não chega lá embaixo."],["Material errado no aterro","Solo com raízes, entulho, matéria orgânica ou argila muito plástica no lugar do material especificado."],["Liberar sem ensaio","Passar para a camada seguinte sem o ensaio de frasco de areia ou densímetro da camada de baixo."]],"checklist":["Proctor do material feito no laboratório, com a energia do projeto","Camadas lançadas com no máximo 20 cm compactados","Umidade conferida antes de compactar (dentro de ± 2 pontos da ótima)","Número de passadas do rolo definido em trecho experimental","Ensaio de grau de compactação em cada camada, com laudo","Matéria orgânica, raízes e entulho retirados antes do aterro","Taludes e bordas compactados com equipamento adequado"],"dica":"Faça um trecho experimental no começo da obra: varie o número de passadas do rolo e meça o GC. Você descobre quantas passadas o seu equipamento precisa e evita retrabalho no resto do aterro."},
sim:{html:()=>simWrap(rng('csW1','Ponto 1: γh com w = 10%',16,22,0.01,18.70,'kN/m³')+rng('csW2','Ponto 2: γh com w = 12%',16,22,0.01,19.71,'kN/m³')+rng('csW3','Ponto 3: γh com w = 14%',16,22,0.01,20.29,'kN/m³')+rng('csW4','Ponto 4: γh com w = 16%',16,22,0.01,20.42,'kN/m³')+rng('csW5','Ponto 5: γh com w = 18%',16,22,0.01,20.06,'kN/m³')+rng('csGh','Campo: γh medido',16,24,0.05,19.6,'kN/m³','Ensaio de frasco de areia ou densímetro')+rng('csWc','Campo: umidade medida',4,24,0.5,13,'%')+sel('csE','Exigência de GC',[['100','Base e sub-base (100%)',1],['95','Aterro e reaterro (95%)'],['98','Sub-base / reforço (98%)']])),
update(){const pts=[10,12,14,16,18].map((w,i)=>[w,V_('csW'+(i+1))]),p=calc.proctor(pts),esp=+$('csE').value;
 const gdm=p.valido?p.gdmax:Math.max(...p.gd),wot=p.valido?p.wot:pts[p.gd.indexOf(gdm)][0],c=calc.campo(gdm,wot,V_('csGh'),V_('csWc'),esp);
 $('tiles').innerHTML=tiles([['w ótima',br(wot,1)+' %'],['γd,máx',br(gdm)+' kN/m³'],['GC no campo',br(c.GC,1)+' %',1],['Resultado',c.ok?'Aprovado':'Reprovado',1]]);
 const x0=70,x1=560,y0=200,y1=30,mn=Math.min(...p.gd,c.gd)-0.4,mx=Math.max(...p.gd,c.gd,gdm)+0.3,sx=w=>x0+(x1-x0)*(w-8)/14,sy=g=>y0-(y0-y1)*(g-mn)/(mx-mn);
 let s=T_('CURVA DE COMPACTAÇÃO',30,18)+Ln(x0,y0,x1,y0,'ink',1.5)+Ln(x0,y0,x0,y1,'ink',1.5)+T(x1+4,y0+4,'w %','muted','font-size="10"')+T(14,y1,'γd','muted','font-size="10"');
 for(let w=8;w<=22;w+=2)s+=Ln(sx(w),y0,sx(w),y0+4,'ink')+T(sx(w),y0+16,w,'muted','text-anchor="middle" font-size="9"');
 if(p.valido){let d='';for(let w=9;w<=19;w+=0.25){const g=p.c+p.b*w+p.a*w*w;d+=(d?' L':'M')+sx(w).toFixed(1)+' '+sy(g).toFixed(1)}s+=`<path d="${d}" style="fill:none;stroke:var(--steel);stroke-width:2.5"/>`;}
 p.gd.forEach((g,i)=>{s+=`<circle cx="${sx(pts[i][0])}" cy="${sy(g)}" r="5" style="fill:var(--sheet);stroke:var(--steel);stroke-width:2"/>`});
 s+=Ln(sx(wot),sy(gdm),sx(wot),y0,'amber',1.5,'stroke-dasharray="5 4"')+`<circle cx="${sx(wot)}" cy="${sy(gdm)}" r="6" style="fill:var(--amber);stroke:var(--ink)"/>`+T(sx(wot)+8,sy(gdm)-8,'máx '+br(gdm),'amber-ink','font-weight="600"');
 const cw=Math.min(Math.max(V_('csWc'),8),22);s+=`<path d="M${sx(cw)-7} ${sy(c.gd)} L${sx(cw)} ${sy(c.gd)-8} L${sx(cw)+7} ${sy(c.gd)} L${sx(cw)} ${sy(c.gd)+8}Z" style="fill:var(--${c.ok?'pos':'neg'})"/>`+T(sx(cw)+10,sy(c.gd)+18,'campo · GC '+br(c.GC,1)+'%',c.ok?'pos':'neg','font-size="10" font-weight="600"');
 if(!p.valido)s+=T(300,110,'Os pontos não formam uma curva com topo: revise as leituras','neg','text-anchor="middle" font-size="11"');
 $('draw').innerHTML=SVG(640,230,'Curva de compactação com os pontos do ensaio e o ponto de campo',s);
 $('memorial').textContent=`1) γd = γh / (1 + w): ${p.gd.map((g,i)=>br(pts[i][1])+'/'+br(1+pts[i][0]/100)+' = '+br(g)).join(' · ')}
2) Parábola ajustada: γd = ${br(p.c,3)} ${p.b>=0?'+':'−'} ${br(Math.abs(p.b),4)}·w ${p.a>=0?'+':'−'} ${br(Math.abs(p.a),4)}·w²${p.valido?'':' (sem máximo dentro dos pontos: adotado o maior ponto)'}
3) Umidade ótima = ${br(wot,2)}% · γd,máx = ${br(gdm,3)} kN/m³
4) Campo: γd = ${br(V_('csGh'))} / ${br(1+V_('csWc')/100,3)} = ${br(c.gd,3)} kN/m³
5) GC = 100 × ${br(c.gd,3)} / ${br(gdm,3)} = ${br(c.GC,1)}% (exigido ${esp}%) → ${c.okGC?'atende':'não atende'}
6) Δw = ${br(V_('csWc'),1)} − ${br(wot,1)} = ${br(c.dw,1)} pontos (tolerância ± 2) → ${c.okW?'atende':'não atende'} · camada ${c.ok?'APROVADA':'REPROVADA'}`;}}
});
