// EG-15 · Esgoto Sanitário
Academia.modulo('eg',{
teoria:`<p>O esgoto predial funciona por gravidade. Cada aparelho tem um "peso" chamado <b>Unidade Hunter de Contribuição (UHC)</b>, que representa quanto e com que frequência ele despeja água. Somando as UHC, achamos o diâmetro de cada tubo.</p>
<div class="cols"><div class="conceito"><h4>Ramal de descarga</h4><p>O tubo que sai de cada aparelho. A bacia sanitária pede DN 100; lavatório e chuveiro, DN 40.</p></div>
<div class="conceito"><h4>Tubo de queda</h4><p>A prumada vertical que desce recolhendo todos os andares. É dimensionado pela soma das UHC.</p></div>
<div class="conceito"><h4>Coletor predial</h4><p>O trecho horizontal até a rede pública. Diâmetro mínimo DN 100 e declividade mínima de 1% (2% para DN 75 ou menor).</p></div></div>
<h3>Algumas UHC da NBR 8160</h3>
<div class="formula">Bacia sanitária 6 (DN 100) · Chuveiro 2 (DN 40) · Lavatório 1 (DN 40) · Pia de cozinha 3 (DN 50)</div>
<div class="formula">Tanque 3 (DN 40) · Máquina de lavar roupa 3 (DN 50) · Máquina de lavar louça 2 (DN 50)</div>
<h3>Ventilação e inspeção</h3><p>Todo tubo de queda deve ser prolongado acima da cobertura (ventilação primária), para o ar entrar e o fecho hídrico dos sifões não ser sugado. Caixas de inspeção ficam a no máximo 25 m umas das outras.</p>
<div class="dica"><b>Cheiro de esgoto no banheiro</b>Quase sempre é falta de ventilação ou caixa sifonada sem fecho hídrico. Ralo seco também deixa o gás passar.</div>`,
exemplo:`<h3>Prédio de 8 andares com 4 apartamentos por andar</h3><p>Cada apartamento tem: bacia, chuveiro, lavatório, pia de cozinha, tanque e máquina de lavar roupa. Todos descem pelo mesmo tubo de queda.</p>
<ol class="passos"><li><b>UHC por apartamento.</b> 6 + 2 + 1 + 3 + 3 + 3 = <b>18 UHC</b>.</li>
<li><b>Por andar e total.</b> 18 × 4 = 72 UHC por andar. 72 × 8 = <b>576 UHC</b> no tubo de queda.</li>
<li><b>Tubo de queda.</b> Prédio com mais de 3 pavimentos: DN 100 aceita até 500 UHC (não serve). DN 150 aceita 1.900 no total e 330 por andar → <b>DN 150</b>.</li>
<li><b>Coletor predial a 1%.</b> DN 100 aceita 216 UHC (não serve). DN 150 aceita 840 → <b>DN 150</b>.</li>
<li><b>Ramal da caixa sifonada.</b> Chuveiro + lavatório = 3 UHC → <b>DN 50</b>, que é o mínimo de saída da caixa sifonada.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
sim:{html:()=>simWrap(Object.entries(APARELHOS).map(([k,[u,dn,n]])=>rng('eg_'+k,n+' ('+u+' UHC)',0,3,1,['bacia','chuveiro','lavatorio','pia','tanque','maqroupa'].includes(k)?1:0,'un')).join('')+rng('egU','Unidades por andar',1,8,1,4,'un')+rng('egP','Pavimentos atendidos',1,20,1,8,'')+sel('egD','Declividade do coletor',[[0.5,'0,5% (só DN 150 ou maior)'],[1,'1%',1],[2,'2%'],[4,'4%']])),
update(){const ap={};Object.keys(APARELHOS).forEach(k=>ap[k]=V_('eg_'+k));const U=V_('egU'),P=V_('egP'),d=V_('egD'),r=calc.esgoto(ap,U,P,d);
  $('tiles').innerHTML=tiles([['UHC por unidade',r.uUn],['UHC no tubo de queda',r.uTot],['Tubo de queda',r.tq?'DN '+r.tq:'acima de DN 300',1],['Coletor predial',r.col?'DN '+r.col:'acima de DN 400',1]])+(r.uUn===0?'<span class="pill alerta">Nenhum aparelho escolhido</span>':'')+(!r.bacia&&r.uUn?' <span class="pill ok">Sem bacia: tubo de queda pode ser menor que DN 100</span>':'');
  const fl=Math.min(P,10),fh=24,top=30,x=150;let s=T_('ESQUEMA VERTICAL',30,18);
  for(let i=0;i<fl;i++){const y=top+i*fh;s+=`<rect x="60" y="${y}" width="240" height="${fh}" style="fill:${i%2?'var(--paper)':'var(--sheet)'};stroke:var(--line)"/>`+T(66,y+16,(P>10&&i===0?P:P-i)+'º','muted','font-size="10"');
    s+=Ln(x+20,y+fh-6,x+90,y+fh-2,'steel',1.5)+`<rect x="${x+20}" y="${y+fh-12}" width="12" height="7" style="fill:var(--steel)"/>`}
  if(P>10)s+=T(180,top+fh*0.5+4,'⋮ '+(P-9)+' andares','muted','text-anchor="middle" font-size="10"');
  const by=top+fl*fh;s+=Ln(x+90,top-18,x+90,by+30,'ink',5)+T(x+96,top-8,'ventilação acima do telhado','muted','font-size="9"');
  s+=Ln(x+90,by+30,560,by+30+410*d/100*4,'ink',5)+`<rect x="560" y="${by+18}" width="36" height="36" style="fill:none;stroke:var(--ink);stroke-width:2"/>`+T(578,by+68,'CI','ink','text-anchor="middle" font-size="10"');
  s+=T(x+100,by-6,r.tq?'TQ DN '+r.tq:'TQ > 300','amber-ink','font-weight="600"')+T(340,by+22+410*d/100*2,(r.col?'Coletor DN '+r.col:'Coletor > 400')+' · i = '+br(d,1).replace(',0','')+'%','amber-ink','font-weight="600"');
  s+=T(330,top+10,'RAMAIS DE DESCARGA','muted','font-size="10" letter-spacing="1"');let yy=top+28;Object.entries(APARELHOS).forEach(([k,[u,dn,n]])=>{if(!ap[k])return;s+=T(330,yy,`${ap[k]}× ${n}`,'ink','font-size="10"')+T(600,yy,'DN '+dn,'steel','text-anchor="end" font-size="10" font-weight="600"');yy+=16});
  if(r.ramal)s+=T(330,yy+6,'Saída da caixa sifonada','ink','font-size="10"')+T(600,yy+6,'DN '+r.ramal,'steel','text-anchor="end" font-size="10" font-weight="600"');
  $('draw').innerHTML=SVG(640,Math.max(by+80,yy+30),'Esquema vertical do esgoto do prédio',s);
  $('memorial').textContent=`1) UHC por unidade = ${Object.entries(APARELHOS).filter(([k])=>ap[k]).map(([k,[u,,n]])=>`${ap[k]}×${u} (${n.toLowerCase()})`).join(' + ')||'0'} = ${r.uUn}
2) UHC por andar = ${r.uUn} × ${U} = ${r.uPav} · UHC total = ${r.uPav} × ${P} = ${r.uTot}
3) Tubo de queda (${P<=3?'prédio de até 3 pavimentos':'mais de 3 pavimentos: confere total e por andar'})${r.bacia?', mínimo DN 100 por causa da bacia':''} → ${r.tq?'DN '+r.tq:'acima da tabela'}
4) Coletor predial com i = ${br(d,1)}% → ${r.col?'DN '+r.col:'acima da tabela'} (mínimo DN 100)
5) Ramal da caixa sifonada: ${r.uCx} UHC → ${r.ramal?'DN '+r.ramal:'—'}
6) Ventilação primária: prolongar o tubo de queda 30 cm acima do telhado (2 m em terraço utilizável).
   Valores das tabelas da NBR 8160. Confira as tabelas da edição vigente no projeto final.`;}}
});
