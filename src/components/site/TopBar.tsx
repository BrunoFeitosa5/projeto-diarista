import { SITE } from "@/config/site";

// Barra rosa fixa no topo (no site original ela continua visível ao rolar a página).
export function TopBar() {
  return (
    <div className="sticky top-0 z-50 flex min-h-10 items-center justify-center bg-rosa-topo px-4 text-center">
      <p className="font-nav text-corpo leading-[1.3] font-light text-white">{SITE.faixaTopo}</p>
    </div>
  );
}
