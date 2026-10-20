"use server";

import { redirect } from "next/navigation";
import { caminhoInternoSeguro, PAINEL_DO_PAPEL, type Papel } from "@/lib/papeis";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoForm = { erro?: string; sucesso?: string } | null;

// Traduz as mensagens de erro do Supabase Auth
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("already registered")) return "Já existe uma conta com este e-mail. Tente entrar.";
  if (m.includes("password should be")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "").trim();

export async function entrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const email = texto(formData, "email");
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error || !data.user) return { erro: traduzirErro(error?.message ?? "") };

  const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", data.user.id).single();
  const painel = PAINEL_DO_PAPEL[(perfil?.papel as Papel) ?? "cliente"];
  // Se veio de uma página protegida, volta para ela (o proxy confere se é da área certa)
  redirect(caminhoInternoSeguro(texto(formData, "proximo")) ?? painel);
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
