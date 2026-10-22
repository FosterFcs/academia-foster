// MD-18 · Estruturas de Madeira
Academia.modulo('md',{
teoria:`<p>A madeira é leve, resistente e renovável, mas o comportamento muda com a <b>umidade</b> e com o <b>tempo de carga</b>. Uma viga que aguenta um peso por minutos pode não aguentar o mesmo peso por anos. A NBR 7190 cuida disso com o coeficiente k<sub>mod</sub>.</p>
<div class="cols"><div class="conceito"><h4>Classes de resistência</h4><p>Coníferas (pinus, eucalipto de reflorestamento leve) e dicotiledôneas (madeiras duras, como peroba e ipê), de C20 a C60.</p></div>
<div class="conceito"><h4>kmod</h4><p>Produto de três fatores: duração da carga (k1), umidade do ambiente (k2) e qualidade da peça (k3).</p></div>
<div class="conceito"><h4>Flecha</h4><p>Muitas vezes é a flecha, e não a resistência, que define a seção de caibros e terças.</p></div></div>
<h3>Verificações (NBR 7190, método da edição de 1997)</h3>
<div class="formula">kmod = k1 · k2 · k3     k1: longa duração 0,70 · k2: classe de umidade 1 e 2 = 1,0 · k3: 2ª categoria 0,8</div>
<div class="formula">fcd = kmod · fc0,k / 1,4     fvd = kmod · fv,k / 1,8     Ec,ef = kmod · Ec0,m</div>
<div class="formula">Flexão: σ = Md / W ≤ fcd     Cisalhamento: τ = 1,5 · Vd / (b·h) ≤ fvd     Flecha (g + 0,2q) ≤ L/200</div>
<div class="dica"><b>Norma em transição</b>A NBR 7190 foi revisada em 2022, com novas classes e coeficientes. Aqui usamos o método de 1997, que ainda é o mais ensinado. Em projeto, confira a edição vigente.</div>`,
exemplo:`<h3>Terça de dicotiledônea C30, seção 6 × 12 cm</h3><p>Vão de 3 m, terças espaçadas a cada 60 cm. Telhado com 0,8 kN/m² de carga permanente (telha cerâmica e madeiramento) e 0,25 kN/m² de variável.</p>
<ol class="passos"><li><b>kmod.</b> 0,70 × 1,0 × 0,8 = <b>0,56</b>. fcd = 0,56 × 30 / 1,4 = <b>12,0 MPa</b>.</li>
<li><b>Carga na terça.</b> Permanente 0,8 × 0,6 + peso próprio 0,06 = 0,54 kN/m. Variável 0,25 × 0,6 = 0,15 kN/m. Fd = 1,4 × 0,69 = <b>0,96 kN/m</b>.</li>
<li><b>Flexão.</b> Md = 0,96 × 3² / 8 = 1,08 kN·m. W = 6 × 12² / 6 = 144 cm³. σ = <b>7,5 MPa</b> ≤ 12,0 ✓</li>
<li><b>Cisalhamento.</b> τ = 0,30 MPa ≤ fvd = 1,56 MPa ✓</li>
<li><b>Flecha.</b> Com Ec,ef = 8.120 MPa, δ = <b>8,5 mm</b> ≤ L/200 = 15 mm ✓</li></ol>
<div class="dica"><b>Confira no simulador</b>Troque para conífera C20 e veja a flecha passar do limite.</div>`,
sim:{html:()=>simWrap(sel('mdC','Madeira',Object.keys(MADEIRAS).map(k=>[k,k,k==='Dicotiledônea C30']))+`<div class="row">${rng('mdB','Largura b',3,20,0.5,6,'cm')}${rng('mdH','Altura h',5,30,0.5,12,'cm')}</div>`+rng('mdL','Vão L',1,6,0.1,3,'m')+rng('mdS','Espaçamento entre peças',0.3,2,0.05,0.6,'m')+rng('mdG','Carga permanente',0.1,3,0.05,0.8,'kN/m²','Telha, madeiramento, forro')+rng('mdQ','Carga variável',0,3,0.05,0.25,'kN/m²','Manutenção, sobrecarga')+sel('mdK1','Duração da carga (k1)',[[0.6,'Permanente (0,60)'],[0.7,'Longa duração (0,70)',1],[0.8,'Média duração (0,80)'],[0.9,'Curta duração (0,90)']])+sel('mdK2','Umidade do ambiente (k2)',[[1,'Classes 1 e 2: ambiente seco a normal (1,0)',1],[0.8,'Classes 3 e 4: úmido (0,8)']])+sel('mdK3','Qualidade da madeira (k3)',[[0.8,'Segunda categoria (0,8)',1],[1,'Primeira categoria, classificada (1,0)']])),
update(){const cls=$('mdC').value,b=V_('mdB'),h=V_('mdH'),L=V_('mdL'),r=calc.vigaMadeira(cls,b,h,L,V_('mdS'),V_('mdG'),V_('mdQ'),V_('mdK1'),V_('mdK2'),V_('mdK3')),ok=r.okM&&r.okV&&r.okF;
  $('tiles').innerHTML=tiles([['kmod',br(r.kmod,2)],['σ / fcd',br(r.sig,1)+' / '+br(r.fcd,1)+' MPa',1],['τ / fvd',br(r.tau,2)+' / '+br(r.fvd,2)+' MPa'],['Flecha',br(r.flecha,1)+' / '+br(r.lim,1)+' mm',1]])+`<span class="pill ${ok?'ok':'alerta'}">${ok?'Peça atende':'Peça não atende'}</span>`;
  const sc=Math.min(150/h,110/b,8),W=b*sc,H=h*sc,ox=40,oy=34;
  let s=T_('SEÇÃO',ox,18)+`<rect x="${ox}" y="${oy}" width="${W}" height="${H}" style="fill:var(--soil-fill);stroke:var(--soil);stroke-width:2"/>`;for(let i=1;i<5;i++)s+=`<path d="M${ox+2} ${oy+i*H/5} q${W/2} ${-6} ${W-4} 0" style="fill:none;stroke:var(--soil);stroke-width:.8;opacity:.7"/>`;
  s+=T(ox+W/2,oy+H+16,b+' cm','muted','text-anchor="middle" font-size="10"')+T(ox+W+6,oy+H/2,h+' cm','muted','font-size="10"');
  s+=usoBarras([['Flexão (σ / fcd)',r.sig/r.fcd,br(r.sig,2)+' de '+br(r.fcd,2)+' MPa'],['Cisalhamento (τ / fvd)',r.tau/r.fvd,br(r.tau,2)+' de '+br(r.fvd,2)+' MPa'],['Flecha (δ / L/200)',r.flecha/r.lim,br(r.flecha,1)+' de '+br(r.lim,1)+' mm']],220,40,380);
  $('draw').innerHTML=SVG(640,230,'Seção da peça de madeira e verificações',s);
  $('memorial').textContent=`${cls} · b × h = ${b} × ${h} cm · W = ${br(r.W,1)} cm³ · I = ${br(r.I,0)} cm⁴
1) kmod = ${br(V_('mdK1'),2)} × ${br(V_('mdK2'),2)} × ${br(V_('mdK3'),2)} = ${br(r.kmod,3)}
2) fcd = ${br(r.kmod,3)} × ${MADEIRAS[cls].fc} / 1,4 = ${br(r.fcd,2)} MPa · fvd = ${br(r.fvd,2)} MPa · Ec,ef = ${br(r.Eef,0)} MPa
3) Cargas na peça: permanente ${br(r.gl,3)} kN/m (com peso próprio ${br(r.pp,3)}) · variável ${br(r.ql,3)} kN/m
4) Fd = 1,4 × (${br(r.gl,3)} + ${br(r.ql,3)}) = ${br(r.Fd,3)} kN/m → Md = ${br(r.Md,3)} kN·m · Vd = ${br(r.Vd,3)} kN
5) σ = Md / W = ${br(r.sig,2)} MPa ${r.okM?'≤':'>'} fcd ${r.okM?'✓':'✗'}
6) τ = 1,5 Vd / (b·h) = ${br(r.tau,3)} MPa ${r.okV?'≤':'>'} fvd ${r.okV?'✓':'✗'}
7) Flecha com g + 0,2q = ${br(r.qs,3)} kN/m: δ = ${br(r.flecha,2)} mm ${r.okF?'≤':'>'} L/200 = ${br(r.lim,1)} mm ${r.okF?'✓':'✗'}
   Método da NBR 7190:1997. A edição de 2022 muda classes e coeficientes.`;}}
});
