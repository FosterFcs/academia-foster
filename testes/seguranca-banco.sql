-- Teste de segurança da Academia no Supabase (projeto foster-calc).
-- Cole no SQL Editor e clique em Run. Ele termina com uma mensagem de erro
-- "RESULTADO: ..." de propósito: o erro desfaz tudo, então nada fica gravado.
-- O esperado é ver "bloqueado" nos itens 6, 7, 8 e 9, "0" nos itens 3, 4 e 5 e "true" no item 10.
do $$
declare a uuid; b uuid; r text := ''; n int; ok boolean;
begin
  select id into a from auth.users order by created_at limit 1;
  select id into b from auth.users where id<>a order by created_at limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub',b,'role','authenticated')::text, true);
  set local role authenticated;
  insert into public.acad_dados(user_id,chave,dados) values (b,'progresso','{"rm":{"0":1}}');
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  insert into public.acad_dados(user_id,chave,dados) values (a,'progresso','{"is":{"0":2}}');
  r := r || '1) aluno A grava o próprio: ok | ';
  select count(*) into n from public.acad_dados; r := r || '2) A enxerga ' || n || ' linha(s) | ';
  select count(*) into n from public.acad_dados where user_id=b; r := r || '3) A enxerga de B: ' || n || ' | ';
  update public.acad_dados set dados='{"hack":1}' where user_id=b; get diagnostics n = row_count; r := r || '4) A altera B: ' || n || ' | ';
  delete from public.acad_dados where user_id=b; get diagnostics n = row_count; r := r || '5) A apaga B: ' || n || ' | ';
  begin insert into public.acad_dados(user_id,chave,dados) values (b,'sig','{}'); r := r || '6) A grava como B: PERMITIDO (FALHA) | ';
  exception when insufficient_privilege or check_violation then r := r || '6) A grava como B: bloqueado | '; end;
  begin insert into public.acad_dados(user_id,chave,dados) values (a,'outra','{}'); r := r || '7) chave inválida: aceita (FALHA) | ';
  exception when check_violation then r := r || '7) chave inválida: bloqueada | '; end;
  begin update public.acad_dados set user_id=b where user_id=a; r := r || '8) transferir para B: PERMITIDO (FALHA) | ';
  exception when insufficient_privilege or check_violation then r := r || '8) transferir para B: bloqueado | '; end;
  reset role;
  set local role anon;
  begin select count(*) into n from public.acad_dados; r := r || '9) sem login lê: ' || n || ' (FALHA) | ';
  exception when insufficient_privilege then r := r || '9) sem login: bloqueado | '; end;
  reset role;
  select (dados->'rm'->>'0') = '1' into ok from public.acad_dados where user_id=b and chave='progresso'; r := r || '10) dados de B intactos: ' || coalesce(ok::text,'não');
  raise exception 'RESULTADO: %', r;
end $$;
