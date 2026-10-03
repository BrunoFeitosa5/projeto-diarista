"use client";

import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";

type Props = {
  /** Nome lido pelo leitor de tela no botão de ampliar (ex.: "Agendamento Expresso") */
  rotulo: string;
  /** O card como aparece na página */
  children: ReactNode;
  /** O mesmo card, maior, mostrado na janela */
  ampliado: ReactNode;
  className?: string;
};

// Card que abre ampliado no centro da tela ao ser clicado (sem ocupar a tela toda).
// Um botão transparente cobre o card; links dentro dele (ex.: "Agendar agora") ficam por cima
// com `relative z-20` e continuam funcionando normalmente.
// Fecha no X, no Esc ou clicando fora. Usa <dialog>: foco e Esc já vêm do navegador.
export function CardAmpliavel({ rotulo, children, ampliado, className = "" }: Props) {
  const janela = useRef<HTMLDialogElement>(null);

  return (
    <div className={`relative ${className}`}>
      {children}
      <button
        type="button"
        aria-label={`Ampliar: ${rotulo}`}
        onClick={() => janela.current?.showModal()}
        className="absolute inset-0 z-10 cursor-zoom-in rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rosa-forte"
      />

      <dialog
        ref={janela}
        aria-label={rotulo}
        // Clique no fundo escuro (fora do conteúdo) fecha a janela
        onClick={(e) => e.target === e.currentTarget && janela.current?.close()}
        className="m-auto max-h-[90dvh] text-marinho max-w-[90vw] overflow-visible bg-transparent p-0 opacity-0 transition-[opacity,scale] duration-300 ease-out backdrop:bg-black/60 open:scale-100 open:opacity-100 starting:open:scale-90 starting:open:opacity-0 motion-reduce:transition-none"
      >
        <div className="relative">
          {ampliado}
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => janela.current?.close()}
            className="absolute -top-3 -right-3 z-30 flex size-10 items-center justify-center rounded-full bg-superficie text-marinho shadow-lg hover:bg-campo-hover focus-visible:outline-2 focus-visible:outline-rosa-forte"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </dialog>
    </div>
  );
}
