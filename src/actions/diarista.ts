"use server";

import { refresh } from "next/cache";
import { exigirPapel } from "@/lib/auth";
import { cnpjValido, cpfValido } from "@/lib/documentos";
import type { EstadoForm } from "./auth";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "").trim();
const soDigitos = (valor: string) => valor.replace(/\D/g, "");

export type EstadoPerfil = (EstadoForm & { valores?: Record<string, string> }) | null;

const TIPOS_PIX = ["cpf", "cnpj", "email", "telefone", "aleatoria"] as const;
type TipoPix = (typeof TIPOS_PIX)[number];

// Confere a chave Pix conforme o tipo e devolve no formato que o banco guarda
function normalizarPix(tipo: TipoPix, chave: string): string | null {
  switch (tipo) {
    case "cpf":
      return cpfValido(chave) ? soDigitos(chave) : null;
    case "cnpj":
      return cnpjValido(chave) ? soDigitos(chave) : null;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave) && chave.length <= 77 ? chave.toLowerCase() : null;
    case "telefone": {
      const d = soDigitos(chave).replace(/^55(?=\d{10,11}$)/, "");
      return d.length === 10 || d.length === 11 ? `+55${d}` : null;
    }
    case "aleatoria":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave) ? chave.toLowerCase() : null;
  }
}

// "31/12/1990" → "1990-12-31", só se for uma data real e a pessoa tiver de 18 a 100 anos
function nascimentoValido(valor: string): string | null {
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dia, mes, ano] = m.map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCDate() !== dia || data.getUTCMonth() !== mes - 1) return null;
  const hoje = new Date();
  const idade = hoje.getUTCFullYear() - ano - (hoje < new Date(Date.UTC(hoje.getUTCFullYear(), mes - 1, dia)) ? 1 : 0);
  if (idade < 18 || idade > 100) return null;
  return `${ano}-${m[2]}-${m[1]}`;
}

// Dados sensíveis da diarista (tabela diaristas_privado: só ela e a admin leem)
export async function salvarPerfilDiarista(_estado: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const { perfil, supabase } = await exigirPapel("diarista");

  const cpf = texto(formData, "cpf");
  const cnpj = texto(formData, "cnpj");
  const nascimento = texto(formData, "nascimento");
  const tipoPix = texto(formData, "tipo_chave_pix");
  const chavePix = texto(formData, "chave_pix");

  const valores = { cpf, cnpj, nascimento, tipo_chave_pix: tipoPix, chave_pix: chavePix };
  const falha = (erro: string): EstadoPerfil => ({ erro, valores });

  if (!cpfValido(cpf)) return falha("CPF inválido. Confira os números.");
  if (cnpj && !cnpjValido(cnpj)) return falha("CNPJ inválido. Confira os números ou deixe em branco.");
  const dataNascimento = nascimento ? nascimentoValido(nascimento) : null;
  if (nascimento && !dataNascimento) return falha("Data de nascimento inválida (use DD/MM/AAAA; é preciso ter 18 anos ou mais).");
  if (!TIPOS_PIX.includes(tipoPix as TipoPix)) return falha("Escolha o tipo da chave Pix.");
  const pix = normalizarPix(tipoPix as TipoPix, chavePix);
  if (!pix) return falha("Chave Pix inválida para o tipo escolhido.");

  // Pelo cliente do usuário: o RLS garante que ela só grava a própria linha
  const { error } = await supabase.from("diaristas_privado").upsert({
    diarista_id: perfil.id,
    cpf: soDigitos(cpf),
    cnpj: cnpj ? soDigitos(cnpj) : null,
    data_nascimento: dataNascimento,
    chave_pix: pix,
    tipo_chave_pix: tipoPix,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("salvar perfil da diarista falhou:", error.message);
    return falha("Não foi possível salvar agora. Tente novamente em instantes.");
  }
  return { sucesso: "Perfil salvo! Agora você já pode se candidatar às vagas." };
}

export type ResultadoCandidatura = { erro: string } | { codigo: string };

// Mensagens que a função candidatar() do banco escreve para a diarista
const ERROS_DO_BANCO = ["Complete seu perfil", "Esta vaga não está mais aberta", "Pedido não encontrado"];

export async function candidatar(pedidoId: string): Promise<ResultadoCandidatura> {
  const { supabase } = await exigirPapel("diarista");
  if (!/^[0-9a-f-]{36}$/i.test(pedidoId)) return { erro: "Vaga inválida." };

  const { data: codigo, error } = await supabase.rpc("candidatar", { p_pedido_id: pedidoId });
  if (error || !codigo) {
    const conhecido = ERROS_DO_BANCO.find((m) => error?.message.startsWith(m));
    if (!conhecido) console.error("candidatar falhou:", error?.message);
    return { erro: conhecido ? error!.message : "Não foi possível enviar a candidatura. Tente novamente." };
  }

  refresh();
  return { codigo: codigo as string };
}
