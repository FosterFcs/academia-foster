// Certificação: prova corrigida no servidor, pedido do certificado com Pix e painel de pagamentos do instrutor.
const Cert={
  CARGA:4,PROVA_Q:10,MINIMO:7,preco:4.9,cart:null,
  provas:{},sit:{},carregando:{},
  ERROS:{login_necessario:'Entre na sua conta para fazer a prova.',modulo_sem_prova:'A prova desta disciplina ainda não está disponível.',ja_aprovado:'Você já foi aprovado nesta disciplina.',
    limite_tentativas:'Você já usou as 2 tentativas das últimas 24 horas.',tentativa_inexistente:'Não encontrei esta prova. Recarregue a página.',tentativa_encerrada:'Esta prova já foi enviada.',
    prova_nao_aprovada:'É preciso ser aprovado na prova antes de pedir o certificado.',nome_invalido:'Informe o nome completo, com nome e sobrenome.',cpf_invalido:'CPF inválido. Confira os números.',
    sem_permissao:'Sem permissão.',certificado_nao_pendente:'Este pedido já foi resolvido.',pacote_invalido:'Pacote inválido.',compra_nao_pendente:'Este pedido de pacote já foi resolvido.'},
  erro(e){return this.ERROS[e&&e.raw]||(e&&e.message)||'Não foi possível concluir agora.'},
  rpc(fn,body={},auth=true){return Conta.req('/rest/v1/rpc/'+fn,{method:'POST',body,auth})},
  url(cod){return location.origin+location.pathname.replace(/index\.html$/,'')+'validar.html?c='+encodeURIComponent(cod)},
  data(iso){return iso?new Date(iso).toLocaleDateString('pt-BR'):''},
  hora(iso){const d=new Date(iso);return d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})},
  cpfMascara(v){const d=String(v).replace(/\D/g,'').slice(0,11);return d.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1-$2')},
  cpfValido(v){const c=String(v).replace(/\D/g,'');if(!/^\d{11}$/.test(c)||/^(\d)\1{10}$/.test(c))return false;
    const dv=n=>{let s=0;for(let i=0;i<n;i++)s+=+c[i]*(n+1-i);const r=s*10%11;return r===10?0:r};return dv(9)===+c[9]&&dv(10)===+c[10]},
  // ---------- Pix (BR Code estático, padrão do Banco Central)
  crc16(s){let c=0xFFFF;for(const ch of new TextEncoder().encode(s)){c^=ch<<8;for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')},
  semAcento(s,n){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9 ]/g,'').toUpperCase().trim().slice(0,n)},
  pix({chave,nome,cidade,valor,txid}){const f=(id,v)=>id+String(v.length).padStart(2,'0')+v;
    const conta=f('00','br.gov.bcb.pix')+f('01',chave);
    const p=f('00','01')+f('26',conta)+f('52','0000')+f('53','986')+f('54',Number(valor).toFixed(2))+f('58','BR')+f('59',this.semAcento(nome,25)||'PIX')+f('60',this.semAcento(cidade,15)||'BRASIL')+f('62',f('05',String(txid).replace(/[^A-Za-z0-9]/g,'').slice(0,25)||'***'))+'6304';
    return p+this.crc16(p)},
  carregarQR(){return window.qrcode?Promise.resolve():carregarScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js')},
  async qr(el,texto){try{await this.carregarQR();const q=qrcode(0,'M');q.addData(texto);q.make();el.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true})}catch(e){el.textContent=''}},
  zap(cart,t){const tel=(cart&&cart.contato||'').replace(/\D/g,'');return tel?`https://wa.me/${tel}?text=${encodeURIComponent(t)}`:''},
  // ---------- créditos e pacotes
  htmlCarteira(cart){if(!cart)return'';const pk=cart.pacotes||[],cp=cart.compra;
    const lista=`<div class="pacotes">${pk.map(p=>`<button class="pacote${cp&&cp.pacote===p.id?' on':''}" data-pk="${p.id}"><b>${esc(p.nome)}</b><span>${p.creditos*this.CARGA} horas</span><strong>R$ ${br(p.valor)}</strong><small>${p.creditos>1?'R$ '+br(p.valor/p.creditos)+' por certificado':'1 certificado'}</small></button>`).join('')}</div>`;
    let h=`<p>Seus créditos: <b id="ceSaldo">${cart.saldo}</b>${cart.aguardando?` · certificados aguardando crédito: <b>${cart.aguardando}</b>`:''}. Cada crédito emite um certificado de ${this.CARGA} horas.</p>`;
    if(cp){const px=cart.pix&&cart.pix.chave?this.pix({chave:cart.pix.chave,nome:cart.pix.nome,cidade:cart.pix.cidade,valor:cp.valor,txid:cp.codigo}):null,z=this.zap(cart,`Olá, Wilson! Paguei o pacote ${cp.codigo} (${cp.creditos} certificado${cp.creditos>1?'s':''}, R$ ${br(cp.valor)}) da Academia Foster. Segue o comprovante.`);
      h+=`<h4>Pagamento do pacote ${esc(cp.creditos>1?cp.creditos+' certificados':'avulso')}</h4><p>Pedido <b class="mono">${cp.codigo}</b> · valor <b>R$ ${br(cp.valor)}</b>.</p>
      ${px?`<div class="pix"><div class="pix-qr" id="cePixQr" aria-label="QR code do Pix"></div><div><p><b>Pague com Pix</b> pelo QR code ou pelo código copia e cola:</p><textarea id="cePix" readonly rows="3">${px}</textarea><div class="presets"><button class="btn" id="ceCopiaPix">Copiar código Pix</button></div><p class="nota" id="cePixMsg"></p></div></div>`:`<p class="nota">O pagamento é combinado direto com o instrutor pelo WhatsApp.</p>`}
      <p>Depois de pagar, ${z?`<a href="${z}" target="_blank" rel="noopener">envie o comprovante pelo WhatsApp</a>`:'envie o comprovante para comercial@fosterconstrucoes.com.br'}. Quando o pagamento for confirmado, os créditos entram e os certificados pendentes saem na hora.</p>
      <div class="presets"><button class="btn sec" id="ceAtualizar">Já paguei: verificar de novo</button><button class="chip" id="ceTrocar">Trocar de pacote</button></div><div id="ceLista2" hidden>${lista}</div>`}
    else h+=`<h4>Escolha um pacote</h4>${lista}<p class="nota">Quanto maior o pacote, menor o preço por certificado. Os créditos não vencem e valem para qualquer disciplina.</p>`;
    return h},
  ligarCarteira(root,depois){const cart=this.cart;if(!cart)return;const cp=cart.compra;
    if(cp&&$('cePixQr')){this.qr($('cePixQr'),$('cePix').value);$('ceCopiaPix').onclick=()=>copiar($('cePix'),$('cePixMsg'))}
    const at=$('ceAtualizar');if(at)at.onclick=()=>depois();const tr=$('ceTrocar');if(tr)tr.onclick=()=>{$('ceLista2').hidden=!$('ceLista2').hidden};
    root.querySelectorAll('[data-pk]').forEach(b=>b.onclick=async()=>{if(cp&&cp.pacote===b.dataset.pk)return;b.disabled=true;try{await this.rpc('acad_comprar_pacote',{p_pacote:b.dataset.pk});depois()}catch(e){b.disabled=false;b.querySelector('small').textContent=this.erro(e)}})},
  async carteira(){try{this.cart=await this.rpc('acad_carteira');const p=(this.cart.pacotes||[]).find(x=>x.creditos===1);if(p)this.preco=Number(p.valor)}catch(e){this.cart=null}return this.cart},
  // ---------- aba Certificado
  requisitos(m){return `<div class="cols"><div class="conceito"><h4>1 · Estude</h4><p>Teoria, os 3 exemplos, o simulador e a aba Na obra. Responda as 15 questões do quiz.</p></div>
    <div class="conceito"><h4>2 · Faça a prova</h4><p>${this.PROVA_Q} questões sorteadas, 30 minutos e nota mínima ${this.MINIMO}. São 2 tentativas a cada 24 horas.</p></div>
    <div class="conceito"><h4>3 · Receba o certificado</h4><p>Curso livre de ${this.CARGA} horas, com código e QR code para a faculdade conferir. Avulso por R$ ${br(this.preco)}, ou em pacotes a partir de R$ 3,00 por certificado.</p></div></div>`},
  async render(m,p){
    const cab=`<p>A prova e o estudo são grátis. Você paga só se quiser o certificado, depois de aprovado.</p>${this.requisitos(m)}`;
    if(!Conta.ativo){p.innerHTML=cab+`<p class="nota">A certificação funciona no app publicado: <b>fosterfcs.github.io/academia-foster</b>. Nesta prévia ela fica desativada.</p>`;return}
    if(!Conta.logado){p.innerHTML=cab+`<p class="nota">Para fazer a prova, entre na sua conta. É a mesma conta que salva o seu progresso.</p><div class="presets"><button class="btn" id="ceEntrar">Entrar ou criar conta</button></div>`;$('ceEntrar').onclick=()=>{st.mod='conta';Conta.modo='entrar';render()};return}
    const prova=this.provas[m.id];if(prova&&!prova.fim)return this.renderProva(m,p,prova);
    const sit=this.sit[m.id];
    if(!sit){p.innerHTML=cab+`<p class="carregando" id="ceCarregando">Consultando a sua situação…</p>`;this.atualizar(m);return}
    if(sit.erro){p.innerHTML=cab+`<p class="pill alerta" role="status">${esc(sit.erro)}</p><div class="presets"><button class="btn sec" id="ceDeNovo">Tentar de novo</button></div>`;$('ceDeNovo').onclick=()=>{delete this.sit[m.id];render()};return}
    let h=cab;const res=prova&&prova.resultado;
    if(res)h+=`<p class="pill ${res.aprovada?'ok':'alerta'}" role="status">${res.no_prazo===false?'A prova foi enviada depois do prazo de 30 minutos e não foi considerada.':res.aprovada?`Aprovado com ${res.acertos} de ${res.total} acertos. Parabéns!`:`Você acertou ${res.acertos} de ${res.total}. Precisa de ${this.MINIMO}. Revise a teoria e tente de novo.`}</p>`;
    const c=sit.certificado;
    if(c&&c.status==='emitido'){
      h+=`<h3>Certificado emitido</h3><p>Emitido em ${this.data(c.emitido_em)} para <b>${esc(c.nome)}</b>. Código <b class="mono">${c.codigo}</b>.</p>
      <div class="presets"><a class="btn" href="${this.url(c.codigo)}" target="_blank" rel="noopener">Abrir e imprimir o certificado</a><button class="btn sec" id="ceCopiar">Copiar link de validação</button></div><p class="nota" id="ceCopiado"></p>`;
      p.innerHTML=h;$('ceCopiar').onclick=()=>{const t=document.createElement('textarea');t.value=this.url(c.codigo);copiar(t,$('ceCopiado'))};return}
    if(c&&c.status==='pendente'){
      h+=`<h3>Certificado aguardando crédito</h3><p>Pedido <b class="mono">${c.codigo}</b> em nome de <b>${esc(c.nome)}</b>. Ele é emitido assim que você tiver um crédito.</p>${this.htmlCarteira(this.cart)}
      <details class="mini"><summary>Corrigir o nome ou o CPF</summary>${this.form(c.nome)}</details>`;
      p.innerHTML=h;this.ligarCarteira(p,()=>{delete this.sit[m.id];render()});this.ligarForm(m);return}
    if(sit.aprovada){
      const sd=this.cart?this.cart.saldo:0;h+=`<h3>Você foi aprovado com nota ${sit.nota}</h3><p>Para emitir o certificado, informe os dados exatamente como devem sair nele.${sd>0?` Você tem ${sd} crédito${sd>1?'s':''}: o certificado sai na hora.`:' Em seguida, escolha um pacote de créditos.'}</p>${this.form('',sd)}`;
      p.innerHTML=h;this.ligarForm(m);return}
    if(placarMod(m).n<placarMod(m).tot){
      h+=`<p class="pill alerta">Complete o quiz desta disciplina para liberar a prova: ${placarMod(m).n} de ${placarMod(m).tot} respondidas.</p><div class="presets"><button class="btn sec" id="ceQuiz">Ir para o quiz</button></div>`;
      p.innerHTML=h;$('ceQuiz').onclick=()=>{st.tab='quiz';render()};return}
    if(!sit.prova_aberta&&sit.tentativas_24h>=2){
      h+=`<p class="pill alerta">Você usou as 2 tentativas das últimas 24 horas. A próxima libera em ${this.hora(sit.libera_em)}.</p>`;p.innerHTML=h;return}
    h+=`<h3>Prova de certificação</h3><p>${sit.prova_aberta?'Você tem uma prova em andamento. Continue de onde parou.':`Tentativas nas últimas 24 horas: ${sit.tentativas_24h} de 2. Ao começar, o tempo de 30 minutos começa a contar.`}</p>
      <div class="presets"><button class="btn" id="ceComecar">${sit.prova_aberta?'Continuar a prova':'Começar a prova'}</button></div>`;
    p.innerHTML=h;
    $('ceComecar').onclick=async()=>{const b=$('ceComecar');b.disabled=true;b.textContent='Preparando…';
      try{const r=await this.rpc('acad_iniciar_prova',{p_modulo:m.id});const ant=this.provas[m.id];this.provas[m.id]={...r,resp:ant&&ant.tentativa===r.tentativa?ant.resp:{},fim:false};render()}
      catch(e){b.disabled=false;b.textContent='Começar a prova';this.sit[m.id]={...sit};const x=document.createElement('p');x.className='pill alerta';x.textContent=this.erro(e);b.parentNode.after(x)}};
  },
  form(nome,sd=0){return `<form id="ceForm" class="lista form-conta" novalidate>
    <div class="campo"><label for="ceNome">Nome completo</label><input id="ceNome" autocomplete="name" value="${esc(nome)}" maxlength="120" required></div>
    <div class="campo"><label for="ceCpf">CPF</label><input id="ceCpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00" required></div>
    <label class="chk"><input type="checkbox" id="ceAceite"> Autorizo o uso do meu nome e CPF neste certificado. O CPF aparece parcialmente oculto na página de validação.</label>
    <p class="pill alerta" id="ceErro" hidden role="alert"></p>
    <div class="presets"><button class="btn" type="submit" id="ceSolicitar">${nome?'Salvar correção':sd>0?'Emitir o certificado (usa 1 crédito)':'Continuar'}</button></div></form>`},
  ligarForm(m){const f=$('ceForm');if(!f)return;const cpf=$('ceCpf'),er=$('ceErro');cpf.oninput=()=>{cpf.value=this.cpfMascara(cpf.value)};
    f.onsubmit=async ev=>{ev.preventDefault();const nome=$('ceNome').value.trim().replace(/\s+/g,' '),falha=t=>{er.textContent=t;er.hidden=false};
      if(nome.length<5||!nome.includes(' '))return falha(this.ERROS.nome_invalido);if(!this.cpfValido(cpf.value))return falha(this.ERROS.cpf_invalido);if(!$('ceAceite').checked)return falha('Marque a autorização para emitir o certificado.');
      const b=$('ceSolicitar');b.disabled=true;try{await this.rpc('acad_solicitar_certificado',{p_modulo:m.id,p_nome:nome,p_cpf:cpf.value});delete this.sit[m.id];render()}catch(e){b.disabled=false;falha(this.erro(e))}}},
  async atualizar(m){if(this.carregando[m.id])return;this.carregando[m.id]=true;
    try{const [s]=await Promise.all([this.rpc('acad_situacao',{p_modulo:m.id}),this.carteira()]);this.sit[m.id]=s}catch(e){this.sit[m.id]={erro:this.erro(e)}}
    this.carregando[m.id]=false;if(st.mod===m.id&&st.tab==='cert')render()},
  renderProva(m,p,pv){
    const falta=()=>Math.max(0,Math.round((new Date(pv.expira_em)-Date.now())/1000));
    p.innerHTML=`<div class="prova-topo"><b>Prova · ${m.cod} ${m.nome}</b><span class="tempo" id="ceTempo" aria-live="off"></span></div>
      <p class="nota">Escolha uma alternativa em cada questão. A correção é feita no servidor e o gabarito não é exibido.</p>
      <div class="lista" id="ceLista">${pv.questoes.map((q,i)=>`<fieldset class="q"><legend>${i+1}. ${esc(q.p)}</legend>${q.o.map((t,j)=>`<label class="op-prova"><input type="radio" name="ceQ${i}" value="${j}"${pv.resp[i]===j?' checked':''}> ${esc(t)}</label>`).join('')}</fieldset>`).join('')}</div>
      <p class="pill alerta" id="ceAviso" hidden role="alert"></p><div class="presets"><button class="btn" id="ceEnviar">Enviar a prova</button><span class="nota" id="ceResp"></span></div>`;
    const conta=()=>{const n=Object.keys(pv.resp).length;$('ceResp').textContent=`${n} de ${pv.questoes.length} respondidas`};conta();
    p.querySelectorAll('input[type=radio]').forEach(r=>r.onchange=()=>{pv.resp[+r.name.slice(3)]=+r.value;conta()});
    const relogio=()=>{const el=$('ceTempo');if(!el||this.provas[m.id]!==pv||pv.fim){clearInterval(pv.timer);return}const s=falta();el.textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;el.classList.toggle('acabando',s<300);if(s<=0){clearInterval(pv.timer);this.enviar(m,pv,true)}};
    clearInterval(pv.timer);pv.timer=setInterval(relogio,1000);relogio();
    let confirmou=false;$('ceEnviar').onclick=()=>{const vazias=pv.questoes.length-Object.keys(pv.resp).length;if(vazias&&!confirmou){confirmou=true;const a=$('ceAviso');a.textContent=`Faltam ${vazias} questão(ões) sem resposta. Toque de novo em Enviar para confirmar.`;a.hidden=false;return}this.enviar(m,pv,false)};
  },
  async enviar(m,pv,auto){if(pv.enviando)return;pv.enviando=true;const b=$('ceEnviar');if(b){b.disabled=true;b.textContent='Corrigindo…'}
    try{const r=await this.rpc('acad_enviar_prova',{p_tentativa:pv.tentativa,p_respostas:pv.questoes.map((q,i)=>pv.resp[i]??null)});pv.resultado=r;pv.fim=true;clearInterval(pv.timer);delete this.sit[m.id];render()}
    catch(e){pv.enviando=false;if(e.raw==='tentativa_encerrada'){pv.fim=true;delete this.sit[m.id];return render()}
      if(b){b.disabled=false;b.textContent='Enviar a prova'}const a=$('ceAviso');if(a){a.textContent=this.erro(e)+(e.rede?' Suas respostas continuam marcadas.':'');a.hidden=false}}},
  // ---------- seções na página da conta
  async painelConta(sec){if(!sec||!Conta.ativo||!Conta.logado)return;const box=document.createElement('div');box.id='ceConta';sec.appendChild(box);
    try{const [meus,adm]=await Promise.all([this.rpc('acad_meus_certificados'),this.rpc('acad_eh_admin').catch(()=>false)]);
      if(!document.body.contains(box))return;
      let h=`<h3>Meus certificados</h3>`+(meus.length?`<div class="tbl-wrap"><table class="ed"><thead><tr><th>Disciplina</th><th>Código</th><th>Situação</th><th></th></tr></thead><tbody>${meus.map(c=>{const m=modById(c.modulo);return `<tr><td>${m?m.cod+' · '+m.nome:c.modulo}</td><td class="mono">${c.codigo}</td><td>${c.status==='emitido'?'Emitido em '+this.data(c.emitido_em):'Aguardando crédito'}</td><td>${c.status==='emitido'?`<a href="${this.url(c.codigo)}" target="_blank" rel="noopener">Abrir</a>`:`<button class="chip" data-ir="${c.modulo}">Ver pagamento</button>`}</td></tr>`}).join('')}</tbody></table></div>`:`<p class="nota">Nenhum certificado ainda. Em cada disciplina, a aba Certificado mostra como conseguir o seu.</p>`);
      await this.carteira();if(!document.body.contains(box))return;
      h+=`<h3>Créditos de certificado</h3><div id="ceCart">${this.htmlCarteira(this.cart)}</div>`;
      if(adm)h+=`<h3>Pagamentos de pacotes (instrutor)</h3><div id="ceAdm"><p class="carregando">Carregando pedidos…</p></div>`;
      box.innerHTML=h;this.ligarCarteira(box,()=>{box.remove();this.painelConta(sec)});box.querySelectorAll('[data-ir]').forEach(b=>b.onclick=()=>{st.mod=b.dataset.ir;st.tab='cert';render()});
      if(adm)this.admin($('ceAdm'))}catch(e){if(document.body.contains(box))box.innerHTML=`<h3>Meus certificados</h3><p class="nota">${esc(this.erro(e))}</p>`}},
  async admin(el){
    const desenhar=async(msg)=>{let lst,certs;try{[lst,certs]=await Promise.all([this.rpc('acad_admin_compras'),this.rpc('acad_admin_pendentes')])}catch(e){el.innerHTML=`<p class="pill alerta">${esc(this.erro(e))}</p>`;return}
      const pend=lst.filter(c=>c.status==='pendente'),pagas=lst.filter(c=>c.status==='pago'),tot=pagas.reduce((s,c)=>s+Number(c.valor),0),emit=certs.filter(c=>c.status==='emitido').slice(0,20);
      const nm=c=>{const m=modById(c.modulo);return m?m.cod+' · '+m.nome:c.modulo};
      el.innerHTML=(msg?`<p class="pill ok" role="status">${esc(msg)}</p>`:'')+tiles([['Aguardando pagamento',pend.length],['Pacotes pagos',pagas.length],['Recebido',R$(tot),1],['Certificados emitidos',certs.filter(c=>c.status==='emitido').length]])+
        (pend.length?`<p class="nota">Confira o Pix no seu banco pelo código do pedido (vai no identificador do Pix) antes de confirmar.</p><div class="tbl-wrap"><table class="ed"><thead><tr><th>Pedido</th><th>Aluno</th><th>Pacote</th><th>Valor</th><th>Data</th><th></th></tr></thead><tbody>${pend.map(c=>`<tr><td class="mono">${c.codigo}</td><td>${esc(c.nome||'—')}<br><small>${esc(c.email||'')}</small></td><td>${c.creditos} crédito${c.creditos>1?'s':''}</td><td class="num">${R$(c.valor)}</td><td>${this.hora(c.solicitado_em)}</td><td><button class="chip" data-ok="${c.codigo}">Confirmar pagamento</button> <button class="chip" data-no="${c.codigo}">Cancelar</button></td></tr>`).join('')}</tbody></table></div>`:`<p class="nota">Nenhum pagamento aguardando confirmação.</p>`)+
        (emit.length?`<details class="mini"><summary>Últimos certificados emitidos</summary><ul>${emit.map(c=>`<li><span class="mono">${c.codigo}</span> · ${esc(c.nome)} · ${nm(c)} · ${this.data(c.emitido_em)}</li>`).join('')}</ul></details>`:'');
      const agir=(cod,acao,btn)=>async()=>{if(btn.dataset.conf!=='1'){btn.dataset.conf='1';btn.textContent=acao==='confirmar'?'Confirmar: recebi o Pix':'Confirmar cancelamento';return}
        btn.disabled=true;try{const r=await this.rpc('acad_admin_compra',{p_codigo:cod,p_acao:acao});desenhar(acao==='confirmar'?`Pacote ${cod} confirmado. ${r.emitidos?r.emitidos+' certificado(s) emitido(s) na hora.':'Os créditos ficaram disponíveis para o aluno.'}`:`Pedido ${cod} cancelado.`)}catch(e){btn.disabled=false;btn.textContent=this.erro(e)}};
      el.querySelectorAll('[data-ok]').forEach(b=>b.onclick=agir(b.dataset.ok,'confirmar',b));el.querySelectorAll('[data-no]').forEach(b=>b.onclick=agir(b.dataset.no,'cancelar',b))};
    desenhar('')}
};
