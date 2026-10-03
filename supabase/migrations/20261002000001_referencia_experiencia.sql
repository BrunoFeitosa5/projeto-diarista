-- =====================================================================
-- Referência e experiência da diarista (preenchidas no perfil, uma vez só)
--
-- Ficam em diaristas_privado, que já é protegida pelo RLS: só a própria
-- diarista e a admin leem. O telefone da referência é de outra pessoa
-- (dado pessoal pela LGPD), por isso não vai para profiles.
--   - referencia_nome e referencia_telefone: opcionais
--   - experiencia: obrigatória para se candidatar (até 500 caracteres)
-- =====================================================================

alter table public.diaristas_privado
  add column referencia_nome     text check (char_length(referencia_nome) between 2 and 100),
  -- Só os dígitos, com DDD (10 ou 11 números)
  add column referencia_telefone text check (referencia_telefone ~ '^[0-9]{10,11}$'),
  add column experiencia         text check (char_length(experiencia) between 20 and 500);

-- Nome e telefone da referência andam juntos: ou os dois, ou nenhum
alter table public.diaristas_privado
  add constraint referencia_completa
  check ((referencia_nome is null) = (referencia_telefone is null));

-- Candidatura passa a exigir também a experiência. "create or replace"
-- mantém as permissões de execução definidas na primeira migração.
create or replace function public.candidatar(p_pedido_id uuid)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  eu     uuid := auth.uid();
  pedido public.pedidos;
begin
  if eu is null or public.meu_papel() is distinct from 'diarista' then
    raise exception 'Somente diaristas podem se candidatar.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.diaristas_privado d
    where d.diarista_id = eu
      and d.cpf is not null
      and d.chave_pix is not null
      and d.experiencia is not null
  ) then
    raise exception 'Complete seu perfil (CPF, chave Pix e experiência) antes de se candidatar.'
      using errcode = '22023';
  end if;

  -- Trava o pedido para evitar duas mudanças de status ao mesmo tempo
  select * into pedido from public.pedidos where pedidos.id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;
  if pedido.status not in ('aberta', 'candidatura_recebida') then
    raise exception 'Esta vaga não está mais aberta.' using errcode = '22023';
  end if;

  insert into public.candidaturas (pedido_id, diarista_id)
  values (p_pedido_id, eu)
  on conflict (pedido_id, diarista_id) do nothing;

  if pedido.status = 'aberta' then
    update public.pedidos set status = 'candidatura_recebida' where pedidos.id = p_pedido_id;
  end if;

  return pedido.codigo;
end;
$$;
