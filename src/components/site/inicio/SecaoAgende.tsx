import { CircleDollarSign, Clock, UserCheck, type LucideIcon } from "lucide-react";

type Vantagem = { icone: LucideIcon; titulo: string; texto: string; destaque?: boolean };

const VANTAGENS: Vantagem[] = [
  {
    icone: Clock,
    titulo: "Agendamento Expresso",
    texto:
      "Escolha o dia, horário e tipo de limpeza em menos de dois minutos. Sem burocracia, sem complicação.",
  },
  {
    icone: UserCheck,
    titulo: "Profissionais Verificadas",
    texto:
      "Todas as diaristas passam por rigorosa checagem de antecedentes e avaliações constantes de qualidade.",
    destaque: true,
  },
  {
    icone: CircleDollarSign,
    titulo: "Preço Fixo e Transparente",
    texto:
      "Saiba exatamente quanto vai pagar antes de confirmar. Sem surpresas, sem taxas escondidas.",
  },
];

// Original: título a 128px do topo, texto a 277px, cards (344x353) a 352px.
export function SecaoAgende() {
  return (
    <section className="bg-rosa-claro px-4 py-16 md:min-h-[953px] md:pt-[128px] md:pb-0">
      <div className="mx-auto max-w-site md:px-20">
        <h2 className="text-h2">Agende de forma simples e segura.</h2>
        <p className="mt-6 md:mt-[93px]">
          Nossa plataforma foi pensada para tornar sua experiência simples, segura e transparente, do
          primeiro clique até a realização do serviço.
        </p>

        <div className="mt-10 grid gap-3 md:mt-[49px] md:w-[1056px] md:grid-cols-3">
          {VANTAGENS.map(({ icone: Icone, titulo, texto, destaque }) => (
            <article
              key={titulo}
              className={`rounded-card px-[23px] pt-6 pb-8 shadow-lg md:h-[353px] ${
                destaque ? "bg-rosa-card-ativo" : "bg-rosa-card"
              }`}
            >
              <span className="flex size-12 items-center justify-center rounded-icone bg-menta">
                <Icone className="size-6 text-marinho" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-h3 md:min-h-[82px]">{titulo}</h3>
              <p className="mt-4 text-pequeno md:mt-8">{texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
