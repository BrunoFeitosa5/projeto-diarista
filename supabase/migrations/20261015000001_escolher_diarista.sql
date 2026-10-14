-- =====================================================================
-- Escolher a diarista direto no pedido + candidatura só para verificadas
--
-- 1) candidatar(): além do perfil completo, a diarista precisa estar
--    verificada pela admin (tabela diaristas_verificadas).
-- 2) escolher_diarista(): a admin escolhe uma diarista verificada para o
--    pedido sem depender de candidatura pelo site (a diarista pode ter
--    chamado a Império no WhatsApp). Faz o mesmo que aprovar_candidatura:
--    pedido vira "aprovada", a candidatura dela fica "aprovada" e as outras
--    "recusadas". Só entra diarista verificada e com CPF e Pix.
-- =====================================================================

-- "create or replace" mantém as permissões de execução já definidas
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

  if not exists (select 1 from public.diaristas_verificadas v where v.diarista_id = eu) then
    raise exception 'Seu cadastro ainda não foi verificado pela Império.' using errcode = '42501';
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

create function public.escolher_diarista(p_pedido_id uuid, p_diarista_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  pedido public.pedidos;
begin
  if not public.eh_admin() then
    raise exception 'Somente a admin pode escolher a diarista.' using errcode = '42501';
  end if;

  select * into pedido from public.pedidos where pedidos.id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;
  if pedido.status not in ('aberta', 'candidatura_recebida') then
    raise exception 'Este pedido não está aguardando diarista (status: %).', pedido.status
      using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.profiles where profiles.id = p_diarista_id and profiles.papel = 'diarista'
  ) then
    raise exception 'Diarista não encontrada.' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.diaristas_verificadas v where v.diarista_id = p_diarista_id) then
    raise exception 'Esta diarista ainda não foi verificada.' using errcode = '22023';
  end if;

  -- A mensagem de aprovação e o repasse dependem do CPF e do Pix
  if not exists (
    select 1 from public.diaristas_privado d
    where d.diarista_id = p_diarista_id and d.cpf is not null and d.chave_pix is not null
  ) then
    raise exception 'Esta diarista ainda não completou o perfil (CPF e chave Pix).' using errcode = '22023';
  end if;

  insert into public.candidaturas (pedido_id, diarista_id)
  values (p_pedido_id, p_diarista_id)
  on conflict (pedido_id, diarista_id) do nothing;

  update public.candidaturas
  set status = case when candidaturas.diarista_id = p_diarista_id
                    then 'aprovada'::public.status_candidatura
                    else 'recusada'::public.status_candidatura end
  where candidaturas.pedido_id = p_pedido_id;

  -- O gatilho de status não deixa pular "aberta" -> "aprovada": passa pela etapa
  -- intermediária (as duas mudanças ficam no histórico)
  if pedido.status = 'aberta' then
    update public.pedidos set status = 'candidatura_recebida' where pedidos.id = p_pedido_id;
  end if;

  update public.pedidos
  set diarista_id = p_diarista_id, status = 'aprovada'
  where pedidos.id = p_pedido_id;
end;
$$;

revoke execute on function public.escolher_diarista(uuid, uuid) from public, anon;
grant execute on function public.escolher_diarista(uuid, uuid) to authenticated;
