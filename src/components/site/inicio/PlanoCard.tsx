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
    // Destaque: cresce 4% com sombra ao passar o mouse, ao tocar (celular) ou com foco do teclado.
    // Quem pediu "reduzir movimento" no sistema não vê a animação.
    <article className="relative mx-auto flex h-[424px] w-full max-w-[400px] justify-center overflow-hidden transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.04] hover:shadow-2xl focus-within:z-10 focus-within:scale-[1.04] focus-within:shadow-2xl active:z-10 active:scale-[1.04] active:shadow-2xl motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-within:scale-100 motion-reduce:active:scale-100">
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
