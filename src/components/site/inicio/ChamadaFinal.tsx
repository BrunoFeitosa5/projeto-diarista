import { FotoFundo } from "@/components/site/FotoFundo";
import { ButtonLink } from "@/components/ui/Button";
import { IMAGENS } from "@/config/imagens";
import { LINK_AGENDAR } from "@/config/site";

// Original: título a 104px do topo (700px de largura), texto a 251px, botão a 309px.
export function ChamadaFinal() {
  return (
    <section className="relative isolate px-4 py-16 text-center text-white md:min-h-[466px] md:pt-[104px] md:pb-0">
      <FotoFundo
        src={IMAGENS.chamadaFinal}
        provisorio="bg-linear-to-r from-marinho via-rosa-forte to-rosa-botao"
        // Foto clara: mesma camada do hero (48%, medida no print original)
        escurecer="bg-black/48"
      />
      <div className="mx-auto flex max-w-[700px] flex-col items-center">
        <h2 className="text-h2">Pronto para uma Casa Impecável?</h2>
        <p className="mt-6 md:mt-[35px]">
          Agende sua diária hoje mesmo e redescubra o prazer de um ambiente leve e limpo.
        </p>
        <ButtonLink href={LINK_AGENDAR} variante="rosa-chamada" className="mt-8 md:mt-[37px]">
          Reservar Agora
        </ButtonLink>
      </div>
    </section>
  );
}
