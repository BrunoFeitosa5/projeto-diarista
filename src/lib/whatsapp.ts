// Monta links wa.me para o WhatsApp da dona do site (sem API paga).

export function linkWhatsApp(mensagem?: string): string {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_DONA ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

// WhatsApp "S.O.S Diaristas": número só para as diaristas (cadastro, serviços e dúvidas).
// O número dos clientes continua em linkWhatsApp. Sem a variável, cai no número da dona
// para o botão nunca ficar quebrado.
export function linkWhatsAppDiaristas(mensagem?: string): string {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_DIARISTAS ?? "").replace(/\D/g, "");
  if (!numero) return linkWhatsApp(mensagem);
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

// Link de convite do grupo das diaristas (https://chat.whatsapp.com/...). O WhatsApp
// não deixa o site adicionar ninguém ao grupo: a diarista aprovada entra pelo convite.
// Sem a variável, os botões do grupo não aparecem.
export function linkGrupoDiaristas(): string | null {
  const link = (process.env.NEXT_PUBLIC_WHATSAPP_GRUPO_DIARISTAS ?? "").trim();
  return link.startsWith("https://chat.whatsapp.com/") ? link : null;
}

// wa.me sem número: o WhatsApp deixa quem clicou escolher a conversa (ex.: o grupo)
export function linkWhatsAppEscolherConversa(mensagem: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}

// Link wa.me para outra pessoa (cliente ou diarista), a partir do telefone do cadastro
export function linkWhatsAppPara(telefone: string, mensagem?: string): string {
  const numero = `55${telefone.replace(/\D/g, "")}`;
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
