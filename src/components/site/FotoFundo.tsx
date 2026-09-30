import Image from "next/image";

type Props = {
  src: string | null;
  // Degradê usado enquanto não há foto (classes Tailwind com tokens do tema)
  provisorio: string;
  // Camada escura por cima da foto para o texto branco ficar legível ("" = sem camada)
  escurecer?: string;
  prioridade?: boolean;
};

// Foto que ocupa todo o fundo do elemento pai (o pai precisa ter `relative`).
export function FotoFundo({ src, provisorio, escurecer = "bg-black/40", prioridade }: Props) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {src ? (
        <Image src={src} alt="" fill priority={prioridade} sizes="100vw" className="object-cover" />
      ) : (
        <div className={`absolute inset-0 ${provisorio}`} />
      )}
      {escurecer && <div className={`absolute inset-0 ${escurecer}`} />}
    </div>
  );
}
