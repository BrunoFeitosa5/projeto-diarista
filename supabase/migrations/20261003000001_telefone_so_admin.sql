-- =====================================================================
-- Telefone só para a admin (decisão do usuário, 03/10/2026)
--
-- A conversa fica entre a Império e cada pessoa: depois da aprovação,
-- cliente e diarista veem só o NOME uma da outra, nunca o telefone.
--
-- O RLS protege linhas, não colunas. Por isso a linha inteira de profiles
-- (com o telefone) passa a ser só da própria pessoa e da admin, e o nome da
-- outra parte sai pela view nomes_visiveis, que não tem a coluna telefone.
-- =====================================================================

drop policy "profiles: ver" on public.profiles;

create policy "profiles: ver" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select public.eh_admin()));

-- A view roda com as permissões de quem a criou (ignora o RLS de profiles),
-- então o filtro abaixo é a regra: o próprio nome, todos para a admin e,
-- entre cliente e diarista, só com um pedido aprovado entre as duas.
create view public.nomes_visiveis as
select pr.id, pr.nome
from public.profiles pr
where pr.id = (select auth.uid())
   or (select public.eh_admin())
   or exists (
     select 1 from public.pedidos p
     where p.status in ('aprovada', 'confirmada', 'paga', 'concluida')
       and (
         (p.cliente_id = (select auth.uid()) and p.diarista_id = pr.id)
         or (p.diarista_id = (select auth.uid()) and p.cliente_id = pr.id)
       )
   );

revoke all on public.nomes_visiveis from public, anon, authenticated;
grant select on public.nomes_visiveis to authenticated;
