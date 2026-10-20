// Conta do aluno e sincronização com o Supabase (projeto foster-calc, tabela acad_dados).
// O app continua funcionando sem conta e sem internet: tudo fica salvo no aparelho e sobe para a nuvem quando há conexão.
const Conta={
  cfg:{url:'https://fvsdlpnvqfvjdxmfgbjx.supabase.co',chave:'sb_publishable_VT3XEbInyTr2Eu-AuLnrqw_BOrA2jYy'},
  ativo:!window.EMBUTIDO,
  s:null,meta:{dono:null,sujo:{},ultimo:null},estado:'',modo:'entrar',msg:'',ocupado:false,_t:null,_enviando:null,confirmaSair:false,confirmaApagar:false,
  CHAVES:['progresso','simulados','sig'],
  // ---------- armazenamento local
  ler(k,d){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}},
  gravar(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  carregar(){this.s=this.ler('af-sessao',null);this.meta=Object.assign({dono:null,sujo:{},ultimo:null},this.ler('af-sync',{}))},
  salvarMeta(){this.gravar('af-sync',this.meta)},
  get logado(){return !!(this.s&&this.s.access_token&&this.s.user)},
  get nome(){const u=this.s&&this.s.user;return(u&&u.user_metadata&&u.user_metadata.nome)||(u&&u.email)||''},
  // ---------- dados de estudo
  local(k){if(k==='progresso')return prog;if(k==='simulados')return this.ler('af-simulados',[]);if(k==='sig')return typeof SIG!=='undefined'&&SIG.p?SIG.p:this.ler('af-sig',null)},
  aplicar(k,v){
    if(k==='progresso'){prog=v||{};this.gravar('af-v2',prog)}
    else if(k==='simulados')this.gravar('af-simulados',v||[]);
    else if(k==='sig'){this.gravar('af-sig',v);if(typeof SIG!=='undefined'){SIG.p=null;SIG.carregar();SIG.view=null}}
  },
  // ---------- comunicação
  async req(caminho,{method='GET',body,auth=true,headers={}}={}){
    const h=Object.assign({apikey:this.cfg.chave,'Content-Type':'application/json'},headers);
    if(auth){await this.token();h.Authorization='Bearer '+this.s.access_token}
    const ab=typeof AbortController!=='undefined'?new AbortController():null,lim=setTimeout(()=>ab&&ab.abort(),15000);
    let r;try{r=await fetch(this.cfg.url+caminho,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),signal:ab?ab.signal:undefined})}catch(e){const x=new Error('Sem conexão com a internet. Tente de novo quando a conexão voltar.');x.rede=true;throw x}finally{clearTimeout(lim)}
    const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
    if(!r.ok){const x=new Error(this.traduzir(j,r.status));x.status=r.status;throw x}
    return j;
  },
  traduzir(j,st){
    const m=((j&&(j.error_code||''))+' '+(j&&(j.msg||j.error_description||j.message||j.error)||'')).toLowerCase();
    if(st===429||m.includes('rate limit'))return 'Muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.';
    if(m.includes('invalid_credentials')||m.includes('invalid login'))return 'E-mail ou senha incorretos.';
    if(m.includes('not_confirmed')||m.includes('not confirmed'))return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
    if(m.includes('already')&&(m.includes('registered')||m.includes('exists')))return 'Já existe uma conta com esse e-mail. Use Entrar ou Esqueci a senha.';
    if(m.includes('weak_password')||m.includes('password should'))return 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.';
    if(m.includes('same_password')||m.includes('different from the old'))return 'A nova senha precisa ser diferente da atual.';
    if(m.includes('email_address_invalid')||m.includes('invalid format')||m.includes('unable to validate email'))return 'Esse e-mail não parece válido. Confira e tente de novo.';
    if(m.includes('refresh_token')||st===401)return 'Sua sessão expirou. Entre de novo.';
    return 'Não foi possível concluir agora. Tente de novo em instantes.';
  },
  definir(j,user){this.s={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(+j.expires_in||3600),user:user||j.user||(this.s&&this.s.user)||null};this.gravar('af-sessao',this.s)},
  async token(){
    if(!this.s)throw new Error('Entre na sua conta.');
    if(this.s.expires_at*1000-Date.now()>60000)return;
    if(!this._renovando){const pr=(async()=>{await null;try{const j=await this.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:this.s.refresh_token},auth:false});this.definir(j)}
      catch(e){if(!e.rede){this.s=null;this.gravar('af-sessao',null);this.estado='expirada';this.topo()}throw e}})();this._renovando=pr;pr.then(()=>{},()=>{}).then(()=>{if(this._renovando===pr)this._renovando=null})}
    return this._renovando;
  },
  retorno(){return location.origin+location.pathname},
  // ---------- ações de conta
  async entrar(email,senha){const j=await this.req('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:senha},auth:false});this.definir(j);await this.aoEntrar()},
  async criar(nome,email,senha){
    const j=await this.req('/auth/v1/signup?redirect_to='+encodeURIComponent(this.retorno()),{method:'POST',body:{email,password:senha,data:{nome,origem:'academia'}},auth:false});
    if(j&&j.access_token){this.definir(j);await this.aoEntrar();return'logado'}return'confirmar'},
  async esqueci(email){await this.req('/auth/v1/recover?redirect_to='+encodeURIComponent(this.retorno()),{method:'POST',body:{email},auth:false})},
  async novaSenha(senha){const u=await this.req('/auth/v1/user',{method:'PUT',body:{password:senha}});if(u&&u.id){this.s.user=u;this.gravar('af-sessao',this.s)}},
  async sair(){
    try{await this.enviar()}catch(e){}
    try{if(this.s)await this.req('/auth/v1/logout',{method:'POST'})}catch(e){}
    this.s=null;this.gravar('af-sessao',null);this.limparLocal();this.estado='';this.modo='entrar';this.confirmaSair=false;
  },
  limparLocal(){prog={};['af-v2','af-simulados','af-sig'].forEach(k=>this.gravar(k,null));if(typeof SIG!=='undefined'){SIG.p=null;SIG.view=null}this.meta={dono:null,sujo:{},ultimo:null};this.salvarMeta()},
  async apagarDados(){await this.req('/rest/v1/acad_dados?user_id=eq.'+this.s.user.id,{method:'DELETE',headers:{Prefer:'return=minimal'}});this.meta.sujo={};this.meta.ultimo=null;this.salvarMeta()},
  // ---------- links de e-mail (confirmação e nova senha)
  async lerLink(){
    const h=new URLSearchParams(location.hash.slice(1));
    if(h.get('error_description')||h.get('error_code')){history.replaceState(null,'',location.pathname+location.search);st.mod='conta';this.modo='entrar';
      this.msg=h.get('error_code')==='otp_expired'?'O link expirou. Peça um novo em Esqueci a senha.':'Não foi possível usar o link. Peça um novo.';return}
    if(!h.get('access_token'))return;
    const tipo=h.get('type');history.replaceState(null,'',location.pathname+location.search);
    this.definir({access_token:h.get('access_token'),refresh_token:h.get('refresh_token'),expires_in:h.get('expires_in')});
    try{const u=await this.req('/auth/v1/user');this.s.user=u;this.gravar('af-sessao',this.s)}catch(e){this.s=null;this.gravar('af-sessao',null);st.mod='conta';this.msg=e.message;return}
    if(tipo==='recovery'){st.mod='conta';this.modo='nova-senha';this.msg=''}
    else{await this.aoEntrar();aviso('E-mail confirmado. Sua conta está pronta e o progresso já está salvo na nuvem.')}
  },
  // ---------- sincronização
  async aoEntrar(){
    const uid=this.s.user.id;
    if(this.meta.dono&&this.meta.dono!==uid)this.limparLocal();
    this.meta.dono=uid;this.salvarMeta();
    await this.baixar();this.topo();
  },
  baixar(){if(this._baixando)return this._baixando;const pr=this._baixar();this._baixando=pr;pr.then(()=>{},()=>{}).then(()=>{if(this._baixando===pr)this._baixando=null});return pr},
  async _baixar(){
    this.estado='sincronizando';this.topo();
    let rem;try{rem=await this.req('/rest/v1/acad_dados?select=chave,dados,atualizado_em')}catch(e){this.estado=e.rede?'offline':(this.logado?'erro':'expirada');this.topo();return}
    const R={};(rem||[]).forEach(x=>R[x.chave]=x);
    // progresso: junta os dois lados, ficando com o módulo que tem mais respostas
    const lp=this.local('progresso')||{},rp=(R.progresso&&R.progresso.dados)||{},mp=Object.assign({},rp);let difP=!R.progresso&&Object.keys(lp).length>0;
    for(const k of Object.keys(lp)){const a=Object.keys(lp[k]||{}).length,b=Object.keys(rp[k]||{}).length;if(a>b){mp[k]=lp[k];difP=true}}
    this.aplicar('progresso',mp);if(difP)this.meta.sujo.progresso=Date.now();
    // simulados: junta os históricos
    const ls=this.local('simulados')||[],rs=(R.simulados&&R.simulados.dados)||[],vis=new Set(),ms=[];
    for(const x of [...rs,...ls].sort((a,b)=>a.em<b.em?-1:1)){if(!vis.has(x.em)){vis.add(x.em);ms.push(x)}}
    const fs=ms.slice(-30);this.aplicar('simulados',fs);if(fs.length!==rs.length)this.meta.sujo.simulados=Date.now();
    // Bancada SIG: fica a versão mais recente
    const tl=this.meta.sujo.sig||0,tr=R.sig?Date.parse(R.sig.atualizado_em):0;
    if(R.sig&&tr>=tl){this.aplicar('sig',R.sig.dados);delete this.meta.sujo.sig}
    else if(tl&&this.local('sig'))this.meta.sujo.sig=tl;
    this.salvarMeta();
    await this.enviar();
    if(typeof render==='function'&&st.mod!=='conta')render();
  },
  marcar(k){if(!this.ativo)return;this.meta.sujo[k]=Date.now();this.salvarMeta();if(this.logado){this.estado='pendente';this.topo();clearTimeout(this._t);this._t=setTimeout(()=>this.enviar().catch(()=>{}),1500)}},
  async enviar(){
    if(!this.logado)return;
    if(this._enviando)return this._enviando;
    const pr=(async()=>{await null;try{
      for(let volta=0;volta<3&&this.pendentes();volta++)for(const k of this.CHAVES){const t=this.meta.sujo[k];if(!t)continue;const d=this.local(k);if(d==null){delete this.meta.sujo[k];continue}
        this.estado='sincronizando';this.topo();
        await this.req('/rest/v1/acad_dados?on_conflict=user_id,chave',{method:'POST',body:{user_id:this.s.user.id,chave:k,dados:d},headers:{Prefer:'resolution=merge-duplicates,return=minimal'}});
        if(this.meta.sujo[k]===t)delete this.meta.sujo[k];this.salvarMeta()}
      this.estado=this.pendentes()?'pendente':'sincronizado';if(!this.pendentes())this.meta.ultimo=new Date().toISOString();this.salvarMeta();
    }catch(e){this.estado=e.rede?'offline':(this.logado?'erro':'expirada');throw e}finally{this.topo();if(st.mod==='conta')this.render()}})();
    this._enviando=pr;pr.then(()=>{},()=>{}).then(()=>{if(this._enviando===pr)this._enviando=null});
    return pr;
  },
  pendentes(){return Object.keys(this.meta.sujo||{}).length},
  // ---------- tela
  topo(){const b=$('btConta');if(!b)return;if(!this.ativo){b.hidden=true;return}b.hidden=false;
    if(!this.logado){b.textContent=this.estado==='expirada'?'Entrar de novo':'Entrar';b.classList.remove('logado');return}
    const pn=this.nome.split(/[\s@]/)[0],ic={sincronizado:'✓',sincronizando:'↻',pendente:'•',offline:'⚠',erro:'⚠'}[this.estado]||'';
    b.classList.add('logado');b.textContent=pn+(ic?' '+ic:'');b.title={sincronizado:'Progresso salvo na nuvem',sincronizando:'Sincronizando',pendente:'Alterações aguardando envio',offline:'Sem internet: envia quando a conexão voltar',erro:'Falha ao sincronizar'}[this.estado]||''},
  quando(iso){if(!iso)return'ainda não';const d=new Date(iso);return d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})},
  render(){
    const M=$('main');let corpo='';const msg=this.msg?`<p class="pill ${this.msgOk?'ok':'alerta'}" id="ctMsg" role="status">${esc(this.msg)}</p>`:'';
    const campo=(id,rot,tipo,auto,extra='')=>`<div class="campo"><label for="${id}">${rot}</label><input type="${tipo}" id="${id}" autocomplete="${auto}" ${extra}></div>`;
    if(this.logado&&this.modo!=='nova-senha'){
      const feitos=MODS.filter(m=>{const p=placarMod(m);return p.n===p.tot}).length,sims=(this.local('simulados')||[]).length,pend=this.pendentes();
      const est={sincronizado:'Tudo salvo na nuvem',sincronizando:'Sincronizando…',pendente:'Alterações aguardando envio',offline:'Sem internet. As alterações sobem quando a conexão voltar.',erro:'Não consegui sincronizar. Tente de novo.'}[this.estado]||'Pronto para sincronizar';
      corpo=`${tiles([['Disciplinas concluídas',feitos+' de '+MODS.length],['Simulados feitos',sims],['Situação',est,1],['Última sincronização',this.quando(this.meta.ultimo)]])}${msg}
        <div class="presets"><button class="btn" id="ctSync">Sincronizar agora</button><button class="btn sec" id="ctSair">${this.confirmaSair?(pend?'Sair mesmo assim? '+pend+' alteração(ões) não enviada(s)':'Confirmar saída'):'Sair'}</button></div>
        <p class="nota">Ao sair, o progresso é removido deste aparelho e continua guardado na sua conta. Entre de novo em qualquer celular ou computador para continuar de onde parou.</p>
        <h3>Seus dados</h3><p class="nota">Guardamos seu nome, seu e-mail, as respostas dos quizzes, o histórico de simulados e o projeto da Bancada SIG, só para sincronizar entre aparelhos. Ninguém além de você vê esses dados. A mesma conta vale para os outros apps Foster.</p>
        <div class="presets"><button class="chip" id="ctApagar">${this.confirmaApagar?'Confirmar: apagar meus dados de estudo da nuvem':'Apagar meus dados de estudo da nuvem'}</button></div>
        <p class="nota">Para excluir a conta inteira, escreva para comercial@fosterconstrucoes.com.br a partir do e-mail cadastrado.</p>`;
      M.innerHTML=`<div class="mod-head"><span class="eyebrow">Minha conta</span><h2>Olá, ${esc(this.nome.split(' ')[0])}</h2></div><section class="painel">${corpo}</section>`;
      $('ctSync').onclick=async()=>{this.msg='';try{await this.baixar();this.msg='Sincronizado.';this.msgOk=true}catch(e){this.msg=e.message;this.msgOk=false}this.render()};
      $('ctSair').onclick=async()=>{if(!this.confirmaSair){this.confirmaSair=true;return this.render()}await this.sair();this.msg='Você saiu da conta.';this.msgOk=true;this.topo();render()};
      $('ctApagar').onclick=async()=>{if(!this.confirmaApagar){this.confirmaApagar=true;return this.render()}this.confirmaApagar=false;try{await this.apagarDados();this.msg='Dados de estudo apagados da nuvem. O que está neste aparelho continua aqui.';this.msgOk=true}catch(e){this.msg=e.message;this.msgOk=false}this.render()};
      return;
    }
    const tit={entrar:'Entre para salvar seu progresso',criar:'Crie sua conta grátis',esqueci:'Recuperar a senha','nova-senha':'Escolha uma nova senha',confirmar:'Confirme seu e-mail'}[this.modo];
    if(this.modo==='entrar')corpo=`<p>Com uma conta, seu progresso nos quizzes, os simulados e o projeto da Bancada SIG ficam guardados na nuvem e aparecem em qualquer aparelho.</p>
      <form id="ctForm" class="lista form-conta" novalidate>${campo('ctEmail','E-mail','email','email','required inputmode="email"')}${campo('ctSenha','Senha','password','current-password','required')}${msg}<div class="presets"><button class="btn" type="submit" id="ctOk">Entrar</button></div></form>
      <div class="presets"><button class="chip" data-modo="criar">Criar conta grátis</button><button class="chip" data-modo="esqueci">Esqueci a senha</button></div>`;
    else if(this.modo==='criar')corpo=`<form id="ctForm" class="lista form-conta" novalidate>${campo('ctNome','Nome','text','name','required')}${campo('ctEmail','E-mail','email','email','required inputmode="email"')}${campo('ctSenha','Senha (mínimo 8 caracteres)','password','new-password','required minlength="8"')}${campo('ctSenha2','Repita a senha','password','new-password','required')}
      <label class="chk"><input type="checkbox" id="ctAceito"> Concordo em guardar meu nome, e-mail e progresso de estudo para sincronizar entre aparelhos.</label>${msg}<div class="presets"><button class="btn" type="submit" id="ctOk">Criar conta</button></div></form>
      <div class="presets"><button class="chip" data-modo="entrar">Já tenho conta</button></div><p class="nota">A conta é a mesma dos outros apps Foster. Se você já usa o Foster Calc, entre com o mesmo e-mail e senha.</p>`;
    else if(this.modo==='esqueci')corpo=`<p>Informe o e-mail da conta. Enviamos um link para você criar uma senha nova.</p><form id="ctForm" class="lista form-conta" novalidate>${campo('ctEmail','E-mail','email','email','required inputmode="email"')}${msg}<div class="presets"><button class="btn" type="submit" id="ctOk">Enviar link</button></div></form><div class="presets"><button class="chip" data-modo="entrar">Voltar para Entrar</button></div>`;
    else if(this.modo==='nova-senha')corpo=`<form id="ctForm" class="lista form-conta" novalidate>${campo('ctSenha','Nova senha (mínimo 8 caracteres)','password','new-password','required minlength="8"')}${campo('ctSenha2','Repita a nova senha','password','new-password','required')}${msg}<div class="presets"><button class="btn" type="submit" id="ctOk">Salvar nova senha</button></div></form>`;
    else if(this.modo==='confirmar')corpo=`${msg}<p>Enviamos um link de confirmação para o seu e-mail. Abra o link neste aparelho para ativar a conta. Se não chegar em alguns minutos, confira a caixa de spam.</p><div class="presets"><button class="chip" data-modo="entrar">Já confirmei, quero entrar</button></div>`;
    const guardar={};if(this._modoTela===this.modo)M.querySelectorAll('.form-conta input').forEach(i=>{guardar[i.id]=i.type==='checkbox'?i.checked:i.value});this._modoTela=this.modo;
    M.innerHTML=`<div class="mod-head"><span class="eyebrow">Minha conta</span><h2>${tit}</h2></div><section class="painel">${corpo}</section>`;
    Object.entries(guardar).forEach(([id,v])=>{const i=$(id);if(!i)return;if(i.type==='checkbox')i.checked=v;else i.value=v});
    M.querySelectorAll('[data-modo]').forEach(b=>b.onclick=()=>{this.modo=b.dataset.modo;this.msg='';this._modoTela=null;this.render()});
    const f=$('ctForm');if(!f)return;
    f.onsubmit=async e=>{e.preventDefault();if(this.ocupado)return;const v=id=>($(id)?$(id).value.trim():''),sv=id=>($(id)?$(id).value:'');
      const email=v('ctEmail'),erro=t=>{this.msg=t;this.msgOk=false;this.render();const i=$(this._foco);if(i)i.focus()};
      if(this.modo!=='nova-senha'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){this._foco='ctEmail';return erro('Informe um e-mail válido.')}
      if(this.modo==='entrar'&&!sv('ctSenha')){this._foco='ctSenha';return erro('Informe a senha.')}
      if(this.modo==='criar'||this.modo==='nova-senha'){
        if(this.modo==='criar'&&!v('ctNome')){this._foco='ctNome';return erro('Informe seu nome.')}
        if(sv('ctSenha').length<8){this._foco='ctSenha';return erro('A senha precisa ter pelo menos 8 caracteres.')}
        if(sv('ctSenha')!==sv('ctSenha2')){this._foco='ctSenha2';return erro('As duas senhas não são iguais.')}
        if(this.modo==='criar'&&!$('ctAceito').checked){this._foco='ctAceito';return erro('Marque a concordância para criar a conta.')}}
      this.ocupado=true;const ok=$('ctOk');ok.disabled=true;ok.textContent='Aguarde…';
      try{
        if(this.modo==='entrar'){await this.entrar(email,sv('ctSenha'));this.msg='';aviso('Bem-vindo de volta! Seu progresso foi sincronizado.')}
        else if(this.modo==='criar'){const r=await this.criar(v('ctNome'),email,sv('ctSenha'));if(r==='confirmar'){this.modo='confirmar';this.msg='Conta criada.';this.msgOk=true}else{this.msg='';aviso('Conta criada. Seu progresso agora fica salvo na nuvem.')}}
        else if(this.modo==='esqueci'){await this.esqueci(email);this.msg='Se houver uma conta com esse e-mail, o link chega em alguns minutos. Confira também o spam.';this.msgOk=true}
        else if(this.modo==='nova-senha'){await this.novaSenha(sv('ctSenha'));this.modo='entrar';this.msg='';await this.aoEntrar();aviso('Senha alterada. Você já está dentro da conta.')}
      }catch(x){this.msg=x.message;this.msgOk=false}
      this.ocupado=false;this.topo();this.render();
    };
  },
  async iniciar(){
    if(!this.ativo){this.topo();return}
    this.carregar();const b=$('btConta');if(b)b.onclick=()=>{st.mod='conta';this.msg='';this.confirmaSair=this.confirmaApagar=false;render();$('main').scrollIntoView({block:'start',behavior:'smooth'})};
    this.topo();
    if(location.hash.includes('access_token')||location.hash.includes('error'))await this.lerLink();
    if(this.logado){this.estado='pendente';this.topo();this.baixar().catch(()=>{})}
    window.addEventListener('online',()=>{if(this.logado)this.baixar().catch(()=>{})});
    window.addEventListener('hashchange',async()=>{if(/access_token|error_code/.test(location.hash)){await this.lerLink();this.topo();render()}});
    if(st.mod==='conta')render();
  }
};
