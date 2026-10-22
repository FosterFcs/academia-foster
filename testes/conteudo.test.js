// Conteúdo das disciplinas: estrutura (exemplos, "Na obra", quiz) e números dos exemplos
// conferidos contra as funções de cálculo. Rode com: node testes/conteudo.test.js
const fs=require('fs'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let n=0,f=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}},near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
const calcSrc=R('js/calc.js'),code=calcSrc.split('// CALC-START')[1].split('// CALC-END')[0];
const {calc}=new Function(code+';return{calc}')();
const CAT=new Function('self',R('js/catalogo.js')+';return{CATALOGO,AREAS}')({});
const mods={};const Academia={modulo(id,o){mods[id]=o}};
for(const m of CAT.CATALOGO)new Function('Academia','SIG',R('js/modulos/'+m.id+'.js'))(Academia,{});
const txt=h=>h.replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
// ---- estrutura
for(const m of CAT.CATALOGO){const o=mods[m.id];ok(o,'módulo carregado '+m.id);if(!o)continue;
  ok(Array.isArray(o.exemplos)&&o.exemplos.length===2,m.id+': 2 exemplos novos');
  (o.exemplos||[]).forEach((e,i)=>{ok(['facil','medio','obra'].includes(e.nivel),m.id+' nível '+i);ok(e.titulo&&e.titulo.length>8,m.id+' título '+i);ok(txt(e.html).length>200,m.id+' exemplo curto '+i);ok(!/undefined|NaN/.test(e.html),m.id+' undefined '+i);ok((e.html.match(/<li>/g)||[]).length>=3,m.id+' passos '+i)});
  ok(o.exemplos&&o.exemplos[0].nivel==='facil'&&o.exemplos[1].nivel==='obra',m.id+': um fácil e um de obra');
  const ob=o.obra;ok(ob&&ob.intro.length>60,m.id+': intro obra');
  ok(ob&&ob.erros.length>=4&&ob.erros.every(e=>e.length===2&&e[0].length>5&&e[1].length>20),m.id+': erros comuns');
  ok(ob&&ob.checklist.length>=6&&new Set(ob.checklist).size===ob.checklist.length,m.id+': checklist');
  ok(ob&&ob.dica&&ob.dica.length>40,m.id+': dica de obra');
  ok((o.teoria.match(/<figure class="fig">/g)||[]).length===1&&/<figcaption>.{10,}<\/figcaption>/.test(o.teoria),m.id+': figura na teoria');
  ok(m.quiz.length===15,m.id+': 15 questões ('+m.quiz.length+')');
  const ps=new Set();m.quiz.forEach((q,i)=>{ok(q.o.length>=2&&q.c>=0&&q.c<q.o.length,m.id+' gabarito '+i);ok(new Set(q.o).size===q.o.length,m.id+' opções repetidas '+i);ok(q.e&&q.e.length>15,m.id+' explicação '+i);ok(!ps.has(q.p),m.id+' pergunta repetida '+i);ps.add(q.p)});
}
// gabaritos distribuídos (não pode estar quase tudo na mesma letra)
const dist=[0,0,0,0];CAT.CATALOGO.forEach(m=>m.quiz.forEach(q=>dist[q.c]++));const tot=dist.reduce((a,b)=>a+b);
ok(Math.max(...dist)/tot<0.45,'gabarito distribuído '+dist);ok(tot===300,'300 questões no banco');
// ---- números dos exemplos x calculadoras
const has=(id,i,s)=>ok(txt(mods[id].exemplos[i].html).includes(s),`${id} ex${i+2} contém "${s}"`);
let r;
r=calc.viga(3,0,12,1.5);near(r.RA,6,1e-9,'RM1 R');near(r.Mmax,9,1e-9,'RM1 M');
r=calc.viga(4,6.65,0,0);near(r.RA,13.3,1e-9,'RM2 R');near(r.Mmax,13.3,1e-9,'RM2 M');has('rm',1,'13,3 kN·m');
r=calc.balanco(1.5,6,1);has('is',1,'8,25 kN·m/m');
r=calc.flexao(15,40,25,50);near(r.As,5.19,0.01,'CA1 As');r=calc.flexao(14,30,25,25);near(r.As,3.61,0.01,'CA2 As');near(r.xd,0.355,0.01,'CA2 x/d');
r=calc.sapata(400,8,30,30);has('gt',0,'1,65 × 1,65 m');r=calc.sapata(150,6,30,15);has('gt',1,'1,10 × 1,25 m');
r=calc.hazen(1,32,20,150);near(r.hf,1.08,0.01,'HD1 hf');r=calc.hazen(0.2,25,15,150);near(r.hf,0.14,0.01,'HD2 hf');
r=calc.area([[0,0],[20,0],[20,10],[8,10],[8,25],[0,25]]);near(r.area,320,1e-9,'TP2 área');near(r.perim,90,1e-9,'TP2 perímetro');
r=calc.laje(3,7,10,1,1.5);has('lj',1,'5,89 kN/m');
r=calc.muro(2,0.4,1.2,30,18,22);has('ma',0,'3,37');has('ma',0,'1,69');r=calc.muro(2.5,1,2,32,18,17);has('ma',1,'5,41');has('ma',1,'2,31');
r=calc.pluvial(6,1.5,15,180,10,4,0.5,0.011);has('ap',1,'303,75 L/min');
r=calc.cpm([{id:'A',dur:3,pred:[]},{id:'B',dur:5,pred:['A']},{id:'C',dur:2,pred:['A']},{id:'D',dur:4,pred:['B','C']}]);has('pl',0,'12 dias');
r=calc.cpm([['F',15,[]],['AL',25,['F']],['LJ',10,['AL']],['TE',12,['LJ']],['IN',15,['LJ']],['RE',15,['IN']],['ES',5,['RE']],['PI',12,['RE','TE']],['PT',10,['ES','PI']]].map(([id,dur,pred])=>({id,dur,pred})));has('pl',1,'102 dias');
r=calc.pilar(25,50,30,1500,300);has('pi',1,'10 φ 16 mm');
r=calc.circuito(1400,220,20,'tue',2);has('el',1,'0,83%');r=calc.circuito(1400,127,20,'tue',2);has('el',1,'2,48%');
r=calc.vigaAco('W 250 x 25,3',345,5,4,2,5,1.14);near(r.Msd/100,27.9,0.06,'AC2 Msd');near(r.MRd/100,28.4,0.06,'AC2 MRd');
r=calc.vigaAco('W 250 x 25,3',345,5,4,2,1.25,1);near(r.MRd/100,87.8,0.06,'AC2 travada');
r=calc.vigaMadeira('Dicotiledônea C40',6,16,2.5,0.5,0.6,2,0.7,0.8,0.8);near(r.sig,5.94,0.01,'MD2 σ');
r=calc.reservatorio(300,50,1,0,true,5,1.5);has('rs',1,'DN 32');has('rs',1,'DN 40');
r=calc.pavimento(2e7,4,null);near(r.total,67,0.5,'PV2 total');r=calc.pavimento(2e7,4,10);near(r.hn,32,0.5,'PV2 reforço');near(r.h20,10,0.5,'PV2 sub-base com reforço');
console.log(`${n-f}/${n} verificações de conteúdo passaram`);process.exit(f?1:0);
