"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Chave no localStorage e atributo no <html>. O script em src/app/layout.tsx lê a mesma
// chave antes da página aparecer, para não piscar o tema claro.
export const CHAVE_TEMA = "tema";

function escuroAgora() {
  return document.documentElement.dataset.tema === "escuro";
}

// Avisa o React quando o atributo data-tema do <html> muda
function observar(aoMudar: () => void) {
  const observador = new MutationObserver(aoMudar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  return () => observador.disconnect();
}

// Lua = ativar o modo escuro; sol = voltar ao claro. O padrão é o claro, igual ao site original.
export function BotaoTema() {
  // No servidor não dá para saber a escolha: começa como claro e corrige no navegador
  const escuro = useSyncExternalStore(observar, escuroAgora, () => false);

  function alternar() {
    const novo = !escuro;
    if (novo) document.documentElement.dataset.tema = "escuro";
    else delete document.documentElement.dataset.tema;
    try {
      localStorage.setItem(CHAVE_TEMA, novo ? "escuro" : "claro");
    } catch {
      // Sem localStorage (modo privado restrito): vale só até fechar a página
    }
  }

  const Icone = escuro ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? "Usar modo claro" : "Usar modo escuro"}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className="flex size-10 items-center justify-center rounded-full text-texto-menu transition-colors hover:bg-campo-hover focus-visible:outline-2 focus-visible:outline-rosa-forte"
    >
      <Icone className="size-5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
