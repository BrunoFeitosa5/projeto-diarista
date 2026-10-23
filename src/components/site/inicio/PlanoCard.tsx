import Image from "next/image";
import { CardAmpliavel } from "@/components/ui/CardAmpliavel";
import { PLANOS, formatarReais, type PlanoId } from "@/config/planos";
import { BotaoPlano } from "./BotaoPlano";

type Props = { id: PlanoId; foto: string };

// Como no site original, o card é a imagem pronta (título, frase e preço desenhados)
// com o botão por cima. ATENÇÃO: se o preço mudar em planos.ts, a imagem precisa ser refeita.
// O texto alternativo lê planos.ts, para leitores de tela e buscadores.
export function PlanoCard({ id, foto }: Props) {
  const plano = PLANOS[id];
  const descricao = `Plano de ${plano.horas} horas, recomendado para apartamentos ou casas de ${
    plano.metragem
  }, por ${formatarReais(plano.precoCliente)}`;

  const botao = <BotaoPlano id={id} />;

  return (
    // Destaque: cresce 4% com sombra ao passar o mouse, ao tocar (celular) ou com foco do teclado.
    // Ao clicar, abre ampliado no centro da tela. Quem pediu "reduzir movimento" no sistema não vê a animação.
    <CardAmpliavel
      rotulo={`Plano de ${plano.horas} horas`}
      className="mx-auto w-full max-w-[400px] transition-[transform,box-shadow] duration-300 ease-out hover:z-10 hover:scale-[1.04] hover:shadow-2xl focus-within:z-10 focus-within:scale-[1.04] focus-within:shadow-2xl active:z-10 active:scale-[1.04] active:shadow-2xl motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-within:scale-100 motion-reduce:active:scale-100"
      ampliado={
        // Imagem inteira (375x469), sem o corte de cima que o card da página tem
        <article className="relative flex aspect-[375/469] h-[min(600px,85dvh)] max-w-[90vw] justify-center overflow-hidden shadow-2xl">
          <Image src={foto} alt={descricao} fill sizes="480px" quality={90} className="object-cover" />
          {botao}
        </article>
      }
    >
      <article className="relative flex h-[424px] w-full justify-center overflow-hidden">
        <Image
          src={foto}
          alt={descricao}
          fill
          quality={90}
          sizes="(min-width: 768px) 400px, 100vw"
          // No original a imagem é cortada por cima (fica alinhada pela base)
          className="object-cover object-bottom"
        />
        {botao}
      </article>
    </CardAmpliavel>
  );
}
