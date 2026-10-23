import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { botaoClasses } from "@/components/ui/Button";
import { PLANOS, PLANO_IDS, formatarReais } from "@/config/planos";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

// Os planos vêm de planos.ts: se um preço mudar lá, a resposta muda sozinha.
const textoPlanos = PLANO_IDS.map((id) => {
  const { horas, precoCliente, metragem } = PLANOS[id];
  return `${horas} horas (${formatarReais(precoCliente)}): imóveis de ${metragem}`;
}).join("; ");

const PERGUNTAS: { pergunta: string; resposta: React.ReactNode }[] = [
  {
    pergunta: "Como faço para agendar?",
    resposta:
      "Toque em qualquer botão de agendar e fale com a gente no WhatsApp. Você informa o plano, o dia, o bairro e o endereço, e nós confirmamos a disponibilidade.",
  },
  {
    pergunta: "Preciso me cadastrar no site?",
    resposta: "Não. Não existe cadastro nem senha, nem para o cliente nem para a diarista: o atendimento é todo pelo WhatsApp.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta: "Pix. Os dados para o pagamento são enviados pela nossa equipe no WhatsApp.",
  },
  {
    pergunta: "O que está incluso na limpeza?",
    resposta:
      "A limpeza completa de todos os cômodos, incluindo banheiros e cozinha. Se quiser, peça extras como limpeza por dentro de gavetas, armários e geladeira, ou lavar a louça.",
  },
  {
    pergunta: "O que a diarista não faz?",
    resposta: (
      <>
        Por segurança e por não fazerem parte do serviço, não incluímos:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>limpar o lado de fora de janelas em locais sem segurança;</li>
          <li>mover móveis ou objetos pesados;</li>
          <li>limpar por dentro piscinas, churrasqueiras, decks, telhados e calhas;</li>
          <li>jardinagem;</li>
          <li>cuidar ou passear com animais;</li>
          <li>lavar tapetes grandes e estofados;</li>
          <li>lavar roupas;</li>
          <li>remover mofo de paredes e tetos;</li>
          <li>usar produtos abrasivos ou ácidos, ou remover tinta;</li>
          <li>retirar entulho de obra que não possa ser descartado no condomínio.</li>
        </ul>
      </>
    ),
  },
  {
    pergunta: "Qual plano devo escolher?",
    resposta: `Os planos são: ${textoPlanos}. Em dúvida, descreva a sua casa no WhatsApp e indicamos o melhor.`,
  },
  {
    pergunta: "As diaristas são verificadas?",
    resposta:
      "Sim. Antes de entrar na nossa equipe, cada diarista passa pela conferência da experiência e das referências.",
  },
  {
    pergunta: "Quais regiões vocês atendem?",
    resposta: `${SITE.regiao}. Em dúvida sobre o seu bairro, pergunte pelo WhatsApp.`,
  },
  {
    pergunta: "Qual é o horário de atendimento?",
    resposta: `${SITE.horarioAtendimento.replace("Atendimento no WhatsApp: ", "")}, pelo WhatsApp.`,
  },
  {
    pergunta: "Em que horários as diaristas trabalham?",
    resposta: `As diaristas trabalham de ${SITE.horarioDiaristas.replace("Seg a dom, das", "segunda a domingo, das")}.`,
  },
  {
    pergunta: "A Império é uma empresa de limpeza?",
    resposta:
      "Somos uma plataforma que conecta clientes a diaristas independentes e qualificadas, priorizando as profissionais mais bem avaliadas. Se precisar de ajuda, nossa equipe atende pelo WhatsApp.",
  },
  {
    pergunta: "Sou diarista. Como posso trabalhar com vocês?",
    resposta: (
      <>
        Chame a nossa equipe pelo WhatsApp. É só preencher os seus dados:{" "}
        <Link href="/trabalhe-conosco" className="text-rosa-forte underline underline-offset-2">
          FAÇA SEU CADASTRO
        </Link>
        .
      </>
    ),
  },
];

export function Duvidas() {
  return (
    <section id="duvidas" className="scroll-mt-24 bg-rosa-claro px-4 py-16 md:py-24">
      <div className="mx-auto max-w-[820px]">
        <h2 className="text-center text-h2">Ficou com dúvidas?</h2>

        <div className="mt-12 flex flex-col gap-3">
          {PERGUNTAS.map(({ pergunta, resposta }) => (
            <details key={pergunta} className="group rounded-card bg-superficie shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-6 py-5 text-h4 font-medium focus-visible:outline-2 focus-visible:outline-rosa-forte [&::-webkit-details-marker]:hidden">
                {pergunta}
                <ChevronDown
                  className="size-5 shrink-0 text-rosa-forte transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="px-6 pb-6 text-pequeno">{resposta}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p>Não encontrou o que procurava?</p>
          <a
            href={linkWhatsApp("Olá! Tenho uma dúvida sobre os serviços.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${botaoClasses("verde")} mt-4`}
          >
            Falar com a equipe no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
