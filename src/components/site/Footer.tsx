import Link from "next/link";
import { MENSAGEM_AGENDAR, NAV_LINKS, SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

// O rodapé repete o menu do topo e acrescenta Serviços, Segurança e Contato (WhatsApp).
// Não há link de login no site: a admin entra direto por /entrar.
const LINKS_RODAPE = [
  ...NAV_LINKS,
  { href: "/servicos", label: "Serviços" },
  { href: "/seguranca", label: "Segurança" },
  { href: linkWhatsApp(MENSAGEM_AGENDAR), label: "Contato" },
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
              <p>
                {/* Acréscimo ao original: o telefone abre o WhatsApp da dona */}
                <a
                  href={linkWhatsApp("Olá! Vim pelo site da Império Diarista.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Falar no WhatsApp: ${SITE.telefoneExibicao}`}
                  className="underline-offset-2 hover:text-rosa-forte hover:underline"
                >
                  {SITE.telefoneExibicao}
                </a>
              </p>
              <p>{SITE.horarioAtendimento}</p>
              <p>Diaristas: {SITE.horarioDiaristas}</p>
              <p>{SITE.regiao}</p>
              {SITE.instagram && (
                <p>
                  <a
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-rosa-forte hover:underline"
                  >
                    Instagram
                  </a>
                </p>
              )}
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
            <span className="text-rosa-botao-hover"> - </span>
            <Link href="/termos-de-uso" className="underline underline-offset-2 hover:text-rosa-forte">
              Termos de Uso
            </Link>
          </p>
          <p className={rotulo}>{SITE.rodapeServicos}</p>
        </div>
      </div>
    </footer>
  );
}
