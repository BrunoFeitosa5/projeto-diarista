import { FotoFundo } from "@/components/site/FotoFundo";
import { ButtonLink } from "@/components/ui/Button";
import { IMAGENS } from "@/config/imagens";
import { MENSAGEM_AGENDAR } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata = { title: "Serviços | Império Diarista" };

export default function ServicosPage() {
  return (
    <>
      {/* Topo com foto. Original (606px): rótulo a 104px, título a 172px, texto a 356px, botão a 449px. */}
      <section className="relative isolate px-4 py-16 md:min-h-[606px] md:pt-[104px] md:pb-0">
        <FotoFundo
          src={IMAGENS.servicosHero}
          provisorio="bg-linear-to-br from-marinho via-rosa-forte to-rosa-botao"
          // O arquivo já vem escurecido e o original não aplica camada neste bloco
          escurecer=""
        />
        <div className="mx-auto max-w-site md:px-20">
          <p className="text-rosa-foto">Agendamento Expresso</p>
          <h1 className="mt-6 max-w-[1056px] text-h1 text-white md:mt-[42px]">
            Escolha o Serviço <strong>Ideal</strong> para Sua Casa ou Escritório
          </h1>
          <p className="mt-6 max-w-[1056px] text-rosa-foto md:mt-[62px]">
            Opções flexíveis para residências, escritórios e necessidades específicas. Agende com
            profissionais verificadas, preço fixo e total transparência.
          </p>
          <ButtonLink href={linkWhatsApp(MENSAGEM_AGENDAR)} variante="rosa-reservar" className="mt-8 md:mt-[42px]">
            Reservar Horário
          </ButtonLink>
        </div>
      </section>

      {/* Faixa de orçamento personalizado. Original (250px): título a 72px, texto a 139px, botão à direita. */}
      <section className="bg-bege px-4 py-14 md:min-h-[250px] md:pt-[72px] md:pb-0">
        <div className="mx-auto flex max-w-site flex-col gap-6 md:flex-row md:items-start md:justify-between md:px-20">
          <div className="max-w-[700px]">
            <h2 className="text-h3">Dúvidas sobre Limpezas Personalizadas?</h2>
            <p className="mt-6 text-pequeno">
              Entre em contato para um orçamento exclusivo e adaptado às suas necessidades específicas.
            </p>
          </div>
          <ButtonLink
            href={linkWhatsApp("Olá, gostaria de um orçamento para uma limpeza personalizada.")}
            variante="rosa-escuro"
            className="self-start md:mt-[23px] md:mr-[67px]"
          >
            Fale Conosco
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
