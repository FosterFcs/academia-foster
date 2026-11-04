-- Contador de visitantes da Academia: cada aparelho que abre o app é registrado uma vez (sem conta, sem dados pessoais).
-- O número só aparece no painel do instrutor.
create table if not exists public.acad_visitantes(id uuid primary key, criado_em timestamptz not null default now());
alter table public.acad_visitantes enable row level security;
revoke all on public.acad_visitantes from anon, authenticated;
create or replace function public.acad_visita(p_id uuid) returns void language sql volatile security definer set search_path=public,pg_temp as $$
  insert into public.acad_visitantes(id) values (p_id) on conflict (id) do nothing;
$$;
revoke all on function public.acad_visita(uuid) from public;
grant execute on function public.acad_visita(uuid) to anon, authenticated;

-- Resumo para o painel do instrutor. As contas de instrutor ficam fora das contagens de alunos.
create or replace function public.acad_admin_resumo() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare hoje timestamptz := date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (with al as (
      select a.user_id, a.primeiro_acesso from public.acad_alunos a left join auth.users u on u.id=a.user_id
      where lower(coalesce(u.email,'')) not in (select email from public.acad_admins)),
    ce as (select * from public.acad_certificados where status='emitido'),
    vi as (select * from public.acad_visitantes)
    select jsonb_build_object(
      'visitantes', (select count(*) from vi),
      'vis_hoje', (select count(*) from vi where criado_em >= hoje),
      'vis_7', (select count(*) from vi where criado_em >= hoje - interval '6 days'),
      'vis_30', (select count(*) from vi where criado_em >= hoje - interval '29 days'),
      'alunos', (select count(*) from al),
      'novos_hoje', (select count(*) from al where primeiro_acesso >= hoje),
      'novos_7', (select count(*) from al where primeiro_acesso >= hoje - interval '6 days'),
      'novos_30', (select count(*) from al where primeiro_acesso >= hoje - interval '29 days'),
      'certificados', (select count(*) from ce),
      'cert_hoje', (select count(*) from ce where emitido_em >= hoje),
      'cert_7', (select count(*) from ce where emitido_em >= hoje - interval '6 days'),
      'provas', (select count(*) from public.acad_tentativas where enviada is not null),
      'aprovadas', (select count(*) from public.acad_tentativas where aprovada),
      'dias', (select coalesce(jsonb_agg(jsonb_build_object('dia', d::date,
                 'vis', (select count(*) from vi where criado_em >= d and criado_em < d + interval '1 day'),
                 'novos', (select count(*) from al where primeiro_acesso >= d and primeiro_acesso < d + interval '1 day'),
                 'certs', (select count(*) from ce where emitido_em >= d and emitido_em < d + interval '1 day')) order by d), '[]'::jsonb)
               from generate_series(hoje - interval '13 days', hoje, interval '1 day') d)));
end $$;
revoke all on function public.acad_admin_resumo() from public, anon, authenticated;
grant execute on function public.acad_admin_resumo() to authenticated;
