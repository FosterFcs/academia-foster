// PL-12 · Planejamento de Obras
Academia.modulo('pl',{
teoria:`<p>Uma obra é uma sequência de atividades que dependem umas das outras: não dá para rebocar antes de levantar a parede. O planejamento descobre o prazo total e, principalmente, quais atividades seguram a obra inteira.</p>
<div class="cols"><div class="conceito"><h4>Dependência</h4><p>A atividade só começa quando as anteriores terminam (relação término-início, a mais comum).</p></div>
<div class="conceito"><h4>Folga</h4><p>Quantos dias uma atividade pode atrasar sem atrasar a obra. Folga = início mais tarde − início mais cedo.</p></div>
<div class="conceito"><h4>Caminho crítico</h4><p>A sequência de atividades com folga zero. É ela que define o prazo. Atrasou ali, atrasou a obra.</p></div></div>
<h3>Como o cálculo funciona (CPM)</h3>
<div class="formula">Ida: início cedo = maior término cedo das antecessoras    término cedo = início + duração</div>
<div class="formula">Volta: término tarde = menor início tarde das sucessoras    início tarde = término − duração</div>
<div class="formula">PERT (duração incerta): te = (otimista + 4 × mais provável + pessimista) / 6</div>
<div class="dica"><b>Na obra</b>Equipe extra numa atividade com folga não adianta nada no prazo. Para acelerar a obra, reforce o caminho crítico.</div>`,
exemplo:`<h3>Casa térrea com 9 etapas</h3><p>As durações estão em dias úteis. A cobertura e as instalações começam juntas depois da alvenaria.</p>
<ol class="passos"><li><b>Ida.</b> A (0–5) → B (5–15) → C (15–35) → D (35–50). E (50–58) e F (50–62) em paralelo.</li>
<li><b>Revestimentos (G).</b> Dependem de E e F: começam no maior término, 62, e vão até 76.</li>
<li><b>Esquadrias (H).</b> Dependem só de E: 58–64.</li>
<li><b>Pintura (I).</b> Depende de G e H: começa em 76 e termina em <b>84 dias</b>.</li>
<li><b>Folgas.</b> E tem 4 dias de folga e H tem 12. As demais têm folga zero.</li>
<li><b>Caminho crítico.</b> <b>A → B → C → D → F → G → I</b>. As instalações (F) são críticas; a cobertura (E), não.</li></ol>
<div class="dica"><b>Teste no simulador</b>Aumente a cobertura (E) para 13 dias e veja o caminho crítico mudar.</div>`,
sim:{tarefas:[{id:'A',n:'Serviços preliminares',dur:5,pred:[]},{id:'B',n:'Fundações',dur:10,pred:['A']},{id:'C',n:'Estrutura',dur:20,pred:['B']},{id:'D',n:'Alvenaria',dur:15,pred:['C']},{id:'E',n:'Cobertura',dur:8,pred:['D']},{id:'F',n:'Instalações',dur:12,pred:['D']},{id:'G',n:'Revestimentos',dur:14,pred:['E','F']},{id:'H',n:'Esquadrias',dur:6,pred:['E']},{id:'I',n:'Pintura e limpeza',dur:8,pred:['G','H']}],
html(){return `<div class="ctrl"><div class="tbl-wrap"><table class="ed"><thead><tr><th>Id</th><th>Atividade</th><th>Dias</th><th>Depende de</th><th></th></tr></thead><tbody id="plBody"></tbody></table></div><div class="presets"><button class="chip" id="plAdd">+ Adicionar atividade</button><button class="chip" id="plReset">Voltar ao exemplo</button></div><div id="tiles"></div></div><div class="draw" id="draw" style="margin-top:16px"></div><h3>Memorial de cálculo</h3><div class="memorial" id="memorial"></div>`},
init(){const self=this;this.base=this.base||JSON.parse(JSON.stringify(this.tarefas));
$('plAdd').onclick=()=>{const used=self.tarefas.map(t=>t.id);let c=65;while(used.includes(String.fromCharCode(c)))c++;self.tarefas.push({id:String.fromCharCode(c),n:'Nova atividade',dur:5,pred:self.tarefas.length?[self.tarefas[self.tarefas.length-1].id]:[]});self.tabela();self.update()};
$('plReset').onclick=()=>{self.tarefas=JSON.parse(JSON.stringify(self.base));self.tabela();self.update()};this.tabela()},
tabela(){const self=this;$('plBody').innerHTML=this.tarefas.map((t,i)=>`<tr><td class="num"><b>${t.id}</b></td><td><input type="text" id="plN${i}" value="${t.n.replace(/"/g,'&quot;')}" aria-label="Nome da atividade ${t.id}" style="min-width:130px;font-family:var(--f-body)"></td><td><input type="number" min="0" step="1" id="plD${i}" value="${t.dur}" aria-label="Duração de ${t.id}"></td><td><input type="text" id="plP${i}" value="${t.pred.join(', ')}" aria-label="Antecessoras de ${t.id}" placeholder="ex.: A, B"></td><td>${this.tarefas.length>2?`<button class="rm" data-i="${i}" aria-label="Remover ${t.id}">✕</button>`:''}</td></tr>`).join('');
$('plBody').querySelectorAll('input').forEach(inp=>inp.oninput=()=>{const i=+inp.id.slice(3),t=self.tarefas[i],k=inp.id[2];
if(k==='N')t.n=inp.value;else if(k==='D')t.dur=Math.max(0,parseFloat(inp.value)||0);else t.pred=inp.value.toUpperCase().split(/[^A-Z]+/).filter(Boolean);self.update()});
$('plBody').querySelectorAll('.rm').forEach(b=>b.onclick=()=>{const id=self.tarefas[+b.dataset.i].id;self.tarefas.splice(+b.dataset.i,1);self.tarefas.forEach(t=>t.pred=t.pred.filter(p=>p!==id));self.tabela();self.update()})},
update(){const ts=this.tarefas,r=calc.cpm(ts);
if(r.erro){$('tiles').innerHTML=`<span class="pill alerta">${r.erro}</span>`;$('draw').innerHTML='';$('memorial').textContent=r.erro;return}
const fol=ts.filter(t=>r.folga[t.id]>0).sort((a,b)=>r.folga[b.id]-r.folga[a.id])[0];
$('tiles').innerHTML=tiles([['Prazo total',r.total+' dias',1],['Atividades críticas',r.critico.length+' de '+ts.length],['Caminho crítico',r.critico.join(' → ')||'—'],['Maior folga',fol?fol.id+': '+r.folga[fol.id]+' dias':'nenhuma']]);
const x0=170,x1=610,sx=d=>x0+(x1-x0)*d/(r.total||1),rh=26,y0=40;let s=T(30,20,'CRONOGRAMA (GANTT)','muted','font-size="10" letter-spacing="1"');
const passo=r.total>60?10:5;for(let d=0;d<=r.total;d+=passo)s+=Ln(sx(d),y0-6,sx(d),y0+ts.length*rh,'grid')+T(sx(d),y0-10,d,'muted','text-anchor="middle" font-size="9"');
ts.forEach((t,i)=>{const y=y0+i*rh,cr=r.folga[t.id]===0;s+=T(30,y+16,t.id+'  '+(t.n.length>16?t.n.slice(0,15)+'…':t.n),'ink',cr?'font-weight="600"':'');
s+=`<rect x="${sx(r.ES[t.id])}" y="${y+5}" width="${Math.max(2,sx(r.EF[t.id])-sx(r.ES[t.id]))}" height="15" style="fill:var(--${cr?'neg':'steel'});opacity:${cr?1:.75}"/>`;
if(!cr)s+=Ln(sx(r.EF[t.id]),y+12.5,sx(r.LF[t.id]),y+12.5,'muted',1.5,'stroke-dasharray="3 3"')+`<circle cx="${sx(r.LF[t.id])}" cy="${y+12.5}" r="2.5" style="fill:var(--muted)"/>`});
const yl=y0+ts.length*rh+18;s+=`<rect x="30" y="${yl-9}" width="14" height="10" style="fill:var(--neg)"/>`+T(50,yl,'crítica','ink')+`<rect x="120" y="${yl-9}" width="14" height="10" style="fill:var(--steel);opacity:.75"/>`+T(140,yl,'com folga','ink')+Ln(220,yl-4,250,yl-4,'muted',1.5,'stroke-dasharray="3 3"')+T(256,yl,'folga disponível','ink');
$('draw').innerHTML=SVG(640,yl+14,'Cronograma de barras com caminho crítico',s);
let m='Id  Duração  Início cedo  Término cedo  Início tarde  Término tarde  Folga\n';
ts.forEach(t=>{m+=`${t.id.padEnd(4)}${String(t.dur).padStart(7)}  ${String(r.ES[t.id]).padStart(11)}  ${String(r.EF[t.id]).padStart(12)}  ${String(r.LS[t.id]).padStart(12)}  ${String(r.LF[t.id]).padStart(13)}  ${String(r.folga[t.id]).padStart(5)}${r.folga[t.id]===0?'  ← crítica':''}\n`});
m+=`\nPrazo total = ${r.total} dias · Caminho crítico: ${r.critico.join(' → ')}`;$('memorial').textContent=m;}}
});
