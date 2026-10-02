import Link from "next/link";
import { NAV_LINKS, SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

// No site original o rodapé mostra Início, Serviços, Segurança e Contato.
const LINKS_RODAPE = [
  ...NAV_LINKS.filter((l) => l.href !== "/trabalhe-conosco"),
  { href: linkWhatsApp("Olá, gostaria de realizar um agendamento."), label: "Contato" },
];

const rotulo = "text-pequeno tracking-[0.16em] text-rosa-forte";

export function Footer() {
  return (
    <footer className="bg-bege px-4 text-marinho">
      <div className="mx-auto max-w-site py-12 md:px-20 md:pt-12 md:pb-10">
        <div className="grid gap-10 text-center md:grid-cols-[418px_358px_1fr] md:gap-0 md:text-left">
          <div>
            <span className="mx-auto block h-[3px] w-12 bg-rosa-forte md:mx-0" />
            <h3 className="mt-4 mb-2.5 text-h3">{SITE.nome}</h3>
            <p className="max-w-[360px] max-md:mx-auto">{SITE.slogan}</p>
          </div>

          <div className="md:pt-5">
            <p className={rotulo}>Navegação</p>
            <ul className="mt-3">
              {LINKS_RODAPE.map(({ href, label }) => (
                <li key={label} className="mb-1.5">
                  <Link href={href} className="text-pequeno tracking-[0.12em] hover:text-rosa-forte">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:pt-[19px]">
            <p className={rotulo}>Atendimento</p>
            <div className="mt-3 space-y-1">
              <p>{SITE.telefoneExibicao}</p>
              <p>{SITE.horarioAtendimento}</p>
              <p>{SITE.regiao}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-marinho pt-4 text-center md:mt-20 md:flex-row md:justify-between md:text-left">
          <p className="text-pequeno md:pl-1">
            {SITE.nome} <span className="text-rosa-botao-hover">- </span>
            {SITE.rodapeResumo}
            {/* Acréscimo ao original: link exigido pela LGPD */}
            <span className="text-rosa-botao-hover"> - </span>
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-rosa-forte">
              Política de Privacidade
            </Link>
          </p>
          <p className={rotulo}>{SITE.rodapeServicos}</p>
        </div>
      </div>
    </footer>
  );
}
