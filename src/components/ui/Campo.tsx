import type { ComponentProps } from "react";

// Mesmo visual dos campos do formulário original (Trabalhe Conosco):
// fundo branco, 48px de altura, cantos de 8px e cinza-claro ao passar o mouse.
export const classeCampo =
  "h-12 w-full rounded-botao-lg border border-superficie bg-superficie px-4 text-corpo text-marinho transition-colors placeholder:text-texto-secundario/60 hover:bg-campo-hover focus:bg-campo-hover focus:outline-2 focus:outline-rosa-forte md:text-pequeno";

export const classeRotulo = "mb-2 block text-pequeno text-marinho";

type Props = ComponentProps<"input"> & { rotulo: string; name: string };

export function Campo({ rotulo, name, id, required, className = "", ...props }: Props) {
  const campoId = id ?? `campo-${name}`;
  return (
    <div>
      <label htmlFor={campoId} className={classeRotulo}>
        {rotulo}
        {required && "*"}
      </label>
      <input id={campoId} name={name} required={required} className={`${classeCampo} ${className}`} {...props} />
    </div>
  );
}
