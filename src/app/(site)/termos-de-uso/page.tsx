import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata = { title: "Termos de Uso | Império Diarista" };

// RASCUNHO: o texto precisa ser revisado pela dona ou por um profissional antes do lançamento
// (CNPJ/razão social, prazos de cancelamento e regras de pagamento). Ao mudar, atualize a data.
const ATUALIZADA_EM = "19 de outubro de 2026";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-h4 font-semibold">{titulo}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function TermosDeUsoPage() {
  const whatsapp = linkWhatsApp("Olá, tenho uma dúvida sobre os termos de uso.");

  return (
    <section className="bg-bege px-4 py-14 md:py-20">
      <div className="mx-auto max-w-[760px]">
        <p className="text-pequeno">{SITE.nome}</p>
        <h1 className="mt-6 text-h2">Termos de Uso da Plataforma</h1>
        <p className="mt-4 text-pequeno text-texto-secundario">Última atualização: {ATUALIZADA_EM}</p>

        <p className="mt-8">
          Estes termos explicam como funciona o uso do site e dos serviços da {SITE.nome}. Ao agendar um
          serviço ou falar com a Império para ser diarista, você concorda com eles.
        </p>

        <Secao titulo="1. O que é a Império Diarista">
          <p>
            A {SITE.nome} é uma plataforma que conecta clientes a diaristas independentes e qualificadas.
            Não somos uma empresa de limpeza e não temos vínculo de emprego com as diaristas.
          </p>
        </Secao>

        <Secao titulo="2. Como o cliente agenda">
          <p>
            O agendamento é feito pelo WhatsApp. O cliente escolhe o plano (4, 6 ou 8 horas), informa o dia,
            o horário e o endereço, e a Império confirma a disponibilidade. Os valores dos planos estão na
            página inicial e podem mudar; vale o valor combinado no momento da confirmação.
          </p>
        </Secao>

        <Secao titulo="3. Pagamento">
          <p>
            O pagamento é feito por Pix ou cartão de crédito, por link de pagamento enviado pela Império.
            Não há pagamento antecipado: o valor é pago quando a diarista chega e começa o serviço.
          </p>
        </Secao>

        <Secao titulo="4. O que está incluso">
          <p>
            A limpeza completa dos cômodos da casa, incluindo banheiros e cozinha, dentro do tempo do plano
            escolhido. Alguns serviços não fazem parte da diária, como mover móveis pesados, limpar áreas
            externas sem segurança, jardinagem, cuidar de animais, lavar roupas, tapetes grandes e
            estofados, remover mofo e usar produtos abrasivos ou ácidos. Em caso de dúvida, pergunte pelo
            WhatsApp antes de agendar.
          </p>
        </Secao>

        <Secao titulo="5. Cancelamento e reagendamento">
          <p>
            Para cancelar ou mudar a data, avise a Império pelo WhatsApp o quanto antes, para que a diarista
            possa organizar a agenda dela.
          </p>
        </Secao>

        <Secao titulo="6. Cadastro de diaristas">
          <p>
            A diarista fala com a Império pelo WhatsApp, informa seus dados e passa por uma conferência de
            experiência e referências. Só diaristas verificadas entram no grupo de vagas e se candidatam aos
            serviços. A diarista se compromete a informar dados verdadeiros e a ser pontual e cuidadosa no
            atendimento.
          </p>
        </Secao>

        <Secao titulo="7. Seus dados">
          <p>
            O tratamento dos dados pessoais está descrito na{" "}
            <Link href="/privacidade" className="text-rosa-forte underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>
        </Secao>

        <Secao titulo="8. Contato">
          <p>
            Dúvidas sobre estes termos? Fale com a gente pelo{" "}
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rosa-forte underline underline-offset-2"
            >
              WhatsApp
            </a>{" "}
            ({SITE.telefoneExibicao}).
          </p>
        </Secao>
      </div>
    </section>
  );
}
