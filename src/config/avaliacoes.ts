// Avaliações reais de clientes da Império (Google, WhatsApp...). Enquanto a lista estiver vazia,
// a seção "Avaliações" não aparece no site. Só colocar aqui o que o cliente realmente escreveu,
// com autorização dele para usar o nome.
export type Avaliacao = {
  nome: string;
  data: string; // ex.: "setembro de 2026"
  texto: string;
  nota: 1 | 2 | 3 | 4 | 5;
};

export const AVALIACOES: Avaliacao[] = [];
