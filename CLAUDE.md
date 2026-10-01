# Império Diarista — site + plataforma de pedidos

@AGENTS.md

## Objetivo
Recriar o site imperiodiarista.com.br com o mesmo visual e colocar por trás uma
plataforma de pedidos:
- O cliente cadastra o serviço.
- A diarista se candidata.
- A dona do site (admin) aprova uma diarista e acompanha o status.

Páginas públicas: Início, Serviços, Segurança e Trabalhe Conosco.
Perfis: `cliente`, `diarista` e `admin`.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: login (Auth) e banco PostgreSQL com RLS
- Deploy na Vercel
- Os scripts `dev` e `build` usam `--webpack`: neste PC, o Controle de
  Aplicativo do Windows bloqueia o binário nativo do Next.js, e o Turbopack
  exige esse binário. Não tentar contornar a política de segurança.

## Regras de layout
- Seguir fielmente os prints e o site ao vivo: cores rosa, tipografia,
  espaçamentos, cards de preço, header, rodapé e botões.
- Se faltar algum detalhe visual, consultar o site ao vivo.
- Cores e fontes ficam como tokens em `src/app/globals.css`. Não usar cores
  soltas nos componentes.
- Logo e fotos pertencem à dona. Usar só os arquivos que ela fornecer; até
  lá, usar imagens provisórias.
- Imagens ficam em `public/img/` (nomes sem espaço nem acento) e os caminhos
  em `src/config/imagens.ts`. Onde o valor é `null`, aparece um degradê.
- Ao **substituir** uma foto, salve com um **nome de arquivo novo** (e apague o
  antigo). O otimizador de imagens do Next e a CDN da Vercel guardam as imagens
  pelo nome e continuariam mostrando a versão antiga.
- Escurecimento do hero da Início: `bg-black/48`, medido no print original.
  A foto da faixa final (`chamada-final-passadoria-hd.png`) é clara e usa a
  mesma camada de 48%. A foto do topo de Serviços já vem escurecida no arquivo
  e fica sem camada.
- Trabalhe Conosco é **só para diaristas** (decisão do usuário): os textos
  mudaram em relação ao original ("Trabalhe Conosco", texto sobre vagas, botão
  "Quero ser diarista") e o CNPJ é opcional até a dona decidir se exige MEI.
  O cliente com dúvida usa o WhatsApp.
- Os cards de preço da Início usam as imagens prontas da dona, que já trazem o
  preço desenhado (decisão do usuário, para ficar igual ao original). **Se um
  preço mudar em `planos.ts`, a imagem do card precisa ser refeita.**

## Decisões de arquitetura
- **Dados sensíveis em tabelas separadas.** O RLS protege linhas, não colunas.
  - `pedido_enderecos`: endereço completo. Só leem o cliente dono, a admin e a
    **diarista aprovada** daquele pedido.
  - `diaristas_privado`: CPF, CNPJ, data de nascimento e chave Pix. Só leem a
    própria diarista e a admin.
  - A tabela `pedidos` guarda só o bairro e a cidade, que as diaristas veem na
    lista de vagas.
- **Preços e repasse ficam num único arquivo: `src/config/planos.ts`.**
  - O cliente paga 4h = R$160, 6h = R$199 e 8h = R$230.
  - Repasse provisório: a diarista recebe 80% (`PERCENTUAL_REPASSE`) e a
    Império fica com 20%: 4h = R$128, 6h = R$159,20 e 8h = R$184.
  - O servidor calcula `valor_cliente` e `valor_diarista` a partir desse arquivo
    e grava os dois no pedido na hora em que ele é criado. Esses valores nunca
    vêm do formulário.
- **Número do pedido gerado pelo banco.**
  - Uma `sequence` do Postgres gera o código no formato `IMP-000123` quando o
    cliente cria o pedido.
  - A mensagem de candidatura no WhatsApp usa esse mesmo código.
- **Admin criado por comando no banco.**
  - No cadastro só é possível escolher `cliente` ou `diarista`.
  - A dona vira admin com um comando SQL executado uma única vez.
  - Um gatilho no banco impede que qualquer usuário altere o próprio `role`.
- **Segurança em 3 camadas:**
  1. `src/proxy.ts` bloqueia rotas por perfil.
  2. As Server Actions conferem o perfil antes de gravar.
  3. O RLS no banco, que é a defesa principal.
- **Operações que precisam acontecer de uma vez só** viram funções SQL (RPC):
  `candidatar(pedido_id)`, `aprovar_candidatura(candidatura_id)` e
  `mudar_status_pedido(pedido_id, status)`.
- **Pedido só é criado pelo servidor:** a função `criar_pedido(...)` só aceita
  a chave `service_role` (`SUPABASE_SERVICE_ROLE_KEY`, usada apenas no
  servidor). A Server Action confere a sessão do cliente, calcula os valores
  por `planos.ts` e chama a função. O navegador não consegue criar pedido.
- As tabelas `pedidos`, `pedido_enderecos`, `candidaturas` e
  `pedido_historico` não aceitam escrita direta do app (permissão revogada);
  só mudam pelas funções.
- A diarista só se candidata com CPF e chave Pix preenchidos no perfil.
- Cliente e diarista veem o perfil (nome e telefone) uma da outra só depois
  que o pedido entre elas é aprovado.
- **Testes do banco:** `npm run test:db` aplica as migrações num Postgres local
  (PGlite) e confere o fluxo e o RLS. Rodar sempre que mudar uma migração.
  Para tornar a dona admin: `supabase/tornar-admin.sql` no SQL Editor.
- **WhatsApp:** link `wa.me` sem API paga. O número da dona fica em
  `NEXT_PUBLIC_WHATSAPP_DONA`.
- **Chaves e segredos** ficam só em `.env.local`, que nunca vai para o git.
  O `.env.example` fica no git, sem valores.

## Login e áreas (etapa 7)
- Rotas: `/entrar`, `/cadastro` (`?perfil=diarista` marca "Sou diarista"),
  `/auth/confirmar` (link do e-mail) e os painéis `/cliente`, `/diarista`,
  `/admin` (grupo `(painel)`).
- `src/proxy.ts` roda só nessas rotas; as páginas públicas seguem estáticas.
  Sem `.env.local`, Entrar/Cadastro mostram um aviso e os painéis mandam
  para `/entrar`.
- Em páginas e Server Actions restritas, chamar `exigirPapel(...)` de
  `src/lib/auth.ts` (2ª camada; o proxy sozinho não basta).
- No servidor, usar `getClaims()` (confere o token), nunca `getSession()`.
- O item "Entrar" no menu é o único acréscimo ao header original.
- CPF/CNPJ/Pix NÃO vão no cadastro (os metadados do usuário entram no token
  de login); a diarista preenche no perfil (etapa 9).
- Configuração no painel do Supabase (Authentication > URL Configuration):
  Site URL = endereço do site; Redirect URLs incluem
  `http://localhost:3000/auth/confirmar` e o endereço da Vercel.

## Painel do cliente (etapa 8)
- Rotas: `/cliente` (Meus pedidos), `/cliente/novo-pedido` (`?plano=4h|6h|8h`
  vem dos cards da Início) e `/cliente/pedidos/[id]` (detalhe).
- A Server Action `criarPedido` (`src/actions/pedidos.ts`) confere o perfil,
  valida os campos, calcula os valores por `planos.ts` e chama `criar_pedido`
  com o cliente `service_role` de `src/lib/supabase/servico.ts` (só servidor).
- Horários de início, antecedência mínima (1 dia) e limite (90 dias) ficam
  em `src/config/agendamento.ts`.
- Nomes e cores dos status ficam em `src/lib/status.ts` (para os 3 painéis).
- O CEP preenche rua, bairro e cidade pelo ViaCEP (o cliente pode corrigir).
- Cancelamento: **só a dona**, pelo painel admin. O cliente pede pelo
  WhatsApp (botão no detalhe do pedido, com o código).

## Painel da diarista (etapa 9)
- Rotas: `/diarista` (vagas abertas + "Meus serviços") e `/diarista/perfil`.
- Perfil: CPF e chave Pix obrigatórios (com o tipo), CNPJ e nascimento
  opcionais; CPF/CNPJ conferidos pelos dígitos (`src/lib/documentos.ts`).
  Grava em `diaristas_privado` pelo cliente do usuário (RLS). CNPJ e
  nascimento do Trabalhe Conosco vêm do `sessionStorage`.
- "Me candidatar" chama a RPC `candidatar` e depois mostra o botão
  "Avisar a Império no WhatsApp" (o clique é da diarista; abrir sozinho seria
  bloqueado pelo navegador).
- Vagas mostram bairro, cidade, observações e o ganho. Pedido com repasse 0
  aparece como "Valor a combinar com a Império" (`textoRepasse` em `planos.ts`).
- "Meus serviços": pedidos aprovados para ela, com endereço completo e nome e
  telefone do cliente (o banco libera só depois da aprovação).

## Tabelas
`profiles`, `diaristas_privado`, `pedidos`, `pedido_enderecos`,
`candidaturas` (única por pedido + diarista) e `pedido_historico`.
As migrações ficam em `supabase/migrations/`.

## Status do pedido
`aberta` → `candidatura_recebida` → `aprovada` → `confirmada` → `paga` → `concluida`
Qualquer status antes de `paga` também pode ir para `cancelada`.

- As vagas com status `aberta` e `candidatura_recebida` aparecem para as diaristas.
- Duas mudanças são automáticas: a primeira candidatura e a aprovação.
- As demais mudanças são feitas pela admin.
- Toda mudança de status grava uma linha em `pedido_historico`.

## Etapas do plano
1. Base do projeto (Next.js, Tailwind, Supabase SDK, `.env.example`)
2. Tema visual (fontes e cores extraídas do site ao vivo)
3. Componentes do site (TopBar, Header, Footer, botões)
4. Página Início
5. Páginas Serviços, Segurança e Trabalhe Conosco
6. Supabase: tabelas, RLS, sequence, gatilhos e funções
7. Login e cadastro + `proxy.ts`
8. Painel do cliente
9. Painel da diarista (perfil, vagas, "Me candidatar" + WhatsApp)
10. Painel admin (candidatas, aprovação, status, histórico)
11. Revisão de segurança com contas de teste
12. Deploy na Vercel

Trabalhar **uma etapa por vez** e mostrar o resultado antes de seguir.

**Situação em 01/10/2026:** etapas 1 a 9 concluídas e com commit. Supabase
configurado (projeto `imperio-diarista`, região São Paulo, migração aplicada,
URLs de login configuradas, `.env.local` preenchido com as chaves legacy
`anon`/`service_role`). Login testado: cliente e diarista caem cada uma no
próprio painel, e o proxy bloqueia as áreas dos outros perfis.

## Próximo passo
- Etapa 10 (painel admin).
- Admins: a dona **e a filha dela** se cadastram pelo site e o usuário roda
  `supabase/tornar-admin.sql` no SQL Editor, uma vez com cada e-mail.
- Rodar **um só** `npm run dev` por vez. Neste PC o Next roda em WASM, sem
  trava na pasta `.next`, e dois servidores juntos corrompem o cache (o site
  aparece sem CSS). Para resolver: parar todos, apagar `.next` e subir um só.
- O e-mail grátis do Supabase envia só uns 2 e-mails por hora. Ao estourar,
  o cadastro mostra "Muitas tentativas".
- Teste no celular: `http://<IP do PC>:3000`. O `allowedDevOrigins` do
  `next.config.ts` libera `192.168.*.*` (sem ele o Next bloqueia o JS no dev).

## Pendências
- Confirmar com a dona os horários de início (hoje 07:00 às 14:00) e a
  antecedência mínima (hoje 1 dia), em `src/config/agendamento.ts`.
- Antes do deploy: apagar os pedidos e contas de teste (o IMP-000001 é teste)
  e reiniciar a numeração dos pedidos.
- Repasse: 80/20 é provisório até a dona confirmar (`PERCENTUAL_REPASSE`
  em `planos.ts`). Cada pedido guarda o valor do momento em que foi criado:
  o IMP-000001, feito com repasse 0, continua "a combinar".
- O Trabalhe Conosco guarda nome, CNPJ, telefone e nascimento em
  `sessionStorage` (`pre-cadastro-diarista`). O cadastro já usa nome e
  telefone; o perfil da diarista (etapa 9) usa CNPJ e nascimento.
- Imagens em alta resolução: o site original tem versões maiores dos cards
  4h/6h/8h (1122x1402), da Segurança (1388x1133) e do topo de Serviços
  (1909x824). Aguardando o usuário decidir se troca.
- Telefone: o rodapé do original mostra (11) 93501-2450, mas os links de
  WhatsApp do original usam (11) 93501-2436. Confirmar qual é o certo.
  Por enquanto o `.env.local` usa o final 2436.
