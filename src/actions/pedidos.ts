"use server";

import { redirect } from "next/navigation";
import { ANTECEDENCIA_DIAS, dataDaquiA, HORARIOS, LIMITE_DIAS } from "@/config/agendamento";
import { PLANO_IDS, PLANOS, type PlanoId } from "@/config/planos";
import { exigirPapel } from "@/lib/auth";
import { criarClienteServico } from "@/lib/supabase/servico";
import type { EstadoForm } from "./auth";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "").trim();

// Os valores voltam junto com o erro para o formulário não perder o que foi digitado
export type EstadoPedido = (EstadoForm & { valores?: Record<string, string> }) | null;

// Cria o pedido do cliente logado. Os valores (preço e repasse) vêm de
// src/config/planos.ts, nunca do formulário.
export async function criarPedido(_estado: EstadoPedido, formData: FormData): Promise<EstadoPedido> {
  // 2ª camada: confere a sessão aqui, mesmo com o proxy protegendo a página
  const { perfil } = await exigirPapel("cliente");

  const plano = texto(formData, "plano");
  const data = texto(formData, "data");
  const horario = texto(formData, "horario");
  const cep = texto(formData, "cep").replace(/\D/g, "");
  const rua = texto(formData, "rua");
  const numero = texto(formData, "numero");
  const complemento = texto(formData, "complemento");
  const referencia = texto(formData, "referencia");
  const bairro = texto(formData, "bairro");
  const cidade = texto(formData, "cidade");
  const observacoes = texto(formData, "observacoes");

  const valores = {
    plano, data, horario, cep: texto(formData, "cep"), rua, numero, complemento, referencia, bairro, cidade, observacoes,
  };
  const falha = (erro: string): EstadoPedido => ({ erro, valores });

  if (!PLANO_IDS.includes(plano as PlanoId)) return falha("Escolha um dos planos: 4h, 6h ou 8h.");
  // Datas no formato AAAA-MM-DD podem ser comparadas como texto
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < dataDaquiA(ANTECEDENCIA_DIAS) || data > dataDaquiA(LIMITE_DIAS)) {
    return falha(`Escolha uma data a partir de amanhã e em até ${LIMITE_DIAS} dias.`);
  }
  if (!(HORARIOS as readonly string[]).includes(horario)) return falha("Escolha um dos horários da lista.");
  if (cep.length !== 8) return falha("Informe um CEP com 8 números.");
  if (!rua || !numero || !bairro || !cidade) return falha("Preencha rua, número, bairro e cidade.");
  if (
    [rua, bairro, cidade, complemento, referencia].some((v) => v.length > 120) ||
    numero.length > 20 ||
    observacoes.length > 500
  ) {
    return falha("Algum campo passou do tamanho permitido. Encurte o texto e tente de novo.");
  }

  const { precoCliente, repasseDiarista } = PLANOS[plano as PlanoId];

  const { data: criado, error } = await criarClienteServico()
    .rpc("criar_pedido", {
      p_cliente_id: perfil.id,
      p_plano: plano,
      p_valor_cliente: precoCliente,
      p_valor_diarista: repasseDiarista,
      p_data: data,
      p_horario: horario,
      p_bairro: bairro,
      p_cidade: cidade,
      p_observacoes: observacoes,
      p_cep: cep.replace(/^(\d{5})(\d{3})$/, "$1-$2"),
      p_rua: rua,
      p_numero: numero,
      p_complemento: complemento,
      p_referencia: referencia,
    })
    .single<{ id: string; codigo: string }>();

  if (error || !criado) {
    console.error("criar_pedido falhou:", error?.message);
    return falha("Não foi possível criar o pedido agora. Tente novamente em instantes.");
  }

  redirect(`/cliente/pedidos/${criado.id}?novo=1`);
}
