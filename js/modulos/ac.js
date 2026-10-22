// AC-17 · Estruturas de Aço
Academia.modulo('ac',{
teoria:`<p>O aço resiste muito tanto à tração quanto à compressão, e por isso vence vãos grandes com pouco peso. O desafio em vigas de aço não é o material romper: é a peça <b>perder estabilidade</b>, torcendo ou enrugando antes de usar toda a sua resistência.</p>
<div class="cols"><div class="conceito"><h4>Perfil I (W)</h4><p>Mesas largas afastadas do centro dão muita inércia com pouco aço. É o formato mais eficiente para vigas.</p></div>
<div class="conceito"><h4>Flambagem local</h4><p>Partes finas da seção (mesa ou alma) enrugam sob compressão. Na NBR 8800 são as verificações FLM e FLA.</p></div>
<div class="conceito"><h4>Flambagem lateral (FLT)</h4><p>A viga sem travamento lateral tomba e torce. É a verificação que mais derruba vigas longas.</p></div></div>
<h3>Momento resistente (NBR 8800, perfis I compactos)</h3>
<div class="formula">Mpl = Zx · fy     MRd = MRk / 1,10     MRd ≤ 1,5 · Wx · fy / 1,10</div>
<div class="formula">FLT: λ = Lb / ry     λp = 1,76 √(E/fy)     Mr = (fy − σr) · Wx,  com σr = 0,3 fy</div>
<div class="formula">λ ≤ λp: MRk = Mpl     λp &lt; λ ≤ λr: interpolação linear × Cb     λ &gt; λr: MRk = Mcr</div>
<div class="formula">Mcr = Cb · π² E Iy / Lb² · √[ Cw/Iy · (1 + 0,039 · J · Lb² / Cw) ]</div>
<h3>Cortante e flecha</h3>
<div class="formula">VRd = 0,6 · d · tw · fy / 1,10   (alma compacta)     Flecha de piso ≤ L/350</div>
<div class="dica"><b>Travar é mais barato que aumentar o perfil</b>Ligar a mesa comprimida à laje ou a vigas secundárias reduz Lb e pode multiplicar a resistência. Vigas de cobertura sem travamento são as mais vulneráveis.</div>`,
exemplo:`<h3>Viga W 310 × 32,7 com 6 m de vão</h3><p>Aço ASTM A572 Grau 50 (fy = 345 MPa). Cargas: permanente 5 kN/m e variável 3 kN/m, mais o peso próprio do perfil (0,32 kN/m).</p>
<ol class="passos"><li><b>Carga de cálculo.</b> qd = 1,4 × (5 + 0,32) + 1,5 × 3 = <b>11,9 kN/m</b>. Msd = 11,9 × 6² / 8 = <b>53,8 kN·m</b>.</li>
<li><b>Sem travamento (Lb = 6 m, Cb = 1,14).</b> λ = 600 / 2,16 = 278, maior que λr = 129. Vale Mcr = 39,2 kN·m → MRd = <b>35,6 kN·m</b> &lt; 53,8 ✗ A viga tomba.</li>
<li><b>Travando a cada 2 m (Cb = 1,0).</b> λ = 200 / 2,16 = 92,8, entre λp = 42,4 e λr = 129. Interpolando, MRd = <b>114 kN·m</b> ≥ 53,8 ✓</li>
<li><b>Cortante.</b> Vsd = 35,8 kN ≤ VRd = 389 kN ✓</li>
<li><b>Flecha.</b> 1,10 cm ≤ L/350 = 1,71 cm ✓ O mesmo perfil passa ou falha só pelo travamento.</li></ol>
<div class="dica"><b>Confira no simulador</b>Comece com Lb = 6 m e depois reduza para 2 m.</div>`,
sim:{html:()=>simWrap(sel('acP','Perfil',Object.keys(PERFIS_W).map(k=>[k,k,k==='W 310 x 32,7']))+sel('acA','Aço',[[345,'ASTM A572 Gr. 50 (fy 345 MPa)',1],[250,'ASTM A36 / MR250 (fy 250 MPa)']])+rng('acL','Vão L',2,12,0.5,6,'m')+rng('acG','Carga permanente g',0,30,0.5,5,'kN/m','Laje, revestimento, alvenaria')+rng('acQ','Carga variável q',0,30,0.5,3,'kN/m','Uso')+rng('acB','Distância entre travamentos Lb',0.5,12,0.5,6,'m','Pontos onde a mesa comprimida está presa')+sel('acC','Fator Cb',[[1,'1,00 (conservador)'],[1.14,'1,14 (biapoiada, carga distribuída, sem travamento no meio)',1],[1.3,'1,30']])),
update(){const nome=$('acP').value,L=V_('acL'),Lb=Math.min(V_('acB'),L),r=calc.vigaAco(nome,V_('acA'),L,V_('acG'),V_('acQ'),Lb,V_('acC')),P=r.P;
  const ok=r.okM&&r.okV&&r.okF;
  $('tiles').innerHTML=tiles([['Msd',br(r.Msd/100,1)+' kN·m'],['MRd',br(r.MRd/100,1)+' kN·m',1],['Governa',r.gov],['Flecha',br(r.flecha,2)+' / '+br(r.lim,2)+' cm']])+`<span class="pill ${ok?'ok':'alerta'}">${ok?'Perfil atende':'Perfil não atende'}</span>`+(r.FLA.esbelta?' <span class="pill alerta">Alma esbelta: fora do escopo</span>':'');
  const sc=Math.min(180/P.d,140/P.bf),ox=40,oy=30,D=P.d*sc,B=P.bf*sc,tf=Math.max(2,P.tf*sc),tw=Math.max(2,P.tw*sc);
  let s=T_('SEÇÃO',ox,18)+`<path d="M${ox} ${oy} h${B} v${tf} h${-(B-tw)/2} v${D-2*tf} h${(B-tw)/2} v${tf} h${-B} v${-tf} h${(B-tw)/2} v${-(D-2*tf)} h${-(B-tw)/2}z" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:1.5"/>`;
  s+=T(ox+B/2,oy+D+18,'bf = '+br(P.bf*10,0)+' mm','muted','text-anchor="middle" font-size="10"')+T(ox+B+8,oy+D/2,'d = '+br(P.d*10,0),'muted','font-size="10"')+T(ox,oy+D+36,br(P.massa,1)+' kg/m','muted','font-size="10"');
  const vx=220,vw=380,vy=70;s+=T_('ELEVAÇÃO · TRAVAMENTOS',vx,18)+`<rect x="${vx}" y="${vy}" width="${vw}" height="10" style="fill:var(--ink)"/>`+`<path d="M${vx} ${vy+10} l-8 14 h16z" style="fill:none;stroke:var(--ink)"/><path d="M${vx+vw} ${vy+10} l-8 14 h16z" style="fill:none;stroke:var(--ink)"/>`;
  const nt=Math.round(L/Lb);for(let i=0;i<=nt;i++){const x=vx+vw*Math.min(1,i*Lb/L);s+=Ln(x,vy-14,x,vy-2,'amber',3)+`<circle cx="${x}" cy="${vy-16}" r="3" style="fill:var(--amber)"/>`}
  s+=T(vx+vw/2,vy+44,`L = ${br(L,1)} m · Lb = ${br(Lb,1)} m`,'muted','text-anchor="middle" font-size="10"');
  s+=usoBarras([['Flexão (Msd / MRd)',r.Msd/r.MRd,`governa ${r.gov}`],['Cortante (Vsd / VRd)',r.Vsd/r.VRd,br(r.Vsd,1)+' de '+br(r.VRd,0)+' kN'],['Flecha (δ / L/350)',r.flecha/r.lim,br(r.flecha,2)+' de '+br(r.lim,2)+' cm']],vx,130,vw);
  $('draw').innerHTML=SVG(640,320,'Seção do perfil, travamentos e verificações',s);
  const lin=(n,o)=>`${n}: λ = ${br(o.l,1)} · λp = ${br(o.lp,1)} · λr = ${br(o.lr,1)} → MRk = ${br(o.M/100,1)} kN·m`;
  $('memorial').textContent=`${nome} · A = ${br(P.A,1)} cm² · Ix = ${br(P.Ix,0)} cm⁴ · Wx = ${br(P.Wx,1)} cm³ · Zx = ${br(P.Zx,1)} cm³ · ry = ${br(P.ry,2)} cm
   (propriedades da geometria nominal, sem os raios de concordância)
1) qd = 1,4 × (${br(V_('acG'),1)} + ${br(r.pp,2)}) + 1,5 × ${br(V_('acQ'),1)} = ${br(r.qd,2)} kN/m → Msd = ${br(r.Msd/100,2)} kN·m · Vsd = ${br(r.Vsd,2)} kN
2) Mpl = Zx · fy = ${br(r.Mpl/100,1)} kN·m · Mr = (fy − 0,3fy) · Wx = ${br(r.Mr/100,1)} kN·m
3) ${lin('FLA (alma)',r.FLA)}
4) ${lin('FLM (mesa)',r.FLM)}
5) ${lin('FLT (Lb = '+br(Lb,1)+' m, Cb = '+br(V_('acC'),2)+')',r.FLT)}
6) MRd = mín(MRk ; 1,5 Wx fy) / 1,10 = ${br(r.MRd/100,1)} kN·m ${r.okM?'≥':'<'} Msd ${r.okM?'✓':'✗'}
7) VRd = ${br(r.VRd,1)} kN ${r.okV?'≥':'<'} Vsd ${r.okV?'✓':'✗'}
8) Flecha (g + q) = ${br(r.flecha,2)} cm ${r.okF?'≤':'>'} L/350 = ${br(r.lim,2)} cm ${r.okF?'✓':'✗'}`;}}
});
