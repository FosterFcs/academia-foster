-- Período de realização no certificado, sempre com datas reais:
--   início = dia em que o aluno abriu a disciplina pela primeira vez logado (acad_estudo);
--            se não houver registro (certificados antigos), o primeiro acesso à Academia (acad_alunos);
--   fim    = dia da aprovação na prova.
-- Certificado de Conclusão: do início mais antigo à aprovação mais recente entre as disciplinas.
-- Avulso: datas informadas pelo instrutor (periodo_ini/periodo_fim), nunca depois da emissão.

create table if not exists public.acad_estudo(
  user_id uuid not null,
  modulo text not null,
  inicio timestamptz not null default now(),
  primary key(user_id, modulo));
alter table public.acad_estudo enable row level security;
revoke all on public.acad_estudo from anon, authenticated;

create or replace function public.acad_registrar_estudo(p_modulo text) returns void language plpgsql volatile security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'login_necessario' using errcode='28000'; end if;
  if p_modulo is null or p_modulo !~ '^[a-z]{2,4}$' then raise exception 'modulo_invalido' using errcode='22023'; end if;
  insert into public.acad_estudo(user_id, modulo) values (auth.uid(), p_modulo) on conflict do nothing;
end $$;
revoke all on function public.acad_registrar_estudo(text) from public, anon;
grant execute on function public.acad_registrar_estudo(text) to authenticated;

alter table public.acad_certificados add column if not exists periodo_ini date;
alter table public.acad_certificados add column if not exists periodo_fim date;

create or replace function public.acad_dia(t timestamptz) returns date language sql stable as $$ select (t at time zone 'America/Sao_Paulo')::date $$;

create or replace function public.acad_periodo(c public.acad_certificados) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare ini timestamptz; fim timestamptz; base timestamptz; d_ini date; d_fim date;
begin
  base:=(select primeiro_acesso from public.acad_alunos where user_id=c.user_id);
  if c.modulo='conclusao' then
    select max(t.enviada) into fim from public.acad_tentativas t
      where t.user_id=c.user_id and t.aprovada and t.modulo in (select x->>'modulo' from jsonb_array_elements(coalesce(c.modulos,'[]')) x);
    select min(coalesce(e.inicio, base)) into ini from jsonb_array_elements(coalesce(c.modulos,'[]')) x
      left join public.acad_estudo e on e.user_id=c.user_id and e.modulo=x->>'modulo';
  else
    select enviada into fim from public.acad_tentativas where id=c.tentativa_id;
    ini:=coalesce((select inicio from public.acad_estudo where user_id=c.user_id and modulo=c.modulo), base);
  end if;
  fim:=coalesce(fim, c.emitido_em, c.solicitado_em);
  d_fim:=coalesce(c.periodo_fim, public.acad_dia(fim));
  d_ini:=coalesce(c.periodo_ini, public.acad_dia(least(coalesce(ini,fim),fim)), d_fim);
  if d_ini>d_fim then d_ini:=d_fim; end if;
  return jsonb_build_object('ini',d_ini,'fim',d_fim);
end $$;

create or replace function public.acad_validar(p_codigo text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object('codigo',codigo,'modulo',modulo,'modulos',modulos,'nome',nome,'cpf','***.'||substr(cpf,4,3)||'.'||substr(cpf,7,3)||'-**','nota',nota,'carga',carga,'emitido_em',emitido_em,
    'periodo',public.acad_periodo(c))
  from public.acad_certificados c where codigo=upper(btrim(p_codigo)) and status='emitido'
$$;

create or replace function public.acad_cert_json(c public.acad_certificados) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object('codigo',c.codigo,'modulo',c.modulo,'modulos',c.modulos,'nome',c.nome,'cpf',c.cpf,'nota',c.nota,'carga',c.carga,'valor',c.valor,
    'status',c.status,'avulso',c.avulso,'obs',c.obs,'solicitado_em',c.solicitado_em,'emitido_em',c.emitido_em,
    'periodo_ini',c.periodo_ini,'periodo_fim',c.periodo_fim,'periodo',public.acad_periodo(c),
    'email',(select email from auth.users u where u.id=c.user_id))
$$;

-- Emissão avulsa e correção passam a aceitar o período (avulso: obrigatório)
drop function if exists public.acad_admin_emitir(text,text,text[],int,text,numeric,text);
create or replace function public.acad_admin_emitir(p_nome text, p_cpf text, p_modulos text[], p_nota int, p_email text default null, p_valor numeric default 0, p_obs text default null,
  p_ini date default null, p_fim date default null)
returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
  u uuid; ms text[]; n int; cod text; c public.acad_certificados; ex text; hoje date:=public.acad_dia(now());
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  if char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ' then raise exception 'nome_invalido' using errcode='22023'; end if;
  if not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  if p_nota is null or p_nota<0 or p_nota>10 then raise exception 'nota_invalida' using errcode='22023'; end if;
  if p_ini is null or p_fim is null or p_ini>p_fim or p_fim>hoje or p_ini<date '2000-01-01' then raise exception 'periodo_invalido' using errcode='22023'; end if;
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
  insert into public.acad_certificados(codigo,user_id,modulo,modulos,nome,cpf,nota,carga,valor,status,emitido_em,avulso,obs,periodo_ini,periodo_fim)
    values(cod,u,case when n=1 then ms[1] else 'conclusao' end,
      case when n=1 then null else (select jsonb_agg(jsonb_build_object('modulo',m,'nota',p_nota) order by m) from unnest(ms) m) end,
      v_nome,v_cpf,p_nota,4*n,coalesce(p_valor,0),'emitido',now(),true,nullif(btrim(coalesce(p_obs,'')),''),p_ini,p_fim)
    returning * into c;
  insert into public.acad_cert_historico(codigo,admin,acao,depois) values(cod,lower(auth.jwt()->>'email'),'emitir_avulso',public.acad_cert_json(c));
  return public.acad_cert_json(c);
end $$;

drop function if exists public.acad_admin_editar(text,text,text,int,int,text,text);
create or replace function public.acad_admin_editar(p_codigo text, p_nome text default null, p_cpf text default null, p_nota int default null, p_carga int default null, p_status text default null, p_obs text default null,
  p_ini date default null, p_fim date default null)
returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare a public.acad_certificados; c public.acad_certificados; v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
  ni date; nf date; lim date;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  select * into a from public.acad_certificados where codigo=upper(btrim(p_codigo)) for update;
  if not found then raise exception 'certificado_inexistente' using errcode='22023'; end if;
  if p_nome is not null and (char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ') then raise exception 'nome_invalido' using errcode='22023'; end if;
  if p_cpf is not null and not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  if p_nota is not null and (p_nota<0 or p_nota>10) then raise exception 'nota_invalida' using errcode='22023'; end if;
  if p_carga is not null and (p_carga<1 or p_carga>500) then raise exception 'carga_invalida' using errcode='22023'; end if;
  if p_status is not null and p_status not in ('emitido','cancelado') then raise exception 'status_invalido' using errcode='22023'; end if;
  ni:=coalesce(p_ini,a.periodo_ini); nf:=coalesce(p_fim,a.periodo_fim); lim:=public.acad_dia(coalesce(a.emitido_em,now()));
  if (ni is not null and (ni>lim or ni<date '2000-01-01')) or (nf is not null and nf>lim) or (ni is not null and nf is not null and ni>nf) then
    raise exception 'periodo_invalido' using errcode='22023';
  end if;
  if p_status='emitido' and a.status='cancelado' and a.modulo<>'conclusao' and a.user_id is not null
     and exists(select 1 from public.acad_certificados x where x.user_id=a.user_id and x.modulo=a.modulo and x.status<>'cancelado' and x.codigo<>a.codigo) then
    raise exception 'ja_existe' using errcode='22023';
  end if;
  update public.acad_certificados set
    nome=case when p_nome is null then nome else v_nome end,
    cpf=case when p_cpf is null then cpf else v_cpf end,
    nota=coalesce(p_nota,nota), carga=coalesce(p_carga,carga),
    obs=case when p_obs is null then obs else nullif(btrim(p_obs),'') end,
    status=coalesce(p_status,status), periodo_ini=ni, periodo_fim=nf,
    emitido_em=case when coalesce(p_status,status)='emitido' then coalesce(emitido_em,now()) else emitido_em end
  where codigo=a.codigo returning * into c;
  insert into public.acad_cert_historico(codigo,admin,acao,antes,depois) values(c.codigo,lower(auth.jwt()->>'email'),'editar',public.acad_cert_json(a),public.acad_cert_json(c));
  return public.acad_cert_json(c);
end $$;

revoke all on function public.acad_periodo(public.acad_certificados), public.acad_admin_emitir(text,text,text[],int,text,numeric,text,date,date),
  public.acad_admin_editar(text,text,text,int,int,text,text,date,date) from public, anon, authenticated;
grant execute on function public.acad_admin_emitir(text,text,text[],int,text,numeric,text,date,date), public.acad_admin_editar(text,text,text,int,int,text,text,date,date) to authenticated;
grant execute on function public.acad_validar(text) to anon, authenticated;
