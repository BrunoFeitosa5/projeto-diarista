"use server";

import { headers } from "next/headers";
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

export async function cadastrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const papel = texto(formData, "papel");
  const nome = texto(formData, "nome");
  const telefone = texto(formData, "telefone");
  const email = texto(formData, "email");
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  // O banco também só aceita cliente/diarista; aqui é para dar uma mensagem clara
  if (papel !== "cliente" && papel !== "diarista") return { erro: "Escolha se você é cliente ou diarista." };
  if (nome.length < 3) return { erro: "Informe seu nome completo." };
  if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(telefone)) return { erro: "Informe o telefone no formato (11) 91234-5678." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "Informe um e-mail válido." };
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== confirmacao) return { erro: "As senhas não conferem." };

  const origem = (await headers()).get("origin") ?? "";
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      // Vão para raw_user_meta_data; o gatilho do banco cria o perfil com eles
      data: { nome, telefone, papel },
      emailRedirectTo: `${origem}/auth/confirmar`,
    },
  });
  if (error) return { erro: traduzirErro(error.message) };

  // Com confirmação de e-mail ligada, o Supabase não avisa que o e-mail já existe
  // (para não revelar contas); ele devolve um usuário sem "identities".
  if (data.user && data.user.identities?.length === 0) {
    return { erro: "Já existe uma conta com este e-mail. Tente entrar." };
  }

  // Confirmação de e-mail desligada no Supabase: já entra direto
  if (data.session) redirect(PAINEL_DO_PAPEL[papel]);

  return {
    sucesso: `Conta criada! Enviamos um link de confirmação para ${email}. Abra o e-mail e clique no link para entrar.`,
  };
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
