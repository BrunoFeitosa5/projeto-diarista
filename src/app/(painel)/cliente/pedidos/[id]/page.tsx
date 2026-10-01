import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso } from "@/components/auth/Aviso";
import { EtiquetaStatus } from "@/components/painel/EtiquetaStatus";
import { botaoClasses } from "@/components/ui/Button";
import { formatarData, formatarHorario } from "@/config/agendamento";
import { formatarReais, PLANOS, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import { STATUS, STATUS_COM_DIARISTA, type StatusPedido } from "@/lib/status";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata = { title: "Pedido | Império Diarista" };

type Pedido = {
  id: string;
  codigo: string;
  plano: PlanoId;
  valor_cliente: number;
  data: string;
  horario: string;
  bairro: string;
  cidade: string;
  observacoes: string | null;
  status: StatusPedido;
  diarista_id: string | null;
};
type Endereco = { cep: string; rua: string; numero: string; complemento: string | null; referencia: string | null };
type Historico = { id: number; status_novo: StatusPedido; created_at: string };
type Diarista = { nome: string; telefone: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function PedidoClientePage({ params, searchParams }: PageProps<"/cliente/pedidos/[id]">) {
  const { perfil, supabase } = await exigirPapel("cliente");
  const { id } = await params;
  const { novo } = await searchParams;
  if (!UUID.test(id)) notFound();

  // O RLS só devolve o pedido se ele for deste cliente; de outro cliente, cai no 404
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, codigo, plano, valor_cliente, data, horario, bairro, cidade, observacoes, status, diarista_id")
    .eq("id", id)
    .eq("cliente_id", perfil.id)
    .maybeSingle<Pedido>();
  if (!pedido) notFound();

  const temDiarista = STATUS_COM_DIARISTA.includes(pedido.status) && pedido.diarista_id;
  const [{ data: endereco }, { data: historico }, { data: diarista }] = await Promise.all([
    supabase.from("pedido_enderecos").select("cep, rua, numero, complemento, referencia").eq("pedido_id", id).maybeSingle<Endereco>(),
    supabase
      .from("pedido_historico")
      .select("id, status_novo, created_at")
      .eq("pedido_id", id)
      .order("created_at", { ascending: true })
      .overrideTypes<Historico[], { merge: false }>(),
    // O banco só libera o perfil da diarista depois da aprovação
    temDiarista
      ? supabase.from("profiles").select("nome, telefone").eq("id", pedido.diarista_id!).maybeSingle<Diarista>()
      : Promise.resolve({ data: null }),
  ]);

  const plano = PLANOS[pedido.plano];
  const whatsapp = linkWhatsApp(`Olá! Sou cliente da Império Diarista e quero falar sobre o pedido ${pedido.codigo}.`);

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <Link href="/cliente" className="text-pequeno text-rosa-forte underline underline-offset-2">
        ← Meus pedidos
      </Link>

      {novo && (
        <div className="mt-6">
          <Aviso tipo="sucesso">
            Pedido {pedido.codigo} criado! Avisaremos as diaristas e você acompanha tudo por aqui.
          </Aviso>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="text-h2">{pedido.codigo}</h1>
        <EtiquetaStatus status={pedido.status} />
      </div>
      <p className="mt-3 text-texto-secundario">{STATUS[pedido.status].descricao}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-card bg-white p-6 md:p-8">
            <h2 className="text-h4">Serviço</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Dado rotulo="Plano">
                Diária de {plano.horas} horas ({plano.metragem})
              </Dado>
              <Dado rotulo="Valor">{formatarReais(Number(pedido.valor_cliente))}</Dado>
              <Dado rotulo="Data">{formatarData(pedido.data)}</Dado>
              <Dado rotulo="Horário de início">{formatarHorario(pedido.horario)}</Dado>
            </dl>
            {pedido.observacoes && (
              <dl className="mt-4">
                <Dado rotulo="Observações">{pedido.observacoes}</Dado>
              </dl>
            )}
          </div>

          <div className="rounded-card bg-white p-6 md:p-8">
            <h2 className="text-h4">Endereço</h2>
            {endereco ? (
              <address className="mt-4 not-italic">
                {endereco.rua}, {endereco.numero}
                {endereco.complemento && ` · ${endereco.complemento}`}
                <br />
                {pedido.bairro}, {pedido.cidade} · CEP {endereco.cep}
                {endereco.referencia && (
                  <>
                    <br />
                    <span className="text-texto-secundario">Referência: {endereco.referencia}</span>
                  </>
                )}
              </address>
            ) : (
              <p className="mt-4">
                {pedido.bairro}, {pedido.cidade}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-card bg-white p-6 md:p-8">
            <h2 className="text-h4">Diarista</h2>
            {diarista ? (
              <dl className="mt-4 grid gap-4">
                <Dado rotulo="Nome">{diarista.nome}</Dado>
                {diarista.telefone && <Dado rotulo="Telefone">{diarista.telefone}</Dado>}
              </dl>
            ) : (
              <p className="mt-4 text-texto-secundario">
                {pedido.status === "cancelada"
                  ? "Nenhuma diarista neste pedido."
                  : "Assim que a Império aprovar uma diarista, o nome e o telefone dela aparecem aqui."}
              </p>
            )}
          </div>

          <div className="rounded-card bg-white p-6 md:p-8">
            <h2 className="text-h4">Andamento</h2>
            <ol className="mt-4 flex flex-col gap-3 border-l-2 border-rosa-card pl-4">
              {historico?.map((h) => (
                <li key={h.id}>
                  <p className="font-medium">{STATUS[h.status_novo].nome}</p>
                  <p className="text-pequeno text-texto-secundario">{dataHora(h.created_at)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-card bg-white p-6 md:p-8">
            <h2 className="text-h4">Precisa de ajuda?</h2>
            <p className="mt-2 text-texto-secundario">
              Para remarcar ou cancelar, fale com a Império pelo WhatsApp informando o código {pedido.codigo}.
            </p>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={botaoClasses("verde", "padrao", "mt-4")}>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-pequeno text-texto-secundario">{rotulo}</dt>
      <dd className="mt-1 text-marinho">{children}</dd>
    </div>
  );
}
