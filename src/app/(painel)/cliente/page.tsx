import Link from "next/link";
import { EtiquetaStatus } from "@/components/painel/EtiquetaStatus";
import { ButtonLink } from "@/components/ui/Button";
import { formatarData, formatarHorario } from "@/config/agendamento";
import { formatarReais, PLANOS, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import type { StatusPedido } from "@/lib/status";

export const metadata = { title: "Meus pedidos | Império Diarista" };

type PedidoLista = {
  id: string;
  codigo: string;
  plano: PlanoId;
  valor_cliente: number;
  data: string;
  horario: string;
  bairro: string;
  cidade: string;
  status: StatusPedido;
};

export default async function ClientePage() {
  const { perfil, supabase } = await exigirPapel("cliente");

  // O RLS já limita aos pedidos do próprio cliente; o filtro deixa isso explícito
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, codigo, plano, valor_cliente, data, horario, bairro, cidade, status")
    .eq("cliente_id", perfil.id)
    .order("created_at", { ascending: false })
    .overrideTypes<PedidoLista[], { merge: false }>();

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-h2">Meus pedidos</h1>
        <ButtonLink href="/cliente/novo-pedido" variante="rosa-forte">
          Agendar diária
        </ButtonLink>
      </div>

      {error && <p className="mt-8 text-texto-secundario">Não foi possível carregar seus pedidos agora.</p>}

      {pedidos?.length === 0 && (
        <div className="mt-10 rounded-card bg-superficie p-8 md:p-10">
          <h2 className="text-h3">Você ainda não tem pedidos</h2>
          <p className="mt-3 max-w-[520px] text-texto-secundario">
            Escolha um plano de 4, 6 ou 8 horas, a data e o endereço. A Império cuida de encontrar a diarista.
          </p>
        </div>
      )}

      {!!pedidos?.length && (
        <ul className="mt-10 grid gap-4">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/cliente/pedidos/${p.id}`}
                className="flex flex-col gap-4 rounded-card bg-superficie p-6 transition-colors hover:bg-gelo md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-pequeno text-texto-secundario">{p.codigo}</p>
                  <p className="mt-1 text-h4">
                    Diária de {PLANOS[p.plano].horas} horas · {formatarReais(Number(p.valor_cliente))}
                  </p>
                  <p className="mt-1 text-texto-secundario">
                    {formatarData(p.data)} às {formatarHorario(p.horario)} · {p.bairro}, {p.cidade}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <EtiquetaStatus status={p.status} />
                  <span className="text-pequeno text-rosa-forte underline underline-offset-2">Ver detalhes</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
