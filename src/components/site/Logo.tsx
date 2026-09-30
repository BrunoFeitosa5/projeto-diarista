import Link from "next/link";
import { SITE } from "@/config/site";

// PROVISÓRIO: quando a dona enviar o arquivo do logo, salvar em public/img/logo.png
// e trocar o conteúdo do Link por <Image src="/img/logo.png" ... /> (next/image).
export function Logo() {
  return (
    <Link
      href="/"
      aria-label={`${SITE.nome} — início`}
      className="flex w-[86px] flex-col items-center justify-center py-3 text-center md:w-[111px]"
    >
      <span className="font-titulo text-[22px] leading-none font-medium tracking-wide text-rosa-forte md:text-[26px]">
        IMPÉRIO
      </span>
      <span className="mt-1 font-nav text-[9px] tracking-[0.35em] text-rosa-forte md:text-[10px]">
        DIARISTA
      </span>
    </Link>
  );
}
