"use client";

import { useEffect } from "react";
import { botaoClasses } from "@/components/ui/Button";

type Props = { href: string; codigo: string; abrirSozinho: boolean };

const ESPERA_MS = 2500;

// Logo depois de criar o pedido, leva o cliente para o WhatsApp da Império com os
// detalhes já escritos. Abre uma vez só por pedido (o "voltar" do navegador não repete);
// o botão fica na tela para quem quiser enviar de novo ou se o navegador não abrir.
export function EnviarPedidoWhatsApp({ href, codigo, abrirSozinho }: Props) {
  useEffect(() => {
    if (!abrirSozinho) return;
    const chave = `whatsapp-pedido-${codigo}`;
    try {
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {
      // Sem sessionStorage: só o botão aparece, para não correr o risco de abrir em loop
      return;
    }
    const espera = setTimeout(() => {
      window.location.href = href;
    }, ESPERA_MS);
    return () => clearTimeout(espera);
  }, [abrirSozinho, codigo, href]);

  return (
    <div className="rounded-card border-l-4 border-rosa-forte bg-superficie p-6">
      <p className="font-medium">Envie o pedido para a Império no WhatsApp</p>
      <p className="mt-1 text-texto-secundario">
        {abrirSozinho
          ? "Vamos abrir o WhatsApp com os detalhes do pedido já escritos. É só tocar em Enviar. Se não abrir, use o botão."
          : "A conversa abre com os detalhes do pedido já escritos. É só tocar em Enviar."}
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer" className={botaoClasses("verde", "padrao", "mt-4")}>
        Enviar pedido no WhatsApp
      </a>
    </div>
  );
}
