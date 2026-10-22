// MC-06 · Materiais e Traço
Academia.modulo('mc',{
teoria:`<p>O traço é a receita do concreto. Escrito como <b>1 : a : p : x</b>, quer dizer: para cada 1 kg de cimento, <i>a</i> kg de areia, <i>p</i> kg de brita e <i>x</i> kg (litros) de água.</p>
<div class="cols"><div class="conceito"><h4>Relação água/cimento</h4><p>É o fator que mais manda na resistência. Mais água deixa o concreto fácil de lançar, mas fraco e poroso (Lei de Abrams).</p></div>
<div class="conceito"><h4>Consumo de cimento</h4><p>Quantos kg de cimento vão em 1 m³ de concreto. É o que define o custo.</p></div>
<div class="conceito"><h4>Latas de 18 L</h4><p>Na obra, areia e brita são medidas em volume. Usamos a massa unitária para converter kg em latas.</p></div></div>
<h3>Fórmulas</h3>
<div class="formula">Consumo  C = 1000 / (1/γc + a/γa + p/γp + x)   kg/m³</div>
<div class="formula">γc = 3,10 · γa = 2,65 · γp = 2,70 (massas específicas, kg/dm³)</div>
<div class="formula">Latas por saco = (a × 50 / massa unitária) / 18   areia 1,50 kg/L · brita 1,45 kg/L</div>
<div class="dica"><b>Erro clássico</b>Jogar água na betoneira para o concreto ficar mais mole. Cada litro a mais derruba a resistência. Para trabalhabilidade, use aditivo plastificante.</div>`,
exemplo:`<h3>1 m³ de concreto no traço 1 : 2 : 3 : 0,55</h3>
<ol class="passos"><li><b>Consumo.</b> C = 1000 / (1/3,10 + 2/2,65 + 3/2,70 + 0,55) = 1000 / 2,738 ≈ <b>365 kg/m³</b>.</li>
<li><b>Sacos.</b> 365 / 50 = 7,3 → <b>8 sacos</b> de cimento.</li>
<li><b>Areia por saco.</b> 2 × 50 = 100 kg → 100 / 1,50 = 66,7 L → <b>3,7 latas</b>.</li>
<li><b>Brita por saco.</b> 3 × 50 = 150 kg → 150 / 1,45 = 103 L → <b>5,7 latas</b>.</li>
<li><b>Água por saco.</b> 0,55 × 50 = <b>27,5 L</b>, já descontando a umidade da areia na prática.</li></ol>
<div class="dica"><b>Confira no simulador</b>Use o atalho 1:2:3 e volume de 1 m³.</div>`,
exemplos:[{"nivel": "facil", "titulo": "Meio metro cúbico de concreto 1 : 3 : 4", "html": "<p>Concreto para um contrapiso armado, traço 1 : 3 : 4 em massa, a/c = 0,65, volume de 0,5 m³.</p><ol class=\"passos\"><li><b>Consumo de cimento.</b> C ≈ <b>279 kg/m³</b>.</li><li><b>Para 0,5 m³.</b> 279 × 0,5 = 139 kg → <b>3 sacos</b> de 50 kg.</li><li><b>Por saco.</b> Areia ≈ <b>5,6 latas</b> de 18 L, brita ≈ <b>7,7 latas</b> e água ≈ <b>32,5 L</b>.</li><li><b>Leitura.</b> Medir em latas padronizadas e sempre na mesma ordem garante concreto igual em todas as betonadas.</li></ol>"}, {"nivel": "obra", "titulo": "O pedreiro quer pôr mais água", "html": "<p>Traço 1 : 2 : 3 previsto com a/c 0,50. O pedreiro reclama que está \"duro\" e quer subir para 0,70.</p><ol class=\"passos\"><li><b>Com a/c 0,50.</b> C ≈ <b>372 kg/m³</b> (cerca de 8 sacos por m³), com 25 L de água por saco.</li><li><b>Com a/c 0,70.</b> Mesmo traço seco, mas 35 L por saco. A resistência cai muito, pela lei de Abrams.</li><li><b>Quanto se perde.</b> Pela curva usual de Abrams, passar de 0,50 para 0,70 derruba a resistência em torno de 35% a 40%.</li><li><b>Solução certa.</b> Para ganhar trabalhabilidade sem perder resistência, use aditivo plastificante ou aumente a pasta inteira (cimento e água juntos), mantendo o a/c.</li></ol><div class=\"dica\"><b>Regra de canteiro</b>Água se mede, não se acerta no olho. Deixe um balde marcado com a quantidade por saco ao lado da betoneira.</div>"}],
obra:{"intro": "Os materiais chegam à obra todos os dias. Receber, armazenar e dosar bem é o que garante que o concreto e a argamassa tenham a resistência do projeto.", "erros": [["Cimento guardado no chão", "Saco encostado no piso ou na parede puxa umidade e empedra."], ["Areia suja ou com argila", "Torrões de argila e matéria orgânica enfraquecem a pasta e causam manchas."], ["Medir por pá", "Cada pá tem um volume. O traço muda de uma betonada para outra."], ["Concreto lançado depois do tempo", "Concreto de usina deve ser lançado em até 2 h 30 da saída. Depois disso começa a pega."]], "checklist": ["Cimento em estrado, a 30 cm das paredes, em pilhas de no máximo 10 sacos e usado por ordem de chegada", "Areia e brita em baias separadas, sobre piso limpo, longe de terra", "Traço afixado na betoneira, com padiolas ou latas padronizadas", "Água medida por saco de cimento", "Nota fiscal do concreto usinado conferida: fck, slump, horário e volume", "Slump test e moldagem de corpos de prova em cada caminhão", "Aço armazenado fora do chão, separado por bitola e protegido da chuva"], "dica": "Guarde as notas fiscais e os resultados de rompimento dos corpos de prova. Se surgir dúvida sobre a estrutura, esses papéis são a prova de que o concreto foi o especificado."},
sim:{html:()=>simWrap(`<div class="presets"><button class="chip" data-t="2,3,0.55">1:2:3 estrutural</button><button class="chip" data-t="2.5,3.5,0.6">1:2,5:3,5</button><button class="chip" data-t="3,4,0.65">1:3:4 contrapiso</button><button class="chip" data-t="4,5,0.75">1:4:5 magro</button></div>`+rng('tA','Areia a',1,5,0.5,2,'')+rng('tP','Brita p',1,6,0.5,3,'')+rng('tX','Água/cimento x',0.4,0.8,0.05,0.55,'')+rng('tV','Volume de concreto',0.5,20,0.5,1,'m³')),
init(){document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const[a,p,x]=b.dataset.t.split(',');$('tA').value=a;$('tP').value=p;$('tX').value=x;outs();this.update()})},
update(){const a=V_('tA'),p=V_('tP'),x=V_('tX'),vol=V_('tV'),r=calc.traco(a,p,x,vol);
$('tiles').innerHTML=tiles([['Consumo',br(r.C,0)+' kg/m³'],['Cimento',r.sacos+' sacos',1],['Areia',br(r.areia)+' m³'],['Brita',br(r.brita)+' m³']])+(x<=0.6?'<span class="pill ok">a/c ≤ 0,60 · uso estrutural possível</span>':'<span class="pill alerta">a/c &gt; 0,60 · só uso não estrutural</span>');
const ps=r.porSaco,items=[['Cimento','1 saco (50 kg)',50/1.42,'ink'],['Areia',br(ps.areiaLatas,1)+' latas',ps.areiaL,'amber'],['Brita',br(ps.britaLatas,1)+' latas',ps.britaL,'muted'],['Água',br(ps.agua,1)+' L',ps.agua,'water']];
const tot=items.reduce((s,i)=>s+i[2],0);let s=T(30,20,'POR SACO DE CIMENTO (VOLUME APROXIMADO)','muted','font-size="10" letter-spacing="1"'),xx=30;
items.forEach(([n,t,v,c])=>{const w=580*v/tot;s+=`<rect x="${xx}" y="36" width="${w}" height="40" style="fill:var(--${c});opacity:.85"/>`;xx+=w});
items.forEach(([n,t,v,c],i)=>{const y=110+i*34,lat=n==='Areia'?ps.areiaLatas:n==='Brita'?ps.britaLatas:0;
s+=`<rect x="30" y="${y-12}" width="14" height="14" style="fill:var(--${c})"/>`+T(54,y,n,'ink','font-weight="600"')+T(150,y,t,'ink');
for(let k=0;k<Math.ceil(lat);k++){const f=Math.min(1,lat-k);s+=`<rect x="${300+k*24}" y="${y-14}" width="18" height="18" style="fill:none;stroke:var(--${c});stroke-width:1.5"/><rect x="${300+k*24}" y="${y+4-18*f}" width="18" height="${18*f}" style="fill:var(--${c});opacity:.7"/>`}});
s+=T(30,256,`Total para ${br(vol,1)} m³: ${r.sacos} sacos · ${br(r.areia)} m³ de areia · ${br(r.brita)} m³ de brita · ${br(r.agua,0)} L de água`,'muted');
$('draw').innerHTML=SVG(640,270,'Proporção do traço por saco de cimento',s);
$('memorial').textContent=`1) C = 1000 / (1/3,10 + ${br(a,1)}/2,65 + ${br(p,1)}/2,70 + ${br(x)}) = ${br(r.C,1)} kg/m³
2) Cimento total = ${br(r.C,1)} × ${br(vol,1)} = ${br(r.cim,1)} kg → ${r.sacos} sacos de 50 kg
3) Areia = ${br(a,1)} × ${br(r.cim,1)} / 1500 = ${br(r.areia,3)} m³  (por saco: ${br(ps.areiaL,1)} L = ${br(ps.areiaLatas,1)} latas)
4) Brita = ${br(p,1)} × ${br(r.cim,1)} / 1450 = ${br(r.brita,3)} m³  (por saco: ${br(ps.britaL,1)} L = ${br(ps.britaLatas,1)} latas)
5) Água = ${br(x)} × ${br(r.cim,1)} = ${br(r.agua,0)} L  (por saco: ${br(ps.agua,1)} L)
   Sem perdas. Na obra, some 5% a 10%.`;}}
});
