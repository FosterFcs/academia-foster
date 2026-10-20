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
  orcamento(itens,bdi,qtd){
    const linhas=itens.map(i=>({...i,sub:i.coef*i.preco})),cu=linhas.reduce((s,l)=>s+l.sub,0),pu=cu*(1+bdi/100);
    return{linhas,cu,pu,total:pu*qtd};
  }
};
// CALC-END
