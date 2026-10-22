-- Academia Foster: prova de certificação corrigida no servidor, certificados e validação pública.
-- Todas as tabelas ficam fechadas; o acesso é só pelas funções abaixo.

create table public.acad_prova_questoes(
  id serial primary key,
  modulo text not null,
  p text not null,
  o jsonb not null check (jsonb_typeof(o)='array' and jsonb_array_length(o) between 2 and 6),
  c int not null check (c>=0)
);
create index on public.acad_prova_questoes(modulo);

create table public.acad_tentativas(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo text not null,
  questoes int[] not null,
  ordens jsonb not null,
  iniciada timestamptz not null default now(),
  enviada timestamptz,
  acertos int,
  aprovada boolean not null default false
);
create index on public.acad_tentativas(user_id,modulo,iniciada desc);

create table public.acad_certificados(
  codigo text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo text not null,
  nome text not null check (char_length(nome) between 5 and 120),
  cpf text not null check (cpf ~ '^[0-9]{11}$'),
  nota int not null check (nota between 0 and 10),
  carga int not null default 4,
  valor numeric(8,2) not null,
  status text not null default 'pendente' check (status in ('pendente','emitido','cancelado')),
  solicitado_em timestamptz not null default now(),
  emitido_em timestamptz,
  tentativa_id uuid references public.acad_tentativas(id) on delete set null
);
create unique index acad_cert_um_ativo on public.acad_certificados(user_id,modulo) where status<>'cancelado';

create table public.acad_admins(email text primary key);
create table public.acad_config(chave text primary key, valor text);

alter table public.acad_prova_questoes enable row level security;
alter table public.acad_tentativas enable row level security;
alter table public.acad_certificados enable row level security;
alter table public.acad_admins enable row level security;
alter table public.acad_config enable row level security;
revoke all on public.acad_prova_questoes, public.acad_tentativas, public.acad_certificados, public.acad_admins, public.acad_config from anon, authenticated;
revoke all on sequence public.acad_prova_questoes_id_seq from anon, authenticated;

-- ---------- utilidades
create or replace function public.acad_cpf_valido(c text) returns boolean language plpgsql immutable set search_path=public,pg_temp as $$
declare s int; d1 int; d2 int; i int;
begin
  if c !~ '^[0-9]{11}$' or c ~ '^(.)\1{10}$' then return false; end if;
  s:=0; for i in 1..9 loop s:=s+substr(c,i,1)::int*(11-i); end loop; d1:=(s*10)%11; if d1=10 then d1:=0; end if;
  s:=0; for i in 1..10 loop s:=s+substr(c,i,1)::int*(12-i); end loop; d2:=(s*10)%11; if d2=10 then d2:=0; end if;
  return d1=substr(c,10,1)::int and d2=substr(c,11,1)::int;
end $$;

create or replace function public.acad_eh_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.acad_admins a where a.email=lower(coalesce(auth.jwt()->>'email','')))
$$;

create or replace function public.acad_cfg(k text) returns text language sql stable security definer set search_path=public,pg_temp as $$
  select valor from public.acad_config where chave=k
$$;

-- ---------- prova
-- Regras: 10 questões sorteadas, 30 minutos, 7 acertos para aprovar, no máximo 2 tentativas a cada 24 horas.
create or replace function public.acad_iniciar_prova(p_modulo text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); t public.acad_tentativas; n int; ids int[]; ords jsonb:='[]'::jsonb; q record; perm jsonb; qs jsonb:='[]'::jsonb; k int;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  if (select count(*) from public.acad_prova_questoes where modulo=p_modulo)<10 then raise exception 'modulo_sem_prova' using errcode='22023'; end if;
  if exists(select 1 from public.acad_tentativas where user_id=u and modulo=p_modulo and aprovada) then raise exception 'ja_aprovado' using errcode='22023'; end if;
  -- retoma uma prova aberta e ainda no prazo (recarregar a página não gasta tentativa)
  select * into t from public.acad_tentativas where user_id=u and modulo=p_modulo and enviada is null and iniciada>now()-interval '30 minutes' order by iniciada desc limit 1;
  if not found then
    select count(*) into n from public.acad_tentativas where user_id=u and modulo=p_modulo and iniciada>now()-interval '24 hours';
    if n>=2 then raise exception 'limite_tentativas' using errcode='22023'; end if;
    -- fecha tentativas abertas que passaram do prazo
    update public.acad_tentativas set enviada=iniciada+interval '30 minutes', acertos=0 where user_id=u and modulo=p_modulo and enviada is null;
    select array_agg(id) into ids from (select id from public.acad_prova_questoes where modulo=p_modulo order by random() limit 10) s;
    for q in select x.id, x.o from unnest(ids) with ordinality as w(id,ord) join public.acad_prova_questoes x on x.id=w.id order by w.ord loop
      select jsonb_agg(i order by random()) into perm from generate_series(0,jsonb_array_length(q.o)-1) i;
      ords:=ords||jsonb_build_array(perm);
    end loop;
    insert into public.acad_tentativas(user_id,modulo,questoes,ordens) values(u,p_modulo,ids,ords) returning * into t;
  end if;
  for k in 1..array_length(t.questoes,1) loop
    select jsonb_build_object('p',x.p,'o',(select jsonb_agg(x.o->(e.v::int) order by e.ord) from jsonb_array_elements_text(t.ordens->(k-1)) with ordinality e(v,ord)))
      into perm from public.acad_prova_questoes x where x.id=t.questoes[k];
    qs:=qs||jsonb_build_array(perm);
  end loop;
  return jsonb_build_object('tentativa',t.id,'expira_em',t.iniciada+interval '30 minutes','questoes',qs);
end $$;

create or replace function public.acad_enviar_prova(p_tentativa uuid, p_respostas int[]) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); t public.acad_tentativas; k int; ac int:=0; orig int; r int; no_prazo boolean;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select * into t from public.acad_tentativas where id=p_tentativa and user_id=u for update;
  if not found then raise exception 'tentativa_inexistente' using errcode='22023'; end if;
  if t.enviada is not null then raise exception 'tentativa_encerrada' using errcode='22023'; end if;
  no_prazo:=now()<=t.iniciada+interval '32 minutes';
  if no_prazo then
    for k in 1..array_length(t.questoes,1) loop
      r:=p_respostas[k];
      if r is not null and r>=0 and r<jsonb_array_length(t.ordens->(k-1)) then
        orig:=(t.ordens->(k-1)->>r)::int;
        if orig=(select c from public.acad_prova_questoes where id=t.questoes[k]) then ac:=ac+1; end if;
      end if;
    end loop;
  end if;
  update public.acad_tentativas set enviada=now(), acertos=ac, aprovada=(ac>=7) where id=t.id;
  return jsonb_build_object('acertos',ac,'total',array_length(t.questoes,1),'aprovada',ac>=7,'no_prazo',no_prazo);
end $$;

create or replace function public.acad_situacao(p_modulo text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); ap record; c public.acad_certificados; n int; prox timestamptz; aberta record;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select acertos, enviada into ap from public.acad_tentativas where user_id=u and modulo=p_modulo and aprovada order by acertos desc, enviada limit 1;
  select * into c from public.acad_certificados where user_id=u and modulo=p_modulo and status<>'cancelado';
  select count(*), min(iniciada)+interval '24 hours' into n, prox from public.acad_tentativas where user_id=u and modulo=p_modulo and iniciada>now()-interval '24 hours';
  select id, iniciada into aberta from public.acad_tentativas where user_id=u and modulo=p_modulo and enviada is null and iniciada>now()-interval '30 minutes' limit 1;
  return jsonb_build_object(
    'aprovada',ap.acertos is not null,'nota',ap.acertos,'aprovada_em',ap.enviada,
    'tentativas_24h',n,'libera_em',case when n>=2 then prox end,'prova_aberta',aberta.id is not null,
    'ultima',(select jsonb_build_object('acertos',acertos,'em',enviada) from public.acad_tentativas where user_id=u and modulo=p_modulo and enviada is not null order by enviada desc limit 1),
    'certificado',case when c.codigo is null then null else jsonb_build_object('codigo',c.codigo,'status',c.status,'nome',c.nome,'valor',c.valor,'solicitado_em',c.solicitado_em,'emitido_em',c.emitido_em) end,
    'preco',coalesce(public.acad_cfg('preco'),'9.90')::numeric,
    'pix',jsonb_build_object('chave',public.acad_cfg('pix_chave'),'nome',public.acad_cfg('pix_nome'),'cidade',public.acad_cfg('pix_cidade')),
    'contato',public.acad_cfg('contato'));
end $$;

-- ---------- certificados
create or replace function public.acad_solicitar_certificado(p_modulo text, p_nome text, p_cpf text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); ap record; c public.acad_certificados; v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g')); cod text; alfa text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select id, acertos into ap from public.acad_tentativas where user_id=u and modulo=p_modulo and aprovada order by acertos desc, enviada limit 1;
  if ap.id is null then raise exception 'prova_nao_aprovada' using errcode='22023'; end if;
  if char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ' then raise exception 'nome_invalido' using errcode='22023'; end if;
  if not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  select * into c from public.acad_certificados where user_id=u and modulo=p_modulo and status<>'cancelado' for update;
  if found then
    if c.status='pendente' then update public.acad_certificados set nome=v_nome, cpf=v_cpf where codigo=c.codigo returning * into c; end if;
  else
    loop
      cod:='AF-'; for i in 1..8 loop cod:=cod||substr(alfa,1+floor(random()*32)::int,1); end loop;
      exit when not exists(select 1 from public.acad_certificados where codigo=cod);
    end loop;
    insert into public.acad_certificados(codigo,user_id,modulo,nome,cpf,nota,valor,tentativa_id)
      values(cod,u,p_modulo,v_nome,v_cpf,ap.acertos,coalesce(public.acad_cfg('preco'),'9.90')::numeric,ap.id) returning * into c;
  end if;
  return jsonb_build_object('codigo',c.codigo,'status',c.status,'valor',c.valor,'nome',c.nome);
end $$;

create or replace function public.acad_meus_certificados() returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(jsonb_build_object('codigo',codigo,'modulo',modulo,'status',status,'nota',nota,'valor',valor,'solicitado_em',solicitado_em,'emitido_em',emitido_em) order by solicitado_em desc),'[]'::jsonb)
  from public.acad_certificados where user_id=auth.uid() and status<>'cancelado'
$$;

-- Validação pública: só certificados emitidos, com o CPF parcialmente oculto
create or replace function public.acad_validar(p_codigo text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object('codigo',codigo,'modulo',modulo,'nome',nome,'cpf','***.'||substr(cpf,4,3)||'.'||substr(cpf,7,3)||'-**','nota',nota,'carga',carga,'emitido_em',emitido_em)
  from public.acad_certificados where codigo=upper(btrim(p_codigo)) and status='emitido'
$$;

-- ---------- administração (Wilson)
create or replace function public.acad_admin_pendentes() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('codigo',c.codigo,'modulo',c.modulo,'nome',c.nome,'email',u.email,'valor',c.valor,'nota',c.nota,'status',c.status,'solicitado_em',c.solicitado_em,'emitido_em',c.emitido_em) order by c.status='emitido', c.solicitado_em desc),'[]'::jsonb)
    from (select * from public.acad_certificados where status<>'cancelado' order by solicitado_em desc limit 200) c left join auth.users u on u.id=c.user_id);
end $$;

create or replace function public.acad_admin_decidir(p_codigo text, p_acao text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare c public.acad_certificados;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  if p_acao not in ('emitir','cancelar') then raise exception 'acao_invalida' using errcode='22023'; end if;
  update public.acad_certificados set status=case p_acao when 'emitir' then 'emitido' else 'cancelado' end,
    emitido_em=case p_acao when 'emitir' then coalesce(emitido_em,now()) else emitido_em end
    where codigo=p_codigo and status='pendente' returning * into c;
  if not found then raise exception 'certificado_nao_pendente' using errcode='22023'; end if;
  return jsonb_build_object('codigo',c.codigo,'status',c.status);
end $$;

-- ---------- permissões das funções
revoke all on function public.acad_cpf_valido(text), public.acad_eh_admin(), public.acad_cfg(text), public.acad_iniciar_prova(text), public.acad_enviar_prova(uuid,int[]),
  public.acad_situacao(text), public.acad_solicitar_certificado(text,text,text), public.acad_meus_certificados(), public.acad_validar(text),
  public.acad_admin_pendentes(), public.acad_admin_decidir(text,text) from public, anon, authenticated;
grant execute on function public.acad_iniciar_prova(text), public.acad_enviar_prova(uuid,int[]), public.acad_situacao(text), public.acad_solicitar_certificado(text,text,text),
  public.acad_meus_certificados(), public.acad_eh_admin(), public.acad_admin_pendentes(), public.acad_admin_decidir(text,text) to authenticated;
grant execute on function public.acad_validar(text) to anon, authenticated;

insert into public.acad_admins(email) values ('comercial@fosterconstrucoes.com.br'),('fosterconstrutora@gmail.com') on conflict do nothing;
insert into public.acad_config(chave,valor) values ('preco','9.90'),('pix_nome','JOSE WILSON PEREIRA'),('pix_cidade','STN PARNAIBA'),('contato','5524992096103') on conflict do nothing;
