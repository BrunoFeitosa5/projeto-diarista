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
- Escurecimento do hero da Início: `bg-black/48`, medido no print original.
  A foto da faixa final (`chamada-final-passadoria.avif`) já vem escurecida
  no arquivo, então fica sem camada extra.
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
  - O repasse da diarista ainda será definido.
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
  `candidatar(pedido_id)` e `aprovar_candidatura(candidatura_id)`.
- **WhatsApp:** link `wa.me` sem API paga. O número da dona fica em
  `NEXT_PUBLIC_WHATSAPP_DONA`.
- **Chaves e segredos** ficam só em `.env.local`, que nunca vai para o git.
  O `.env.example` fica no git, sem valores.

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

## Pendências
- Valor do repasse de cada plano (fica `0` em `planos.ts` até ser definido)
- Telefone: o rodapé do original mostra (11) 93501-2450, mas os links de
  WhatsApp do original usam (11) 93501-2436. Confirmar qual é o certo.
