import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata = { title: "Política de Privacidade | Império Diarista" };

// RASCUNHO: o texto precisa ser revisado pela dona ou por um profissional antes do lançamento.
// Ao mudar o texto, atualize a data abaixo.
const ATUALIZADA_EM = "2 de outubro de 2026";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-semibold">{titulo}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Lista({ itens }: { itens: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {itens.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const linkContato = "text-rosa-forte underline underline-offset-2";

export default function PrivacidadePage() {
  const whatsapp = linkWhatsApp("Olá, tenho uma dúvida sobre meus dados pessoais.");

  return (
    <section className="bg-bege px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[760px]">
        <p className="text-pequeno">{SITE.nome}</p>
        <h1 className="mt-6 text-h2">Política de Privacidade</h1>
        <p className="mt-4 text-pequeno text-texto-secundario">Última atualização: {ATUALIZADA_EM}</p>

        <p className="mt-8">
          Esta política explica, de forma simples, quais dados pessoais a {SITE.nome} coleta, para que usa,
          com quem compartilha e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados
          (LGPD, Lei nº 13.709/2018). Ela vale para clientes (quem contrata a limpeza), diaristas (quem
          presta o serviço) e visitantes do site.
        </p>

        <Secao titulo="1. Quem cuida dos seus dados">
          <p>
            A {SITE.nome} é a responsável (controladora) pelos dados tratados neste site. Para qualquer
            assunto sobre seus dados, fale com a gente pelo{" "}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkContato}>
              WhatsApp
            </a>{" "}
            ({SITE.telefoneExibicao}).
          </p>
        </Secao>

        <Secao titulo="2. Quais dados coletamos">
          <p>
            <strong>De todos que criam conta:</strong> nome, telefone (WhatsApp), e-mail e senha. A senha é
            guardada de forma criptografada e nem a equipe da {SITE.nome} consegue vê-la.
          </p>
          <p>
            <strong>De clientes, ao agendar:</strong> endereço do serviço (CEP, rua, número, complemento,
            bairro, cidade e ponto de referência), data, horário, plano escolhido e observações.
          </p>
          <p>
            <strong>De diaristas, no perfil:</strong> CPF, chave Pix (e o tipo da chave) e, se informados,
            CNPJ (MEI) e data de nascimento. Também registramos as vagas às quais a diarista se candidatou.
          </p>
          <p>
            <strong>Automaticamente:</strong> o histórico de cada pedido (mudanças de status, com data e
            quem fez a mudança) e registros técnicos de acesso, como endereço IP e data e hora, guardados
            pelos serviços que hospedam o site.
          </p>
        </Secao>

        <Secao titulo="3. Para que usamos">
          <Lista
            itens={[
              "Criar e proteger sua conta e permitir o login.",
              "Receber o pedido de limpeza, mostrar a vaga às diaristas e organizar o atendimento.",
              "Avaliar as candidaturas e verificar a identidade das diaristas (CPF e, se houver, CNPJ), para a segurança dos clientes.",
              "Pagar o repasse à diarista pela chave Pix.",
              "Falar com você pelo WhatsApp ou e-mail sobre o seu pedido ou a sua conta.",
              "Cumprir obrigações legais e nos defender em caso de reclamação ou processo.",
            ]}
          />
          <p>
            Usamos esses dados com base na execução do serviço que você pediu, no cumprimento de obrigações
            legais e no nosso legítimo interesse em manter a plataforma segura (artigo 7º da LGPD). Não
            vendemos seus dados e não os usamos para propaganda de terceiros.
          </p>
        </Secao>

        <Secao titulo="4. Quem vê os seus dados">
          <Lista
            itens={[
              <>
                <strong>Diaristas cadastradas</strong> veem, na lista de vagas, apenas o bairro, a cidade, a
                data, o horário e as observações do pedido. Por isso, não escreva dados pessoais nas
                observações.
              </>,
              <>
                <strong>A diarista aprovada</strong> para o seu pedido passa a ver o endereço completo, o seu
                nome e o seu telefone. Da mesma forma, o cliente passa a ver o nome e o telefone da
                diarista aprovada.
              </>,
              <>
                <strong>A equipe da {SITE.nome}</strong> (administração) vê os dados necessários para
                aprovar diaristas, acompanhar os pedidos e fazer os pagamentos.
              </>,
              <>
                <strong>CPF, CNPJ, data de nascimento e chave Pix</strong> das diaristas ficam visíveis só
                para a própria diarista e para a administração. Clientes não têm acesso a eles.
              </>,
            ]}
          />
        </Secao>

        <Secao titulo="5. Serviços de terceiros">
          <p>Para funcionar, o site usa alguns serviços externos:</p>
          <Lista
            itens={[
              "Supabase: guarda o banco de dados e faz o login. Os dados ficam em servidores em São Paulo.",
              "Vercel: hospeda o site. Os registros técnicos de acesso podem ser processados em servidores fora do Brasil, inclusive nos Estados Unidos, com as proteções exigidas pela LGPD.",
              "ViaCEP: quando você digita o CEP, só o CEP é enviado para buscar a rua, o bairro e a cidade.",
              "WhatsApp: ao clicar nos botões de WhatsApp, a conversa acontece no aplicativo, que segue a política de privacidade dele.",
            ]}
          />
          <p>Também podemos compartilhar dados quando a lei ou uma autoridade exigir.</p>
        </Secao>

        <Secao titulo="6. Cookies e armazenamento no navegador">
          <p>
            Usamos apenas cookies necessários para manter você conectado à sua conta. Não usamos cookies de
            propaganda nem de rastreamento.
          </p>
          <p>
            Quem preenche o formulário Trabalhe Conosco tem os dados (nome, CNPJ, telefone e nascimento)
            guardados temporariamente no próprio navegador, só para preencher o cadastro. Eles somem ao fechar
            a aba.
          </p>
        </Secao>

        <Secao titulo="7. Por quanto tempo guardamos">
          <p>
            Guardamos os dados da conta enquanto ela estiver ativa. Depois que você pedir a exclusão,
            apagamos ou tornamos anônimos os dados, exceto os que a lei nos obriga a manter (por exemplo,
            registros de pedidos e pagamentos, pelo prazo legal) ou que sejam necessários para nos defender
            em uma reclamação.
          </p>
        </Secao>

        <Secao titulo="8. Como protegemos">
          <p>
            O acesso aos dados é controlado por perfil (cliente, diarista ou administração) diretamente no
            banco de dados, a conexão com o site é sempre criptografada (HTTPS) e os dados mais sensíveis
            ficam separados dos demais. Nenhum sistema é 100% seguro: se acontecer um incidente que possa
            trazer risco a você, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Secao>

        <Secao titulo="9. Seus direitos">
          <p>Pela LGPD, você pode pedir a qualquer momento:</p>
          <Lista
            itens={[
              "Confirmação de que tratamos seus dados e uma cópia deles.",
              "Correção de dados incompletos ou errados.",
              "Exclusão da conta e dos dados que não precisamos manter por lei.",
              "Informação sobre com quem compartilhamos seus dados.",
              "Revisão ou oposição a um uso que você considere indevido.",
            ]}
          />
          <p>
            Para isso, fale com a gente pelo{" "}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkContato}>
              WhatsApp
            </a>
            . Podemos pedir uma confirmação de identidade antes de atender, para proteger você. Você também
            pode reclamar à ANPD (gov.br/anpd).
          </p>
        </Secao>

        <Secao titulo="10. Menores de idade">
          <p>O site é destinado a maiores de 18 anos. Não criamos contas para menores de idade.</p>
        </Secao>

        <Secao titulo="11. Mudanças nesta política">
          <p>
            Podemos atualizar esta política. A data da última atualização fica no topo da página e, se a
            mudança for importante, avisaremos quem tem conta.
          </p>
        </Secao>

        <p className="mt-12">
          <Link href="/" className={linkContato}>
            Voltar para o início
          </Link>
        </p>
      </div>
    </section>
  );
}
