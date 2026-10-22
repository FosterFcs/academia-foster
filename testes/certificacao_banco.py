"""Testa as regras da certificação (supabase/certificacao.sql) num PostgreSQL local descartável.
Cria um banco temporário com uma imitação mínima do Supabase (papéis anon/authenticated e auth.uid()),
aplica a migração com um banco de questões sintético e confere prova, prazos, tentativas, certificado e validação.
Uso: python3 testes/certificacao_banco.py   (precisa de PostgreSQL 14+ e do pacote psycopg)"""
import os,sys,json,uuid,shutil,subprocess,tempfile,time
import psycopg
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from pg_local import subir,banco
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
n=f=0
def ok(c,m):
    global n,f;n+=1
    if not c:f+=1;print('FAIL',m)
parar,dsn=subir()
try:
    c=banco(dsn)
    for m in ['et']:
        for k in range(6):c.execute('insert into acad_prova_questoes(modulo,p,o,c) values(%s,%s,%s,0)',(m,f'q{k}',json.dumps(['certa','x'])))
    U={nome:str(uuid.uuid4()) for nome in ['ana','bia','wil']}
    for nome,i in U.items():c.execute('insert into auth.users values(%s,%s)',(i,nome+'@x.com' if nome!='wil' else 'fosterconstrutora@gmail.com'))
    def como(quem):
        c.execute('reset role');
        if quem is None:c.execute("select set_config('request.jwt.claims','',false)");c.execute('set role anon');return
        c.execute("select set_config('request.jwt.claims',%s,false)",(json.dumps({'sub':U[quem],'email':('fosterconstrutora@gmail.com' if quem=='wil' else quem+'@x.com'),'role':'authenticated'}),));c.execute('set role authenticated')
    def rpc(quem,fn,*args):
        como(quem)
        try:
            r=c.execute(f"select public.{fn}({','.join(['%s']*len(args))})",args).fetchone()[0];return r,None
        except psycopg.Error as e:return None,(e.diag.message_primary or str(e))
        finally:c.execute('reset role')
    def responder(prova,certas):
        resp=[]
        for k,q in enumerate(prova['questoes']):
            i=next(j for j,t in enumerate(q['o']) if t.startswith('certa'))
            resp.append(i if k<certas else (i+1)%len(q['o']))
        return resp
    # ---- tabelas fechadas
    for t in ['acad_prova_questoes','acad_tentativas','acad_certificados','acad_admins','acad_config']:
        for quem in ['ana',None]:
            como(quem)
            try:c.execute(f'select * from public.{t}');ok(False,f'{t} legível por {quem}')
            except psycopg.Error:ok(True,'')
            c.execute('reset role')
    como('ana')
    try:c.execute("insert into public.acad_certificados(codigo,user_id,modulo,nome,cpf,nota,valor,status) values('AF-FALSO',%s,'rm','Ana Teste','52998224725',10,0,'emitido')",(U['ana'],));ok(False,'insert direto permitido')
    except psycopg.Error:ok(True,'')
    c.execute('reset role')
    # ---- prova
    r,e=rpc(None,'acad_iniciar_prova','rm');ok(e is not None,'anônimo não inicia prova')
    r,e=rpc('ana','acad_iniciar_prova','et');ok(e=='modulo_sem_prova','módulo com menos de 10 questões: '+str(e))
    p1,e=rpc('ana','acad_iniciar_prova','rm');ok(e is None and len(p1['questoes'])==10,'prova com 10 questões')
    ok(all('c' not in q and len(q['o'])==4 for q in p1['questoes']),'gabarito não vai para o aluno')
    ok(len({q['p'] for q in p1['questoes']})==10,'questões sem repetição')
    p1b,e=rpc('ana','acad_iniciar_prova','rm');ok(p1b['tentativa']==p1['tentativa'] and p1b['questoes']==p1['questoes'],'recarregar retoma a mesma prova')
    r,e=rpc('bia','acad_enviar_prova',p1['tentativa'],responder(p1,10));ok(e=='tentativa_inexistente','outro aluno não envia a prova alheia')
    r,e=rpc('ana','acad_enviar_prova',p1['tentativa'],responder(p1,6));ok(r and r['acertos']==6 and not r['aprovada'],'6 acertos reprova '+str(r))
    r,e=rpc('ana','acad_enviar_prova',p1['tentativa'],responder(p1,10));ok(e=='tentativa_encerrada','não reenvia prova encerrada')
    s,e=rpc('ana','acad_situacao','rm');ok(s['tentativas_24h']==1 and not s['aprovada'] and s['ultima']['acertos']==6,'situação após reprovar')
    r,e=rpc('ana','acad_solicitar_certificado','rm','Ana Teste Silva','529.982.247-25');ok(e=='prova_nao_aprovada','sem aprovação não pede certificado')
    p2,e=rpc('ana','acad_iniciar_prova','rm');ok(e is None and p2['tentativa']!=p1['tentativa'],'segunda tentativa')
    r,e=rpc('ana','acad_enviar_prova',p2['tentativa'],[None]*10);ok(r['acertos']==0,'em branco = 0')
    r,e=rpc('ana','acad_iniciar_prova','rm');ok(e=='limite_tentativas','terceira tentativa em 24 h bloqueada')
    s,e=rpc('ana','acad_situacao','rm');ok(s['libera_em'] is not None,'informa quando libera')
    c.execute("update acad_tentativas set iniciada=iniciada-interval '25 hours', enviada=enviada-interval '25 hours' where user_id=%s",(U['ana'],))
    p3,e=rpc('ana','acad_iniciar_prova','rm');ok(e is None,'libera depois de 24 h')
    r,e=rpc('ana','acad_enviar_prova',p3['tentativa'],responder(p3,7)+[99]);ok(r['acertos']==7 and r['aprovada'],'7 acertos aprova (resposta inválida ignorada)')
    r,e=rpc('ana','acad_iniciar_prova','rm');ok(e=='ja_aprovado','aprovado não refaz')
    # prazo de 30 minutos
    pb,e=rpc('bia','acad_iniciar_prova','rm');c.execute("update acad_tentativas set iniciada=now()-interval '40 minutes' where id=%s",(pb['tentativa'],))
    r,e=rpc('bia','acad_enviar_prova',pb['tentativa'],responder(pb,10));ok(r['acertos']==0 and not r['no_prazo'],'fora do prazo vale zero')
    pb2,e=rpc('bia','acad_iniciar_prova','rm');c.execute("update acad_tentativas set iniciada=now()-interval '35 minutes' where id=%s",(pb2['tentativa'],))
    pb3,e=rpc('bia','acad_iniciar_prova','rm');ok(e=='limite_tentativas','prova aberta vencida conta como tentativa')
    # ---- certificado
    for nome,cpf,erro in [('Ana','52998224725','nome_invalido'),('Ana Teste Silva','11111111111','cpf_invalido'),('Ana Teste Silva','52998224724','cpf_invalido')]:
        r,e=rpc('ana','acad_solicitar_certificado','rm',nome,cpf);ok(e==erro,f'{nome}/{cpf}: {e}')
    ct,e=rpc('ana','acad_solicitar_certificado','rm','  Ana   Teste  Silva ','529.982.247-25');ok(e is None and ct['status']=='pendente' and ct['codigo'].startswith('AF-') and len(ct['codigo'])==11,'certificado pendente '+str(ct))
    ok(abs(float(ct['valor'])-9.90)<1e-9 and ct['nome']=='Ana Teste Silva','valor e nome normalizado')
    ct2,e=rpc('ana','acad_solicitar_certificado','rm','Ana Teste Souza','52998224725');ok(ct2['codigo']==ct['codigo'] and ct2['nome']=='Ana Teste Souza','pendente pode corrigir o nome, mesmo código')
    r,e=rpc(None,'acad_validar',ct['codigo']);ok(r is None,'pendente não valida')
    r,e=rpc('ana','acad_admin_pendentes');ok(e=='sem_permissao','aluno não vê painel')
    r,e=rpc('ana','acad_admin_decidir',ct['codigo'],'emitir');ok(e=='sem_permissao','aluno não emite')
    lst,e=rpc('wil','acad_admin_pendentes');ok(any(x['codigo']==ct['codigo'] and x['email']=='ana@x.com' for x in lst),'admin vê pendente com e-mail')
    ok(rpc('wil','acad_eh_admin')[0] is True and rpc('ana','acad_eh_admin')[0] is False,'quem é admin')
    r,e=rpc('wil','acad_admin_decidir',ct['codigo'],'apagar');ok(e=='acao_invalida','ação inválida')
    r,e=rpc('wil','acad_admin_decidir',ct['codigo'],'emitir');ok(r and r['status']=='emitido','admin emite')
    r,e=rpc('wil','acad_admin_decidir',ct['codigo'],'cancelar');ok(e=='certificado_nao_pendente','emitido não volta')
    v,e=rpc(None,'acad_validar',ct['codigo'].lower()+' ');ok(v and v['nome']=='Ana Teste Souza' and v['cpf']=='***.982.247-**' and v['carga']==4 and v['nota']==7 and v['modulo']=='rm','validação pública '+str(v))
    ok('user_id' not in v and 'email' not in v,'validação não expõe e-mail nem id')
    r,e=rpc(None,'acad_validar','AF-NAOEXISTE');ok(r is None,'código inexistente')
    ct3,e=rpc('ana','acad_solicitar_certificado','rm','Outra Pessoa Nome','52998224725');ok(ct3['codigo']==ct['codigo'] and ct3['nome']=='Ana Teste Souza','emitido não muda o nome')
    m,e=rpc('ana','acad_meus_certificados');ok(len(m)==1 and m[0]['status']=='emitido','meus certificados')
    m,e=rpc('bia','acad_meus_certificados');ok(m==[],'certificados de outro aluno não aparecem')
    s,e=rpc('ana','acad_situacao','rm');ok(s['aprovada'] and s['nota']==7 and s['certificado']['status']=='emitido' and abs(float(s['preco'])-9.9)<1e-9,'situação final')
    # cancelar libera novo pedido
    pc,e=rpc('ana','acad_iniciar_prova','ca');r,e=rpc('ana','acad_enviar_prova',pc['tentativa'],responder(pc,9))
    k1,e=rpc('ana','acad_solicitar_certificado','ca','Ana Teste Souza','52998224725');r,e=rpc('wil','acad_admin_decidir',k1['codigo'],'cancelar');ok(r['status']=='cancelado','cancelar')
    k2,e=rpc('ana','acad_solicitar_certificado','ca','Ana Teste Souza','52998224725');ok(k2['codigo']!=k1['codigo'] and k2['status']=='pendente','novo pedido após cancelar')
    ok(rpc(None,'acad_validar',k1['codigo'])[0] is None,'cancelado não valida')
    # anônimo só valida
    for fn,args in [('acad_situacao',('rm',)),('acad_meus_certificados',()),('acad_admin_pendentes',()),('acad_solicitar_certificado',('rm','A B C','52998224725'))]:
        r,e=rpc(None,fn,*args);ok(e is not None,'anônimo bloqueado em '+fn)
    print(f'{n-f}/{n} verificações do banco de certificação passaram')
finally:
    if parar:parar()
sys.exit(1 if f else 0)
