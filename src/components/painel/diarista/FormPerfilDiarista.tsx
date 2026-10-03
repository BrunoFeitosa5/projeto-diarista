"use client";

import { useActionState, useEffect, useState } from "react";
import { salvarPerfilDiarista, type EstadoPerfil } from "@/actions/diarista";
import { Aviso } from "@/components/auth/Aviso";
import { CHAVE_PRE_CADASTRO } from "@/components/site/FormTrabalheConosco";
import { Button } from "@/components/ui/Button";
import { Campo, classeCampo, classeRotulo } from "@/components/ui/Campo";
import { mascaraCnpj, mascaraCpf, mascaraData, mascaraTelefone } from "@/lib/mascaras";

type TipoPix = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

const TIPOS_PIX: { valor: TipoPix; nome: string; placeholder: string; mascara?: (v: string) => string }[] = [
  { valor: "cpf", nome: "CPF", placeholder: "000.000.000-00", mascara: mascaraCpf },
  { valor: "cnpj", nome: "CNPJ", placeholder: "00.000.000/0001-00", mascara: mascaraCnpj },
  { valor: "telefone", nome: "Telefone", placeholder: "(XX) XXXXX-XXXX", mascara: mascaraTelefone },
  { valor: "email", nome: "E-mail", placeholder: "seu@email.com" },
  { valor: "aleatoria", nome: "Chave aleatória", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
];

export type DadosPerfil = {
  cpf: string;
  cnpj: string;
  nascimento: string;
  tipo_chave_pix: TipoPix | "";
  chave_pix: string;
  referencia_nome: string;
  referencia_telefone: string;
  experiencia: string;
};

const MAX_EXPERIENCIA = 500;

// Converte o que veio do banco para o formato dos campos (com máscara)
function paraCampos(d: DadosPerfil): DadosPerfil {
  const tipo = TIPOS_PIX.find((t) => t.valor === d.tipo_chave_pix);
  const chave = d.tipo_chave_pix === "telefone" ? d.chave_pix.replace(/^\+55/, "") : d.chave_pix;
  return {
    ...d,
    cpf: mascaraCpf(d.cpf),
    cnpj: d.cnpj ? mascaraCnpj(d.cnpj) : "",
    chave_pix: tipo?.mascara ? tipo.mascara(chave) : chave,
    referencia_telefone: d.referencia_telefone ? mascaraTelefone(d.referencia_telefone) : "",
  };
}

export function FormPerfilDiarista({ inicial }: { inicial: DadosPerfil }) {
  const [estado, acao, enviando] = useActionState<EstadoPerfil, FormData>(salvarPerfilDiarista, null);
  const [campos, setCampos] = useState<DadosPerfil>(() => paraCampos(inicial));

  // Quem veio do "Trabalhe Conosco" já preencheu CNPJ e nascimento lá: aproveita se aqui estiver vazio
  useEffect(() => {
    try {
      const salvo = JSON.parse(sessionStorage.getItem(CHAVE_PRE_CADASTRO) ?? "null");
      if (!salvo) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do sessionStorage
      setCampos((c) => ({
        ...c,
        cnpj: c.cnpj || salvo.cnpj || "",
        nascimento: c.nascimento || salvo.nascimento || "",
      }));
    } catch {
      // sessionStorage indisponível: os campos só ficam em branco
    }
  }, []);

  // Depois de salvar, o pré-cadastro já não é necessário
  useEffect(() => {
    if (!estado?.sucesso) return;
    try {
      sessionStorage.removeItem(CHAVE_PRE_CADASTRO);
    } catch {}
  }, [estado]);

  const tipoAtual = TIPOS_PIX.find((t) => t.valor === campos.tipo_chave_pix);
  const mudar = (campo: keyof DadosPerfil, mascara?: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCampos((c) => ({ ...c, [campo]: mascara ? mascara(e.target.value) : e.target.value }));

  function mudarTipo(e: React.ChangeEvent<HTMLSelectElement>) {
    // Trocar o tipo apaga a chave: o formato de cada tipo é diferente
    setCampos((c) => ({ ...c, tipo_chave_pix: e.target.value as TipoPix, chave_pix: "" }));
  }

  return (
    <form action={acao} className="flex flex-col gap-5">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado?.sucesso && <Aviso tipo="sucesso">{estado.sucesso}</Aviso>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          rotulo="CPF"
          name="cpf"
          inputMode="numeric"
          required
          placeholder="000.000.000-00"
          value={campos.cpf}
          onChange={mudar("cpf", mascaraCpf)}
        />
        <Campo
          rotulo="Data de nascimento"
          name="nascimento"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="DD/MM/AAAA"
          value={campos.nascimento}
          onChange={mudar("nascimento", mascaraData)}
        />
        <div className="sm:col-span-2">
          <Campo
            rotulo="CNPJ (MEI), se tiver"
            name="cnpj"
            inputMode="numeric"
            placeholder="00.000.000/0001-00"
            value={campos.cnpj}
            onChange={mudar("cnpj", mascaraCnpj)}
          />
        </div>
      </div>

      <fieldset className="grid gap-5 rounded-card bg-superficie p-5 sm:grid-cols-[200px_1fr]">
        <legend className="sr-only">Chave Pix</legend>
        <p className="text-pequeno text-texto-secundario sm:col-span-2">
          A chave Pix é para a Império pagar você pelos serviços.
        </p>
        <div>
          <label htmlFor="campo-tipo-pix" className={classeRotulo}>
            Tipo da chave Pix*
          </label>
          <select
            id="campo-tipo-pix"
            name="tipo_chave_pix"
            required
            value={campos.tipo_chave_pix}
            onChange={mudarTipo}
            className={`${classeCampo} border-borda`}
          >
            <option value="" disabled>
              Escolha
            </option>
            {TIPOS_PIX.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
        <Campo
          rotulo="Chave Pix"
          name="chave_pix"
          required
          disabled={!tipoAtual}
          inputMode={tipoAtual?.mascara ? "numeric" : tipoAtual?.valor === "email" ? "email" : undefined}
          placeholder={tipoAtual?.placeholder ?? "Escolha o tipo primeiro"}
          value={campos.chave_pix}
          onChange={mudar("chave_pix", tipoAtual?.mascara)}
          className="border-borda"
        />
      </fieldset>

      <div>
        <label htmlFor="campo-experiencia" className={classeRotulo}>
          Resumo da sua experiência*
        </label>
        <textarea
          id="campo-experiencia"
          name="experiencia"
          rows={5}
          required
          minLength={20}
          maxLength={MAX_EXPERIENCIA}
          value={campos.experiencia}
          onChange={mudar("experiencia")}
          placeholder="Ex.: Trabalho com limpeza residencial há 5 anos, faço faxina completa e passadoria. Já atendi casas e escritórios."
          className={`${classeCampo} h-auto py-3`}
          aria-describedby="ajuda-experiencia"
        />
        <p id="ajuda-experiencia" className="mt-1 flex justify-between gap-4 text-pequeno text-texto-secundario">
          <span>Há quanto tempo trabalha, que tipo de limpeza faz e onde já trabalhou.</span>
          <span aria-live="polite">
            {campos.experiencia.length}/{MAX_EXPERIENCIA}
          </span>
        </p>
      </div>

      <fieldset className="grid gap-5 rounded-card bg-superficie p-5 sm:grid-cols-2">
        <legend className="sr-only">Referência (opcional)</legend>
        <div className="sm:col-span-2">
          <p className="font-medium">Referência (opcional)</p>
          <p className="mt-1 text-pequeno text-texto-secundario">
            Alguém que possa falar do seu trabalho, como uma ex-patroa. Avise a pessoa que a Império pode ligar.
          </p>
        </div>
        <Campo
          rotulo="Nome da referência"
          name="referencia_nome"
          autoComplete="off"
          maxLength={100}
          placeholder="Ex.: Maria Souza (ex-patroa)"
          value={campos.referencia_nome}
          onChange={mudar("referencia_nome")}
          className="border-borda"
        />
        <Campo
          rotulo="Telefone da referência"
          name="referencia_telefone"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          // Preencheu o nome? Então o telefone passa a ser obrigatório (e vice-versa)
          required={Boolean(campos.referencia_nome)}
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          title="Use o formato (11) 91234-5678"
          placeholder="(XX) XXXXX-XXXX"
          value={campos.referencia_telefone}
          onChange={mudar("referencia_telefone", mascaraTelefone)}
          className="border-borda"
        />
      </fieldset>

      <p className="text-pequeno text-texto-secundario">
        Estes dados ficam protegidos: só você e a Império têm acesso. Clientes nunca veem seu CPF, sua chave Pix
        nem sua referência.
      </p>

      <Button type="submit" variante="rosa-forte" disabled={enviando} className="self-start">
        {enviando ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
