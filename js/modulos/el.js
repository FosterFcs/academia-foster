// EL-16 · Instalações Elétricas
Academia.modulo('el',{
teoria:`<p>O projeto elétrico residencial segue uma sequência: prever as cargas de cada cômodo, dividir em circuitos, escolher a seção do fio e o disjuntor de cada circuito.</p>
<div class="cols"><div class="conceito"><h4>Previsão de cargas</h4><p>A NBR 5410 define o mínimo de iluminação e de tomadas (TUG) por cômodo, a partir da área e do perímetro.</p></div>
<div class="conceito"><h4>TUG e TUE</h4><p>Tomada de uso geral (TUG) é para aparelhos portáteis. Tomada de uso específico (TUE) é para chuveiro, ar-condicionado e outros equipamentos fixos com circuito próprio.</p></div>
<div class="conceito"><h4>Disjuntor</h4><p>Protege o fio. A regra é Ib ≤ In ≤ Iz: a corrente do circuito, a do disjuntor e a capacidade do fio.</p></div></div>
<h3>Previsão mínima (NBR 5410)</h3>
<div class="formula">Iluminação: até 6 m² → 100 VA · acima disso, +60 VA a cada 4 m² inteiros</div>
<div class="formula">TUG: cozinha e serviço 1 a cada 3,5 m de perímetro · sala e quarto 1 a cada 5 m · banheiro 1 junto ao lavatório</div>
<div class="formula">Potência: banheiro, cozinha e serviço 600 VA nas 3 primeiras e 100 VA nas demais · outros cômodos 100 VA</div>
<h3>Dimensionamento do circuito</h3>
<div class="formula">Ib = P / V     Iz = capacidade do fio × fator de agrupamento     Ib ≤ In ≤ Iz</div>
<div class="formula">Queda de tensão: ΔV% = 200 · L · Ib / (56 · S · V) ≤ 4%     Seção mínima: 1,5 mm² iluminação · 2,5 mm² tomadas</div>
<div class="dica"><b>Segurança</b>DR (dispositivo diferencial residual) de 30 mA é obrigatório nos circuitos de áreas molhadas e tomadas externas. Ele protege as pessoas contra choque; o disjuntor protege o fio.</div>`,
exemplo:`<h3>Circuito do chuveiro de 5.500 W em 220 V</h3><p>Comprimento de 12 m até o quadro, fio isolado em eletroduto embutido na alvenaria (método B1), sem outros circuitos no mesmo eletroduto.</p>
<ol class="passos"><li><b>Corrente.</b> Ib = 5500 / 220 = <b>25 A</b>.</li>
<li><b>Disjuntor.</b> O padrão logo acima de 25 A é o próprio <b>25 A</b>.</li>
<li><b>Fio de 2,5 mm².</b> Aguenta 24 A: menor que o disjuntor. Não serve.</li>
<li><b>Fio de 4 mm².</b> Aguenta 32 A ≥ 25 A ✓. Queda: 200 × 12 × 25 / (56 × 4 × 220) = <b>1,22%</b> ≤ 4% ✓</li>
<li><b>Resultado.</b> Fio <b>4 mm²</b> com disjuntor de <b>25 A</b>, mais DR de 30 mA por ser área molhada.</li></ol>
<div class="dica"><b>Previsão do exemplo</b>Uma cozinha de 9 m² com 12 m de perímetro leva 100 VA de iluminação e 4 tomadas (12 / 3,5 = 3,4 → 4): 3 × 600 + 100 = 1.900 VA.</div>`,
sim:{comodos:[['Sala','sala',16,16],['Cozinha','cozinha',9,12],['Dormitório 1','dormitorio',12,14],['Dormitório 2','dormitorio',9,12],['Banheiro','banheiro',3.6,7.6],['Área de serviço','servico',4,8],['Varanda','varanda',4,8]].map(([n,t,a,p])=>({n,t,a,p})),
circ:[['Iluminação','ilum',880,127,18],['TUG sala, quartos e varanda','tug',1100,127,20],['TUG cozinha','tug',1900,127,10],['TUG serviço e banheiro','tug',2400,127,12],['Chuveiro','tue',5500,220,12]].map(([n,t,P,V,L])=>({n,t,P,V,L})),
TIPOS:[['sala','Sala'],['dormitorio','Dormitório'],['cozinha','Cozinha / copa'],['servico','Área de serviço'],['banheiro','Banheiro'],['varanda','Varanda'],['outro','Outro cômodo']],
html(){return `<div class="sim"><div class="ctrl">${rng('elG','Circuitos no mesmo eletroduto',1,9,1,3,'','Fator de agrupamento da NBR 5410 (método B1)')}<div id="tiles"></div></div><div class="draw" id="draw"></div></div>
<h3>Previsão de cargas por cômodo</h3><div class="tbl-wrap"><table class="ed"><thead><tr><th>Cômodo</th><th>Tipo</th><th>Área (m²)</th><th>Perímetro (m)</th><th>Iluminação</th><th>TUG</th><th>TUG (VA)</th><th></th></tr></thead><tbody id="elR"></tbody></table></div><div class="presets"><button class="chip" id="elRA">+ Cômodo</button></div>
<h3>Circuitos</h3><div class="tbl-wrap"><table class="ed"><thead><tr><th>Circuito</th><th>Tipo</th><th>Potência (VA)</th><th>Tensão</th><th>Comp. (m)</th><th>Ib</th><th>Fio</th><th>Disjuntor</th><th>Queda</th><th></th></tr></thead><tbody id="elC"></tbody></table></div><div class="presets"><button class="chip" id="elCA">+ Circuito</button></div>
<h3>Memorial de cálculo</h3><div class="memorial" id="memorial"></div>`},
init(){const self=this;$('elRA').onclick=()=>{self.comodos.push({n:'Novo cômodo',t:'outro',a:6,p:10});self.tabelas();self.update()};$('elCA').onclick=()=>{self.circ.push({n:'Novo circuito',t:'tug',P:1000,V:127,L:10});self.tabelas();self.update()};this.tabelas()},
tabelas(){const self=this;
  $('elR').innerHTML=this.comodos.map((c,i)=>`<tr><td><input type="text" id="elRn${i}" data-r="${i}" data-k="n" value="${esc(c.n)}" style="min-width:110px;font-family:var(--f-body)" aria-label="Nome do cômodo"></td><td><select id="elRt${i}" data-r="${i}" data-k="t" aria-label="Tipo de ${esc(c.n)}">${this.TIPOS.map(([k,t])=>`<option value="${k}"${k===c.t?' selected':''}>${t}</option>`).join('')}</select></td><td><input type="number" step="0.1" min="0.5" id="elRa${i}" data-r="${i}" data-k="a" value="${c.a}" aria-label="Área"></td><td><input type="number" step="0.1" min="1" id="elRp${i}" data-r="${i}" data-k="p" value="${c.p}" aria-label="Perímetro"></td><td class="num" id="elRi${i}"></td><td class="num" id="elRq${i}"></td><td class="num" id="elRv${i}"></td><td>${this.comodos.length>1?`<button class="rm" data-rr="${i}" aria-label="Remover cômodo">✕</button>`:''}</td></tr>`).join('')+'<tr><td colspan="4"><b>Total</b></td><td class="num" id="elTi"></td><td class="num" id="elTq"></td><td class="num" id="elTv"></td><td></td></tr>';
  $('elC').innerHTML=this.circ.map((c,i)=>`<tr><td><input type="text" id="elCn${i}" data-c="${i}" data-k="n" value="${esc(c.n)}" style="min-width:130px;font-family:var(--f-body)" aria-label="Nome do circuito"></td><td><select id="elCt${i}" data-c="${i}" data-k="t" aria-label="Tipo do circuito"><option value="ilum"${c.t==='ilum'?' selected':''}>Iluminação</option><option value="tug"${c.t==='tug'?' selected':''}>TUG</option><option value="tue"${c.t==='tue'?' selected':''}>TUE</option></select></td><td><input type="number" step="10" min="10" id="elCP${i}" data-c="${i}" data-k="P" value="${c.P}" aria-label="Potência"></td><td><select id="elCV${i}" data-c="${i}" data-k="V" aria-label="Tensão"><option value="127"${c.V==127?' selected':''}>127 V</option><option value="220"${c.V==220?' selected':''}>220 V</option></select></td><td><input type="number" step="1" min="1" id="elCL${i}" data-c="${i}" data-k="L" value="${c.L}" aria-label="Comprimento"></td><td class="num" id="elCi${i}"></td><td class="num" id="elCs${i}"></td><td class="num" id="elCd${i}"></td><td class="num" id="elCq${i}"></td><td>${this.circ.length>1?`<button class="rm" data-rc="${i}" aria-label="Remover circuito">✕</button>`:''}</td></tr>`).join('');
  document.querySelectorAll('#elR [data-k],#elC [data-k]').forEach(e=>{e[e.tagName==='SELECT'?'onchange':'oninput']=()=>{const L=e.dataset.r!==undefined?self.comodos[+e.dataset.r]:self.circ[+e.dataset.c],k=e.dataset.k;
    if(k==='n'||k==='t')L[k]=e.value;else{const v=parseFloat(e.value);if(!isNaN(v)&&v>0)L[k]=v}self.update()}});
  document.querySelectorAll('[data-rr]').forEach(b=>b.onclick=()=>{self.comodos.splice(+b.dataset.rr,1);self.tabelas();self.update()});
  document.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{self.circ.splice(+b.dataset.rc,1);self.tabelas();self.update()})},
update(){const G=V_('elG');let ti=0,tq=0,tv=0;
  this.comodos.forEach((c,i)=>{const il=calc.ilum(c.a),t=calc.tugs(c.t,c.a,c.p);ti+=il;tq+=t.n;tv+=t.va;$('elRi'+i).textContent=il+' VA';$('elRq'+i).textContent=t.n;$('elRv'+i).textContent=t.va+' VA'});
  $('elTi').textContent=ti+' VA';$('elTq').textContent=tq;$('elTv').textContent=tv+' VA';
  const rs=this.circ.map(c=>calc.circuito(c.P,c.V,c.L,c.t,G));let ruim=0;
  rs.forEach((r,i)=>{$('elCi'+i).textContent=br(r.Ib,1)+' A';$('elCs'+i).textContent=r.ok?br(r.S,1).replace(',0','')+' mm²':'—';$('elCd'+i).textContent=r.ok?r.In+' A':'—';$('elCq'+i).innerHTML=r.ok?br(r.dv,2)+'%':'<span class="pill alerta">não atende</span>';if(!r.ok)ruim++});
  const tot=this.circ.reduce((s,c)=>s+c.P,0);
  $('tiles').innerHTML=tiles([['Iluminação prevista',br(ti,0)+' VA'],['TUG previstas',tq+' · '+br(tv,0)+' VA'],['Potência dos circuitos',br(tot,0)+' VA',1],['Circuitos',this.circ.length]])+(ruim?`<span class="pill alerta">${ruim} circuito(s) sem solução</span>`:'<span class="pill ok">Todos os circuitos atendem</span>')+(this.circ.filter(c=>c.t!=='tue').reduce((s,c)=>s+c.P,0)<ti+tv?' <span class="pill alerta">Circuitos com menos carga que a previsão</span>':'');
  const rh=34,top=34;let s=T_('QUADRO DE DISTRIBUIÇÃO · QUEDA DE TENSÃO',20,18);
  s+=Ln(330,top-6,330,top+rs.length*rh,'grid')+T(330,top+rs.length*rh+14,'0%','muted','text-anchor="middle" font-size="9"')+Ln(570,top-6,570,top+rs.length*rh,'neg',1.5,'stroke-dasharray="4 3"')+T(570,top+rs.length*rh+14,'4% (limite)','neg','text-anchor="middle" font-size="9"');
  rs.forEach((r,i)=>{const y=top+i*rh,c=this.circ[i];s+=`<rect x="20" y="${y}" width="22" height="${rh-8}" style="fill:var(--${r.ok?'ink':'neg'})"/>`+T(31,y+17,r.ok?r.In:'!','sheet','text-anchor="middle" font-size="10" font-weight="600"');
    s+=T(50,y+11,'C'+(i+1)+' '+(c.n.length>26?c.n.slice(0,25)+'…':c.n),'ink','font-size="11" font-weight="600"')+T(50,y+24,r.ok?`${br(r.Ib,1)} A · ${br(r.S,1).replace(',0','')} mm² · ${c.V} V · ${r.crit}`:r.erro.slice(0,40),'muted','font-size="9"');
    if(r.ok){const w=240*Math.min(1,r.dv/4);s+=`<rect x="330" y="${y+4}" width="${w}" height="${rh-16}" style="fill:var(--${r.dv>3?'amber':'pos'})"/>`+T(336+w,y+16,br(r.dv,2)+'%','ink','font-size="10"')}});
  $('draw').innerHTML=SVG(640,top+rs.length*rh+24,'Quadro de distribuição com queda de tensão por circuito',s);
  $('memorial').textContent=`PREVISÃO DE CARGAS: iluminação ${br(ti,0)} VA · ${tq} TUG = ${br(tv,0)} VA
Fator de agrupamento (${G} circuito${G>1?'s':''} no eletroduto) = ${br(FAGRUP[Math.min(G,9)],2)} · método B1, cobre/PVC
${this.circ.map((c,i)=>{const r=rs[i];return r.ok?`C${i+1} ${c.n}: Ib = ${c.P}/${c.V} = ${br(r.Ib,2)} A → disjuntor ${r.In} A · fio ${br(r.S,1)} mm² (Iz = ${br(CAPB1[r.S],1)} × ${br(r.fa,2)} = ${br(r.Iz,1)} A)
   ΔV = 200 × ${c.L} × ${br(r.Ib,2)} / (56 × ${br(r.S,1)} × ${c.V}) = ${br(r.dv,2)}% · critério: ${r.crit}`:`C${i+1} ${c.n}: ${r.erro}`}).join('\n')}
Use DR de 30 mA nos circuitos de áreas molhadas e tomadas externas.`;}}
});
