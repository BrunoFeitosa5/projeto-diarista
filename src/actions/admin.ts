"use server";

import { refresh } from "next/cache";
import { exigirPapel } from "@/lib/auth";
import { STATUS, type StatusPedido } from "@/lib/status";

export type ResultadoAdmin = { erro: string } | { ok: true };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Erros que o banco escreve em português para quem está usando o painel
function mensagemDoBanco(mensagem: string | undefined): string {
  if (mensagem?.startsWith("Este pedido não está aguardando aprovação")) {
    return "Este pedido não está mais aguardando aprovação. Recarregue a página.";
  }
  if (mensagem?.startsWith("Mudança de status inválida")) {
    return "Essa mudança de status não é permitida agora. Recarregue a página.";
  }
  // Mensagens do banco já escritas em português para a admin
  if (mensagem?.startsWith("Esta diarista") || mensagem?.startsWith("Este pedido não está aguardando diarista")) {
    return mensagem.replace(/ \(status: .*\)\.$/, ".");
  }
  if (mensagem?.startsWith("Este pedido não está mais aberto")) {
    return "Este pedido não está mais aberto para vagas. Recarregue a página.";
  }
  console.error("ação da admin falhou:", mensagem);
  return "Não foi possível concluir agora. Tente novamente em instantes.";
}

export async function aprovarCandidatura(candidaturaId: string): Promise<ResultadoAdmin> {
  const { supabase } = await exigirPapel("admin");
  if (!UUID.test(candidaturaId)) return { erro: "Candidatura inválida." };

  const { error } = await supabase.rpc("aprovar_candidatura", { p_candidatura_id: candidaturaId });
  if (error) return { erro: mensagemDoBanco(error.message) };

  refresh();
  return { ok: true };
}

export async function verificarDiarista(diaristaId: string, verificada: boolean): Promise<ResultadoAdmin> {
  const { supabase } = await exigirPapel("admin");
  if (!UUID.test(diaristaId)) return { erro: "Diarista inválida." };

  const { error } = await supabase.rpc("verificar_diarista", { p_diarista_id: diaristaId, p_verificada: verificada });
  if (error) return { erro: mensagemDoBanco(error.message) };

  refresh();
  return { ok: true };
}

export async function marcarPublicadoGrupo(pedidoId: string): Promise<ResultadoAdmin> {
  const { supabase } = await exigirPapel("admin");
  if (!UUID.test(pedidoId)) return { erro: "Pedido inválido." };

  const { error } = await supabase.rpc("marcar_publicado_grupo", { p_pedido_id: pedidoId });
  if (error) return { erro: mensagemDoBanco(error.message) };

  refresh();
  return { ok: true };
}

export async function escolherDiarista(pedidoId: string, diaristaId: string): Promise<ResultadoAdmin> {
  const { supabase } = await exigirPapel("admin");
  if (!UUID.test(pedidoId) || !UUID.test(diaristaId)) return { erro: "Pedido ou diarista inválidos." };

  const { error } = await supabase.rpc("escolher_diarista", { p_pedido_id: pedidoId, p_diarista_id: diaristaId });
  if (error) return { erro: mensagemDoBanco(error.message) };

  refresh();
  return { ok: true };
}

export async function mudarStatus(pedidoId: string, novoStatus: StatusPedido): Promise<ResultadoAdmin> {
  const { supabase } = await exigirPapel("admin");
  if (!UUID.test(pedidoId)) return { erro: "Pedido inválido." };
  if (!(novoStatus in STATUS)) return { erro: "Status inválido." };

  const { error } = await supabase.rpc("mudar_status_pedido", { p_pedido_id: pedidoId, p_novo_status: novoStatus });
  if (error) return { erro: mensagemDoBanco(error.message) };

  refresh();
  return { ok: true };
}
