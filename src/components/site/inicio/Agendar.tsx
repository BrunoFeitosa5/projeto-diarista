import { FormAgendar } from "./FormAgendar";

export function Agendar() {
  return (
    <section id="agendar" className="scroll-mt-24 bg-bege px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-site items-start gap-10 md:grid-cols-2 md:gap-16 md:px-20">
        <div>
          <h2 className="text-h2">Com a Império você agenda em alguns minutos!</h2>
          <p className="mt-6">
            Deixe seu nome e telefone e continue o atendimento pelo WhatsApp: confirmamos o dia, o horário
            e a diarista para a sua casa.
          </p>
        </div>
        <FormAgendar />
      </div>
    </section>
  );
}
