// CG-21 · Cargas nas Estruturas (NBR 6120 / NBR 8681)
Academia.modulo('cg',{
teoria:`<p>Antes de calcular qualquer viga, laje ou pilar, alguém precisa responder: <b>quanto peso essa peça vai carregar?</b> Errar a carga é errar tudo o que vem depois. A NBR 6120 dá os pesos dos materiais e as sobrecargas de uso, e a NBR 8681 diz como somar tudo com segurança.</p>
<figure class="fig"><svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono,ui-monospace,monospace" font-size="11" role="img" aria-label="Camadas de carga sobre uma laje: peso próprio, revestimento, paredes e uso">
<rect x="60" y="150" width="380" height="22" style="fill:var(--line);stroke:var(--ink);stroke-width:1.5"/><text x="455" y="165" style="fill:var(--ink)" font-size="10">laje (peso próprio)</text>
<rect x="60" y="138" width="380" height="12" style="fill:var(--soil-fill);stroke:var(--ink);stroke-width:1"/><text x="455" y="148" style="fill:var(--ink)" font-size="10">contrapiso e piso</text>
<rect x="110" y="70" width="14" height="68" style="fill:var(--neg-fill);stroke:var(--neg);stroke-width:1.5"/><text x="130" y="82" style="fill:var(--neg)" font-size="10">parede</text>
<circle cx="300" cy="96" r="9" style="fill:var(--steel)"/><rect x="292" y="106" width="16" height="32" rx="5" style="fill:var(--steel)"/><circle cx="345" cy="100" r="8" style="fill:var(--steel)"/><rect x="338" y="109" width="14" height="29" rx="5" style="fill:var(--steel)"/>
<text x="285" y="78" style="fill:var(--steel)" font-size="10">uso (pessoas, móveis)</text>
<path d="M70 190 L70 178 M430 190 L430 178" style="stroke:var(--ink);stroke-width:1.5"/><text x="250" y="200" style="fill:var(--muted)" text-anchor="middle" font-size="10">tudo isso desce para vigas, pilares e fundação</text>
<text x="460" y="96" style="fill:var(--amber-ink)" font-size="10" font-weight="600">g = permanente</text><text x="460" y="114" style="fill:var(--steel)" font-size="10" font-weight="600">q = variável</text></svg><figcaption>Camadas de carga sobre uma laje: peso próprio, revestimento, paredes e uso</figcaption></figure>
<div class="cols"><div class="conceito"><h4>Carga permanente (g)</h4><p>Fica lá a vida toda: o peso da própria estrutura, contrapiso, piso, reboco, paredes e forro.</p></div>
<div class="conceito"><h4>Carga variável (q)</h4><p>Vai e vem com o uso: pessoas, móveis, veículos. A NBR 6120 dá o valor mínimo por tipo de ambiente.</p></div>
<div class="conceito"><h4>Combinação</h4><p>Cada carga é multiplicada por um coeficiente de segurança (γ) antes de dimensionar. É a carga de cálculo.</p></div></div>
<h3>Pesos e sobrecargas que você vai usar muito</h3>
<div class="formula">Concreto armado: 25 kN/m³ · Argamassa de cimento e areia: 21 kN/m³ · Peso próprio da laje: g = 25 × h (h em m)</div>
<div class="formula">Sobrecarga de uso (valores usuais): residência 1,5 kN/m² · escritório 2,5 kN/m² · garagem de carros 3,0 kN/m²</div>
<h3>Como somar (NBR 8681)</h3>
<div class="formula">Valor característico: p = g + q</div>
<div class="formula">Combinação última normal (dimensionamento): pd = 1,4·g + 1,4·q</div>
<div class="formula">Quase permanente (flechas e fissuras): pqp = g + ψ2·q   (ψ2 = 0,3 residência · 0,4 escritório · 0,6 garagem)</div>
<div class="formula">Na viga que recebe a laje: carga linear = carga por m² × largura de influência (m)</div>
<div class="dica"><b>Unidade que salva obra</b>1 kN ≈ 100 kgf. Uma sobrecarga de 1,5 kN/m² é cerca de 150 kg em cada metro quadrado do piso.</div>`,
exemplo:`<h3>Laje de apartamento com 10 cm</h3>
<p>Laje maciça de 10 cm, contrapiso e piso somando 1,0 kN/m², paredes distribuídas valendo 1,0 kN/m² e uso residencial. A viga recebe uma faixa de 2 m da laje.</p>
<ol class="passos"><li><b>Peso próprio.</b> 25 × 0,10 = <b>2,5 kN/m²</b>.</li>
<li><b>Permanente.</b> g = 2,5 + 1,0 + 1,0 = <b>4,5 kN/m²</b>. Variável residencial: q = <b>1,5 kN/m²</b>.</li>
<li><b>Característico.</b> p = 4,5 + 1,5 = <b>6,0 kN/m²</b> (cerca de 600 kgf por m²).</li>
<li><b>Cálculo.</b> pd = 1,4 × 6,0 = <b>8,4 kN/m²</b>. Quase permanente: 4,5 + 0,3 × 1,5 = <b>4,95 kN/m²</b>.</li>
<li><b>Na viga.</b> 8,4 × 2 = <b>16,8 kN/m</b> de carga de cálculo.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
exemplos:[{"nivel":"facil","titulo":"Laje de escritório sem paredes","html":"<p>Laje de 12 cm, revestimento de 1,0 kN/m², sem paredes sobre a laje, uso de escritório. Faixa de 2 m para a viga.</p><ol class=\"passos\"><li><b>Peso próprio.</b> 25 × 0,12 = <b>3,0 kN/m²</b>. Permanente: g = 3,0 + 1,0 = <b>4,0 kN/m²</b>.</li><li><b>Variável.</b> Escritório: q = <b>2,5 kN/m²</b>. Característico: p = <b>6,5 kN/m²</b>.</li><li><b>Cálculo.</b> pd = 1,4 × 6,5 = <b>9,1 kN/m²</b> · na viga: 9,1 × 2 = <b>18,2 kN/m</b>.</li><li><b>Quase permanente.</b> 4,0 + 0,4 × 2,5 = <b>5,0 kN/m²</b>. Escritório pesa mais que casa por causa do uso, mesmo sem paredes.</li></ol>"},
{"nivel":"obra","titulo":"Caixa d’água nova sobre a laje","html":"<p>O morador quer colocar uma caixa d’água de 1.000 L sobre a laje do exemplo, que foi calculada com 1,5 kN/m² de uso. A caixa cheia tem base de 1,10 m de diâmetro.</p><ol class=\"passos\"><li><b>Peso da caixa cheia.</b> 1.000 L de água ≈ <b>10 kN</b> (uma tonelada), sem contar a própria caixa.</li><li><b>Área da base.</b> π × 1,10² / 4 = <b>0,95 m²</b>.</li><li><b>Pressão na laje.</b> 10 / 0,95 = <b>10,5 kN/m²</b>, sete vezes a sobrecarga de projeto.</li><li><b>Conclusão.</b> Sem verificar, a laje pode fissurar ou flechar além do aceitável. A caixa deve ir sobre vigas ou pilares, com base de apoio, e a decisão é do engenheiro.</li></ol><div class=\"dica\"><b>Regra prática</b>Carga nova em laje existente (caixa d’água, piscina, parede, ar-condicionado grande) sempre pede verificação.</div>"}],
obra:{"intro":"Na obra, a carga muda o tempo todo: aparece uma parede que não estava no projeto, uma caixa d’água, um contrapiso mais grosso para corrigir o nível. Cada uma dessas mudanças é peso que a estrutura não esperava.","erros":[["Contrapiso muito grosso","Corrigir nível com 8 ou 10 cm de argamassa acrescenta 1,7 a 2,1 kN/m², mais que a sobrecarga de uma residência."],["Parede nova sobre laje","Parede de alvenaria levantada direto sobre a laje, sem viga embaixo e sem consultar o projetista."],["Mudar o uso do ambiente","Transformar quarto em depósito, academia ou biblioteca, que pedem sobrecargas muito maiores."],["Estocar material na laje","Pilhas de blocos, sacos de cimento ou areia concentrados sobre laje recém-desformada."]],"checklist":["As cargas do projeto (g e q) estão anotadas na planta de formas","Espessura do contrapiso conferida com o projeto","Paredes executadas nas posições previstas","Nenhuma carga nova (caixa d’água, equipamentos) sem avaliação do engenheiro","Material de obra estocado espalhado e longe do meio do vão","Mudança de uso do imóvel comunicada ao projetista"],"dica":"Antes de estocar material sobre uma laje, pergunte: isso pesa mais que pessoas em pé lado a lado? Uma pilha de 1 m de blocos cerâmicos passa fácil de 5 kN/m²."},
sim:{html:()=>simWrap(rng('cgH','Espessura da laje',8,20,1,10,'cm')+rng('cgR','Contrapiso + piso + forro',0,3,0.1,1,'kN/m²')+rng('cgP','Paredes distribuídas',0,3,0.1,1,'kN/m²','Peso das paredes dividido pela área da laje')+sel('cgU','Uso do ambiente',[['1.5|0.3','Residência (1,5 kN/m²)',1],['2.5|0.4','Escritório (2,5 kN/m²)'],['3|0.6','Garagem de carros (3,0 kN/m²)'],['0.5|0','Cobertura sem acesso (0,5 kN/m²)']])+rng('cgF','Largura de influência na viga',0.5,5,0.1,2,'m')),
update(){const [q,psi]=$('cgU').value.split('|').map(Number),r=calc.cargas(V_('cgH'),V_('cgR'),V_('cgP'),q,psi,V_('cgF'));
$('tiles').innerHTML=tiles([['g (permanente)',br(r.g)+' kN/m²'],['q (variável)',br(r.q)+' kN/m²'],['pd (cálculo)',br(r.pd)+' kN/m²',1],['Na viga',br(r.lin)+' kN/m',1]]);
const parts=[['Peso próprio',r.pp,'line'],['Revestimento',V_('cgR'),'soil'],['Paredes',V_('cgP'),'neg'],['Uso',r.q,'steel']],tot=r.p||1,W=380;let s=T_('COMPOSIÇÃO DA CARGA POR m²',30,20),x=60;
parts.forEach(([n,v,c],i)=>{const w=W*v/tot;if(w>0.5)s+=`<rect x="${x}" y="50" width="${w}" height="40" style="fill:var(--${c});opacity:.55;stroke:var(--ink);stroke-width:1"/>`;s+=`<rect x="60" y="${120+i*24}" width="12" height="12" style="fill:var(--${c});opacity:.55"/>`+T(80,131+i*24,`${n}: ${br(v)} kN/m² (${br(100*v/tot,0)}%)`,'ink','font-size="11"');x+=w});
s+=T(60,42,'p = '+br(r.p)+' kN/m² ≈ '+br(r.p*100,0)+' kgf/m²','ink','font-weight="600"')+T(450,75,'× 1,4','amber-ink','font-size="13" font-weight="600"')+T(450,95,'pd = '+br(r.pd),'amber-ink','font-size="13" font-weight="600"');
s+=T(60,240,'Faixa de '+br(V_('cgF'),1)+' m → viga recebe '+br(r.lin)+' kN/m (cálculo) · '+br(r.linK)+' kN/m (característico)','muted','font-size="10"');
$('draw').innerHTML=SVG(640,260,'Composição da carga por metro quadrado da laje',s);
$('memorial').textContent=`1) Peso próprio = 25 kN/m³ × ${br(V_('cgH')/100)} m = ${br(r.pp)} kN/m²
2) g = ${br(r.pp)} + ${br(V_('cgR'))} + ${br(V_('cgP'))} = ${br(r.g)} kN/m²
3) q (NBR 6120) = ${br(r.q)} kN/m² · p = g + q = ${br(r.p)} kN/m²
4) Combinação última normal (NBR 8681): pd = 1,4 × ${br(r.g)} + 1,4 × ${br(r.q)} = ${br(r.pd)} kN/m²
5) Quase permanente: pqp = ${br(r.g)} + ${br(psi,1)} × ${br(r.q)} = ${br(r.pqp)} kN/m² (flechas e fissuras)
6) Na viga: ${br(r.pd)} × ${br(V_('cgF'),1)} m = ${br(r.lin)} kN/m de cálculo`;}}
});
