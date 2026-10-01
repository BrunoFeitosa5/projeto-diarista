// Monta links wa.me para o WhatsApp da dona do site (sem API paga).

export function linkWhatsApp(mensagem?: string): string {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_DONA ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

// Link wa.me para outra pessoa (cliente ou diarista), a partir do telefone do cadastro
export function linkWhatsAppPara(telefone: string, mensagem?: string): string {
  const numero = `55${telefone.replace(/\D/g, "")}`;
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
