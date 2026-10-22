"""PostgreSQL local descartável com uma imitação mínima do Supabase, para testar supabase/certificacao.sql."""
import os,sys,json,uuid,subprocess,tempfile
import psycopg
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STUB="""
create role anon nologin; create role authenticated nologin;
create schema auth; create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims',true)::json->>'sub','')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
grant usage on schema public to anon,authenticated;
alter default privileges in schema public grant all on tables to anon,authenticated;
alter default privileges in schema public grant all on functions to anon,authenticated;
alter default privileges in schema public grant all on sequences to anon,authenticated;
"""
def subir():
    bins=[p for p in ['/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'] if os.path.exists(p+'/initdb')]
    if os.environ.get('AF_PG'):return None,os.environ['AF_PG']
    if not bins:print('PostgreSQL não encontrado: teste do banco pulado.');sys.exit(0)
    d=tempfile.mkdtemp(prefix='afpg');os.chmod(d,0o777);run=['su','postgres','-c'] if os.geteuid()==0 else None
    def sh(c):return subprocess.run(run+[c] if run else ['sh','-c',c],check=True,capture_output=True)
    sh(f'{bins[0]}/initdb -D {d}/data -A trust -U postgres');porta=54000+os.getpid()%900
    sh(f"{bins[0]}/pg_ctl -D {d}/data -o '-p {porta} -k {d}' -l {d}/log -w start")
    return (lambda:sh(f'{bins[0]}/pg_ctl -D {d}/data -m fast stop')),f'host={d} port={porta} user=postgres dbname=postgres'

def banco(dsn,modulos_completos=('rm','ca'),completos_por=12):
    """Cria um banco novo com a migração e um banco de questões sintético (a certa começa com "certa")."""
    con=psycopg.connect(dsn,autocommit=True);db='af_teste_'+uuid.uuid4().hex[:6];con.execute(f'create database {db}');con.close()
    c=psycopg.connect(dsn.replace('dbname=postgres','dbname='+db),autocommit=True)
    c.execute(STUB);c.execute(open(os.path.join(RAIZ,'supabase','certificacao.sql')).read())
    for m in modulos_completos:
        for k in range(completos_por):c.execute('insert into acad_prova_questoes(modulo,p,o,c) values(%s,%s,%s,2)',(m,f'{m} questão {k}',json.dumps([f'errada a{k}',f'errada b{k}',f'certa {k}',f'errada d{k}'])))
    return c
