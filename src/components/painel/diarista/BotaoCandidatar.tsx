"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { candidatar } from "@/actions/diarista";
import { Button, botaoClasses } from "@/components/ui/Button";
import { linkWhatsAppDiaristas } from "@/lib/whatsapp";

type Props = { pedidoId: string; codigo: string; nomeDiarista: string; jaCandidatou: boolean; perfilCompleto: boolean; verificada: boolean };

// Candidata a diarista e mostra o botão para avisar a dona no WhatsApp.
// O WhatsApp abre por um clique da própria diarista (abrir sozinho seria bloqueado pelo navegador).
export function BotaoCandidatar({ pedidoId, codigo, nomeDiarista, jaCandidatou, perfilCompleto, verificada }: Props) {
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (!perfilCompleto) {
    return (
      <Link href="/diarista/perfil" className="text-pequeno text-rosa-forte underline underline-offset-2">
        Complete seu perfil para se candidatar
      </Link>
    );
  }

  if (!verificada && !jaCandidatou) {
    return (
      <span className="text-pequeno text-texto-secundario md:text-right">
        Disponível depois que a Império
        <br className="hidden md:inline" /> verificar seu cadastro
      </span>
    );
  }

  if (jaCandidatou) {
    const mensagem = `Olá! Sou a diarista ${nomeDiarista} e me candidatei à vaga ${codigo} da Império Diarista.`;
    return (
      <div className="flex flex-col items-start gap-2 md:items-end">
        <span className="text-pequeno font-medium text-marinho">✓ Candidatura enviada</span>
        <a
          href={linkWhatsAppDiaristas(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          className={botaoClasses("verde", "padrao", "py-3! text-pequeno!")}
        >
          Avisar a Império no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <Button
        type="button"
        variante="rosa-forte"
        disabled={enviando}
        className="py-3! text-pequeno!"
        onClick={() =>
          iniciar(async () => {
            setErro(null);
            const resultado = await candidatar(pedidoId);
            if ("erro" in resultado) setErro(resultado.erro);
          })
        }
      >
        {enviando ? "Enviando..." : "Me candidatar"}
      </Button>
      {erro && (
        <p role="alert" className="text-pequeno text-rosa-forte">
          {erro}
        </p>
      )}
    </div>
  );
}
