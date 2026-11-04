-- Painel do instrutor: emitir certificados avulsos (sem prova no app, ex.: pagamento por fora, cortesia, turma presencial)
-- e corrigir certificados já emitidos (nome, CPF, nota, carga, situação). Toda mudança fica registrada no histórico.

alter table public.acad_certificados alter column user_id drop not null;
alter table public.acad_certificados add column if not exists avulso boolean not null default false;
alter table public.acad_certificados add column if not exists obs text;

create table if not exists public.acad_cert_historico(
  id bigserial primary key,
  codigo text not null,
  admin text,
  acao text not null,
  antes jsonb,
  depois jsonb,
  em timestamptz not null default now());
alter table public.acad_cert_historico enable row level security;
revoke all on public.acad_cert_historico from anon, authenticated;

create or replace function public.acad_cert_json(c public.acad_certificados) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object('codigo',c.codigo,'modulo',c.modulo,'modulos',c.modulos,'nome',c.nome,'cpf',c.cpf,'nota',c.nota,'carga',c.carga,'valor',c.valor,
    'status',c.status,'avulso',c.avulso,'obs',c.obs,'solicitado_em',c.solicitado_em,'emitido_em',c.emitido_em,
    'email',(select email from auth.users u where u.id=c.user_id))
$$;

-- Busca por código, nome, CPF ou e-mail (vazio = os 50 mais recentes)
create or replace function public.acad_admin_buscar(p_termo text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare t text:=btrim(coalesce(p_termo,'')); d text:=regexp_replace(coalesce(p_termo,''),'\D','','g');
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(public.acad_cert_json(c) order by c.solicitado_em desc),'[]'::jsonb) from (
    select c.* from public.acad_certificados c left join auth.users u on u.id=c.user_id
    where t='' or c.codigo=upper(t) or c.nome ilike '%'||t||'%' or (length(d)>=3 and c.cpf like '%'||d||'%') or u.email ilike '%'||t||'%'
    order by c.solicitado_em desc limit 50) c);
end $$;

-- Emite um certificado avulso. Uma disciplina = certificado da disciplina (4 h); várias = Certificado de Conclusão (4 h cada).
create or replace function public.acad_admin_emitir(p_nome text, p_cpf text, p_modulos text[], p_nota int, p_email text default null, p_valor numeric default 0, p_obs text default null)
returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
  u uuid; ms text[]; n int; cod text; c public.acad_certificados; ex text;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  if char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ' then raise exception 'nome_invalido' using errcode='22023'; end if;
  if not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  if p_nota is null or p_nota<0 or p_nota>10 then raise exception 'nota_invalida' using errcode='22023'; end if;
  select array_agg(distinct m order by m) into ms from unnest(coalesce(p_modulos,'{}')) m where m<>'' and m<>'conclusao';
  n:=coalesce(array_length(ms,1),0);
  if n=0 then raise exception 'sem_disciplina' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_email,'')),'') is not null then
    select id into u from auth.users where lower(email)=lower(btrim(p_email));
    if u is null then raise exception 'email_nao_encontrado' using errcode='22023'; end if;
  end if;
  if n=1 and u is not null then
    select codigo into ex from public.acad_certificados where user_id=u and modulo=ms[1] and status<>'cancelado';
    if ex is not null then raise exception 'ja_existe' using errcode='22023', detail=ex; end if;
  end if;
  cod:=public.acad_codigo('AF');
  insert into public.acad_certificados(codigo,user_id,modulo,modulos,nome,cpf,nota,carga,valor,status,emitido_em,avulso,obs)
    values(cod,u,case when n=1 then ms[1] else 'conclusao' end,
      case when n=1 then null else (select jsonb_agg(jsonb_build_object('modulo',m,'nota',p_nota) order by m) from unnest(ms) m) end,
      v_nome,v_cpf,p_nota,4*n,coalesce(p_valor,0),'emitido',now(),true,nullif(btrim(coalesce(p_obs,'')),''))
    returning * into c;
  insert into public.acad_cert_historico(codigo,admin,acao,depois) values(cod,lower(auth.jwt()->>'email'),'emitir_avulso',public.acad_cert_json(c));
  return public.acad_cert_json(c);
end $$;

-- Corrige um certificado (campos nulos ficam como estão). Situação: 'emitido' ou 'cancelado'.
create or replace function public.acad_admin_editar(p_codigo text, p_nome text default null, p_cpf text default null, p_nota int default null, p_carga int default null, p_status text default null, p_obs text default null)
returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare a public.acad_certificados; c public.acad_certificados; v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  select * into a from public.acad_certificados where codigo=upper(btrim(p_codigo)) for update;
  if not found then raise exception 'certificado_inexistente' using errcode='22023'; end if;
  if p_nome is not null and (char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ') then raise exception 'nome_invalido' using errcode='22023'; end if;
  if p_cpf is not null and not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  if p_nota is not null and (p_nota<0 or p_nota>10) then raise exception 'nota_invalida' using errcode='22023'; end if;
  if p_carga is not null and (p_carga<1 or p_carga>500) then raise exception 'carga_invalida' using errcode='22023'; end if;
  if p_status is not null and p_status not in ('emitido','cancelado') then raise exception 'status_invalido' using errcode='22023'; end if;
  if p_status='emitido' and a.status='cancelado' and a.modulo<>'conclusao' and a.user_id is not null
     and exists(select 1 from public.acad_certificados x where x.user_id=a.user_id and x.modulo=a.modulo and x.status<>'cancelado' and x.codigo<>a.codigo) then
    raise exception 'ja_existe' using errcode='22023';
  end if;
  update public.acad_certificados set
    nome=case when p_nome is null then nome else v_nome end,
    cpf=case when p_cpf is null then cpf else v_cpf end,
    nota=coalesce(p_nota,nota), carga=coalesce(p_carga,carga),
    obs=case when p_obs is null then obs else nullif(btrim(p_obs),'') end,
    status=coalesce(p_status,status),
    emitido_em=case when coalesce(p_status,status)='emitido' then coalesce(emitido_em,now()) else emitido_em end
  where codigo=a.codigo returning * into c;
  insert into public.acad_cert_historico(codigo,admin,acao,antes,depois) values(c.codigo,lower(auth.jwt()->>'email'),'editar',public.acad_cert_json(a),public.acad_cert_json(c));
  return public.acad_cert_json(c);
end $$;

create or replace function public.acad_admin_historico(p_codigo text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('admin',admin,'acao',acao,'antes',antes,'depois',depois,'em',em) order by em desc),'[]'::jsonb)
    from public.acad_cert_historico where codigo=upper(btrim(p_codigo)));
end $$;

revoke all on function public.acad_cert_json(public.acad_certificados), public.acad_admin_buscar(text), public.acad_admin_emitir(text,text,text[],int,text,numeric,text),
  public.acad_admin_editar(text,text,text,int,int,text,text), public.acad_admin_historico(text) from public, anon, authenticated;
grant execute on function public.acad_admin_buscar(text), public.acad_admin_emitir(text,text,text[],int,text,numeric,text),
  public.acad_admin_editar(text,text,text,int,int,text,text), public.acad_admin_historico(text) to authenticated;
