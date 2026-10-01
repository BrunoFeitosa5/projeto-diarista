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
};

// Converte o que veio do banco para o formato dos campos (com máscara)
function paraCampos(d: DadosPerfil): DadosPerfil {
  const tipo = TIPOS_PIX.find((t) => t.valor === d.tipo_chave_pix);
  const chave = d.tipo_chave_pix === "telefone" ? d.chave_pix.replace(/^\+55/, "") : d.chave_pix;
  return {
    ...d,
    cpf: mascaraCpf(d.cpf),
    cnpj: d.cnpj ? mascaraCnpj(d.cnpj) : "",
    chave_pix: tipo?.mascara ? tipo.mascara(chave) : chave,
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
  const mudar = (campo: keyof DadosPerfil, mascara?: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) =>
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

      <fieldset className="grid gap-5 rounded-card bg-white p-5 sm:grid-cols-[200px_1fr]">
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

      <p className="text-pequeno text-texto-secundario">
        Estes dados ficam protegidos: só você e a Império têm acesso. Clientes nunca veem seu CPF nem sua chave Pix.
      </p>

      <Button type="submit" variante="rosa-forte" disabled={enviando} className="self-start">
        {enviando ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
