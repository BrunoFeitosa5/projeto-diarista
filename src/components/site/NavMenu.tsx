"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/config/site";

function ativo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavMenu() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  // "Entrar" não existe no site original: é a porta de entrada da plataforma de pedidos
  const links = [...NAV_LINKS, { href: "/entrar", label: "Entrar" }].map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      onClick={() => setAberto(false)}
      aria-current={ativo(pathname, href) ? "page" : undefined}
      className="border-b border-transparent pb-0.5 font-nav text-corpo text-black aria-[current=page]:border-black hover:border-black"
    >
      {label}
    </Link>
  ));

  return (
    <>
      {/* Desktop */}
      <nav className="hidden items-center gap-10 md:flex">{links}</nav>

      {/* Celular */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="menu-celular"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
      >
        <span className={`h-0.5 w-6 bg-black transition ${aberto ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-6 bg-black transition ${aberto ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-6 bg-black transition ${aberto ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>
      {aberto && (
        <nav
          id="menu-celular"
          className="absolute inset-x-0 top-full z-40 flex flex-col items-center gap-6 border-t border-borda bg-white py-8 shadow-md md:hidden"
        >
          {links}
        </nav>
      )}
    </>
  );
}
