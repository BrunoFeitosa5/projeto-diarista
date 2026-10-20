import { Star } from "lucide-react";
import { AVALIACOES } from "@/config/avaliacoes";

export function Avaliacoes() {
  if (AVALIACOES.length === 0) return null;

  return (
    <section id="avaliacoes" className="scroll-mt-24 bg-rosa-claro px-4 py-16 md:py-24">
      <div className="mx-auto max-w-site md:px-20">
        <h2 className="text-center text-h2">O que nossos clientes dizem</h2>
        <ul className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {AVALIACOES.map(({ nome, data, texto, nota }) => (
            <li key={`${nome}-${data}`} className="rounded-card bg-superficie px-6 pt-6 pb-8 shadow-lg">
              <p className="flex gap-1 text-rosa-forte" role="img" aria-label={`Nota ${nota} de 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-5" fill={i < nota ? "currentColor" : "none"} aria-hidden />
                ))}
              </p>
              <p className="mt-4 text-pequeno">{texto}</p>
              <p className="mt-4 font-medium">{nome}</p>
              <p className="text-pequeno text-texto-secundario">{data}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
