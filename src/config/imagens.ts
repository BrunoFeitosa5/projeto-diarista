// Fotos do site (arquivos em public/img/, fornecidos pela dona).
// Onde o valor é null, o componente FotoFundo mostra um degradê provisório.

export const IMAGENS: Record<
  "logo" | "hero" | "plano4h" | "plano6h" | "plano8h" | "chamadaFinal" | "seguranca",
  string | null
> = {
  logo: "/img/logo-imperio-diarista.avif", // 375x484
  hero: "/img/hero-inicio.avif", // 1440x960
  plano4h: "/img/card-plano-4h.avif", // 375x469, com texto e preço desenhados
  plano6h: "/img/card-plano-6h.avif",
  plano8h: "/img/card-plano-8h.avif",
  chamadaFinal: "/img/chamada-final-passadoria.avif", // 1024x360, já vem escurecida
  seguranca: "/img/seguranca-diarista.avif", // 375x500, usada na etapa 5
};
