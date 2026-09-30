import type { ReactNode } from "react";

// Caixa de mensagem dos formulários. role="alert" faz o leitor de tela anunciar.
export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  const cores = tipo === "erro" ? "border-rosa-forte bg-white text-marinho" : "border-verde bg-white text-marinho";
  return (
    <p role="alert" className={`rounded-botao-lg border-l-4 px-4 py-3 text-pequeno ${cores}`}>
      {children}
    </p>
  );
}
