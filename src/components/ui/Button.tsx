import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "rosa" | "verde";

const base =
  "inline-flex items-center justify-center rounded-botao px-7 py-[17px] text-botao font-medium text-white transition-colors disabled:opacity-60 max-md:px-6 max-md:py-[15px]";

const variantes: Record<Variante, string> = {
  rosa: "bg-rosa-botao hover:bg-rosa-botao-hover",
  verde: "bg-verde hover:bg-verde-hover",
};

export function botaoClasses(variante: Variante = "rosa", extra = "") {
  return `${base} ${variantes[variante]} ${extra}`.trim();
}

type ButtonProps = ComponentProps<"button"> & { variante?: Variante };

export function Button({ variante = "rosa", className = "", ...props }: ButtonProps) {
  return <button className={botaoClasses(variante, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variante?: Variante };

export function ButtonLink({ variante = "rosa", className = "", ...props }: ButtonLinkProps) {
  return <Link className={botaoClasses(variante, className)} {...props} />;
}
