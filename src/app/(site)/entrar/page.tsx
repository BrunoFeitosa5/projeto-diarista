import { Aviso } from "@/components/auth/Aviso";
import { AvisoConfiguracao } from "@/components/auth/AvisoConfiguracao";
import { FormEntrar } from "@/components/auth/FormEntrar";
import { caminhoInternoSeguro } from "@/lib/papeis";

export const metadata = { title: "Entrar | Império Diarista" };

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { proximo, erro } = await searchParams;
  const destino = caminhoInternoSeguro(typeof proximo === "string" ? proximo : null) ?? undefined;

  return (
    <section className="bg-bege px-4 py-14 md:py-20">
      <div className="mx-auto grid max-w-site items-start gap-10 md:grid-cols-[433px_1fr] md:gap-16 md:px-20">
        <div>
          <p className="text-pequeno">Área do cliente e da diarista</p>
          <h1 className="mt-6 text-h2 md:max-w-[370px]">Entrar na sua conta</h1>
          <p className="mt-6 md:max-w-[404px]">
            Acompanhe seus pedidos, veja as vagas disponíveis e gerencie seus agendamentos em um só lugar.
          </p>
        </div>
        <div className="md:max-w-[611px]">
          <AvisoConfiguracao />
          {erro === "link" && (
            <div className="mb-5">
              <Aviso tipo="erro">O link de confirmação é inválido ou expirou. Tente entrar ou cadastre-se de novo.</Aviso>
            </div>
          )}
          <FormEntrar proximo={destino} />
        </div>
      </div>
    </section>
  );
}
