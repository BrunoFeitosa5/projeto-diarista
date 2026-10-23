// Textos e links fixos do site (header, rodapé e barra do topo).

export const SITE = {
  nome: "Império Diarista",
  regiao: "Toda a região de São Paulo",
  // Frase da barra rosa no topo de todas as páginas
  faixaTopo: "Sua casa limpa, sua rotina leve: agende em minutos!",
  slogan: "Sua casa impecável sem complicação nem burocracia.",
  // Telefone exibido no rodapé e na Política de Privacidade. O link do WhatsApp usa
  // NEXT_PUBLIC_WHATSAPP_DONA: os dois precisam ser o mesmo número (confirmado: final 2436).
  telefoneExibicao: "(11) 93501-2436",
  horarioAtendimento: "Atendimento no WhatsApp: Seg a dom, das 6h às 21h",
  // Horário em que as diaristas trabalham
  horarioDiaristas: "Seg a dom, das 8h às 17h",
  rodapeResumo: "Profissionais verificadas, preço fixo e garantia de satisfação.",
  rodapeServicos: "Agendamento de Limpeza Residencial e Comercial",
  // Endereço do perfil (ex.: https://www.instagram.com/usuario). Sem valor, o link não aparece.
  instagram: null as string | null,
} as const;

// Menu igual ao do S.O.S Diaristas. Valores e Agende agora são seções da página inicial (âncoras).
export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/#valores", label: "Valores" },
  { href: "/#agendar", label: "Agende agora" },
  { href: "/trabalhe-conosco", label: "Seja uma diarista" },
] as const;

// Todo botão de agendar/contratar leva ao formulário da Início: lá o servidor gera o número do
// pedido e o WhatsApp abre com os dados preenchidos.
export const LINK_AGENDAR = "/#agendar";
