import { botaoClasses } from "@/components/ui/Button";
import { CardAmpliavel } from "@/components/ui/CardAmpliavel";
import { MENSAGEM_AGENDAR } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

const PASSOS = [
  {
    titulo: "Escolha o serviço",
    texto: "Escolha o plano de 4, 6 ou 8 horas, de acordo com o tamanho da sua casa.",
  },
  {
    titulo: "Data e horário",
    texto:
      "Informe pelo WhatsApp o melhor dia e horário. Nós confirmamos a disponibilidade e tiramos as suas dúvidas.",
  },
  {
    titulo: "Aproveite",
    texto:
      "Você recebe o nome da diarista e é só aguardar a data combinada. Uma profissional verificada vai até você.",
  },
];

function Numero({ n, classe }: { n: number; classe: string }) {
  return (
    <span className={`flex items-center justify-center rounded-icone bg-menta font-medium text-marinho ${classe}`}>
      {n}
    </span>
  );
}

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-bege px-4 py-16 md:py-24">
      <div className="mx-auto max-w-site md:px-20">
        <h2 className="text-center text-h2">Como funciona</h2>
        <p className="mx-auto mt-6 max-w-[620px] text-center">
          Sem cadastro e sem burocracia: todo o atendimento é feito pelo WhatsApp, em três passos.
        </p>

        <ol className="mt-12 grid gap-5 md:grid-cols-3 md:gap-8">
          {PASSOS.map(({ titulo, texto }, i) => (
            <li key={titulo}>
              {/* Cresce ao passar o mouse e abre ampliado ao clicar (como as Vantagens) */}
              <CardAmpliavel
                rotulo={`Passo ${i + 1}: ${titulo}`}
                className="group rounded-card transition-transform duration-300 ease-out hover:z-10 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
                ampliado={
                  <article className="w-[560px] max-w-[90vw] rounded-card bg-superficie px-8 pt-8 pb-10 shadow-2xl md:px-12 md:pt-12 md:pb-14">
                    <Numero n={i + 1} classe="size-20 text-h2" />
                    <h3 className="mt-6 text-h2">{titulo}</h3>
                    <p className="mt-6 text-h4 font-normal">{texto}</p>
                  </article>
                }
              >
                <article className="rounded-card bg-superficie px-8 pt-8 pb-10 shadow-lg transition-shadow duration-300 group-hover:shadow-2xl md:min-h-[300px]">
                  <Numero n={i + 1} classe="size-16 text-h3" />
                  <h3 className="mt-6 text-h3 font-medium">{titulo}</h3>
                  <p className="mt-4">{texto}</p>
                </article>
              </CardAmpliavel>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <a
            href={linkWhatsApp(MENSAGEM_AGENDAR)}
            target="_blank"
            rel="noopener noreferrer"
            className={botaoClasses("verde")}
          >
            Garanta sua casa brilhando agora
          </a>
        </div>
      </div>
    </section>
  );
}
