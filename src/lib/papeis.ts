// Papéis de usuário e a área (painel) de cada um.

export type Papel = "cliente" | "diarista" | "admin";

export const PAINEL_DO_PAPEL: Record<Papel, string> = {
  cliente: "/cliente",
  diarista: "/diarista",
  admin: "/admin",
};

export const NOME_DO_PAPEL: Record<Papel, string> = {
  cliente: "Cliente",
  diarista: "Diarista",
  admin: "Administração",
};

// Aceita só caminhos internos (evita redirecionar para outro site: "//site.com", "https://...")
export function caminhoInternoSeguro(caminho: string | null | undefined): string | null {
  if (!caminho || !caminho.startsWith("/") || caminho.startsWith("//") || caminho.startsWith("/\\")) {
    return null;
  }
  return caminho;
}
