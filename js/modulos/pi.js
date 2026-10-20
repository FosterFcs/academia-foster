// PI-14 · Pilares
Academia.modulo('pi',{
teoria:`<p>O pilar leva a carga das vigas até a fundação. Parece que ele só é comprimido, mas qualquer pequena excentricidade faz o pilar flexionar. Se ele for esbelto, essa flexão cresce com a deformação: é o <b>efeito de segunda ordem</b>.</p>
<div class="cols"><div class="conceito"><h4>Esbeltez (λ)</h4><p>λ = 3,46 · le / h para seção retangular. Quanto mais alto e fino, maior o λ.</p></div>
<div class="conceito"><h4>Momento mínimo</h4><p>A norma sempre considera uma excentricidade mínima: M1d,mín = Nd · (0,015 + 0,03 · h), com h em metros.</p></div>
<div class="conceito"><h4>2ª ordem</h4><p>Para λ acima de λ1 (35 no pilar intermediário), soma-se o momento de 2ª ordem pelo pilar-padrão com curvatura aproximada.</p></div></div>
<h3>Roteiro de cálculo</h3>
<div class="formula">Nd = γn · 1,4 · Nk     γn = 1,95 − 0,05·b  para b &lt; 19 cm</div>
<div class="formula">ν = Nd / (Ac · fcd)     1/r = 0,005 / [h · (ν + 0,5)] ≤ 0,005 / h</div>
<div class="formula">M2d = Nd · le² / 10 · (1/r)     Md,tot = M1d,mín + M2d</div>
<div class="formula">As,mín = 0,15·Nd/fyd ≥ 0,4% Ac     As,máx = 4% Ac (8% na emenda)</div>
<div class="dica"><b>Detalhe que salva obra</b>Estribo segura as barras para elas não flambarem. Espaçamento máximo: o menor entre 20 cm, a menor dimensão do pilar e 12 vezes o diâmetro da barra (CA-50).</div>`,
exemplo:`<h3>Pilar 20 × 40 com Nk = 800 kN e le = 2,80 m</h3><p>Concreto C25, aço CA-50. Pilar intermediário, sem momentos de primeira ordem nas extremidades.</p>
<ol class="passos"><li><b>Esforço de cálculo.</b> b = 20 cm, então γn = 1: Nd = 1,4 × 800 = <b>1.120 kN</b>. ν = 1120 / (800 × 1,786) = 0,78.</li>
<li><b>Direção do lado de 20 cm.</b> λ = 3,46 × 280 / 20 = <b>48,4</b> &gt; 35: tem 2ª ordem. M1d,mín = 1120 × (1,5 + 0,03 × 20) = 2.352 kN·cm.</li>
<li><b>Curvatura.</b> 1/r = 0,005 / (20 × 1,28) = 1,95 × 10⁻⁴ cm⁻¹. M2d = 1120 × 280² / 10 × 1,95 × 10⁻⁴ = <b>1.710 kN·cm</b>.</li>
<li><b>Momento total.</b> Md = 2.352 + 1.710 = <b>4.062 kN·cm</b> (40,6 kN·m). Na outra direção, λ = 24,2 e vale só o momento mínimo.</li>
<li><b>Armadura.</b> Pelo diagrama parábola-retângulo, a seção precisa de As = <b>12,8 cm²</b> → <b>8 φ 16 mm</b> (16,1 cm², ρ = 2,0%). Estribos φ 5 a cada 19 cm.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
sim:{html:()=>simWrap(rng('piB','Lado b',14,60,1,20,'cm')+rng('piH','Lado h',14,100,1,40,'cm')+sel('piF','Concreto',[[20,'C20'],[25,'C25',1],[30,'C30'],[35,'C35'],[40,'C40'],[45,'C45'],[50,'C50']])+rng('piN','Carga Nk',50,4000,10,800,'kN','Valor característico')+rng('piL','Comprimento de flambagem le',150,600,10,280,'cm','Pé-direito entre lajes')),
update(){const b=V_('piB'),h=V_('piH'),fck=V_('piF'),Nk=V_('piN'),le=V_('piL'),r=calc.pilar(b,h,fck,Nk,le);
  if(r.erro){$('tiles').innerHTML=tiles([['Nd',br(r.Nd,0)+' kN'],['λ máx.',br(r.lamMax,1)],['ν',br(r.nu,2)],['As','—',1]])+`<span class="pill alerta">${r.erro}</span>`;$('draw').innerHTML='';$('memorial').textContent=r.erro;return}
  $('tiles').innerHTML=tiles([['Nd',br(r.Nd,0)+' kN'],['λ máx.',br(r.lamMax,1)],['As necessária',br(r.As)+' cm²',1],['Armadura',r.bar?`${r.bar.n} φ ${br(r.bar.f,r.bar.f%1?1:0)} mm`:'—']])+(r.lamMax>35?'<span class="pill alerta">λ &gt; 35 · com efeito de 2ª ordem</span>':'<span class="pill ok">λ ≤ 35 · sem 2ª ordem</span>')+` <span class="pill ok">ρ = ${br(r.rho,2)}%</span>`;
  const sc=Math.min(260/h,200/b,8),W=b*sc,H=h*sc,ox=40,oy=30;let s=`<rect x="${ox}" y="${oy}" width="${W}" height="${H}" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:2"/><rect x="${ox+3*sc}" y="${oy+3*sc}" width="${W-6*sc}" height="${H-6*sc}" style="fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:3 2"/>`;
  if(r.bar){const pf=r.bar.n/2,rr=Math.max(3,r.bar.f/20*sc),cx=[ox+3.5*sc+rr/2,ox+W-3.5*sc-rr/2];for(let k=0;k<pf;k++){const y=oy+3.5*sc+rr/2+(pf>1?k*(H-7*sc-rr)/(pf-1):0);cx.forEach(x=>{s+=`<circle cx="${x}" cy="${y}" r="${rr}" style="fill:var(--amber);stroke:var(--ink)"/>`})}}
  s+=Ln(ox,oy+H+14,ox+W,oy+H+14,'muted')+T(ox+W/2,oy+H+28,'b = '+b+' cm','muted','text-anchor="middle"')+Ln(ox+W+12,oy,ox+W+12,oy+H,'muted')+T(ox+W+16,oy+H/2,'h = '+h,'muted');
  const tx=Math.max(ox+W+70,250);s+=T(tx,40,'VERIFICAÇÃO POR DIREÇÃO','muted','font-size="10" letter-spacing="1"');
  r.dx.forEach((q,i)=>{const y=64+i*92,pct=Math.min(1,q.Md/q.MRd);s+=T(tx,y,'Flexão na direção '+q.nome,'ink','font-weight="600"')+T(tx,y+18,`λ = ${br(q.lam,1)} · M1d,mín = ${br(q.M1/100,1)} · M2d = ${br(q.M2/100,1)} kN·m`,'muted','font-size="10"');
    s+=`<rect x="${tx}" y="${y+28}" width="260" height="12" style="fill:var(--grid)"/><rect x="${tx}" y="${y+28}" width="${260*pct}" height="12" style="fill:var(--${pct>0.999?'amber':'pos'})"/>`+T(tx,y+56,`Md = ${br(q.Md/100,1)} kN·m de ${br(q.MRd/100,1)} kN·m resistentes (${br(100*pct,0)}%)`,'ink','font-size="10"')});
  s+=T(tx,250,`Estribos φ ${br(r.estribo.f,1)} a cada ${r.estribo.s} cm`,'steel','font-weight="600"');
  $('draw').innerHTML=SVG(640,Math.max(280,oy+H+40),'Seção do pilar e verificação por direção',s);
  $('memorial').textContent=`1) γn = ${br(r.gn,2)} → Nd = ${br(r.gn,2)} × 1,4 × ${Nk} = ${br(r.Nd,1)} kN · ν = Nd/(Ac·fcd) = ${br(r.nu,3)}
${r.dx.map((q,i)=>`${i+2}) Direção ${q.nome}: λ = 3,46 × ${le}/${q.hd} = ${br(q.lam,1)}
   M1d,mín = Nd × (1,5 + 0,03 × ${q.hd}) = ${br(q.M1,0)} kN·cm
   ${q.lam>35?`1/r = 0,005/[${q.hd} × (${br(r.nu,3)} + 0,5)] → M2d = Nd·le²/10·(1/r) = ${br(q.M2,0)} kN·cm`:'λ ≤ 35: sem efeito de 2ª ordem'}
   Md,tot = ${br(q.Md,0)} kN·cm ≤ MRd = ${br(q.MRd,0)} kN·cm ✓`).join('\n')}
4) As,mín = máx(0,15·Nd/fyd ; 0,4%·Ac) = ${br(r.Asmin)} cm² · As,máx = ${br(r.Asmax)} cm²
5) As necessária = ${br(r.As)} cm² (diagrama parábola-retângulo, armadura simétrica nas duas faces)
6) Adotado: ${r.bar.n} φ ${br(r.bar.f,1)} mm = ${br(r.bar.area)} cm² · estribos φ ${br(r.estribo.f,1)} c/${r.estribo.s} cm
   Pilar intermediário com momento mínimo (αb = 1, λ1 = 35). Pilares de canto e extremidade exigem os momentos de 1ª ordem.`;}}
});
