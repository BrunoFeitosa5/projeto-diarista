import Link from "next/link";
import { EtiquetaStatus } from "@/components/painel/EtiquetaStatus";
import { formatarData, formatarHorario } from "@/config/agendamento";
import { formatarReais, PLANOS, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import type { StatusPedido } from "@/lib/status";

export const metadata = { title: "Administração | Império Diarista" };

type PedidoAdmin = {
  id: string;
  codigo: string;
  plano: PlanoId;
  valor_cliente: number;
  data: string;
  horario: string;
  bairro: string;
  cidade: string;
  status: StatusPedido;
  cliente: { nome: string } | null;
  diarista: { nome: string } | null;
  candidaturas: { count: number }[];
};

// Abas da lista. "acao" vem primeiro: são os pedidos esperando a dona aprovar uma diarista.
const FILTROS = {
  acao: { nome: "Aprovar diarista", status: ["candidatura_recebida"] },
  abertos: { nome: "Abertos", status: ["aberta"] },
  andamento: { nome: "Em andamento", status: ["aprovada", "confirmada", "paga"] },
  concluidos: { nome: "Concluídos", status: ["concluida"] },
  cancelados: { nome: "Cancelados", status: ["cancelada"] },
  todos: { nome: "Todos", status: null },
} as const satisfies Record<string, { nome: string; status: readonly StatusPedido[] | null }>;

type Filtro = keyof typeof FILTROS;

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await exigirPapel("admin");
  const { filtro: filtroUrl } = await searchParams;
  const filtro: Filtro = typeof filtroUrl === "string" && filtroUrl in FILTROS ? (filtroUrl as Filtro) : "acao";

  // Dois vínculos com profiles (cliente e diarista): o nome da chave estrangeira diz qual é qual
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select(
      "id, codigo, plano, valor_cliente, data, horario, bairro, cidade, status, " +
        "cliente:profiles!pedidos_cliente_id_fkey(nome), diarista:profiles!pedidos_diarista_id_fkey(nome), candidaturas(count)",
    )
    .order("data", { ascending: true })
    .order("horario", { ascending: true })
    .overrideTypes<PedidoAdmin[], { merge: false }>();

  const todos = pedidos ?? [];
  const doFiltro = (f: Filtro) => {
    const lista: readonly StatusPedido[] | null = FILTROS[f].status;
    return lista ? todos.filter((p) => lista.includes(p.status)) : todos;
  };
  const visiveis = doFiltro(filtro);

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <h1 className="text-h2">Pedidos</h1>

      <nav aria-label="Filtrar pedidos" className="mt-8 flex flex-wrap gap-2">
        {(Object.keys(FILTROS) as Filtro[]).map((f) => (
          <Link
            key={f}
            href={`/admin?filtro=${f}`}
            aria-current={f === filtro ? "page" : undefined}
            className="rounded-full bg-white px-4 py-2 text-pequeno text-marinho transition-colors hover:bg-campo-hover aria-[current=page]:bg-marinho aria-[current=page]:text-white"
          >
            {FILTROS[f].nome} ({doFiltro(f).length})
          </Link>
        ))}
      </nav>

      {error && <p className="mt-8 text-texto-secundario">Não foi possível carregar os pedidos agora.</p>}

      {!error && visiveis.length === 0 && (
        <div className="mt-8 rounded-card bg-white p-8">
          <p className="text-texto-secundario">Nenhum pedido aqui.</p>
        </div>
      )}

      {visiveis.length > 0 && (
        <ul className="mt-8 grid gap-4">
          {visiveis.map((p) => {
            const candidatas = p.candidaturas[0]?.count ?? 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/pedidos/${p.id}`}
                  className="flex flex-col gap-4 rounded-card bg-white p-6 transition-colors hover:bg-gelo md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-pequeno text-texto-secundario">
                      {p.codigo} · Cliente: {p.cliente?.nome ?? "—"}
                    </p>
                    <p className="mt-1 text-h4">
                      {formatarData(p.data)} às {formatarHorario(p.horario)} · {PLANOS[p.plano].horas} horas
                    </p>
                    <p className="mt-1 text-texto-secundario">
                      {p.bairro}, {p.cidade} · {formatarReais(Number(p.valor_cliente))}
                    </p>
                    <p className="mt-1 text-pequeno">
                      {p.diarista
                        ? `Diarista: ${p.diarista.nome}`
                        : `${candidatas} ${candidatas === 1 ? "candidata" : "candidatas"}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <EtiquetaStatus status={p.status} />
                    <span className="text-pequeno text-rosa-forte underline underline-offset-2">Abrir</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
