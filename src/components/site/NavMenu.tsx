"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/config/site";
import { BotaoTema } from "./BotaoTema";

// Links com # (seções da página inicial) nunca ficam marcados como página atual
function ativo(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavMenu() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const links = NAV_LINKS.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      onClick={() => setAberto(false)}
      aria-current={ativo(pathname, href) ? "page" : undefined}
      className="border-b border-transparent pb-0.5 font-nav text-corpo text-texto-menu aria-[current=page]:border-texto-menu hover:border-texto-menu"
    >
      {label}
    </Link>
  ));

  return (
    <>
      {/* Desktop */}
      {/* O botão de tema (lua/sol) é acréscimo ao original */}
      <nav className="hidden items-center gap-10 md:flex">
        {links}
        <BotaoTema />
      </nav>

      {/* Celular: tema fica sempre visível, ao lado do ☰ */}
      <div className="flex items-center gap-2 md:hidden">
        <BotaoTema />
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-celular"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
        >
          <span className={`h-0.5 w-6 bg-texto-menu transition ${aberto ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-texto-menu transition ${aberto ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-texto-menu transition ${aberto ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>
      {aberto && (
        <nav
          id="menu-celular"
          className="absolute inset-x-0 top-full z-40 flex flex-col items-center gap-6 border-t border-borda bg-superficie py-8 shadow-md md:hidden"
        >
          {links}
        </nav>
      )}
    </>
  );
}
