import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { IMAGENS } from "@/config/imagens";

export const metadata = { title: "Segurança | Império Diarista" };

export default function SegurancaPage() {
  return (
    <>
      {/* Original (813px): rótulo a 113px, título a 170px (508px de largura),
          texto a 511px, botão a 646px; foto 612x600 a 104px do topo, à direita. */}
      <section className="bg-rosa-claro px-4 py-14 md:min-h-[813px] md:pt-[104px] md:pb-0">
        <div className="mx-auto grid max-w-site items-start gap-10 md:grid-cols-[508px_612px] md:gap-6 md:px-20">
          <div className="md:pt-[9px]">
            <p className="text-pequeno">Império Diarista</p>
            <h1 className="mt-6 text-h1 md:mt-[31px]">
              Profissionais <strong>Verificadas</strong> para Sua Tranquilidade
            </h1>
            <p className="mt-6 md:mt-[47px]">
              Entendemos que a confiança é a base de qualquer serviço doméstico. Nossa plataforma
              garante a segurança e a qualidade que você merece, com um processo de seleção rigoroso e
              transparente.
            </p>
            <ButtonLink href="/cliente/novo-pedido" variante="rosa-forte" className="mt-8 md:mt-[51px]">
              Agendar Diária Com Segurança
            </ButtonLink>
          </div>

          <div className="relative aspect-[612/600] w-full overflow-hidden rounded-botao-lg">
            <Image
              src={IMAGENS.seguranca!}
              alt="Diarista sorrindo, de uniforme rosa, numa sala limpa e organizada"
              fill
              sizes="(min-width: 768px) 612px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Faixa rosa-forte (396px): rótulo a 54px, título a 104px e texto a 305px, centralizados em 700px. */}
      <section className="bg-rosa-forte px-4 py-14 text-center text-white md:min-h-[396px] md:pt-[54px] md:pb-10">
        <div className="mx-auto max-w-[700px]">
          <p className="text-pequeno">IMPÉRIO DIARISTA</p>
          <h2 className="mt-6 text-h2 md:mt-6">
            Respeito, Transparência e <strong>Valorização</strong> do Trabalho Doméstico
          </h2>
          <p className="mt-6 md:mt-[33px]">
            Acreditamos que um serviço de excelência começa com o reconhecimento e o tratamento justo de
            nossos profissionais. Promovemos um ambiente de trabalho digno e transparente, refletindo
            diretamente na qualidade do serviço prestado em sua casa.
          </p>
        </div>
      </section>
    </>
  );
}
