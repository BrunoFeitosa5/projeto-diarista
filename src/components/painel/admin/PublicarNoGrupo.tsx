"use client";

import { useState, useTransition } from "react";
import type { ResultadoAdmin } from "@/actions/admin";
import { botaoClasses } from "@/components/ui/Button";

type Props = {
  // Link wa.me com o aviso pronto (a dona escolhe o grupo na lista do WhatsApp)
  href: string;
  // Server Action já com o id do pedido (marcarPublicadoGrupo.bind(null, id))
  marcar: () => Promise<ResultadoAdmin>;
  // Data/hora já formatada, ou null se ainda não publicou
  publicadoEm: string | null;
};

// Um toque só: abre o WhatsApp com o aviso e já marca o pedido como publicado,
// para ele sair da fila "Publicar no grupo".
export function PublicarNoGrupo({ href, marcar, publicadoEm }: Props) {
  const [, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={botaoClasses(publicadoEm ? "rosa-forte" : "verde", "padrao", "py-3! text-pequeno!")}
        onClick={() =>
          iniciar(async () => {
            setErro(null);
            const resultado = await marcar();
            if ("erro" in resultado) setErro(resultado.erro);
          })
        }
      >
        {publicadoEm ? "Publicar de novo no grupo" : "Publicar no grupo"}
      </a>
      <span className="text-pequeno text-texto-secundario">
        {publicadoEm
          ? `Publicado em ${publicadoEm}. Se publicar de novo, escolha o grupo na lista do WhatsApp.`
          : "Abre o WhatsApp com o aviso pronto. Escolha o grupo das diaristas e toque em Enviar."}
      </span>
      {erro && (
        <p role="alert" className="text-pequeno text-rosa-forte">
          {erro}
        </p>
      )}
    </div>
  );
}
