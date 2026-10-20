// OR-08 · Orçamento de Obras
Academia.modulo('or',{
teoria:`<p>Orçar é descobrir quanto custa cada serviço por unidade (m², m³, un) e depois somar tudo. A base é a <b>composição de custo unitário</b>: a lista de insumos que um serviço consome.</p>
<div class="cols"><div class="conceito"><h4>Composição</h4><p>Insumo × coeficiente × preço. Ex.: para 1 m² de alvenaria, 13 blocos, 0,85 h de pedreiro e assim por diante.</p></div>
<div class="conceito"><h4>SINAPI</h4><p>Sistema de referência de custos mantido pela Caixa e pelo IBGE. Obrigatório como referência em obras com recurso federal.</p></div>
<div class="conceito"><h4>BDI</h4><p>Benefícios e Despesas Indiretas: administração central, seguros, riscos, impostos e lucro, em % sobre o custo direto.</p></div></div>
<h3>Fórmulas</h3>
<div class="formula">Custo unitário = Σ (coeficiente × preço do insumo)</div>
<div class="formula">Preço de venda = Custo direto × (1 + BDI)</div>
<div class="formula">BDI (TCU) = [(1 + AC + S + R + G)·(1 + DF)·(1 + L) / (1 − I)] − 1</div>
<div class="dica"><b>Valores de exemplo</b>Os preços do simulador são ilustrativos. Use sempre a tabela SINAPI ou cotação do seu estado e mês de referência.</div>`,
exemplo:`<h3>1 m² de alvenaria de bloco cerâmico</h3><p>Composição simplificada com preços de exemplo.</p>
<ol class="passos"><li><b>Bloco cerâmico.</b> 13 un × R$ 3,10 = R$ 40,30</li><li><b>Argamassa.</b> 0,012 m³ × R$ 520,00 = R$ 6,24</li>
<li><b>Pedreiro.</b> 0,85 h × R$ 32,00 = R$ 27,20</li><li><b>Servente.</b> 0,85 h × R$ 24,00 = R$ 20,40</li>
<li><b>Custo unitário.</b> R$ 94,14/m². Com BDI de 25%: 94,14 × 1,25 = <b>R$ 117,68/m²</b>. Para 100 m²: <b>R$ 11.767,50</b>.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
sim:{itens:[{n:'Bloco cerâmico 14×19×39',u:'un',coef:13,preco:3.10},{n:'Argamassa de assentamento',u:'m³',coef:0.012,preco:520},{n:'Pedreiro (com encargos)',u:'h',coef:0.85,preco:32},{n:'Servente (com encargos)',u:'h',coef:0.85,preco:24}],
html(){return simWrap(rng('oB','BDI',0,40,0.5,25,'%')+rng('oQ','Quantidade de serviço',1,500,1,100,'m²'),'<div class="tbl-wrap"><table class="ed"><thead><tr><th>Insumo</th><th>Un</th><th>Coef.</th><th>Preço (R$)</th><th>Subtotal</th></tr></thead><tbody id="orBody"></tbody></table></div>')},
init(){const self=this;$('orBody').innerHTML=this.itens.map((it,i)=>`<tr><td>${it.n}</td><td>${it.u}</td><td><input type="number" step="0.001" id="orC${i}" value="${it.coef}" aria-label="Coeficiente de ${it.n}"></td><td><input type="number" step="0.01" id="orP${i}" value="${it.preco}" aria-label="Preço de ${it.n}"></td><td class="num" id="orS${i}"></td></tr>`).join('');
$('orBody').querySelectorAll('input').forEach(inp=>inp.oninput=()=>{const i=+inp.id.slice(3);self.itens[i][inp.id[2]==='C'?'coef':'preco']=parseFloat(inp.value.replace(',','.'))||0;self.update()})},
update(){const bdi=V_('oB'),qtd=V_('oQ'),r=calc.orcamento(this.itens,bdi,qtd);
r.linhas.forEach((l,i)=>{$('orS'+i).textContent=R$(l.sub)});
$('tiles').innerHTML=tiles([['Custo unitário',R$(r.cu)+'/m²'],['Preço c/ BDI',R$(r.pu)+'/m²',1],['BDI em R$',R$(r.pu-r.cu)+'/m²'],['Total',R$(r.total)]]);
const cores=['amber','steel','pos','water'];let s=T(30,20,'COMPOSIÇÃO DO PREÇO UNITÁRIO','muted','font-size="10" letter-spacing="1"'),xx=30;const tot=r.pu||1;
r.linhas.forEach((l,i)=>{const w=580*l.sub/tot;s+=`<rect x="${xx}" y="36" width="${w}" height="36" style="fill:var(--${cores[i%4]});opacity:.85"/>`;xx+=w});
s+=`<rect x="${xx}" y="36" width="${580*(r.pu-r.cu)/tot}" height="36" style="fill:var(--neg);opacity:.75"/>`;
[...r.linhas.map((l,i)=>[l.n,l.sub,cores[i%4]]),['BDI ('+br(bdi,1)+'%)',r.pu-r.cu,'neg']].forEach(([n,v,c],i)=>{const y=100+i*26;s+=`<rect x="30" y="${y-11}" width="12" height="12" style="fill:var(--${c})"/>`+T(50,y,n,'ink')+T(470,y,R$(v),'ink','text-anchor="end"')+T(590,y,br(100*v/tot,1)+'%','muted','text-anchor="end"')});
$('draw').innerHTML=SVG(640,100+26*(r.linhas.length+1),'Participação de cada insumo no preço',s);
let m='';r.linhas.forEach(l=>{m+=`${l.n.padEnd(28)} ${br(l.coef,3).padStart(8)} ${l.u.padEnd(3)} × ${R$(l.preco).padStart(12)} = ${R$(l.sub).padStart(12)}\n`});
m+=`${'Custo unitário'.padEnd(28)} ${''.padStart(31)}= ${R$(r.cu).padStart(12)}\nPreço = ${R$(r.cu)} × (1 + ${br(bdi,1)}%) = ${R$(r.pu)}/m²\nTotal = ${R$(r.pu)} × ${qtd} m² = ${R$(r.total)}`;$('memorial').textContent=m;}}
});
