"use client";

import { useActionState, useState } from "react";
import { criarPedido, type EstadoPedido } from "@/actions/pedidos";
import { Aviso } from "@/components/auth/Aviso";
import { Button } from "@/components/ui/Button";
import { Campo, classeCampo, classeRotulo } from "@/components/ui/Campo";
import { HORARIOS } from "@/config/agendamento";
import { formatarReais, PLANO_IDS, PLANOS, type PlanoId } from "@/config/planos";
import { mascaraCep } from "@/lib/mascaras";

type Endereco = { rua: string; bairro: string; cidade: string };

type Props = { planoInicial: PlanoId | null; dataMinima: string; dataMaxima: string };

export function FormNovoPedido({ planoInicial, dataMinima, dataMaxima }: Props) {
  const [estado, acao, enviando] = useActionState<EstadoPedido, FormData>(criarPedido, null);
  // Depois de um erro, os campos voltam preenchidos com o que foi enviado
  const v = estado?.valores;
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<Endereco>({ rua: "", bairro: "", cidade: "" });
  const [buscaCep, setBuscaCep] = useState<"parado" | "buscando" | "nao-achou">("parado");

  // Ao completar os 8 números, busca rua, bairro e cidade no ViaCEP (gratuito).
  // O cliente ainda pode corrigir os campos depois.
  async function mudarCep(valor: string) {
    const formatado = mascaraCep(valor);
    setCep(formatado);
    const numeros = formatado.replace(/\D/g, "");
    if (numeros.length !== 8) {
      setBuscaCep("parado");
      return;
    }
    setBuscaCep("buscando");
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const dados = await resposta.json();
      if (!resposta.ok || dados.erro) throw new Error("CEP não encontrado");
      setEndereco({ rua: dados.logradouro ?? "", bairro: dados.bairro ?? "", cidade: dados.localidade ?? "" });
      setBuscaCep("parado");
    } catch {
      setBuscaCep("nao-achou");
    }
  }

  const mudarEndereco = (campo: keyof Endereco) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEndereco((atual) => ({ ...atual, [campo]: e.target.value }));

  return (
    <form action={acao} className="flex flex-col gap-8">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <fieldset>
        <legend className="mb-3 text-h4">1. Escolha o plano</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANO_IDS.map((id) => {
            const plano = PLANOS[id];
            return (
              <label
                key={id}
                className="cursor-pointer rounded-botao-lg border-2 border-white bg-white p-4 transition-colors hover:bg-campo-hover has-checked:border-rosa-forte has-focus-visible:outline-2 has-focus-visible:outline-rosa-forte"
              >
                <input
                  type="radio"
                  name="plano"
                  value={id}
                  defaultChecked={id === (v?.plano ?? planoInicial)}
                  required
                  className="sr-only"
                />
                <span className="block font-medium text-marinho">{plano.horas} horas</span>
                <span className="mt-1 block text-h4 text-rosa-destaque">{formatarReais(plano.precoCliente)}</span>
                <span className="mt-1 block text-pequeno text-texto-secundario">{plano.metragem}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-h4">2. Data e horário</legend>
        <Campo rotulo="Data" name="data" type="date" required min={dataMinima} max={dataMaxima} defaultValue={v?.data} />
        <div>
          <label htmlFor="campo-horario" className={classeRotulo}>
            Horário de início*
          </label>
          <select id="campo-horario" name="horario" required defaultValue={v?.horario ?? ""} className={classeCampo}>
            <option value="" disabled>
              Escolha
            </option>
            {HORARIOS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-6">
        <legend className="mb-3 text-h4">3. Endereço do serviço</legend>
        <div className="sm:col-span-2">
          <Campo
            rotulo="CEP"
            name="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            required
            placeholder="00000-000"
            pattern="\d{5}-\d{3}"
            title="Use o formato 00000-000"
            value={cep}
            onChange={(e) => mudarCep(e.target.value)}
            aria-describedby="ajuda-cep"
          />
          <p id="ajuda-cep" className="mt-1 text-pequeno text-texto-secundario" aria-live="polite">
            {buscaCep === "buscando" && "Buscando endereço..."}
            {buscaCep === "nao-achou" && "Não achamos este CEP. Preencha o endereço abaixo."}
          </p>
        </div>
        <div className="sm:col-span-4">
          <Campo rotulo="Rua" name="rua" autoComplete="address-line1" required maxLength={120} value={endereco.rua} onChange={mudarEndereco("rua")} />
        </div>
        <div className="sm:col-span-2">
          <Campo rotulo="Número" name="numero" required maxLength={20} defaultValue={v?.numero} />
        </div>
        <div className="sm:col-span-4">
          <Campo rotulo="Complemento" name="complemento" autoComplete="address-line2" maxLength={120} placeholder="Apto, bloco, casa..." defaultValue={v?.complemento} />
        </div>
        <div className="sm:col-span-3">
          <Campo rotulo="Bairro" name="bairro" required maxLength={120} value={endereco.bairro} onChange={mudarEndereco("bairro")} />
        </div>
        <div className="sm:col-span-3">
          <Campo rotulo="Cidade" name="cidade" autoComplete="address-level2" required maxLength={120} value={endereco.cidade} onChange={mudarEndereco("cidade")} />
        </div>
        <div className="sm:col-span-6">
          <Campo rotulo="Ponto de referência" name="referencia" maxLength={120} defaultValue={v?.referencia} />
        </div>
        <p className="text-pequeno text-texto-secundario sm:col-span-6">
          As diaristas veem só o bairro e a cidade. O endereço completo aparece apenas para a diarista aprovada.
        </p>
      </fieldset>

      <div>
        <label htmlFor="campo-observacoes" className={`${classeRotulo} text-h4!`}>
          4. Observações
        </label>
        <textarea
          id="campo-observacoes"
          name="observacoes"
          rows={4}
          maxLength={500}
          defaultValue={v?.observacoes}
          placeholder="Ex.: tenho um cachorro, foco na cozinha, trazer escada..."
          className={`${classeCampo} h-auto py-3`}
        />
      </div>

      <Button type="submit" variante="rosa-forte" disabled={enviando} className="self-start">
        {enviando ? "Enviando pedido..." : "Agendar diária"}
      </Button>
    </form>
  );
}
