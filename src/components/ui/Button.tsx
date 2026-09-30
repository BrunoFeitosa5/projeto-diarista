import Link from "next/link";
import type { ComponentProps } from "react";

// Cada variante reproduz um botão do site original (cor normal + cor ao passar o mouse).
type Variante = "rosa" | "rosa-card" | "rosa-chamada" | "verde";
type Tamanho = "padrao" | "card";

const base =
  "inline-flex items-center justify-center font-medium text-white transition-colors disabled:opacity-60";

const variantes: Record<Variante, string> = {
  rosa: "bg-rosa-botao hover:bg-rosa-botao-hover",
  // Cards de preço: no original o fundo fica transparente ao passar o mouse
  "rosa-card": "bg-rosa-botao hover:bg-transparent hover:ring-1 hover:ring-white",
  // Faixa "Pronto para uma Casa Impecável?": escurece ao passar o mouse
  "rosa-chamada": "bg-rosa-botao hover:bg-texto-secundario",
  verde: "bg-verde hover:bg-verde-hover",
};

const tamanhos: Record<Tamanho, string> = {
  padrao: "rounded-botao-lg px-7 py-[17px] text-botao max-md:px-6 max-md:py-[15px]",
  card: "h-14 w-[170px] rounded-botao text-corpo",
};

export function botaoClasses(variante: Variante = "rosa", tamanho: Tamanho = "padrao", extra = "") {
  return `${base} ${variantes[variante]} ${tamanhos[tamanho]} ${extra}`.trim();
}

type Opcoes = { variante?: Variante; tamanho?: Tamanho };

export function Button({
  variante,
  tamanho,
  className = "",
  ...props
}: ComponentProps<"button"> & Opcoes) {
  return <button className={botaoClasses(variante, tamanho, className)} {...props} />;
}

export function ButtonLink({
  variante,
  tamanho,
  className = "",
  ...props
}: ComponentProps<typeof Link> & Opcoes) {
  return <Link className={botaoClasses(variante, tamanho, className)} {...props} />;
}
