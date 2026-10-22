"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { ANTECEDENCIA_DIAS, dataDaquiA, HORARIOS, LIMITE_DIAS } from "@/config/agendamento";
import { PLANO_IDS, type PlanoId } from "@/config/planos";
import { criarClienteServico } from "@/lib/supabase/servico";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "").trim();

const TIPOS = ["Limpeza comum", "Limpeza pesada", "Pós-obra", "Passadoria"];

// codigo = null: não saiu o número (falha do servidor), mas o cliente ainda pode
// chamar a dona; a mensagem vai sem código e ela anota depois.
export type ResultadoSolicitacao = { codigo: string | null } | { erro: string };

// Gera o número do pedido (IMP-000123) no clique de "Contratar serviço".
// Não cria conta nem grava telefone, nome ou endereço: só um registro simples
// (plano, data, horário, bairro e cidade) para histórico.
export async function solicitarCodigo(formData: FormData): Promise<ResultadoSolicitacao> {
  // Campo-isca: invisível para gente; robôs costumam preencher
  if (texto(formData, "site")) return { erro: "Não foi possível continuar." };

  const plano = texto(formData, "plano");
  const data = texto(formData, "data");
  const horario = texto(formData, "horario");
  const bairroCidade = texto(formData, "bairro");
  const tipo = texto(formData, "tipo");

  if (plano && !PLANO_IDS.includes(plano as PlanoId)) return { erro: "Escolha um dos planos da lista." };
  if (data && (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < dataDaquiA(ANTECEDENCIA_DIAS) || data > dataDaquiA(LIMITE_DIAS))) {
    return { erro: `Escolha uma data a partir de amanhã e em até ${LIMITE_DIAS} dias.` };
  }
  if (horario && !(HORARIOS as readonly string[]).includes(horario)) return { erro: "Escolha um dos horários da lista." };
  if (tipo && !TIPOS.includes(tipo)) return { erro: "Escolha um dos tipos de limpeza da lista." };
  if (bairroCidade.length < 3 || bairroCidade.length > 120) return { erro: "Informe o bairro e a cidade." };

  // IP só vira um hash com segredo do servidor: serve para limitar abuso, não identifica ninguém
  const cabecalhos = await headers();
  const ip = (cabecalhos.get("x-forwarded-for")?.split(",")[0] ?? cabecalhos.get("x-real-ip") ?? "").trim();
  const ipHash = ip
    ? createHash("sha256").update(`${ip}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`).digest("hex").slice(0, 32)
    : null;

  const { data: codigo, error } = await criarClienteServico().rpc("solicitar_codigo", {
    p_plano: plano || null,
    p_data: data || null,
    p_horario: horario || null,
    p_bairro_cidade: bairroCidade,
    p_tipo: tipo || null,
    p_ip_hash: ipHash,
  });

  if (error || typeof codigo !== "string") {
    // 53400 = limite por hora do banco
    if (error?.code === "53400") return { erro: "Muitas solicitações em pouco tempo. Tente de novo mais tarde ou chame a gente no WhatsApp." };
    console.error("solicitar_codigo falhou:", error?.message);
    return { codigo: null };
  }
  return { codigo };
}
