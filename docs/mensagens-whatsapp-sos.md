# Mensagens do WhatsApp Business (S.O.S Diaristas)

Número das diaristas: (11) 91159-3485. Elas **não** ficam no site: são
configuradas no app WhatsApp Business (Ferramentas para a empresa), como as
dos clientes em `mensagens-whatsapp.md`.

O botão "Quero ser diarista" do site abre este chat com uma mensagem pronta
(nome, telefone e nascimento). A saudação abaixo responde sozinha e já manda o
link do grupo. **O link do grupo fica só nestas mensagens do WhatsApp, nunca
no código nem no git.**

## Regras
- Diaristas trabalham seg a dom, das 6h às 19h. Atendimento: 8h às 22h.
- Repasse fixo por plano: 4h = R$ 100, 6h = R$ 120, 8h = R$ 160.
- O valor de cada serviço é combinado no privado, nunca no grupo.
- No grupo vai só o aviso do pedido (código, data, plano, bairro e cidade),
  sem endereço, nome do cliente nem valor.
- Nunca pedir senha nem dados de cartão pelo chat.

## Configurações automáticas

**Mensagem de saudação** (1ª mensagem da diarista ou depois de 14 dias).
Troque `LINK_DO_GRUPO` pelo convite real (`https://chat.whatsapp.com/...`):

```
Olá, tudo bem? 😊 Seja bem-vinda à Império Diarista!

Para entrar no nosso grupo de vagas, toque no link:
LINK_DO_GRUPO

No grupo avisamos os serviços disponíveis (data, plano, bairro e cidade). Se tiver interesse em um serviço, é só chamar aqui com o código do pedido, por exemplo IMP-000123.

Regras do grupo: respeito sempre, sem conversa fora do assunto e sem divulgar o link para outras pessoas.
```

**Mensagem de ausência** (horário personalizado: todos os dias, das 22h às 8h):

```
Olá! Obrigada pelo contato com a Império Diarista. 😊

Nosso atendimento é todos os dias, das 8h às 22h. Deixe aqui seu nome e sua dúvida que respondemos assim que voltarmos!
```

## Respostas rápidas (atalhos)

**/grupo** (se ela pedir o link de novo):

```
Claro! Este é o link do nosso grupo de vagas:
LINK_DO_GRUPO
```

**/interesse** (quando ela chama com o código de um pedido):

```
Obrigada pelo interesse no serviço! 😊 Vou confirmar a disponibilidade e já te respondo por aqui com os detalhes e o valor.
```

**/dados** (para conhecer a diarista antes de confirmar):

```
Para confirmar, me envie por favor:
- Nome completo
- Bairro e cidade onde você mora
- Há quanto tempo trabalha como diarista
- Uma referência (nome e telefone de uma ex-patroa)
```

**/confirmada** (quando a dona escolhe a diarista):

```
Parabéns, você foi escolhida para o serviço! 🎉
Em instantes envio o endereço, o horário e o valor combinado.
```

**/outra** (quando outra diarista foi escolhida):

```
Obrigada pelo interesse! Desta vez outra profissional foi escolhida, mas seguimos avisando as próximas vagas no grupo. 💜
```

## Avisos para o grupo das diaristas

A dona os envia **dentro do grupo** (WhatsApp Business no celular ou WhatsApp
Web), trocando o que está entre `[colchetes]`. Os dados vêm da mensagem do
cliente, que já chega com o código (`Pedido IMP-000123`). Nunca copiar o nome,
o telefone, o endereço nem o valor para o grupo.

**/vaga**

```
📢 Vaga disponível — [IMP-000123]
• Data: [dia, 25/10] às [horário]
• Plano: [6h]
• Local: [bairro, cidade]

Quem tiver interesse, chame o S.O.S Diaristas no privado, (11) 91159-3485, com o código [IMP-000123]. A primeira diarista verificada que chamar leva a vaga.
```

**/preenchida** (quando a dona escolher a diarista)

```
✅ [IMP-000123] já foi preenchida. Obrigada a todas! Seguimos avisando as próximas vagas aqui. 💜
```

Como decidir "a primeira": vale o horário da mensagem no privado do S.O.S. Se
a primeira não for verificada ou desistir, passa para a seguinte. Depois de
escolher, a dona manda `/confirmada` para ela, `/outra` para as demais que
chamaram e `/preenchida` no grupo. Endereço e valor só no privado.

## Etiquetas sugeridas
`Nova`, `Em análise`, `No grupo`, `Interessada`, `Escolhida`.

## Pendências
- Colocar o link real do grupo no lugar de `LINK_DO_GRUPO` (saudação e `/grupo`).
- A dona revisar o texto das regras do grupo e o pedido de referência.
- Conferir se a saudação aparece só uma vez por conversa (configuração
  "Mensagem de saudação" > enviar para "Todos").
