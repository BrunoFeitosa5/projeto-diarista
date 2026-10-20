// ⭐ Arquivo único de preços e repasse.
// - precoCliente: quanto o cliente paga.
// - repasseDiarista: valor fixo que vai para a diarista (o resto fica com a Império).
//   Valores passados pela dona (out/2026): 4h = R$ 100, 6h = R$ 120 e 8h = R$ 160.
// O servidor copia esses valores para o pedido no momento em que ele é criado,
// então mudar aqui não altera pedidos antigos.

export const PLANOS = {
  "4h": { horas: 4, precoCliente: 160, repasseDiarista: 100, metragem: "30 a 55 m²" },
  "6h": { horas: 6, precoCliente: 199, repasseDiarista: 120, metragem: "55 a 80 m²" },
  "8h": { horas: 8, precoCliente: 230, repasseDiarista: 160, metragem: "80 a 100 m²" },
} as const;

export type PlanoId = keyof typeof PLANOS;

export const PLANO_IDS = Object.keys(PLANOS) as PlanoId[];

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Pedidos criados quando o repasse ainda era 0 mostram "a combinar".
// Atenção: cada pedido guarda o valor do momento em que foi criado.
export function textoRepasse(valor: number): string {
  return valor > 0 ? formatarReais(valor) : "Valor a combinar com a Império";
}
