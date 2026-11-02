-- Pix automático pela central de pagamentos Foster (Asaas). Aplicado no projeto foster-calc em 02/11/2026.
-- Fluxo: o app cria o pedido (acad_comprar_pacote / orca_assinar) → função asaas-cobrar gera a cobrança Pix
-- com externalReference "academia:<codigo>" ou "fosterorca:<codigo>" → função asaas-webhook confirma o pedido
-- chamando acad_confirmar_interno / orca_confirmar_interno (só service_role pode chamar).
-- O código completo das funções está em FosterFcs/foster-orca/supabase/functions/asaas-cobrar e asaas-webhook.

create table if not exists public.asaas_clientes(
  user_id uuid primary key references auth.users(id) on delete cascade,
  cliente_id text not null,
  cpf text not null check (cpf ~ '^[0-9]{11}$'),
  criado_em timestamptz not null default now());
alter table public.asaas_clientes enable row level security;
revoke all on public.asaas_clientes from anon, authenticated;

alter table public.orca_pagamentos add column if not exists asaas_id text, add column if not exists asaas_url text;
alter table public.acad_compras   add column if not exists asaas_id text, add column if not exists asaas_url text;

-- acad_confirmar_interno(p_codigo, p_valor): marca o pacote como pago (aceita pendente ou trocado),
--   recusa valor menor, ignora repetição e emite os certificados pendentes.
-- acad_admin_compra passou a usar acad_confirmar_interno ao confirmar.
-- orca_confirmar_interno(p_codigo, p_valor): mesma regra para a assinatura do Foster Orça;
-- orca_admin_decidir passou a usá-la ao confirmar.
-- (definições completas: supabase_migrations "asaas_central_orca_academia")
