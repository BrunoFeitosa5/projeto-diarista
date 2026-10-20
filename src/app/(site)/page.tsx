import { Agendar } from "@/components/site/inicio/Agendar";
import { Avaliacoes } from "@/components/site/inicio/Avaliacoes";
import { ChamadaFinal } from "@/components/site/inicio/ChamadaFinal";
import { ComoFunciona } from "@/components/site/inicio/ComoFunciona";
import { Duvidas } from "@/components/site/inicio/Duvidas";
import { Hero } from "@/components/site/inicio/Hero";
import { SecaoAgende } from "@/components/site/inicio/SecaoAgende";
import { SecaoPlanos } from "@/components/site/inicio/SecaoPlanos";

// Ordem igual à do S.O.S Diaristas: valores, vantagens, como funciona, avaliações, dúvidas e agendar.
export default function InicioPage() {
  return (
    <>
      <Hero />
      <SecaoPlanos />
      <SecaoAgende />
      <ComoFunciona />
      <Avaliacoes />
      <Duvidas />
      <Agendar />
      <ChamadaFinal />
    </>
  );
}
