"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { classeCampo, classeRotulo } from "@/components/ui/Campo";
import { mascaraCnpj, mascaraData, mascaraTelefone } from "@/lib/mascaras";

// Chave usada para levar os dados até o cadastro de diarista (etapa 7), que preenche o formulário.
// Fica só nesta aba do navegador (sessionStorage) — nunca na URL, que vai para histórico e logs.
export const CHAVE_PRE_CADASTRO = "pre-cadastro-diarista";

type Campos = { nome: string; cnpj: string; telefone: string; nascimento: string };

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
  { nome: "cnpj", rotulo: "CNPJ (MEI), se tiver", placeholder: "00.000.000/0001-00", obrigatorio: false, mascara: mascaraCnpj, tipo: "text", autoComplete: "off" },
  { nome: "telefone", rotulo: "Seu WhatsApp", placeholder: "(XX) XXXXX-XXXX", obrigatorio: true, mascara: mascaraTelefone, tipo: "tel", autoComplete: "tel-national" },
  { nome: "nascimento", rotulo: "Data de Nascimento", placeholder: "00/00/0000", obrigatorio: false, mascara: mascaraData, tipo: "text", autoComplete: "bday" },
];

// Formatos completos exigidos em cada campo com máscara
const PADROES: Partial<Record<keyof Campos, string>> = {
  cnpj: "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}",
  telefone: "\\(\\d{2}\\) \\d{4,5}-\\d{4}",
  nascimento: "\\d{2}/\\d{2}/\\d{4}",
};

export function FormTrabalheConosco() {
  const router = useRouter();
  const [valores, setValores] = useState<Campos>({ nome: "", cnpj: "", telefone: "", nascimento: "" });

  function alterar(campo: (typeof CAMPOS)[number]) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const valor = campo.mascara ? campo.mascara(e.target.value) : e.target.value;
      setValores((v) => ({ ...v, [campo.nome]: valor }));
    };
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      sessionStorage.setItem(CHAVE_PRE_CADASTRO, JSON.stringify(valores));
    } catch {
      // Sem sessionStorage (modo privado restrito): o cadastro abre em branco, sem prejuízo.
    }
    router.push("/cadastro?perfil=diarista");
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
        Quero ser diarista
      </Button>
    </form>
  );
}
