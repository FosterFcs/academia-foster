-- Academia Foster: pacotes de créditos de certificado.
-- O aluno compra um pacote (1, 5, 10 ou 20 créditos) e paga um Pix só. Quando o instrutor confirma o pagamento,
-- os créditos entram e cada certificado pedido (ou que vier a ser pedido) é emitido na hora, consumindo 1 crédito.

create table public.acad_compras(
  codigo text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  pacote text not null,
  creditos int not null check (creditos>0),
  valor numeric(8,2) not null,
  status text not null default 'pendente' check (status in ('pendente','pago','cancelado')),
  solicitado_em timestamptz not null default now(),
  pago_em timestamptz
);
create index on public.acad_compras(user_id,status);
alter table public.acad_compras enable row level security;
revoke all on public.acad_compras from anon, authenticated;

alter table public.acad_certificados add column usou_credito boolean not null default false;

insert into public.acad_config(chave,valor) values
  ('pacotes','[{"id":"p1","creditos":1,"valor":4.90,"nome":"Avulso"},{"id":"p5","creditos":5,"valor":19.90,"nome":"5 certificados"},{"id":"p10","creditos":10,"valor":34.90,"nome":"10 certificados"},{"id":"p20","creditos":20,"valor":59.90,"nome":"Todas as disciplinas"}]')
  on conflict (chave) do update set valor=excluded.valor;
update public.acad_config set valor='4.90' where chave='preco';

create or replace function public.acad_codigo(prefixo text) returns text language plpgsql volatile set search_path=public,pg_temp as $$
declare alfa text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; cod text; i int;
begin
  loop
    cod:=prefixo||'-'; for i in 1..8 loop cod:=cod||substr(alfa,1+floor(random()*32)::int,1); end loop;
    exit when not exists(select 1 from public.acad_certificados where codigo=cod) and not exists(select 1 from public.acad_compras where codigo=cod);
  end loop;
  return cod;
end $$;

create or replace function public.acad_saldo_de(u uuid) returns int language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce((select sum(creditos) from public.acad_compras where user_id=u and status='pago'),0)::int
       - (select count(*) from public.acad_certificados where user_id=u and usou_credito)::int
$$;

-- Emite os certificados pendentes do aluno enquanto houver crédito (os mais antigos primeiro)
create or replace function public.acad_emitir_pendentes(u uuid) returns int language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare c record; n int:=0;
begin
  for c in select codigo from public.acad_certificados where user_id=u and status='pendente' order by solicitado_em for update loop
    exit when public.acad_saldo_de(u)<=0;
    update public.acad_certificados set status='emitido', emitido_em=now(), usou_credito=true where codigo=c.codigo;
    n:=n+1;
  end loop;
  return n;
end $$;

create or replace function public.acad_carteira() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); p record;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select * into p from public.acad_compras where user_id=u and status='pendente' order by solicitado_em desc limit 1;
  return jsonb_build_object('saldo',public.acad_saldo_de(u),
    'aguardando',(select count(*) from public.acad_certificados where user_id=u and status='pendente'),
    'compra',case when p.codigo is null then null else jsonb_build_object('codigo',p.codigo,'pacote',p.pacote,'creditos',p.creditos,'valor',p.valor,'solicitado_em',p.solicitado_em) end,
    'pacotes',coalesce(public.acad_cfg('pacotes'),'[]')::jsonb,
    'pix',jsonb_build_object('chave',public.acad_cfg('pix_chave'),'nome',public.acad_cfg('pix_nome'),'cidade',public.acad_cfg('pix_cidade')),
    'contato',public.acad_cfg('contato'));
end $$;

-- Cria (ou troca) o pedido de pacote pendente do aluno
create or replace function public.acad_comprar_pacote(p_pacote text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); pk jsonb; cod text; r public.acad_compras;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select x into pk from jsonb_array_elements(coalesce(public.acad_cfg('pacotes'),'[]')::jsonb) x where x->>'id'=p_pacote;
  if pk is null then raise exception 'pacote_invalido' using errcode='22023'; end if;
  update public.acad_compras set status='cancelado' where user_id=u and status='pendente';
  cod:=public.acad_codigo('PK');
  insert into public.acad_compras(codigo,user_id,pacote,creditos,valor) values(cod,u,p_pacote,(pk->>'creditos')::int,(pk->>'valor')::numeric) returning * into r;
  return jsonb_build_object('codigo',r.codigo,'pacote',r.pacote,'creditos',r.creditos,'valor',r.valor);
end $$;

-- Pedido de certificado: emite na hora se houver crédito
create or replace function public.acad_solicitar_certificado(p_modulo text, p_nome text, p_cpf text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); ap record; c public.acad_certificados; v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select id, acertos into ap from public.acad_tentativas where user_id=u and modulo=p_modulo and aprovada order by acertos desc, enviada limit 1;
  if ap.id is null then raise exception 'prova_nao_aprovada' using errcode='22023'; end if;
  if char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ' then raise exception 'nome_invalido' using errcode='22023'; end if;
  if not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  select * into c from public.acad_certificados where user_id=u and modulo=p_modulo and status<>'cancelado' for update;
  if found then
    if c.status='pendente' then update public.acad_certificados set nome=v_nome, cpf=v_cpf where codigo=c.codigo; end if;
  else
    insert into public.acad_certificados(codigo,user_id,modulo,nome,cpf,nota,valor,tentativa_id)
      values(public.acad_codigo('AF'),u,p_modulo,v_nome,v_cpf,ap.acertos,coalesce(public.acad_cfg('preco'),'4.90')::numeric,ap.id) returning * into c;
  end if;
  perform public.acad_emitir_pendentes(u);
  select * into c from public.acad_certificados where codigo=c.codigo;
  return jsonb_build_object('codigo',c.codigo,'status',c.status,'valor',c.valor,'nome',c.nome,'saldo',public.acad_saldo_de(u));
end $$;

-- ---------- instrutor
create or replace function public.acad_admin_compras() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('codigo',c.codigo,'pacote',c.pacote,'creditos',c.creditos,'valor',c.valor,'status',c.status,'email',u.email,
      'nome',(select nome from public.acad_certificados x where x.user_id=c.user_id order by solicitado_em desc limit 1),
      'solicitado_em',c.solicitado_em,'pago_em',c.pago_em) order by c.status<>'pendente', c.solicitado_em desc),'[]'::jsonb)
    from (select * from public.acad_compras where status<>'cancelado' order by solicitado_em desc limit 200) c left join auth.users u on u.id=c.user_id);
end $$;

create or replace function public.acad_admin_compra(p_codigo text, p_acao text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare r public.acad_compras; n int:=0;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  if p_acao not in ('confirmar','cancelar') then raise exception 'acao_invalida' using errcode='22023'; end if;
  update public.acad_compras set status=case p_acao when 'confirmar' then 'pago' else 'cancelado' end, pago_em=case p_acao when 'confirmar' then now() end
    where codigo=p_codigo and status='pendente' returning * into r;
  if not found then raise exception 'compra_nao_pendente' using errcode='22023'; end if;
  if p_acao='confirmar' then n:=public.acad_emitir_pendentes(r.user_id); end if;
  return jsonb_build_object('codigo',r.codigo,'status',r.status,'emitidos',n,'saldo',public.acad_saldo_de(r.user_id));
end $$;

-- A emissão avulsa pelo instrutor deixa de existir: todo certificado passa a usar crédito
revoke all on function public.acad_admin_decidir(text,text) from public, anon, authenticated;

revoke all on function public.acad_codigo(text), public.acad_saldo_de(uuid), public.acad_emitir_pendentes(uuid), public.acad_carteira(), public.acad_comprar_pacote(text),
  public.acad_solicitar_certificado(text,text,text), public.acad_admin_compras(), public.acad_admin_compra(text,text) from public, anon, authenticated;
grant execute on function public.acad_carteira(), public.acad_comprar_pacote(text), public.acad_solicitar_certificado(text,text,text),
  public.acad_admin_compras(), public.acad_admin_compra(text,text) to authenticated;
