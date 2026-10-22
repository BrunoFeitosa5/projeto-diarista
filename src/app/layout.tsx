import type { Metadata } from "next";
import { Inter, Montserrat, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

// Mesmas fontes e pesos usados no site original
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  // Endereço oficial (domínio próprio): links absolutos de metadados saem com ele
  metadataBase: new URL("https://www.imperiodiaristaoficial.com.br"),
  title: "Império Diarista",
  description:
    "Profissionais qualificadas, atendimento de confiança e limpeza impecável em São Paulo e Região Metropolitana.",
};

// Roda antes da página aparecer: quem escolheu o modo escuro não vê o claro piscando.
// A chave "tema" é a mesma de CHAVE_TEMA (src/components/site/BotaoTema.tsx).
const scriptTema = `try{if(localStorage.getItem("tema")==="escuro")document.documentElement.dataset.tema="escuro"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${schibsted.variable} ${inter.variable} ${montserrat.variable} h-full antialiased`}
      // O script do tema muda o data-tema antes do React carregar
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
