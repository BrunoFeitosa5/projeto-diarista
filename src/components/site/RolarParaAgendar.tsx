"use client";

import { useEffect } from "react";
import { LINK_AGENDAR } from "@/config/site";

// Todo botão "Agendar agora"/"Agende agora" aponta para /#agendar. Se o endereço já termina
// em #agendar (a pessoa foi ao formulário, subiu e tocou de novo), o navegador não rola, porque
// o endereço não mudou. Aqui o clique é interceptado na Início e a rolagem é feita à mão,
// sempre. Em outras páginas o link navega normalmente para a Início.
export function RolarParaAgendar() {
  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.location.pathname !== "/") return;
      const link = e.target instanceof Element ? e.target.closest(`a[href="${LINK_AGENDAR}"]`) : null;
      if (!link) return;

      e.preventDefault();
      // Espera os outros cliques do botão (ex.: fechar o card ampliado) terminarem antes de rolar
      setTimeout(() => {
        const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("agendar")?.scrollIntoView({ behavior: reduzir ? "auto" : "smooth", block: "start" });
      }, 0);
    }

    // Fase de captura: roda antes do <Link> do Next, que respeita o preventDefault
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  return null;
}
