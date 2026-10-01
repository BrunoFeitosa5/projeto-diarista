import Link from "next/link";
import { FormPerfilDiarista, type DadosPerfil } from "@/components/painel/diarista/FormPerfilDiarista";
import { exigirPapel } from "@/lib/auth";

export const metadata = { title: "Meu perfil | Império Diarista" };

type Privado = {
  cpf: string | null;
  cnpj: string | null;
  data_nascimento: string | null;
  chave_pix: string | null;
  tipo_chave_pix: DadosPerfil["tipo_chave_pix"] | null;
};

export default async function PerfilDiaristaPage() {
  const { perfil, supabase } = await exigirPapel("diarista");

  const { data } = await supabase
    .from("diaristas_privado")
    .select("cpf, cnpj, data_nascimento, chave_pix, tipo_chave_pix")
    .eq("diarista_id", perfil.id)
    .maybeSingle<Privado>();

  // "1990-12-31" → "31/12/1990"
  const nascimento = data?.data_nascimento?.split("-").reverse().join("/") ?? "";

  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <Link href="/diarista" className="text-pequeno text-rosa-forte underline underline-offset-2">
        ← Vagas
      </Link>
      <h1 className="mt-4 text-h2">Meu perfil</h1>
      <p className="mt-4 max-w-[611px] text-texto-secundario">
        Para se candidatar às vagas, preencha seu CPF e sua chave Pix.
      </p>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-pequeno">
        <div>
          <dt className="inline text-texto-secundario">Nome: </dt>
          <dd className="inline">{perfil.nome}</dd>
        </div>
        <div>
          <dt className="inline text-texto-secundario">Telefone: </dt>
          <dd className="inline">{perfil.telefone ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-10 max-w-[611px]">
        <FormPerfilDiarista
          inicial={{
            cpf: data?.cpf ?? "",
            cnpj: data?.cnpj ?? "",
            nascimento,
            tipo_chave_pix: data?.tipo_chave_pix ?? "",
            chave_pix: data?.chave_pix ?? "",
          }}
        />
      </div>
    </section>
  );
}
