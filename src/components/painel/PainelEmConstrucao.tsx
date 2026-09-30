// PROVISÓRIO: conteúdo inicial dos painéis até as etapas 8 (cliente),
// 9 (diarista) e 10 (admin).
export function PainelEmConstrucao({ titulo, etapa, itens }: { titulo: string; etapa: number; itens: string[] }) {
  return (
    <section className="mx-auto max-w-site px-4 py-14 md:px-20 md:py-20">
      <h1 className="text-h2">{titulo}</h1>
      <p className="mt-4 text-texto-secundario">Esta área será montada na etapa {etapa}. Aqui você vai poder:</p>
      <ul className="mt-4 list-disc space-y-1 pl-6">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
