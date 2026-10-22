// LJ-09 · Lajes
Academia.modulo('lj',{
teoria:`<p>A laje é o piso. Ela recebe tudo o que está em cima (pessoas, móveis, contrapiso, piso) e entrega esse peso para as vigas em volta. Entender esse caminho da carga é o primeiro passo para dimensionar qualquer estrutura.</p>
<div class="cols"><div class="conceito"><h4>Laje maciça</h4><p>Placa de concreto armado cheia. Funciona bem em vãos médios e apoia nas quatro vigas.</p></div>
<div class="conceito"><h4>Laje treliçada</h4><p>Vigotas pré-moldadas com lajota ou EPS. Muito usada em casas. Trabalha numa direção só.</p></div>
<div class="conceito"><h4>Cargas (NBR 6120)</h4><p>Peso próprio (concreto: 25 kN/m³), revestimentos e a sobrecarga de uso, que depende do tipo de ambiente.</p></div></div>
<h3>Montando a carga total</h3>
<div class="formula">Peso próprio = 25 × h (h em m)     Ex.: laje de 10 cm → 2,5 kN/m²</div>
<div class="formula">p = peso próprio + revestimento + sobrecarga   (kN/m²)</div>
<h3>Uma ou duas direções?</h3>
<div class="formula">λ = ly / lx  (lado maior ÷ lado menor)     λ ≤ 2: armada em cruz · λ &gt; 2: armada em uma direção</div>
<h3>Método das charneiras (bordas iguais)</h3>
<p>Traçamos linhas a 45° saindo dos cantos. A laje fica dividida em 2 triângulos (lados curtos) e 2 trapézios (lados longos). Cada viga recebe o peso da área que está encostada nela.</p>
<div class="formula">Viga do lado curto: q = p · lx / 4     Viga do lado longo: q = p · (lx·ly/2 − lx²/4) / ly</div>
<div class="dica"><b>Na obra</b>Laje treliçada apoia só nas vigas perpendiculares às vigotas. Inverter o sentido das vigotas muda completamente a carga nas vigas.</div><h3>Momentos e armadura</h3><p>Com as reações nas vigas resolvidas, falta o aço da própria laje. Em lajes apoiadas nos quatro lados, a teoria de placas dá os momentos no centro: M = μ · p · lx². A calculadora <b>Momentos e armadura</b> usa a solução exata de Navier e escolhe bitola e espaçamento por metro.</p>`,
exemplo:`<h3>Sala de 4 × 5 m com laje maciça de 10 cm</h3><p>Uso residencial, com contrapiso e piso cerâmico.</p>
<ol class="passos"><li><b>Peso próprio.</b> 25 × 0,10 = <b>2,5 kN/m²</b>.</li>
<li><b>Revestimento.</b> Contrapiso + piso + reboco do teto ≈ <b>1,0 kN/m²</b>.</li>
<li><b>Sobrecarga.</b> Residencial (salas e quartos): <b>1,5 kN/m²</b>.</li>
<li><b>Carga total.</b> p = 2,5 + 1,0 + 1,5 = <b>5,0 kN/m²</b>. λ = 5/4 = 1,25 → armada em cruz.</li>
<li><b>Vigas de 4 m (lado curto).</b> q = 5,0 × 4 / 4 = <b>5,0 kN/m</b>.</li>
<li><b>Vigas de 5 m (lado longo).</b> Área do trapézio = 4 × 5/2 − 4²/4 = 6,0 m² → q = 5,0 × 6 / 5 = <b>6,0 kN/m</b>.</li>
<li><b>Conferência.</b> 2 × 5,0 × 4 + 2 × 6,0 × 5 = 100 kN = 5,0 × 20 m² ✓</li></ol>
<div class="dica"><b>Próximo passo</b>Essas cargas entram no módulo RM-01 para achar o momento das vigas.</div>`,
exemplos:[{"nivel": "facil", "titulo": "Laje quadrada de 3 × 3 m", "html": "<p>Laje maciça de 10 cm, revestimento de 1,0 kN/m² e uso residencial de 1,5 kN/m².</p><ol class=\"passos\"><li><b>Peso próprio.</b> 25 × 0,10 = <b>2,5 kN/m²</b>.</li><li><b>Carga total.</b> p = 2,5 + 1,0 + 1,5 = <b>5,0 kN/m²</b>.</li><li><b>λ = 1,0.</b> Laje armada em cruz.</li><li><b>Charneiras a 45°.</b> Cada viga recebe um triângulo de área 3 × 1,5 / 2 = 2,25 m². q = 5,0 × 2,25 / 3 = <b>3,75 kN/m</b> em todas as vigas.</li></ol>"}, {"nivel": "obra", "titulo": "Laje de corredor de 3 × 7 m", "html": "<p>Mesma laje de 10 cm (p = 5,0 kN/m²), agora num corredor de 3 × 7 m.</p><ol class=\"passos\"><li><b>Relação dos lados.</b> λ = 7 / 3 = <b>2,33</b> &gt; 2 → laje armada em <b>uma direção</b>. A armadura principal vence os 3 m.</li><li><b>Vigas curtas (3 m).</b> Triângulos: q = <b>3,75 kN/m</b>.</li><li><b>Vigas longas (7 m).</b> Trapézios de área (7 + 4) / 2 × 1,5 = 8,25 m². q = 5,0 × 8,25 / 7 = <b>5,89 kN/m</b>.</li><li><b>Consequência.</b> As vigas longas recebem 57% mais carga por metro e têm vão maior. São elas que pedem mais altura.</li></ol><div class=\"dica\"><b>Na obra</b>Em laje armada numa direção, confira se a armadura principal foi colocada no sentido do menor vão. Invertida, a laje fissura e deforma.</div>"}],
obra:{"intro": "A laje é a peça que mais sofre com escoramento mal feito e desforma apressada. A maior parte das flechas e trincas em lajes nasce na obra, e não no projeto.", "erros": [["Escoramento sem contraventamento", "Escoras soltas ou apoiadas em solo mole cedem durante a concretagem."], ["Desforma antes do tempo", "Retirar as escoras cedo provoca flecha permanente e fissuras."], ["Armadura negativa pisoteada", "O aço de cima desce durante o lançamento e perde a função sobre as vigas."], ["Laje treliçada sem contraflecha", "Vãos maiores sem contraflecha ficam visivelmente \"barrigudos\"."]], "checklist": ["Escoras aprumadas, contraventadas e apoiadas em base firme (tábua ou calço)", "Contraflecha conferida em lajes treliçadas conforme o fabricante ou projeto", "Tubulações elétricas e hidráulicas passadas antes da concretagem, sem cortar nervuras", "Armadura negativa sobre caranguejos, com caminhos de tábua para circulação", "Espessura da capa conferida com gabarito durante o lançamento", "Cura por molhagem nos primeiros 7 dias", "Retirada das escoras só no prazo do projeto e sem retirar todas de uma vez"], "dica": "Deixe algumas escoras de reescoramento no meio dos vãos depois da desforma. Elas protegem a laje enquanto ela ainda recebe as cargas da obra."},
extras:[{nome:'Momentos e armadura',
html:()=>`<p class="nota">Laje maciça apoiada nos quatro lados. Em cruz, os momentos vêm da solução exata da teoria de placas (série de Navier, ν = 0,2). Com λ &gt; 2, a laje é calculada como uma faixa de 1 m.</p>`+simWrap(`<div class="row">${rng('lmA','Lado 1',2,8,0.05,4,'m')}${rng('lmB','Lado 2',2,8,0.05,5,'m')}</div>`+rng('lmH','Espessura h',7,20,0.5,10,'cm')+rng('lmG','Revestimento e contrapiso',0.5,3,0.1,1,'kN/m²')+rng('lmQ','Sobrecarga de uso',1,5,0.5,1.5,'kN/m²','NBR 6120: 1,5 em residências')+sel('lmF','Concreto',[[20,'C20'],[25,'C25',1],[30,'C30']])),
update(){const r=calc.lajeMomentos(V_('lmA'),V_('lmB'),V_('lmH'),V_('lmG'),V_('lmQ'),+$('lmF').value),h=V_('lmH');
  const tx=a=>a.inviavel?'aumente h':a.esc?`φ ${br(a.esc.f,a.esc.f%1?1:0)} c/ ${a.esc.s}`:'—';
  $('tiles').innerHTML=tiles([['λ = ly / lx',br(r.lam,2)+(r.uma?' (uma direção)':' (em cruz)')],['Mx / My',br(r.Mx,2)+' / '+(r.uma?'—':br(r.My,2))+' kN·m/m'],['Armadura no vão menor',tx(r.ax),1],[r.uma?'Distribuição':'Armadura no vão maior',tx(r.ay),1]])+`<span class="pill ${r.okF?'ok':'alerta'}">Flecha estimada ${br(r.wt,1)} mm ${r.okF?'≤':'>'} L/250 = ${br(r.lim,1)} mm</span>`;
  const sc=Math.min(300/r.ly,200/r.lx),W=r.ly*sc,H=r.lx*sc,ox=60,oy=40;
  let s=T_('PLANTA · ARMADURA POSITIVA (ESQUEMA)',ox,18)+`<rect x="${ox}" y="${oy}" width="${W}" height="${H}" style="fill:var(--grid);stroke:var(--ink);stroke-width:3"/>`;
  if(!r.ax.inviavel){const n=Math.min(16,Math.floor(100*r.ly/r.ax.esc.s));for(let i=1;i<n;i++){const x=ox+W*i/n;s+=Ln(x,oy+6,x,oy+H-6,'steel',1.2)}}
  if(r.ay&&r.ay.esc){const n=Math.min(12,Math.floor(100*r.lx/r.ay.esc.s));for(let i=1;i<n;i++){const y=oy+H*i/n;s+=Ln(ox+6,y,ox+W-6,y,'amber',1,'opacity=".8"')}}
  s+=T(ox+W/2,oy+H+18,'ly = '+br(r.ly,2)+' m','muted','text-anchor="middle" font-size="10"')+T(ox-8,oy+H/2,'lx = '+br(r.lx,2),'muted','text-anchor="end" font-size="10"');
  s+=T(ox+W+20,oy+20,'— '+tx(r.ax)+' (vence lx)','steel','font-size="11" font-weight="600"')+(r.ay&&r.ay.esc?T(ox+W+20,oy+40,'— '+tx(r.ay)+(r.uma?' (distribuição)':' (vence ly)'),'amber-ink','font-size="11" font-weight="600"'):'');
  s+=usoBarras([['Flecha (com fluência) / L/250',r.wt/r.lim,br(r.wt,1)+' de '+br(r.lim,1)+' mm']],ox+W+20,oy+80,Math.max(140,560-ox-W-20));
  $('draw').innerHTML=SVG(640,oy+H+40,'Planta da laje com a armadura positiva',s);
  const ar=(n,a,M)=>a.inviavel?`${n}: Md = ${br(1.4*M,2)} kN·m/m → espessura insuficiente`:`${n}: Md = ${br(a.Md/100,2)} kN·m/m · d = ${br(a.d,1)} cm · x/d = ${br(a.xd,3)} · As = ${br(a.As,2)} cm²/m (mín ${br(a.Asmin,2)}) → ${tx(a)} (${br(a.esc.area,2)} cm²/m)`;
  $('memorial').textContent=`lx = ${br(r.lx,2)} m · ly = ${br(r.ly,2)} m · λ = ${br(r.lam,3)} · h = ${h} cm
1) p = 25 × ${br(h/100,3)} + ${br(V_('lmG'),2)} + ${br(V_('lmQ'),2)} = ${br(r.p,2)} kN/m²
2) ${r.uma?`λ > 2: faixa de 1 m biapoiada → Mx = p·lx²/8 = ${br(r.Mx,3)} kN·m/m`:`Navier (4 bordas apoiadas, ν = 0,2): Mx = ${br(r.Mx/(r.p*r.lx*r.lx),4)} · p·lx² = ${br(r.Mx,3)} · My = ${br(r.My/(r.p*r.lx*r.lx),4)} · p·lx² = ${br(r.My,3)} kN·m/m`}
3) ${ar('Vão menor',r.ax,r.Mx)}
4) ${r.uma?`Distribuição: máx(20% de As ; 0,9 cm²/m ; 0,5 ρmín) = ${br(r.ay.Asf,2)} cm²/m → ${tx(r.ay)}`:ar('Vão maior (2ª camada)',r.ay,r.My)}
5) Flecha: Ecs = ${br(r.Ecs,0)} MPa · carga quase permanente g + 0,3q = ${br(r.ps,2)} kN/m² → imediata ${br(r.wi,2)} mm × 2,32 (fluência) = ${br(r.wt,2)} mm ${r.okF?'≤':'>'} ${br(r.lim,1)} mm
   Estimativa sem fissuração. Bordas engastadas e lajes contínuas pedem tabelas (Bares/Czerny) e armadura negativa.`;}}],
sim:{nome:'Cargas nas vigas',html:()=>simWrap(rng('lX','Lado menor lx',2,8,0.1,4,'m')+rng('lY','Lado maior ly',2,12,0.1,5,'m')+rng('lH','Espessura h',8,20,1,10,'cm')+rng('lR','Revestimento',0.5,2.5,0.1,1,'kN/m²','Contrapiso, piso, reboco do teto')+sel('lS','Uso (sobrecarga)',[[1.5,'Residencial: salas e quartos (1,5 kN/m²)',1],[2.5,'Escritórios (2,5 kN/m²)'],[3,'Corredores e escadas de uso comum (3,0 kN/m²)'],[1,'Cobertura só com manutenção (1,0 kN/m²)']],'Valores usuais. Confira a tabela da NBR 6120.')),
update(){const r=calc.laje(V_('lX'),V_('lY'),V_('lH'),V_('lR'),V_('lS'));
$('tiles').innerHTML=tiles([['Carga total p',br(r.p)+' kN/m²'],['λ = ly/lx',br(r.lam)],['Vigas lado curto',br(r.qc)+' kN/m',1],['Vigas lado longo',br(r.ql)+' kN/m',1]])+(r.umaDir?'<span class="pill alerta">λ &gt; 2 · laje armada em uma direção</span>':'<span class="pill ok">λ ≤ 2 · laje armada em cruz</span>')+(V_('lH')<r.hs?` <span class="pill alerta">Espessura abaixo de ${r.hs} cm (lx/40)</span>`:'');
const sc=Math.min(440/r.ly,230/r.lx),W=r.ly*sc,H=r.lx*sc,ox=100+(440-W)/2,oy=50,c=H/2;
const P=(pts,cl)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" style="fill:var(--${cl});stroke:var(--ink);stroke-width:1"/>`;
let s=T(30,20,'PLANTA · LINHAS DE CHARNEIRA A 45°','muted','font-size="10" letter-spacing="1"');
s+=P([[ox,oy],[ox+c,oy+c],[ox,oy+H]],'amber-fill')+P([[ox+W,oy],[ox+W-c,oy+c],[ox+W,oy+H]],'amber-fill');
s+=P([[ox,oy],[ox+W,oy],[ox+W-c,oy+c],[ox+c,oy+c]],'steel-soft')+P([[ox,oy+H],[ox+W,oy+H],[ox+W-c,oy+c],[ox+c,oy+c]],'steel-soft');
s+=`<rect x="${ox}" y="${oy}" width="${W}" height="${H}" style="fill:none;stroke:var(--ink);stroke-width:5"/>`;
s+=T(ox+W/2,oy-12,br(r.ql)+' kN/m','steel','text-anchor="middle" font-weight="600"')+T(ox+W/2,oy+H+22,br(r.ql)+' kN/m','steel','text-anchor="middle" font-weight="600"');
s+=T(ox-10,oy+H/2+4,br(r.qc)+' kN/m','amber-ink','text-anchor="end" font-weight="600"')+T(ox+W+10,oy+H/2+4,br(r.qc)+' kN/m','amber-ink','font-weight="600"');
s+=T(ox+W/2,oy+H+42,`ly = ${br(r.ly)} m · lx = ${br(r.lx)} m · p = ${br(r.p)} kN/m²`,'muted','text-anchor="middle"');
$('draw').innerHTML=SVG(640,oy+H+56,'Planta da laje com charneiras e cargas nas vigas',s);
$('memorial').textContent=`1) Peso próprio = 25 × ${br(V_('lH')/100)} = ${br(r.pp)} kN/m²
2) p = ${br(r.pp)} + ${br(V_('lR'))} + ${br(V_('lS'))} = ${br(r.p)} kN/m²
3) λ = ${br(r.ly)} / ${br(r.lx)} = ${br(r.lam)} → ${r.umaDir?'armada em uma direção':'armada em cruz'}
4) Triângulo (lado curto): A = lx²/4 = ${br(r.At,3)} m² → q = p·A/lx = ${br(r.qc)} kN/m
5) Trapézio (lado longo): A = lx·ly/2 − lx²/4 = ${br(r.Atr,3)} m² → q = p·A/ly = ${br(r.ql)} kN/m
6) Conferência: 2×${br(r.qc)}×${br(r.lx)} + 2×${br(r.ql)}×${br(r.ly)} = ${br(2*r.qc*r.lx+2*r.ql*r.ly)} kN = p × área = ${br(r.total)} kN
7) Espessura de pré-dimensionamento ≈ lx/40 = ${r.hs} cm`;}}
});
