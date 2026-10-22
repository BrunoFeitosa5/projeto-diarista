"use client";

import type { MouseEvent } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { LINK_AGENDAR } from "@/config/site";
import type { PlanoId } from "@/config/planos";

export const EVENTO_ESCOLHER_PLANO = "escolher-plano";

// "Agendar agora" do card de preço: leva ao formulário já com o plano escolhido.
// Se o card estiver ampliado (<dialog>), fecha antes, senão ele cobriria a página.
export function BotaoPlano({ id }: { id: PlanoId }) {
  function escolher(e: MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.closest("dialog")?.close();
    window.dispatchEvent(new CustomEvent<PlanoId>(EVENTO_ESCOLHER_PLANO, { detail: id }));
  }

  return (
    <ButtonLink
      href={LINK_AGENDAR}
      onClick={escolher}
      variante="rosa-card"
      tamanho="card"
      // z-20: fica acima do botão invisível de ampliar do CardAmpliavel
      className="absolute bottom-[30px] z-20"
    >
      Agendar agora
    </ButtonLink>
  );
}
