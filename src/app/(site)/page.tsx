import { ChamadaFinal } from "@/components/site/inicio/ChamadaFinal";
import { Hero } from "@/components/site/inicio/Hero";
import { SecaoAgende } from "@/components/site/inicio/SecaoAgende";
import { SecaoPlanos } from "@/components/site/inicio/SecaoPlanos";

export default function InicioPage() {
  return (
    <>
      <Hero />
      <SecaoPlanos />
      <SecaoAgende />
      <ChamadaFinal />
    </>
  );
}
