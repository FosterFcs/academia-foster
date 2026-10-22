// Testes automáticos da onda 3. Rode com: node testes/onda3.test.js
const fs=require('fs'),path=require('path');
const src=fs.readFileSync((process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null)||path.join(__dirname,'..','js','calc.js'),'utf8');
const code=src.split('// CALC-START')[1].split('// CALC-END')[0];
const X=new Function(code+';return{calc,PERFIS_W,MADEIRAS}')(),calc=X.calc;
let n=0,f=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}},near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
const show=process.argv.includes('--exemplos');
// ---- AÇO: propriedades geométricas conferidas à mão (W 310 x 32,7: d 31,3; bf 10,2; tw 0,66; tf 1,08 cm)
let P=calc.perfilW('W 310 x 32,7');const h=31.3-2*1.08;
near(P.A,2*10.2*1.08+h*0.66,1e-9,'área');near(P.massa,P.A*0.785,1e-9,'massa');ok(Math.abs(P.massa-32.7)/32.7<0.03,'massa ~ nominal '+P.massa);
near(P.Ix,(10.2*31.3**3-(10.2-0.66)*h**3)/12,1e-6,'Ix');near(P.Zx,10.2*1.08*(31.3-1.08)+0.66*h*h/4,1e-9,'Zx');ok(P.Zx/P.Wx>1.08&&P.Zx/P.Wx<1.2,'fator de forma do I');
for(const k of Object.keys(X.PERFIS_W)){const q=calc.perfilW(k),nom=parseFloat(k.split('x')[1].replace(',','.'));ok(Math.abs(q.massa-nom)/nom<0.06,`massa ${k}: ${q.massa.toFixed(1)}`)}
// FLT: no limite λr, Mcr (Cb = 1) tem que igualar Mr — prova de que λr e Mcr estão coerentes
for(const k of Object.keys(X.PERFIS_W)){const r=calc.vigaAco(k,345,6,5,3,1,1),Lr=r.FLT.lr*r.P.ry/100,r2=calc.vigaAco(k,345,6,5,3,Lr,1);ok(Math.abs(r2.FLT.Mcr-r2.Mr)/r2.Mr<0.005,`coerência λr x Mcr ${k}: ${r2.FLT.Mcr.toFixed(0)} vs ${r2.Mr.toFixed(0)}`)}
let r=calc.vigaAco('W 310 x 32,7',345,6,5,3,0.5,1);near(r.MRd,Math.min(r.Mpl,1.5*r.P.Wx*34.5)/1.1,1e-6,'travada: MRd = Mpl/1,1');ok(r.gov==='plastificação total','travada: plastificação total');
let m0=Infinity,mon=true;for(let Lb=0.5;Lb<=8;Lb+=0.25){const x=calc.vigaAco('W 310 x 32,7',345,8,5,3,Lb,1).MRd;if(x>m0+1e-6)mon=false;m0=x}ok(mon,'MRd cai com Lb');
ok(calc.vigaAco('W 310 x 32,7',345,6,5,3,6,1.14).MRd>calc.vigaAco('W 310 x 32,7',345,6,5,3,6,1).MRd,'Cb maior ajuda');
r=calc.vigaAco('W 310 x 32,7',345,6,5,3,6,1.14);near(r.Msd,(1.4*(5+r.pp)+1.5*3)*36/8*100,1e-6,'Msd');near(r.flecha,5*(8+r.pp)/100*600**4/(384*20000*r.P.Ix),1e-9,'flecha');
const sh=calc.perfilW('W 310 x 32,7');near(r.VRd,0.6*sh.d*sh.tw*34.5/1.1,1e-6,'cortante alma compacta');
ok(r.FLA.l<r.FLA.lp&&r.FLM.l<r.FLM.lp,'W 310 compacta em alma e mesa');
if(show){const t=calc.vigaAco('W 310 x 32,7',345,6,5,3,2,1);console.log('EX AÇO Lb2',JSON.stringify({MRd:t.MRd,gov:t.gov,FLTl:t.FLT.l,lp:t.FLT.lp,lr:t.FLT.lr,M:t.FLT.M,Msd:t.Msd}))}
if(show)console.log('EX AÇO',JSON.stringify({pp:r.pp,qd:r.qd,Msd:r.Msd,Mpl:r.Mpl,MRd:r.MRd,gov:r.gov,FLT:r.FLT,VRd:r.VRd,Vsd:r.Vsd,flecha:r.flecha,lim:r.lim,Zx:r.P.Zx,Wx:r.P.Wx,ry:r.P.ry,Ix:r.P.Ix}));
// ---- MADEIRA: cálculo à mão
let w=calc.vigaMadeira('Dicotiledônea C30',6,12,3,0.6,0.8,0.25,0.7,1,0.8);const km=0.56,pp=800*0.00981*0.06*0.12;
near(w.kmod,km,1e-12,'kmod');near(w.fcd,km*30/1.4,1e-12,'fcd');near(w.pp,pp,1e-12,'peso próprio');
const gl=0.8*0.6+pp,ql=0.25*0.6,Fd=1.4*(gl+ql),Md=Fd*9/8;near(w.Md,Md,1e-12,'Md');near(w.sig,Md*1e6/(6*144/6*1000),1e-9,'σ');
near(w.tau,1.5*Fd*1.5*1000/(6*12*100),1e-9,'τ');near(w.flecha,5*(gl+0.2*ql)*3000**4/(384*km*14500*6*1728/12*1e4),1e-9,'flecha');near(w.lim,15,1e-12,'L/200');
ok(calc.vigaMadeira('Dicotiledônea C30',6,16,3,0.6,0.8,0.25,0.7,1,0.8).sig<w.sig,'seção maior, tensão menor');
if(show)console.log('EX MADEIRA',JSON.stringify(w));
// ---- RESERVATÓRIO
let v=calc.reservatorio(16,200,2,6000,true,6,1.5);near(v.diario,3200,1e-9,'diário');near(v.reserva,6400,1e-9,'reserva 2 dias');near(v.inf,3840,1e-9,'60% inferior');near(v.sup,2560+6000,1e-9,'40% + RTI');
ok(v.caixaSup.cap===10000&&v.caixaSup.n===1,'caixa superior 10.000 L');near(v.Dmm,1000*1.3*Math.sqrt(3200/6/3.6e6)*0.25**0.25,1e-9,'Forchheimer');ok(v.rec>=v.Dmm&&v.suc>v.rec,'DN recalque e sucção');
v=calc.reservatorio(4,150,1,0,false,6,1);ok(v.inf===0&&v.sup===600&&v.caixaSup.cap===1000,'casa sem recalque');
v=calc.reservatorio(200,200,2,0,false,6,1);ok(v.caixaSup.n===4&&v.caixaSup.cap===20000,'várias caixas grandes');
if(show)console.log('EX RES',JSON.stringify(calc.reservatorio(16,200,2,6000,true,6,1.5)));
// ---- PAVIMENTO (DNIT)
near(calc.espessuraH(1e6,10),77.67*1e6**0.0482*10**-0.598,1e-12,'H');ok(calc.espessuraH(1e7,5)>calc.espessuraH(1e6,5)&&calc.espessuraH(1e6,5)>calc.espessuraH(1e6,10),'H cresce com N e cai com CBR');
for(const[N,cs,cr]of[[5e5,8,null],[3e6,5,null],[8e6,4,12],[2e7,6,null],[8e7,3,10]]){const p=calc.pavimento(N,cs,cr);
  ok(p.R*p.KR+p.B>=p.H20-1e-9,`base cobre H20 N=${N}`);ok(p.R*p.KR+p.B+p.h20+p.hn>=p.Hm-1e-9,`total cobre Hm N=${N}`);if(p.temRef)ok(p.R*p.KR+p.B+p.h20>=p.Hn-1e-9,`sub-base cobre Hn N=${N}`);ok(p.B>=15,'base mínima')}
ok(calc.pavimento(5e5,8,null).R===0&&calc.pavimento(3e6,8,null).R===5&&calc.pavimento(8e6,8,null).R===7.5&&calc.pavimento(2e7,8,null).R===10&&calc.pavimento(8e7,8,null).R===12.5,'revestimento pela tabela do DNIT');
near(calc.numeroN(1000,1,0,1,1),365000,1e-6,'N simples');near(calc.numeroN(100,2,10,2,0.5),365*(100+110)*2*0.5,1e-6,'N com crescimento');
if(show)console.log('EX PAV',JSON.stringify(calc.pavimento(3e6,6,null)),calc.numeroN(800,10,3,2.5,0.5));
console.log(`${n-f}/${n} testes da onda 3 passaram`);process.exit(f?1:0);
