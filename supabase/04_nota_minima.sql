-- 02/11/2026: nota mínima da prova de certificação baixou de 7 para 6 acertos (de 10).
-- A nota mínima fica em acad_config ('nota_minima'); acad_enviar_prova lê de lá (padrão 6).
-- Provas já enviadas no prazo com 6 acertos foram marcadas como aprovadas.
insert into public.acad_config(chave, valor) values ('nota_minima','6')
  on conflict (chave) do update set valor = excluded.valor;
update public.acad_tentativas set aprovada = true where enviada is not null and not aprovada and acertos >= 6;
