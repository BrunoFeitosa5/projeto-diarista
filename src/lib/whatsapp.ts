// Monta links wa.me para o WhatsApp da dona do site (sem API paga).

export function linkWhatsApp(mensagem?: string): string {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_DONA ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${numero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
