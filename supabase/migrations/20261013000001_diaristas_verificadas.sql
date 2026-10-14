-- =====================================================================
-- Diarista verificada
--
-- A dona confere a referência e a experiência da diarista e só então
-- libera o grupo do WhatsApp. A marcação fica numa tabela própria, e não
-- em diaristas_privado, porque a diarista edita a própria linha de lá:
-- aqui só a função verificar_diarista (e só a admin) escreve.
--   - existe linha = verificada; apagar a linha = remover a verificação
--   - a diarista lê só a própria linha; a admin lê todas
-- =====================================================================

create table public.diaristas_verificadas (
  diarista_id   uuid primary key references public.profiles (id) on delete cascade,
  verificada_em timestamptz not null default now(),
  verificada_por uuid references public.profiles (id) on delete set null
);

alter table public.diaristas_verificadas enable row level security;

create policy "diaristas_verificadas: ver" on public.diaristas_verificadas
for select to authenticated
using (diarista_id = (select auth.uid()) or (select public.eh_admin()));

-- Escrita só pela função abaixo
revoke insert, update, delete, truncate on public.diaristas_verificadas from anon, authenticated;

create function public.verificar_diarista(p_diarista_id uuid, p_verificada boolean)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Somente a admin pode verificar diaristas.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
    where profiles.id = p_diarista_id and profiles.papel = 'diarista'
  ) then
    raise exception 'Diarista não encontrada.' using errcode = 'P0002';
  end if;

  if p_verificada then
    insert into public.diaristas_verificadas (diarista_id, verificada_por)
    values (p_diarista_id, auth.uid())
    on conflict (diarista_id) do nothing;
  else
    delete from public.diaristas_verificadas where diaristas_verificadas.diarista_id = p_diarista_id;
  end if;
end;
$$;

revoke execute on function public.verificar_diarista(uuid, boolean) from public, anon;
grant execute on function public.verificar_diarista(uuid, boolean) to authenticated;
