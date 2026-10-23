// Fotos do site (arquivos em public/img/, fornecidos pela dona).
// Onde o valor é null, o componente FotoFundo mostra um degradê provisório.

export const IMAGENS: Record<
  | "logo"
  | "hero"
  | "plano4h"
  | "plano6h"
  | "plano8h"
  | "chamadaFinal"
  | "servicosHero"
  | "seguranca",
  string | null
> = {
  logo: "/img/logo-imperio-diarista.avif", // 375x484
  hero: "/img/hero-inicio.avif", // 1440x960
  plano4h: "/img/card-plano-4h-frase.png", // 1122x1402, com título e preço desenhados (sem os m²)
  plano6h: "/img/card-plano-6h-frase.png",
  plano8h: "/img/card-plano-8h-frase.png",
  chamadaFinal: "/img/chamada-final-passadoria-hd.png", // 2115x743, clara (escurecida no componente)
  servicosHero: "/img/servicos-hero-escritorio.avif", // 1440x621, já vem escurecida
  // Ao trocar uma foto, use um NOME NOVO de arquivo: o otimizador do Next e a CDN
  // guardam as imagens pelo nome e continuariam mostrando a versão antiga.
  seguranca: "/img/seguranca-diarista-sala.avif", // quase quadrada, combina com o quadro 612x600
};
