"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { classeCampo, classeRotulo } from "@/components/ui/Campo";
import { mascaraTelefone } from "@/lib/mascaras";
import { linkWhatsApp } from "@/lib/whatsapp";

// "Agende em minutos": o cliente deixa nome e telefone e abre o WhatsApp com os dados escritos.
// Nada é gravado no site; a conversa continua só pelo WhatsApp.
export function FormAgendar() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const mensagem = `Olá! Vim pelo site e gostaria de agendar uma limpeza.\nNome: ${nome.trim()}\nTelefone: ${telefone}`;
    window.open(linkWhatsApp(mensagem), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div>
        <label htmlFor="agendar-nome" className={classeRotulo}>
          Nome*
        </label>
        <input
          id="agendar-nome"
          name="nome"
          autoComplete="name"
          required
          minLength={2}
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="agendar-telefone" className={classeRotulo}>
          Telefone*
        </label>
        <input
          id="agendar-telefone"
          name="telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          placeholder="(XX) XXXXX-XXXX"
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          title="Use o formato (11) 91234-5678"
          value={telefone}
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          className={classeCampo}
        />
      </div>
      <Button type="submit" variante="verde" className="self-start">
        Quero agendar agora!
      </Button>
    </form>
  );
}
