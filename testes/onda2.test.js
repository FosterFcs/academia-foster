// Testes automáticos. Rode com: node testes/onda2.test.js
const fs=require('fs');const src=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','js','calc.js'),'utf8');
let code;if(src.includes('// CALC-START'))code=src.split('// CALC-START')[1].split('// CALC-END')[0];else code=fs.readFileSync('../tables2.js','utf8')+'\nconst ROMIN={};const calc={\n'+src+'};';
const X=new Function(code+';return{calc,SOLOS,TIPOS_ESTACA}')(),calc=X.calc;
let n=0,f=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}},near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
// ---- ESTACAS: cálculo à mão de um perfil homogêneo
const hom=Array.from({length:10},()=>({solo:'Areia',N:10}));
let r=calc.estaca(hom,'premoldada',30,8);const Ap=Math.PI*0.09/4,U=Math.PI*0.3;
near(r.RpA,1000*10/1.75*Ap,1e-9,'Aoki ponta');near(r.RlA,U*8*0.014*1000*10/3.5,1e-9,'Aoki fuste');near(r.QA,(r.RpA+r.RlA)/2,1e-9,'Aoki FS 2');
near(r.RpD,1*400*10*Ap,1e-9,'Decourt ponta');near(r.RlD,1*10*(10/3+1)*U*8,1e-9,'Decourt fuste');ok(r.Qadm===Math.min(r.QA,r.QD),'adota menor');
ok(calc.estaca(hom,'premoldada',30,12).erro,'L maior que sondagem');ok(calc.estaca(hom,'premoldada',30,1).erro,'L curto');
const p2=[{solo:'Areia',N:60},{solo:'Areia',N:60},{solo:'Areia',N:60}];r=calc.estaca(p2,'premoldada',30,3);near(r.RpA,1000*50/1.75*Ap,1e-9,'N limitado a 50');
ok(calc.estaca(hom,'helice',40,8).RpD<calc.estaca(hom,'premoldada',40,8).RpD,'helice alfa menor');
const ex=[['Argila siltosa',3],['Argila siltosa',4],['Argila siltosa',5],['Silte argiloso',6],['Silte argiloso',8],['Silte argiloso',9],['Silte arenoso',12],['Silte arenoso',14],['Silte arenoso',17],['Areia siltosa',20],['Areia siltosa',24],['Areia siltosa',30]].map(([solo,N])=>({solo,N}));
r=calc.estaca(ex,'premoldada',30,10);
let monot=true;for(let L=3;L<=12;L++)if(calc.estaca(ex,'premoldada',30,L).RlA<=calc.estaca(ex,'premoldada',30,L-1).RlA)monot=false;ok(monot,'atrito cresce com L');
// ---- PILAR: seção - compressão pura e flexão simples
const fcd=25/14,sc=0.85*fcd;let N0=sc*20*40+8*42;ok(calc.pilarSec(20,40,25,8,N0*1.001)===null,'acima de N0');near(calc.pilarSec(20,40,25,8,N0*0.9999),0,40,'M ~0 perto de N0');
const M0=calc.pilarSec(20,40,25,8,0),apx=4*43.478*(36-4);ok(M0>0.9*apx&&M0<1.08*apx,`flexão simples ${M0} ~ ${apx}`);
let mon=true;for(let As=2;As<30;As+=2)if(calc.pilarSec(20,40,25,As+2,600)<=calc.pilarSec(20,40,25,As,600))mon=false;ok(mon,'MRd cresce com As');
// validação independente: modelo de fibras com parábola-retângulo
const fib=(b,h,fck,As,Nd)=>{const fcd=fck/14,fyd=50/1.15,dp=4,d=h-dp,sig=e=>Math.max(-fyd,Math.min(fyd,21000*e)),sc=e=>e<=0?0:e>=0.002?0.85*fcd:0.85*fcd*(1-(1-e/0.002)**2),x2=0.0035/0.0135*d;
  const eps=(x,y)=>x>h?0.002*(x-y)/(x-3*h/7):x<=x2?0.010*(x-y)/(d-x):0.0035*(x-y)/x,F=x=>{let N=0,M=0;const k=2000;for(let i=0;i<k;i++){const y=(i+.5)*h/k,s=sc(eps(x,y))*b*h/k;N+=s;M+=s*(h/2-y)}const s1=sig(eps(x,dp)),s2=sig(eps(x,d));return{N:N+As/2*(s1+s2),M:M+As/2*s1*(h/2-dp)-As/2*s2*(d-h/2)}};
  let lo=1e-6,hi=1e4*h;for(let j=0;j<200;j++){const m=(lo+hi)/2;if(F(m).N<Nd)lo=m;else hi=m}return F(hi).M};
const rect=(b,h,fck,As,Nd)=>{const fcd=fck/14,fyd=50/1.15,dp=4,d=h-dp,sig=e=>Math.max(-fyd,Math.min(fyd,21000*e)),x2=0.0035/0.0135*d,eps=(x,y)=>x>h?0.002*(x-y)/(x-3*h/7):x<=x2?0.010*(x-y)/(d-x):0.0035*(x-y)/x,
  F=x=>{const yb=Math.min(0.8*x,h),Nc=0.85*fcd*b*yb,s1=sig(eps(x,dp)),s2=sig(eps(x,d));return{N:Nc+As/2*(s1+s2),M:Nc*(h/2-yb/2)+As/2*s1*(h/2-dp)-As/2*s2*(d-h/2)}};let lo=1e-6,hi=1e4*h;for(let j=0;j<200;j++){const m=(lo+hi)/2;if(F(m).N<Nd)lo=m;else hi=m}return F(hi).M};
for(const[b,h,As,Nd]of[[20,40,8,600],[20,40,12,1000],[25,25,10,800],[20,50,6,300],[30,30,16,1500]]){const a=calc.pilarSec(b,h,25,As,Nd),c=fib(b,h,25,As,Nd),q=rect(b,h,25,As,Nd);ok(Math.abs(a-c)/c<0.005,`app x fibras refinado ${b}x${h} ${a.toFixed(0)} vs ${c.toFixed(0)}`);ok(Math.abs(q-c)/c<0.07&&a<=q*1.001,`bloco retangular confere ${b}x${h} As${As} N${Nd}: ${q.toFixed(0)} vs ${c.toFixed(0)}`)}
for(const[b,h,As,Nd]of[]){const a=0,c=1;ok(Math.abs(a-c)/c<0.05,`x ${b}x${h} As${As} N${Nd}: ${a.toFixed(0)} vs ${c.toFixed(0)}`)}
r=calc.pilar(20,40,25,800,280);
ok(!r.erro&&r.dx.every(q=>q.MRd>=q.Md-1e-6),'pilar atende');ok(calc.pilarSec(20,40,25,r.As*0.97,r.Nd)<r.dx[1].Md||calc.pilarSec(40,20,25,r.As*0.97,r.Nd)<r.dx[0].Md||r.As===r.Asmin,'As mínima necessária');
near(r.gn,1,1e-12,'gn b=20');near(calc.pilar(15,40,25,300,280).gn,1.2,1e-12,'gn b=15');ok(calc.pilar(12,40,25,300,280).erro,'b<14');ok(calc.pilar(14,20,25,100,280).erro,'Ac<360');
ok(calc.pilar(20,40,25,2500,280).erro,'carga excessiva');ok(calc.pilar(14,30,25,200,500).erro,'λ>90');
const rr=calc.pilar(20,20,25,200,200);ok(rr.dx[0].M2===0,'λ<35 sem 2ª ordem λ='+rr.dx[0].lam.toFixed(1));
ok(r.bar&&r.bar.area>=r.As&&r.bar.n%2===0&&r.bar.n>=4,'barras');ok(r.estribo.s<=20&&r.estribo.s<=12*r.bar.f/10,'estribo espaçamento');
// ---- ESGOTO
r=calc.esgoto({bacia:1,chuveiro:1,lavatorio:1,pia:1,tanque:1,maqroupa:1},4,8,1);
ok(r.uUn===18,'UHC unidade 18');ok(r.uTot===576,'UHC total');ok(r.tq===150,'TQ 150 (500<576<=1900, por pav 72<=330)');ok(r.col===150,'coletor 150 a 1%');
r=calc.esgoto({bacia:1,chuveiro:1,lavatorio:1,pia:1,tanque:1},1,1,2);ok(r.uTot===15&&r.tq===100&&r.col===100,'casa: TQ e coletor DN100');
ok(calc.esgoto({lavatorio:1},1,1,1).tq===40&&calc.esgoto({lavatorio:1},1,1,0.5).col===150,'sem bacia DN40; 0,5% só DN150+');
ok(calc.esgoto({bacia:1,chuveiro:1,lavatorio:1},1,1,1).ramal===50,'ramal caixa sifonada 50');
ok(calc.esgoto({bacia:1},40,40,4).col===null||calc.esgoto({bacia:1},40,40,4).col===400,'coletor grande');
// ---- ELÉTRICA
ok(calc.ilum(5)===100&&calc.ilum(6)===100&&calc.ilum(9.9)===100&&calc.ilum(10)===160&&calc.ilum(16)===220,'iluminação NBR 5410');
let t=calc.tugs('cozinha',9,12);ok(t.n===4&&t.va===1900,'cozinha 12 m: 4 TUG 1900 VA '+JSON.stringify(t));t=calc.tugs('sala',16,16);ok(t.n===4&&t.va===400,'sala 16 m');t=calc.tugs('banheiro',3.6,7.6);ok(t.n===1&&t.va===600,'banheiro');
t=calc.tugs('outro',4,8);ok(t.n===1,'hall pequeno');t=calc.tugs('servico',4,7);ok(t.n===2&&t.va===1200,'serviço 7 m');
let c=calc.circuito(5500,220,12,'tue',1);ok(c.ok&&c.S===4&&c.In===25,'chuveiro 5500 W '+JSON.stringify(c));
c=calc.circuito(1000,127,15,'ilum',1);ok(c.S===1.5&&c.In===10,'iluminação 1,5 mm²');
c=calc.circuito(2000,127,40,'tug',1);ok(c.ok&&c.S>2.5&&c.crit==='queda de tensão','queda governa '+JSON.stringify(c));
c=calc.circuito(4000,127,5,'tue',3);ok(c.ok&&c.Iz>=c.In&&c.crit==='capacidade de corrente','agrupamento governa '+JSON.stringify(c));
ok(c.dv<=4,'queda ≤ 4%');ok(!calc.circuito(20000,127,100,'tue',9).ok,'circuito impossível');
near(calc.circuito(1270,127,10,'tug',1).dv,200*10*10/(56*2.5*127),1e-12,'fórmula queda');
console.log(`${n-f}/${n} testes da onda 2 passaram`);process.exit(f?1:0);
