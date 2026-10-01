import Link from "next/link";
import { EtiquetaStatus } from "@/components/painel/EtiquetaStatus";
import { BotaoCandidatar } from "@/components/painel/diarista/BotaoCandidatar";
import { dataDaquiA, formatarData, formatarHorario } from "@/config/agendamento";
import { PLANOS, textoRepasse, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import { STATUS_COM_DIARISTA, type StatusPedido } from "@/lib/status";

export const metadata = { title: "Vagas | Império Diarista" };

type Pedido = {
  id: string;
  codigo: string;
  plano: PlanoId;
  valor_diarista: number;
  data: string;
  horario: string;
  bairro: string;
  cidade: string;
  observacoes: string | null;
  status: StatusPedido;
  diarista_id: string | null;
  cliente_id: string;
};
type Endereco = { pedido_id: string; cep: string; rua: string; numero: string; complemento: string | null; referencia: string | null };
type Contato = { id: string; nome: string; telefone: string | null };

export default async function DiaristaPage() {
  const { perfil, supabase } = await exigirPapel("diarista");

  // O RLS devolve à diarista: vagas abertas, pedidos em que ela se candidatou e os aprovados para ela
  const [{ data: privado }, { data: pedidos }, { data: candidaturas }] = await Promise.all([
    supabase.from("diaristas_privado").select("cpf, chave_pix").eq("diarista_id", perfil.id).maybeSingle(),
    supabase
      .from("pedidos")
      .select("id, codigo, plano, valor_diarista, data, horario, bairro, cidade, observacoes, status, diarista_id, cliente_id")
      .order("data", { ascending: true })
      .order("horario", { ascending: true })
      .overrideTypes<Pedido[], { merge: false }>(),
    supabase.from("candidaturas").select("pedido_id").eq("diarista_id", perfil.id),
  ]);

  const perfilCompleto = Boolean(privado?.cpf && privado?.chave_pix);
  const candidatou = new Set(candidaturas?.map((c) => c.pedido_id));
  const hoje = dataDaquiA(0);

  const vagas = (pedidos ?? []).filter(
    (p) => (p.status === "aberta" || p.status === "candidatura_recebida") && p.data >= hoje,
  );
  const servicos = (pedidos ?? []).filter((p) => p.diarista_id === perfil.id && STATUS_COM_DIARISTA.includes(p.status));

  // Endereço completo e contato do cliente: o banco só libera depois da aprovação
  let enderecos: Endereco[] = [];
  let clientes: Contato[] = [];
  if (servicos.length) {
    const [e, c] = await Promise.all([
      supabase
        .from("pedido_enderecos")
        .select("pedido_id, cep, rua, numero, complemento, referencia")
        .in("pedido_id", servicos.map((s) => s.id))
        .overrideTypes<Endereco[], { merge: false }>(),
      supabase
        .from("profiles")
        .select("id, nome, telefone")
        .in("id", servicos.map((s) => s.cliente_id))
        .overrideTypes<Contato[], { merge: false }>(),
    ]);
    enderecos = e.data ?? [];
    clientes = c.data ?? [];
  }

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-h2">Vagas abertas</h1>
        <Link href="/diarista/perfil" className="text-pequeno text-rosa-forte underline underline-offset-2">
          Meu perfil
        </Link>
      </div>

      {!perfilCompleto && (
        <div className="mt-8 rounded-card border-l-4 border-rosa-forte bg-white p-6">
          <p className="font-medium">Complete seu perfil para se candidatar</p>
          <p className="mt-1 text-texto-secundario">
            Precisamos do seu CPF e da sua chave Pix.{" "}
            <Link href="/diarista/perfil" className="text-rosa-forte underline underline-offset-2">
              Completar agora
            </Link>
          </p>
        </div>
      )}

      {servicos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-h3">Meus serviços</h2>
          <ul className="mt-6 grid gap-4">
            {servicos.map((s) => {
              const end = enderecos.find((e) => e.pedido_id === s.id);
              const cliente = clientes.find((c) => c.id === s.cliente_id);
              return (
                <li key={s.id} className="rounded-card bg-white p-6">
                  {(s.status === "aprovada" || s.status === "confirmada") && (
                    <div className="mb-5 rounded-botao-lg bg-menta px-4 py-3">
                      <p className="font-medium">🎉 Parabéns! Você foi aprovada para este serviço.</p>
                      <p className="mt-1 text-pequeno text-texto-secundario">
                        {s.status === "aprovada"
                          ? "A Império vai entrar em contato para confirmar os detalhes. Confira o endereço e o contato do cliente abaixo."
                          : "Serviço confirmado! Chegue no horário combinado e bom trabalho."}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-pequeno text-texto-secundario">{s.codigo}</p>
                    <EtiquetaStatus status={s.status} />
                  </div>
                  <p className="mt-2 text-h4">
                    {formatarData(s.data)} às {formatarHorario(s.horario)} · {PLANOS[s.plano].horas} horas
                  </p>
                  <p className="mt-1 text-texto-secundario">Você recebe: {textoRepasse(Number(s.valor_diarista))}</p>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-pequeno text-texto-secundario">Endereço</dt>
                      <dd className="mt-1">
                        {end ? (
                          <>
                            {end.rua}, {end.numero}
                            {end.complemento && ` · ${end.complemento}`}
                            <br />
                            {s.bairro}, {s.cidade} · CEP {end.cep}
                            {end.referencia && (
                              <>
                                <br />
                                Referência: {end.referencia}
                              </>
                            )}
                          </>
                        ) : (
                          `${s.bairro}, ${s.cidade}`
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-pequeno text-texto-secundario">Cliente</dt>
                      <dd className="mt-1">
                        {cliente?.nome ?? "—"}
                        {cliente?.telefone && (
                          <>
                            <br />
                            {cliente.telefone}
                          </>
                        )}
                      </dd>
                    </div>
                    {s.observacoes && (
                      <div className="sm:col-span-2">
                        <dt className="text-pequeno text-texto-secundario">Observações do cliente</dt>
                        <dd className="mt-1">{s.observacoes}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-10">
        {servicos.length > 0 && <h2 className="text-h3">Vagas</h2>}
        {vagas.length === 0 ? (
          <div className="mt-6 rounded-card bg-white p-8">
            <p className="font-medium">Nenhuma vaga aberta no momento</p>
            <p className="mt-1 text-texto-secundario">Volte mais tarde: novas vagas aparecem aqui assim que os clientes agendam.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4">
            {vagas.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-4 rounded-card bg-white p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-pequeno text-texto-secundario">{v.codigo}</p>
                  <p className="mt-1 text-h4">
                    {formatarData(v.data)} às {formatarHorario(v.horario)}
                  </p>
                  <p className="mt-1 text-texto-secundario">
                    {PLANOS[v.plano].horas} horas ({PLANOS[v.plano].metragem}) · {v.bairro}, {v.cidade}
                  </p>
                  <p className="mt-2 font-medium">Você recebe: {textoRepasse(Number(v.valor_diarista))}</p>
                  {v.observacoes && <p className="mt-2 text-pequeno text-texto-secundario">Obs.: {v.observacoes}</p>}
                </div>
                <BotaoCandidatar
                  pedidoId={v.id}
                  codigo={v.codigo}
                  nomeDiarista={perfil.nome}
                  jaCandidatou={candidatou.has(v.id)}
                  perfilCompleto={perfilCompleto}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
