import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { aprovarCandidatura, mudarStatus } from "@/actions/admin";
import { BotaoAcaoAdmin } from "@/components/painel/admin/BotaoAcaoAdmin";
import { EtiquetaStatus } from "@/components/painel/EtiquetaStatus";
import { formatarData, formatarHorario } from "@/config/agendamento";
import { formatarReais, PLANOS, textoRepasse, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import { mascaraCnpj, mascaraCpf } from "@/lib/mascaras";
import { PODE_CANCELAR, PROXIMO_STATUS, STATUS, type StatusPedido } from "@/lib/status";
import { linkWhatsAppPara } from "@/lib/whatsapp";

export const metadata = { title: "Pedido | Administração | Império Diarista" };

type Pessoa = { id: string; nome: string; telefone: string | null };
type Pedido = {
  id: string;
  codigo: string;
  plano: PlanoId;
  valor_cliente: number;
  valor_diarista: number;
  data: string;
  horario: string;
  bairro: string;
  cidade: string;
  observacoes: string | null;
  status: StatusPedido;
  created_at: string;
  cliente: Pessoa | null;
  diarista: Pessoa | null;
};
type Endereco = { cep: string; rua: string; numero: string; complemento: string | null; referencia: string | null };
type Candidatura = { id: string; status: "pendente" | "aprovada" | "recusada"; created_at: string; diarista: Pessoa | null };
type Privado = { diarista_id: string; cpf: string | null; cnpj: string | null; chave_pix: string | null; tipo_chave_pix: string | null };
type Historico = { id: number; status_anterior: StatusPedido | null; status_novo: StatusPedido; alterado_por: string | null; created_at: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

const NOME_CANDIDATURA = { pendente: "Aguardando", aprovada: "Aprovada", recusada: "Não selecionada" };

export default async function PedidoAdminPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { supabase } = await exigirPapel("admin");
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select(
      "id, codigo, plano, valor_cliente, valor_diarista, data, horario, bairro, cidade, observacoes, status, created_at, " +
        "cliente:profiles!pedidos_cliente_id_fkey(id, nome, telefone), diarista:profiles!pedidos_diarista_id_fkey(id, nome, telefone)",
    )
    .eq("id", id)
    .maybeSingle<Pedido>();
  if (!pedido) notFound();

  const [{ data: endereco }, { data: candidaturas }, { data: historico }] = await Promise.all([
    supabase.from("pedido_enderecos").select("cep, rua, numero, complemento, referencia").eq("pedido_id", id).maybeSingle<Endereco>(),
    supabase
      .from("candidaturas")
      .select("id, status, created_at, diarista:profiles!candidaturas_diarista_id_fkey(id, nome, telefone)")
      .eq("pedido_id", id)
      .order("created_at", { ascending: true })
      .overrideTypes<Candidatura[], { merge: false }>(),
    supabase
      .from("pedido_historico")
      .select("id, status_anterior, status_novo, alterado_por, created_at")
      .eq("pedido_id", id)
      .order("created_at", { ascending: true })
      .overrideTypes<Historico[], { merge: false }>(),
  ]);

  // CPF, CNPJ e Pix das candidatas (só a admin e a própria diarista leem)
  const idsDiaristas = (candidaturas ?? []).flatMap((c) => (c.diarista ? [c.diarista.id] : []));
  const idsAutores = [...new Set((historico ?? []).flatMap((h) => (h.alterado_por ? [h.alterado_por] : [])))];
  const [{ data: privados }, { data: autores }] = await Promise.all([
    idsDiaristas.length
      ? supabase
          .from("diaristas_privado")
          .select("diarista_id, cpf, cnpj, chave_pix, tipo_chave_pix")
          .in("diarista_id", idsDiaristas)
          .overrideTypes<Privado[], { merge: false }>()
      : Promise.resolve({ data: [] as Privado[] }),
    idsAutores.length
      ? supabase.from("profiles").select("id, nome").in("id", idsAutores)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ]);

  const plano = PLANOS[pedido.plano];
  const valorCliente = Number(pedido.valor_cliente);
  const valorDiarista = Number(pedido.valor_diarista);
  const proximo = PROXIMO_STATUS[pedido.status];
  const podeAprovar = pedido.status === "candidatura_recebida";

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <Link href="/admin" className="text-pequeno text-rosa-forte underline underline-offset-2">
        ← Pedidos
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="text-h2">{pedido.codigo}</h1>
        <EtiquetaStatus status={pedido.status} />
      </div>
      <p className="mt-2 text-pequeno text-texto-secundario">Criado em {dataHora(pedido.created_at)}</p>

      {(proximo || PODE_CANCELAR.includes(pedido.status)) && (
        <div className="mt-6 flex flex-wrap items-start gap-6 rounded-card bg-superficie p-6">
          {proximo && (
            <BotaoAcaoAdmin
              acao={mudarStatus.bind(null, pedido.id, proximo.status)}
              rotulo={proximo.acao}
              variante="verde"
            />
          )}
          {PODE_CANCELAR.includes(pedido.status) && (
            <BotaoAcaoAdmin
              acao={mudarStatus.bind(null, pedido.id, "cancelada")}
              rotulo="Cancelar pedido"
              confirmacao="Cancelar este pedido? Não dá para desfazer."
            />
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Cartao titulo={podeAprovar ? "Candidatas: escolha uma" : "Candidatas"}>
            {!candidaturas?.length ? (
              <p className="text-texto-secundario">Nenhuma diarista se candidatou ainda.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {candidaturas.map((c) => {
                  const privado = privados?.find((p) => p.diarista_id === c.diarista?.id);
                  return (
                    <li key={c.id} className="flex flex-col gap-4 rounded-botao-lg border border-borda p-4 md:flex-row md:justify-between">
                      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                        <Dado rotulo="Nome">{c.diarista?.nome ?? "—"}</Dado>
                        <Dado rotulo="Telefone">
                          <Telefone numero={c.diarista?.telefone} mensagem={`Olá! Sobre a vaga ${pedido.codigo} da Império Diarista.`} />
                        </Dado>
                        <Dado rotulo="CPF">{privado?.cpf ? mascaraCpf(privado.cpf) : "—"}</Dado>
                        <Dado rotulo="CNPJ">{privado?.cnpj ? mascaraCnpj(privado.cnpj) : "—"}</Dado>
                        <Dado rotulo="Chave Pix">
                          {privado?.chave_pix ? `${privado.chave_pix} (${privado.tipo_chave_pix})` : "—"}
                        </Dado>
                        <Dado rotulo="Candidatou-se em">{dataHora(c.created_at)}</Dado>
                      </dl>
                      <div className="shrink-0">
                        {podeAprovar && c.status === "pendente" ? (
                          <BotaoAcaoAdmin
                            acao={aprovarCandidatura.bind(null, c.id)}
                            rotulo="Aprovar esta diarista"
                            variante="verde"
                            confirmacao={`Aprovar ${c.diarista?.nome ?? "esta diarista"}? As outras serão recusadas.`}
                          />
                        ) : (
                          <span className="text-pequeno font-medium">{NOME_CANDIDATURA[c.status]}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Cartao>

          <Cartao titulo="Serviço">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Dado rotulo="Plano">
                {plano.horas} horas ({plano.metragem})
              </Dado>
              <Dado rotulo="Data e horário">
                {formatarData(pedido.data)} às {formatarHorario(pedido.horario)}
              </Dado>
              <Dado rotulo="Endereço">
                {endereco ? (
                  <>
                    {endereco.rua}, {endereco.numero}
                    {endereco.complemento && ` · ${endereco.complemento}`}
                    <br />
                    {pedido.bairro}, {pedido.cidade} · CEP {endereco.cep}
                    {endereco.referencia && (
                      <>
                        <br />
                        Referência: {endereco.referencia}
                      </>
                    )}
                  </>
                ) : (
                  `${pedido.bairro}, ${pedido.cidade}`
                )}
              </Dado>
              {pedido.observacoes && <Dado rotulo="Observações">{pedido.observacoes}</Dado>}
            </dl>
          </Cartao>
        </div>

        <div className="flex flex-col gap-6">
          <Cartao titulo="Cliente">
            <dl className="grid gap-3">
              <Dado rotulo="Nome">{pedido.cliente?.nome ?? "—"}</Dado>
              <Dado rotulo="Telefone">
                <Telefone numero={pedido.cliente?.telefone} mensagem={`Olá! Aqui é da Império Diarista, sobre o seu pedido ${pedido.codigo}.`} />
              </Dado>
            </dl>
          </Cartao>

          <Cartao titulo="Valores">
            <dl className="grid gap-3">
              <Dado rotulo="Cliente paga">{formatarReais(valorCliente)}</Dado>
              <Dado rotulo="Diarista recebe">{textoRepasse(valorDiarista)}</Dado>
              {valorDiarista > 0 && <Dado rotulo="Fica com a Império">{formatarReais(valorCliente - valorDiarista)}</Dado>}
            </dl>
          </Cartao>

          <Cartao titulo="Histórico">
            <ol className="flex flex-col gap-3 border-l-2 border-rosa-card pl-4">
              {historico?.map((h) => {
                const autor = autores?.find((a) => a.id === h.alterado_por)?.nome;
                return (
                  <li key={h.id}>
                    <p className="font-medium">{STATUS[h.status_novo].nome}</p>
                    <p className="text-pequeno text-texto-secundario">
                      {dataHora(h.created_at)}
                      {autor ? ` · por ${autor}` : h.status_anterior === null ? " · pedido criado pelo cliente" : ""}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Cartao>
        </div>
      </div>
    </section>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-card bg-superficie p-6 md:p-8">
      <h2 className="text-h4">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </div>
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

function Telefone({ numero, mensagem }: { numero: string | null | undefined; mensagem: string }) {
  if (!numero) return <>—</>;
  return (
    <>
      {numero}{" "}
      <a
        href={linkWhatsAppPara(numero, mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pequeno text-rosa-forte underline underline-offset-2"
      >
        WhatsApp
      </a>
    </>
  );
}
