// Bancada SIG: motor geográfico (GEO) e interface do mapa (SIG)
// GEO-START
const GEO={
  A:6378137,F:1/298.257222101,K0:0.9996,
  zona(lon){return Math.min(60,Math.max(1,Math.floor((lon+180)/6)+1))},
  mc(z){return z*6-183},
  direta(lat,lon,zona){
    const a=this.A,f=this.F,k0=this.K0,e2=f*(2-f),ep2=e2/(1-e2),z=zona||this.zona(lon),r=Math.PI/180,
      p=lat*r,l=(lon-this.mc(z))*r,s=Math.sin(p),c=Math.cos(p),t=Math.tan(p),N=a/Math.sqrt(1-e2*s*s),T=t*t,C=ep2*c*c,A=c*l,
      e4=e2*e2,e6=e4*e2,
      M=a*((1-e2/4-3*e4/64-5*e6/256)*p-(3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)+(15*e4/256+45*e6/1024)*Math.sin(4*p)-(35*e6/3072)*Math.sin(6*p)),
      E=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120)+500000,
      Nn=k0*(M+N*t*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));
    return{E,N:lat<0?Nn+1e7:Nn,zona:z,sul:lat<0};
  },
  inversa(E,N,zona,sul){
    const a=this.A,f=this.F,k0=this.K0,e2=f*(2-f),ep2=e2/(1-e2),e4=e2*e2,e6=e4*e2,
      M=(sul?N-1e7:N)/k0,mu=M/(a*(1-e2/4-3*e4/64-5*e6/256)),e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2)),
      p1=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu)+(1097*e1**4/512)*Math.sin(8*mu),
      s=Math.sin(p1),c=Math.cos(p1),t=Math.tan(p1),C1=ep2*c*c,T1=t*t,N1=a/Math.sqrt(1-e2*s*s),R1=a*(1-e2)/(1-e2*s*s)**1.5,D=(E-500000)/(N1*k0),
      lat=p1-(N1*t/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720),
      lon=(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/c;
    return{lat:lat*180/Math.PI,lon:this.mc(zona)+lon*180/Math.PI};
  },
  dms(v,cas=0){const u=10**cas,tot=Math.round(Math.abs(v)*3600*u);let d=Math.floor(tot/(3600*u));const rem=tot-d*3600*u,m=Math.floor(rem/(60*u)),s=(rem-m*60*u)/u;
    return `${d}°${String(m).padStart(2,'0')}'${s.toFixed(cas).replace('.',',').padStart(cas?3+cas:2,'0')}"`},
  geoStr(v,pos,neg,cas=2){return GEO.dms(v,cas)+' '+(v<0?neg:pos)},
  az(a,b){let z=Math.atan2(b[0]-a[0],b[1]-a[1])*180/Math.PI;if(z<0)z+=360;return z},
  azStr(z){const s=GEO.dms(z,0);return s.startsWith('360°')?'0°00\'00"':s},
  areaAss(P){let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1]}return s/2},
  horario(P){P=P.map(p=>[p[0],p[1]]);return GEO.areaAss(P)>0?[P[0],...P.slice(1).reverse()]:P},
  pip(x,y,P){let d=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)d=!d}return d},
  delaunay(P){
    const n=P.length;if(n<3)return[];
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;P.forEach(p=>{x0=Math.min(x0,p.E);x1=Math.max(x1,p.E);y0=Math.min(y0,p.N);y1=Math.max(y1,p.N)});
    const cx=(x0+x1)/2,cy=(y0+y1)/2,dm=Math.max(x1-x0,y1-y0)||1,V=P.map(p=>[p.E-cx,p.N-cy]);V.push([-100*dm,-100*dm],[0,100*dm],[100*dm,-100*dm]);
    const circ=(a,b,c)=>{const[ax,ay]=V[a],[bx,by]=V[b],[qx,qy]=V[c],d=2*(ax*(by-qy)+bx*(qy-ay)+qx*(ay-by));
      if(Math.abs(d)<1e-12)return{a,b,c,x:0,y:0,r2:Infinity};
      const ux=((ax*ax+ay*ay)*(by-qy)+(bx*bx+by*by)*(qy-ay)+(qx*qx+qy*qy)*(ay-by))/d,uy=((ax*ax+ay*ay)*(qx-bx)+(bx*bx+by*by)*(ax-qx)+(qx*qx+qy*qy)*(bx-ax))/d;
      return{a,b,c,x:ux,y:uy,r2:(ax-ux)**2+(ay-uy)**2}};
    let T=[circ(n,n+1,n+2)];const vist=new Set();
    for(let i=0;i<n;i++){
      const[x,y]=V[i],key=Math.round(x*1000)+','+Math.round(y*1000);if(vist.has(key))continue;vist.add(key);
      const ruins=[],ok=[];for(const t of T)((x-t.x)**2+(y-t.y)**2<t.r2*(1+1e-12)?ruins:ok).push(t);
      const ar=new Map();for(const t of ruins)for(const[u,v]of[[t.a,t.b],[t.b,t.c],[t.c,t.a]]){const k=u<v?u+'_'+v:v+'_'+u;ar.set(k,ar.has(k)?null:[u,v])}
      T=ok;for(const e of ar.values())if(e)T.push(circ(e[0],e[1],i));
    }
    return T.filter(t=>t.a<n&&t.b<n&&t.c<n&&Math.abs((V[t.b][0]-V[t.a][0])*(V[t.c][1]-V[t.a][1])-(V[t.c][0]-V[t.a][0])*(V[t.b][1]-V[t.a][1]))>1e-9).map(t=>[t.a,t.b,t.c]);
  },
  triZ(P,t,x,y){const a=P[t[0]],b=P[t[1]],c=P[t[2]],d=(b.N-c.N)*(a.E-c.E)+(c.E-b.E)*(a.N-c.N);if(Math.abs(d)<1e-12)return null;
    const l1=((b.N-c.N)*(x-c.E)+(c.E-b.E)*(y-c.N))/d,l2=((c.N-a.N)*(x-c.E)+(a.E-c.E)*(y-c.N))/d,l3=1-l1-l2,e=-1e-9;
    return l1<e||l2<e||l3<e?null:l1*a.z+l2*b.z+l3*c.z},
  interp(P,T,x,y){for(const t of T){const z=GEO.triZ(P,t,x,y);if(z!==null)return z}return null},
  curvas(P,T,int){
    const segs=[];let zmin=Infinity,zmax=-Infinity;
    for(const t of T){const v=t.map(i=>P[i]),zs=v.map(p=>p.z),lo=Math.min(...zs),hi=Math.max(...zs);zmin=Math.min(zmin,lo);zmax=Math.max(zmax,hi);
      for(let k=Math.ceil(lo/int-1e-9);k<=Math.floor(hi/int+1e-9);k++){const L=k*int,Lp=L+1e-9,q=[];
        for(const[i,j]of[[0,1],[1,2],[2,0]]){const a=v[i],b=v[j];if((a.z<Lp)!==(b.z<Lp)){const s=(Lp-a.z)/(b.z-a.z);q.push([a.E+s*(b.E-a.E),a.N+s*(b.N-a.N)])}}
        if(q.length===2)segs.push({z:L,k,x1:q[0][0],y1:q[0][1],x2:q[1][0],y2:q[1][1]})}}
    return{segs,zmin,zmax};
  },
  perfil(P,T,a,b,n=200){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),d=[],z=[];for(let i=0;i<=n;i++){const s=i/n;d.push(L*s);z.push(GEO.interp(P,T,a[0]+s*(b[0]-a[0]),a[1]+s*(b[1]-a[1])))}return{L,d,z}},
  volume(P,T,poly,max=40000){
    if(poly.length<3||!T.length)return null;
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;poly.forEach(([x,y])=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)});
    const cs=Math.max(0.05,Math.sqrt((x1-x0)*(y1-y0)/max)),nx=Math.max(1,Math.ceil((x1-x0)/cs)),ny=Math.max(1,Math.ceil((y1-y0)/cs)),Z=new Float64Array(nx*ny).fill(NaN);
    for(const t of T){const v=t.map(i=>P[i]),ix0=Math.max(0,Math.floor((Math.min(...v.map(p=>p.E))-x0)/cs)),ix1=Math.min(nx-1,Math.floor((Math.max(...v.map(p=>p.E))-x0)/cs)),
      iy0=Math.max(0,Math.floor((Math.min(...v.map(p=>p.N))-y0)/cs)),iy1=Math.min(ny-1,Math.floor((Math.max(...v.map(p=>p.N))-y0)/cs));
      for(let iy=iy0;iy<=iy1;iy++)for(let ix=ix0;ix<=ix1;ix++){const k=iy*nx+ix;if(!isNaN(Z[k]))continue;const z=GEO.triZ(P,t,x0+(ix+.5)*cs,y0+(iy+.5)*cs);if(z!==null)Z[k]=z}}
    const cells=[];let nIn=0,soma=0;
    for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){const x=x0+(ix+.5)*cs,y=y0+(iy+.5)*cs;if(!GEO.pip(x,y,poly))continue;nIn++;const z=Z[iy*nx+ix];if(!isNaN(z)){cells.push({ix,iy,z});soma+=z}}
    return{cs,nx,ny,x0,y0,cells,nIn,nSem:nIn-cells.length,zEq:cells.length?soma/cells.length:null,area:Math.abs(GEO.areaAss(poly))};
  },
  cortaterro(g,zp){let c=0,a=0;const A=g.cs*g.cs;for(const k of g.cells){const d=k.z-zp;if(d>0)c+=d*A;else a-=d*A}return{corte:c,aterro:a}},
  num(s,sep){s=String(s??'').trim().replace(/\s/g,'');if(s==='')return NaN;if(sep!==','&&/^-?\d+,\d+$/.test(s))s=s.replace(',','.');return Number(s)},
  parseCSV(txt){
    const L=String(txt).replace(/\r/g,'').split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));if(!L.length)return{pts:[],erro:'O arquivo está vazio.'};
    const sep=L[0].includes(';')?';':L[0].includes('\t')?'\t':',',C=L.map(l=>l.split(sep).map(c=>c.trim().replace(/^"|"$/g,''))),nn=r=>r.filter(c=>c!==''&&isNaN(GEO.num(c,sep))).length;
    const head=C[0].map(c=>c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''));
    const temHead=C.length===1?head.some(h=>/^(e|n|x|y|z|lat|lon|cota|nome|ponto)$/.test(h)):nn(C[0])>nn(C[1]);
    const f=re=>head.findIndex(h=>re.test(h));let iNome=-1,iA=-1,iB=-1,iZ=-1,geo=false;
    if(temHead){iNome=f(/^(nome|ponto|pt|id|name|descricao|codigo|cod)$/);iZ=f(/^(z|cota|h|alt|altitude|elev|elevacao|elevation|cota_m)$/);
      const la=f(/^(lat|latitude)$/),lo=f(/^(lon|long|longitude|lng)$/);
      if(la>=0&&lo>=0){geo=true;iA=la;iB=lo}else{iA=f(/^(e|este|x|easting|coord_?e|leste)$/);iB=f(/^(n|norte|y|northing|coord_?n)$/)}
      if(iA<0||iB<0)return{pts:[],erro:'Não encontrei as colunas de coordenadas. Use cabeçalho ponto;E;N;cota ou lat;lon;cota.'}}
    else{const r=C[0],num=r.map((c,i)=>!isNaN(GEO.num(c,sep))?i:-1).filter(i=>i>=0);
      if(num.length<2)return{pts:[],erro:'Não reconheci o formato. Use uma linha por ponto: nome;E;N;cota.'};
      if(isNaN(GEO.num(r[0],sep))){iNome=0;[iA,iB,iZ]=[num[0],num[1],num[2]??-1]}else if(num.length>=4){iNome=0;[iA,iB,iZ]=[1,2,3]}else{[iA,iB,iZ]=[0,1,num.length>2?2:-1]}}
    const pts=[];let semZ=0,ruins=0;
    C.slice(temHead?1:0).forEach((r,k)=>{const a=GEO.num(r[iA],sep),b=GEO.num(r[iB],sep);if(isNaN(a)||isNaN(b)){ruins++;return}
      let z=iZ>=0?GEO.num(r[iZ],sep):NaN;if(isNaN(z)){z=0;semZ++}pts.push({nome:iNome>=0&&r[iNome]?r[iNome]:'P'+String(pts.length+1).padStart(2,'0'),a,b,z})});
    if(!temHead&&pts.length&&pts.every(p=>Math.abs(p.a)<=90&&Math.abs(p.b)<=180))geo=true;
    return{pts:pts.map(p=>geo?{nome:p.nome,lat:p.a,lon:p.b,z:p.z}:{nome:p.nome,E:p.a,N:p.b,z:p.z}),geo,semZ,ruins};
  },
  memorial(poly,conf,info){
    const fmt=(v,d)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}),n=poly.length,A=Math.abs(GEO.areaAss(poly));let per=0;
    const lados=poly.map((p,i)=>{const q=poly[(i+1)%n],d=Math.hypot(q[0]-p[0],q[1]-p[1]);per+=d;return{d,az:GEO.az(p,q)}});
    const v=i=>`V${i%n+1}, de coordenadas N ${fmt(poly[i%n][1],2)} m e E ${fmt(poly[i%n][0],2)} m`;
    let t=`MEMORIAL DESCRITIVO\n\nImóvel: ${info.imovel||'—'}\nMunicípio: ${info.mun||'—'}\nÁrea: ${fmt(A,2)} m² (${fmt(A/1e4,4)} ha)\nPerímetro: ${fmt(per,2)} m\nSistema: SIRGAS 2000 · Projeção UTM · Zona ${info.zona}${info.sul?'S':'N'} · Meridiano central ${GEO.mc(info.zona)}°\n\n`;
    t+=`Inicia-se a descrição deste perímetro no vértice ${v(0)}; `;
    lados.forEach((l,i)=>{t+=`deste, segue confrontando com ${conf[i]||'—'}, com azimute de ${GEO.azStr(l.az)} e distância de ${fmt(l.d,2)} m, até o vértice ${i===n-1?'V1, ponto inicial da descrição deste perímetro.':v(i+1)+'; '}`});
    t+=`\n\nTodas as coordenadas aqui descritas estão georreferenciadas ao Sistema Geodésico Brasileiro e encontram-se representadas no sistema UTM, referenciadas ao Meridiano Central ${GEO.mc(info.zona)}° WGr, tendo como datum o SIRGAS 2000. Todos os azimutes e distâncias, a área e o perímetro foram calculados no plano de projeção UTM.`;
    return{texto:t,lados,area:A,per};
  }
};
// GEO-END

const SIG={
  camadas:{osm:false,grade:true,tin:false,curvas:true,pontos:true,rotulos:true,lote:true,cortes:false},
  NOMES:{osm:'Mapa de fundo (OpenStreetMap)',grade:'Malha de coordenadas',tin:'Triangulação (TIN)',curvas:'Curvas de nível',pontos:'Pontos levantados',rotulos:'Rótulos',lote:'Lote (poligonal)',cortes:'Mapa de corte e aterro'},
  FERR:[['nav','Navegar'],['med','Medir'],['lote','Desenhar lote'],['prf','Perfil'],['pto','Novo ponto']],
  SUBS:[['tabela','Tabela de atributos'],['perfil','Perfil do terreno'],['volume','Corte e aterro'],['memorial','Memorial descritivo'],['io','Importar e exportar'],['conv','Conversor UTM']],
  ferr:'nav',sub:'tabela',fmt:'geojson',draft:[],med:[],prf:[],sel:-1,hover:null,view:null,p:null,tris:[],cur:null,g:null,heat:null,limpar:false,
  exemplo(){
    const E0=313250,N0=7402180;let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,z=(x,y)=>742+0.06*x-0.035*y+2.4*Math.exp(-((x-36)**2+(y-22)**2)/260),pts=[];let k=1;
    for(let j=0;j<6;j++)for(let i=0;i<8;i++){const x=i*8.5+(rnd()-.5)*4,y=j*8.5+(rnd()-.5)*4;pts.push({nome:'P'+String(k++).padStart(2,'0'),E:+(E0+x).toFixed(2),N:+(N0+y).toFixed(2),z:+(z(x,y)+(rnd()-.5)*0.08).toFixed(3)})}
    const lote=[[6,5],[4,34],[30,39],[56,30],[52,3]].map(([x,y])=>[E0+x,N0+y]);
    return{pts,lote,conf:['Lote 14 (exemplo)','Rua das Acácias (exemplo)','Lote 08 (exemplo)','Área verde (exemplo)','Lote 12 (exemplo)'],imovel:'Lote 10, Quadra C, Loteamento Exemplo',mun:'Santana de Parnaíba – SP',zona:23,sul:true,int:0.5,zp:null,emp:25,cam:12};
  },
  carregar(){if(this.p)return;try{const s=JSON.parse(localStorage.getItem('af-sig')||'null');if(s&&Array.isArray(s.pts)&&Array.isArray(s.lote)){this.p=Object.assign(this.exemplo(),s);try{localStorage.setItem('af-sig',JSON.stringify(this.p))}catch(e){}return}}catch(e){}this.p=this.exemplo()},
  salvar(){const j=JSON.stringify(this.p);let ant=null;try{ant=localStorage.getItem('af-sig');localStorage.setItem('af-sig',j)}catch(e){}if(ant!==null&&ant!==j&&typeof Conta!=='undefined')Conta.marcar('sig')},
  mudou(tin=true,sub=true){if(tin)this.tris=GEO.delaunay(this.p.pts);this.cur=GEO.curvas(this.p.pts,this.tris,this.p.int);this.g=null;this.heat=null;this.salvar();this.draw();if(sub)this.renderSub()},
  grade(){if(!this.g&&this.p.lote.length>=3&&this.tris.length){this.g=GEO.volume(this.p.pts,this.tris,this.p.lote);if(this.g&&this.p.zp==null&&this.g.zEq!=null)this.p.zp=+this.g.zEq.toFixed(2)}return this.g},
  html(){
    this.carregar();const p=this.p;
    return `<div class="sig"><div class="side">
      <div><h4>Ferramentas</h4><div class="presets" id="sigFerr">${this.FERR.map(([k,t])=>`<button class="chip${this.ferr===k?' on':''}" data-f="${k}" aria-pressed="${this.ferr===k}">${t}</button>`).join('')}</div></div>
      <div class="campo"${this.ferr==='pto'?'':' hidden'} id="sigCotaBox"><label for="sigCota">Cota do novo ponto (m)</label><input type="number" step="0.001" id="sigCota" placeholder="vazio: interpolar do terreno"></div>
      <div><h4>Camadas</h4><div class="camadas">${Object.keys(this.NOMES).filter(k=>k!=='osm'||!window.EMBUTIDO).map(k=>`<label><input type="checkbox" id="sigL_${k}" data-l="${k}"${this.camadas[k]?' checked':''}> ${this.NOMES[k]}</label>`).join('')}</div></div>
      ${sel('sigInt','Intervalo das curvas',[[0.25,'0,25 m'],[0.5,'0,50 m'],[1,'1 m'],[2,'2 m'],[5,'5 m']].map(([v,t])=>[v,t,v==p.int]),'Curva mestra a cada 5 intervalos')}
      <div class="row">${sel('sigZona','Zona UTM',[18,19,20,21,22,23,24,25].map(z=>[z,z+' (MC '+GEO.mc(z)+'°)',z==p.zona]))}${sel('sigHem','Hemisfério',[['S','Sul',p.sul],['N','Norte',!p.sul]])}</div>
      <div class="presets"><button class="chip" id="sigFit">Enquadrar</button><button class="chip" id="sigEx">Restaurar exemplo</button><button class="chip" id="sigClr">${this.limpar?'Confirmar limpeza':'Limpar tudo'}</button></div>
    </div><div class="mapa">
      <div class="mapwrap"><canvas id="sigMap" role="img" aria-label="Mapa do levantamento topográfico"></canvas><div class="mapbtns"><button id="sigZin" aria-label="Aproximar">+</button><button id="sigZout" aria-label="Afastar">−</button></div></div>
      <div class="status" id="sigXY">Passe o cursor sobre o mapa para ver as coordenadas</div><div class="info" id="sigInfo"></div>
    </div></div>
    <div class="presets subtabs" id="sigSubs">${this.SUBS.map(([k,t])=>`<button class="chip${this.sub===k?' on':''}" data-s="${k}">${t}</button>`).join('')}</div><div id="sigSub" class="lista"></div>`;
  },
  init(){
    const c=$('sigMap');this.mudou(true,false);
    $('sigFerr').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>this.setFerr(b.dataset.f));
    document.querySelectorAll('[data-l]').forEach(i=>i.onchange=()=>{this.camadas[i.dataset.l]=i.checked;this.draw();const o=$('sigShowCut');if(o&&i.dataset.l==='cortes')o.checked=i.checked});
    $('sigInt').onchange=()=>{this.p.int=+$('sigInt').value;this.mudou(false,false)};
    $('sigZona').onchange=$('sigHem').onchange=()=>{this.p.zona=+$('sigZona').value;this.p.sul=$('sigHem').value==='S';this.salvar();this.renderSub()};
    $('sigFit').onclick=()=>{this.fit();this.draw()};
    $('sigEx').onclick=()=>{this.p=this.exemplo();this.reset();this.mudou();this.fit();this.draw();this.info('Exemplo restaurado: 48 pontos e um lote de 5 vértices.')};
    $('sigClr').onclick=()=>{if(!this.limpar){this.limpar=true;$('sigClr').textContent='Confirmar limpeza';return}this.limpar=false;$('sigClr').textContent='Limpar tudo';this.p.pts=[];this.p.lote=[];this.p.conf=[];this.reset();this.mudou();this.info('Projeto vazio. Use Novo ponto, Desenhar lote ou importe um arquivo.')};
    $('sigZin').onclick=()=>this.zoom(1.5);$('sigZout').onclick=()=>this.zoom(1/1.5);
    $('sigSubs').querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{this.sub=b.dataset.s;$('sigSubs').querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));this.renderSub()});
    const ptr=new Map();let down=null,pinch=null;
    const pos=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
    c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);const q=pos(e);ptr.set(e.pointerId,q);
      if(ptr.size===2){const[a,b]=[...ptr.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:this.view.s};down=null}else down={...q,cx:this.view.cx,cy:this.view.cy,mov:false}};
    c.onpointermove=e=>{const q=pos(e);if(ptr.has(e.pointerId))ptr.set(e.pointerId,q);
      if(pinch&&ptr.size===2){const[a,b]=[...ptr.values()];this.view.s=Math.min(400,Math.max(0.02,pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/(pinch.d||1)));this.draw();return}
      if(down){const dx=q.x-down.x,dy=q.y-down.y;if(Math.hypot(dx,dy)>5)down.mov=true;if(down.mov){this.view.cx=down.cx-dx/this.view.s;this.view.cy=down.cy+dy/this.view.s}}
      this.hover=this.mundo(q);this.status();this.draw()};
    c.onpointerup=e=>{const q=pos(e);if(down&&!down.mov&&ptr.size===1)this.clique(this.mundo(q),q);ptr.delete(e.pointerId);if(ptr.size<2)pinch=null;down=null};
    c.onpointercancel=e=>{ptr.delete(e.pointerId);down=null;pinch=null};
    c.onpointerleave=()=>{this.hover=null;this.draw()};
    c.ondblclick=()=>{if(this.ferr==='lote')this.fecharLote()};
    c.addEventListener('wheel',e=>{e.preventDefault();const q=pos(e);this.zoom(Math.pow(1.0015,-e.deltaY),q)},{passive:false});
    if(!this.ligado){this.ligado=true;window.addEventListener('resize',()=>{if($('sigMap'))this.draw()});
      const re=()=>{this.heat=null;if($('sigMap')){this.draw();if(this.sub==='perfil')this.renderSub()}};
      try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',re)}catch(e){}new MutationObserver(re).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})}
    if(!this.view)this.fit();this.draw();this.setFerr(this.ferr);this.renderSub();
  },
  reset(){this.draft=[];this.med=[];this.prf=[];this.sel=-1;this.p.zp=null},
  tam(){const c=$('sigMap');return{W:c.clientWidth||600,H:c.clientHeight||400}},
  mundo(q){const{W,H}=this.tam(),v=this.view;return[v.cx+(q.x-W/2)/v.s,v.cy-(q.y-H/2)/v.s]},
  tela(x,y){const{W,H}=this.tam(),v=this.view;return[W/2+(x-v.cx)*v.s,H/2-(y-v.cy)*v.s]},
  zoom(f,q){const{W,H}=this.tam();q=q||{x:W/2,y:H/2};const a=this.mundo(q);this.view.s=Math.min(400,Math.max(0.02,this.view.s*f));const b=this.mundo(q);this.view.cx+=a[0]-b[0];this.view.cy+=a[1]-b[1];this.draw()},
  fit(){const xs=[...this.p.pts.map(p=>p.E),...this.p.lote.map(p=>p[0])],ys=[...this.p.pts.map(p=>p.N),...this.p.lote.map(p=>p[1])];const{W,H}=this.tam();
    if(!xs.length){this.view={cx:this.view?.cx??313280,cy:this.view?.cy??7402200,s:this.view?.s??8};return}
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);this.view={cx:(x0+x1)/2,cy:(y0+y1)/2,s:Math.min(400,Math.min(W/((x1-x0)*1.2||20),H/((y1-y0)*1.2||20)))}},
  setFerr(f){this.ferr=f;this.draft=f==='lote'?this.draft:[];document.querySelectorAll('#sigFerr [data-f]').forEach(b=>{b.classList.toggle('on',b.dataset.f===f);b.setAttribute('aria-pressed',b.dataset.f===f)});
    const cb=$('sigCotaBox');if(cb)cb.hidden=f!=='pto';
    const txt={nav:'Arraste para mover o mapa. Use a roda do mouse, dois dedos ou os botões + e − para o zoom. Clique em um ponto para ver os dados.',med:'Clique em dois lugares do mapa para medir distância, azimute e desnível.',lote:'Clique para marcar os vértices do lote. Para fechar, clique no primeiro vértice ou dê dois cliques.',prf:'Clique no início e no fim da linha de perfil. O corte do terreno aparece em Perfil do terreno.',pto:'Clique no mapa para criar um ponto. A cota vem do campo ao lado ou é interpolada do terreno.'};
    this.info(txt[f]);this.draw()},
  info(h){const i=$('sigInfo');if(i)i.innerHTML=h},
  zAt(x,y){return GEO.interp(this.p.pts,this.tris,x,y)},
  status(){const h=this.hover,el=$('sigXY');if(!h||!el)return;const z=this.zAt(h[0],h[1]),g=GEO.inversa(h[0],h[1],this.p.zona,this.p.sul);
    el.innerHTML=`<span>E ${br(h[0])}</span><span>N ${br(h[1])}</span><span>cota ${z==null?'—':br(z,3)+' m'}</span><span>${GEO.geoStr(g.lat,'N','S',1)} · ${GEO.geoStr(g.lon,'L','O',1)}</span>`},
  perto(q,lista,px=10){let b=-1,bd=px;lista.forEach((p,i)=>{const[sx,sy]=this.tela(p[0],p[1]),d=Math.hypot(sx-q.x,sy-q.y);if(d<bd){bd=d;b=i}});return b},
  clique(w,q){
    const P=this.p;
    if(this.ferr==='nav'){this.sel=this.perto(q,P.pts.map(p=>[p.E,p.N]));if(this.sel>=0){const p=P.pts[this.sel];this.info(`<b>${esc(p.nome)}</b> · E ${br(p.E)} · N ${br(p.N)} · cota ${br(p.z,3)} m <button class="chip" id="sigDel">Remover ponto</button>`);$('sigDel').onclick=()=>{P.pts.splice(this.sel,1);this.sel=-1;this.mudou();this.info('Ponto removido.')}}else this.setFerr('nav');if(this.sub==='tabela')this.renderSub();this.draw()}
    else if(this.ferr==='med'){if(this.med.length>=2)this.med=[];this.med.push(w);if(this.med.length===2){const[a,b]=this.med,d=Math.hypot(b[0]-a[0],b[1]-a[1]),za=this.zAt(...a),zb=this.zAt(...b),dz=za!=null&&zb!=null?zb-za:null;
      this.info(`<b>Distância ${br(d)} m</b> · Azimute ${GEO.azStr(GEO.az(a,b))}${dz!=null?` · Desnível ${dz>=0?'+':''}${br(dz,3)} m · Declividade ${br(d?100*dz/d:0,1)}%`:' · fora da área levantada'}`)}else this.info('Agora clique no segundo ponto.');this.draw()}
    else if(this.ferr==='lote'){if(this.draft.length>=3&&this.perto(q,[this.draft[0]],12)===0)return this.fecharLote();this.draft.push(w);
      this.info(`Vértices: <b>${this.draft.length}</b>${this.draft.length>=3?` · Área: <b>${br(Math.abs(GEO.areaAss(this.draft)))} m²</b>`:''} <button class="chip" id="sigOk"${this.draft.length<3?' disabled':''}>Concluir lote</button> <button class="chip" id="sigCan">Cancelar</button>`);
      $('sigOk').onclick=()=>this.fecharLote();$('sigCan').onclick=()=>{this.draft=[];this.setFerr('lote')};this.draw()}
    else if(this.ferr==='prf'){if(this.prf.length>=2)this.prf=[];this.prf.push(w);if(this.prf.length===2){this.sub='perfil';document.querySelectorAll('#sigSubs [data-s]').forEach(x=>x.classList.toggle('on',x.dataset.s==='perfil'));this.renderSub();this.info(`Perfil com ${br(Math.hypot(this.prf[1][0]-this.prf[0][0],this.prf[1][1]-this.prf[0][1]))} m traçado. Veja abaixo em Perfil do terreno.`)}else this.info('Agora clique no fim da linha de perfil.');this.draw()}
    else if(this.ferr==='pto'){const v=$('sigCota').value.trim(),zi=this.zAt(...w),z=v!==''?parseFloat(v.replace(',','.')):zi;
      if(z==null||isNaN(z))return this.info('Esse lugar está fora da área levantada. Informe a cota no campo "Cota do novo ponto".');
      let k=P.pts.length+1;while(P.pts.some(p=>p.nome==='P'+String(k).padStart(2,'0')))k++;P.pts.push({nome:'P'+String(k).padStart(2,'0'),E:+w[0].toFixed(3),N:+w[1].toFixed(3),z:+z.toFixed(3)});this.p.zp=null;this.mudou();this.info(`Ponto P${String(k).padStart(2,'0')} criado com cota ${br(z,3)} m${v===''?' (interpolada)':''}.`)}
  },
  fecharLote(){if(this.draft.length<3)return this.info('O lote precisa de pelo menos 3 vértices.');this.p.lote=GEO.horario(this.draft.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]));this.p.conf=this.p.lote.map(()=>'—');this.draft=[];this.p.zp=null;this.mudou(false);
    this.info(`Lote criado com ${this.p.lote.length} vértices e ${br(Math.abs(GEO.areaAss(this.p.lote)))} m². Os vértices foram ordenados no sentido horário. Preencha os confrontantes em Memorial descritivo.`)},
  heatImg(){const g=this.grade();if(!g||!g.cells.length)return null;const zp=this.p.zp;if(this.heat&&this.heat.zp===zp&&this.heat.g===g)return this.heat;
    const cv=document.createElement('canvas');cv.width=g.nx;cv.height=g.ny;const cx=cv.getContext('2d'),im=cx.createImageData(g.nx,g.ny),cc=rgbOf(cssVar('neg')),ca=rgbOf(cssVar('water'));
    let mx=0;g.cells.forEach(k=>{mx=Math.max(mx,Math.abs(k.z-zp))});mx=mx||1;
    for(const k of g.cells){const d=k.z-zp,c=d>0?cc:ca,o=((g.ny-1-k.iy)*g.nx+k.ix)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=Math.round(40+180*Math.abs(d)/mx)}
    cx.putImageData(im,0,0);return this.heat={zp,g,cv}},
  draw(){
    const c=$('sigMap');if(!c||!this.view)return;const dpr=window.devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;if(!W||!H)return;
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
    const x=c.getContext('2d'),K={};['sheet','ink','muted','line','grid','steel','steel-soft','amber','amber-ink','soil','neg','water','pos','paper'].forEach(k=>K[k]=cssVar(k));
    x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle=K.sheet;x.fillRect(0,0,W,H);
    if(this.camadas.osm&&!window.EMBUTIDO)this.fundo(x,W,H,dpr,K);
    const v=this.view,X=e=>W/2+(e-v.cx)*v.s,Y=n=>H/2-(n-v.cy)*v.s,P=this.p,mono='JetBrains Mono, ui-monospace, monospace';
    const nice=t=>{const p=10**Math.floor(Math.log10(t));return [1,2,5,10].map(m=>m*p).find(m=>m>=t)};
    if(this.camadas.grade){const st=nice(110/v.s),[e0,n1]=this.mundo({x:0,y:0}),[e1,n0]=this.mundo({x:W,y:H});x.strokeStyle=K.grid;x.lineWidth=1;x.fillStyle=K.muted;x.font=`10px ${mono}`;
      for(let e=Math.ceil(e0/st)*st;e<=e1;e+=st){x.beginPath();x.moveTo(X(e),0);x.lineTo(X(e),H);x.stroke();x.fillText(br(e,st<1?1:0),X(e)+3,H-6)}
      for(let n=Math.ceil(n0/st)*st;n<=n1;n+=st){x.beginPath();x.moveTo(0,Y(n));x.lineTo(W,Y(n));x.stroke();x.fillText(br(n,st<1?1:0),46,Y(n)-3)}}
    if(this.camadas.cortes){const h=this.heatImg();if(h){const g=h.g;x.imageSmoothingEnabled=false;x.drawImage(h.cv,X(g.x0),Y(g.y0+g.ny*g.cs),g.nx*g.cs*v.s,g.ny*g.cs*v.s);x.imageSmoothingEnabled=true}}
    if(this.camadas.tin){x.strokeStyle=K.line;x.lineWidth=0.8;x.beginPath();for(const t of this.tris){const[a,b,q]=t.map(i=>P.pts[i]);x.moveTo(X(a.E),Y(a.N));x.lineTo(X(b.E),Y(b.N));x.lineTo(X(q.E),Y(q.N));x.closePath()}x.stroke()}
    if(this.camadas.curvas&&this.cur){const M=new Map();x.strokeStyle=K.soil;
      for(const m of [false,true]){x.lineWidth=m?1.8:0.8;x.beginPath();for(const s of this.cur.segs){if((s.k%5===0)!==m)continue;x.moveTo(X(s.x1),Y(s.y1));x.lineTo(X(s.x2),Y(s.y2));if(m){const L=Math.hypot(s.x2-s.x1,s.y2-s.y1);if(!M.has(s.z)||M.get(s.z).L<L)M.set(s.z,{...s,L})}}x.stroke()}
      if(this.camadas.rotulos){x.font=`600 10px ${mono}`;x.textAlign='center';x.textBaseline='middle';for(const s of M.values()){const mx=X((s.x1+s.x2)/2),my=Y((s.y1+s.y2)/2),t=br(s.z,s.z%1?2:0);const w=x.measureText(t).width+6;x.fillStyle=K.sheet;x.fillRect(mx-w/2,my-7,w,14);x.fillStyle=K.soil;x.fillText(t,mx,my)}x.textAlign='start';x.textBaseline='alphabetic'}}
    if(this.camadas.lote&&P.lote.length>=3){x.beginPath();P.lote.forEach(([e,n],i)=>i?x.lineTo(X(e),Y(n)):x.moveTo(X(e),Y(n)));x.closePath();x.globalAlpha=this.camadas.cortes?0:.28;x.fillStyle=K['steel-soft'];x.fill();x.globalAlpha=1;x.strokeStyle=K.steel;x.lineWidth=2.2;x.stroke();
      x.font=`600 11px ${mono}`;P.lote.forEach(([e,n],i)=>{x.fillStyle=K.steel;x.fillRect(X(e)-4,Y(n)-4,8,8);if(this.camadas.rotulos){x.fillStyle=K.ink;x.fillText('V'+(i+1),X(e)+7,Y(n)-7)}});
      if(this.camadas.rotulos&&v.s>2){x.font=`10px ${mono}`;x.textAlign='center';P.lote.forEach((a,i)=>{const b=P.lote[(i+1)%P.lote.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]),t=br(d)+' m',mx=X((a[0]+b[0])/2),my=Y((a[1]+b[1])/2),w=x.measureText(t).width+6;x.fillStyle=K.sheet;x.fillRect(mx-w/2,my-7,w,14);x.fillStyle=K.steel;x.fillText(t,mx,my+3)});x.textAlign='start'}}
    if(this.camadas.pontos){x.font=`10px ${mono}`;P.pts.forEach((p,i)=>{const px=X(p.E),py=Y(p.N);if(px<-20||py<-20||px>W+20||py>H+20)return;x.fillStyle=i===this.sel?K.neg:K.amber;x.strokeStyle=K.ink;x.lineWidth=1;x.beginPath();x.arc(px,py,i===this.sel?5.5:3.5,0,7);x.fill();x.stroke();
      if(this.camadas.rotulos&&v.s>4){x.fillStyle=K.muted;x.fillText(p.nome+' '+br(p.z,2),px+6,py+12)}})}
    const linha=(pts,cor,dash)=>{x.strokeStyle=cor;x.lineWidth=2;x.setLineDash(dash||[]);x.beginPath();pts.forEach(([e,n],i)=>i?x.lineTo(X(e),Y(n)):x.moveTo(X(e),Y(n)));x.stroke();x.setLineDash([]);pts.forEach(([e,n])=>{x.fillStyle=cor;x.beginPath();x.arc(X(e),Y(n),4,0,7);x.fill()})};
    if(this.draft.length){linha(this.hover&&this.ferr==='lote'?[...this.draft,this.hover]:this.draft,K.amber,[6,4]);x.strokeStyle=K.amber;x.strokeRect(X(this.draft[0][0])-7,Y(this.draft[0][1])-7,14,14)}
    if(this.med.length)linha(this.med.length===1&&this.hover&&this.ferr==='med'?[this.med[0],this.hover]:this.med,K.ink,[2,3]);
    if(this.prf.length){const pts=this.prf.length===1&&this.hover&&this.ferr==='prf'?[this.prf[0],this.hover]:this.prf;linha(pts,K.neg);x.font=`600 11px ${mono}`;x.fillStyle=K.neg;x.fillText('A',X(pts[0][0])+7,Y(pts[0][1])-7);if(pts[1])x.fillText('B',X(pts[1][0])+7,Y(pts[1][1])-7)}
    // norte e escala
    const ny=this.camadas.osm&&!window.EMBUTIDO?22:0;x.fillStyle=K.ink;x.beginPath();x.moveTo(W-28,22+ny);x.lineTo(W-35,42+ny);x.lineTo(W-28,37+ny);x.lineTo(W-21,42+ny);x.closePath();x.fill();x.font=`600 11px ${mono}`;x.textAlign='center';x.fillText('N',W-28,16+ny);x.textAlign='start';
    const sb=nice(90/v.s),sw=sb*v.s;x.fillStyle=K.sheet;x.fillRect(10,H-38,sw+60,22);x.fillStyle=K.ink;x.fillRect(16,H-26,sw/2,5);x.strokeStyle=K.ink;x.lineWidth=1;x.strokeRect(16,H-26,sw,5);x.font=`10px ${mono}`;x.fillText(br(sb,sb<1?1:0)+' m',sw+22,H-20);
    if(this.camadas.cortes&&this.g){x.font=`10px ${mono}`;const lx=W-150;x.fillStyle=K.sheet;x.fillRect(lx-6,H-36,146,26);x.fillStyle=K.neg;x.fillRect(lx,H-28,10,10);x.fillStyle=K.ink;x.fillText('corte',lx+14,H-19);x.fillStyle=K.water;x.fillRect(lx+64,H-28,10,10);x.fillStyle=K.ink;x.fillText('aterro',lx+78,H-19)}
    if(this.camadas.osm&&!window.EMBUTIDO){x.font=`10px ${mono}`;const t='© colaboradores do OpenStreetMap',tw=x.measureText(t).width;x.fillStyle=K.sheet;x.globalAlpha=.85;x.fillRect(W-tw-12,4,tw+8,15);x.globalAlpha=1;x.fillStyle=K.ink;x.fillText(t,W-tw-8,15)}
    if(!P.pts.length&&!P.lote.length){x.fillStyle=K.muted;x.font=`14px ${mono}`;x.textAlign='center';x.fillText('Projeto vazio: crie pontos, desenhe um lote ou importe um arquivo',W/2,H/2);x.textAlign='start'}
  },
  tiles:new Map(),
  TILE_URL:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tile(z,X,Y){const n2=2**z;if(Y<0||Y>=n2)return null;X=((X%n2)+n2)%n2;const k=z+'/'+X+'/'+Y;let t=this.tiles.get(k);
    if(!t){const im=new Image();im.crossOrigin='anonymous';t={im,ok:false};im.onload=()=>{t.ok=true;clearTimeout(this._tt);this._tt=setTimeout(()=>this.draw(),30)};im.onerror=()=>{t.erro=true};
      im.src=this.TILE_URL.replace('{z}',z).replace('{x}',X).replace('{y}',Y);this.tiles.set(k,t);if(this.tiles.size>600)this.tiles.delete(this.tiles.keys().next().value)}
    return t.ok?t.im:null},
  fundo(x,W,H,dpr,K){
    const P=this.p,c=[[0,0],[W,0],[0,H],[W,H]].map(([a,b])=>{const[e,n]=this.mundo({x:a,y:b});return GEO.inversa(e,n,P.zona,P.sul)});
    const lat0=(c[0].lat+c[3].lat)/2,z=Math.max(1,Math.min(19,Math.round(Math.log2(156543.03392*Math.cos(lat0*Math.PI/180)*this.view.s)))),n2=2**z;
    const tx=lo=>(lo+180)/360*n2,ty=la=>{const r=la*Math.PI/180;return(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n2};
    const xs=c.map(q=>tx(q.lon)),ys=c.map(q=>ty(q.lat)),x0=Math.floor(Math.min(...xs)),x1=Math.floor(Math.max(...xs)),y0=Math.floor(Math.min(...ys)),y1=Math.floor(Math.max(...ys));
    if((x1-x0+1)*(y1-y0+1)>80)return;
    const tela=(X,Y)=>{const lon=X/n2*360-180,la=Math.atan(Math.sinh(Math.PI*(1-2*Y/n2)))*180/Math.PI,u=GEO.direta(la,lon,P.zona);return this.tela(u.E,u.N)};
    const fundoRGB=rgbOf(K.sheet),escuro=fundoRGB[0]+fundoRGB[1]+fundoRGB[2]<300;
    x.save();x.globalAlpha=escuro?.75:.9;if(escuro)x.filter='invert(1) hue-rotate(180deg) brightness(.8) contrast(.9)';
    for(let X=x0;X<=x1;X++)for(let Y=y0;Y<=y1;Y++){const im=this.tile(z,X,Y);if(!im)continue;const a=tela(X,Y),b=tela(X+1,Y),d=tela(X,Y+1);
      x.setTransform(dpr*(b[0]-a[0])/256,dpr*(b[1]-a[1])/256,dpr*(d[0]-a[0])/256,dpr*(d[1]-a[1])/256,dpr*a[0],dpr*a[1]);x.drawImage(im,0,0,256.6,256.6)}
    x.restore();x.setTransform(dpr,0,0,dpr,0,0);
  },
  renderSub(){
    const el=$('sigSub');if(!el)return;const P=this.p,s=this.sub;
    if(s==='tabela'){
      el.innerHTML=`<h3>Pontos levantados (${P.pts.length})</h3><div class="tbl-wrap alto"><table class="ed"><thead><tr><th>Ponto</th><th>E (m)</th><th>N (m)</th><th>Cota (m)</th><th></th></tr></thead><tbody>${P.pts.map((p,i)=>`<tr${i===this.sel?' class="selrow"':''}><td><input type="text" id="sigP_${i}_nome" data-i="${i}" data-k="nome" value="${esc(p.nome)}" aria-label="Nome do ponto"></td><td><input type="number" step="0.001" id="sigP_${i}_E" data-i="${i}" data-k="E" value="${p.E}" aria-label="E de ${esc(p.nome)}"></td><td><input type="number" step="0.001" id="sigP_${i}_N" data-i="${i}" data-k="N" value="${p.N}" aria-label="N de ${esc(p.nome)}"></td><td><input type="number" step="0.001" id="sigP_${i}_z" data-i="${i}" data-k="z" value="${p.z}" aria-label="Cota de ${esc(p.nome)}"></td><td><button class="rm" data-rp="${i}" aria-label="Remover ${esc(p.nome)}">✕</button></td></tr>`).join('')}</tbody></table></div>
      <h3>Vértices do lote (${P.lote.length})</h3><div class="tbl-wrap"><table class="ed"><thead><tr><th>Vértice</th><th>E (m)</th><th>N (m)</th><th>Lado seguinte</th><th></th></tr></thead><tbody>${P.lote.map((v,i)=>{const q=P.lote[(i+1)%P.lote.length];return `<tr><td class="num"><b>V${i+1}</b></td><td><input type="number" step="0.001" id="sigV_${i}_0" data-v="${i}" data-c="0" value="${v[0]}" aria-label="E de V${i+1}"></td><td><input type="number" step="0.001" id="sigV_${i}_1" data-v="${i}" data-c="1" value="${v[1]}" aria-label="N de V${i+1}"></td><td class="num">${br(Math.hypot(q[0]-v[0],q[1]-v[1]))} m · ${GEO.azStr(GEO.az(v,q))}</td><td>${P.lote.length>3?`<button class="rm" data-rv="${i}" aria-label="Remover V${i+1}">✕</button>`:''}</td></tr>`}).join('')}</tbody></table></div>
      ${P.lote.length>=3?`<p>Área: <b>${br(Math.abs(GEO.areaAss(P.lote)))} m²</b> · Perímetro: <b>${br(GEO.memorial(P.lote,[],{zona:P.zona}).per)} m</b></p>`:'<p>Nenhum lote ainda. Use a ferramenta Desenhar lote ou importe um polígono.</p>'}`;
      el.querySelectorAll('[data-k]').forEach(inp=>inp.onchange=()=>{const p=P.pts[+inp.dataset.i],k=inp.dataset.k;if(k==='nome')p.nome=inp.value||p.nome;else{const v=parseFloat(inp.value);if(!isNaN(v))p[k]=v}P.zp=null;this.mudou(k!=='nome',false)});
      el.querySelectorAll('[data-rp]').forEach(b=>b.onclick=()=>{P.pts.splice(+b.dataset.rp,1);this.sel=-1;P.zp=null;this.mudou()});
      el.querySelectorAll('[data-v]').forEach(inp=>inp.onchange=()=>{const v=parseFloat(inp.value);if(!isNaN(v)){P.lote[+inp.dataset.v][+inp.dataset.c]=v;P.zp=null;this.mudou(false)}});
      el.querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>{P.lote.splice(+b.dataset.rv,1);P.conf.splice(+b.dataset.rv,1);P.zp=null;this.mudou(false)});
    }
    else if(s==='perfil'){
      if(this.prf.length<2||!this.tris.length){el.innerHTML=`<p>${this.tris.length?'Escolha a ferramenta Perfil e clique em dois lugares do mapa.':'São necessários pelo menos 3 pontos com cota para gerar o terreno.'}</p><div><button class="btn sec" id="sigGoPrf">Traçar perfil</button></div>`;$('sigGoPrf').onclick=()=>this.setFerr('prf');return}
      const r=GEO.perfil(P.pts,this.tris,this.prf[0],this.prf[1],240),zs=r.z.filter(z=>z!=null);
      if(zs.length<2){el.innerHTML='<p>A linha está fora da área levantada. Trace o perfil sobre os pontos.</p>';return}
      let zmin=Math.min(...zs),zmax=Math.max(...zs);const fz=r.z.find(z=>z!=null),lz=[...r.z].reverse().find(z=>z!=null),dz=lz-fz;
      const pad=Math.max(0.5,(zmax-zmin)*0.15);zmin-=pad;zmax+=pad;const x0=60,x1=620,y0=20,y1=200,sx=d=>x0+(x1-x0)*d/r.L,sy=z=>y1-(y1-y0)*(z-zmin)/(zmax-zmin);
      const nice=t=>{const p=10**Math.floor(Math.log10(t));return [1,2,5,10].map(m=>m*p).find(m=>m>=t)},tz=nice((zmax-zmin)/5),td=nice(r.L/6);let g='';
      for(let z=Math.ceil(zmin/tz)*tz;z<=zmax;z+=tz)g+=Ln(x0,sy(z),x1,sy(z),'grid')+T(x0-6,sy(z)+4,br(z,tz<1?1:0),'muted','text-anchor="end" font-size="10"');
      for(let d=0;d<=r.L+1e-9;d+=td)g+=Ln(sx(d),y0,sx(d),y1,'grid')+T(sx(d),y1+16,br(d,td<1?1:0),'muted','text-anchor="middle" font-size="10"');
      let path='',fill='';let open=false;r.d.forEach((d,i)=>{const z=r.z[i];if(z==null){if(open){fill+=` L${sx(r.d[i-1]).toFixed(1)} ${y1} Z`;open=false}return}if(!open){path+=` M${sx(d).toFixed(1)} ${sy(z).toFixed(1)}`;fill+=` M${sx(d).toFixed(1)} ${y1} L${sx(d).toFixed(1)} ${sy(z).toFixed(1)}`;open=true}else{path+=` L${sx(d).toFixed(1)} ${sy(z).toFixed(1)}`;fill+=` L${sx(d).toFixed(1)} ${sy(z).toFixed(1)}`}});if(open)fill+=` L${sx(r.d[r.d.length-1]).toFixed(1)} ${y1} Z`;
      g+=`<path d="${fill}" style="fill:var(--soil-fill)"/><path d="${path}" style="fill:none;stroke:var(--soil);stroke-width:2"/>`;
      if(P.zp!=null&&P.zp>zmin&&P.zp<zmax)g+=Ln(x0,sy(P.zp),x1,sy(P.zp),'amber',1.5,'stroke-dasharray="6 4"')+T(x1-4,sy(P.zp)-6,'platô '+br(P.zp,2),'amber-ink','text-anchor="end" font-size="10"');
      g+=T(x0,y0-6,'A','neg','font-weight="600"')+T(x1,y0-6,'B','neg','font-weight="600" text-anchor="end"')+T((x0+x1)/2,y1+32,'distância (m)','muted','text-anchor="middle" font-size="10"')+T(14,(y0+y1)/2,'cota (m)','muted','font-size="10" transform="rotate(-90 14 110)" text-anchor="middle"');
      const exag=((y1-y0)/(zmax-zmin))/((x1-x0)/r.L);
      el.innerHTML=tiles([['Comprimento',br(r.L)+' m'],['Desnível A → B',(dz>=0?'+':'')+br(dz,3)+' m'],['Declividade média',br(100*dz/r.L,2)+'%',1],['Cota mín. / máx.',br(Math.min(...zs),2)+' / '+br(Math.max(...zs),2)+' m']])+`<div class="draw">${SVG(640,240,'Perfil longitudinal do terreno',g)}</div><p class="nota">Exagero vertical de ${br(exag,1)} vezes para mostrar o relevo. Azimute da linha: ${GEO.azStr(GEO.az(this.prf[0],this.prf[1]))}.</p>`;
    }
    else if(s==='volume'){
      if(P.lote.length<3){el.innerHTML='<p>Desenhe ou importe um lote para calcular o corte e o aterro.</p>';return}
      const g=this.grade();if(!g||!g.cells.length){el.innerHTML='<p>O lote está fora da área levantada. São necessários pontos com cota dentro do lote.</p>';return}
      el.innerHTML=`<div class="row"><div class="campo"><label for="sigZp">Cota do platô (m)</label><input type="number" step="0.01" id="sigZp" value="${P.zp}"></div><div class="campo"><label for="sigEmp">Empolamento do solo (%)</label><input type="number" step="1" min="0" max="80" id="sigEmp" value="${P.emp}"></div><div class="campo"><label for="sigCam">Caçamba do caminhão (m³)</label><input type="number" step="1" min="1" id="sigCam" value="${P.cam}"></div></div>
        <div class="presets"><button class="chip" id="sigEq">Usar a cota de equilíbrio (${br(g.zEq,2)} m)</button><label class="chk"><input type="checkbox" id="sigShowCut"${this.camadas.cortes?' checked':''}> Mostrar corte e aterro no mapa</label></div><div id="sigVolRes"></div>
        <p class="nota">Cálculo pelo método da malha: o lote é dividido em ${br(g.nIn,0)} células de ${br(g.cs,2)} × ${br(g.cs,2)} m e a cota de cada uma vem da triangulação (TIN). A cota de equilíbrio é a média das cotas do terreno no lote, onde o corte e o aterro se compensam. O empolamento aumenta o volume que sai no caminhão; a compactação do aterro não está incluída.</p>`;
      const upd=()=>{const zp=parseFloat($('sigZp').value),emp=parseFloat($('sigEmp').value)||0,cam=parseFloat($('sigCam').value)||12;if(isNaN(zp))return;P.zp=zp;P.emp=emp;P.cam=cam;this.salvar();
        const r=GEO.cortaterro(g,zp),sal=r.corte-r.aterro,solto=Math.abs(sal)*(1+emp/100),via=Math.ceil(solto/cam-1e-9);
        $('sigVolRes').innerHTML=tiles([['Corte',br(r.corte)+' m³',1],['Aterro',br(r.aterro)+' m³',1],[sal>=0?'Sobra (bota-fora)':'Falta (empréstimo)',br(Math.abs(sal))+' m³'],['Volume solto no caminhão',br(sal>=0?solto:Math.abs(sal))+' m³'],['Viagens de caminhão',(sal>=0?via:Math.ceil(Math.abs(sal)/cam-1e-9))+' viagens'],['Área do lote',br(g.area)+' m²']])+(g.nSem?` <span class="pill alerta">${br(100*g.nSem/g.nIn,1)}% do lote está fora da área levantada e ficou sem cálculo</span>`:' <span class="pill ok">Lote todo dentro da área levantada</span>');
        this.draw();if(this.camadas.cortes)this.draw()};
      ['sigZp','sigEmp','sigCam'].forEach(id=>$(id).oninput=upd);upd();
      $('sigEq').onclick=()=>{$('sigZp').value=g.zEq.toFixed(2);upd()};
      $('sigShowCut').onchange=()=>{this.camadas.cortes=$('sigShowCut').checked;const l=$('sigL_cortes');if(l)l.checked=this.camadas.cortes;this.draw()};
    }
    else if(s==='memorial'){
      if(P.lote.length<3){el.innerHTML='<p>Desenhe ou importe um lote para gerar o memorial.</p>';return}
      while(P.conf.length<P.lote.length)P.conf.push('—');
      const m=GEO.memorial(P.lote,P.conf,{imovel:P.imovel,mun:P.mun,zona:P.zona,sul:P.sul});
      el.innerHTML=`<div class="row"><div class="campo"><label for="sigImovel">Imóvel</label><input type="text" id="sigImovel" value="${esc(P.imovel)}"></div><div class="campo"><label for="sigMun">Município</label><input type="text" id="sigMun" value="${esc(P.mun)}"></div></div>
        <div class="tbl-wrap"><table class="ed"><thead><tr><th>Lado</th><th>Azimute</th><th>Distância</th><th>Confrontante</th></tr></thead><tbody>${m.lados.map((l,i)=>`<tr><td class="num">V${i+1} → V${(i+1)%P.lote.length+1}</td><td class="num">${GEO.azStr(l.az)}</td><td class="num">${br(l.d)} m</td><td><input type="text" id="sigCf_${i}" data-cf="${i}" value="${esc(P.conf[i])}" aria-label="Confrontante do lado V${i+1}" style="min-width:160px;font-family:var(--f-body)"></td></tr>`).join('')}</tbody></table></div>
        <div class="memorial" id="sigMemo" style="white-space:pre-wrap"></div><div class="placar"><button class="btn" id="sigCpM">Copiar memorial</button>${podeBaixar?'<button class="btn sec" id="sigDlM">Baixar .txt</button>':''}<span id="sigCpMsg"></span></div>
        <p class="nota">Modelo no padrão usado em cartórios e prefeituras. Para registro, o memorial precisa ser assinado por profissional habilitado, com ART ou RRT.</p>`;
      const up=()=>{P.imovel=$('sigImovel').value;P.mun=$('sigMun').value;el.querySelectorAll('[data-cf]').forEach(i=>P.conf[+i.dataset.cf]=i.value||'—');this.salvar();$('sigMemo').textContent=GEO.memorial(P.lote,P.conf,{imovel:P.imovel,mun:P.mun,zona:P.zona,sul:P.sul}).texto};
      el.querySelectorAll('input').forEach(i=>i.oninput=up);up();$('sigCpM').onclick=()=>copiar($('sigMemo'),$('sigCpMsg'));if($('sigDlM'))$('sigDlM').onclick=()=>{baixar('memorial-descritivo.txt',$('sigMemo').textContent);$('sigCpMsg').textContent='Arquivo baixado.'};
    }
    else if(s==='io'){
      el.innerHTML=`<h3>Importar levantamento</h3><p>Aceita CSV de estação total ou GPS (ponto; E; N; cota), GeoJSON e KML do Google Earth. Coordenadas em latitude e longitude são convertidas para UTM SIRGAS 2000.</p>
        <div class="row"><div class="campo"><label for="sigFile">Arquivo</label><input type="file" id="sigFile" accept=".csv,.txt,.geojson,.json,.kml"></div><label class="chk"><input type="checkbox" id="sigAdd"> Adicionar aos pontos que já existem</label></div>
        <textarea id="sigPaste" class="out" placeholder="Ou cole aqui o conteúdo. Exemplo:&#10;ponto;E;N;cota&#10;P1;313250,00;7402180,00;742,15"></textarea><div class="placar"><button class="btn sec" id="sigImp">Importar texto colado</button><span id="sigImpMsg"></span></div>
        <h3>Exportar</h3><div class="presets">${[['geojson','GeoJSON'],['kml','KML (Google Earth)'],['csv','CSV (planilha)']].map(([k,t])=>`<button class="chip${this.fmt===k?' on':''}" data-x="${k}">${t}</button>`).join('')}</div>
        <textarea id="sigOut" class="out" readonly aria-label="Conteúdo exportado"></textarea><div class="placar">${podeBaixar?'<button class="btn" id="sigDlO">Baixar arquivo</button>':''}<button class="btn${podeBaixar?' sec':''}" id="sigCpO">Copiar</button><span id="sigCpOMsg"></span></div><p class="nota">${podeBaixar?'O arquivo abre direto no QGIS, no Google Earth ou no Excel.':'Cole o conteúdo num arquivo de texto com a extensão indicada para abrir no QGIS, no Google Earth ou no Excel.'}</p>`;
      const out=()=>{$('sigOut').value=this.exportar(this.fmt)};out();
      el.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{this.fmt=b.dataset.x;el.querySelectorAll('[data-x]').forEach(x=>x.classList.toggle('on',x===b));out()});
      $('sigCpO').onclick=()=>copiar($('sigOut'),$('sigCpOMsg'));
      if($('sigDlO'))$('sigDlO').onclick=()=>{const ext={geojson:['geojson','application/geo+json'],kml:['kml','application/vnd.google-earth.kml+xml'],csv:['csv','text/csv']}[this.fmt];baixar('levantamento.'+ext[0],this.exportar(this.fmt),ext[1]);$('sigCpOMsg').textContent='Arquivo baixado.'};
      $('sigFile').onchange=()=>{const f=$('sigFile').files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>this.importar(String(rd.result),f.name);rd.onerror=()=>this.impMsg('Não consegui abrir o arquivo.',false);rd.readAsText(f)};
      $('sigImp').onclick=()=>{const t=$('sigPaste').value;if(!t.trim())return this.impMsg('Cole o conteúdo do arquivo no campo acima.',false);this.importar(t,'')};
    }
    else if(s==='conv'){
      el.innerHTML=`<div class="cols"><div class="lista"><h3>Geográfica → UTM</h3><div class="row"><div class="campo"><label for="cvLat">Latitude (graus decimais)</label><input type="number" step="0.000001" id="cvLat" value="-23.4440"></div><div class="campo"><label for="cvLon">Longitude (graus decimais)</label><input type="number" step="0.000001" id="cvLon" value="-46.9180"></div></div><div class="memorial" id="cvOut1"></div></div>
        <div class="lista"><h3>UTM → Geográfica</h3><div class="row"><div class="campo"><label for="cvE">E (m)</label><input type="number" step="0.01" id="cvE" value="313250"></div><div class="campo"><label for="cvN">N (m)</label><input type="number" step="0.01" id="cvN" value="7402180"></div></div><p class="nota">Usa a zona e o hemisfério do projeto: ${P.zona}${P.sul?'S':'N'}.</p><div class="memorial" id="cvOut2"></div></div></div>
        <p class="nota">Elipsoide GRS80 (SIRGAS 2000), fator de escala 0,9996. A diferença para o WGS 84 do GPS é de poucos centímetros.</p>`;
      const up=()=>{const la=parseFloat($('cvLat').value),lo=parseFloat($('cvLon').value),E=parseFloat($('cvE').value),N=parseFloat($('cvN').value);
        if(!isNaN(la)&&!isNaN(lo)&&Math.abs(la)<=84&&Math.abs(lo)<=180){const r=GEO.direta(la,lo);$('cvOut1').textContent=`Zona ${r.zona}${r.sul?'S':'N'} (MC ${GEO.mc(r.zona)}°)\nE = ${br(r.E,3)} m\nN = ${br(r.N,3)} m\n${GEO.geoStr(la,'N','S',3)}  ${GEO.geoStr(lo,'L','O',3)}`}else $('cvOut1').textContent='Informe latitude entre −84 e 84 e longitude entre −180 e 180.';
        if(!isNaN(E)&&!isNaN(N)){const g=GEO.inversa(E,N,P.zona,P.sul);$('cvOut2').textContent=`Latitude  = ${g.lat.toFixed(8)}°  (${GEO.geoStr(g.lat,'N','S',4)})\nLongitude = ${g.lon.toFixed(8)}°  (${GEO.geoStr(g.lon,'L','O',4)})`}};
      el.querySelectorAll('input').forEach(i=>i.oninput=up);up();
    }
  },
  impMsg(t,ok){const m=$('sigImpMsg');if(m)m.innerHTML=`<span class="pill ${ok?'ok':'alerta'}">${t}</span>`},
  paraUTM(lista){if(!lista.length)return{pts:[]};const z=GEO.zona(lista[0].lon),sul=lista[0].lat<0;return{zona:z,sul,pts:lista.map(p=>{const r=GEO.direta(p.lat,p.lon,z);return{nome:p.nome,E:+r.E.toFixed(3),N:+r.N.toFixed(3),z:p.z}})}},
  lerCSV(t){const r=GEO.parseCSV(t);if(r.erro)throw new Error(r.erro);const out=r.geo?this.paraUTM(r.pts):{pts:r.pts};out.aviso=[r.semZ?`${r.semZ} ponto(s) sem cota ficaram com cota 0.`:'',r.ruins?`${r.ruins} linha(s) ignorada(s).`:''].join(' ').trim();return out},
  lerGeoJSON(o){const fs=o.type==='FeatureCollection'?o.features:o.type==='Feature'?[o]:[{geometry:o,properties:{}}],pts=[],geo=[];let ring=null;
    const add=(c,pr,i)=>{const nome=pr.nome||pr.name||pr.ponto||pr.id||'P'+String(i).padStart(2,'0'),z=+(c[2]??pr.cota??pr.z??pr.elevation??0)||0;(Math.abs(c[0])>180?pts:geo).push(Math.abs(c[0])>180?{nome,E:c[0],N:c[1],z}:{nome,lat:c[1],lon:c[0],z})};
    fs.forEach(f=>{const g=f.geometry,pr=f.properties||{};if(!g)return;if(g.type==='Point')add(g.coordinates,pr,pts.length+geo.length+1);else if(g.type==='MultiPoint')g.coordinates.forEach(c=>add(c,pr,pts.length+geo.length+1));
      else if(!ring&&(g.type==='Polygon'||g.type==='MultiPolygon')){ring=g.type==='Polygon'?g.coordinates[0]:g.coordinates[0][0]}});
    let out={pts},proj=null;if(geo.length){out=this.paraUTM(geo);out.pts=pts.concat(out.pts)}
    if(ring){ring=ring.slice();const a=ring[0],b=ring[ring.length-1];if(a[0]===b[0]&&a[1]===b[1])ring.pop();
      if(Math.abs(ring[0][0])>180)out.lote=ring.map(c=>[c[0],c[1]]);else{const z=out.zona||GEO.zona(ring[0][0]),sul=ring[0][1]<0;out.zona=z;out.sul=sul;out.lote=ring.map(c=>{const r=GEO.direta(c[1],c[0],z);return[+r.E.toFixed(3),+r.N.toFixed(3)]})}}
    return out},
  lerKML(t){const d=new DOMParser().parseFromString(t,'application/xml');if(d.getElementsByTagName('parsererror').length)throw new Error('o KML tem erro de formatação');
    const cs=s=>s.trim().split(/\s+/).map(q=>q.split(',').map(Number)).filter(c=>c.length>=2&&!isNaN(c[0])&&!isNaN(c[1])),geo=[];let ring=null;
    [...d.getElementsByTagName('Placemark')].forEach((pm,i)=>{const nm=pm.getElementsByTagName('name')[0],nome=nm?nm.textContent.trim():'P'+String(i+1).padStart(2,'0'),pt=pm.getElementsByTagName('Point')[0],pg=pm.getElementsByTagName('Polygon')[0];
      if(pt){const c=cs(pt.getElementsByTagName('coordinates')[0]?.textContent||'')[0];if(c)geo.push({nome,lon:c[0],lat:c[1],z:c[2]||0})}
      if(pg&&!ring){const ob=pg.getElementsByTagName('outerBoundaryIs')[0]||pg;ring=cs(ob.getElementsByTagName('coordinates')[0]?.textContent||'')}});
    const out=this.paraUTM(geo);if(ring&&ring.length>=3){const a=ring[0],b=ring[ring.length-1];if(a[0]===b[0]&&a[1]===b[1])ring.pop();const z=out.zona||GEO.zona(ring[0][0]);out.zona=z;out.sul=ring[0][1]<0;out.lote=ring.map(c=>{const r=GEO.direta(c[1],c[0],z);return[+r.E.toFixed(3),+r.N.toFixed(3)]})}
    return out},
  importar(t,nome){let r;t=t.replace(/^﻿/,'').trim();
    try{if(/\.kml$/i.test(nome)||t.startsWith('<'))r=this.lerKML(t);else if(/\.(geo)?json$/i.test(nome)||t.startsWith('{'))r=this.lerGeoJSON(JSON.parse(t));else r=this.lerCSV(t)}catch(e){return this.impMsg('Não consegui ler: '+e.message,false)}
    if(!r.pts.length&&!(r.lote&&r.lote.length>=3))return this.impMsg('Não encontrei pontos nem polígono no arquivo.',false);
    const add=$('sigAdd')&&$('sigAdd').checked,P=this.p;if(r.pts.length)P.pts=add?P.pts.concat(r.pts):r.pts;
    if(r.lote&&r.lote.length>=3){P.lote=GEO.horario(r.lote);P.conf=P.lote.map(()=>'—')}if(r.zona){P.zona=r.zona;P.sul=r.sul;if($('sigZona')){$('sigZona').value=r.zona;$('sigHem').value=r.sul?'S':'N'}}
    this.reset();this.mudou(true,false);this.fit();this.draw();
    this.impMsg(`Importado: ${r.pts.length} ponto(s)${r.lote&&r.lote.length>=3?` e um lote com ${r.lote.length} vértices`:''}${r.zona?`, convertidos para UTM zona ${r.zona}${r.sul?'S':'N'}`:''}.${r.aviso?' '+r.aviso:''}`,true);
    const o=$('sigOut');if(o)o.value=this.exportar(this.fmt)},
  exportar(f){const P=this.p,g=(e,n)=>{const r=GEO.inversa(e,n,P.zona,P.sul);return[+r.lon.toFixed(9),+r.lat.toFixed(9)]},A=P.lote.length>=3?Math.abs(GEO.areaAss(P.lote)):0;
    if(f==='csv')return 'ponto;E;N;cota\n'+P.pts.map(p=>[p.nome,p.E,p.N,p.z].map(v=>String(v).replace('.',',')).join(';')).join('\n')+(P.lote.length?'\n\nvertice;E;N\n'+P.lote.map((v,i)=>['V'+(i+1),v[0],v[1]].map(x=>String(x).replace('.',',')).join(';')).join('\n'):'');
    if(f==='kml'){const pm=P.pts.map(p=>{const[lo,la]=g(p.E,p.N);return `  <Placemark><name>${esc(p.nome)}</name><description>Cota ${p.z} m</description><Point><coordinates>${lo},${la},${p.z}</coordinates></Point></Placemark>`});
      if(P.lote.length>=3)pm.push(`  <Placemark><name>${esc(P.imovel||'Lote')}</name><description>Área ${br(A)} m²</description><Polygon><outerBoundaryIs><LinearRing><coordinates>${[...P.lote,P.lote[0]].map(v=>g(v[0],v[1]).join(',')+',0').join(' ')}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`);
      return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Academia Foster · levantamento</name>\n${pm.join('\n')}\n</Document></kml>`}
    const fc={type:'FeatureCollection',features:P.pts.map(p=>({type:'Feature',properties:{nome:p.nome,E:p.E,N:p.N,cota:p.z},geometry:{type:'Point',coordinates:[...g(p.E,p.N),p.z]}}))};
    if(P.lote.length>=3)fc.features.push({type:'Feature',properties:{nome:P.imovel||'Lote',area_m2:+A.toFixed(2),perimetro_m:+GEO.memorial(P.lote,[],{zona:P.zona}).per.toFixed(2)},geometry:{type:'Polygon',coordinates:[[...P.lote,P.lote[0]].map(v=>g(v[0],v[1]))]}});
    return JSON.stringify(fc,null,1)}
};

