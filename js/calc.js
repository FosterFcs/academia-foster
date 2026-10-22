// Funções de cálculo (sem dependência de tela). Testadas em testes/*.test.js
// CALC-START
const ROMIN={20:.150,25:.150,30:.150,35:.164,40:.179,45:.194,50:.208};
const SOLOS={'Areia':{K:1.00,a:1.4,g:'areia',C:400},'Areia siltosa':{K:0.80,a:2.0,g:'areia',C:400},'Areia silto-argilosa':{K:0.70,a:2.4,g:'areia',C:400},'Areia argilosa':{K:0.60,a:3.0,g:'areia',C:400},'Areia argilo-siltosa':{K:0.50,a:2.8,g:'areia',C:400},
 'Silte':{K:0.40,a:3.0,g:'silte',C:250},'Silte arenoso':{K:0.55,a:2.2,g:'silte',C:250},'Silte areno-argiloso':{K:0.45,a:2.8,g:'silte',C:250},'Silte argiloso':{K:0.23,a:3.4,g:'silte',C:200},'Silte argilo-arenoso':{K:0.25,a:3.0,g:'silte',C:200},
 'Argila':{K:0.20,a:6.0,g:'argila',C:120},'Argila arenosa':{K:0.35,a:2.4,g:'argila',C:120},'Argila areno-siltosa':{K:0.30,a:2.8,g:'argila',C:120},'Argila siltosa':{K:0.22,a:4.0,g:'argila',C:120},'Argila silto-arenosa':{K:0.33,a:3.0,g:'argila',C:120}};
const UM={argila:1,silte:1,areia:1};
const TIPOS_ESTACA={premoldada:{nome:'Pré-moldada de concreto',F1:1.75,F2:3.5,alfa:UM,beta:UM},metalica:{nome:'Metálica',F1:1.75,F2:3.5,alfa:UM,beta:UM},franki:{nome:'Franki',F1:2.5,F2:5.0,alfa:UM,beta:UM},
 escavada:{nome:'Escavada (trado ou broca)',F1:3.0,F2:6.0,alfa:{argila:.85,silte:.6,areia:.5},beta:{argila:.8,silte:.65,areia:.5}},helice:{nome:'Hélice contínua',F1:2.0,F2:4.0,alfa:{argila:.3,silte:.3,areia:.3},beta:UM},raiz:{nome:'Raiz',F1:2.0,F2:4.0,alfa:{argila:.85,silte:.6,areia:.5},beta:{argila:1.5,silte:1.5,areia:1.5}}};
const APARELHOS={bacia:[6,100,'Bacia sanitária'],chuveiro:[2,40,'Chuveiro'],lavatorio:[1,40,'Lavatório'],pia:[3,50,'Pia de cozinha'],tanque:[3,40,'Tanque de lavar roupa'],maqroupa:[3,50,'Máquina de lavar roupa'],maqlouca:[2,50,'Máquina de lavar louça'],banheira:[2,40,'Banheira'],bide:[1,40,'Bidê']};
const TUBO_QUEDA=[[40,4,8,2],[50,10,24,6],[75,30,70,12],[100,240,500,84],[150,960,1900,330],[200,2200,3600,600],[250,3800,5600,1000],[300,6000,8400,1500]];
const COLETOR={100:[null,216,250,300],150:[700,840,1000,1200],200:[1400,1600,1920,2300],250:[2500,2900,3500,4200],300:[3900,4600,5600,6700],400:[7000,8300,10000,12000]};
const RAMAL_ESG=[[40,3],[50,6],[75,20],[100,160]];
const SECOES=[1.5,2.5,4,6,10,16,25,35],CAPB1={1.5:17.5,2.5:24,4:32,6:41,10:57,16:76,25:101,35:125},FAGRUP=[1,1,0.8,0.7,0.65,0.6,0.57,0.54,0.52,0.5],DISJ=[6,10,13,16,20,25,32,40,50,63,70,80,100];
// Onda 3: perfis W (dimensões nominais d, bf, tw, tf em mm), madeiras NBR 7190 (1997), caixas e diâmetros comerciais
const PERFIS_W={'W 150 x 13,0':[148,100,4.3,4.9],'W 200 x 15,0':[200,100,4.3,5.2],'W 200 x 22,5':[206,102,6.2,8.0],'W 250 x 25,3':[257,102,6.1,8.4],'W 310 x 32,7':[313,102,6.6,10.8],'W 360 x 39,0':[353,128,6.5,10.7],'W 410 x 46,1':[403,140,7.0,11.2],'W 460 x 52,0':[450,152,7.6,10.8]};
const MADEIRAS={'Conífera C20':{fc:20,fv:4,E:3500,rho:400},'Conífera C25':{fc:25,fv:5,E:8500,rho:450},'Conífera C30':{fc:30,fv:6,E:14500,rho:500},'Dicotiledônea C20':{fc:20,fv:4,E:9500,rho:650},'Dicotiledônea C30':{fc:30,fv:5,E:14500,rho:800},'Dicotiledônea C40':{fc:40,fv:6,E:19500,rho:950},'Dicotiledônea C60':{fc:60,fv:8,E:24500,rho:1000}};
const CAIXAS=[310,500,1000,1500,2000,3000,5000,10000,15000,20000],DN_RECALQUE=[20,25,32,40,50,60,75,85,110];
const calc={
  viga(L,q,P,a,N=400){
    const RB=q*L/2+P*a/L,RA=q*L+P-RB,xs=[],V=[],M=[];
    for(let i=0;i<=N;i++){const x=L*i/N;xs.push(x);V.push(RA-q*x-(x>a?P:0));M.push(RA*x-q*x*x/2-(x>a?P*(x-a):0));}
    let iM=0;M.forEach((m,i)=>{if(Math.abs(m)>Math.abs(M[iM]))iM=i});
    return{RA,RB,xs,V,M,Mmax:M[iM],xM:xs[iM],Vmax:Math.max(Math.abs(RA),Math.abs(RB))};
  },
  balanco(L,q,P,N=200){
    const R=q*L+P,M0=q*L*L/2+P*L,xs=[],V=[],M=[];
    for(let i=0;i<=N;i++){const x=L*i/N,r=L-x;xs.push(x);V.push(q*r+P);M.push(-(q*r*r/2+P*r));}
    return{R,M0,xs,V,M};
  },
  flexao(bw,h,fck,Mk,c=4){
    const d=h-c,fcd=fck/14,fyd=50/1.15,Md=1.4*Mk*100,k=Md/(0.425*bw*d*d*fcd);
    if(k>=1)return{d,fcd,fyd,Md,k,inviavel:true,ok:false};
    const x=1.25*d*(1-Math.sqrt(1-k)),xd=x/d,As=Md/(fyd*(d-0.4*x)),Asmin=(ROMIN[fck]??0.15)/100*bw*h,Asf=Math.max(As,Asmin);
    return{d,fcd,fyd,Md,k,x,xd,As,Asmin,Asf,ok:xd<=0.45,inviavel:false};
  },
  barras(Asf,bw){
    const livre=bw-2*(2.5+0.5);
    for(const f of [8,10,12.5,16,20,25]){
      const a=Math.PI*(f/10)**2/4,n=Math.max(2,Math.ceil(Asf/a-1e-9)),ah=Math.max(2,f/10,2.3);
      if(n*f/10+(n-1)*ah<=livre)return{f,n,area:n*a,camadas:1};
    }
    const a=Math.PI*2.5**2/4,n=Math.max(2,Math.ceil(Asf/a-1e-9));return{f:25,n,area:n*a,camadas:2};
  },
  sapata(N,nspt,a0,b0){
    const sadm=20*nspt,A=1.05*N/sadm,dA=(a0-b0)/100,up=v=>Math.ceil(v*20-1e-9)/20;
    const B=up((-dA+Math.sqrt(dA*dA+4*A))/2),L=up(B+dA),sig=1.05*N/(B*L),h=up(Math.max((L-a0/100)/3,(B-b0/100)/3,0.25));
    return{sadm,A,B,L,sig,h};
  },
  hazen(Qls,Dmm,Lm,C){
    const Q=Qls/1000,D=Dmm/1000,v=4*Q/(Math.PI*D*D),J=10.643*Q**1.85/(C**1.85*D**4.87);
    return{v,J,hf:J*Lm};
  },
  traco(a,p,x,vol){
    const C=1000/(1/3.1+a/2.65+p/2.7+x),cim=C*vol;
    return{C,cim,sacos:Math.ceil(cim/50-1e-9),areia:a*cim/1500,brita:p*cim/1450,agua:x*cim,
      porSaco:{areiaL:a*50/1.5,britaL:p*50/1.45,areiaLatas:a*50/1.5/18,britaLatas:p*50/1.45/18,agua:x*50}};
  },
  area(pts){
    let s=0,p=0;const n=pts.length;
    for(let i=0;i<n;i++){const[x1,y1]=pts[i],[x2,y2]=pts[(i+1)%n];s+=x1*y2-x2*y1;p+=Math.hypot(x2-x1,y2-y1);}
    return{area:Math.abs(s)/2,soma:s,perim:p};
  },
  laje(lx,ly,h,rev,sc){
    if(lx>ly)[lx,ly]=[ly,lx];
    const pp=25*h/100,p=pp+rev+sc,lam=ly/lx,At=lx*lx/4,Atr=lx*ly/2-lx*lx/4,qc=p*At/lx,ql=p*Atr/ly,hs=Math.max(8,Math.ceil(lx*100/40));
    return{lx,ly,pp,p,lam,umaDir:lam>2,At,Atr,qc,ql,hs,total:p*lx*ly};
  },
  muro(H,b,B,phi,gs,gm){
    B=Math.max(B,b);
    const r=Math.PI/180,Ka=Math.tan((45-phi/2)*r)**2,Ea=0.5*Ka*gs*H*H,t=B-b,W1=t*H/2*gm,x1=2*t/3,W2=b*H*gm,x2=t+b/2,W=W1+W2,
      Mr=W1*x1+W2*x2,Mt=Ea*H/3,FSt=Mr/Mt,FSd=W*Math.tan(phi*r)/Ea,xr=(Mr-Mt)/W,e=B/2-xr,sm=W/B,smax=sm*(1+6*Math.abs(e)/B),smin=sm*(1-6*Math.abs(e)/B);
    return{B,Ka,Ea,W1,W2,x1,x2,W,Mr,Mt,FSt,FSd,xr,e,smax,smin,nucleo:Math.abs(e)<=B/6+1e-9};
  },
  pluvial(a,hc,b,I,wcm,ycm,i,n){
    const A=(a+hc/2)*b,Q=I*A/60,w=wcm/100,y=ycm/100,S=w*y,P=w+2*y,Rh=S/P,Qc=60000*S/n*Rh**(2/3)*Math.sqrt(i/100),
      dPrat=Math.sqrt(4*A/Math.PI)*10,cond=[75,100,125,150,200,250].find(d=>d>=dPrat)||300;
    return{A,Q,S,P,Rh,Qc,ok:Qc>=Q,dPrat,cond};
  },
  cpm(ts){
    const ids=ts.map(t=>t.id),by=Object.fromEntries(ts.map(t=>[t.id,t])),indeg={},succ={},pr={};
    ts.forEach(t=>{succ[t.id]=[];indeg[t.id]=0;pr[t.id]=[...new Set(t.pred)].filter(p=>by[p]&&p!==t.id)});
    ts.forEach(t=>pr[t.id].forEach(p=>{succ[p].push(t.id);indeg[t.id]++}));
    const ord=[],q=ids.filter(i=>!indeg[i]);
    while(q.length){const i=q.shift();ord.push(i);succ[i].forEach(s=>{if(--indeg[s]===0)q.push(s)})}
    if(ord.length<ts.length)return{erro:'Há um ciclo nas dependências: alguma tarefa acaba dependendo dela mesma.'};
    const ES={},EF={},LS={},LF={};
    ord.forEach(i=>{ES[i]=Math.max(0,...pr[i].map(p=>EF[p]));EF[i]=ES[i]+by[i].dur});
    const total=Math.max(0,...ids.map(i=>EF[i]));
    [...ord].reverse().forEach(i=>{LF[i]=succ[i].length?Math.min(...succ[i].map(s=>LS[s])):total;LS[i]=LF[i]-by[i].dur});
    const folga=Object.fromEntries(ids.map(i=>[i,LS[i]-ES[i]]));
    return{ES,EF,LS,LF,folga,total,pr,critico:ids.filter(i=>folga[i]===0)};
  },
  estaca(perfil,tipo,D,L){
    if(L<2||L>perfil.length)return{erro:`O comprimento precisa estar entre 2 m e a profundidade da sondagem (${perfil.length} m).`};
    const T=TIPOS_ESTACA[tipo],Dm=D/100,Ap=Math.PI*Dm*Dm/4,U=Math.PI*Dm,S=i=>SOLOS[perfil[i].solo],N=i=>Math.min(50,Math.max(0,perfil[i].N));
    const st=S(L-1),RpA=st.K*1000*N(L-1)/T.F1*Ap;let RlA=0;const fusteA=[];
    for(let i=0;i<L;i++){const s=S(i),r=U*s.a/100*s.K*1000*N(i)/T.F2;RlA+=r;fusteA.push(r)}
    const ip=[L-2,L-1,L].filter(i=>i>=0&&i<perfil.length),Np=ip.reduce((s,i)=>s+N(i),0)/ip.length,C=st.C;
    const RpD=T.alfa[st.g]*C*Np*Ap,fi=[];for(let i=0;i<L-2;i++)fi.push(Math.min(50,Math.max(3,perfil[i].N)));
    const Nl=fi.length?fi.reduce((a,b)=>a+b,0)/fi.length:3;let RlD=0;for(let i=0;i<L;i++)RlD+=T.beta[S(i).g]*10*(Nl/3+1)*U;
    const QA=(RpA+RlA)/2,QD=Math.min(RpD/4+RlD/1.3,(RpD+RlD)/2);
    return{Ap,U,RpA,RlA,QultA:RpA+RlA,QA,Np,C,Nl,RpD,RlD,QultD:RpD+RlD,QD,Qadm:Math.min(QA,QD),fusteA,ponta:st};
  },
  pilarSec(b,h,fck,As,Nd,k=100){
    const fcd=fck/14,fyd=50/1.15,Es=21000,dp=Math.min(4,0.2*h),d=h-dp,sig=e=>Math.max(-fyd,Math.min(fyd,Es*e)),x2=0.0035/(0.0035+0.010)*d,
      sc=e=>e<=0?0:e>=0.002?0.85*fcd:0.85*fcd*(1-(1-e/0.002)**2),eps=(x,y)=>x>h?0.002*(x-y)/(x-3*h/7):x<=x2?0.010*(x-y)/(d-x):0.0035*(x-y)/x;
    const F=x=>{let N=0,M=0;const dy=h/k;for(let i=0;i<k;i++){const y=(i+.5)*dy,f=sc(eps(x,y))*b*dy;N+=f;M+=f*(h/2-y)}const s1=sig(eps(x,dp)),s2=sig(eps(x,d));return{N:N+As/2*(s1+s2),M:M+As/2*s1*(h/2-dp)-As/2*s2*(d-h/2)}};
    const N0=0.85*fcd*b*h+As*sig(0.002);if(Nd>=N0||Nd<=-As*fyd)return null;
    let lo=1e-6,hi=1e4*h;for(let j=0;j<80;j++){const m=(lo+hi)/2;if(F(m).N<Nd)lo=m;else hi=m}
    return F((lo+hi)/2).M;
  },
  pilar(b,h,fck,Nk,le){
    const bm=Math.min(b,h),gn=bm<19?1.95-0.05*bm:1,Nd=gn*1.4*Nk,fcd=fck/14,fyd=50/1.15,Ac=b*h,nu=Nd/(Ac*fcd);
    const dir=(hd,bw,nome)=>{const lam=3.46*le/hd,M1=Nd*(1.5+0.03*hd),r1=Math.min(0.005/(hd*(nu+0.5)),0.005/hd),M2=lam>35?Nd*le*le/10*r1:0;return{nome,hd,bw,lam,M1,M2,Md:M1+M2}};
    const dx=[dir(b,h,'x (lado '+b+' cm)'),dir(h,b,'y (lado '+h+' cm)')];
    const Asmin=Math.max(0.15*Nd/fyd,0.004*Ac),Asmax=0.04*Ac,okAs=As=>dx.every(q=>{const m=calc.pilarSec(q.bw,q.hd,fck,As,Nd);return m!==null&&m>=q.Md});
    const r={bm,gn,Nd,nu,dx,Asmin,Asmax,lamMax:Math.max(...dx.map(q=>q.lam))};
    if(bm<14)return{...r,erro:'A NBR 6118 não admite pilar com menor dimensão abaixo de 14 cm (12 cm só em casos especiais).'};
    if(Ac<360)return{...r,erro:'A área da seção precisa ser de pelo menos 360 cm².'};
    if(r.lamMax>90)return{...r,erro:'Esbeltez acima de 90: este simulador usa o pilar-padrão com curvatura aproximada, válido até λ = 90.'};
    if(!okAs(Asmax))return{...r,erro:'Nem com 4% de armadura a seção resiste. Aumente as dimensões do pilar ou o fck.'};
    let As;if(okAs(Asmin))As=Asmin;else{let lo=Asmin,hi=Asmax;for(let k=0;k<60;k++){const m=(lo+hi)/2;if(okAs(m))hi=m;else lo=m}As=hi}
    dx.forEach(q=>q.MRd=calc.pilarSec(q.bw,q.hd,fck,As,Nd));
    let bar=null;const lmax=Math.max(b,h),cob=3.5;
    for(const f of [10,12.5,16,20,25]){const a=Math.PI*(f/10)**2/4;let n=Math.max(4,Math.ceil(As/a-1e-9));if(n%2)n++;
      const livre=k=>(lmax-2*cob-k*f/10)/(k-1),eixo=k=>(lmax-2*cob-f/10)/(k-1);
      while(eixo(n/2)>Math.min(40,2*bm))n+=2;if(livre(n/2)<Math.max(2,f/10,2.3)||(n>10&&f<25))continue;bar={f,n,area:n*a,livre:livre(n/2)};break}
    const fe=bar&&bar.f>=20?6.3:5,se=Math.min(20,bm,bar?12*bar.f/10:20);
    return{...r,As,bar,estribo:{f:fe,s:Math.floor(se)},rho:100*(bar?bar.area:As)/Ac};
  },
  esgoto(ap,unid,pav,decl){
    const u=k=>APARELHOS[k][0],uUn=Object.keys(APARELHOS).reduce((s,k)=>s+(ap[k]||0)*u(k),0),uPav=uUn*unid,uTot=uPav*pav,bacia=(ap.bacia||0)>0;
    const tq=TUBO_QUEDA.find(r=>(!bacia||r[0]>=100)&&(pav<=3?r[1]>=uTot:r[2]>=uTot&&r[3]>=uPav));
    const di=[0.5,1,2,4].indexOf(decl),col=Object.keys(COLETOR).map(Number).find(D=>COLETOR[D][di]!=null&&COLETOR[D][di]>=uTot);
    const uCx=['chuveiro','lavatorio','banheira','bide'].reduce((s,k)=>s+(ap[k]||0)*u(k),0),re=RAMAL_ESG.find(r=>r[1]>=uCx);
    return{uUn,uPav,uTot,bacia,tq:tq?tq[0]:null,col:col||null,uCx,ramal:uCx?Math.max(50,re?re[0]:100):null,decl};
  },
  ilum(area){return area<=6?100:100+60*Math.floor((area-6)/4+1e-9)},
  tugs(tipo,area,per){
    const molh=['cozinha','servico','banheiro'].includes(tipo);let n;
    if(tipo==='cozinha'||tipo==='servico')n=Math.ceil(per/3.5-1e-9);else if(tipo==='banheiro'||tipo==='varanda')n=1;else if(tipo==='sala'||tipo==='dormitorio')n=Math.ceil(per/5-1e-9);else n=area<=6?1:Math.ceil(per/5-1e-9);
    n=Math.max(1,n);const va=molh?Math.min(n,3)*600+Math.max(0,n-3)*100:n*100;return{n,va};
  },
  circuito(P,V,L,tipo,ngrupo){
    const Ib=P/V,fa=FAGRUP[Math.min(Math.max(ngrupo,1),9)],smin=tipo==='ilum'?1.5:2.5,dv=S=>200*L*Ib/(56*S*V),In=DISJ.find(i=>i>=Ib-1e-9);let crit='seção mínima da norma';
    for(const S of SECOES){if(S<smin)continue;const Iz=CAPB1[S]*fa,okI=!!In&&In<=Iz+1e-9,okV=dv(S)<=4+1e-9;
      if(okI&&okV)return{Ib,fa,S,Iz,In,dv:dv(S),crit,ok:true};crit=!okI?'capacidade de corrente':'queda de tensão'}
    return{Ib,fa,In,ok:false,erro:'Nenhuma seção até 35 mm² atende. Divida o circuito ou reduza o comprimento.'};
  },
  perfilW(nome){
    const[d0,bf0,tw0,tf0]=PERFIS_W[nome],d=d0/10,bf=bf0/10,tw=tw0/10,tf=tf0/10,h=d-2*tf;
    const A=2*bf*tf+h*tw,Ix=(bf*d**3-(bf-tw)*h**3)/12,Iy=2*tf*bf**3/12+h*tw**3/12;
    return{d,bf,tw,tf,h,A,Ix,Wx:2*Ix/d,Zx:bf*tf*(d-tf)+tw*h*h/4,Iy,ry:Math.sqrt(Iy/A),J:(2*bf*tf**3+(d-tf)*tw**3)/3,Cw:Iy*(d-tf)**2/4,massa:A*0.785};
  },
  vigaAco(nome,fyMPa,L,g,q,Lb,Cb){
    const P=calc.perfilW(nome),E=20000,fy=fyMPa/10,sr=0.3*fy,ga=1.10,Lc=L*100,Lbc=Lb*100,raiz=k=>Math.sqrt(k*E/fy);
    const pp=P.massa*0.00981,qd=1.4*(g+pp)+1.5*q,Msd=qd*L*L/8*100,Vsd=qd*L/2;
    const Mpl=P.Zx*fy,Mr=(fy-sr)*P.Wx,interp=(Mr_,l,lp,lr)=>Mpl-(Mpl-Mr_)*(l-lp)/(lr-lp);
    const FLA={l:P.h/P.tw,lp:3.76*raiz(1),lr:5.70*raiz(1)};FLA.esbelta=FLA.l>FLA.lr;FLA.M=FLA.l<=FLA.lp?Mpl:Math.max(0,interp(fy*P.Wx,FLA.l,FLA.lp,FLA.lr));
    const FLM={l:P.bf/(2*P.tf),lp:0.38*raiz(1),lr:0.83*Math.sqrt(E/(fy-sr))};FLM.M=FLM.l<=FLM.lp?Mpl:FLM.l<=FLM.lr?interp(Mr,FLM.l,FLM.lp,FLM.lr):0.69*E*P.Wx/FLM.l**2;
    const b1=(fy-sr)*P.Wx/(E*P.J),Mcr=Cb*Math.PI**2*E*P.Iy/Lbc**2*Math.sqrt(P.Cw/P.Iy*(1+0.039*P.J*Lbc**2/P.Cw));
    const FLT={l:Lbc/P.ry,lp:1.76*raiz(1),lr:1.38*Math.sqrt(P.Iy*P.J)/(P.ry*P.J*b1)*Math.sqrt(1+Math.sqrt(1+27*P.Cw*b1*b1/P.Iy)),Mcr};
    FLT.M=FLT.l<=FLT.lp?Mpl:FLT.l<=FLT.lr?Math.min(Mpl,Cb*interp(Mr,FLT.l,FLT.lp,FLT.lr)):Math.min(Mpl,Mcr);
    const MRk=Math.min(FLA.M,FLM.M,FLT.M),MRd=Math.min(MRk,1.5*P.Wx*fy)/ga,gov=MRk>=Mpl-1e-9?'plastificação total':MRk===FLT.M?'FLT':MRk===FLM.M?'FLM':'FLA';
    const lv=P.h/P.tw,lpv=1.10*raiz(5),lrv=1.37*raiz(5),Vpl=0.6*P.d*P.tw*fy,VRd=(lv<=lpv?Vpl:lv<=lrv?lpv/lv*Vpl:1.24*(lpv/lv)**2*Vpl)/ga;
    const qs=(g+pp+q)/100,flecha=5*qs*Lc**4/(384*E*P.Ix),lim=Lc/350;
    return{P,pp,qd,Msd,Vsd,Mpl,Mr,FLA,FLM,FLT,MRk,MRd,gov,VRd,flecha,lim,okM:Msd<=MRd,okV:Vsd<=VRd,okF:flecha<=lim};
  },
  vigaMadeira(cls,b,h,L,s,g,q,k1,k2,k3){
    const M=MADEIRAS[cls],kmod=k1*k2*k3,fcd=kmod*M.fc/1.4,fvd=kmod*M.fv/1.8,Eef=kmod*M.E,pp=M.rho*0.00981*b*h/1e4;
    const gl=g*s+pp,ql=q*s,Fd=1.4*(gl+ql),Md=Fd*L*L/8,Vd=Fd*L/2,W=b*h*h/6,I=b*h**3/12;
    const sig=Md*1000/W,tau=1.5*Vd*1000/(b*h*100),qs=gl+0.2*ql,flecha=5*qs*(L*1000)**4/(384*Eef*I*1e4),lim=L*1000/200;
    return{kmod,fcd,fvd,Eef,pp,gl,ql,Fd,Md,Vd,W,I,sig,tau,qs,flecha,lim,okM:sig<=fcd,okV:tau<=fvd,okF:flecha<=lim};
  },
  reservatorio(pessoas,consumo,dias,rti,recalque,horas,Hutil){
    const diario=pessoas*consumo,reserva=diario*dias,inf=recalque?0.6*reserva:0,sup=(recalque?0.4*reserva:reserva)+rti,total=reserva+rti;
    const esc=v=>{const c=CAIXAS.find(x=>x>=v-1e-9);if(c)return{n:1,cap:c};const m=CAIXAS[CAIXAS.length-1];return{n:Math.ceil(v/m-1e-9),cap:m}};
    const Qlh=diario/horas,Q=Qlh/3.6e6,X=horas/24,Dm=1.3*Math.sqrt(Q)*X**0.25,Dmm=Dm*1000,ir=DN_RECALQUE.findIndex(x=>x>=Dmm-1e-9);
    const rec=ir>=0?DN_RECALQUE[ir]:null,suc=ir>=0?(DN_RECALQUE[ir+1]||DN_RECALQUE[ir]):null,area=inf/1000/Hutil;
    return{diario,reserva,inf,sup,total,caixaSup:esc(sup),caixaInf:recalque?esc(inf):null,Qlh,Dmm,rec,suc,area,lado:Math.sqrt(area),tempo:recalque&&Qlh?inf/Qlh:0};
  },
  numeroN(vdm,anos,taxa,fv,fr){let s=0;for(let i=0;i<anos;i++)s+=vdm*(1+taxa/100)**i;return 365*s*fv*fr},
  espessuraH(N,cbr){return 77.67*N**0.0482*cbr**-0.598},
  pavimento(N,cbrSub,cbrRef){
    const H=cbr=>calc.espessuraH(N,cbr),up=v=>Math.ceil(v-1e-9);
    let R,tipo;if(N<=1e6){R=0;tipo='Tratamento superficial betuminoso'}else if(N<=5e6){R=5;tipo='Revestimento betuminoso com 5,0 cm'}else if(N<=1e7){R=7.5;tipo='Concreto betuminoso com 7,5 cm'}else if(N<=5e7){R=10;tipo='Concreto betuminoso com 10,0 cm'}else{R=12.5;tipo='Concreto betuminoso com 12,5 cm'}
    const KR=2,K=1,Hm=H(cbrSub),H20=H(20),temRef=cbrRef!=null&&cbrRef>cbrSub&&cbrRef<20,Hn=temRef?H(cbrRef):null;
    const B=Math.max(15,up((H20-R*KR)/K));
    let h20,hn=0;
    if(temRef){h20=Math.max(0,up((Hn-R*KR-B*K)/K));hn=Math.max(0,up((Hm-R*KR-B*K-h20*K)/K))}
    else h20=Math.max(0,up((Hm-R*KR-B*K)/K));
    return{R,tipo,KR,Hm,H20,Hn,B,h20,hn,total:R+B+h20+hn,temRef};
  },
  orcamento(itens,bdi,qtd){
    const linhas=itens.map(i=>({...i,sub:i.coef*i.preco})),cu=linhas.reduce((s,l)=>s+l.sub,0),pu=cu*(1+bdi/100);
    return{linhas,cu,pu,total:pu*qtd};
  },
  // ===== Fase 2 =====
  // Estribos: NBR 6118, modelo de cálculo I (θ = 45°, estribos a 90°). Unidades: kN e cm.
  estribos(bw,h,fck,Vk,phi=5,aco=50,ramos=2,c=4){
    const d=h-c,fcd=fck/14,Vd=1.4*Vk,av2=1-fck/250,VRd2=0.27*av2*fcd*bw*d;
    const fctm=0.3*fck**(2/3),fctd=0.7*fctm/1.4/10,Vc=0.6*fctd*bw*d,fywd=Math.min(aco/1.15,43.5);
    const Vsw=Math.max(0,Vd-Vc),aswS=Vsw/(0.9*d*fywd),rmin=0.2*fctm/(aco*10),aswMin=rmin*bw,asw=Math.max(aswS,aswMin);
    const lim=Vd<=0.67*VRd2,smax=lim?Math.min(0.6*d,30):Math.min(0.3*d,20),Aphi=ramos*Math.PI*(phi/10)**2/4;
    const s=Math.max(5,Math.min(Math.floor(Aphi/asw+1e-9),Math.floor(smax)));
    return{d,Vd,av2,VRd2,fctm,fctd,Vc,fywd,Vsw,aswS,rmin,aswMin,asw,smax,lim,Aphi,s,ok:Vd<=VRd2,minGoverna:aswMin>=aswS};
  },
  // Laje apoiada nos 4 lados: solução exata de Navier (série dupla), ν = 0,2. lx = menor vão (m), p em kN/m².
  navier(lx,ly,nu=0.2,termos=99){
    let mx=0,my=0,w=0;const a=lx,b=ly;
    for(let m=1;m<=termos;m+=2)for(let n=1;n<=termos;n+=2){const am=m/a,bn=n/b,s=((m-1)/2+(n-1)/2)%2?-1:1,den=m*n*(am*am+bn*bn)**2;
      w+=s/den;mx+=s*(am*am+nu*bn*bn)/den;my+=s*(bn*bn+nu*am*am)/den}
    // coeficientes adimensionais: M = c · p · lx² ; w = cw · p · lx⁴ / D
    const P4=Math.PI**4,P6=Math.PI**6;return{cx:16/P4*mx/(lx*lx),cy:16/P4*my/(lx*lx),cw:16/P6*w/(lx**4)}
  },
  armLaje(Mk,h,fck,c=2.5){// por metro de largura: Mk em kN·m/m
    const bw=100,d=h-c-0.5,fcd=fck/14,fyd=50/1.15,Md=1.4*Mk*100,k=Md/(0.425*bw*d*d*fcd);
    if(k>=1)return{d,Md,inviavel:true};
    const x=1.25*d*(1-Math.sqrt(1-k)),As=Md/(fyd*(d-0.4*x)),Asmin=0.67*0.15/100*bw*h,Asf=Math.max(As,Asmin),smax=Math.min(20,2*h);
    let esc=null;for(const f of [5,6.3,8,10,12.5]){const a=Math.PI*(f/10)**2/4,s=Math.floor(Math.min(100*a/Asf,smax)+1e-9);if(s>=10){esc={f,s,area:100*a/s};break}}
    if(!esc){const a=Math.PI*1.25**2/4,s=Math.max(7,Math.floor(100*a/Asf));esc={f:12.5,s,area:100*a/s}}
    return{d,Md,x,xd:x/d,As,Asmin,Asf,smax,esc,inviavel:false};
  },
  lajeMomentos(l1,l2,h,g,q,fck){
    const lx=Math.min(l1,l2),ly=Math.max(l1,l2),lam=ly/lx,p=25*h/100+g+q,uma=lam>2;
    let Mx,My,cw;
    if(uma){Mx=p*lx*lx/8;My=0;cw=5/384}else{const nv=calc.navier(lx,ly);Mx=nv.cx*p*lx*lx;My=nv.cy*p*lx*lx;cw=nv.cw}
    const ax=calc.armLaje(Mx,h,fck);let ay;
    if(uma){const As=Math.max(0.2*ax.Asf,0.9,0.5*0.15/100*100*h);let esc=null;for(const f of [5,6.3,8]){const a=Math.PI*(f/10)**2/4,s=Math.floor(Math.min(100*a/As,33)+1e-9);if(s>=10){esc={f,s,area:100*a/s};break}}ay={dist:true,Asf:As,esc}}
    else ay=calc.armLaje(My,h,fck,3.5);
    const Ecs=0.85*5600*Math.sqrt(fck),D=Ecs*1000*(h/100)**3/12,ps=25*h/100+g+0.3*q;
    const wi=cw*ps*lx**4/D*1000,wt=wi*2.32,lim=1000*lx/250;
    return{lx,ly,lam,p,uma,Mx,My,ax,ay,Ecs,ps,wi,wt,lim,okF:wt<=lim};
  },
  // Pré-dimensionamento de pilar pela área de influência (estimativa para o lançamento)
  preDimPilar(area,pav,carga,tipo,fck,b){
    const alfa={intermediario:1.3,extremidade:1.5,canto:1.8}[tipo],Nk=area*carga*pav,Nd=1.4*alfa*Nk,fcd=fck/14,sig=0.85*fcd+0.01*(42-0.85*fcd);
    const bb=Math.max(b,14),gn=bb<19?1.95-0.05*bb:1,Ac=gn*Nd/sig,hh=Math.max(bb,Math.ceil(Ac/bb/5-1e-9)*5),hf=Math.max(hh,Math.ceil(360/bb/5-1e-9)*5);
    return{alfa,Nk,Nd,gn,fcd,sig,Ac,b:bb,h:hf,Acf:bb*hf,parede:hf>5*bb};
  },
  // Tanque séptico (NBR 7229) e sumidouro (NBR 13969)
  fossa(N,C,Lf,anos,temp){
    const cd=N*C,T=cd<=1500?1:cd<=3000?0.92:cd<=4500?0.83:cd<=6000?0.75:cd<=7500?0.67:cd<=9000?0.58:0.5;
    const K={frio:[94,134,174,214,254],medio:[65,105,145,185,225],quente:[57,97,137,177,217]}[temp][anos-1];
    const V=1000+N*(C*T+K*Lf),hu=V<=6000?1.2:V<=10000?1.5:1.8,Ab=V/1000/hu;let L=Math.sqrt(2*Ab),W=L/2;if(W<0.8){W=0.8;L=Math.max(Ab/W,1.6)}
    return{cd,T,K,V,hu,Ab,L:Math.ceil(L*20)/20,W:Math.ceil(W*20)/20};
  },
  sumidouro(cd,Ci,D,n=1){const A=cd/Ci/n,fundo=Math.PI*D*D/4,h=Math.max(0,(A-fundo)/(Math.PI*D));return{A:cd/Ci,An:A,fundo,h,hAdot:Math.ceil(h*10)/10}},
  caixaGordura(cozinhas,pessoas){if(cozinhas<=1)return{tipo:'simples (CGS)',V:31,D:40};if(cozinhas<=2)return{tipo:'dupla (CGD)',V:120,D:60};const V=2*pessoas+20;return{tipo:'especial (CGE)',V,D:null}},
  // Dosagem experimental pelo método ABCP (estimativa de partida)
  ABCP_AGUA:{'40':{9.5:220,19:195,25:190,32:185,38:180},'60':{9.5:225,19:200,25:195,32:190,38:185},'80':{9.5:230,19:205,25:200,32:195,38:190}},
  abcpBrita(MF,Dmax){const base={9.5:0.645,19:0.705,25:0.770,32:0.795,38:0.820}[Dmax];return base-0.1*(MF-1.8)},
  dosagem(fck,sd,slump,Dmax,MF,classe,muBrita=1500){
    const fcj=fck+1.65*sd,acAbrams=Math.log(93.2/fcj)/Math.log(7.3),acMax=[0.65,0.60,0.55,0.45][classe-1],cMin=[260,280,320,360][classe-1],fckMin=[20,25,30,40][classe-1];
    const ac=Math.floor(Math.min(acAbrams,acMax)*100+1e-9)/100,Ca=calc.ABCP_AGUA[slump][Dmax];let C=Ca/ac;const cMinGov=C<cMin;C=Math.max(C,cMin);
    const Vb=calc.abcpBrita(MF,Dmax),Cb=Vb*muBrita,Va=1-(C/3100+Cb/2700+Ca/1000),Cm=Va*2650;
    return{fcj,acAbrams,acMax,ac,Ca,C,cMin,cMinGov,fckMin,okFck:fck>=fckMin,Vb,Cb,Va,Cm,a:Cm/C,p:Cb/C,sacos:C/50};
  },
  // Quantitativo de parede: blocos, argamassa de assentamento, chapisco e reboco
  BLOCOS:{'Cerâmico 9 × 19 × 19':[19,19,9],'Cerâmico 14 × 19 × 29':[29,19,14],'Concreto 14 × 19 × 39':[39,19,14],'Tijolo maciço 5 × 10 × 20 (meia vez)':[20,5,10]},
  parede(comp,alt,vaos,bloco,junta,reboco,faces,traco){
    const [c,a,e]=calc.BLOCOS[bloco],j=junta/100,A=Math.max(0,comp*alt-vaos),nb=1/((c/100+j)*(a/100+j)),blocos=Math.ceil(A*nb*1.05);
    const Vass=A*(1-nb*c*a/1e4)*e/100*1.1,Vreb=A*faces*reboco/100*1.1,Vch=A*faces*0.005*1.1,Vtot=Vass+Vreb;
    const [ci,ca,ar]=traco,cim=Vtot*ci/ar*1420+Vch*1/3*1420,cal=Vtot*ca/ar*600,areia=Vtot+Vch*1;
    return{A,nb,blocos,Vass,Vreb,Vch,cim,cal,areia,sacosC:Math.ceil(cim/50),sacosCal:Math.ceil(cal/20)};
  },
  // ===== Fase 3 =====
  // Sistema linear por eliminação de Gauss com pivoteamento parcial
  resolver(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);
    for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-12)return null;[M[c],M[p]]=[M[p],M[c]];
      for(let r=0;r<n;r++)if(r!==c){const k=M[r][c]/M[c][c];if(k)for(let j=c;j<=n;j++)M[r][j]-=k*M[c][j]}}
    return M.map((r,i)=>r[n]/r[i])},
  // Treliça plana de banzos paralelos (Pratt ou Howe), apoio fixo à esquerda e móvel à direita.
  trelica(L,H,n,tipo,P,banzo='sup'){
    const nos=[],barras=[];for(let i=0;i<=n;i++)nos.push({x:i*L/n,y:0});for(let i=0;i<=n;i++)nos.push({x:i*L/n,y:H});
    const b=i=>i,t=i=>n+1+i,add=(a,c,g)=>barras.push({a,c,g});
    for(let i=0;i<n;i++){add(b(i),b(i+1),'inferior');add(t(i),t(i+1),'superior')}
    for(let i=0;i<=n;i++)add(b(i),t(i),'montante');
    for(let i=0;i<n;i++){const esq=i<n/2,pr=tipo==='pratt';add(esq===pr?t(i):b(i),esq===pr?b(i+1):t(i+1),'diagonal')}
    const J=nos.length,m=barras.length,A=Array.from({length:2*J},()=>Array(m+3).fill(0)),F=Array(2*J).fill(0);
    barras.forEach((e,k)=>{const p=nos[e.a],q=nos[e.c],l=Math.hypot(q.x-p.x,q.y-p.y),cx=(q.x-p.x)/l,cy=(q.y-p.y)/l;e.l=l;A[2*e.a][k]+=cx;A[2*e.a+1][k]+=cy;A[2*e.c][k]-=cx;A[2*e.c+1][k]-=cy});
    A[2*b(0)][m]=1;A[2*b(0)+1][m+1]=1;A[2*b(n)+1][m+2]=1;
    const carga=i=>(i===0||i===n?P/2:P),noC=banzo==='sup'?t:b;for(let i=0;i<=n;i++)F[2*noC(i)+1]+=carga(i);
    const x=calc.resolver(A,F);if(!x)return null;barras.forEach((e,k)=>e.N=Math.abs(x[k])<1e-9?0:x[k]);
    const maxT=Math.max(0,...barras.map(e=>e.N)),maxC=Math.min(0,...barras.map(e=>e.N));
    return{nos,barras,Rx:x[m],Ra:x[m+1],Rb:x[m+2],W:n*P,maxT,maxC};
  },
  // Ligação parafusada por cisalhamento (NBR 8800): parafuso x chapa
  PARAFUSOS:{'ASTM A307':415,'ASTM A325':825},
  ligacao(Fd,db,tipoP,planos,rosca,t,fu,n){
    const Ab=Math.PI*(db/10)**2/4,fub=calc.PARAFUSOS[tipoP]/10,fuc=fu/10,Fv=(rosca?0.4:0.5)*Ab*fub/1.35*planos,Fc=2.4*(db/10)*(t/10)*fuc/1.35,F1=Math.min(Fv,Fc);
    const nec=Math.max(2,Math.ceil(Fd/F1-1e-9));return{Ab,fub,Fv,Fc,F1,gov:Fv<=Fc?'cisalhamento do parafuso':'pressão de contato na chapa',nec,Rd:n*F1,ok:n*F1>=Fd,s:3*db,e:1.75*db};
  },
  // Recalque imediato de sapata (teoria da elasticidade, Es pelo SPT de Teixeira e Godoy)
  SOLOS_ES:{'Areia com pedregulho':[1.1,3],'Areia':[0.9,3],'Areia siltosa':[0.7,3],'Areia argilosa':[0.55,3],'Silte arenoso':[0.45,5],'Silte':[0.35,5],'Argila arenosa':[0.3,7],'Silte argiloso':[0.25,7],'Argila siltosa':[0.2,7]},
  recalque(N,B,L,nspt,solo,nu,rigida){
    const [K,a]=calc.SOLOS_ES[solo],Es=a*K*nspt,sig=1.05*N/(B*L),r=L/B,Ir=rigida?(r<=1?0.82:r>=2?1.12:0.82+(r-1)*0.30):(r<=1?0.95:r>=2?1.30:0.95+(r-1)*0.35);
    const rho=sig*B*(1-nu*nu)*Ir/(Es*1000)*1000;return{K,a,Es,sig,Ir,rho,ok:rho<=25};
  },
  // Cronograma físico-financeiro: custo distribuído por igual ao longo de cada atividade, em meses de 30 dias
  fisicoFinanceiro(ts){const c=calc.cpm(ts.map(t=>({id:t.id,dur:t.dur,pred:t.pred})));if(c.erro)return c;
    const prazo=c.total,meses=Math.ceil(prazo/30),total=ts.reduce((s,t)=>s+t.custo,0),mes=Array(meses).fill(0);
    ts.forEach(t=>{const ini=c.ES[t.id],fim=c.EF[t.id],pd=t.custo/t.dur;for(let k=0;k<meses;k++){const s=Math.max(ini,30*k),e=Math.min(fim,30*(k+1));if(e>s)mes[k]+=pd*(e-s)}});
    let ac=0;const acum=mes.map(v=>ac+=v);return{cpm:c,prazo,meses,total,mes,acum,pct:acum.map(v=>100*v/total)};
  },
  // Nivelamento geométrico: altura do instrumento e erro de fechamento (NBR 13133)
  nivelamento(cota0,lances,km,classe){
    let cota=cota0;const pts=[{cota}];lances.forEach(([re,vante])=>{const ai=cota+re;cota=ai-vante;pts.push({re,vante,ai,cota})});
    const erro=(cota-cota0)*1000,tol=(classe==='IN'?12:20)*Math.sqrt(Math.max(km,1e-9));return{pts,erro,tol,ok:Math.abs(erro)<=tol,soma:lances.reduce((s,[r,v])=>s+r-v,0)};
  },
  // Microdrenagem: método racional + galeria circular a seção plena (Manning)
  racional(C,i,Aha){return C*i*Aha/360},
  galeria(Q,S,n=0.013){const D=(Q*n/(0.3117*Math.sqrt(S)))**(3/8),DN=[0.4,0.5,0.6,0.8,1.0,1.2,1.5,2.0].find(d=>d>=D)||null;
    const Qp=DN?0.3117*DN**(8/3)*Math.sqrt(S)/n:0,v=DN?Qp/(Math.PI*DN*DN/4):0;return{D,DN,Qp,v,ok:!!DN&&v>=0.6&&v<=5}}
};
// CALC-END
