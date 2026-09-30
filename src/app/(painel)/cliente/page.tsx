import { PainelEmConstrucao } from "@/components/painel/PainelEmConstrucao";
import { exigirPapel } from "@/lib/auth";

export const metadata = { title: "Meus pedidos | Império Diarista" };

export default async function ClientePage() {
  await exigirPapel("cliente");
  return (
    <PainelEmConstrucao
      titulo="Meus pedidos"
      etapa={8}
      itens={["Agendar uma diária (4h, 6h ou 8h)", "Acompanhar o status de cada pedido", "Ver quem é a diarista aprovada"]}
    />
  );
}
