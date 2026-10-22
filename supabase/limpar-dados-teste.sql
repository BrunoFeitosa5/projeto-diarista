-- Apaga TODOS os pedidos e contas de teste e reinicia a numeração (IMP-000001).
-- Rodar UMA vez no Supabase > SQL Editor, antes de ter pedidos e contas reais.
--
-- PASSO 1: rode só o bloco "CONFERIR" e veja quem vai ser apagado.
-- PASSO 2: se alguma conta precisar ficar (ex.: a dona já cadastrada),
--          coloque o e-mail dela na lista "manter" do bloco APAGAR.
-- PASSO 3: rode o bloco APAGAR inteiro.

-- ===== CONFERIR (não apaga nada) ====================================
select u.email, p.nome, p.papel, p.created_at
from auth.users u
left join public.profiles p on p.id = u.id
order by p.created_at;

select codigo, status, created_at from public.pedidos order by created_at;

-- ===== APAGAR =======================================================
begin;

-- Pedidos primeiro: endereço, candidaturas e histórico vão junto (cascade).
delete from public.pedidos;

-- Solicitações do site (número gerado no "Contratar serviço"). Usam a mesma
-- numeração: se ficarem, o código IMP-000001 se repetiria depois do restart.
delete from public.solicitacoes;

-- Contas: o perfil e os dados privados da diarista vão junto (cascade).
delete from auth.users
where email not in (
  'dayteck33@gmail.com',                      -- admin: a filha da dona
  'brunodasilvafeitosa2588+admin@gmail.com'   -- admin de teste do Bruno
  -- acrescente aqui o e-mail da dona quando ela se cadastrar (separe por vírgula)
);

-- O próximo pedido volta a ser IMP-000001.
alter sequence public.pedidos_numero_seq restart with 1;

commit;

-- Confira: as duas consultas devem voltar vazias (ou só com as contas mantidas).
select u.email, p.papel from auth.users u left join public.profiles p on p.id = u.id;
select count(*) as pedidos from public.pedidos;
select count(*) as solicitacoes from public.solicitacoes;
