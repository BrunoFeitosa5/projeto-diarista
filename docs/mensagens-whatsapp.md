# Mensagens do WhatsApp Business (clientes)

Número dos clientes: (11) 93501-2436. Elas **não** ficam no site: são
configuradas no app WhatsApp Business (Ferramentas para a empresa).
Revisadas em 20/10/2026 com as regras da dona.

## Regras que valem em todas as mensagens
- Atendimento no WhatsApp: seg a dom, **8h às 22h**. Diaristas trabalham das
  6h às 19h. Região: toda a região de São Paulo.
- Pagamento **só por Pix**. Existe uma **garantia de R$ 10,00 paga antes do
  serviço e descontada do valor total** (só aparece no WhatsApp, nunca no
  site). Restante a pagar: 4h = R$ 150, 6h = R$ 189, 8h = R$ 220. Chave Pix: e-mail
  `contato.imperiodiarista@gmail.com`.
- **Materiais e produtos de limpeza: a cliente fornece.**
- Nunca pedir CPF, senha nem dados de cartão pelo chat.
- Ainda não há link de avaliação do Google (a Império vai cadastrar o serviço
  no Google depois): o `/obrigado` pede só o retorno pelo próprio WhatsApp.

## Configurações automáticas

**Mensagem de saudação** (1ª mensagem do cliente ou depois de 14 dias):

```
Olá, tudo bem? 😊 Seja bem-vindo(a) à Império Diarista!

Aqui você agenda sua diária direto pelo WhatsApp, de forma rápida. Atendemos todos os dias, das 8h às 22h, em toda a região de São Paulo.

Para começar, me conta: em qual bairro e cidade será o serviço?
```

**Mensagem de ausência** (horário personalizado: todos os dias, das 22h às 8h):

```
Olá! Obrigado pelo contato com a Império Diarista. 😊

Nosso atendimento é todos os dias, das 8h às 22h. Deixe aqui seu dia, horário, bairro e plano que respondemos assim que voltarmos!
```

## Mensagem que chega do site

Quem toca em "Contratar serviço" no site já recebe um **número de pedido**
(gerado pelo servidor, `IMP-000123`) e abre o WhatsApp com esta mensagem. O
cliente só toca em Enviar; campos que ele não preencheu não aparecem:

```
Pedido IMP-000123
Olá! Vim pelo site e gostaria de agendar uma limpeza.
Nome: Maria
Telefone: (11) 91234-5678
Plano: 6h (R$ 199,00)
Data: sáb., 25/10/2026
Horário: 09:00
Bairro/cidade: Mooca, São Paulo
Tipo: Limpeza comum
Observações: Apartamento, tenho um gato
```

- **Use esse código em tudo**: na conversa, no aviso do grupo e com a diarista.
  Ele aparece uma vez só por pedido (pequenos buracos na numeração acontecem
  quando alguém toca no botão e desiste).
- Se a mensagem vier **sem** `Pedido IMP-...` (servidor fora do ar ou cliente
  que chamou direto), a dona anota um código à mão ou pede para o cliente usar
  o site; não inventar número que possa repetir.
- Quando o pedido já vem com plano, data e bairro, **não envie `/dados` de
  novo**: confirme o que veio e peça só o que faltar (plano, horário, nome) e
  depois o endereço com `/endereco`.
- Dê o aviso para as diaristas com `/vaga`, em `mensagens-whatsapp-sos.md`.

## Respostas rápidas (atalhos)

Onde houver `[colchetes]`, a dona preenche antes de enviar.

**/valores**

```
Temos 3 opções de diária:

• 4 horas: R$ 160
• 6 horas: R$ 199
• 8 horas: R$ 230

O pagamento é feito por Pix. Para reservar o seu horário, pedimos uma garantia de R$ 10,00, paga antes do serviço e descontada do valor total. Os materiais e produtos de limpeza são fornecidos por você. Cancelamento sem perder a garantia: avise até 8h antes do horário marcado.

Qual combina mais com a sua casa? Se tiver dúvida, me diga o tamanho do imóvel e eu te ajudo a escolher. 😊
```

**/dados**

```
Perfeito! Para reservar, me envie:

• Plano (4h, 6h ou 8h)
• Data e horário de início
• Seu nome
• Bairro e cidade
• Casa, apartamento ou comercial?

Assim que eu confirmar a disponibilidade, peço o endereço completo. 😊
```

**/endereco**

```
Tem diarista disponível nesse dia e horário! ✅

Para fechar, me passe:
• Endereço (rua e número)
• CEP
• Complemento (se houver)

Usamos esses dados só para organizar o seu atendimento. Por segurança, não envie CPF, senhas ou dados de cartão por aqui.
```

**/garantia**

```
Para garantir o seu horário, pedimos uma garantia de R$ 10,00, paga antes do serviço, por Pix. Ela é descontada do valor total:

🔑 Chave Pix (e-mail): contato.imperiodiarista@gmail.com
👤 Nome: Debora Manoel

Cancelamentos ou remarcações devem ser avisados até 8 horas antes do horário marcado. Nesse caso, devolvemos a garantia ou usamos o valor na nova data. Sem aviso dentro do prazo, a garantia de R$ 10,00 não é devolvida.

Assim que o pagamento cair, enviamos a confirmação do agendamento. 😊
```

**/foraarea**

```
Obrigado pelo interesse! 😊

Infelizmente ainda não atendemos [bairro/cidade]. Hoje atendemos toda a região de São Paulo.

Se ampliarmos para a sua região, avisamos por aqui.
```

**/confirmado**

```
Agendamento confirmado! ✅

📅 [dia e data], às [horário]
🧹 Plano [4h/6h/8h] – R$ [valor]
✅ Garantia paga: R$ 10,00
💰 Restante a pagar: R$ [valor menos 10]
📍 [bairro]

Lembrando que os materiais e produtos de limpeza são fornecidos por você. Para cancelar ou remarcar sem perder a garantia, avise até 8h antes do horário marcado.

Na véspera, avisamos o nome da diarista e os detalhes. Qualquer dúvida, é só chamar por aqui! 😊
```

**/diarista**

```
Olá, [nome]! Sua diarista será a [nome da diarista], que chega por volta das [horário].

Como será:
• Ao chegar, ela conversa com você sobre as prioridades da limpeza
• Os materiais e produtos de limpeza ficam por sua conta
• O restante do pagamento é feito por Pix, conforme combinamos

Lembrando que a Império Diarista é uma plataforma que conecta clientes a diaristas independentes. Se precisar de algo durante o dia, fale com a gente por aqui.
```

**/lembrete**

```
Oi, [nome]! Passando para lembrar: amanhã, [dia], às [horário], a [diarista] vai até você em [bairro]. 🏠

Está tudo certo? Responda 👍 para confirmar. Se precisar remarcar, nos avise o quanto antes.
```

**/obrigado**

```
Oi, [nome]! Obrigado por escolher a Império Diarista 💗

Como foi o atendimento da [diarista]? Se puder, conte para a gente por aqui como foi a sua experiência.

Se algo não ficou como esperado, responda por aqui que a gente resolve.
```

## Etiquetas e ordem de uso

As mensagens são atalhos (a dona envia cada uma). Só a saudação e a ausência
são automáticas. Etiquetas em Ferramentas para a empresa > Etiquetas.

| Etapa | Etiqueta | Atalho a enviar |
|---|---|---|
| Cliente chama | Novo | (saudação automática) |
| Pergunta preço | Novo | `/valores` |
| Quer reservar (veio do site com `IMP-`) | Aguardando dados | confirmar o que veio; `/endereco` |
| Quer reservar (chamou direto) | Aguardando dados | `/dados`, depois `/endereco` |
| Pede a garantia | Aguardando garantia | `/garantia` |
| Pix caiu | Garantia paga | `/confirmado` |
| Véspera | Confirmado | `/diarista` e `/lembrete` |
| Depois do serviço | Concluído | `/obrigado` |

## Pendências
- (feito) Titular da chave Pix: Debora Manoel.
- (feito) A garantia de R$ 10,00 é descontada do valor total; o `/confirmado`
  mostra o restante a pagar (4h = R$ 150, 6h = R$ 189, 8h = R$ 220).
- (feito) Cancelamento (regra aplicada e confirmada pela dona em 20/10/2026): avisar
  até 8h antes do horário marcado; no prazo, devolve a garantia ou usa o valor
  na nova data; sem aviso, a Império fica com os R$ 10,00. Se quem cancela é a
  Império, devolve tudo. Está em `/valores`, `/garantia`, `/confirmado` e nos
  Termos de Uso.
- Quando existir o link de avaliação do Google, voltar a pedir a avaliação no
  `/obrigado`.
