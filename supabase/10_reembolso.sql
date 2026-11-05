-- Reembolso (arrependimento de 7 dias, CDC art. 49): o instrutor marca o pedido pago como reembolsado.
-- Os créditos devolvidos saem do saldo; os certificados que dependiam deles são cancelados (os mais recentes primeiro).

alter table public.acad_compras drop constraint if exists acad_compras_status_check;
alter table public.acad_compras add constraint acad_compras_status_check check (status in ('pendente','pago','cancelado','reembolsado'));
alter table public.acad_compras add column if not exists reembolsado_em timestamptz;

create or replace function public.acad_admin_reembolsar(p_codigo text) returns jsonb language plpgsql volatile security definer set search_path=public,pg_temp as $$
declare r public.acad_compras; c record; n int:=0; a public.acad_certificados;
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  select * into r from public.acad_compras where codigo=upper(btrim(p_codigo)) for update;
  if not found or r.status<>'pago' then raise exception 'compra_nao_paga' using errcode='22023'; end if;
  update public.acad_compras set status='reembolsado', reembolsado_em=now() where codigo=r.codigo;
  if r.certificado is not null then
    for c in select * from public.acad_certificados where codigo=r.certificado and status<>'cancelado' for update loop
      select * into a from public.acad_certificados where codigo=c.codigo;
      update public.acad_certificados set status='cancelado' where codigo=c.codigo;
      insert into public.acad_cert_historico(codigo,admin,acao,antes,depois) values(c.codigo,lower(auth.jwt()->>'email'),'reembolso '||r.codigo,
        public.acad_cert_json(a),public.acad_cert_json((select x from public.acad_certificados x where x.codigo=c.codigo)));
      n:=n+1;
    end loop;
  else
    for c in select * from public.acad_certificados where user_id=r.user_id and usou_credito and status='emitido' order by emitido_em desc for update loop
      exit when public.acad_saldo_de(r.user_id)>=0;
      select * into a from public.acad_certificados where codigo=c.codigo;
      update public.acad_certificados set status='cancelado', usou_credito=false where codigo=c.codigo;
      insert into public.acad_cert_historico(codigo,admin,acao,antes,depois) values(c.codigo,lower(auth.jwt()->>'email'),'reembolso '||r.codigo,
        public.acad_cert_json(a),public.acad_cert_json((select x from public.acad_certificados x where x.codigo=c.codigo)));
      n:=n+1;
    end loop;
  end if;
  return jsonb_build_object('codigo',r.codigo,'status','reembolsado','cancelados',n,'saldo',public.acad_saldo_de(r.user_id));
end $$;

revoke all on function public.acad_admin_reembolsar(text) from public, anon, authenticated;
grant execute on function public.acad_admin_reembolsar(text) to authenticated;
