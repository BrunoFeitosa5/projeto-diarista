// Revisão de segurança contra o Supabase DE VERDADE e o site rodando (etapa 11).
// Uso: com o "npm run dev" ligado, rode "npm run test:seguranca".
//
// Cria contas temporárias (2 clientes, 2 diaristas e 1 admin) e um pedido,
// tenta o que um invasor tentaria (ler dados alheios, pular etapas, chamar
// Server Actions direto, achar a chave secreta no navegador) e apaga tudo no
// final. Cada execução gasta 1 número de pedido (IMP-...).
// Sai com código 1 se algum teste falhar.

import { execSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const raiz = join(import.meta.dirname, "..");
const SITE = process.env.SITE_URL ?? "http://localhost:3000";

// ---- Configuração (.env.local) ---------------------------------------------
const env = readFileSync(join(raiz, ".env.local"), "utf8");
const lerEnv = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) ?? [])[1]?.trim();
const URL_SB = lerEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON = lerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICO = lerEnv("SUPABASE_SERVICE_ROLE_KEY");
if (!URL_SB || !ANON || !SERVICO) {
  console.error("Preencha o .env.local (URL, chave anon e service_role) antes de rodar.");
  process.exit(1);
}
const admSb = createClient(URL_SB, SERVICO, { auth: { persistSession: false } });

let falhas = 0;
function ok(condicao, descricao, detalhe = "") {
  if (condicao) console.log(`  ✓ ${descricao}`);
  else {
    falhas++;
    console.log(`  ✗ ${descricao}${detalhe ? `  → ${detalhe}` : ""}`);
  }
}
const secao = (titulo) => console.log(`\n${titulo}`);

// ---- Contas temporárias ----------------------------------------------------
const criados = [];
const pedidosCriados = [];

async function sessao(email, senha) {
  const jar = new Map();
  const sb = createServerClient(URL_SB, ANON, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (lista) => lista.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  if (email) {
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(`login de teste falhou: ${error.message}`);
  }
  const cookie = () => [...jar].map(([n, v]) => `${n}=${v}`).join("; ");
  return { sb, cookie };
}

async function conta(papel, nome) {
  const email = `seguranca-${papel}-${randomUUID().slice(0, 8)}@exemplo.test`;
  const senha = randomBytes(12).toString("hex");
  // "admin" no cadastro deve virar cliente (o gatilho do banco ignora); depois
  // promovemos pela chave service_role, como o tornar-admin.sql faz
  const { data, error } = await admSb.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { papel, nome, telefone: "(11) 90000-0000" },
  });
  if (error) throw new Error(`criar conta de teste falhou: ${error.message}`);
  criados.push(data.user.id);
  const { data: perfil } = await admSb.from("profiles").select("papel").eq("id", data.user.id).single();
  if (papel === "admin") await admSb.from("profiles").update({ papel: "admin" }).eq("id", data.user.id);
  return { id: data.user.id, papelNoCadastro: perfil.papel, ...(await sessao(email, senha)) };
}

// Abre uma página do site como a pessoa (ou anônimo) e devolve status e destino
async function pagina(caminho, quem) {
  const r = await fetch(SITE + caminho, { headers: quem ? { cookie: quem.cookie() } : {}, redirect: "manual" });
  return { status: r.status, destino: r.headers.get("location") ?? "" };
}

// Chama uma Server Action direto (como um invasor faria, sem a tela)
function idDaAcao(nome) {
  const arquivo = join(raiz, ".next/dev/server/server-reference-manifest.json");
  if (!existsSync(arquivo)) return null;
  const manifesto = JSON.parse(readFileSync(arquivo, "utf8"));
  return Object.entries(manifesto.node ?? {}).find(([, v]) => v.exportedName === nome)?.[0] ?? null;
}
async function chamarAcao(nome, args, quem, origem = SITE) {
  const id = idDaAcao(nome);
  if (!id) return null;
  const r = await fetch(`${SITE}/`, {
    method: "POST",
    headers: {
      "Next-Action": id,
      "Content-Type": "text/plain;charset=UTF-8",
      Origin: origem,
      ...(quem ? { cookie: quem.cookie() } : {}),
    },
    body: JSON.stringify(args),
    redirect: "manual",
  });
  return r.status;
}

const contar = async (sb, tabela, filtro = (q) => q) => (await filtro(sb.from(tabela).select("*"))).data?.length ?? 0;
const erroRpc = async (sb, nome, args) => (await sb.rpc(nome, args)).error?.message ?? null;

const TABELAS = ["profiles", "diaristas_privado", "pedidos", "pedido_enderecos", "candidaturas", "pedido_historico"];

try {
  // ---- Montagem ---------------------------------------------------------------
  const vivo = await fetch(SITE, { redirect: "manual" }).catch(() => null);
  if (!vivo) {
    console.error(`O site não respondeu em ${SITE}. Ligue o "npm run dev" e rode de novo.`);
    process.exit(1);
  }

  const clienteA = await conta("cliente", "Cliente A");
  const clienteB = await conta("cliente", "Cliente B");
  const diarista1 = await conta("diarista", "Diarista Completa");
  const diarista2 = await conta("diarista", "Diarista Sem Perfil");
  const admin = await conta("admin", "Admin Teste");
  const anonimo = await sessao();

  await diarista1.sb.from("diaristas_privado").upsert({
    diarista_id: diarista1.id,
    cpf: "52998224725",
    chave_pix: "52998224725",
    tipo_chave_pix: "cpf",
    experiencia: "Conta de teste: faxina residencial há 3 anos.",
    referencia_nome: "Referência Teste",
    referencia_telefone: "11999990000",
  });

  const dataFutura = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(Date.now() + 3 * 864e5),
  );
  const { data: pedido, error: erroPedido } = await admSb
    .rpc("criar_pedido", {
      p_cliente_id: clienteA.id, p_plano: "4h", p_valor_cliente: 160, p_valor_diarista: 128,
      p_data: dataFutura, p_horario: "09:00", p_bairro: "Bairro Teste", p_cidade: "São Paulo",
      p_observacoes: "", p_cep: "01000-000", p_rua: "Rua Secreta", p_numero: "1",
      p_complemento: "", p_referencia: "",
    })
    .single();
  if (erroPedido) throw new Error(`criar pedido de teste falhou: ${erroPedido.message}`);
  pedidosCriados.push(pedido.id);
  console.log(`Montagem: 5 contas temporárias e o pedido ${pedido.codigo}`);
  const doPedido = (q) => q.eq("pedido_id", pedido.id);
  const statusDoPedido = async () => (await admSb.from("pedidos").select("status").eq("id", pedido.id).single()).data.status;

  // ---- 1. Visitante sem login -------------------------------------------------
  secao("1. Visitante sem login (só a chave pública)");
  for (const t of TABELAS) ok((await contar(anonimo.sb, t)) === 0, `não lê nada de ${t}`);
  ok(!!(await erroRpc(anonimo.sb, "candidatar", { p_pedido_id: pedido.id })), "não se candidata");
  ok(!!(await erroRpc(anonimo.sb, "mudar_status_pedido", { p_pedido_id: pedido.id, p_novo_status: "cancelada" })), "não muda status");
  for (const area of ["/cliente", "/diarista", "/admin", `/admin/pedidos/${pedido.id}`]) {
    const p = await pagina(area);
    ok(p.status === 307 && p.destino.startsWith("/entrar"), `${area} manda para o login`, `${p.status} ${p.destino}`);
  }

  // ---- 2. Cadastro -------------------------------------------------------------
  secao("2. Cadastro");
  ok(admin.papelNoCadastro === "cliente", "quem pede papel 'admin' no cadastro vira cliente");
  for (const quem of [clienteA, diarista1]) {
    const { error } = await quem.sb.from("profiles").update({ papel: "admin" }).eq("id", quem.id);
    ok(!!error, `${quem === clienteA ? "cliente" : "diarista"} não consegue virar admin`, error ? "" : "virou admin!");
  }

  // ---- 3. Cliente curiosa (outra cliente) -------------------------------------
  secao("3. Cliente tentando ver o pedido de outra cliente");
  ok((await contar(clienteB.sb, "pedidos", (q) => q.eq("id", pedido.id))) === 0, "não vê o pedido");
  ok((await contar(clienteB.sb, "pedido_enderecos", doPedido)) === 0, "não vê o endereço");
  ok((await contar(clienteB.sb, "pedido_historico", doPedido)) === 0, "não vê o histórico");
  ok((await contar(clienteB.sb, "profiles", (q) => q.neq("id", clienteB.id))) === 0, "não vê o perfil de ninguém");
  ok((await contar(clienteB.sb, "diaristas_privado")) === 0, "não vê CPF/Pix de diaristas");
  const p404 = await pagina(`/cliente/pedidos/${pedido.id}`, clienteB);
  ok(p404.status === 404, "a página do pedido alheio dá 404", String(p404.status));
  const { error: insercao } = await clienteB.sb.from("pedidos").insert({
    cliente_id: clienteB.id, plano: "4h", valor_cliente: 1, valor_diarista: 0,
    data: dataFutura, horario: "09:00", bairro: "x", cidade: "x",
  });
  ok(!!insercao, "não cria pedido direto no banco (ex.: com preço de R$1)");
  ok(!!(await erroRpc(clienteB.sb, "criar_pedido", { p_cliente_id: clienteB.id })), "não chama criar_pedido (só o servidor)");
  ok(!!(await erroRpc(clienteA.sb, "mudar_status_pedido", { p_pedido_id: pedido.id, p_novo_status: "cancelada" })), "nem a dona do pedido muda o status");
  ok(!!(await erroRpc(clienteA.sb, "candidatar", { p_pedido_id: pedido.id })), "cliente não se candidata");
  const pAdm = await pagina("/admin", clienteA);
  ok(pAdm.status === 307 && pAdm.destino === "/cliente", "/admin manda a cliente de volta", `${pAdm.status} ${pAdm.destino}`);

  // ---- 4. Diaristas -------------------------------------------------------------
  secao("4. Diaristas");
  ok((await contar(diarista1.sb, "pedidos", (q) => q.eq("id", pedido.id))) === 1, "vê a vaga aberta");
  ok((await contar(diarista1.sb, "pedido_enderecos", doPedido)) === 0, "NÃO vê o endereço antes de ser aprovada");
  ok((await contar(diarista1.sb, "profiles", (q) => q.eq("id", clienteA.id))) === 0, "NÃO vê o perfil da cliente antes da aprovação");
  ok((await contar(diarista1.sb, "diaristas_privado", (q) => q.neq("diarista_id", diarista1.id))) === 0, "não vê CPF/Pix de outras diaristas");
  const semPerfil = await erroRpc(diarista2.sb, "candidatar", { p_pedido_id: pedido.id });
  ok(semPerfil?.startsWith("Complete seu perfil"), "sem CPF, Pix e experiência não consegue se candidatar", semPerfil ?? "candidatou!");
  const { error: privAlheio } = await diarista1.sb
    .from("diaristas_privado")
    .upsert({ diarista_id: diarista2.id, cpf: "11144477735", chave_pix: "golpe@exemplo.test", tipo_chave_pix: "email" });
  ok(!!privAlheio, "não troca a chave Pix de outra diarista");
  ok(!(await erroRpc(diarista1.sb, "candidatar", { p_pedido_id: pedido.id })), "com perfil completo se candidata");
  const { data: cand } = await admSb.from("candidaturas").select("id").eq("pedido_id", pedido.id).single();
  ok(!!(await erroRpc(diarista1.sb, "aprovar_candidatura", { p_candidatura_id: cand.id })), "não se autoaprova");
  const { error: upd } = await diarista1.sb.from("pedidos").update({ diarista_id: diarista1.id }).eq("id", pedido.id);
  const { data: depois } = await admSb.from("pedidos").select("diarista_id").eq("id", pedido.id).single();
  ok(!!upd || depois.diarista_id === null, "não se coloca no pedido mexendo direto na tabela");
  const pCli = await pagina("/cliente", diarista1);
  ok(pCli.status === 307 && pCli.destino === "/diarista", "/cliente manda a diarista de volta", `${pCli.status} ${pCli.destino}`);

  // ---- 5. Server Actions chamadas direto ---------------------------------------
  secao("5. Server Actions chamadas direto, sem passar pela tela");
  if (!idDaAcao("criarPedido")) {
    console.log("  (pulado: abra antes as páginas dos painéis no navegador para o Next registrar as ações)");
  } else {
    const antes = (await admSb.from("pedidos").select("id")).data.length;
    await chamarAcao("criarPedido", [null, null], diarista1);
    await chamarAcao("criarPedido", [null, null], anonimo);
    ok((await admSb.from("pedidos").select("id")).data.length === antes, "diarista e visitante não criam pedido pela ação");
    await chamarAcao("mudarStatus", [pedido.id, "cancelada"], clienteA);
    await chamarAcao("mudarStatus", [pedido.id, "cancelada"], diarista1);
    await chamarAcao("aprovarCandidatura", [cand.id], diarista1);
    ok((await statusDoPedido()) === "candidatura_recebida", "cliente e diarista não aprovam nem cancelam pela ação");
    await chamarAcao("candidatar", [pedido.id], clienteB);
    ok((await contar(admSb, "candidaturas", doPedido)) === 1, "cliente não se candidata pela ação");
    const csrf = await chamarAcao("mudarStatus", [pedido.id, "cancelada"], admin, "https://site-malicioso.example");
    ok((await statusDoPedido()) === "candidatura_recebida", "ação vinda de outro site é recusada, mesmo com a sessão da admin", `HTTP ${csrf}`);
  }

  // ---- 6. Admin ----------------------------------------------------------------------
  secao("6. Admin (deve conseguir)");
  ok((await contar(admin.sb, "pedido_enderecos", doPedido)) === 1, "vê o endereço");
  ok((await contar(admin.sb, "diaristas_privado", (q) => q.eq("diarista_id", diarista1.id))) === 1, "vê CPF/Pix das candidatas");
  ok(!(await erroRpc(admin.sb, "aprovar_candidatura", { p_candidatura_id: cand.id })), "aprova a candidatura");
  ok((await contar(diarista1.sb, "pedido_enderecos", doPedido)) === 1, "depois da aprovação a diarista vê o endereço");
  ok((await contar(diarista2.sb, "pedido_enderecos", doPedido)) === 0, "a outra diarista continua sem ver");
  // Controle: prova que as chamadas diretas da seção 5 chegam mesmo ao servidor
  // (se a admin, do próprio site, também não conseguisse, aqueles testes não valeriam nada)
  if (idDaAcao("mudarStatus")) {
    await chamarAcao("mudarStatus", [pedido.id, "confirmada"], admin);
    ok((await statusDoPedido()) === "confirmada", "a admin muda o status chamando a mesma ação direto (controle da seção 5)");
  }

  // ---- 7. Segredos -------------------------------------------------------------------
  secao("7. Chave secreta e arquivos");
  const pastaEstatica = join(raiz, ".next");
  let vazou = [];
  const varrer = (pasta) => {
    for (const nome of readdirSync(pasta)) {
      const caminho = join(pasta, nome);
      if (statSync(caminho).isDirectory()) varrer(caminho);
      else if (/\.(js|css|html|json)$/.test(nome) && readFileSync(caminho, "utf8").includes(SERVICO)) vazou.push(caminho);
    }
  };
  for (const sub of ["static", "dev/static"]) if (existsSync(join(pastaEstatica, sub))) varrer(join(pastaEstatica, sub));
  ok(vazou.length === 0, "a chave service_role não aparece nos arquivos enviados ao navegador", vazou.slice(0, 3).join(", "));
  const htmls = await Promise.all(["/", "/entrar", "/cadastro"].map((c) => fetch(SITE + c).then((r) => r.text())));
  ok(htmls.every((h) => !h.includes(SERVICO)), "a chave service_role não aparece no HTML das páginas");
  ok(!/^NEXT_PUBLIC_[A-Z_]*=.*/m.test(env.split("\n").filter((l) => l.includes(SERVICO)).join("\n")), "a chave service_role não está numa variável NEXT_PUBLIC_");
  const cabecalhos = (await fetch(`${SITE}/admin`, { redirect: "manual" })).headers;
  ok(cabecalhos.get("x-frame-options") === "DENY", "nenhum site pode abrir o nosso dentro de uma moldura (clickjacking)");
  ok(cabecalhos.get("x-content-type-options") === "nosniff", "cabeçalho nosniff presente");
  let ignorado = false;
  try {
    execSync("git check-ignore -q .env.local", { cwd: raiz });
    ignorado = true;
  } catch {}
  ok(ignorado, "o .env.local é ignorado pelo git");
} catch (e) {
  falhas++;
  console.error(`\nErro inesperado: ${e.message}`);
} finally {
  // ---- Limpeza -----------------------------------------------------------------------
  for (const id of pedidosCriados) await admSb.from("pedidos").delete().eq("id", id);
  for (const id of criados) await admSb.auth.admin.deleteUser(id);
  console.log(`\nLimpeza: ${criados.length} contas e ${pedidosCriados.length} pedido de teste apagados.`);
}

console.log(falhas ? `\n${falhas} teste(s) FALHARAM.` : "\nTodos os testes de segurança passaram.");
process.exit(falhas ? 1 : 0);
