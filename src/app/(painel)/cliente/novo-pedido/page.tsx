import Link from "next/link";
import { FormNovoPedido } from "@/components/painel/cliente/FormNovoPedido";
import { ANTECEDENCIA_DIAS, dataDaquiA, LIMITE_DIAS } from "@/config/agendamento";
import { PLANO_IDS, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";

export const metadata = { title: "Agendar diária | Império Diarista" };

export default async function NovoPedidoPage({ searchParams }: PageProps<"/cliente/novo-pedido">) {
  await exigirPapel("cliente");
  // Os cards de preço da Início mandam ?plano=4h|6h|8h
  const { plano } = await searchParams;
  const planoInicial = PLANO_IDS.includes(plano as PlanoId) ? (plano as PlanoId) : null;

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <Link href="/cliente" className="text-pequeno text-rosa-forte underline underline-offset-2">
        ← Meus pedidos
      </Link>
      <h1 className="mt-4 text-h2">Agendar diária</h1>
      <p className="mt-4 max-w-[611px] text-texto-secundario">
        Escolha o plano, a data e o endereço. Assim que uma diarista for aprovada pela Império, você vê aqui o nome
        dela.
      </p>
      <div className="mt-10 max-w-[760px]">
        <FormNovoPedido
          planoInicial={planoInicial}
          dataMinima={dataDaquiA(ANTECEDENCIA_DIAS)}
          dataMaxima={dataDaquiA(LIMITE_DIAS)}
        />
      </div>
    </section>
  );
}
