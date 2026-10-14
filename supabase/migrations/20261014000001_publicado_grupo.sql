-- =====================================================================
-- Pedido publicado no grupo das diaristas
--
-- A dona publica o pedido novo no grupo do WhatsApp (o site abre a conversa
-- com o texto pronto). Esta coluna guarda QUANDO ela publicou, para o pedido
-- sair da fila "Publicar no grupo" do painel admin. Só a função abaixo (e só
-- a admin) escreve nela: a tabela pedidos não aceita escrita direta do app.
-- =====================================================================

alter table public.pedidos add column publicado_grupo_em timestamptz;

create function public.marcar_publicado_grupo(p_pedido_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  pedido public.pedidos;
begin
  if not public.eh_admin() then
    raise exception 'Somente a admin pode publicar pedidos no grupo.' using errcode = '42501';
  end if;

  select * into pedido from public.pedidos where pedidos.id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;

  -- Só faz sentido publicar vaga que ainda aceita diaristas
  if pedido.status not in ('aberta', 'candidatura_recebida') then
    raise exception 'Este pedido não está mais aberto para vagas (status: %).', pedido.status
      using errcode = '22023';
  end if;

  update public.pedidos
  set publicado_grupo_em = now(), updated_at = now()
  where pedidos.id = p_pedido_id;
end;
$$;

revoke execute on function public.marcar_publicado_grupo(uuid) from public, anon;
grant execute on function public.marcar_publicado_grupo(uuid) to authenticated;
