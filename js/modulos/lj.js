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
<div class="dica"><b>Na obra</b>Laje treliçada apoia só nas vigas perpendiculares às vigotas. Inverter o sentido das vigotas muda completamente a carga nas vigas.</div>`,
exemplo:`<h3>Sala de 4 × 5 m com laje maciça de 10 cm</h3><p>Uso residencial, com contrapiso e piso cerâmico.</p>
<ol class="passos"><li><b>Peso próprio.</b> 25 × 0,10 = <b>2,5 kN/m²</b>.</li>
<li><b>Revestimento.</b> Contrapiso + piso + reboco do teto ≈ <b>1,0 kN/m²</b>.</li>
<li><b>Sobrecarga.</b> Residencial (salas e quartos): <b>1,5 kN/m²</b>.</li>
<li><b>Carga total.</b> p = 2,5 + 1,0 + 1,5 = <b>5,0 kN/m²</b>. λ = 5/4 = 1,25 → armada em cruz.</li>
<li><b>Vigas de 4 m (lado curto).</b> q = 5,0 × 4 / 4 = <b>5,0 kN/m</b>.</li>
<li><b>Vigas de 5 m (lado longo).</b> Área do trapézio = 4 × 5/2 − 4²/4 = 6,0 m² → q = 5,0 × 6 / 5 = <b>6,0 kN/m</b>.</li>
<li><b>Conferência.</b> 2 × 5,0 × 4 + 2 × 6,0 × 5 = 100 kN = 5,0 × 20 m² ✓</li></ol>
<div class="dica"><b>Próximo passo</b>Essas cargas entram no módulo RM-01 para achar o momento das vigas.</div>`,
sim:{html:()=>simWrap(rng('lX','Lado menor lx',2,8,0.1,4,'m')+rng('lY','Lado maior ly',2,12,0.1,5,'m')+rng('lH','Espessura h',8,20,1,10,'cm')+rng('lR','Revestimento',0.5,2.5,0.1,1,'kN/m²','Contrapiso, piso, reboco do teto')+sel('lS','Uso (sobrecarga)',[[1.5,'Residencial: salas e quartos (1,5 kN/m²)',1],[2.5,'Escritórios (2,5 kN/m²)'],[3,'Corredores e escadas de uso comum (3,0 kN/m²)'],[1,'Cobertura só com manutenção (1,0 kN/m²)']],'Valores usuais. Confira a tabela da NBR 6120.')),
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
