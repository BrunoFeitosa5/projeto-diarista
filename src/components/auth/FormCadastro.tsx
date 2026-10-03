"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { cadastrar, type EstadoForm } from "@/actions/auth";
import { CHAVE_PRE_CADASTRO } from "@/components/site/FormTrabalheConosco";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { mascaraTelefone } from "@/lib/mascaras";
import { Aviso } from "./Aviso";

type PapelCadastro = "cliente" | "diarista";

const OPCOES: { valor: PapelCadastro; titulo: string; descricao: string }[] = [
  { valor: "cliente", titulo: "Quero contratar", descricao: "Agende diárias para sua casa ou escritório." },
  { valor: "diarista", titulo: "Sou diarista", descricao: "Veja vagas e se candidate aos serviços." },
];

export function FormCadastro({ papelInicial }: { papelInicial: PapelCadastro }) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(cadastrar, null);
  const [papel, setPapel] = useState<PapelCadastro>(papelInicial);
  const [contato, setContato] = useState({ nome: "", telefone: "" });

  // Quem veio do "Trabalhe Conosco" já chega com nome e telefone preenchidos.
  // Lido depois de montar: o sessionStorage não existe no servidor.
  useEffect(() => {
    if (papelInicial !== "diarista") return;
    try {
      const salvo = JSON.parse(sessionStorage.getItem(CHAVE_PRE_CADASTRO) ?? "null");
      if (salvo) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do sessionStorage
        setContato({ nome: salvo.nome ?? "", telefone: salvo.telefone ?? "" });
      }
    } catch {
      // sessionStorage indisponível: o formulário só fica em branco
    }
  }, [papelInicial]);

  if (estado?.sucesso) {
    return <Aviso tipo="sucesso">{estado.sucesso}</Aviso>;
  }

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <fieldset>
        <legend className="mb-2 text-pequeno text-marinho">Você é*</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {OPCOES.map((opcao) => (
            <label
              key={opcao.valor}
              className="cursor-pointer rounded-botao-lg border-2 border-superficie bg-superficie p-4 transition-colors hover:bg-campo-hover has-checked:border-rosa-forte has-focus-visible:outline-2 has-focus-visible:outline-rosa-forte"
            >
              <input
                type="radio"
                name="papel"
                value={opcao.valor}
                checked={papel === opcao.valor}
                onChange={() => setPapel(opcao.valor)}
                className="sr-only"
              />
              <span className="block font-medium text-marinho">{opcao.titulo}</span>
              <span className="mt-1 block text-pequeno text-texto-secundario">{opcao.descricao}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Campo
        rotulo="Nome completo"
        name="nome"
        autoComplete="name"
        required
        minLength={3}
        value={contato.nome}
        onChange={(e) => setContato((c) => ({ ...c, nome: e.target.value }))}
      />
      <Campo
        rotulo="WhatsApp"
        name="telefone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required
        placeholder="(XX) XXXXX-XXXX"
        pattern="\(\d{2}\) \d{4,5}-\d{4}"
        title="Use o formato (11) 91234-5678"
        value={contato.telefone}
        onChange={(e) => setContato((c) => ({ ...c, telefone: mascaraTelefone(e.target.value) }))}
      />
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="new-password" required minLength={8} placeholder="Mínimo de 8 caracteres" />
      <Campo rotulo="Confirme a senha" name="confirmacao" type="password" autoComplete="new-password" required minLength={8} />

      {papel === "diarista" && (
        <p className="text-pequeno text-texto-secundario">
          Depois de entrar, complete seu perfil com CPF, chave Pix e sua experiência para poder se candidatar às vagas.
        </p>
      )}

      <p className="text-pequeno text-texto-secundario">
        Ao criar a conta, você confirma que tem 18 anos ou mais e que leu a{" "}
        <Link href="/privacidade" target="_blank" className="text-rosa-forte underline underline-offset-2">
          Política de Privacidade
        </Link>
        .
      </p>

      <Button type="submit" variante="rosa-forte" disabled={enviando} className="self-start">
        {enviando ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-pequeno">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-rosa-forte underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </form>
  );
}
