import { CircleDollarSign, Clock, UserCheck, type LucideIcon } from "lucide-react";
import { CardAmpliavel } from "@/components/ui/CardAmpliavel";

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

function Icone({ icone: Icone, classe, tamanho }: { icone: LucideIcon; classe: string; tamanho: string }) {
  return (
    <span className={`flex items-center justify-center rounded-icone bg-menta ${classe}`}>
      <Icone className={`text-marinho ${tamanho}`} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

// Acréscimo ao original: o card cresce ao passar o mouse e abre ampliado ao clicar
function CardVantagem({ icone, titulo, texto, destaque }: Vantagem) {
  const fundo = destaque ? "bg-rosa-card-ativo" : "bg-rosa-card";
  return (
    <CardAmpliavel
      rotulo={titulo}
      className="group rounded-card transition duration-300 ease-out hover:z-10 hover:scale-105 motion-reduce:transition-none"
      ampliado={
        <article className={`w-[560px] max-w-[90vw] rounded-card px-8 pt-8 pb-10 shadow-2xl md:px-12 md:pt-12 md:pb-14 ${fundo}`}>
          <Icone icone={icone} classe="size-16" tamanho="size-8" />
          <h3 className="mt-6 text-h2">{titulo}</h3>
          <p className="mt-6 text-h4 font-normal">{texto}</p>
        </article>
      }
    >
      <article className={`rounded-card px-[23px] pt-6 pb-8 shadow-lg transition-shadow duration-300 group-hover:shadow-2xl md:h-[353px] ${fundo}`}>
        <Icone icone={icone} classe="size-12" tamanho="size-6" />
        <h3 className="mt-5 text-h3 md:min-h-[82px]">{titulo}</h3>
        <p className="mt-4 text-pequeno md:mt-8">{texto}</p>
      </article>
    </CardAmpliavel>
  );
}

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
          {VANTAGENS.map((vantagem) => (
            <CardVantagem key={vantagem.titulo} {...vantagem} />
          ))}
        </div>
      </div>
    </section>
  );
}
