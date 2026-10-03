import Image from "next/image";
import Link from "next/link";
import { IMAGENS } from "@/config/imagens";
import { SITE } from "@/config/site";

// Largura do original: 111px no desktop e 86px no celular (arquivo de 375x484).
// O arquivo tem fundo branco: no modo escuro ele vira um "selo" com cantos arredondados.
export function Logo() {
  return (
    <Link href="/" aria-label={`${SITE.nome} — início`} className="block w-[86px] dark:overflow-hidden dark:rounded-icone md:w-[111px]">
      <Image
        src={IMAGENS.logo!}
        alt={SITE.nome}
        width={375}
        height={484}
        priority
        sizes="111px"
        className="h-auto w-full"
      />
    </Link>
  );
}
