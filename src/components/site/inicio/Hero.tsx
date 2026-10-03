import { FotoFundo } from "@/components/site/FotoFundo";
import { ButtonLink } from "@/components/ui/Button";
import { IMAGENS } from "@/config/imagens";

// Posições do original (grid de 1224px): título a 157px do topo, subtítulo a 346px, botão a 451px.
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[514px] items-start px-4 md:min-h-[862px]">
      <FotoFundo
        src={IMAGENS.hero}
        prioridade
        provisorio="bg-linear-to-br from-rosa-forte via-rosa-botao to-marinho"
        // Escurecimento medido no print do site original (parede: 247 → 128, fator ~0,52)
        escurecer="bg-black/48"
      />
      <div className="mx-auto flex w-full max-w-[878px] flex-col items-center pt-24 pb-16 text-center text-texto-foto md:pt-[157px]">
        <h1 className="text-h1">
          Sua Casa <strong>Impecável</strong>, Sem Complicação
        </h1>
        <p className="mt-8 md:mt-[42px]">
          Profissionais qualificadas, atendimento de confiança e limpeza impecável para transformar sua
          rotina.
        </p>
        <ButtonLink href="/servicos" variante="verde" className="mt-10 md:mt-[79px]">
          Ver Serviços e Preços
        </ButtonLink>
      </div>
    </section>
  );
}
