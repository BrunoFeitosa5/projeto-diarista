import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { PAINEL_DO_PAPEL, type Papel } from "@/lib/papeis";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Perfil = { id: string; nome: string; telefone: string | null; papel: Papel };

// Usuário logado + perfil. "cache" evita repetir a consulta na mesma requisição.
export const obterUsuario = cache(async () => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, nome, telefone, papel")
    .eq("id", id)
    .single<Perfil>();
  if (!perfil) return null;

  return { perfil, supabase };
});

// 2ª camada de segurança: usar no topo de cada página e Server Action restrita.
export async function exigirPapel(papel: Papel) {
  const usuario = await obterUsuario();
  if (!usuario) redirect("/entrar");
  if (usuario.perfil.papel !== papel) redirect(PAINEL_DO_PAPEL[usuario.perfil.papel]);
  return usuario;
}
