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
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Império Diarista",
  description:
    "Profissionais qualificadas, atendimento de confiança e limpeza impecável em São Paulo e Região Metropolitana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${schibsted.variable} ${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
