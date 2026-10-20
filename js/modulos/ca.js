// CA-03 · Concreto Armado
Academia.modulo('ca',{
teoria:`<p>O concreto aguenta muito bem ser apertado (compressão), mas trinca fácil quando é puxado (tração resiste só cerca de 10%). Por isso colocamos aço onde a peça é tracionada. Juntos, viram concreto armado.</p>
<div class="cols"><div class="conceito"><h4>Coeficientes de segurança</h4><p>Cargas × 1,4 (γf). Resistência do concreto ÷ 1,4 (γc). Resistência do aço ÷ 1,15 (γs).</p></div>
<div class="conceito"><h4>Aço CA-50</h4><p>fyk = 500 MPa. De cálculo: fyd = 500/1,15 ≈ 435 MPa = 43,5 kN/cm².</p></div>
<div class="conceito"><h4>Linha neutra (x)</h4><p>Divide a parte comprimida da tracionada. A norma pede x/d ≤ 0,45 para a viga avisar antes de romper (ductilidade).</p></div></div>
<h3>Fórmulas do dimensionamento (seção retangular)</h3>
<div class="formula">Md = 1,4·Mk     fcd = fck/1,4     d ≈ h − 4 cm</div>
<div class="formula">x = 1,25·d·[1 − √(1 − Md / (0,425·bw·d²·fcd))]</div>
<div class="formula">As = Md / [fyd·(d − 0,4·x)]     As,mín = ρmín·bw·h (0,15% até C30)</div>
<div class="dica"><b>Dica de projeto</b>Se x/d passar de 0,45, não adianta só pôr mais aço. Aumente a altura da viga ou use concreto mais resistente.</div>`,
exemplo:`<h3>Viga 20 × 50 com Mk = 100 kN·m</h3><p>Concreto C25 (fck = 25 MPa), aço CA-50, cobrimento e estribo somando cerca de 4 cm até o centro da barra.</p>
<ol class="passos"><li><b>Altura útil.</b> d = 50 − 4 = <b>46 cm</b>.</li>
<li><b>Momento de cálculo.</b> Md = 1,4 × 100 = 140 kN·m = <b>14.000 kN·cm</b>.</li>
<li><b>Resistência de cálculo.</b> fcd = 25 / 1,4 = 17,86 MPa = <b>1,786 kN/cm²</b>.</li>
<li><b>Linha neutra.</b> x = 1,25 × 46 × [1 − √(1 − 14000/(0,425 × 20 × 46² × 1,786))] ≈ <b>14,3 cm</b>. x/d = 0,31 ≤ 0,45 ✓</li>
<li><b>Armadura.</b> As = 14000 / [43,48 × (46 − 0,4 × 14,3)] ≈ <b>8,0 cm²</b> → <b>4 φ 16 mm</b> (8,04 cm²).</li></ol>
<div class="dica"><b>Confira no simulador</b>bw = 20, h = 50, fck = 25 e Mk = 100.</div>`,
sim:{html:()=>simWrap(rng('cB','Largura bw',12,40,1,20,'cm')+rng('cH','Altura h',25,90,5,50,'cm')+sel('cF','Concreto',[[20,'C20 (fck 20 MPa)'],[25,'C25 (fck 25 MPa)',1],[30,'C30 (fck 30 MPa)'],[35,'C35'],[40,'C40'],[45,'C45'],[50,'C50']])+rng('cM','Momento Mk',5,400,5,100,'kN·m','Valor característico (sem majorar)')),
update(){const bw=V_('cB'),h=V_('cH'),fck=V_('cF'),Mk=V_('cM'),r=calc.flexao(bw,h,fck,Mk);
if(r.inviavel){$('tiles').innerHTML=tiles([['Md',br(r.Md/100)+' kN·m'],['d',br(r.d,1)+' cm'],['Situação','Seção pequena',1],['As','—']])+'<span class="pill alerta">Seção não suporta o momento. Aumente h ou bw.</span>';
$('draw').innerHTML='';$('memorial').textContent=`Md = ${br(r.Md)} kN·cm é maior que a capacidade da seção (termo da raiz negativo).\nAumente a altura h, a largura bw ou o fck.`;return;}
const b=calc.barras(r.Asf,bw);
$('tiles').innerHTML=tiles([['Md',br(r.Md/100)+' kN·m'],['x / d',br(r.xd,3)],['As necessária',br(r.Asf)+' cm²',1],['Sugestão',`${b.n} φ ${br(b.f,b.f%1?1:0)} mm`]])+(r.ok?'<span class="pill ok">x/d ≤ 0,45 · ductilidade OK</span>':'<span class="pill alerta">x/d &gt; 0,45 · aumente a seção</span>')+(b.camadas>1?' <span class="pill alerta">Barras em 2 camadas</span>':'');
const sc=Math.min(300/h,240/bw),W=bw*sc,H=h*sc,ox=200-W/2+40,oy=30,xs=r.x*sc*0.8;
let s=`<rect x="${ox}" y="${oy}" width="${W}" height="${H}" style="fill:var(--steel-soft);stroke:var(--ink);stroke-width:2"/>`;
s+=`<rect x="${ox}" y="${oy}" width="${W}" height="${xs}" style="fill:var(--neg-fill)"/>`+Ln(ox-10,oy+r.x*sc,ox+W+10,oy+r.x*sc,'neg',1.5,'stroke-dasharray="6 4"')+T(ox+W+14,oy+r.x*sc+4,'LN  x = '+br(r.x,1)+' cm','neg');
s+=T(ox+W+14,oy+xs/2+4,'zona comprimida (0,8x)','muted');
s+=`<rect x="${ox+1.5*sc}" y="${oy+1.5*sc}" width="${W-3*sc}" height="${H-3*sc}" style="fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:3 2"/>`;
const n=b.n,cam=b.camadas,porCam=Math.ceil(n/cam),rr=Math.max(3,b.f/10/2*sc),esp=(W-6*sc)/(Math.max(porCam,2)-1||1);
for(let k=0;k<n;k++){const c=Math.floor(k/porCam),i=k%porCam;const cx=ox+3*sc+(porCam>1?i*(W-6*sc)/(porCam-1):(W-6*sc)/2),cy=oy+H-3*sc-c*(rr*2+2.5*sc);s+=`<circle cx="${cx}" cy="${cy}" r="${rr}" style="fill:var(--amber);stroke:var(--ink)"/>`}
s+=`<circle cx="${ox+3*sc}" cy="${oy+3*sc}" r="${Math.max(2.5,0.5*sc)}" style="fill:var(--muted)"/><circle cx="${ox+W-3*sc}" cy="${oy+3*sc}" r="${Math.max(2.5,0.5*sc)}" style="fill:var(--muted)"/>`;
s+=Ln(ox,oy+H+16,ox+W,oy+H+16,'muted')+T(ox+W/2,oy+H+30,'bw = '+bw+' cm','muted','text-anchor="middle"')+Ln(ox-18,oy,ox-18,oy+H,'muted')+T(ox-24,oy+H/2,'h = '+h,'muted','text-anchor="end"');
s+=T(ox+W+14,oy+H-3*sc+4,`${n} φ ${br(b.f,b.f%1?1:0)} (${br(b.area)} cm²)`,'amber-ink','font-weight="600"');
$('draw').innerHTML=SVG(640,Math.max(380,oy+H+50),'Seção transversal da viga com armadura',s);
$('memorial').textContent=`1) d = h − 4 = ${h} − 4 = ${br(r.d,1)} cm
2) Md = 1,4 × ${br(Mk)} kN·m = ${br(r.Md,0)} kN·cm
3) fcd = ${fck}/1,4 = ${br(r.fcd,3)} kN/cm²   fyd = 50/1,15 = ${br(r.fyd,2)} kN/cm²
4) Md/(0,425·bw·d²·fcd) = ${br(r.k,4)}
   x = 1,25 × ${br(r.d,1)} × [1 − √(1 − ${br(r.k,4)})] = ${br(r.x,2)} cm
5) x/d = ${br(r.xd,3)} ${r.ok?'≤ 0,45 ✓':'> 0,45 ✗ (aumente a seção)'}
6) As = ${br(r.Md,0)} / [${br(r.fyd,2)} × (${br(r.d,1)} − 0,4 × ${br(r.x,2)})] = ${br(r.As)} cm²
7) As,mín = ${br(ROMIN[fck],3)}% × ${bw} × ${h} = ${br(r.Asmin)} cm²  → adotar ${br(r.Asf)} cm²
8) Sugestão: ${n} φ ${br(b.f,b.f%1?1:0)} mm = ${br(b.area)} cm² (${b.camadas} camada${b.camadas>1?'s':''})`;}}
});
