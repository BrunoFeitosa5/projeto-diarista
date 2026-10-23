import { FormAgendar } from "./FormAgendar";

export function Agendar() {
  return (
    <section className="bg-bege px-4 py-16 md:py-24">
      {/* O destino dos botões "Agendar agora" é este bloco (e não a seção): a tela para
          direto no título, sem a faixa de respiro de cima. scroll-mt-14 = altura da barra rosa fixa. */}
      <div
        id="agendar"
        className="mx-auto grid max-w-site scroll-mt-14 items-start gap-10 md:grid-cols-2 md:gap-16 md:px-20"
      >
        <div>
          <h2 className="text-h2">Com a Império você agenda em alguns minutos!</h2>
          <p className="mt-6">
            Preencha os dados, gere o número do seu pedido e continue o atendimento pelo WhatsApp:
            confirmamos o dia, o horário e a diarista para a sua casa.
          </p>
        </div>
        <FormAgendar />
      </div>
    </section>
  );
}
