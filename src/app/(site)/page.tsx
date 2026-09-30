// Guia de estilo provisório (etapa 2). Será substituído pela página Início na etapa 4.
import { Button, ButtonLink } from "@/components/ui/Button";

const cores = [
  ["rosa-topo", "bg-rosa-topo"],
  ["rosa-botao", "bg-rosa-botao"],
  ["rosa-botao-hover", "bg-rosa-botao-hover"],
  ["rosa-forte", "bg-rosa-forte"],
  ["rosa-destaque", "bg-rosa-destaque"],
  ["rosa-card", "bg-rosa-card"],
  ["rosa-card-ativo", "bg-rosa-card-ativo"],
  ["rosa-claro", "bg-rosa-claro"],
  ["rosa-suave", "bg-rosa-suave"],
  ["bege", "bg-bege"],
  ["marinho", "bg-marinho"],
  ["texto-secundario", "bg-texto-secundario"],
  ["gelo", "bg-gelo"],
  ["menta", "bg-menta"],
  ["verde", "bg-verde"],
] as const;

export default function GuiaDeEstilo() {
  return (
    <div className="mx-auto w-full max-w-site space-y-12 px-4 py-12">
      <section className="space-y-4">
        <h1 className="text-h1">
          Sua Casa <strong className="font-medium">Impecável</strong>, Sem Complicação
        </h1>
        <h2 className="text-h2">Agende de forma simples e segura.</h2>
        <h3 className="text-h3">Profissionais Verificadas</h3>
        <h4 className="text-h4">Império Diarista</h4>
        <p className="text-corpo">
          Nossa plataforma foi pensada para tornar sua experiência simples, segura e transparente.
        </p>
        <p className="text-pequeno text-texto-secundario">Texto pequeno do rodapé.</p>
      </section>

      <section className="flex flex-wrap gap-4">
        <ButtonLink href="/servicos">Agendar agora</ButtonLink>
        <Button variante="verde" type="button">
          Enviar Mensagem
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cores.map(([nome, classe]) => (
          <div key={nome} className="overflow-hidden rounded-card border border-borda bg-white">
            <div className={`h-16 ${classe}`} />
            <p className="px-2 py-1 text-pequeno">{nome}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
