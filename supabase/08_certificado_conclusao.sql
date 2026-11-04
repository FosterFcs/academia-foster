-- Certificado de Conclusão: um certificado só, juntando as disciplinas aprovadas (mínimo 5), com a carga somada (4 h cada).
-- Preço por faixa (acad_config 'conclusao'), pago com Pix próprio (não usa créditos).
-- O pedido de pagamento fica em acad_compras com pacote='conclusao' e a coluna certificado apontando para o certificado;
-- quando o Pix cai (asaas-webhook → acad_confirmar_interno) ou o instrutor confirma, o certificado sai.
-- Os certificados individuais e os créditos continuam como antes.

alter table public.acad_certificados add column if not exists modulos jsonb;
alter table public.acad_compras add column if not exists certificado text;

drop index if exists public.acad_cert_um_ativo;
create unique index acad_cert_um_ativo on public.acad_certificados(user_id, modulo) where status <> 'cancelado' and modulo <> 'conclusao';

insert into public.acad_config(chave,valor) values
  ('conclusao','{"minimo":5,"faixas":[{"min":5,"valor":24.90},{"min":10,"valor":34.90},{"min":20,"valor":49.90}]}')
  on conflict (chave) do update set valor=excluded.valor;
update public.acad_config set valor=replace(valor,'"nome":"Todas as disciplinas"','"nome":"20 certificados"') where chave='pacotes';

-- Créditos: pedidos do certificado de conclusão não entram no saldo
create or replace function public.acad_saldo_de(u uuid) returns int language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce((select sum(creditos) from public.acad_compras where user_id=u and status='pago' and certificado is null),0)::int
       - (select count(*) from public.acad_certificados where user_id=u and usou_credito)::int
$$;

create or replace function public.acad_emitir_pendentes(u uuid) returns int language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare c record; n int:=0;
begin
  for c in select codigo from public.acad_certificados where user_id=u and status='pendente' and modulo<>'conclusao' order by solicitado_em for update loop
    exit when public.acad_saldo_de(u)<=0;
    update public.acad_certificados set status='emitido', emitido_em=now(), usou_credito=true where codigo=c.codigo;
    n:=n+1;
  end loop;
  return n;
end $$;

create or replace function public.acad_confirmar_interno(p_codigo text, p_valor numeric default null) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare r public.acad_compras; n int;
begin
  select * into r from public.acad_compras where codigo=upper(btrim(p_codigo)) for update;
  if not found then return jsonb_build_object('status','nao_encontrado'); end if;
  if r.status='pago' then return jsonb_build_object('status','ja_pago','codigo',r.codigo); end if;
  if p_valor is not null and p_valor + 0.01 < r.valor then return jsonb_build_object('status','valor_menor','esperado',r.valor); end if;
  update public.acad_compras set status='pago', pago_em=now() where codigo=r.codigo;
  if r.certificado is not null then
    update public.acad_certificados set status='emitido', emitido_em=now() where codigo=r.certificado and status='pendente';
    get diagnostics n = row_count;
  else
    n:=public.acad_emitir_pendentes(r.user_id);
  end if;
  return jsonb_build_object('status','ativado','codigo',r.codigo,'emitidos',n,'saldo',public.acad_saldo_de(r.user_id));
end $$;

create or replace function public.acad_admin_compra(p_codigo text, p_acao text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare r public.acad_compras; x jsonb;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  if p_acao not in ('confirmar','cancelar') then raise exception 'acao_invalida' using errcode='22023'; end if;
  select * into r from public.acad_compras where codigo=p_codigo and status='pendente';
  if not found then raise exception 'compra_nao_pendente' using errcode='22023'; end if;
  if p_acao='cancelar' then
    update public.acad_compras set status='cancelado' where codigo=r.codigo;
    return jsonb_build_object('codigo',r.codigo,'status','cancelado','emitidos',0,'saldo',public.acad_saldo_de(r.user_id));
  end if;
  x:=public.acad_confirmar_interno(r.codigo);
  return jsonb_build_object('codigo',r.codigo,'status','pago','emitidos',coalesce((x->>'emitidos')::int,0),'saldo',public.acad_saldo_de(r.user_id));
end $$;

-- Pacotes de créditos: trocar de pacote não mexe no pedido do certificado de conclusão
create or replace function public.acad_comprar_pacote(p_pacote text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); pk jsonb; cod text; r public.acad_compras;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select x into pk from jsonb_array_elements(coalesce(public.acad_cfg('pacotes'),'[]')::jsonb) x where x->>'id'=p_pacote;
  if pk is null then raise exception 'pacote_invalido' using errcode='22023'; end if;
  update public.acad_compras set status='cancelado' where user_id=u and status='pendente' and certificado is null;
  cod:=public.acad_codigo('PK');
  insert into public.acad_compras(codigo,user_id,pacote,creditos,valor) values(cod,u,p_pacote,(pk->>'creditos')::int,(pk->>'valor')::numeric) returning * into r;
  return jsonb_build_object('codigo',r.codigo,'pacote',r.pacote,'creditos',r.creditos,'valor',r.valor);
end $$;

create or replace function public.acad_carteira() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); p record;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  select * into p from public.acad_compras where user_id=u and status='pendente' and certificado is null order by solicitado_em desc limit 1;
  return jsonb_build_object('saldo',public.acad_saldo_de(u),
    'aguardando',(select count(*) from public.acad_certificados where user_id=u and status='pendente' and modulo<>'conclusao'),
    'compra',case when p.codigo is null then null else jsonb_build_object('codigo',p.codigo,'pacote',p.pacote,'creditos',p.creditos,'valor',p.valor,'solicitado_em',p.solicitado_em) end,
    'pacotes',coalesce(public.acad_cfg('pacotes'),'[]')::jsonb,
    'pix',jsonb_build_object('chave',public.acad_cfg('pix_chave'),'nome',public.acad_cfg('pix_nome'),'cidade',public.acad_cfg('pix_cidade')),
    'contato',public.acad_cfg('contato'));
end $$;

-- Disciplinas aprovadas do aluno (melhor nota de cada uma)
create or replace function public.acad_aprovadas_de(u uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(jsonb_build_object('modulo',modulo,'nota',nota) order by modulo),'[]'::jsonb)
  from (select modulo, max(acertos) nota from public.acad_tentativas where user_id=u and aprovada group by modulo) a
$$;

create or replace function public.acad_conclusao_valor(n int) returns numeric language sql stable security definer set search_path=public,pg_temp as $$
  select (f->>'valor')::numeric from jsonb_array_elements(coalesce(public.acad_cfg('conclusao'),'{}')::jsonb->'faixas') f
  where (f->>'min')::int <= n order by (f->>'min')::int desc limit 1
$$;

-- Situação do certificado de conclusão para a tela do aluno
create or replace function public.acad_conclusao() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); ap jsonb; n int; cfg jsonb:=coalesce(public.acad_cfg('conclusao'),'{}')::jsonb; c public.acad_certificados; p public.acad_compras;
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  ap:=public.acad_aprovadas_de(u); n:=jsonb_array_length(ap);
  select * into c from public.acad_certificados where user_id=u and modulo='conclusao' and status='pendente' order by solicitado_em desc limit 1;
  if c.codigo is not null then select * into p from public.acad_compras where certificado=c.codigo and status='pendente' order by solicitado_em desc limit 1; end if;
  return jsonb_build_object('minimo',coalesce((cfg->>'minimo')::int,5),'faixas',cfg->'faixas','aprovadas',ap,'n',n,'carga',4*n,
    'valor',public.acad_conclusao_valor(n),
    'pendente',case when c.codigo is null then null else jsonb_build_object('codigo',c.codigo,'nome',c.nome,'n',jsonb_array_length(c.modulos),'carga',c.carga,'valor',c.valor,
       'compra',case when p.codigo is null then null else jsonb_build_object('codigo',p.codigo,'valor',p.valor) end) end,
    'emitidos',(select coalesce(jsonb_agg(jsonb_build_object('codigo',codigo,'n',jsonb_array_length(modulos),'carga',carga,'emitido_em',emitido_em) order by emitido_em desc),'[]'::jsonb)
       from public.acad_certificados where user_id=u and modulo='conclusao' and status='emitido'),
    'pix',jsonb_build_object('chave',public.acad_cfg('pix_chave'),'nome',public.acad_cfg('pix_nome'),'cidade',public.acad_cfg('pix_cidade')),
    'contato',public.acad_cfg('contato'));
end $$;

-- Pede o certificado de conclusão com todas as disciplinas aprovadas até agora e gera o pedido de pagamento
create or replace function public.acad_solicitar_conclusao(p_nome text, p_cpf text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid(); ap jsonb; n int; mn int; v numeric; c public.acad_certificados; cod text; pc text;
  v_cpf text:=regexp_replace(coalesce(p_cpf,''),'\D','','g'); v_nome text:=btrim(regexp_replace(coalesce(p_nome,''),'\s+',' ','g'));
begin
  if u is null then raise exception 'login_necessario' using errcode='28000'; end if;
  if char_length(v_nome)<5 or char_length(v_nome)>120 or v_nome !~ ' ' then raise exception 'nome_invalido' using errcode='22023'; end if;
  if not public.acad_cpf_valido(v_cpf) then raise exception 'cpf_invalido' using errcode='22023'; end if;
  ap:=public.acad_aprovadas_de(u); n:=jsonb_array_length(ap);
  mn:=coalesce((coalesce(public.acad_cfg('conclusao'),'{}')::jsonb->>'minimo')::int,5);
  if n<mn then raise exception 'poucas_disciplinas' using errcode='22023'; end if;
  v:=public.acad_conclusao_valor(n);
  select * into c from public.acad_certificados where user_id=u and modulo='conclusao' and status='pendente' for update;
  if found then
    update public.acad_certificados set nome=v_nome, cpf=v_cpf, modulos=ap, carga=4*n, valor=v,
      nota=round((select avg((x->>'nota')::numeric) from jsonb_array_elements(ap) x))::int where codigo=c.codigo;
    cod:=c.codigo;
  else
    cod:=public.acad_codigo('AF');
    insert into public.acad_certificados(codigo,user_id,modulo,nome,cpf,nota,carga,valor,modulos)
      values(cod,u,'conclusao',v_nome,v_cpf,round((select avg((x->>'nota')::numeric) from jsonb_array_elements(ap) x))::int,4*n,v,ap);
  end if;
  update public.acad_compras set status='cancelado' where certificado=cod and status='pendente';
  pc:=public.acad_codigo('PC');
  insert into public.acad_compras(codigo,user_id,pacote,creditos,valor,certificado) values(pc,u,'conclusao',1,v,cod);
  return jsonb_build_object('codigo',cod,'compra',pc,'valor',v,'n',n,'carga',4*n);
end $$;

-- Validação pública e lista do aluno passam a mostrar as disciplinas do certificado de conclusão
create or replace function public.acad_validar(p_codigo text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select jsonb_build_object('codigo',codigo,'modulo',modulo,'modulos',modulos,'nome',nome,'cpf','***.'||substr(cpf,4,3)||'.'||substr(cpf,7,3)||'-**','nota',nota,'carga',carga,'emitido_em',emitido_em)
  from public.acad_certificados where codigo=upper(btrim(p_codigo)) and status='emitido'
$$;
create or replace function public.acad_meus_certificados() returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(jsonb_build_object('codigo',codigo,'modulo',modulo,'status',status,'nota',nota,'valor',valor,'carga',carga,
      'n',case when modulos is null then null else jsonb_array_length(modulos) end,'solicitado_em',solicitado_em,'emitido_em',emitido_em) order by solicitado_em desc),'[]'::jsonb)
  from public.acad_certificados where user_id=auth.uid() and status<>'cancelado'
$$;

revoke all on function public.acad_aprovadas_de(uuid), public.acad_conclusao_valor(int), public.acad_conclusao(), public.acad_solicitar_conclusao(text,text),
  public.acad_confirmar_interno(text,numeric) from public, anon, authenticated;
grant execute on function public.acad_conclusao(), public.acad_solicitar_conclusao(text,text) to authenticated;
