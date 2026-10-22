# Certificação de ponta a ponta na interface: prova, pedido, Pix, painel do instrutor e validação pública.
# O Supabase é imitado localmente e as funções da certificação rodam de verdade num PostgreSQL descartável.
# Uso: python3 testes/certificacao.py
import os,sys,re,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import servir,esperar,ignorar
import supabase_falso as SF
from pg_local import subir,banco
from playwright.sync_api import sync_playwright
fails=[];checks=0
SHOTS=os.environ.get('AF_SHOTS')
def foto(pg,nome,sel='#main'):
    if SHOTS:pg.locator(sel).screenshot(path=os.path.join(SHOTS,nome+'.png'))
def ok(c,m):
    global checks;checks+=1
    if not c:fails.append(m)
parar,dsn=subir()
try:
    db=banco(dsn);db.execute("insert into acad_config(chave,valor) values('pix_chave','wilson@exemplo.com') on conflict(chave) do update set valor=excluded.valor")
    SF.E.pg=db
    srv,URL=servir();msrv,MOCK=SF.iniciar();REAL='https://fvsdlpnvqfvjdxmfgbjx.supabase.co'
    def aparelho(b,w=1280,esquema='light'):
        ctx=b.new_context(service_workers='block',viewport={'width':w,'height':900},color_scheme=esquema)
        ctx.route(re.compile(re.escape(REAL)+r'/.*'),lambda r:r.fulfill(response=r.fetch(url=r.request.url.replace(REAL,MOCK))))
        ctx.route(re.compile(r'fonts\.'),lambda r:r.abort())
        ctx.route(re.compile(r'cdnjs\.cloudflare\.com/.*qrcode'),lambda r:r.fulfill(body='window.qrcode=function(){return{addData(){},make(){},createSvgTag(){return "<svg data-qr=\\"1\\"></svg>"}}}',content_type='text/javascript'))
        pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
        pg.goto(URL);esperar(pg);pg.set_default_timeout(10000);return ctx,pg,errs
    def criar(pg,nome,email):
        pg.click('#btConta');pg.click('[data-modo="criar"]');pg.fill('#ctNome',nome);pg.fill('#ctEmail',email);pg.fill('#ctSenha','senhaForte123');pg.fill('#ctSenha2','senhaForte123');pg.check('#ctAceito');pg.click('#ctOk')
        pg.wait_for_selector('.mod-head:has-text("Olá")')
    def aba(pg,mod,tab):pg.evaluate(f"st.mod='{mod}';st.tab='{tab}';render()");esperar(pg)
    def certas(pg):
        n=pg.locator('#ceLista fieldset').count()
        for i in range(n):
            labs=pg.locator(f'#ceLista fieldset:nth-child({i+1}) label')
            k=next(j for j in range(labs.count()) if labs.nth(j).inner_text().strip().startswith('certa'))
            yield i,k,labs
    with sync_playwright() as p:
        b=p.chromium.launch()
        c1,pg,e1=aparelho(b)
        # sem conta
        aba(pg,'rm','cert');ok(pg.is_visible('.tab[data-k="cert"]'),'aba Certificado existe')
        ok('R$ 9,90' in pg.inner_text('#painel') and '4 horas' in pg.inner_text('#painel'),'requisitos com valor e carga')
        ok(pg.is_visible('#ceEntrar'),'pede login');pg.click('#ceEntrar');ok('Minha conta' in pg.inner_text('.mod-head') or pg.is_visible('#ctEmail'),'leva para entrar')
        criar(pg,'Ana Aluna','ana@exemplo.com')
        # quiz incompleto bloqueia
        aba(pg,'rm','cert');pg.wait_for_selector('#ceQuiz');ok('0 de 15' in pg.inner_text('#painel'),'exige quiz completo')
        pg.click('#ceQuiz');ok(pg.get_attribute('.tab[data-k="quiz"]','aria-selected')=='true','botão leva ao quiz')
        for i in range(15):pg.click(f'#ql .q:nth-child({i+1}) .op >> nth=0')
        # módulo sem prova no banco
        aba(pg,'et','quiz')
        for i in range(15):pg.click(f'#ql .q:nth-child({i+1}) .op >> nth=0')
        aba(pg,'et','cert');pg.click('#ceComecar');pg.wait_for_selector('#painel .pill.alerta');ok('ainda não está disponível' in pg.inner_text('#painel'),'disciplina sem prova avisa')
        # prova: reprovar
        aba(pg,'rm','cert');pg.wait_for_selector('#ceComecar');ok('0 de 2' in pg.inner_text('#painel'),'mostra tentativas');pg.click('#ceComecar');pg.wait_for_selector('#ceLista fieldset')
        ok(pg.locator('#ceLista fieldset').count()==10,'10 questões na tela');ok(re.match(r'\d\d:\d\d',pg.inner_text('#ceTempo')) and int(pg.inner_text('#ceTempo')[:2])>=29,'cronômetro de 30 min '+pg.inner_text('#ceTempo'))
        for i,k,labs in certas(pg):
            if i<5:labs.nth(k).click()
            else:labs.nth((k+1)%labs.count()).click()
        ok('10 de 10 respondidas' in pg.inner_text('#ceResp'),'contador de respostas');foto(pg,'c_prova')
        # recarregar no meio retoma a mesma prova
        pg.click('.tab[data-k="teoria"]');pg.click('.tab[data-k="cert"]');ok(pg.locator('#ceLista input:checked').count()==10,'troca de aba mantém respostas')
        pg.click('#ceEnviar');pg.wait_for_selector('#painel .pill');ok('5 de 10' in pg.inner_text('#painel') and 'Precisa de 7' in pg.inner_text('#painel'),'reprovação explicada')
        ok('1 de 2' in pg.inner_text('#painel'),'conta a tentativa')
        # segunda tentativa: deixar em branco pede confirmação; aprovar com 8
        pg.click('#ceComecar');pg.wait_for_selector('#ceLista fieldset')
        lista=list(certas(pg))
        for i,k,labs in lista[:8]:labs.nth(k).click()
        pg.click('#ceEnviar');ok(pg.is_visible('#ceAviso') and 'Faltam 2' in pg.inner_text('#ceAviso'),'avisa questões em branco')
        pg.click('#ceEnviar');pg.wait_for_selector('#ceForm');ok('Aprovado com 8 de 10' in pg.inner_text('#painel'),'aprovação')
        # pedido: validações
        pg.fill('#ceNome','Ana');pg.fill('#ceCpf','52998224725');pg.click('#ceSolicitar');ok('nome completo' in pg.inner_text('#ceErro'),'valida nome')
        pg.fill('#ceNome','Ana Aluna Souza');pg.fill('#ceCpf','111.111.111-11');pg.click('#ceSolicitar');ok('CPF inválido' in pg.inner_text('#ceErro'),'valida CPF')
        pg.fill('#ceCpf','52998224725');ok(pg.input_value('#ceCpf')=='529.982.247-25','máscara do CPF')
        pg.click('#ceSolicitar');ok('autorização' in pg.inner_text('#ceErro'),'exige autorização')
        pg.check('#ceAceite');pg.click('#ceSolicitar');pg.wait_for_selector('#cePix')
        cod=re.search(r'AF-[A-Z0-9]{8}',pg.inner_text('#painel')).group(0);px=pg.input_value('#cePix')
        ok(px.startswith('000201') and 'br.gov.bcb.pix' in px and '0118wilson@exemplo.com' in px and '54049.90' in px and cod.replace('-','') in px,'Pix copia e cola '+px)
        ok(pg.evaluate(f"Cert.crc16({json.dumps(px[:-4])})")==px[-4:],'CRC do Pix confere')
        ok(pg.evaluate("Cert.crc16('123456789')")=='29B1','CRC16-CCITT padrão')
        ok(pg.locator('#cePixQr svg').count()==1,'QR code do Pix');foto(pg,'c_pix')
        z=pg.get_attribute('#painel a[href^="https://wa.me/"]','href');ok(z and '5524992096103' in z and cod in z,'WhatsApp com o código')
        # validação ainda não funciona
        v=b.new_context(service_workers='block');v.route(re.compile(re.escape(REAL)+r'/.*'),lambda r:r.fulfill(response=r.fetch(url=r.request.url.replace(REAL,MOCK))));v.route(re.compile(r'fonts\.'),lambda r:r.abort())
        v.route(re.compile(r'cdnjs\.cloudflare\.com/.*qrcode'),lambda r:r.fulfill(body='window.qrcode=function(){return{addData(){},make(){},createSvgTag(){return "<svg data-qr=\\"1\\"></svg>"}}}',content_type='text/javascript'))
        pv=v.new_page();pv.goto(URL+'validar.html?c='+cod);pv.wait_for_selector('.status');ok('não encontrado' in pv.inner_text('#saida'),'pendente não valida')
        # conta do aluno mostra o pedido
        pg.click('#btConta');pg.wait_for_selector('#ceConta table');ok(cod in pg.inner_text('#ceConta') and 'Aguardando pagamento' in pg.inner_text('#ceConta'),'meus certificados: pendente')
        ok('Pedidos de certificado' not in pg.inner_text('#main'),'aluno não vê painel do instrutor')
        # instrutor confirma
        c2,pw,e2=aparelho(b);criar(pw,'Wilson Foster','fosterconstrutora@gmail.com');pw.wait_for_selector('#ceAdm table')
        ok(cod in pw.inner_text('#ceAdm') and 'ana@exemplo.com' in pw.inner_text('#ceAdm') and 'Ana Aluna Souza' in pw.inner_text('#ceAdm'),'painel lista o pedido')
        pw.click(f'[data-ok="{cod}"]');ok('recebi o Pix' in pw.inner_text(f'[data-ok="{cod}"]'),'pede confirmação')
        pw.click(f'[data-ok="{cod}"]');pw.wait_for_selector('#ceAdm .pill.ok');foto(pw,'c_admin');ok('emitido' in pw.inner_text('#ceAdm') and 'Nenhum pedido aguardando' in pw.inner_text('#ceAdm'),'emitido pelo instrutor')
        # aluno vê emitido
        aba(pg,'rm','cert');pg.click('#ceAtualizar');pg.wait_for_selector('text=Certificado emitido');href=pg.get_attribute('#painel a.btn','href');ok(href.endswith('validar.html?c='+cod),'link do certificado')
        # validação pública
        pv.goto(URL+'validar.html?c='+cod.lower());pv.wait_for_selector('.folha');t=pv.inner_text('#saida')
        ok('Certificado válido' in t and 'Ana Aluna Souza' in t and '***.982.247-**' in t and '4 horas' in t and '8,0' in t and 'RM-01' in t,'certificado válido na página pública')
        ok('José Wilson Pereira (Wilson Foster)' in t and 'CREA-SP 5071894914' in t,'assinatura do instrutor')
        ok('Conteúdo programático' in t and 'Esforço cortante' in t,'conteúdo programático com a teoria')
        ok(pv.locator('#qr svg').count()==1,'QR de validação');foto(pv,'c_valida','body')
        ok('52998224725' not in pv.content() and '529.982.247-25' not in pv.content(),'CPF completo nunca aparece')
        pv.fill('#codigo','xx');pv.click('#busca button');ok('formato inválido' in pv.inner_text('#saida'),'formato inválido')
        pv.fill('#codigo','AF-ZZZZZZZZ');pv.click('#busca button');pv.wait_for_selector('.status.erro');ok('não encontrado' in pv.inner_text('#saida'),'código inexistente')
        # impressão em A4 paisagem
        pv.goto(URL+'validar.html?c='+cod);pv.wait_for_selector('.folha');pv.emulate_media(media='print');bb=pv.locator('.folha').bounding_box();ok(abs(bb['width']/bb['height']-297/210)<0.02,'proporção A4 na impressão')
        pv.emulate_media(media='screen')
        # celular: página de validação sem rolagem horizontal da página
        cm=b.new_context(service_workers='block',viewport={'width':390,'height':844});cm.route(re.compile(re.escape(REAL)+r'/.*'),lambda r:r.fulfill(response=r.fetch(url=r.request.url.replace(REAL,MOCK))));cm.route(re.compile(r'fonts\.|cdnjs'),lambda r:r.abort())
        pm=cm.new_page();pm.goto(URL+'validar.html?c='+cod);pm.wait_for_selector('.folha');ok(pm.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),'validação sem rolagem horizontal no celular')
        # aprovado não refaz a prova; certificado na conta
        ok(pg.locator('#ceComecar').count()==0,'aprovado não vê botão de prova')
        pg.click('#btConta');pg.wait_for_selector('#ceConta table a');ok('Emitido em' in pg.inner_text('#ceConta'),'conta mostra emitido')
        for e in e1+e2:fails.append('erro no console: '+e)
        b.close()
finally:
    if parar:parar()
print(f'{checks-len(fails)}/{checks} verificações de certificação na interface passaram')
for x in fails:print('FAIL',x)
sys.exit(1 if fails else 0)
