// Calculadoras da fase 3: treliça, ligação parafusada, recalque, físico-financeiro,
// nivelamento e microdrenagem. Rode com: node testes/fase3.test.js
const fs=require('fs'),path=require('path');
const src=fs.readFileSync((process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null)||path.join(__dirname,'..','js','calc.js'),'utf8');
const {calc}=new Function(src.split('// CALC-START')[1].split('// CALC-END')[0]+';return{calc}')();
let n=0,f=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}},near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
// ---- sistema linear
const x=calc.resolver([[2,1],[1,3]],[3,5]);near(x[0],0.8,1e-12,'Gauss x');near(x[1],1.4,1e-12,'Gauss y');ok(calc.resolver([[1,2],[2,4]],[1,2])===null,'sistema singular');
// ---- treliça: método das seções à mão (Pratt 12 m, H 1,5, 6 painéis, P 10 kN)
let r=calc.trelica(12,1.5,6,'pratt',10);near(r.Ra,30,1e-9,'RA');near(r.Rb,30,1e-9,'RB');near(r.Rx,0,1e-9,'sem reação horizontal');
const g=(r,k)=>r.barras.filter(b=>b.g===k);
near(Math.min(...g(r,'superior').map(b=>b.N)),-90/1.5,1e-9,'banzo superior central = −M/H');
near(g(r,'inferior')[1].N,(30*2-5*2)/1.5,1e-9,'banzo inferior painel 2 = M(2 m)/H');
near(g(r,'diagonal')[0].N,25/0.6,1e-9,'diagonal extrema = V/sen θ');ok(g(r,'diagonal').every(b=>b.N>0),'Pratt: diagonais tracionadas');
const h=calc.trelica(12,1.5,6,'howe',10);ok(g(h,'diagonal').every(b=>b.N<0),'Howe: diagonais comprimidas');near(Math.max(...g(h,'inferior').map(b=>b.N)),90/1.5,1e-9,'Howe banzo inferior central');
// equilíbrio global e de cada nó
for(const tp of ['pratt','howe'])for(const nn of [4,6,8,10,12])for(const bz of ['sup','inf']){const t=calc.trelica(10,1.2,nn,tp,7,bz);ok(t,'resolve '+tp+nn);near(t.Ra+t.Rb,t.W,1e-8,`ΣFy ${tp}${nn}${bz}`);
  let maxR=0;t.nos.forEach((p,i)=>{let fx=0,fy=0;t.barras.forEach(b=>{if(b.a!==i&&b.c!==i)return;const o=t.nos[b.a===i?b.c:b.a],l=b.l;fx+=b.N*(o.x-p.x)/l;fy+=b.N*(o.y-p.y)/l});
    if(i===0){fx+=t.Rx;fy+=t.Ra}if(i===nn){fy+=t.Rb}const lin=bz==='sup'?nn+1:0;if(i>=lin&&i<=lin+nn)fy-=(i===lin||i===lin+nn)?3.5:7;maxR=Math.max(maxR,Math.abs(fx),Math.abs(fy))});ok(maxR<1e-8,`nós em equilíbrio ${tp}${nn}${bz}: ${maxR}`)}
ok(Math.abs(calc.trelica(12,3,6,'pratt',10).maxC)<Math.abs(r.maxC),'treliça mais alta: banzo menos solicitado');
// ---- ligação parafusada
r=calc.ligacao(150,15.9,'ASTM A325',1,true,8,400,4);near(r.Fv,0.4*Math.PI*1.59**2/4*82.5/1.35,1e-9,'Fv A325 com rosca');near(r.Fc,2.4*1.59*0.8*40/1.35,1e-9,'pressão de contato');ok(r.nec===Math.ceil(150/r.F1)&&r.ok,'4 parafusos atendem');
ok(calc.ligacao(150,15.9,'ASTM A325',2,false,8,400,4).Fv>2.4*r.Fv,'2 planos sem rosca: mais de 2,4×');ok(calc.ligacao(100,25.4,'ASTM A325',2,false,6.3,400,2).gov.includes('contato'),'chapa fina governa');
ok(calc.ligacao(150,15.9,'ASTM A307',1,true,8,400,4).Fv<r.Fv,'A307 mais fraco');
// ---- recalque
r=calc.recalque(400,1.65,1.65,8,'Silte arenoso',0.3,true);near(r.Es,5*0.45*8,1e-9,'Es Teixeira-Godoy');near(r.rho,1.05*400/1.65**2*1.65*(1-0.09)*0.82/(r.Es*1000)*1000,1e-9,'ρ elástico');ok(r.ok,'recalque < 25 mm');
ok(calc.recalque(400,1.65,1.65,8,'Silte arenoso',0.3,false).rho>r.rho,'flexível > rígida');ok(calc.recalque(400,1,3,8,'Areia',0.3,true).Ir===1.12,'L/B ≥ 2');
ok(calc.recalque(2000,1.5,1.5,4,'Argila siltosa',0.45,true).ok===false,'argila mole com carga alta não passa');
// ---- físico-financeiro
const et=[{id:'A',dur:30,pred:[],custo:30000},{id:'B',dur:45,pred:['A'],custo:90000},{id:'C',dur:20,pred:['A'],custo:10000}];
r=calc.fisicoFinanceiro(et);ok(r.prazo===75&&r.meses===3,'prazo');near(r.mes[0],30000,1e-6,'mês 1');near(r.mes[1],60000+10000,1e-6,'mês 2');near(r.mes[2],30000,1e-6,'mês 3');near(r.pct[2],100,1e-9,'acumula 100%');
ok(r.acum.every((v,i)=>!i||v>=r.acum[i-1]),'curva S crescente');ok(calc.fisicoFinanceiro([{id:'A',dur:5,pred:['B'],custo:1},{id:'B',dur:5,pred:['A'],custo:1}]).erro,'ciclo');
// ---- nivelamento
r=calc.nivelamento(100,[[1.5,0.8],[1.2,1.9],[0.9,0.903]],0.5,'IN');near(r.pts[1].cota,100.7,1e-9,'cota P1');near(r.erro,-3,1e-6,'erro de fechamento');near(r.tol,12*Math.sqrt(0.5),1e-9,'tolerância IN');ok(r.ok,'aceito');
ok(!calc.nivelamento(100,[[1.5,0.8],[1.2,1.88]],0.25,'IN').ok,'20 mm em 250 m: rejeitado');near(calc.nivelamento(50,[[2,1]],1,'IIN').tol,20,1e-9,'tolerância IIN');
// ---- microdrenagem
near(calc.racional(0.7,120,2),0.7*120*2/360,1e-12,'racional');
r=calc.galeria(0.467,0.01);near(0.3117*r.D**(8/3)*Math.sqrt(0.01)/0.013,0.467,1e-9,'Manning inverso');ok(r.DN===0.6&&r.Qp>=0.467,'DN 600');
near(Math.PI/4*0.25**(2/3),0.3117,0.0001,'constante de Manning a seção plena');ok(calc.galeria(50,0.005).DN===null,'vazão enorme');
console.log(`${n-f}/${n} testes da fase 3 passaram`);process.exit(f?1:0);
