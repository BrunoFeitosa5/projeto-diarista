-- =====================================================================
-- Império Diarista — estrutura inicial do banco
-- Tabelas, número do pedido (IMP-000123), gatilhos, RLS e funções (RPC).
--
-- Como aplicar: Supabase > SQL Editor > colar este arquivo inteiro > Run.
-- Depois, para tornar a dona admin, use supabase/tornar-admin.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------------------
create type public.papel as enum ('cliente', 'diarista', 'admin');

create type public.status_pedido as enum (
  'aberta', 'candidatura_recebida', 'aprovada', 'confirmada', 'paga', 'concluida', 'cancelada'
);

create type public.status_candidatura as enum ('pendente', 'aprovada', 'recusada');

-- ---------------------------------------------------------------------
-- 2. Tabelas
-- ---------------------------------------------------------------------

-- Perfil público de cada usuário (1 para 1 com auth.users)
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null default '',
  telefone   text,
  papel      public.papel not null default 'cliente',
  created_at timestamptz not null default now()
);

-- Dados sensíveis da diarista: só ela e a admin leem
create table public.diaristas_privado (
  diarista_id     uuid primary key references public.profiles (id) on delete cascade,
  cpf             text,
  cnpj            text,
  data_nascimento date,
  chave_pix       text,
  tipo_chave_pix  text check (tipo_chave_pix in ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  updated_at      timestamptz not null default now()
);

-- Número sequencial do pedido; o código IMP-000123 é derivado dele
create sequence public.pedidos_numero_seq;

create table public.pedidos (
  id             uuid primary key default gen_random_uuid(),
  numero         bigint not null unique default nextval('public.pedidos_numero_seq'),
  codigo         text generated always as ('IMP-' || lpad(numero::text, 6, '0')) stored unique,
  cliente_id     uuid not null references public.profiles (id),
  plano          text not null check (plano in ('4h', '6h', '8h')),
  -- Copiados de src/config/planos.ts no momento da criação (nunca do formulário)
  valor_cliente  numeric(10, 2) not null check (valor_cliente > 0),
  valor_diarista numeric(10, 2) not null check (valor_diarista >= 0),
  data           date not null,
  horario        time not null,
  -- Só bairro e cidade: é o que as diaristas veem na lista de vagas
  bairro         text not null,
  cidade         text not null,
  observacoes    text,
  status         public.status_pedido not null default 'aberta',
  -- Preenchido quando a admin aprova uma candidatura
  diarista_id    uuid references public.profiles (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter sequence public.pedidos_numero_seq owned by public.pedidos.numero;

create index pedidos_cliente_idx on public.pedidos (cliente_id);
create index pedidos_status_idx on public.pedidos (status);
create index pedidos_diarista_idx on public.pedidos (diarista_id);

-- Endereço completo em tabela separada: só cliente dono, admin e diarista aprovada
create table public.pedido_enderecos (
  pedido_id   uuid primary key references public.pedidos (id) on delete cascade,
  cep         text not null,
  rua         text not null,
  numero      text not null,
  complemento text,
  referencia  text
);

create table public.candidaturas (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references public.pedidos (id) on delete cascade,
  diarista_id uuid not null references public.profiles (id),
  status      public.status_candidatura not null default 'pendente',
  created_at  timestamptz not null default now(),
  unique (pedido_id, diarista_id)
);

create index candidaturas_diarista_idx on public.candidaturas (diarista_id);

create table public.pedido_historico (
  id              bigint generated always as identity primary key,
  pedido_id       uuid not null references public.pedidos (id) on delete cascade,
  status_anterior public.status_pedido,
  status_novo     public.status_pedido not null,
  alterado_por    uuid,
  created_at      timestamptz not null default now()
);

create index pedido_historico_pedido_idx on public.pedido_historico (pedido_id);

-- ---------------------------------------------------------------------
-- 3. Funções auxiliares (usadas nas regras de RLS)
--    security definer: leem profiles sem cair na própria regra de RLS.
-- ---------------------------------------------------------------------
create function public.meu_papel()
returns public.papel
language sql stable security definer
set search_path = ''
as $$
  select papel from public.profiles where id = auth.uid()
$$;

create function public.eh_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce((select papel = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
-- 4. Gatilhos
-- ---------------------------------------------------------------------

-- 4.1 Cria o perfil quando alguém se cadastra. Só aceita cliente ou diarista:
--     ninguém vira admin pelo cadastro.
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  papel_pedido text := new.raw_user_meta_data ->> 'papel';
begin
  insert into public.profiles (id, nome, telefone, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.raw_user_meta_data ->> 'telefone',
    case when papel_pedido = 'diarista' then 'diarista'::public.papel
         else 'cliente'::public.papel end
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
after insert on auth.users
for each row execute function public.criar_perfil_novo_usuario();

-- 4.2 Impede que um usuário mude o próprio papel (ou o de outra pessoa) pelo app.
--     Só é permitido pelo SQL Editor / chave service_role (ex.: tornar a dona admin).
create function public.proteger_papel()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel
     and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'Não é permitido alterar o papel do usuário.' using errcode = '42501';
  end if;
  if new.id is distinct from old.id then
    raise exception 'Não é permitido alterar o id do perfil.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger proteger_papel
before update on public.profiles
for each row execute function public.proteger_papel();

-- 4.3 Só permite as mudanças de status previstas no fluxo.
create function public.validar_transicao_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if not (
    (old.status = 'aberta'               and new.status in ('candidatura_recebida', 'cancelada')) or
    (old.status = 'candidatura_recebida' and new.status in ('aprovada', 'cancelada')) or
    (old.status = 'aprovada'             and new.status in ('confirmada', 'cancelada')) or
    (old.status = 'confirmada'           and new.status in ('paga', 'cancelada')) or
    (old.status = 'paga'                 and new.status = 'concluida')
  ) then
    raise exception 'Mudança de status inválida: % -> %', old.status, new.status
      using errcode = '22023';
  end if;

  if new.status = 'aprovada' and new.diarista_id is null then
    raise exception 'Pedido aprovado precisa de uma diarista.' using errcode = '22023';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger validar_transicao_status
before update of status on public.pedidos
for each row execute function public.validar_transicao_status();

-- 4.4 Toda criação e mudança de status grava uma linha no histórico.
create function public.registrar_historico_status()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.pedido_historico (pedido_id, status_anterior, status_novo, alterado_por)
    values (new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.pedido_historico (pedido_id, status_anterior, status_novo, alterado_por)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger registrar_historico_status
after insert or update of status on public.pedidos
for each row execute function public.registrar_historico_status();

-- ---------------------------------------------------------------------
-- 5. RLS (Row Level Security): a defesa principal
--    Sem política = ninguém do app acessa. Tabelas sem política de
--    insert/update só mudam pelas funções da seção 6.
-- ---------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.diaristas_privado enable row level security;
alter table public.pedidos           enable row level security;
alter table public.pedido_enderecos  enable row level security;
alter table public.candidaturas      enable row level security;
alter table public.pedido_historico  enable row level security;

-- profiles --------------------------------------------------------------
-- Vê: o próprio perfil; a admin vê todos; cliente e diarista se veem
-- mutuamente só quando há um pedido aprovado entre elas.
create policy "profiles: ver" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select public.eh_admin())
  or exists (
    select 1 from public.pedidos p
    where p.status in ('aprovada', 'confirmada', 'paga', 'concluida')
      and (
        (p.cliente_id = (select auth.uid()) and p.diarista_id = profiles.id)
        or (p.diarista_id = (select auth.uid()) and p.cliente_id = profiles.id)
      )
  )
);

-- Edita só o próprio perfil (o gatilho 4.2 bloqueia mudança de papel)
create policy "profiles: editar o próprio" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- diaristas_privado (CPF, CNPJ, Pix) ------------------------------------
create policy "diaristas_privado: ver" on public.diaristas_privado
for select to authenticated
using (diarista_id = (select auth.uid()) or (select public.eh_admin()));

create policy "diaristas_privado: criar o próprio" on public.diaristas_privado
for insert to authenticated
with check (diarista_id = (select auth.uid()) and (select public.meu_papel()) = 'diarista');

create policy "diaristas_privado: editar o próprio" on public.diaristas_privado
for update to authenticated
using (diarista_id = (select auth.uid()))
with check (diarista_id = (select auth.uid()) and (select public.meu_papel()) = 'diarista');

-- pedidos ---------------------------------------------------------------
-- Vê: cliente dono; admin; diaristas veem as vagas abertas, os pedidos
-- aprovados para elas e os pedidos em que se candidataram.
create policy "pedidos: ver" on public.pedidos
for select to authenticated
using (
  cliente_id = (select auth.uid())
  or (select public.eh_admin())
  or (
    (select public.meu_papel()) = 'diarista'
    and (
      status in ('aberta', 'candidatura_recebida')
      or diarista_id = (select auth.uid())
      or exists (
        select 1 from public.candidaturas c
        where c.pedido_id = pedidos.id and c.diarista_id = (select auth.uid())
      )
    )
  )
);

-- pedido_enderecos ------------------------------------------------------
-- Vê: cliente dono, admin e SÓ a diarista aprovada (enquanto o pedido não
-- estiver cancelado).
create policy "pedido_enderecos: ver" on public.pedido_enderecos
for select to authenticated
using (
  (select public.eh_admin())
  or exists (
    select 1 from public.pedidos p
    where p.id = pedido_enderecos.pedido_id
      and (
        p.cliente_id = (select auth.uid())
        or (
          p.diarista_id = (select auth.uid())
          and p.status in ('aprovada', 'confirmada', 'paga', 'concluida')
        )
      )
  )
);

-- candidaturas ----------------------------------------------------------
create policy "candidaturas: ver" on public.candidaturas
for select to authenticated
using (diarista_id = (select auth.uid()) or (select public.eh_admin()));

-- pedido_historico ------------------------------------------------------
create policy "pedido_historico: ver" on public.pedido_historico
for select to authenticated
using (
  (select public.eh_admin())
  or exists (
    select 1 from public.pedidos p
    where p.id = pedido_historico.pedido_id and p.cliente_id = (select auth.uid())
  )
);

-- ---------------------------------------------------------------------
-- 6. Funções chamadas pelo app (RPC)
--    security definer = rodam com permissão total, por isso cada uma
--    confere quem está chamando antes de fazer qualquer coisa.
-- ---------------------------------------------------------------------

-- 6.1 Criar pedido + endereço numa só transação.
--     SÓ o servidor (chave service_role) pode chamar: ele confere a sessão do
--     cliente e calcula os valores a partir de src/config/planos.ts.
create function public.criar_pedido(
  p_cliente_id     uuid,
  p_plano          text,
  p_valor_cliente  numeric,
  p_valor_diarista numeric,
  p_data           date,
  p_horario        time,
  p_bairro         text,
  p_cidade         text,
  p_observacoes    text,
  p_cep            text,
  p_rua            text,
  p_numero         text,
  p_complemento    text,
  p_referencia     text
)
returns table (id uuid, codigo text)
language plpgsql security definer
set search_path = ''
as $$
declare
  novo public.pedidos;
begin
  if not exists (select 1 from public.profiles where profiles.id = p_cliente_id and papel = 'cliente') then
    raise exception 'Somente clientes podem criar pedidos.' using errcode = '42501';
  end if;
  if p_data < current_date then
    raise exception 'A data do serviço não pode estar no passado.' using errcode = '22023';
  end if;

  insert into public.pedidos (
    cliente_id, plano, valor_cliente, valor_diarista, data, horario, bairro, cidade, observacoes
  ) values (
    p_cliente_id, p_plano, p_valor_cliente, p_valor_diarista, p_data, p_horario,
    trim(p_bairro), trim(p_cidade), nullif(trim(p_observacoes), '')
  )
  returning * into novo;

  insert into public.pedido_enderecos (pedido_id, cep, rua, numero, complemento, referencia)
  values (novo.id, p_cep, p_rua, p_numero, nullif(trim(p_complemento), ''), nullif(trim(p_referencia), ''));

  return query select novo.id, novo.codigo;
end;
$$;

-- 6.2 Diarista se candidata a uma vaga. Devolve o código do pedido
--     (usado na mensagem do WhatsApp).
create function public.candidatar(p_pedido_id uuid)
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
    where d.diarista_id = eu and d.cpf is not null and d.chave_pix is not null
  ) then
    raise exception 'Complete seu perfil (CPF e chave Pix) antes de se candidatar.'
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

-- 6.3 Admin aprova uma candidatura: aprova esta, recusa as outras,
--     define a diarista do pedido e muda o status para "aprovada".
create function public.aprovar_candidatura(p_candidatura_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  cand   public.candidaturas;
  pedido public.pedidos;
begin
  if not public.eh_admin() then
    raise exception 'Somente a admin pode aprovar candidaturas.' using errcode = '42501';
  end if;

  select * into cand from public.candidaturas where candidaturas.id = p_candidatura_id;
  if not found then
    raise exception 'Candidatura não encontrada.' using errcode = 'P0002';
  end if;

  select * into pedido from public.pedidos where pedidos.id = cand.pedido_id for update;
  if pedido.status <> 'candidatura_recebida' then
    raise exception 'Este pedido não está aguardando aprovação (status: %).', pedido.status
      using errcode = '22023';
  end if;

  update public.candidaturas
  set status = case when candidaturas.id = p_candidatura_id
                    then 'aprovada'::public.status_candidatura
                    else 'recusada'::public.status_candidatura end
  where candidaturas.pedido_id = cand.pedido_id;

  update public.pedidos
  set diarista_id = cand.diarista_id, status = 'aprovada'
  where pedidos.id = cand.pedido_id;
end;
$$;

-- 6.4 Admin avança o status manualmente (confirmada, paga, concluida) ou
--     cancela. As regras de transição são conferidas pelo gatilho 4.3.
create function public.mudar_status_pedido(p_pedido_id uuid, p_novo_status public.status_pedido)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Somente a admin pode mudar o status.' using errcode = '42501';
  end if;
  if p_novo_status not in ('confirmada', 'paga', 'concluida', 'cancelada') then
    raise exception 'O status % é definido automaticamente pelo sistema.', p_novo_status
      using errcode = '22023';
  end if;

  update public.pedidos set status = p_novo_status where pedidos.id = p_pedido_id;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Permissões das tabelas
--    O Supabase dá permissão total a anon/authenticated em tudo que é criado
--    em "public" e confia no RLS. Aqui tiramos também a permissão de escrita
--    onde só as funções da seção 6 escrevem: assim o Postgres recusa a
--    tentativa logo na entrada (e ela não gasta número da sequência).
-- ---------------------------------------------------------------------
revoke insert, update, delete, truncate on public.pedidos, public.pedido_enderecos,
  public.candidaturas, public.pedido_historico from anon, authenticated;
revoke insert, delete, truncate on public.profiles from anon, authenticated;
revoke delete, truncate on public.diaristas_privado from anon, authenticated;
revoke all on sequence public.pedidos_numero_seq from anon, authenticated;

-- ---------------------------------------------------------------------
-- 8. Permissões das funções
--    Por padrão o Postgres deixa qualquer um executar funções: fechamos tudo
--    e liberamos só o necessário.
-- ---------------------------------------------------------------------
revoke execute on function public.criar_pedido(uuid, text, numeric, numeric, date, time, text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.criar_pedido(uuid, text, numeric, numeric, date, time, text, text, text, text, text, text, text, text)
  to service_role;

revoke execute on function public.candidatar(uuid) from public, anon;
grant execute on function public.candidatar(uuid) to authenticated;

revoke execute on function public.aprovar_candidatura(uuid) from public, anon;
grant execute on function public.aprovar_candidatura(uuid) to authenticated;

revoke execute on function public.mudar_status_pedido(uuid, public.status_pedido) from public, anon;
grant execute on function public.mudar_status_pedido(uuid, public.status_pedido) to authenticated;

-- Funções internas de gatilho não devem ser chamadas pela API
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;
revoke execute on function public.registrar_historico_status() from public, anon, authenticated;
