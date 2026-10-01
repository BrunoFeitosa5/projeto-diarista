// Status do pedido: nome para mostrar e cor da etiqueta (só tokens do tema).
// Ordem do fluxo: aberta → candidatura_recebida → aprovada → confirmada → paga → concluida

export type StatusPedido =
  | "aberta"
  | "candidatura_recebida"
  | "aprovada"
  | "confirmada"
  | "paga"
  | "concluida"
  | "cancelada";

export const STATUS: Record<StatusPedido, { nome: string; descricao: string; classe: string }> = {
  aberta: {
    nome: "Aberta",
    descricao: "Seu pedido está visível para as diaristas.",
    classe: "bg-gelo text-marinho",
  },
  candidatura_recebida: {
    nome: "Candidatura recebida",
    descricao: "Uma diarista se candidatou. A Império está avaliando.",
    classe: "bg-rosa-card text-marinho",
  },
  aprovada: {
    nome: "Diarista aprovada",
    descricao: "A Império escolheu a diarista do seu serviço.",
    classe: "bg-menta text-marinho",
  },
  confirmada: {
    nome: "Confirmada",
    descricao: "Data, horário e diarista confirmados.",
    classe: "bg-menta text-marinho",
  },
  paga: {
    nome: "Paga",
    descricao: "Pagamento recebido.",
    classe: "bg-verde text-white",
  },
  concluida: {
    nome: "Concluída",
    descricao: "Serviço realizado.",
    classe: "bg-marinho text-white",
  },
  cancelada: {
    nome: "Cancelada",
    descricao: "Este pedido foi cancelado.",
    classe: "bg-borda text-texto-secundario",
  },
};

// A partir destes status o pedido tem uma diarista definida
export const STATUS_COM_DIARISTA: StatusPedido[] = ["aprovada", "confirmada", "paga", "concluida"];
