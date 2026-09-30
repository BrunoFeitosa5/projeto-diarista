import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { PLANOS, formatarReais, type PlanoId } from "@/config/planos";

type Props = { id: PlanoId; foto: string };

// Como no site original, o card é a imagem pronta (título, metragem e preço desenhados)
// com o botão por cima. ATENÇÃO: se o preço mudar em planos.ts, a imagem precisa ser refeita.
// O texto alternativo lê planos.ts, para leitores de tela e buscadores.
export function PlanoCard({ id, foto }: Props) {
  const plano = PLANOS[id];
  const descricao = `Plano de ${plano.horas} horas, recomendado para apartamentos ou casas de ${
    plano.metragem
  }, por ${formatarReais(plano.precoCliente)}`;

  return (
    <article className="relative mx-auto flex h-[424px] w-full max-w-[400px] justify-center overflow-hidden">
      <Image
        src={foto}
        alt={descricao}
        fill
        sizes="(min-width: 768px) 400px, 100vw"
        // No original a imagem é cortada por cima (fica alinhada pela base)
        className="object-cover object-bottom"
      />
      <ButtonLink
        href={`/cliente/novo-pedido?plano=${id}`}
        variante="rosa-card"
        tamanho="card"
        className="absolute bottom-[30px]"
      >
        Agendar agora
      </ButtonLink>
    </article>
  );
}
