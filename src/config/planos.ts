// ⭐ Arquivo único de preços e repasse.
// - precoCliente: quanto o cliente paga.
// - PERCENTUAL_REPASSE: parte do preço que vai para a diarista (o resto fica com a Império).
//   Provisório: 80% para a diarista e 20% para a Império, até a dona confirmar.
// O servidor copia esses valores para o pedido no momento em que ele é criado,
// então mudar aqui não altera pedidos antigos.

export const PERCENTUAL_REPASSE = 0.8;

// Arredonda para centavos (ex.: 199 × 0,8 = 159,20)
const repasse = (preco: number) => Math.round(preco * PERCENTUAL_REPASSE * 100) / 100;

export const PLANOS = {
  "4h": { horas: 4, precoCliente: 160, repasseDiarista: repasse(160), metragem: "30 a 55 m²" },
  "6h": { horas: 6, precoCliente: 199, repasseDiarista: repasse(199), metragem: "55 a 80 m²" },
  "8h": { horas: 8, precoCliente: 230, repasseDiarista: repasse(230), metragem: "80 a 100 m²" },
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
