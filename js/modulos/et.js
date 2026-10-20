// ET-13 · Estacas
Academia.modulo('et',{
teoria:`<p>Quando o solo bom está fundo, a estaca leva a carga até lá. Ela resiste de dois jeitos: pela <b>ponta</b>, que se apoia na camada resistente, e pelo <b>atrito lateral</b>, o solo "abraçando" o fuste ao longo de todo o comprimento.</p>
<div class="cols"><div class="conceito"><h4>Resistência de ponta (Rp)</h4><p>Depende do solo na cota da ponta e da área da seção. Areias compactas dão muita ponta.</p></div>
<div class="conceito"><h4>Atrito lateral (Rl)</h4><p>Soma do atrito metro a metro. Depende do perímetro da estaca e da resistência de cada camada.</p></div>
<div class="conceito"><h4>Carga admissível</h4><p>A carga de ruptura dividida pelo fator de segurança. A NBR 6122 pede fator global 2 nos métodos semiempíricos.</p></div></div>
<h3>Aoki-Velloso (1975)</h3>
<div class="formula">Rp = K · Np / F1 · Ap        Rl = U · Σ (α · K · Nl / F2 · Δl)</div>
<p>K e α dependem do tipo de solo. F1 e F2 corrigem pelo tipo de estaca (escala e método executivo).</p>
<h3>Décourt-Quaresma (1978, revisado em 1996)</h3>
<div class="formula">Rp = α · C · Np · Ap        Rl = β · 10 · (Nl/3 + 1) · U · L</div>
<div class="formula">Np = média do N na ponta, logo acima e logo abaixo     Nl = média do N ao longo do fuste (3 ≤ N ≤ 50)</div>
<div class="formula">Carga admissível (Décourt): Rp/4 + Rl/1,3   e no máximo (Rp + Rl)/2</div>
<div class="dica"><b>Prática de projeto</b>Calcule por dois métodos e adote o menor valor. Confira também a carga estrutural da estaca, informada pelo fabricante, e faça prova de carga quando a norma exigir.</div>`,
exemplo:`<h3>Estaca pré-moldada Ø 30 cm com 10 m</h3><p>A sondagem mostra argila siltosa mole no topo, depois silte argiloso, silte arenoso e areia siltosa a partir de 10 m. Seção: Ap = 0,0707 m². Perímetro: U = 0,942 m.</p>
<ol class="passos"><li><b>Aoki-Velloso, ponta.</b> Areia siltosa (K = 0,80 MPa), N = 20 a 10 m: Rp = 800 × 20 / 1,75 × 0,0707 = <b>646 kN</b>.</li>
<li><b>Aoki-Velloso, atrito.</b> Somando os 10 metros de fuste camada por camada: Rl = <b>303 kN</b>. Carga admissível: (646 + 303) / 2 = <b>475 kN</b>.</li>
<li><b>Décourt-Quaresma, ponta.</b> Np = (17 + 20 + 24) / 3 = 20,3. C = 400 kPa (areia): Rp = 400 × 20,3 × 0,0707 = <b>575 kN</b>.</li>
<li><b>Décourt-Quaresma, atrito.</b> Nl = 7,6 (média de 1 a 8 m): Rl = 10 × (7,6/3 + 1) × 0,942 × 10 = <b>334 kN</b>. Carga admissível: 575/4 + 334/1,3 = <b>400 kN</b>.</li>
<li><b>Adotado.</b> O menor valor: <b>400 kN por estaca</b>. Um pilar de 1.000 kN precisa de 3 estacas.</li></ol>
<div class="dica"><b>Confira no simulador</b>O perfil e a estaca iniciais são os do exemplo.</div>`,
sim:{perfil:[['Argila siltosa',3],['Argila siltosa',4],['Argila siltosa',5],['Silte argiloso',6],['Silte argiloso',8],['Silte argiloso',9],['Silte arenoso',12],['Silte arenoso',14],['Silte arenoso',17],['Areia siltosa',20],['Areia siltosa',24],['Areia siltosa',30]].map(([solo,N])=>({solo,N})),
html(){return simWrap(sel('etT','Tipo de estaca',Object.entries(TIPOS_ESTACA).map(([k,t])=>[k,t.nome,k==='premoldada']))+sel('etD','Diâmetro',[20,25,30,35,40,50,60].map(d=>[d,'Ø '+d+' cm',d===30]))+rng('etL','Comprimento L',2,12,1,10,'m')+rng('etP','Carga do pilar',100,4000,50,1000,'kN','Para calcular quantas estacas o bloco precisa'),
  '<h3>Sondagem SPT</h3><div class="tbl-wrap alto"><table class="ed"><thead><tr><th>Prof.</th><th>Solo</th><th>N</th><th></th></tr></thead><tbody id="etBody"></tbody></table></div><div class="presets"><button class="chip" id="etAdd">+ 1 metro</button></div>')},
init(){const self=this;this.base=this.base||JSON.parse(JSON.stringify(this.perfil));$('etAdd').onclick=()=>{const l=self.perfil[self.perfil.length-1];self.perfil.push({solo:l.solo,N:Math.min(50,l.N+3)});self.tabela();self.update()};this.tabela()},
tabela(){const self=this,ops=Object.keys(SOLOS);$('etL').max=this.perfil.length;if(+$('etL').value>this.perfil.length)$('etL').value=this.perfil.length;outs();
  $('etBody').innerHTML=this.perfil.map((c,i)=>`<tr><td class="num">${i+1} m</td><td><select id="etS${i}" data-i="${i}" aria-label="Solo a ${i+1} m">${ops.map(o=>`<option${o===c.solo?' selected':''}>${o}</option>`).join('')}</select></td><td><input type="number" min="0" max="80" step="1" id="etN${i}" data-i="${i}" value="${c.N}" aria-label="N a ${i+1} m"></td><td>${this.perfil.length>3&&i===this.perfil.length-1?'<button class="rm" id="etRm" aria-label="Remover último metro">✕</button>':''}</td></tr>`).join('');
  $('etBody').querySelectorAll('select').forEach(s=>s.onchange=()=>{self.perfil[+s.dataset.i].solo=s.value;self.update()});
  $('etBody').querySelectorAll('input').forEach(s=>s.oninput=()=>{const v=parseFloat(s.value);if(!isNaN(v)){self.perfil[+s.dataset.i].N=Math.max(0,v);self.update()}});
  const rm=$('etRm');if(rm)rm.onclick=()=>{self.perfil.pop();self.tabela();self.update()}},
update(){const tp=$('etT').value,D=V_('etD'),L=V_('etL'),P=V_('etP'),r=calc.estaca(this.perfil,tp,D,L);
  if(r.erro){$('tiles').innerHTML=`<span class="pill alerta">${r.erro}</span>`;$('draw').innerHTML='';$('memorial').textContent=r.erro;return}
  const n=Math.ceil(P/r.Qadm-1e-9);
  $('tiles').innerHTML=tiles([['Aoki-Velloso',br(r.QA,0)+' kN'],['Décourt-Quaresma',br(r.QD,0)+' kN'],['Carga admissível',br(r.Qadm,0)+' kN',1],['Estacas no bloco',n+' estaca'+(n>1?'s':'')]])+`<span class="pill ok">Ponta em ${esc(this.perfil[L-1].solo.toLowerCase())} · N = ${this.perfil[L-1].N}</span>`;
  const nm=this.perfil.length,top=34,sz=Math.min(30,420/nm),x0=70,w=230,cor={argila:'soil-fill',silte:'amber-fill',areia:'steel-soft'};
  let s=T_('SONDAGEM SPT',30,18)+T(x0+w/2,top-8,'solo','muted','text-anchor="middle" font-size="10"')+T(450,top-8,'N (golpes)','muted','text-anchor="middle" font-size="10"');
  this.perfil.forEach((c,i)=>{const y=top+i*sz,g=SOLOS[c.solo].g;s+=`<rect x="${x0}" y="${y}" width="${w}" height="${sz}" style="fill:var(--${cor[g]});stroke:var(--line)"/>`+T(x0-8,y+sz/2+4,(i+1)+' m','muted','text-anchor="end" font-size="10"');
    if(i===0||c.solo!==this.perfil[i-1].solo)s+=T(x0+6,y+13,c.solo,'ink','font-size="10"');
    const bw=Math.min(50,c.N)/50*140;s+=`<rect x="380" y="${y+3}" width="${bw}" height="${sz-6}" style="fill:var(--steel)"/>`+T(384+bw,y+sz/2+4,c.N,'ink','font-size="10"')});
  for(const v of [0,25,50])s+=Ln(380+v/50*140,top,380+v/50*140,top+nm*sz,'grid')+T(380+v/50*140,top+nm*sz+14,v,'muted','text-anchor="middle" font-size="9"');
  const pw=Math.max(8,D/60*34),px=x0+w-48-pw/2;s+=`<rect x="${px}" y="${top-14}" width="${pw}" height="${L*sz+14}" style="fill:var(--ink);opacity:.85"/>`;
  const mx=Math.max(...r.fusteA);r.fusteA.forEach((f,i)=>{const a=6+16*f/mx,y=top+i*sz+sz/2;s+=Ln(px-a,y,px-2,y,'pos',2)+Ln(px+pw+2,y,px+pw+a,y,'pos',2)});
  s+=`<path d="M${px-6} ${top+L*sz+2} h${pw+12} l-${(pw+12)/2} 12z" style="fill:var(--amber)"/>`+T(px+pw/2,top+L*sz+28,'ponta '+L+' m','amber-ink','font-weight="600" text-anchor="middle"');
  s+=T(30,top+nm*sz+38,`Atrito lateral (setas verdes) e ponta (seta amarela) · ${TIPOS_ESTACA[tp].nome} Ø ${D} cm`,'muted','font-size="10"');
  $('draw').innerHTML=SVG(560,top+nm*sz+56,'Perfil de sondagem com a estaca',s);
  const t=TIPOS_ESTACA[tp],sp=SOLOS[this.perfil[L-1].solo];
  $('memorial').textContent=`Estaca ${t.nome} Ø ${D} cm · L = ${L} m · Ap = ${br(r.Ap,4)} m² · U = ${br(r.U,3)} m
AOKI-VELLOSO (F1 = ${br(t.F1,2)} · F2 = ${br(t.F2,2)})
  Rp = K·Np/F1·Ap = ${br(sp.K*1000,0)} × ${Math.min(50,this.perfil[L-1].N)} / ${br(t.F1,2)} × ${br(r.Ap,4)} = ${br(r.RpA,1)} kN
  Rl = U·Σ(α·K·N/F2·1 m) = ${br(r.RlA,1)} kN
  Qadm = (${br(r.RpA,1)} + ${br(r.RlA,1)}) / 2 = ${br(r.QA,1)} kN
DÉCOURT-QUARESMA (α = ${br(t.alfa[sp.g],2)} na ponta)
  Np = ${br(r.Np,2)} · C = ${r.C} kPa → Rp = ${br(t.alfa[sp.g],2)} × ${r.C} × ${br(r.Np,2)} × ${br(r.Ap,4)} = ${br(r.RpD,1)} kN
  Nl = ${br(r.Nl,2)} → Rl = Σ β·10·(Nl/3 + 1)·U·1 m = ${br(r.RlD,1)} kN
  Qadm = mín(Rp/4 + Rl/1,3 ; (Rp + Rl)/2) = ${br(r.QD,1)} kN
ADOTADO: ${br(r.Qadm,1)} kN por estaca · pilar de ${P} kN → ${n} estaca(s)
  Confira a carga estrutural da estaca no catálogo do fabricante.`;}}
});
