import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Qualidade 90 nos cards de preço, que têm texto desenhado na imagem (o padrão, 75, deixa borrado)
  images: { qualities: [75, 90] },

  // Só vale no "npm run dev": deixa abrir o site pelo celular na rede de casa
  // (ex.: http://192.168.15.14:3000). Sem isso o Next bloqueia o JavaScript
  // e nada que dependa de clique funciona (menu, busca de CEP...).
  allowedDevOrigins: ["192.168.*.*"],

  // Cabeçalhos de segurança em todas as páginas (etapa 11)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Nenhum outro site pode abrir o nosso dentro de uma moldura (iframe):
          // evita enganar a admin para clicar em "Aprovar" sem perceber (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // O navegador não "adivinha" o tipo dos arquivos
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Links externos (ex.: WhatsApp) recebem só o domínio, nunca o endereço
          // completo da página (que pode ter o id do pedido)
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // O site não usa câmera, microfone nem localização
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
