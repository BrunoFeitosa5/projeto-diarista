"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { classeCampo, classeRotulo } from "@/components/ui/Campo";
import { mascaraData, mascaraTelefone } from "@/lib/mascaras";
import { linkWhatsAppDiaristas } from "@/lib/whatsapp";

// Chave do sessionStorage que o perfil da diarista (painel antigo, sem link no site) ainda lê.
export const CHAVE_PRE_CADASTRO = "pre-cadastro-diarista";

type Campos = { nome: string; telefone: string; nascimento: string };

const CAMPOS: {
  nome: keyof Campos;
  rotulo: string;
  placeholder: string;
  obrigatorio: boolean;
  mascara?: (v: string) => string;
  tipo: "text" | "tel";
  autoComplete: string;
}[] = [
  { nome: "nome", rotulo: "Seu Nome", placeholder: "Nome Completo", obrigatorio: true, tipo: "text", autoComplete: "name" },
  { nome: "telefone", rotulo: "Seu WhatsApp", placeholder: "(XX) XXXXX-XXXX", obrigatorio: true, mascara: mascaraTelefone, tipo: "tel", autoComplete: "tel-national" },
  { nome: "nascimento", rotulo: "Data de Nascimento", placeholder: "00/00/0000", obrigatorio: false, mascara: mascaraData, tipo: "text", autoComplete: "bday" },
];

// Formatos completos exigidos em cada campo com máscara
const PADROES: Partial<Record<keyof Campos, string>> = {
  telefone: "\\(\\d{2}\\) \\d{4,5}-\\d{4}",
  nascimento: "\\d{2}/\\d{2}/\\d{4}",
};

export function FormTrabalheConosco() {
  const [valores, setValores] = useState<Campos>({ nome: "", telefone: "", nascimento: "" });

  function alterar(campo: (typeof CAMPOS)[number]) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const valor = campo.mascara ? campo.mascara(e.target.value) : e.target.value;
      setValores((v) => ({ ...v, [campo.nome]: valor }));
    };
  }

  // Sem conta no site: os dados (nome, WhatsApp e nascimento) vão escritos na mensagem para o WhatsApp S.O.S Diaristas.
  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const linhas = [
      "Olá! Vim pelo site e quero ser diarista da Império.",
      `Nome: ${valores.nome.trim()}`,
      `WhatsApp: ${valores.telefone}`,
      valores.nascimento && `Nascimento: ${valores.nascimento}`,
    ].filter(Boolean);
    window.open(linkWhatsAppDiaristas(linhas.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      {CAMPOS.map((campo) => (
        <div key={campo.nome}>
          <label htmlFor={`tc-${campo.nome}`} className={classeRotulo}>
            {campo.rotulo}
            {campo.obrigatorio && "*"}
          </label>
          <input
            id={`tc-${campo.nome}`}
            name={campo.nome}
            type={campo.tipo}
            inputMode={campo.mascara ? "numeric" : undefined}
            autoComplete={campo.autoComplete}
            required={campo.obrigatorio}
            pattern={PADROES[campo.nome]}
            title={PADROES[campo.nome] ? `Use o formato ${campo.placeholder}` : undefined}
            placeholder={campo.placeholder}
            value={valores[campo.nome]}
            onChange={alterar(campo)}
            className={classeCampo}
          />
        </div>
      ))}
      <Button type="submit" variante="verde-form" className="mt-0.5 self-start">
        Quero ser diarista pelo WhatsApp
      </Button>
    </form>
  );
}
