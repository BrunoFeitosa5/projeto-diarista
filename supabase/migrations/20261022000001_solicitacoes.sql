-- =====================================================================
-- Solicitações: número do pedido gerado no clique de "Contratar serviço"
--
-- O cliente não tem conta: ele preenche o formulário do site e o servidor pede
-- aqui o próximo código (IMP-000123), que vai escrito na mensagem do WhatsApp
-- para a dona. A tabela guarda só um registro simples de cada solicitação
-- (histórico e backup): NUNCA telefone, nome nem endereço.
--
-- Usa a MESMA sequence dos pedidos, então um código nunca se repete, nem se a
-- dona criar um pedido pelo painel depois.
-- =====================================================================

create table public.solicitacoes (
  id           uuid primary key default gen_random_uuid(),
  numero       bigint not null unique default nextval('public.pedidos_numero_seq'),
  codigo       text generated always as ('IMP-' || lpad(numero::text, 6, '0')) stored unique,
  plano        text check (plano in ('4h', '6h', '8h')),
  data         date,
  horario      text,
  bairro_cidade text not null,
  tipo         text,
  -- Hash do IP (calculado no servidor), só para limitar abuso; não identifica ninguém
  ip_hash      text,
  created_at   timestamptz not null default now()
);

create index solicitacoes_ip_recente on public.solicitacoes (ip_hash, created_at);

alter table public.solicitacoes enable row level security;

-- Só a admin lê; ninguém escreve direto (só a função abaixo)
create policy solicitacoes_admin_le on public.solicitacoes
  for select to authenticated
  using (public.eh_admin());

revoke all on public.solicitacoes from anon, authenticated;
grant select on public.solicitacoes to authenticated;

-- Limite: 5 solicitações por hora por IP (o texto do erro vai para o servidor)
create function public.solicitar_codigo(
  p_plano         text,
  p_data          date,
  p_horario       text,
  p_bairro_cidade text,
  p_tipo          text,
  p_ip_hash       text
)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  novo public.solicitacoes;
begin
  if length(trim(coalesce(p_bairro_cidade, ''))) < 3 then
    raise exception 'Informe o bairro e a cidade.' using errcode = '22023';
  end if;
  if p_data is not null and p_data < current_date then
    raise exception 'A data não pode estar no passado.' using errcode = '22023';
  end if;

  if p_ip_hash is not null and (
    select count(*) from public.solicitacoes s
    where s.ip_hash = p_ip_hash and s.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Muitas solicitações. Tente de novo mais tarde.' using errcode = '53400';
  end if;

  insert into public.solicitacoes (plano, data, horario, bairro_cidade, tipo, ip_hash)
  values (
    nullif(p_plano, ''), p_data, nullif(left(trim(p_horario), 20), ''),
    left(trim(p_bairro_cidade), 120), nullif(left(trim(p_tipo), 60), ''), p_ip_hash
  )
  returning * into novo;

  return novo.codigo;
end;
$$;

revoke execute on function public.solicitar_codigo(text, date, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.solicitar_codigo(text, date, text, text, text, text)
  to service_role;
