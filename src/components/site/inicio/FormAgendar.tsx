"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { solicitarCodigo } from "@/actions/solicitacoes";
import { Button, ButtonLink } from "@/components/ui/Button";
import { classeCampo, classeRotulo } from "@/components/ui/Campo";
import { ANTECEDENCIA_DIAS, HORARIOS, LIMITE_DIAS, dataDaquiA, formatarData } from "@/config/agendamento";
import { PLANOS, PLANO_IDS, formatarReais, type PlanoId } from "@/config/planos";
import { mascaraTelefone } from "@/lib/mascaras";
import { linkWhatsApp } from "@/lib/whatsapp";
import { EVENTO_ESCOLHER_PLANO } from "./BotaoPlano";

const TIPOS = ["Limpeza comum", "Limpeza pesada", "Faxina pós-obra (a combinar)", "Passadoria"] as const;

// "Agende em minutos": o cliente preenche e abre o WhatsApp com os dados escritos.
// No clique o servidor gera o número do pedido (IMP-000123), que vai no começo da
// mensagem. Nome e telefone não são gravados; a conversa continua só pelo WhatsApp.
// Endereço completo, CPF e Pix ficam de fora: a dona pede no atendimento.
export function FormAgendar() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [plano, setPlano] = useState<PlanoId | "">("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [bairro, setBairro] = useState("");
  const [tipo, setTipo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState<{ codigo: string | null; link: string } | null>(null);
  const [enviando, iniciar] = useTransition();

  // Os cards de preço ("Agendar agora") avisam qual plano a pessoa escolheu
  useEffect(() => {
    const escolher = (e: Event) => {
      const id = (e as CustomEvent<PlanoId>).detail;
      if (PLANO_IDS.includes(id)) setPlano(id);
    };
    window.addEventListener(EVENTO_ESCOLHER_PLANO, escolher);
    return () => window.removeEventListener(EVENTO_ESCOLHER_PLANO, escolher);
  }, []);

  function montarLink(codigo: string | null) {
    const linhas = [
      codigo && `Pedido ${codigo}`,
      "Olá! Vim pelo site e gostaria de agendar uma limpeza.",
      `Nome: ${nome.trim()}`,
      `Telefone: ${telefone}`,
      plano && `Plano: ${PLANOS[plano].horas}h (${formatarReais(PLANOS[plano].precoCliente)})`,
      data && `Data: ${formatarData(data)}`,
      horario && `Horário: ${horario}`,
      `Bairro/cidade: ${bairro.trim()}`,
      tipo && `Tipo: ${tipo}`,
      observacoes.trim() && `Observações: ${observacoes.trim()}`,
    ].filter(Boolean);
    return linkWhatsApp(linhas.join("\n"));
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const dados = new FormData(e.currentTarget);
    // Nome e telefone ficam só no WhatsApp: nem chegam ao servidor
    dados.delete("nome");
    dados.delete("telefone");
    iniciar(async () => {
      const resultado = await solicitarCodigo(dados);
      if ("erro" in resultado) return setErro(resultado.erro);
      const link = montarLink(resultado.codigo);
      setEnviado({ codigo: resultado.codigo, link });
      // Mesma aba: depois de esperar o servidor, o celular costuma bloquear janela nova.
      // Se não abrir, o botão da confirmação faz o mesmo com um toque.
      window.location.assign(link);
    });
  }

  if (enviado) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <h3 className="text-h3">{enviado.codigo ? `Pedido ${enviado.codigo}` : "Solicitação pronta"}</h3>
        <p>
          {enviado.codigo
            ? "Toque em Enviar no WhatsApp para a Império receber o seu pedido com este número."
            : "Toque no botão abaixo e envie a mensagem no WhatsApp: a Império confirma o seu pedido por lá."}
        </p>
        <ButtonLink href={enviado.link} variante="verde" className="self-start">
          Abrir o WhatsApp
        </ButtonLink>
        <button type="button" onClick={() => setEnviado(null)} className="self-start text-pequeno underline">
          Corrigir os dados
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div>
        <label htmlFor="agendar-nome" className={classeRotulo}>
          Nome*
        </label>
        <input
          id="agendar-nome"
          name="nome"
          autoComplete="name"
          required
          minLength={2}
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="agendar-telefone" className={classeRotulo}>
          Telefone*
        </label>
        <input
          id="agendar-telefone"
          name="telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          placeholder="(XX) XXXXX-XXXX"
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          title="Use o formato (11) 91234-5678"
          value={telefone}
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="agendar-plano" className={classeRotulo}>
          Plano
        </label>
        <select
          id="agendar-plano"
          name="plano"
          value={plano}
          onChange={(e) => setPlano(e.target.value as PlanoId | "")}
          className={classeCampo}
        >
          <option value="">Ainda não sei</option>
          {PLANO_IDS.map((id) => (
            <option key={id} value={id}>
              {PLANOS[id].horas}h — {formatarReais(PLANOS[id].precoCliente)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="agendar-data" className={classeRotulo}>
            Data desejada
          </label>
          <input
            id="agendar-data"
            name="data"
            type="date"
            min={dataDaquiA(ANTECEDENCIA_DIAS)}
            max={dataDaquiA(LIMITE_DIAS)}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={classeCampo}
          />
        </div>
        <div>
          <label htmlFor="agendar-horario" className={classeRotulo}>
            Horário de início
          </label>
          <select
            id="agendar-horario"
            name="horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className={classeCampo}
          >
            <option value="">A combinar</option>
            {HORARIOS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="agendar-bairro" className={classeRotulo}>
          Bairro e cidade*
        </label>
        <input
          id="agendar-bairro"
          name="bairro"
          autoComplete="address-level2"
          required
          minLength={3}
          placeholder="Ex.: Mooca, São Paulo"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="agendar-tipo" className={classeRotulo}>
          Tipo de limpeza
        </label>
        <select id="agendar-tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={classeCampo}>
          <option value="">Escolha</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="agendar-obs" className={classeRotulo}>
          Observações
        </label>
        <textarea
          id="agendar-obs"
          name="observacoes"
          rows={3}
          maxLength={300}
          placeholder="Casa ou apartamento, animais, algo especial…"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className={`${classeCampo} h-auto py-3`}
        />
      </div>
      {/* Campo-isca contra robôs: fora da tela e sem foco; quem preenche é barrado no servidor */}
      <input name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {erro && (
        <p role="alert" className="text-pequeno text-rosa-forte">
          {erro}
        </p>
      )}
      <Button type="submit" variante="verde" className="self-start" disabled={enviando}>
        {enviando ? "Gerando seu pedido…" : "Contratar serviço"}
      </Button>
    </form>
  );
}
