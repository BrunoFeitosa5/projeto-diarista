# Plano: mensagens automáticas (Meta), anúncios e domínio

Atualizado em 22/10/2026. Estado: **aguardando a dona** passar o Facebook e os dados do CNPJ.

## Decisões já tomadas
- Mensagens automáticas pagas, como o S.O.S Diaristas: **API oficial da Meta + plataforma de chatbot (BSP)**. A dona aceita pagar.
- Só o número dos **clientes** (final 2436) entra no bot. O número das diaristas / S.O.S (11 91159-3485) fica no **app WhatsApp Business**, por causa do grupo.
- Os dois números devem ser **WhatsApp Business**. "Web" é só o jeito de abrir no computador.
- A conta nova do Facebook foi bloqueada ("muito nova para criar uma conta comercial"). Usar o **Facebook antigo e real da dona**.
- Domínio novo: **imperiodiaristaoficial.com.br**, registrado em 22/10/2026 no Registro.br. O plano era a dona como titular (CNPJ), mas ficou no **Bruno, pessoa física**; trocar exige documentos. DNS: A `76.76.21.21` e CNAME `www` `cname.vercel-dns.com.`; endereço oficial com `www`.
- O `imperiodiarista.com.br` original já existe: não mexer no DNS dele sem acordo com a dona.

## O que a dona precisa passar
- [ ] Acesso ao Facebook dela (com o celular dela por perto para o código de segurança).
- [ ] Razão social, CNPJ e endereço, como na Receita Federal.
- [ ] Nome e CPF do responsável legal.
- [ ] E-mail dela (com acesso dela) e e-mail de contato de privacidade.
- [ ] Decidir o número dos clientes: manter o 2436 (se a plataforma aceitar coexistência) ou chip novo.
- [ ] Cartão para a Meta (mensagens de template e anúncios) e para o Registro.br.

## Passo a passo

### 1. Domínio (Registro.br)
1. Conferir se `imperiodiaristaoficial.com.br` está livre.
2. Criar a conta no Registro.br **no nome da dona** (CNPJ), com e-mail e celular dela.
3. Registrar o domínio. Opcional: adicionar o Bruno como contato técnico.

### 2. Meta Business
1. Entrar em business.facebook.com com o Facebook da dona, no computador, sem VPN.
2. Criar o portfólio empresarial "Império Diarista".
3. Em Configurações do negócio > Pessoas, adicionar Bruno e a filha como administradores.
4. Ativar a verificação em duas etapas.
5. Iniciar a **Verificação da empresa** (CNPJ, razão social e endereço iguais aos da Receita).
6. Depois da verificação, cadastrar o domínio em Segurança da marca > Domínios.

### 3. WhatsApp Business Platform
1. Escolher a plataforma de chatbot (Take Blip, Wati, Kommo, Respond.io, Zenvia). Pedir teste grátis e o preço final por escrito.
2. Conectar o WhatsApp pelo "Cadastro incorporado" (Embedded Signup): cria a conta do WhatsApp Business (WABA) e registra o número.
3. Confirmar o código por SMS ou ligação.
4. Completar o perfil: foto, descrição, horário (seg a dom, 8h às 22h), site e endereço.
5. Cadastrar um cartão na conta Meta (cobrança por mensagem de template).
6. Criar os **templates** (categoria Utilidade) e esperar a aprovação: confirmação, lembrete, nome da diarista, pós-serviço.
7. Montar o fluxo: menu inicial, coleta do pedido, confirmação e repasse para atendente humana.
8. Testar todos os ramos antes de divulgar.

### 4. Impulsionar posts (anúncios)
- Usa a Página do Facebook e a conta de anúncios dentro do mesmo portfólio empresarial, com cartão cadastrado.
- Fazer depois da verificação da empresa.

### 5. Site (depois que o domínio estiver ativo)
1. Vercel > Settings > Domains: adicionar `imperiodiaristaoficial.com.br` e `www`; copiar os registros DNS.
2. Registro.br: apontar o DNS para a Vercel.
3. Supabase > Authentication > URL Configuration: Site URL e Redirect URLs com o domínio novo.
4. Atualizar URLs no código, nos Termos, na Privacidade e no CLAUDE.md.
5. Preencher CNPJ, razão social, endereço e e-mail de privacidade em `/termos-de-uso` e `/privacidade` (atualizar `ATUALIZADA_EM`).

## Cuidados
- **Vercel Hobby** é para uso pessoal e não comercial. Para um site de empresa, ver o plano Pro e conferir os termos atuais.
- Combinar quem controla o projeto: criar um time na Vercel com a dona como membro, ou mover o projeto para a conta dela.
- Não usar Z-API nem Evolution API (não oficiais, risco de banir o número).
- Não criar várias contas de Facebook para contornar a trava.
- Cada número só pode estar em **um** WhatsApp ao mesmo tempo.
- Rodar `npm run backup` antes de mudar o banco; o último foi em 14/10/2026.

## Pendências técnicas do projeto
- `.env.local` tem `NEXT_PUBLIC_WHATSAPP_GRUPO_DIARISTAS`; o nome certo é `WHATSAPP_GRUPO_DIARISTAS` (sem `NEXT_PUBLIC_`). Conferir também na Vercel.
- A `main` local está 2 commits à frente do GitHub (docs e Termos); o push publica em produção.
- Rodar `npm run test:seguranca` antes do próximo deploy.
- Confirmar se as contas admin da dona e da filha já foram criadas (`supabase/tornar-admin.sql`).

## Para o Claude escrever quando a conta for liberada
- Fluxo do bot em `docs/` (menu, coleta de dados, confirmação).
- Textos dos templates com variáveis `{{1}}`, `{{2}}`, no formato de aprovação da Meta.
