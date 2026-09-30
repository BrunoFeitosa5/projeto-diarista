"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoForm } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "./Aviso";

export function FormEntrar({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(entrar, null);

  return (
    <form action={acao} className="flex flex-col gap-5">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      <Campo rotulo="E-mail" name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required placeholder="Sua senha" />
      <Button type="submit" variante="rosa-forte" disabled={enviando} className="self-start">
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-pequeno">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-rosa-forte underline underline-offset-2">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
