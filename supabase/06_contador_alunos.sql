-- Contador de alunos da Academia: cada conta entra UMA vez, na primeira vez que usa a Academia
-- (sincronizou o progresso ou fez uma prova). Fazer login de novo não conta como aluno novo.
create table if not exists public.acad_alunos(
  user_id uuid primary key,
  primeiro_acesso timestamptz not null default now()
);
alter table public.acad_alunos enable row level security;
revoke all on public.acad_alunos from anon, authenticated;

create or replace function public.acad_registrar_aluno() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if new.user_id is not null then
    insert into public.acad_alunos(user_id) values (new.user_id) on conflict (user_id) do nothing;
  end if;
  return new;
end $$;
revoke all on function public.acad_registrar_aluno() from public, anon, authenticated;

do $$ begin
  if to_regclass('public.acad_dados') is not null then
    drop trigger if exists acad_dados_aluno on public.acad_dados;
    create trigger acad_dados_aluno after insert on public.acad_dados for each row execute function public.acad_registrar_aluno();
    -- quem já usava a Academia: data de criação da conta (ou o registro mais antigo)
    insert into public.acad_alunos(user_id, primeiro_acesso)
      select d.user_id, least(coalesce(min(u.created_at), min(d.atualizado_em)), min(d.atualizado_em))
      from public.acad_dados d left join auth.users u on u.id=d.user_id group by d.user_id
      on conflict (user_id) do nothing;
  end if;
end $$;
drop trigger if exists acad_tentativas_aluno on public.acad_tentativas;
create trigger acad_tentativas_aluno after insert on public.acad_tentativas for each row execute function public.acad_registrar_aluno();
insert into public.acad_alunos(user_id, primeiro_acesso)
  select user_id, min(iniciada) from public.acad_tentativas group by user_id
  on conflict (user_id) do nothing;

-- Resumo para o painel do instrutor. As contas de instrutor ficam fora das contagens de alunos.
create or replace function public.acad_admin_resumo() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare hoje timestamptz := date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
begin
  if not public.acad_eh_admin() then raise exception 'sem_permissao' using errcode='42501'; end if;
  return (with al as (
      select a.user_id, a.primeiro_acesso from public.acad_alunos a left join auth.users u on u.id=a.user_id
      where lower(coalesce(u.email,'')) not in (select email from public.acad_admins)),
    ce as (select * from public.acad_certificados where status='emitido')
    select jsonb_build_object(
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
                 'novos', (select count(*) from al where primeiro_acesso >= d and primeiro_acesso < d + interval '1 day'),
                 'certs', (select count(*) from ce where emitido_em >= d and emitido_em < d + interval '1 day')) order by d), '[]'::jsonb)
               from generate_series(hoje - interval '13 days', hoje, interval '1 day') d)));
end $$;
revoke all on function public.acad_admin_resumo() from public, anon, authenticated;
grant execute on function public.acad_admin_resumo() to authenticated;
