// RS-19 · Reservatórios
Academia.modulo('rs',{
teoria:`<p>A caixa d'água garante água mesmo quando a rede pública falha. O tamanho certo depende de quantas pessoas usam, de quanto cada uma consome e de quantos dias de reserva se quer ter.</p>
<div class="cols"><div class="conceito"><h4>Consumo per capita</h4><p>Litros por pessoa por dia. Residência: 150 a 200 L. Escritório: cerca de 50 L. Escola: cerca de 50 L por aluno.</p></div>
<div class="conceito"><h4>População</h4><p>Regra usual em residências: 2 pessoas por dormitório. Em prédios, some todas as unidades.</p></div>
<div class="conceito"><h4>Reserva de incêndio (RTI)</h4><p>Volume exigido pelo Corpo de Bombeiros, guardado no reservatório superior e intocável no uso diário.</p></div></div>
<h3>Dimensionamento (NBR 5626)</h3>
<div class="formula">Consumo diário = pessoas × consumo per capita     Reserva = consumo diário × dias (1 a 3 dias)</div>
<div class="formula">Com bombeamento: 60% no reservatório inferior e 40% no superior, mais a RTI no superior</div>
<h3>Bomba de recalque</h3>
<div class="formula">Vazão = consumo diário / horas de funcionamento     Forchheimer: D = 1,3 · √Q · X^¼,  X = horas / 24</div>
<p>O tubo de sucção usa um diâmetro comercial acima do de recalque, para a bomba não "puxar" ar.</p>
<div class="dica"><b>Limpeza</b>Reservatório precisa de tampa vedada, extravasor com tela e limpeza a cada 6 meses. Água parada destampada vira criadouro do Aedes aegypti.</div>`,
exemplo:`<h3>Prédio com 4 apartamentos de 2 dormitórios</h3><p>16 pessoas, 200 L por pessoa por dia, 2 dias de reserva, reserva de incêndio de 6.000 L e bomba funcionando 6 horas por dia.</p>
<ol class="passos"><li><b>Consumo diário.</b> 16 × 200 = <b>3.200 L/dia</b>. Reserva de 2 dias: <b>6.400 L</b>.</li>
<li><b>Reservatório inferior.</b> 60% de 6.400 = <b>3.840 L</b>. Em concreto, com 1,50 m de altura útil: 2,56 m² → cerca de 1,60 × 1,60 m.</li>
<li><b>Reservatório superior.</b> 40% de 6.400 + 6.000 de RTI = <b>8.560 L</b> → caixa comercial de 10.000 L.</li>
<li><b>Bomba.</b> 3.200 L em 6 h = 533 L/h. Forchheimer: D = 1,3 × √0,000148 × 0,25^¼ = 11 mm → recalque <b>DN 20</b> e sucção <b>DN 25</b>.</li>
<li><b>Tempo de enchimento.</b> O superior recebe 3.840 L do inferior em cerca de 7,2 horas de bomba.</li></ol>
<div class="dica"><b>Confira no simulador</b>Os valores iniciais são os do exemplo.</div>`,
sim:{html:()=>simWrap(rng('rsP','Pessoas',1,400,1,16,'')+sel('rsC','Consumo per capita',[[150,'Residência popular (150 L/dia)'],[200,'Residência / apartamento (200 L/dia)',1],[50,'Escritório (50 L/dia)'],[50.0001,'Escola, por aluno (50 L/dia)'],[250,'Alto padrão (250 L/dia)']])+rng('rsD','Dias de reserva',1,3,0.5,2,'dias')+rng('rsR','Reserva de incêndio (RTI)',0,30000,500,6000,'L','Conforme o Corpo de Bombeiros')+sel('rsB','Sistema',[['1','Com bomba (inferior + superior)',1],['0','Só caixa superior (casa, rede direta)']])+rng('rsH','Horas de bomba por dia',2,12,0.5,6,'h')+rng('rsU','Altura útil do inferior',0.8,3,0.1,1.5,'m')),
update(){const rec=$('rsB').value==='1',r=calc.reservatorio(V_('rsP'),Math.round(V_('rsC')),V_('rsD'),V_('rsR'),rec,V_('rsH'),V_('rsU'));
  const cx=c=>c?(c.n>1?c.n+' × ':'')+br(c.cap,0)+' L':'—';
  $('tiles').innerHTML=tiles([['Consumo diário',br(r.diario,0)+' L'],['Superior',br(r.sup,0)+' L → '+cx(r.caixaSup),1],['Inferior',rec?br(r.inf,0)+' L':'—',1],['Bomba',rec?'DN '+r.rec+' / sucção DN '+r.suc:'—']]);
  const sup=Math.max(r.sup,1),inf=Math.max(r.inf,1),mx=Math.max(sup,inf),hs=40+70*sup/mx,hi=40+70*inf/mx,chao=300,tet=140,base=tet-4;
  let s=T_('ESQUEMA',30,18)+`<rect x="60" y="${tet}" width="240" height="${chao-tet}" style="fill:none;stroke:var(--line);stroke-width:1.5"/>`;for(let i=1;i<3;i++)s+=Ln(60,tet+i*(chao-tet)/3,300,tet+i*(chao-tet)/3,'line');
  s+=`<rect x="120" y="${base-hs}" width="120" height="${hs}" style="fill:var(--water-fill);stroke:var(--ink);stroke-width:2"/>`;
  if(r.sup>0&&V_('rsR')>0){const hr=hs*V_('rsR')/r.sup;s+=`<rect x="121" y="${base-hr}" width="118" height="${hr-1}" style="fill:var(--neg-fill)"/>`+T(180,base-hr/2+4,'RTI','neg','text-anchor="middle" font-size="10" font-weight="600"')}
  s+=T(132,base-hs-8,'Superior · '+br(r.sup,0)+' L','ink','font-size="11" font-weight="600"');
  if(rec){s+=`<rect x="330" y="${chao-hi}" width="150" height="${hi}" style="fill:var(--water-fill);stroke:var(--ink);stroke-width:2"/>`+T(340,chao-hi-8,'Inferior · '+br(r.inf,0)+' L','ink','font-size="11" font-weight="600"');
    const yt=base-hs+12;s+=Ln(480,chao-10,512,chao-10,'steel',2.5)+`<circle cx="522" cy="${chao-10}" r="10" style="fill:var(--amber);stroke:var(--ink)"/>`+T(538,chao-6,'bomba','amber-ink','font-size="10"')+Ln(522,chao-20,522,yt,'steel',2.5)+Ln(522,yt,240,yt,'steel',2.5)+T(530,(yt+chao)/2,'recalque DN '+r.rec,'steel','font-size="10"');}
  s+=Ln(30,chao,610,chao,'soil',2)+T(36,chao+16,'térreo','muted','font-size="10"');
  $('draw').innerHTML=SVG(640,340,'Esquema dos reservatórios superior e inferior',s);
  $('memorial').textContent=`1) Consumo diário = ${V_('rsP')} pessoas × ${Math.round(V_('rsC'))} L = ${br(r.diario,0)} L/dia
2) Reserva = ${br(r.diario,0)} × ${br(V_('rsD'),1)} dias = ${br(r.reserva,0)} L · RTI = ${br(V_('rsR'),0)} L · total = ${br(r.total,0)} L
${rec?`3) Inferior = 60% × ${br(r.reserva,0)} = ${br(r.inf,0)} L → com ${br(V_('rsU'),2)} m de altura útil: ${br(r.area,2)} m² (≈ ${br(r.lado,2)} × ${br(r.lado,2)} m)
4) Superior = 40% × ${br(r.reserva,0)} + RTI = ${br(r.sup,0)} L → ${cx(r.caixaSup)}
5) Vazão da bomba = ${br(r.diario,0)} / ${br(V_('rsH'),1)} h = ${br(r.Qlh,0)} L/h · Forchheimer: D = 1,3 √Q · (${br(V_('rsH'),1)}/24)^¼ = ${br(r.Dmm,1)} mm
   Recalque DN ${r.rec} · sucção DN ${r.suc} · enchimento do superior em ${br(r.tempo,1)} h de bomba`:`3) Sem bomba: todo o volume no superior = ${br(r.sup,0)} L → ${cx(r.caixaSup)}`}`;}}
});
