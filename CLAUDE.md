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
- Ícone da aba: `src/app/icon.png` (diamante recortado do logo, fundo
  transparente, 512px) e `src/app/apple-icon.png` (fundo branco, 180px, para
  iPhone). O Next põe um código no link, então trocar o arquivo já basta.
- Escurecimento do hero da Início: `bg-black/48`, medido no print original.
  A foto da faixa final (`chamada-final-passadoria-hd.png`) é clara e usa a
  mesma camada de 48%. A foto do topo de Serviços já vem escurecida no arquivo
  e fica sem camada.
- Trabalhe Conosco é **só para diaristas** (decisão do usuário): os textos
  mudaram em relação ao original ("Trabalhe Conosco", texto sobre vagas, botão
  "Quero ser diarista") e o formulário não pede mais CNPJ (tirado em 19/10/2026).
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
  - Repasse fixo por plano (valores da dona, 19/10/2026): a diarista recebe
    4h = R$100, 6h = R$120 e 8h = R$160 (`repasseDiarista` em `planos.ts`).
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
- Cliente e diarista veem só o **nome** uma da outra, e só depois que o
  pedido entre elas é aprovado (view `nomes_visiveis`). O telefone de todos
  fica só com a admin: a linha de `profiles` é da própria pessoa e da admin.
- **Testes do banco:** `npm run test:db` aplica as migrações num Postgres local
  (PGlite) e confere o fluxo e o RLS. Rodar sempre que mudar uma migração.
  Para tornar a dona admin: `supabase/tornar-admin.sql` no SQL Editor.
- **WhatsApp:** link `wa.me` sem API paga. O número da dona fica em
  `NEXT_PUBLIC_WHATSAPP_DONA`. O número certo é **(11) 93501-2436**
  (confirmado em 02/10/2026; o 2450 do rodapé original estava errado). O
  texto exibido fica em `SITE.telefoneExibicao` (`src/config/site.ts`) e
  precisa bater com a variável.
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
- Senha mínima de 8 caracteres no site e no Supabase (Authentication >
  Email, ajustado em 03/10/2026).
- **Site igual ao S.O.S Diaristas (19/10/2026, decisão do usuário):** o
  cliente **não tem conta**: todo botão de agendar abre o WhatsApp da dona
  (`linkWhatsApp(MENSAGEM_AGENDAR)`; os cards levam o plano na mensagem).
  Menu do topo: Início, Valores, Agende agora, Trabalhe Conosco (`NAV_LINKS`
  em `site.ts`; Valores e Agende agora são âncoras da Início). Ordem da Início:
  Hero, Valores, Vantagens, Como funciona, Avaliações, Ficou com dúvidas?
  (FAQ), formulário Nome + Telefone (`FormAgendar`, abre o WhatsApp com os
  dados; nada é gravado) e chamada final. "Serviços", "Segurança" e
  "Termos de Uso" ficam no **rodapé**. Não há link de "Entrar" no site: a
  admin acessa digitando `/entrar`. Sem desconto de 10% (decisão do usuário).
- **Diarista também não cria conta (19/10/2026, decisão do usuário):**
  "Trabalhe Conosco" abre o WhatsApp **S.O.S Diaristas**
  (`linkWhatsAppDiaristas`) com nome, telefone e, se preenchido, o
  nascimento (sem CNPJ: a dona tirou o campo em 19/10/2026). `/cadastro` só redireciona para `/trabalhe-conosco`; o formulário
  e a Server Action `cadastrar` foram apagados. `/entrar` serve só para a
  dona/admin. Os painéis `/cliente` e `/diarista` continuam no código
  e nos testes, sem link no site; contas antigas ainda entram.
- Avaliações: `src/config/avaliacoes.ts` começa **vazia** e a seção só
  aparece com avaliações reais da Império (não copiar as do S.O.S).
- `/termos-de-uso`: rascunho a ser revisado pela dona (CNPJ, cancelamento,
  pagamento). Pagamento: **só Pix**, com uma garantia de R$ 10,00 que a dona
  manda pelo WhatsApp (ela pediu para **não** aparecer no FAQ; os termos só
  dizem que valor e garantia são combinados no WhatsApp). Instagram: preencher
  `SITE.instagram`.
- **Horários e região (20/10/2026, ditos pela dona):** atendimento no WhatsApp
  seg a dom, 8h às 22h (`SITE.horarioAtendimento`); diaristas trabalham seg a
  dom, 6h às 19h (`SITE.horarioDiaristas`, no rodapé e no FAQ); região: "Toda
  a região de São Paulo" (`SITE.regiao`).
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
  Resumo da experiência obrigatório (20 a 500 letras, a RPC `candidatar`
  também exige) e referência opcional (nome + telefone, os dois juntos),
  ambos em `diaristas_privado`; a admin vê no cartão da candidata.
  Grava em `diaristas_privado` pelo cliente do usuário (RLS). CNPJ e
  nascimento do Trabalhe Conosco vêm do `sessionStorage`.
- "Me candidatar" chama a RPC `candidatar` e depois mostra o botão
  "Avisar a Império no WhatsApp" (o clique é da diarista; abrir sozinho seria
  bloqueado pelo navegador).
- Vagas mostram bairro, cidade, observações e o ganho. Pedido com repasse 0
  aparece como "Valor a combinar com a Império" (`textoRepasse` em `planos.ts`).
- "Meus serviços": pedidos aprovados para ela, com endereço completo e nome
  do cliente (o banco libera só depois da aprovação; telefone, nunca).

## Painel admin (etapa 10)
- Rotas: `/admin` (pedidos com filtros; a aba inicial é "Aprovar diarista")
  e `/admin/pedidos/[id]` (candidatas com CPF/CNPJ/Pix, aprovar, próximo
  status, cancelar, cliente, valores e histórico com quem mudou).
- Server Actions em `src/actions/admin.ts` chamam as RPCs
  `aprovar_candidatura` e `mudar_status_pedido` pelo cliente da admin.
- Regras de botões em `src/lib/status.ts` (`PROXIMO_STATUS`, `PODE_CANCELAR`),
  iguais ao gatilho do banco. Ações perigosas pedem um 2º clique
  (`BotaoAcaoAdmin`), sem `confirm()` do navegador.
- Telefones de cliente e diarista têm link de WhatsApp (`linkWhatsAppPara`).
- Candidata aprovada ganha o botão "Enviar mensagem no WhatsApp"
  (`mensagemAprovada` na página do pedido): data, plano, endereço, ponto de
  referência, observações, nome completo do cliente, repasse, CPF e Pix dela.
  **Sem o telefone do cliente** (decisão do usuário: a conversa fica entre a
  Império e cada pessoa).
  Envio automático exigiria a API paga da Meta; a admin toca em Enviar.
- Na diarista, serviço "aprovada" ou "confirmada" mostra uma faixa de
  parabéns em "Meus serviços".

## Grupo das diaristas e S.O.S (13 a 15/10/2026)
Fluxo combinado com a dona: a diarista se cadastra, a dona **verifica**,
a verificada entra no grupo do WhatsApp; o pedido do cliente vai para o
grupo por um toque da dona; a diarista interessada chama o **S.O.S
Diaristas** no privado com o código do pedido.
- **Dois números de WhatsApp:** clientes = `NEXT_PUBLIC_WHATSAPP_DONA`
  (final 2436); diaristas/S.O.S = `NEXT_PUBLIC_WHATSAPP_DIARISTAS`
  (11 91159-3485, `linkWhatsAppDiaristas`; sem a variável cai no da dona).
  O link do grupo é `WHATSAPP_GRUPO_DIARISTAS` (**sem** `NEXT_PUBLIC_`:
  quem tem o link entra no grupo; só páginas de servidor leem). Na Vercel,
  o número vai como "Config" e o link do grupo como "Secret".
- **Verificada:** tabela `diaristas_verificadas` (linha = verificada), só a
  função `verificar_diarista` escreve, só a admin chama. Tela
  `/admin/diaristas` (candidatas, referência e experiência). Fica fora de
  `diaristas_privado` porque a diarista edita a própria linha de lá.
- Só a verificada vê "Entrar no grupo" (`/diarista`) e **só a verificada
  se candidata** (`candidatar` confere). A não verificada vê "em análise".
- **Publicar no grupo:** coluna `pedidos.publicado_grupo_em`, função
  `marcar_publicado_grupo`. Aba "Publicar no grupo" (a 1ª) em `/admin` e
  botão no pedido (`PublicarNoGrupo`): um toque abre o WhatsApp com o aviso
  e marca como publicado. O aviso leva só código, data, plano, bairro e
  cidade (**sem endereço, nome do cliente nem valor**; o valor a dona passa
  no privado) e o link "Tenho interesse" para o S.O.S com o código escrito.
  O site não sabe se a dona enviou de verdade: marca ao tocar.
- **Postar no grupo sozinho não dá** sem a API paga da Meta ou bot não
  oficial (risco de banir o número). Por isso é sempre um toque da dona.
- **Escolher diarista direto:** função `escolher_diarista` (admin; só
  verificada e com CPF e Pix; recusa as outras candidatas; passa por
  "candidatura_recebida" por causa do gatilho de status). Cartão
  "Escolher uma diarista verificada" no pedido.
- A mensagem do cliente para a Império (abre sozinha ao criar o pedido,
  `EnviarPedidoWhatsApp`) termina com o link do pedido no painel admin, para
  a dona cair direto no botão "Publicar no grupo". O endereço do site vem
  dos cabeçalhos da requisição.
- "Avisar a Império no WhatsApp" depois de candidatar vai para o S.O.S.

## Revisão de segurança (etapa 11)
- `npm run test:seguranca` (com o `npm run dev` ligado) testa o Supabase de
  verdade e o site: visitante, cliente curiosa, diaristas, Server Actions
  chamadas direto (com controle positivo), ação vinda de outro site, chave
  secreta fora do navegador e cabeçalhos. Cria contas e 1 pedido temporários
  e apaga no final (gasta 1 número de pedido). Rodar antes de cada deploy.
- `next.config.ts` envia cabeçalhos de segurança em todas as páginas
  (X-Frame-Options DENY/frame-ancestors contra clickjacking, nosniff,
  Referrer-Policy, Permissions-Policy). Não há CSP completa: cuidado ao
  adicionar uma (o ViaCEP e o Supabase precisariam estar liberados).

## Acréscimos visuais (02/10/2026)
- **Modo escuro:** botão de lua/sol (`src/components/site/BotaoTema.tsx`) no
  menu. Padrão é o claro (igual ao original); a escolha fica no
  `localStorage` (`tema`) e um script em `src/app/layout.tsx` aplica
  `data-tema="escuro"` no `<html>` antes de a página aparecer.
  As cores escuras ficam em `:root[data-tema="escuro"]` no `globals.css`:
  os tokens mudam sozinhos, então **não use `bg-white`/`text-black`**; use
  `bg-superficie`, `text-texto-menu`, `text-sobre-marinho`. Texto em cima de
  foto usa `text-texto-foto`/`text-rosa-foto`, que não mudam.
- **Cards ampliáveis:** `src/components/ui/CardAmpliavel.tsx` (`<dialog>`)
  nos cards de vantagens e de preço da Início. Enquanto aberto, a página não
  rola (`html:has(dialog[open])` no `globals.css`).
- Telefone do rodapé abre o WhatsApp.

## Tabelas
`profiles`, `diaristas_privado`, `diaristas_verificadas`, `pedidos`,
`pedido_enderecos`, `candidaturas` (única por pedido + diarista) e
`pedido_historico`.
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

**Situação em 01/10/2026:** as 12 etapas estão concluídas. Site no ar em
**https://projeto-diarista-ten.vercel.app** (Vercel ligada ao GitHub
`BrunoFeitosa5/projeto-diarista`: cada `git push` na `main` publica sozinho).
As 4 variáveis do `.env.example` estão no painel da Vercel. O
`npm run test:seguranca` passou contra o site publicado
(`SITE_URL=https://projeto-diarista-ten.vercel.app npm run test:seguranca`;
a seção 5 só roda contra o `npm run dev`). Supabase: projeto
`imperio-diarista`, região São Paulo, chaves legacy `anon`/`service_role`.

## Próximo passo
- Supabase > Authentication > URL Configuration: Site URL = endereço da
  Vercel e Redirect URLs com `<endereço>/auth/confirmar`.
- Limpar os dados de teste com `supabase/limpar-dados-teste.sql` (apaga
  todos os pedidos e contas, menos os e-mails da lista "manter", e volta a
  numeração para IMP-000001). Fazer **antes** de cadastrar as admins.
- Admins: a dona **e a filha dela** se cadastram pelo site e o usuário roda
  `supabase/tornar-admin.sql` no SQL Editor, uma vez com cada e-mail.
- Dona: trocar `WHATSAPP_GRUPO_DIARISTAS` (hoje é um grupo de teste) pelo
  link do grupo real, na Vercel e no `.env.local`, e fazer um Redeploy.
- Cadastrar e verificar as diaristas (referências) antes de convidá-las
  para o grupo; depois a dona passa a publicar os pedidos.
- Rodar **um só** `npm run dev` por vez. Neste PC o Next roda em WASM, sem
  trava na pasta `.next`, e dois servidores juntos corrompem o cache (o site
  aparece sem CSS). Para resolver: parar todos, apagar `.next` e subir um só.
- O e-mail grátis do Supabase envia só uns 2 e-mails por hora. Ao estourar,
  o cadastro mostra "Muitas tentativas".
- Teste no celular: `http://<IP do PC>:3000`. O `allowedDevOrigins` do
  `next.config.ts` libera `192.168.*.*` (sem ele o Next bloqueia o JS no dev).

## Próxima sessão (20/10/2026)
- **Mensagens automáticas para clientes, como no S.O.S Diaristas.** Hoje o
  cliente só abre o WhatsApp com um texto pronto e a dona responde à mão.
  Bolar as mensagens (boas-vindas, confirmação de data, lembrete, nome da
  diarista, pós-serviço). Envio automático de verdade exige a API paga da Meta
  (WhatsApp Business); sem ela, dá para ter respostas rápidas/mensagens
  prontas no WhatsApp Business da dona. Decidir o caminho com o usuário.

## Mensagens do WhatsApp Business (20/10/2026)
As mensagens para clientes (saudação, ausência e respostas rápidas
`/valores`, `/dados`, `/endereco`, `/garantia`, `/confirmado`, `/diarista`,
`/lembrete`, `/obrigado`, `/foraarea`) estão em `docs/mensagens-whatsapp.md`.
São configuradas no app, não no site. Regras: Pix apenas, garantia de R$ 10
paga antes e descontada do total (só no WhatsApp), cancelamento até 8h antes
sem perder a garantia (a dona deve confirmar), materiais por conta da cliente.

## Pendências
- Plano grátis do Supabase não tem backup que dê para baixar. Enquanto isso,
  `npm run backup` (`scripts/backup.mjs`) exporta todas as tabelas e a lista
  de contas para `backups/AAAA-MM-DD_HHMM/` (JSON; a pasta fica fora do git
  porque tem CPF, Pix e endereços). É manual: rodar toda semana e antes de
  limpar dados ou rodar migração. Antes de ter pedidos reais, decidir também
  pelo plano Pro (backup automático).
- Política de Privacidade (LGPD): rascunho em `/privacidade`
  (`src/app/(site)/privacidade/page.tsx`), com link no rodapé. Reescrita em
  20/10/2026 para o fluxo sem conta (dados pelo WhatsApp; Supabase só para a
  área da equipe). Falta a dona ou um profissional revisar: CNPJ/razão social da Império,
  e-mail de contato para privacidade, prazo de guarda dos dados e a regra de
  18 anos. Ao mudar o texto, atualizar `ATUALIZADA_EM`.
- Confirmar com a dona os horários de início (hoje 07:00 às 14:00) e a
  antecedência mínima (hoje 1 dia), em `src/config/agendamento.ts`.
- Domínio próprio (`imperiodiarista.com.br`): trocar o DNS tira o site
  original do ar. Só com o acordo da dona; depois atualizar as URLs no
  Supabase.
- Repasse: valores fixos em `planos.ts` (R$100/120/160). Cada pedido guarda
  o valor do momento em que foi criado: pedidos antigos mantêm o repasse
  da época (80% ou 0 = "a combinar").
- O Trabalhe Conosco guarda nome, CNPJ, telefone e nascimento em
  `sessionStorage` (`pre-cadastro-diarista`). O cadastro já usa nome e
  telefone; o perfil da diarista (etapa 9) usa CNPJ e nascimento.
- Imagens em alta resolução: os cards 4h/6h/8h já usam as versões de
  1122x1402 (`card-plano-*-hd.png`, qualidade 90 em `next.config.ts`, 19/10/2026).
  Ainda em baixa: Segurança (original tem 1388x1133) e topo de Serviços
  (1909x824). Aguardando o usuário decidir se troca.
