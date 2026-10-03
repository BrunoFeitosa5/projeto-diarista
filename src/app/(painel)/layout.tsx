import { redirect } from "next/navigation";
import { sair } from "@/actions/auth";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { TopBar } from "@/components/site/TopBar";
import { obterUsuario } from "@/lib/auth";
import { NOME_DO_PAPEL } from "@/lib/papeis";

// Layout das áreas logadas (cliente, diarista, admin): mesmo visual do site +
// barra com o nome de quem está logado e o botão Sair.
export default async function PainelLayout({ children }: LayoutProps<"/">) {
  const usuario = await obterUsuario();
  if (!usuario) redirect("/entrar");
  const { perfil } = usuario;

  return (
    <>
      <TopBar />
      <Header />
      <div className="border-b border-borda bg-superficie px-4">
        <div className="mx-auto flex max-w-site items-center justify-between gap-4 py-3 md:px-20">
          <p className="text-pequeno">
            Olá, <strong className="font-medium">{perfil.nome || "tudo bem?"}</strong>
            <span className="text-texto-secundario"> · {NOME_DO_PAPEL[perfil.papel]}</span>
          </p>
          <form action={sair}>
            <button type="submit" className="text-pequeno text-rosa-forte underline underline-offset-2 hover:text-marinho">
              Sair
            </button>
          </form>
        </div>
      </div>
      <main className="flex-1 bg-rosa-claro">{children}</main>
      <Footer />
    </>
  );
}
