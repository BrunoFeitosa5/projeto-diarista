// ⭐ Arquivo único de preços e repasse.
// - precoCliente: quanto o cliente paga.
// - repasseDiarista: quanto a diarista recebe. AINDA NÃO DEFINIDO (0 até a dona decidir).
// O servidor copia esses valores para o pedido no momento em que ele é criado,
// então mudar aqui não altera pedidos antigos.

export const PLANOS = {
  "4h": { horas: 4, precoCliente: 160, repasseDiarista: 0, metragem: "30 a 55 m²" },
  "6h": { horas: 6, precoCliente: 199, repasseDiarista: 0, metragem: "55 a 80 m²" },
  "8h": { horas: 8, precoCliente: 230, repasseDiarista: 0, metragem: "80 a 100 m²" },
} as const;

export type PlanoId = keyof typeof PLANOS;

export const PLANO_IDS = Object.keys(PLANOS) as PlanoId[];

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
