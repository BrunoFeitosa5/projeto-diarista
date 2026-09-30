import { PainelEmConstrucao } from "@/components/painel/PainelEmConstrucao";
import { exigirPapel } from "@/lib/auth";

export const metadata = { title: "Administração | Império Diarista" };

export default async function AdminPage() {
  await exigirPapel("admin");
  return (
    <PainelEmConstrucao
      titulo="Administração"
      etapa={10}
      itens={[
        "Ver todos os pedidos por status",
        "Ver as candidatas de cada vaga e aprovar uma",
        "Avançar o status: confirmada, paga, concluída ou cancelada",
      ]}
    />
  );
}
