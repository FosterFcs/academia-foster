// Testes automáticos. Rode com: node testes/geografico.test.js
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||require('path').join(__dirname,'..','js','sig.js'),'utf8');
const code=src.includes('// GEO-START')?src.split('// GEO-START')[1].split('// GEO-END')[0]:src;
const GEO=new Function(code+';return GEO')();
let n=0,fail=0;const ok=(c,m)=>{n++;if(!c){fail++;console.log('FAIL',m)}};const near=(a,b,t,m)=>ok(Math.abs(a-b)<=t,`${m}: ${a} vs ${b}`);
// UTM vs pyproj (EPSG:4674 -> 31983)
const ref=[[-46.92,-23.44,303853.7401,7406463.3551],[-45,-23,500000,7456480.2365],[-47.9,-20.1,196737.2863,7774813.5480],[-43.2,-22.9,684623.6733,7466421.4007]];
for(const[lon,lat,E,N]of ref){const r=GEO.direta(lat,lon,23);near(r.E,E,0.005,'E '+lon);near(r.N,N,0.005,'N '+lat);const g=GEO.inversa(E,N,23,true);near(g.lat,lat,1e-8,'lat inv');near(g.lon,lon,1e-8,'lon inv')}
ok(GEO.zona(-46.9)===23&&GEO.zona(-51)===22&&GEO.zona(-38.5)===24,'zonas');ok(GEO.mc(23)===-45,'MC 23');
// dms / az
ok(GEO.dms(89.999999)==="90°00'00\"",'carry '+GEO.dms(89.999999));ok(GEO.azStr(359.99999)==="0°00'00\"",'360->0');
near(GEO.az([0,0],[1,0]),90,1e-12,'az leste');near(GEO.az([0,0],[0,1]),0,1e-12,'az norte');near(GEO.az([0,0],[0,-1]),180,1e-12,'az sul');near(GEO.az([0,0],[-1,0]),270,1e-12,'az oeste');
ok(GEO.dms(23.5,2)==="23°30'00,00\"",'dms 2 casas '+GEO.dms(23.5,2));
// horario / pip
const sq=[[0,0],[10,0],[10,10],[0,10]];ok(GEO.areaAss(GEO.horario(sq))<0,'horario');ok(GEO.horario(sq)[0][0]===0,'mantem V1');ok(GEO.pip(5,5,sq)&&!GEO.pip(11,5,sq),'pip');
// Delaunay: propriedade do círculo vazio + área = envoltória convexa
let seed=3;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const hull=P=>{const p=P.map(q=>[q.E,q.N]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}for(const q of p.reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}return lo.slice(0,-1).concat(up.slice(0,-1))};
for(const N of [10,50,200]){const P=[];for(let i=0;i<N;i++)P.push({E:313000+rnd()*80,N:7402000+rnd()*60,z:740+rnd()*5});
  const T=GEO.delaunay(P);let at=0,viol=0;
  for(const t of T){const[a,b,c]=t.map(i=>P[i]);at+=Math.abs((b.E-a.E)*(c.N-a.N)-(c.E-a.E)*(b.N-a.N))/2;
    const ax=a.E-b.E,ay=a.N-b.N,bx=0,by=0,cx=c.E-b.E,cy=c.N-b.N,d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by)),ux=((ax*ax+ay*ay)*(by-cy)+(cx*cx+cy*cy)*(ay-by))/d,uy=((ax*ax+ay*ay)*(cx-bx)+(cx*cx+cy*cy)*(bx-ax))/d,r2=(ax-ux)**2+(ay-uy)**2;
    P.forEach((p,i)=>{if(t.includes(i))return;if((p.E-b.E-ux)**2+(p.N-b.N-uy)**2<r2*(1-1e-7))viol++})}
  const H=hull(P);near(at,Math.abs(GEO.areaAss(H)),1e-6*at,'area TIN = envoltoria N='+N);ok(viol===0,'circulo vazio N='+N+' viol='+viol);
  const h=H.length;ok(T.length===2*N-2-h,`n triangulos N=${N}: ${T.length} vs ${2*N-2-h}`)}
ok(GEO.delaunay([{E:0,N:0,z:0},{E:1,N:1,z:0},{E:2,N:2,z:0}]).length===0,'colineares sem triangulo');
ok(GEO.delaunay([{E:0,N:0,z:0},{E:0,N:0,z:1},{E:1,N:0,z:0},{E:0,N:1,z:0}]).length===1,'duplicado ignorado');
// plano: interpolação exata, curvas, volume
const plano=[];for(let i=0;i<=4;i++)for(let j=0;j<=2;j++)plano.push({E:i*5,N:j*5,z:100+0.1*i*5});plano.push({E:7.3,N:3.1,z:100+0.73});
const TP=GEO.delaunay(plano);near(GEO.interp(plano,TP,12.34,6.7),101.234,1e-9,'interp plano');ok(GEO.interp(plano,TP,25,5)===null,'fora do TIN');
const cv=GEO.curvas(plano,TP,0.5);let maxErr=0;cv.segs.forEach(s=>{maxErr=Math.max(maxErr,Math.abs(100+0.1*s.x1-s.z),Math.abs(100+0.1*s.x2-s.z))});ok(maxErr<1e-6,'curvas no lugar certo '+maxErr);
ok(new Set(cv.segs.map(s=>s.z)).size===4,'niveis 100 a 101,5 '+[...new Set(cv.segs.map(s=>s.z))]);
const g=GEO.volume(plano,TP,[[0,0],[20,0],[20,10],[0,10]]);const ca=GEO.cortaterro(g,101);near(ca.corte,50,0.5,'corte 50');near(ca.aterro,50,0.5,'aterro 50');near(g.zEq,101,0.01,'cota equilibrio');ok(g.nSem===0,'sem celulas fora');
const ca2=GEO.cortaterro(g,99);near(ca2.corte,(101-99)*200,2,'tudo corte');near(ca2.aterro,0,1e-9,'sem aterro');
const g2=GEO.volume(plano,TP,[[10,0],[30,0],[30,10],[10,10]]);near(g2.nSem/g2.nIn,0.5,0.02,'metade fora do levantamento');
const pf=GEO.perfil(plano,TP,[0,5],[20,5],100);near(pf.L,20,1e-12,'perfil L');near(pf.z[50],101,1e-9,'perfil meio');near(pf.z[100],102,1e-9,'perfil fim');
// CSV
let c=GEO.parseCSV('ponto;E;N;cota\nP1;313250,10;7402180,20;742,15\nP2;313260;7402190;743\n');ok(c.pts.length===2&&!c.geo&&near(c.pts[0].E,313250.1,1e-9,'csv E')!==false&&c.pts[0].z===742.15,'csv ; virgula decimal');
c=GEO.parseCSV('P1,313250.1,7402180.2,742.15\nP2,313260,7402190,743');ok(c.pts.length===2&&c.pts[1].nome==='P2'&&c.pts[0].N===7402180.2,'csv , sem cabeçalho');
c=GEO.parseCSV('1\t313250\t7402180\t742\n2\t313260\t7402190\t743');ok(c.pts.length===2&&c.pts[0].nome==='1'&&c.pts[0].E===313250,'csv tab numerado');
c=GEO.parseCSV('313250 ;7402180;742\n313260;7402190;743');ok(c.pts.length===2&&c.pts[1].z===743,'csv 3 colunas');
c=GEO.parseCSV('nome,lat,lon,alt\nA,-23.44,-46.92,740\nB,-23.441,-46.921,741');ok(c.geo&&c.pts[0].lat===-23.44&&c.pts[1].z===741,'csv lat lon');
c=GEO.parseCSV('Norte;Este;Cota\n7402180;313250;742');ok(c.pts[0].E===313250&&c.pts[0].N===7402180,'cabeçalho N antes de E');
c=GEO.parseCSV('-23.44;-46.92;740');ok(c.geo,'sem cabeçalho geográfico');ok(GEO.parseCSV('').erro,'vazio');ok(GEO.parseCSV('a;b\nc;d').erro,'lixo');
// memorial
const lote=GEO.horario([[313256,7402185],[313302,7402183],[313306,7402210],[313280,7402219],[313254,7402214]]);
const m=GEO.memorial(lote,['A','B','C','D','E'],{imovel:'Lote X',mun:'Cidade',zona:23,sul:true});
ok(m.texto.includes('vértice V1, de coordenadas')&&m.texto.includes('até o vértice V5')&&m.texto.endsWith('plano de projeção UTM.')&&m.texto.includes('ponto inicial'),'memorial estrutura');
ok(m.texto.includes('Meridiano central -45°'),'MC no memorial');near(m.lados.reduce((s,l)=>s+l.d,0),m.per,1e-9,'perimetro');
console.log(`${n-fail}/${n} testes geográficos passaram`);process.exit(fail?1:0);
