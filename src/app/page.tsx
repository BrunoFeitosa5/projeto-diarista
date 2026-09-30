// Guia de estilo provisório (etapa 2). Será substituído pela página Início na etapa 4.

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
    <main className="mx-auto w-full max-w-site space-y-12 px-4 py-12">
      <p className="bg-rosa-topo py-2 text-center font-nav text-corpo font-light text-white">
        São Paulo, SP e Região Metropolitana
      </p>

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
        <nav className="flex gap-10 font-nav text-black">
          <span className="border-b border-black">Início</span>
          <span>Serviços</span>
          <span>Segurança</span>
          <span>Trabalhe Conosco</span>
        </nav>
      </section>

      <section className="flex flex-wrap gap-4">
        <button className="rounded-botao bg-rosa-botao px-7 py-[17px] text-botao font-medium text-white hover:bg-rosa-botao-hover">
          Agendar agora
        </button>
        <button className="rounded-botao bg-verde px-7 py-[17px] text-botao font-medium text-white hover:bg-verde-hover">
          Enviar Mensagem
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cores.map(([nome, classe]) => (
          <div key={nome} className="overflow-hidden rounded-card border border-borda bg-white">
            <div className={`h-16 ${classe}`} />
            <p className="px-2 py-1 text-pequeno">{nome}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
