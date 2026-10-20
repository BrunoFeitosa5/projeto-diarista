import { redirect } from "next/navigation";

// Não há mais cadastro no site: diaristas e clientes falam pelo WhatsApp.
export default function CadastroPage() {
  redirect("/trabalhe-conosco");
}
