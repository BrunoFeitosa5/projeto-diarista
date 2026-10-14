// Backup dos dados do Supabase para arquivos JSON no seu computador.
// Uso: npm run backup
//
// O plano grátis do Supabase não tem backup para baixar. Este comando lê todas
// as tabelas com a chave service_role (.env.local) e grava em
// backups/AAAA-MM-DD_HHMM/. A pasta "backups" fica FORA do git porque tem CPF,
// Pix, telefones e endereços: guarde em lugar seguro (nunca no GitHub nem
// em pasta compartilhada). Só lê, nunca altera nada no banco.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const raiz = join(import.meta.dirname, "..");

const arquivoEnv = join(raiz, ".env.local");
if (!existsSync(arquivoEnv)) {
  console.error("Falta o .env.local (URL e chave service_role do Supabase).");
  process.exit(1);
}
const env = readFileSync(arquivoEnv, "utf8");
const lerEnv = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) ?? [])[1]?.trim();
const URL_SB = lerEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICO = lerEnv("SUPABASE_SERVICE_ROLE_KEY");
if (!URL_SB || !SERVICO) {
  console.error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}

const sb = createClient(URL_SB, SERVICO, { auth: { persistSession: false } });

// Tabelas do app, na ordem em que fariam sentido para restaurar
const TABELAS = [
  "profiles",
  "diaristas_privado",
  "diaristas_verificadas",
  "pedidos",
  "pedido_enderecos",
  "candidaturas",
  "pedido_historico",
];
const PAGINA = 1000; // o Supabase devolve no máximo 1000 linhas por consulta

async function lerTabela(nome) {
  const linhas = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await sb.from(nome).select("*").order("created_at", { ascending: true, nullsFirst: true }).range(de, de + PAGINA - 1);
    if (error) {
      // Tabelas sem created_at: tenta de novo sem ordenar
      if (error.message.includes("created_at")) {
        const r = await sb.from(nome).select("*").range(de, de + PAGINA - 1);
        if (r.error) throw new Error(`${nome}: ${r.error.message}`);
        linhas.push(...r.data);
        if (r.data.length < PAGINA) return linhas;
        continue;
      }
      throw new Error(`${nome}: ${error.message}`);
    }
    linhas.push(...data);
    if (data.length < PAGINA) return linhas;
  }
}

// Contas de login (e-mail e datas; a senha nunca sai do Supabase)
async function lerContas() {
  const contas = [];
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await sb.auth.admin.listUsers({ page: pagina, perPage: PAGINA });
    if (error) throw new Error(`contas: ${error.message}`);
    contas.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
      })),
    );
    if (data.users.length < PAGINA) return contas;
  }
}

const agora = new Date();
const carimbo = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
})
  .format(agora)
  .replace(" ", "_")
  .replace(":", "");
const pasta = join(raiz, "backups", carimbo);
mkdirSync(pasta, { recursive: true });

console.log(`Backup em backups/${carimbo}\n`);
const resumo = { gerado_em: agora.toISOString(), projeto: URL_SB, tabelas: {} };
let falhou = false;

for (const nome of TABELAS) {
  try {
    const linhas = await lerTabela(nome);
    writeFileSync(join(pasta, `${nome}.json`), JSON.stringify(linhas, null, 2));
    resumo.tabelas[nome] = linhas.length;
    console.log(`  ✓ ${nome}: ${linhas.length} linha(s)`);
  } catch (e) {
    falhou = true;
    console.log(`  ✗ ${e.message}`);
  }
}

try {
  const contas = await lerContas();
  writeFileSync(join(pasta, "contas_login.json"), JSON.stringify(contas, null, 2));
  resumo.tabelas.contas_login = contas.length;
  console.log(`  ✓ contas_login: ${contas.length} conta(s)`);
} catch (e) {
  falhou = true;
  console.log(`  ✗ ${e.message}`);
}

writeFileSync(join(pasta, "resumo.json"), JSON.stringify(resumo, null, 2));

if (falhou) {
  console.log("\nO backup está INCOMPLETO: veja os erros acima.");
  process.exit(1);
}
console.log("\nBackup completo. Guarde a pasta em lugar seguro: ela tem CPF, Pix e endereços.");
