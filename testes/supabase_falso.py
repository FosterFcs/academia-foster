"""Imitação local do Supabase (Auth + REST da tabela acad_dados) para testar login e sincronização sem internet.
Responde com os mesmos formatos e códigos do Supabase real e aplica a mesma regra: cada usuário só acessa as próprias linhas."""
import json,uuid,time,threading,http.server,socketserver,urllib.parse
CHAVE='sb_publishable_VT3XEbInyTr2Eu-AuLnrqw_BOrA2jYy'
class Estado:
    def __init__(s):s.users={};s.tokens={};s.refresh={};s.linhas={};s.confirmar=False;s.expira=3600;s.chamadas=[];s.recuperacoes=[];s.pg=None;s.lock=threading.Lock()
E=Estado()
def sessao(u):
    at=uuid.uuid4().hex;rt=uuid.uuid4().hex;E.tokens[at]=(u['id'],time.time()+E.expira);E.refresh[rt]=u['id']
    return{'access_token':at,'token_type':'bearer','expires_in':E.expira,'expires_at':int(time.time()+E.expira),'refresh_token':rt,'user':publico(u)}
def publico(u):return{'id':u['id'],'email':u['email'],'aud':'authenticated','role':'authenticated','user_metadata':u['meta'],'email_confirmed_at':u.get('confirmado')}
class H(http.server.BaseHTTPRequestHandler):
    def log_message(s,*a):pass
    def cors(s):
        s.send_header('Access-Control-Allow-Origin','*');s.send_header('Access-Control-Allow-Headers','apikey, authorization, content-type, prefer, x-client-info');s.send_header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE,OPTIONS')
    def resp(s,cod,obj=None):
        b=b'' if obj is None else json.dumps(obj).encode();s.send_response(cod);s.cors();s.send_header('Content-Type','application/json');s.send_header('Content-Length',str(len(b)));s.end_headers();s.wfile.write(b)
    def erro(s,cod,code,msg):s.resp(cod,{'code':cod,'error_code':code,'msg':msg})
    def do_OPTIONS(s):s.send_response(204);s.cors();s.end_headers()
    def corpo(s):n=int(s.headers.get('Content-Length') or 0);return json.loads(s.rfile.read(n) or b'null') if n else None
    def uid(s):
        a=(s.headers.get('Authorization') or '').replace('Bearer ','');t=E.tokens.get(a)
        if not t or t[1]<time.time():return None
        return t[0]
    def rota(s,m):
        u=urllib.parse.urlparse(s.path);q=urllib.parse.parse_qs(u.query);p=u.path;E.chamadas.append((m,p,dict(q)))
        if s.headers.get('apikey')!=CHAVE:return s.resp(401,{'message':'Invalid API key'})
        with E.lock:
            if p=='/auth/v1/signup' and m=='POST':
                b=s.corpo();email=b['email'].lower()
                if any(x['email']==email for x in E.users.values()):return s.erro(422,'user_already_exists','User already registered')
                if len(b['password'])<6:return s.erro(422,'weak_password','Password should be at least 6 characters.')
                us={'id':str(uuid.uuid4()),'email':email,'senha':b['password'],'meta':b.get('data') or {},'confirmado':None if E.confirmar else 'agora','redirect':q.get('redirect_to',[''])[0]}
                E.users[us['id']]=us
                if E.pg:E.pg.execute('insert into auth.users(id,email) values(%s,%s) on conflict do nothing',(us['id'],email))
                return s.resp(200,publico(us) if E.confirmar else sessao(us))
            if p=='/auth/v1/token' and m=='POST':
                b=s.corpo();g=q.get('grant_type',[''])[0]
                if g=='password':
                    us=next((x for x in E.users.values() if x['email']==b['email'].lower() and x['senha']==b['password']),None)
                    if not us:return s.erro(400,'invalid_credentials','Invalid login credentials')
                    if not us['confirmado']:return s.erro(400,'email_not_confirmed','Email not confirmed')
                    return s.resp(200,sessao(us))
                if g=='refresh_token':
                    i=E.refresh.pop(b.get('refresh_token'),None)
                    if not i:return s.erro(400,'refresh_token_not_found','Invalid Refresh Token: Refresh Token Not Found')
                    return s.resp(200,sessao(E.users[i]))
            if p=='/auth/v1/recover' and m=='POST':E.recuperacoes.append((s.corpo()['email'],q.get('redirect_to',[''])[0]));return s.resp(200,{})
            i=s.uid()
            if p=='/auth/v1/user':
                if not i:return s.erro(401,'bad_jwt','invalid JWT')
                if m=='PUT':
                    b=s.corpo()
                    if 'password' in b:
                        if b['password']==E.users[i]['senha']:return s.erro(422,'same_password','New password should be different from the old password.')
                        E.users[i]['senha']=b['password']
                return s.resp(200,publico(E.users[i]))
            if p=='/auth/v1/logout':
                a=(s.headers.get('Authorization') or '').replace('Bearer ','');E.tokens.pop(a,None);return s.resp(204)
            if p.startswith('/rest/v1/rpc/') and m=='POST' and E.pg:return s.rpc(p.rsplit('/',1)[1],i,s.corpo() or {})
            if p=='/rest/v1/acad_dados':
                if not i:return s.resp(401,{'code':'PGRST301','message':'JWT expired'} if s.headers.get('Authorization') else {'code':'42501','message':'permission denied for table acad_dados'})
                if m=='GET':return s.resp(200,[{'chave':k[1],'dados':v['dados'],'atualizado_em':v['em']} for k,v in E.linhas.items() if k[0]==i])
                if m=='POST':
                    b=s.corpo()
                    for r in (b if isinstance(b,list) else [b]):
                        if r['user_id']!=i:return s.resp(403,{'code':'42501','message':'new row violates row-level security policy for table "acad_dados"'})
                        if r['chave'] not in('progresso','simulados','sig'):return s.resp(400,{'code':'23514','message':'violates check constraint'})
                        E.linhas[(i,r['chave'])]={'dados':r['dados'],'em':time.strftime('%Y-%m-%dT%H:%M:%S',time.gmtime())+'.%06d+00:00'%int((time.time()%1)*1e6)}
                    return s.resp(201)
                if m=='DELETE':
                    alvo=q.get('user_id',[''])[0].replace('eq.','')
                    for k in [k for k in E.linhas if k[0]==i and k[0]==alvo]:del E.linhas[k]
                    return s.resp(204)
        s.resp(404,{'message':'not found'})
    def rpc(s,fn,i,args):
        """Executa a função de verdade no PostgreSQL local, como o PostgREST: papel e claims do JWT."""
        import psycopg
        c=E.pg;tem_auth=bool(s.headers.get('Authorization'))
        if tem_auth and not i:return s.resp(401,{'code':'PGRST301','message':'JWT expired'})
        try:
            c.execute('reset role')
            if i:c.execute("select set_config('request.jwt.claims',%s,false)",(json.dumps({'sub':i,'email':E.users[i]['email'],'role':'authenticated'}),));c.execute('set role authenticated')
            else:c.execute("select set_config('request.jwt.claims','',false)");c.execute('set role anon')
            nomes=list(args.keys());sql=f"select public.{fn}("+','.join(f'{k}=>%s' for k in nomes)+')'
            vals=[json.dumps(v) if isinstance(v,(dict,)) else v for v in args.values()]
            r=c.execute(sql,vals).fetchone()[0];b=json.dumps(r).encode()
            s.send_response(200);s.cors();s.send_header('Content-Type','application/json');s.send_header('Content-Length',str(len(b)));s.end_headers();s.wfile.write(b);return
        except psycopg.Error as e:
            cod=e.sqlstate or 'P0001';st={'42501':401 if not i else 403,'42883':404,'28000':401}.get(cod,400)
            return s.resp(st,{'code':cod,'message':e.diag.message_primary,'details':None,'hint':None})
        finally:
            try:c.execute('reset role')
            except Exception:pass
    def do_GET(s):s.rota('GET')
    def do_POST(s):s.rota('POST')
    def do_PUT(s):s.rota('PUT')
    def do_DELETE(s):s.rota('DELETE')
def iniciar():
    srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),H);srv.daemon_threads=True;threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,f'http://127.0.0.1:{srv.server_address[1]}'
