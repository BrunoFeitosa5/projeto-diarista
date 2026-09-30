import { PainelEmConstrucao } from "@/components/painel/PainelEmConstrucao";
import { exigirPapel } from "@/lib/auth";

export const metadata = { title: "Vagas | Império Diarista" };

export default async function DiaristaPage() {
  await exigirPapel("diarista");
  return (
    <PainelEmConstrucao
      titulo="Vagas abertas"
      etapa={9}
      itens={[
        "Completar o perfil com CPF e chave Pix",
        "Ver as vagas, o valor da limpeza e quanto você vai ganhar",
        "Se candidatar e avisar a Império pelo WhatsApp",
      ]}
    />
  );
}
