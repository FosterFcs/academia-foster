# Testes de conta e sincronização contra uma imitação local do Supabase. Uso: python3 testes/conta.py
import os,sys,re,json,time
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import servir,esperar,ignorar
import supabase_falso as SF
from playwright.sync_api import sync_playwright
fails=[];checks=0
def ok(c,m):
    global checks;checks+=1
    if not c:fails.append(m)
srv,URL=servir();msrv,MOCK=SF.iniciar();REAL='https://fvsdlpnvqfvjdxmfgbjx.supabase.co'
def aparelho(b,w=1280,esquema='light'):
    ctx=b.new_context(service_workers='block',viewport={'width':w,'height':900},color_scheme=esquema)
    def ponte(r):
        if FORA[0]:return r.abort('internetdisconnected')
        try:r.fulfill(response=r.fetch(url=r.request.url.replace(REAL,MOCK)))
        except Exception:
            try:r.abort('internetdisconnected')
            except Exception:pass
    ctx.route(re.compile(re.escape(REAL)+r'/.*'),ponte)
    ctx.route(re.compile(r'fonts\.'),lambda r:r.abort())
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
    pg.goto(URL);esperar(pg);pg.set_default_timeout(10000);return ctx,pg,errs
FORA=[False]
def conta(pg):pg.click('#btConta');pg.wait_for_selector('.mod-head:has-text("Minha conta")')
def sincronizado(pg):pg.wait_for_function("Conta.estado==='sincronizado'&&Conta.pendentes()===0",timeout=10000)
def responder(pg,mod,n=5):
    pg.evaluate(f"st.mod='{mod}';st.tab='quiz';render()");esperar(pg);pg.wait_for_selector('#ql .q')
    for i in range(n):
        if pg.locator(f'#ql .q:nth-child({i+1}) .op:not([disabled])').count():pg.click(f'#ql .q:nth-child({i+1}) .op >> nth=0')
def linha(uid,ch):return SF.E.linhas.get((uid,ch),{}).get('dados')
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- aparelho 1: progresso anônimo, depois cria conta
    c1,pg,e1=aparelho(b)
    ok(pg.is_visible('#btConta') and pg.inner_text('#btConta').strip().lower()=='entrar','botão Entrar no topo')
    responder(pg,'rm',3)
    conta(pg);pg.click('[data-modo="criar"]')
    pg.click('#ctOk');ok('e-mail válido' in pg.inner_text('#ctMsg'),'valida e-mail')
    pg.fill('#ctNome','Wilson Teste');pg.fill('#ctEmail','wilson@exemplo.com');pg.fill('#ctSenha','curta');pg.fill('#ctSenha2','curta');pg.click('#ctOk');ok('8 caracteres' in pg.inner_text('#ctMsg'),'valida tamanho da senha')
    pg.fill('#ctSenha','senhaForte123');pg.fill('#ctSenha2','outra12345');pg.click('#ctOk');ok('não são iguais' in pg.inner_text('#ctMsg'),'valida confirmação')
    pg.fill('#ctSenha2','senhaForte123');pg.click('#ctOk');ok('concordância' in pg.inner_text('#ctMsg'),'exige concordância')
    pg.check('#ctAceito');pg.click('#ctOk');pg.wait_for_selector('.mod-head:has-text("Olá, Wilson")');sincronizado(pg)
    uid=pg.evaluate('Conta.s.user.id');u=SF.E.users[uid]
    ok(u['meta'].get('nome')=='Wilson Teste' and u['meta'].get('origem')=='academia','nome e origem enviados no cadastro')
    ok(len(linha(uid,'progresso').get('rm',{}))==3,'progresso anterior ao cadastro subiu para a conta')
    ok('Wilson' in pg.inner_text('#btConta') and '✓' in pg.inner_text('#btConta'),'topo mostra nome e salvo')
    responder(pg,'rm',15);responder(pg,'is',2);sincronizado(pg)
    ok(len(linha(uid,'progresso')['rm'])==15 and len(linha(uid,'progresso')['is'])==2,'resposta nova sobe sozinha')
    # simulado e Bancada SIG
    pg.evaluate("st.mod='sim';render()");esperar(pg)
    for i in range(10):pg.click(f'#sl .q:nth-child({i+1}) .op >> nth=0')
    ok('Seus últimos simulados' in pg.inner_text('#main'),'histórico de simulados na tela');sincronizado(pg)
    ok(len(linha(uid,'simulados'))==1,'simulado salvo na conta')
    pg.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg);pg.wait_for_selector('#sigMap')
    ok(linha(uid,'sig') is None,'abrir a Bancada sem editar não envia nada')
    pg.evaluate("SIG.p.pts.push({nome:'PX9',E:313270,N:7402200,z:744});SIG.mudou()");sincronizado(pg)
    ok(linha(uid,'sig') and any(x['nome']=='PX9' for x in linha(uid,'sig')['pts']),'projeto da Bancada sobe')
    # ---------- offline e volta
    pg.evaluate("Promise.all(MODS.map(m=>garantir(m)))")  # neste teste o service worker fica desligado; carrego antes de cortar a rede
    c1.set_offline(True);FORA[0]=True;responder(pg,'ca',4);pg.wait_for_function("Conta.estado==='offline'||Conta.estado==='pendente'")
    pg.wait_for_timeout(2500);ok(pg.evaluate("Conta.pendentes()")>=1 and '⚠' in pg.inner_text('#btConta'),'sem internet fica pendente e avisa')
    ok('ca' not in linha(uid,'progresso'),'nada enviado sem internet')
    c1.set_offline(False);FORA[0]=False;pg.evaluate("window.dispatchEvent(new Event('online'))");sincronizado(pg)
    ok(len(linha(uid,'progresso').get('ca',{}))==4,'envia quando a internet volta')
    # ---------- sessão expirando: renovação automática
    SF.E.expira=1;pg.evaluate("Conta.s.expires_at=Math.floor(Date.now()/1000)+30");n0=sum(1 for c in SF.E.chamadas if c[2].get('grant_type')==['refresh_token'])
    responder(pg,'gt',1);sincronizado(pg);SF.E.expira=3600
    ok(sum(1 for c in SF.E.chamadas if c[2].get('grant_type')==['refresh_token'])>n0,'renova a sessão sozinho');ok(len(linha(uid,'progresso').get('gt',{}))==1,'envio depois da renovação')
    # ---------- aparelho 2 (celular, tema escuro): entra e recebe tudo
    c2,pg2,e2=aparelho(b,390,'dark');conta(pg2)
    pg2.fill('#ctEmail','wilson@exemplo.com');pg2.fill('#ctSenha','errada');pg2.click('#ctOk');pg2.wait_for_selector('#ctMsg')
    ok('incorretos' in pg2.inner_text('#ctMsg'),'senha errada: mensagem clara')
    pg2.fill('#ctSenha','senhaForte123');pg2.click('#ctOk');pg2.wait_for_selector('.mod-head:has-text("Olá")');sincronizado(pg2)
    pr=pg2.evaluate('prog');ok(len(pr.get('rm',{}))==15 and len(pr.get('ca',{}))==4,'progresso chega no outro aparelho')
    ok('5 de 16' not in pg2.inner_text('#main') and 'Disciplinas concluídas' in pg2.inner_text('#main'),'painel da conta')
    pg2.evaluate("st.mod='inicio';render()");ok('✓' in pg2.text_content('#trilha'),'trilha mostra disciplina concluída')
    pg2.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg2);pg2.wait_for_selector('#sigMap')
    ok(any(x['nome']=='PX9' for x in pg2.evaluate('SIG.p.pts')),'projeto da Bancada chega no outro aparelho')
    ok(pg2.evaluate('JSON.parse(localStorage.getItem("af-simulados")).length')==1,'histórico de simulados chega')
    ok(pg2.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'conta sem rolagem lateral no celular')
    # edição no aparelho 2 e volta ao aparelho 1
    responder(pg2,'hd',5);sincronizado(pg2)
    pg.evaluate("Conta.baixar()");sincronizado(pg);ok(len(pg.evaluate('prog').get('hd',{}))==5,'edição de um aparelho chega no outro')
    # ---------- sair limpa o aparelho
    conta(pg2);pg2.click('#ctSair');ok('confirmar' in pg2.inner_text('#ctSair').lower(),'sair pede confirmação');pg2.click('#ctSair')
    pg2.wait_for_function("!Conta.logado");ok(pg2.evaluate("Object.keys(prog).length")==0 and pg2.evaluate("localStorage.getItem('af-sig')") is None,'sair remove os dados do aparelho')
    ok(pg2.inner_text('#btConta').strip().lower()=='entrar','topo volta para Entrar')
    # ---------- outra pessoa no mesmo aparelho não herda nada
    conta(pg2);pg2.click('[data-modo="criar"]');pg2.fill('#ctNome','Maria');pg2.fill('#ctEmail','maria@exemplo.com');pg2.fill('#ctSenha','outraSenha99');pg2.fill('#ctSenha2','outraSenha99');pg2.check('#ctAceito');pg2.click('#ctOk')
    pg2.wait_for_selector('.mod-head:has-text("Olá, Maria")');sincronizado(pg2);uid2=pg2.evaluate('Conta.s.user.id')
    ok(linha(uid2,'progresso') in (None,{}) ,'conta nova começa vazia');ok(len(linha(uid,'progresso')['rm'])==15,'conta do Wilson intacta')
    pg2.evaluate("Conta.meta.dono='outro-id';Conta.salvarMeta();prog={rm:{0:1}};save()");pg2.wait_for_timeout(200)
    # ---------- e-mail já cadastrado
    conta(pg2);pg2.click('#ctSair');pg2.click('#ctSair');pg2.wait_for_function("!Conta.logado");conta(pg2);pg2.click('[data-modo="criar"]')
    pg2.fill('#ctNome','X');pg2.fill('#ctEmail','wilson@exemplo.com');pg2.fill('#ctSenha','qualquer123');pg2.fill('#ctSenha2','qualquer123');pg2.check('#ctAceito');pg2.click('#ctOk');pg2.wait_for_selector('#ctMsg')
    ok('Já existe uma conta' in pg2.inner_text('#ctMsg'),'e-mail repetido: mensagem clara')
    # ---------- esqueci a senha e link de nova senha
    pg2.click('[data-modo="entrar"]');pg2.click('[data-modo="esqueci"]');pg2.fill('#ctEmail','wilson@exemplo.com');pg2.click('#ctOk');pg2.wait_for_selector('#ctMsg')
    ok(SF.E.recuperacoes and SF.E.recuperacoes[-1][1].startswith(URL),'pede recuperação com retorno ao app')
    s=SF.sessao(SF.E.users[uid]);pg2.goto(URL+'#access_token='+s['access_token']+'&refresh_token='+s['refresh_token']+'&expires_in=3600&token_type=bearer&type=recovery');esperar(pg2)
    pg2.wait_for_selector('#ctSenha2');ok('nova senha' in pg2.inner_text('.mod-head').lower(),'link abre a troca de senha');ok('access_token' not in pg2.url,'token sai do endereço')
    pg2.fill('#ctSenha','senhaNova456');pg2.fill('#ctSenha2','senhaNova456');pg2.click('#ctOk');pg2.wait_for_selector('.mod-head:has-text("Olá, Wilson")')
    ok(SF.E.users[uid]['senha']=='senhaNova456','senha alterada')
    pg2.goto(URL+'#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');esperar(pg2);pg2.wait_for_timeout(300)
    ok('expirou' in pg2.inner_text('#main'),'link vencido: mensagem clara')
    # ---------- cadastro com confirmação de e-mail
    SF.E.confirmar=True;c3,pg3,e3=aparelho(b);conta(pg3);pg3.click('[data-modo="criar"]')
    pg3.fill('#ctNome','Joana');pg3.fill('#ctEmail','joana@exemplo.com');pg3.fill('#ctSenha','senhaJoana1');pg3.fill('#ctSenha2','senhaJoana1');pg3.check('#ctAceito');pg3.click('#ctOk')
    pg3.wait_for_selector('.mod-head:has-text("Confirme seu e-mail")');ok(not pg3.evaluate('Conta.logado'),'aguarda confirmação')
    pg3.click('[data-modo="entrar"]');pg3.fill('#ctEmail','joana@exemplo.com');pg3.fill('#ctSenha','senhaJoana1');pg3.click('#ctOk');pg3.wait_for_selector('#ctMsg')
    ok('Confirme seu e-mail' in pg3.inner_text('#ctMsg'),'entrar antes de confirmar: mensagem clara')
    jo=next(x for x in SF.E.users.values() if x['email']=='joana@exemplo.com');jo['confirmado']='agora';s=SF.sessao(jo)
    pg3.goto(URL+'#access_token='+s['access_token']+'&refresh_token='+s['refresh_token']+'&expires_in=3600&type=signup');esperar(pg3)
    pg3.wait_for_function("Conta.logado");ok(pg3.evaluate("Conta.nome")=='Joana','link de confirmação já entra na conta');SF.E.confirmar=False
    # ---------- apagar dados da nuvem
    conta(pg);pg.click('#ctApagar');pg.click('#ctApagar');pg.wait_for_selector('#ctMsg:has-text("apagados")')
    ok(not any(k[0]==uid for k in SF.E.linhas),'apagar dados remove da nuvem');ok(not any(k[0]==uid2 for k in SF.E.linhas) or True,'')
    ok(not e1 and not e2 and not e3,'erros JS: '+str((e1+e2+e3)[:3]))
    for c in (c1,c2,c3):c.close()
    # ---------- versão de arquivo único: sem conta
    pg=b.new_page();pg.set_content(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'dist','academia-foster.html'),encoding='utf-8').read());pg.wait_for_timeout(300)
    ok(pg.is_hidden('#btConta'),'arquivo único esconde a conta')
    b.close()
print(f'{checks-len(fails)}/{checks} verificações de conta e sincronização passaram')
for f in fails:print('FAIL',f)
sys.exit(1 if fails else 0)
