// Calculadoras da fase 2: estribos, momentos de laje, pré-dimensionamento de pilar,
// fossa séptica e sumidouro, dosagem ABCP e quantitativo de parede. Rode com: node testes/fase2.test.js
const fs=require('fs'),path=require('path');
const src=fs.readFileSync((process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null)||path.join(__dirname,'..','js','calc.js'),'utf8');
const {calc}=new Function(src.split('// CALC-START')[1].split('// CALC-END')[0]+';return{calc}')();
let n=0,f=0;const ok=(c,m)=>{n++;if(!c){f++;console.log('FAIL',m)}},near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
// ---- Navier x Timoshenko (Theory of Plates, tabela 8, ν = 0,3): Mx = β q a², w = α q a⁴ / D
for(const [r,bx,by,al] of [[1,0.0479,0.0479,0.00406],[1.5,0.0812,0.0498,0.00772],[2,0.1017,0.0464,0.01013]]){const x=calc.navier(1,r,0.3);near(x.cx,bx,0.0002,'Navier Mx b/a='+r);near(x.cy,by,0.0002,'Navier My b/a='+r);near(x.cw,al,0.00003,'Navier w b/a='+r)}
const lg=calc.navier(1,20,0.2);near(lg.cx,0.125,0.001,'placa muito alongada tende a faixa q·l²/8');near(lg.cw,5/384,0.0002,'flecha tende a 5/384');
ok(calc.navier(3,4).cx===calc.navier(6,8).cx,'coeficiente só depende de λ');
// ---- estribos (cálculo à mão: 15 × 40, C25, Vk 60)
let r=calc.estribos(15,40,25,60);near(r.VRd2,0.27*0.9*25/14*15*36,1e-9,'VRd2');near(r.Vc,0.6*0.7*0.3*25**(2/3)/1.4/10*15*36,1e-9,'Vc0');
near(r.aswS,(84-r.Vc)/(0.9*36*50/1.15),1e-12,'Asw/s');near(100*r.aswMin,0.2*0.3*25**(2/3)/500*15*100,1e-9,'Asw mínimo');ok(r.s===13&&r.lim&&r.ok,'φ5 c/13 '+r.s);
r=calc.estribos(14,30,25,20);ok(r.minGoverna&&r.Vsw===0&&r.s===15,'cortante baixo: mínimo e smáx = 0,6d');
r=calc.estribos(20,50,25,250,8);ok(!r.lim&&r.smax<=20&&r.s<=Math.floor(r.smax),'cortante alto: smáx = 0,3d');
ok(!calc.estribos(12,30,20,300).ok,'bielas esmagam');
let m0=0,mono=true;for(let V=10;V<=200;V+=10){const x=calc.estribos(20,50,25,V).asw;if(x<m0-1e-12)mono=false;m0=x}ok(mono,'Asw cresce com V');
// ---- laje
r=calc.lajeMomentos(4,5,10,1,1.5,25);near(r.p,5,1e-9,'p');ok(!r.uma&&r.Mx>r.My,'em cruz, Mx > My');near(r.Mx,calc.navier(4,5).cx*5*16,1e-9,'Mx Navier');
ok(r.ax.esc.area>=r.ax.Asf-1e-9&&r.ax.esc.s<=20,'armadura fornecida ≥ necessária');ok(r.ay.esc.area>=r.ay.Asf-1e-9,'armadura y');
r=calc.lajeMomentos(3,7,10,1,1.5,25);ok(r.uma,'λ > 2 uma direção');near(r.Mx,5*9/8,1e-9,'faixa q l²/8');ok(r.ay.dist&&r.ay.Asf>=0.9&&r.ay.Asf>=0.2*r.ax.Asf,'armadura de distribuição');
r=calc.lajeMomentos(4,4,10,1,1.5,25);near(r.Mx,r.My/ (r.My/r.Mx),1e-9,'quadrada');near(r.Mx,0.0442*5*16,0.03,'quadrada ν 0,2: 0,0442 p lx²');
ok(calc.lajeMomentos(7,8,8,1,3,20).ax.inviavel||calc.lajeMomentos(7,8,8,1,3,20).wt>calc.lajeMomentos(7,8,8,1,3,20).lim,'laje fina demais é sinalizada');
near(calc.lajeMomentos(4,5,10,1,1.5,25).Ecs,0.85*5600*5,1e-9,'Ecs');
// ---- pré-dimensionamento
r=calc.preDimPilar(16,4,10,'intermediario',25,20);near(r.Nk,640,1e-9,'Nk');near(r.Nd,1.4*1.3*640,1e-9,'Nd');near(r.Ac,r.Nd/(0.85*25/14+0.01*(42-0.85*25/14)),1e-9,'Ac');ok(r.b*r.h>=r.Ac&&r.h%5===0&&r.h===35,'20 × 35');
ok(calc.preDimPilar(16,4,10,'canto',25,20).Ac>calc.preDimPilar(16,4,10,'extremidade',25,20).Ac,'canto > extremidade');
r=calc.preDimPilar(2,1,8,'intermediario',25,19);ok(r.Acf>=360,'mínimo 360 cm²');r=calc.preDimPilar(9,2,10,'canto',25,14);near(r.gn,1.25,1e-9,'γn b=14');
ok(calc.preDimPilar(60,20,12,'canto',20,14).parede,'pilar-parede sinalizado');
// ---- fossa / sumidouro / caixa de gordura
r=calc.fossa(5,130,1,1,'quente');near(r.V,1935,1e-9,'V = 1000 + 5(130 + 57)');ok(r.T===1&&r.K===57&&r.hu===1.2&&r.W>=0.8&&r.L*r.W*r.hu>=r.V/1000-1e-9,'dimensões');
r=calc.fossa(40,160,1,2,'frio');ok(r.cd===6400&&r.T===0.67&&r.K===134&&r.hu===1.8,'6.400 L/dia: T 0,67, K 134 '+r.V);
r=calc.fossa(20,100,1,5,'medio');ok(r.cd===2000&&r.T===0.92&&r.K===225,'tabelas T e K');near(r.V,1000+20*(92+225),1e-9,'V');
r=calc.sumidouro(650,60,1.5);near(Math.PI*1.5*r.h+Math.PI*1.5**2/4,650/60,1e-9,'área do sumidouro');ok(r.hAdot>=r.h,'h adotado');
ok(calc.caixaGordura(1,5).V===31&&calc.caixaGordura(2,8).V===120&&calc.caixaGordura(10,200).V===420,'caixas de gordura');
// ---- dosagem
r=calc.dosagem(25,5.5,'80',19,2.6,2);near(r.fcj,25+1.65*5.5,1e-9,'fcj');ok(r.ac===0.5&&r.Ca===205&&Math.abs(r.C-410)<1e-9,'a/c, água, cimento');
near(r.C/3100+r.Cb/2700+r.Ca/1000+r.Cm/2650,1,1e-9,'volumes somam 1 m³');near(r.Vb,0.625,1e-9,'Vb tabela');
r=calc.dosagem(20,7,'80',19,2.6,3);ok(r.ac<=0.55&&r.C>=320&&!r.okFck,'classe III limita a/c, consumo e fck');
r=calc.dosagem(20,4,'40',38,3.4,1);ok(r.ac<=0.65,'classe I a/c ≤ 0,65');ok(r.a>0&&r.p>0,'traço positivo');
for(const s of ['40','60','80'])for(const d of [9.5,19,25,32,38])for(let mf=1.8;mf<=3.61;mf+=0.2){const x=calc.dosagem(30,4,s,d,mf,2);ok(x.Va>0&&x.Cm>0,`areia positiva ${s}/${d}/${mf.toFixed(1)}`)}
// ---- parede
r=calc.parede(10,2.8,3.2,'Cerâmico 14 × 19 × 29',1,2,2,[1,2,8]);near(r.A,24.8,1e-9,'área líquida');near(r.nb,1/(0.3*0.2),1e-9,'blocos/m²');ok(r.blocos===Math.ceil(24.8/0.06*1.05),'blocos com perda');
near(r.Vreb,24.8*2*0.02*1.1,1e-9,'reboco');near(r.Vass,24.8*(1-r.nb*0.29*0.19)*0.14*1.1,1e-9,'assentamento');
near(calc.parede(1,1,0,'Concreto 14 × 19 × 39',1,2,1,[1,2,8]).nb,12.5,1e-9,'bloco de concreto 12,5/m²');near(calc.parede(1,1,0,'Cerâmico 9 × 19 × 19',1,2,1,[1,2,8]).nb,25,1e-9,'25/m²');
ok(calc.parede(10,2.8,3.2,'Cerâmico 14 × 19 × 29',1,2,2,[1,0,4]).cal===0,'traço sem cal');ok(calc.parede(3,3,20,'Cerâmico 9 × 19 × 19',1,2,2,[1,2,8]).A===0,'vão maior que a parede');
console.log(`${n-f}/${n} testes da fase 2 passaram`);process.exit(f?1:0);
