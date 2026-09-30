import { IMAGENS } from "@/config/imagens";
import { PlanoCard } from "./PlanoCard";

export function SecaoPlanos() {
  return (
    <section className="bg-rosa-claro px-4 py-12 md:min-h-[703px] md:pt-[63px]">
      <div className="mx-auto max-w-site">
        <h2 className="text-center font-destaque text-[32px] leading-[1.3] font-bold text-rosa-destaque italic">
          FAXINA E PASSADORIA
        </h2>
        <div className="mt-10 grid gap-3 md:mt-[50px] md:grid-cols-3">
          <PlanoCard id="4h" foto={IMAGENS.plano4h!} />
          <PlanoCard id="6h" foto={IMAGENS.plano6h!} />
          <PlanoCard id="8h" foto={IMAGENS.plano8h!} />
        </div>
      </div>
    </section>
  );
}
