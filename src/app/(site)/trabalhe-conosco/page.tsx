import { FormTrabalheConosco } from "@/components/site/FormTrabalheConosco";

export const metadata = { title: "Trabalhe Conosco | Império Diarista" };

// Original (701px): texto à esquerda (433px, a partir de 80px) e formulário à direita (611px, a partir de 515px).
export default function TrabalheConoscoPage() {
  return (
    <section className="bg-bege px-4 py-14 md:min-h-[701px] md:py-20">
      <div className="mx-auto grid max-w-site items-center gap-10 md:grid-cols-[433px_611px] md:gap-[2px] md:px-20">
        <div>
          <p className="text-pequeno">Fale Conosco</p>
          {/* No print original o título quebra em 3 linhas (caixa de ~370px) */}
          <h1 className="mt-6 text-h2 md:mt-[42px] md:max-w-[370px]">Venha fazer parte do nosso time</h1>
          <p className="mt-6 md:mt-[42px] md:max-w-[404px]">
            Tem dúvidas sobre agendamento ou precisa de suporte? Nossa equipe está pronta para responder
            suas perguntas com atenção e eficiência. Use o formulário abaixo.
          </p>
        </div>
        <FormTrabalheConosco />
      </div>
    </section>
  );
}
