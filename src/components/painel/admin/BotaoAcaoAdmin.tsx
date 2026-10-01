"use client";

import { useState, useTransition } from "react";
import type { ResultadoAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/Button";

type Props = {
  // Server Action já com os argumentos (ex.: aprovarCandidatura.bind(null, id))
  acao: () => Promise<ResultadoAdmin>;
  rotulo: string;
  variante?: "rosa-forte" | "verde";
  // Se informado, pede um segundo clique de confirmação mostrando este texto
  confirmacao?: string;
};

export function BotaoAcaoAdmin({ acao, rotulo, variante = "rosa-forte", confirmacao }: Props) {
  const [enviando, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function executar() {
    iniciar(async () => {
      setErro(null);
      const resultado = await acao();
      setConfirmando(false);
      if ("erro" in resultado) setErro(resultado.erro);
    });
  }

  const classe = "py-3! text-pequeno!";

  return (
    <div className="flex flex-col items-start gap-2">
      {confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-pequeno font-medium">{confirmacao}</span>
          <Button type="button" variante="rosa-forte" disabled={enviando} className={classe} onClick={executar}>
            {enviando ? "Aguarde..." : "Sim, confirmar"}
          </Button>
          <button
            type="button"
            disabled={enviando}
            onClick={() => setConfirmando(false)}
            className="text-pequeno text-texto-secundario underline underline-offset-2"
          >
            Voltar
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variante={variante}
          disabled={enviando}
          className={classe}
          onClick={() => (confirmacao ? setConfirmando(true) : executar())}
        >
          {enviando ? "Aguarde..." : rotulo}
        </Button>
      )}
      {erro && (
        <p role="alert" className="text-pequeno text-rosa-forte">
          {erro}
        </p>
      )}
    </div>
  );
}
