// Testes automáticos. Rode com: node testes/calculos.test.js
const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(require('path').join(__dirname,'..','js','calc.js'),'utf8');
const code=src.split('// CALC-START')[1].split('// CALC-END')[0];
const {calc,ROMIN}=new Function(code+';return{calc,ROMIN}')();
let n=0,fail=0;const near=(a,b,tol,msg)=>{n++;try{assert(Math.abs(a-b)<=tol,`${msg}: ${a} vs ${b}`)}catch(e){fail++;console.log('FAIL',e.message)}};
const ok=(c,msg)=>{n++;if(!c){fail++;console.log('FAIL',msg)}};
// RM viga
let r=calc.viga(5,12,0,0);near(r.RA,30,1e-9,'viga RA');near(r.RB,30,1e-9,'viga RB');near(r.Mmax,37.5,1e-9,'viga Mmax qL²/8');near(r.xM,2.5,1e-9,'viga xM');
r=calc.viga(4,0,30,2);near(r.Mmax,30,1e-9,'viga PL/4');near(r.RA+r.RB,30,1e-9,'viga equilibrio P');
r=calc.viga(6,8,0,0);near(r.Mmax,36,1e-9,'quiz RM q3');
r=calc.viga(7,10,40,2);near(r.RA+r.RB,110,1e-9,'equilibrio vertical');near(r.RA*7-10*49/2-40*5,0,1e-9,'equilibrio momentos em B');
near(r.M[r.M.length-1],0,1e-9,'M(L)=0');near(r.V[r.V.length-1],-r.RB,1e-9,'V(L)=-RB');
// IS balanço
r=calc.balanco(1.5,6,2);near(r.R,11,1e-9,'balanço R exemplo');near(r.M0,9.75,1e-9,'balanço M exemplo');near(r.M[0],-9.75,1e-9,'M engaste negativo');near(r.M[r.M.length-1],0,1e-9,'M ponta zero');
near(calc.balanco(2,0,10).M0,20,1e-9,'quiz IS q3');near(calc.balanco(3,5,0).M0,22.5,1e-9,'quiz IS q4');
// CA flexão
r=calc.flexao(20,50,25,100);near(r.d,46,1e-9,'d');near(r.Md,14000,1e-6,'Md');near(r.x,14.3,0.1,'x');near(r.xd,0.311,0.002,'x/d');near(r.As,8.0,0.05,'As');ok(r.ok,'ductil');
let b=calc.barras(r.Asf,20);ok(b.f===16&&b.n===4,'4 phi 16: got '+b.n+' phi '+b.f);ok(b.area>=r.Asf,'area barras >= As');
// verificação independente: equilíbrio da seção Md = 0,68 bw fcd x (d-0,4x)
near(0.68*20*r.fcd*r.x*(r.d-0.4*r.x),r.Md,0.5,'equilibrio secao');near(r.As*r.fyd,0.68*20*r.fcd*r.x,0.5,'equilibrio forças');
r=calc.flexao(20,50,25,1);near(r.Asf,0.0015*20*50,1e-9,'As min');
ok(calc.flexao(12,25,20,400).inviavel,'secao inviavel');ok(!calc.flexao(20,40,25,120).ok,'x/d>0,45 detectado');
for(const bw of [12,15,20,25,30,40])for(const As of [1,3,5,8,12,20,30]){const bb=calc.barras(As,bw);ok(bb.area>=As-1e-9&&bb.n>=2,`barras ${bw}/${As}`)}
// GT sapata
r=calc.sapata(800,12,40,20);near(r.sadm,240,1e-9,'sadm');near(r.A,3.5,1e-9,'A');near(r.B,1.8,1e-9,'B');near(r.L,2.0,1e-9,'L');near(r.h,0.55,1e-9,'h');ok(r.sig<=r.sadm,'sig<=sadm');
for(const N of [100,500,1200,3000])for(const s of [5,10,20])for(const [a,bb] of [[20,20],[40,20],[100,40]]){const q=calc.sapata(N,s,a,bb);ok(q.B*q.L>=q.A-1e-9&&q.sig<=q.sadm+1e-9,'area ok '+[N,s,a,bb]);near(q.L-q.B,(a-bb)/100,0.051,'abas iguais '+[N,s,a,bb])}
// HD hazen
r=calc.hazen(0.5,25,30,150);near(r.v,1.0186,0.001,'v exemplo');near(r.J,0.0497,0.0005,'J exemplo');near(r.hf,1.49,0.02,'hf exemplo');
const Jalt=(Q,D,C)=>(Q/(0.2785*C*D**2.63))**(1/0.54);near(calc.hazen(1,25,1,150).J,Jalt(0.001,0.025,150),0.03*Jalt(0.001,0.025,150),'HW forma alternativa');
near(calc.hazen(1,32,100,150).hf,2*calc.hazen(1,32,50,150).hf,1e-9,'dobra L dobra hf');ok(calc.hazen(2,25,10,150).hf>calc.hazen(1,25,10,150).hf,'mais vazão mais perda');ok(calc.hazen(1,20,10,150).hf>calc.hazen(1,32,10,150).hf,'diâmetro menor mais perda');
// MC traço
r=calc.traco(2,3,0.55,1);near(r.C,365.2,0.5,'consumo');ok(r.sacos===8,'8 sacos');near(r.porSaco.areiaLatas,3.7,0.05,'latas areia');near(r.porSaco.britaLatas,5.75,0.05,'latas brita');near(r.porSaco.agua,27.5,1e-9,'agua');
near(calc.traco(2,3,0.55,10).cim,10*r.C,1e-6,'linear no volume');
// TP area
r=calc.area([[0,0],[24,0],[20,30],[0,30]]);near(r.area,660,1e-9,'trapezio');r=calc.area([[0,0],[20,0],[20,30],[0,30]]);near(r.area,600,1e-9,'retangulo');near(r.perim,100,1e-9,'perimetro');
near(calc.area([[0,0],[0,30],[20,30],[20,0]]).area,600,1e-9,'sentido horario');near(calc.area([[0,0],[4,0],[0,3]]).perim,12,1e-9,'triangulo 3-4-5');
// OR
r=calc.orcamento([{coef:13,preco:3.1},{coef:0.012,preco:520},{coef:0.85,preco:32},{coef:0.85,preco:24}],25,100);near(r.cu,94.14,1e-9,'cu');near(r.pu,117.675,1e-9,'pu');near(r.total,11767.5,1e-6,'total');
near(calc.orcamento([{coef:1,preco:100}],25,1).pu,125,1e-9,'quiz OR q2');

// LJ laje
r=calc.laje(4,5,10,1,1.5);near(r.p,5,1e-9,'laje p');near(r.qc,5,1e-9,'laje curto');near(r.ql,6,1e-9,'laje longo');near(2*r.qc*r.lx+2*r.ql*r.ly,r.total,1e-9,'laje equilibrio');near(r.lam,1.25,1e-9,'lambda');
r=calc.laje(5,4,10,1,1.5);near(r.lx,4,1e-9,'laje troca lados');r=calc.laje(4,4,10,1,1.5);near(r.qc,r.ql,1e-9,'quadrada iguais');ok(calc.laje(3,7,10,1,1.5).umaDir,'uma direcao');
for(const lx of [2,3.5,6])for(const ly of [2,5,9,12]){const q=calc.laje(lx,ly,12,1,2);near(2*q.qc*q.lx+2*q.ql*q.ly,q.total,1e-9,'equilibrio laje '+lx+'x'+ly)}
near(calc.laje(4,5,12,0,0).pp,3,1e-9,'quiz LJ q2');
// MA muro
r=calc.muro(3,0.5,1.8,30,18,22);near(r.Ka,1/3,1e-9,'Ka');near(r.Ea,27,1e-9,'Ea');near(r.W,75.9,1e-9,'W');near(r.Mr,88.33,0.01,'Mr');near(r.FSt,3.27,0.01,'FSt');near(r.FSd,1.623,0.002,'FSd');near(r.e,0.092,0.002,'e');near(r.smax,55.1,0.2,'smax');ok(r.nucleo,'nucleo');
near(r.smax+r.smin,2*r.W/r.B,1e-9,'media tensoes');ok(calc.muro(3,0.5,1.2,30,18,22).FSd<1.5,'base 1,2 falha deslizamento');
near(calc.muro(6,0.5,1.8,30,18,22).Ea,4*calc.muro(3,0.5,1.8,30,18,22).Ea,1e-9,'quiz MA q5 H²');
r=calc.muro(3,0.6,0.6,30,18,22);near(r.W,0.6*3*22,1e-9,'muro retangular');near(r.Mr,r.W*0.3,1e-9,'braço retangular');
// AP pluvial
r=calc.pluvial(5,1,10,150,15,5,0.5,0.011);near(r.A,55,1e-9,'area contribuicao');near(r.Q,137.5,1e-9,'Q');near(r.Rh,0.03,1e-9,'Rh');near(r.Qc,279.2,0.5,'Qcalha');ok(r.ok,'calha ok');ok(r.cond===100,'condutor 100');
near(calc.pluvial(5,0,10,120,15,5,0.5,0.011).Q,100,1e-9,'quiz AP q4');ok(calc.pluvial(15,4,30,250,8,3,0.5,0.015).ok===false,'calha pequena falha');
// PL cpm
const ex=[['A',5,[]],['B',10,['A']],['C',20,['B']],['D',15,['C']],['E',8,['D']],['F',12,['D']],['G',14,['E','F']],['H',6,['E']],['I',8,['G','H']]].map(([id,dur,pred])=>({id,dur,pred}));
r=calc.cpm(ex);ok(r.total===84,'prazo 84: '+r.total);ok(r.critico.join('')==='ABCDFGI','critico '+r.critico.join(''));ok(r.folga.E===4&&r.folga.H===12,'folgas E/H');
ex[4].dur=13;r=calc.cpm(ex);ok(r.critico.includes('E')&&r.total===85,'muda caminho com E=13: '+r.total+' '+r.critico.join(''));
ok(calc.cpm([{id:'A',dur:1,pred:['B']},{id:'B',dur:1,pred:['A']}]).erro,'ciclo detectado');
r=calc.cpm([{id:'A',dur:3,pred:['Z','A']},{id:'B',dur:2,pred:[]}]);ok(r.total===3&&r.folga.B===1,'pred inexistente ignorado');
console.log(`${n-fail}/${n} testes de cálculo passaram`);process.exit(fail?1:0);
