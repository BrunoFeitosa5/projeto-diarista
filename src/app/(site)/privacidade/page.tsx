import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata = { title: "Política de Privacidade | Império Diarista" };

// RASCUNHO: o texto precisa ser revisado pela dona ou por um profissional antes do lançamento.
// Ao mudar o texto, atualize a data abaixo.
const ATUALIZADA_EM = "20 de outubro de 2026";

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
            O site não tem cadastro, login nem senha para clientes ou diaristas. Os dados chegam pela
            conversa no WhatsApp, quando você mesmo os envia.
          </p>
          <p>
            <strong>De clientes:</strong> nome, telefone (WhatsApp), endereço do serviço (rua, número,
            complemento, bairro, cidade e ponto de referência), data, horário, plano escolhido e
            observações. Se você preencher o formulário &quot;Nome e Telefone&quot; do site, esses dados
            vão escritos na mensagem que abre no seu WhatsApp. O site não guarda o que você digitou ali.
          </p>
          <p>
            <strong>De diaristas:</strong> nome, telefone (WhatsApp) e, se informada, a data de nascimento,
            enviados pelo formulário &quot;Trabalhe Conosco&quot; (que também só abre o WhatsApp). Para
            conferir a experiência e liberar a diarista para as vagas, a {SITE.nome} pode pedir pela
            conversa um resumo da experiência, CPF, chave Pix (para o repasse) e o nome e o telefone de uma
            pessoa de referência. A diarista só deve indicar uma referência que concordou em ser procurada,
            e usamos esse contato apenas para pedir informações sobre o trabalho dela.
          </p>
          <p>
            <strong>Automaticamente:</strong> registros técnicos de acesso ao site, como endereço IP e data
            e hora, guardados pelo serviço que hospeda o site.
          </p>
          <p>
            <strong>Equipe:</strong> a administração da {SITE.nome} tem uma área restrita, com e-mail e
            senha, usada só por quem trabalha na empresa.
          </p>
        </Secao>

        <Secao titulo="3. Para que usamos">
          <Lista
            itens={[
              "Receber o pedido de limpeza e organizar o atendimento.",
              "Avisar as diaristas verificadas sobre as vagas e escolher quem vai atender.",
              "Verificar as diaristas (experiência, CPF e referências), para a segurança dos clientes.",
              "Pagar o repasse à diarista pela chave Pix.",
              "Falar com você pelo WhatsApp sobre o seu pedido ou o seu cadastro como diarista.",
              "Cumprir obrigações legais e nos defender em caso de reclamação ou processo.",
            ]}
          />
          <p>
            Usamos esses dados com base na execução do serviço que você pediu, no cumprimento de obrigações
            legais e no nosso legítimo interesse em manter o serviço seguro (artigo 7º da LGPD). Não
            vendemos seus dados e não os usamos para propaganda de terceiros.
          </p>
        </Secao>

        <Secao titulo="4. Quem vê os seus dados">
          <Lista
            itens={[
              <>
                <strong>A equipe da {SITE.nome}</strong> vê os dados necessários para atender o pedido,
                verificar diaristas e fazer os pagamentos.
              </>,
              <>
                <strong>O grupo de diaristas no WhatsApp</strong> recebe o aviso da vaga com apenas o
                código, a data, o plano, o bairro e a cidade. Nunca o endereço completo, o seu nome ou o
                seu telefone.
              </>,
              <>
                <strong>A diarista escolhida</strong> para o seu serviço recebe da {SITE.nome} os dados
                para chegar até você: endereço completo, ponto de referência, observações e o seu nome. Da
                mesma forma, você recebe o nome da diarista que vai atender. O telefone de cada um fica só
                com a {SITE.nome}, que faz a comunicação entre os dois.
              </>,
              <>
                <strong>CPF, chave Pix, experiência e referência</strong> das diaristas ficam só com a{" "}
                {SITE.nome}. Clientes não têm acesso a eles.
              </>,
            ]}
          />
        </Secao>

        <Secao titulo="5. Serviços de terceiros">
          <p>Para funcionar, usamos alguns serviços externos:</p>
          <Lista
            itens={[
              "WhatsApp: o atendimento acontece no aplicativo, que segue a política de privacidade dele. Ao clicar nos botões de WhatsApp do site, você sai do nosso site e vai para o aplicativo.",
              "Vercel: hospeda o site. Os registros técnicos de acesso podem ser processados em servidores fora do Brasil, inclusive nos Estados Unidos, com as proteções exigidas pela LGPD.",
              "Supabase: guarda o banco de dados da área restrita da equipe e faz o login dela. Os dados ficam em servidores em São Paulo.",
            ]}
          />
          <p>Também podemos compartilhar dados quando a lei ou uma autoridade exigir.</p>
        </Secao>

        <Secao titulo="6. Cookies e armazenamento no navegador">
          <p>
            O site não usa cookies de propaganda nem de rastreamento. O navegador guarda apenas a sua
            escolha de tema claro ou escuro, e a área restrita da equipe usa cookies necessários para
            manter o login.
          </p>
        </Secao>

        <Secao titulo="7. Por quanto tempo guardamos">
          <p>
            Guardamos os dados enquanto forem necessários para o atendimento. Depois que você pedir a
            exclusão, apagamos ou tornamos anônimos os dados, exceto os que a lei nos obriga a manter (por
            exemplo, registros de pedidos e pagamentos, pelo prazo legal) ou que sejam necessários para nos
            defender em uma reclamação. Você também pode apagar a conversa do seu lado no WhatsApp.
          </p>
        </Secao>

        <Secao titulo="8. Como protegemos">
          <p>
            A conexão com o site é sempre criptografada (HTTPS), o acesso à área restrita é limitado à
            equipe e os dados mais sensíveis ficam separados dos demais. Nenhum sistema é 100% seguro: se
            acontecer um incidente que possa trazer risco a você, avisaremos você e a Autoridade Nacional
            de Proteção de Dados (ANPD).
          </p>
        </Secao>

        <Secao titulo="9. Seus direitos">
          <p>Pela LGPD, você pode pedir a qualquer momento:</p>
          <Lista
            itens={[
              "Confirmação de que tratamos seus dados e uma cópia deles.",
              "Correção de dados incompletos ou errados.",
              "Exclusão dos dados que não precisamos manter por lei.",
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
          <p>
            Os serviços são destinados a maiores de 18 anos. Não cadastramos diaristas menores de idade.
          </p>
        </Secao>

        <Secao titulo="11. Mudanças nesta política">
          <p>Podemos atualizar esta política. A data da última atualização fica no topo da página.</p>
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
