// PROVISÓRIO: marcador para páginas que serão montadas na etapa 5.
export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <section className="mx-auto max-w-site px-4 py-24 text-center">
      <h1 className="text-h2">{titulo}</h1>
      <p className="mt-4 text-texto-secundario">Página em construção.</p>
    </section>
  );
}
