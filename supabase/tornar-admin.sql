-- Torna a dona do site ADMIN. Rodar UMA vez no Supabase > SQL Editor,
-- depois que ela tiver criado a conta normalmente pelo site.
-- Troque o e-mail abaixo pelo e-mail que ela usou no cadastro.
--
-- Funciona só pelo SQL Editor: pelo app, o gatilho "proteger_papel"
-- impede qualquer mudança de papel.

update public.profiles
set papel = 'admin'
where id = (select id from auth.users where email = 'EMAIL-DA-DONA@exemplo.com');

-- Confira: deve aparecer uma linha com papel = admin
select p.nome, u.email, p.papel
from public.profiles p
join auth.users u on u.id = p.id
where p.papel = 'admin';
