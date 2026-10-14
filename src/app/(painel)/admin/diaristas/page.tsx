import Link from "next/link";
import type { ReactNode } from "react";
import { verificarDiarista } from "@/actions/admin";
import { BotaoAcaoAdmin } from "@/components/painel/admin/BotaoAcaoAdmin";
import { exigirPapel } from "@/lib/auth";
import { mascaraCnpj, mascaraCpf, mascaraTelefone } from "@/lib/mascaras";
import { linkWhatsAppPara } from "@/lib/whatsapp";

export const metadata = { title: "Diaristas | Administração | Império Diarista" };

type Diarista = { id: string; nome: string; telefone: string | null; created_at: string };
type Privado = {
  diarista_id: string;
  cpf: string | null;
  cnpj: string | null;
  referencia_nome: string | null;
  referencia_telefone: string | null;
  experiencia: string | null;
};
type Verificada = { diarista_id: string; verificada_em: string };

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" });

export default async function DiaristasAdminPage() {
  const { supabase } = await exigirPapel("admin");

  const [{ data: diaristas, error }, { data: privados }, { data: verificadas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, telefone, created_at")
      .eq("papel", "diarista")
      .order("created_at", { ascending: false })
      .overrideTypes<Diarista[], { merge: false }>(),
    supabase
      .from("diaristas_privado")
      .select("diarista_id, cpf, cnpj, referencia_nome, referencia_telefone, experiencia")
      .overrideTypes<Privado[], { merge: false }>(),
    supabase
      .from("diaristas_verificadas")
      .select("diarista_id, verificada_em")
      .overrideTypes<Verificada[], { merge: false }>(),
  ]);

  const verificadaEm = new Map((verificadas ?? []).map((v) => [v.diarista_id, v.verificada_em]));
  const lista = diaristas ?? [];
  // Quem ainda espera a conferência da dona vem primeiro
  const pendentes = lista.filter((d) => !verificadaEm.has(d.id));
  const aprovadas = lista.filter((d) => verificadaEm.has(d.id));

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <Link href="/admin" className="text-pequeno text-rosa-forte underline underline-offset-2">
        ← Pedidos
      </Link>
      <h1 className="mt-6 text-h2">Diaristas</h1>
      <p className="mt-2 text-texto-secundario">
        Confira a referência e a experiência e toque em Verificar. Só a diarista verificada vê o link do grupo do
        WhatsApp.
      </p>

      {error && <p className="mt-8 text-texto-secundario">Não foi possível carregar as diaristas agora.</p>}

      {!error && (
        <>
          <Grupo titulo={`Aguardando verificação (${pendentes.length})`} vazio="Nenhuma diarista aguardando.">
            {pendentes.map((d) => (
              <Cartao key={d.id} diarista={d} privado={privados?.find((p) => p.diarista_id === d.id)} verificada={false} />
            ))}
          </Grupo>
          <Grupo titulo={`Verificadas (${aprovadas.length})`} vazio="Nenhuma diarista verificada ainda.">
            {aprovadas.map((d) => (
              <Cartao
                key={d.id}
                diarista={d}
                privado={privados?.find((p) => p.diarista_id === d.id)}
                verificada
                verificadaEm={verificadaEm.get(d.id)}
              />
            ))}
          </Grupo>
        </>
      )}
    </section>
  );
}

function Grupo({ titulo, vazio, children }: { titulo: string; vazio: string; children: ReactNode[] }) {
  return (
    <div className="mt-10">
      <h2 className="text-h3">{titulo}</h2>
      {children.length === 0 ? (
        <div className="mt-6 rounded-card bg-superficie p-8">
          <p className="text-texto-secundario">{vazio}</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">{children}</ul>
      )}
    </div>
  );
}

function Cartao({
  diarista,
  privado,
  verificada,
  verificadaEm,
}: {
  diarista: Diarista;
  privado: Privado | undefined;
  verificada: boolean;
  verificadaEm?: string;
}) {
  const referenciaTelefone = privado?.referencia_telefone ? mascaraTelefone(privado.referencia_telefone) : null;
  const nome = diarista.nome || "esta diarista";
  return (
    <li className="flex flex-col rounded-card bg-superficie">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borda px-6 py-4">
        <p className="text-h4">{diarista.nome || "—"}</p>
        <p className="text-pequeno text-texto-secundario">
          {verificada && verificadaEm
            ? `Verificada em ${dataCurta(verificadaEm)}`
            : `Cadastrada em ${dataCurta(diarista.created_at)}`}
        </p>
      </div>
      <dl className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
        <Dado rotulo="WhatsApp">
          {diarista.telefone ? (
            <>
              {diarista.telefone}{" "}
              <a
                href={linkWhatsAppPara(diarista.telefone, "Olá! Aqui é da Império Diarista.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pequeno text-rosa-forte underline underline-offset-2"
              >
                WhatsApp
              </a>
            </>
          ) : (
            "—"
          )}
        </Dado>
        <Dado rotulo="CPF">{privado?.cpf ? mascaraCpf(privado.cpf) : "Perfil não preenchido"}</Dado>
        <Dado rotulo="CNPJ">{privado?.cnpj ? mascaraCnpj(privado.cnpj) : "—"}</Dado>
        <Dado rotulo="Referência">
          {privado?.referencia_nome ? (
            <>
              {privado.referencia_nome}
              <br />
              {referenciaTelefone}{" "}
              {referenciaTelefone && (
                <a
                  href={linkWhatsAppPara(
                    referenciaTelefone,
                    `Olá! Aqui é da Império Diarista. ${diarista.nome || "Uma diarista"} indicou você como referência. Pode falar um minuto?`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pequeno text-rosa-forte underline underline-offset-2"
                >
                  WhatsApp
                </a>
              )}
            </>
          ) : (
            "Não informou"
          )}
        </Dado>
        <div className="sm:col-span-2">
          <Dado rotulo="Experiência">
            <span className="whitespace-pre-line">{privado?.experiencia ?? "—"}</span>
          </Dado>
        </div>
      </dl>
      <div className="border-t border-borda px-6 py-4">
        {verificada ? (
          <BotaoAcaoAdmin
            acao={verificarDiarista.bind(null, diarista.id, false)}
            rotulo="Remover verificação"
            confirmacao={`Remover a verificação de ${nome}? Ela deixa de ver o link do grupo.`}
          />
        ) : (
          <BotaoAcaoAdmin
            acao={verificarDiarista.bind(null, diarista.id, true)}
            rotulo="Verificar diarista"
            variante="verde"
            confirmacao={`Verificar ${nome}? Ela passa a ver o link do grupo.`}
          />
        )}
      </div>
    </li>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-pequeno text-texto-secundario">{rotulo}</dt>
      <dd className="mt-1 break-words text-marinho">{children}</dd>
    </div>
  );
}
