// Textos e links fixos do site (header, rodapé e barra do topo).

export const SITE = {
  nome: "Império Diarista",
  regiao: "São Paulo, SP e Região Metropolitana",
  slogan: "Sua casa impecável sem complicação nem burocracia.",
  // Telefone exibido no rodapé e na Política de Privacidade. O link do WhatsApp usa
  // NEXT_PUBLIC_WHATSAPP_DONA: os dois precisam ser o mesmo número (confirmado: final 2436).
  telefoneExibicao: "(11) 93501-2436",
  horarioAtendimento: "Atendimento no WhatsApp: Seg a dom, das 6h às 22h",
  rodapeResumo: "Profissionais verificadas, preço fixo e garantia de satisfação.",
  rodapeServicos: "Agendamento de Limpeza Residencial e Comercial",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/seguranca", label: "Segurança" },
  { href: "/trabalhe-conosco", label: "Trabalhe Conosco" },
] as const;
