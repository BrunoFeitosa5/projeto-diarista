import { AvisoConfiguracao } from "@/components/auth/AvisoConfiguracao";
import { FormCadastro } from "@/components/auth/FormCadastro";

export const metadata = { title: "Cadastro | Império Diarista" };

export default async function CadastroPage({ searchParams }: PageProps<"/cadastro">) {
  const { perfil } = await searchParams;
  const papelInicial = perfil === "diarista" ? "diarista" : "cliente";

  return (
    <section className="bg-bege px-4 py-14 md:py-20">
      <div className="mx-auto grid max-w-site items-start gap-10 md:grid-cols-[433px_1fr] md:gap-16 md:px-20">
        <div>
          <p className="text-pequeno">Cadastro</p>
          <h1 className="mt-6 text-h2 md:max-w-[370px]">Crie sua conta</h1>
          <p className="mt-6 md:max-w-[404px]">
            Clientes agendam diárias com preço fixo. Diaristas veem as vagas abertas, quanto vão ganhar e se
            candidatam em poucos cliques.
          </p>
        </div>
        <div className="md:max-w-[611px]">
          <AvisoConfiguracao />
          <FormCadastro papelInicial={papelInicial} />
        </div>
      </div>
    </section>
  );
}
