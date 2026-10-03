// Testa as migrações do Supabase num Postgres local (PGlite, sem instalar nada).
// Uso: npm run test:db
//
// Simula cliente, duas diaristas e a admin, e confere o fluxo completo e as
// regras de segurança (RLS). Sai com código 1 se algum teste falhar.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const raiz = join(import.meta.dirname, "..");
const db = new PGlite();

let falhas = 0;
function ok(condicao, descricao, detalhe = "") {
  if (condicao) console.log(`  ✓ ${descricao}`);
  else {
    falhas++;
    console.log(`  ✗ ${descricao}${detalhe ? `  → ${detalhe}` : ""}`);
  }
}
function secao(titulo) {
  console.log(`\n${titulo}`);
}

// ---- Troca de "quem está usando o banco" ---------------------------------
async function comoSuperusuario() {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
}
async function comoUsuario(id) {
  await db.exec(`reset role; set role authenticated;`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [id]);
}
async function comoAnonimo() {
  await db.exec(`reset role; set role anon; select set_config('request.jwt.claim.sub', '', false);`);
}
async function comoServidor() {
  await db.exec(`reset role; set role service_role; select set_config('request.jwt.claim.sub', '', false);`);
}

async function linhas(sql, params = []) {
  return (await db.query(sql, params)).rows;
}
async function erroDe(sql, params = []) {
  try {
    await db.query(sql, params);
    return null;
  } catch (e) {
    return e.message;
  }
}

// ---- Montagem do banco -----------------------------------------------------
await db.exec(readFileSync(join(raiz, "supabase/tests/supabase-mock.sql"), "utf8"));
const pasta = join(raiz, "supabase/migrations");
for (const arquivo of readdirSync(pasta).filter((f) => f.endsWith(".sql")).sort()) {
  await db.exec(readFileSync(join(pasta, arquivo), "utf8"));
  console.log(`Migração aplicada: ${arquivo}`);
}

async function cadastrar(email, meta) {
  await comoSuperusuario();
  const [u] = await linhas(
    `insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`,
    [email, JSON.stringify(meta)],
  );
  return u.id;
}

// ---- Cenários --------------------------------------------------------------
secao("1. Cadastro e papéis");
const cliente = await cadastrar("cliente@teste.com", { nome: "Carla", papel: "cliente" });
const d1 = await cadastrar("d1@teste.com", { nome: "Maria", papel: "diarista" });
const d2 = await cadastrar("d2@teste.com", { nome: "Joana", papel: "diarista" });
const dona = await cadastrar("dona@teste.com", { nome: "Dona", papel: "admin" });
await comoSuperusuario();
let [perfil] = await linhas(`select papel from profiles where id = $1`, [dona]);
ok(perfil.papel === "cliente", "cadastro pedindo papel 'admin' vira 'cliente'");
[perfil] = await linhas(`select papel, nome from profiles where id = $1`, [d1]);
ok(perfil.papel === "diarista" && perfil.nome === "Maria", "perfil de diarista criado com nome");

await comoUsuario(cliente);
let erro = await erroDe(`update profiles set papel = 'admin' where id = $1`, [cliente]);
ok(erro?.includes("papel"), "cliente NÃO consegue virar admin pelo app", erro ?? "atualizou!");
erro = await erroDe(`update profiles set nome = 'Carla Silva' where id = $1`, [cliente]);
ok(erro === null, "cliente edita o próprio nome", erro);

await comoSuperusuario();
await db.query(
  `update profiles set papel = 'admin' where id = (select id from auth.users where email = 'dona@teste.com')`,
);
[perfil] = await linhas(`select papel from profiles where id = $1`, [dona]);
ok(perfil.papel === "admin", "tornar-admin.sql pelo SQL Editor funciona");

secao("2. Criação do pedido (só pelo servidor)");
const argsPedido = (data) => [
  cliente, "4h", 160, 100, data, "08:00", "Moema", "São Paulo", "Tenho um gato",
  "04077-000", "Rua Secreta", "123", "Apto 45", "Portão azul",
];
const sqlCriar = `select * from criar_pedido($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`;
const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

await comoUsuario(cliente);
erro = await erroDe(sqlCriar, argsPedido(amanha));
ok(erro?.includes("permission denied"), "cliente NÃO chama criar_pedido direto (preço viria do navegador)", erro ?? "criou!");
erro = await erroDe(
  `insert into pedidos (cliente_id, plano, valor_cliente, valor_diarista, data, horario, bairro, cidade)
   values ($1, '4h', 1, 0, $2, '08:00', 'x', 'y')`,
  [cliente, amanha],
);
ok(erro !== null, "cliente NÃO insere pedido direto na tabela", erro ?? "inseriu!");

await comoServidor();
const [p1] = await linhas(sqlCriar, argsPedido(amanha));
const [p2] = await linhas(sqlCriar, argsPedido(amanha));
const [p3] = await linhas(sqlCriar, argsPedido(amanha));
ok(p1.codigo === "IMP-000001" && p2.codigo === "IMP-000002", `códigos sequenciais (${p1.codigo}, ${p2.codigo})`);
erro = await erroDe(sqlCriar, argsPedido("2020-01-01"));
ok(erro?.includes("passado"), "data no passado é recusada", erro);
const argsDiarista = argsPedido(amanha);
argsDiarista[0] = d1;
erro = await erroDe(sqlCriar, argsDiarista);
ok(erro?.includes("Somente clientes"), "diarista não cria pedido", erro);

secao("3. Vagas e candidatura");
await comoUsuario(d1);
let vagas = await linhas(`select codigo, bairro, valor_cliente, valor_diarista from pedidos`);
ok(vagas.length === 3, "diarista vê as vagas abertas (com bairro e valores)");
let enderecos = await linhas(`select * from pedido_enderecos`);
ok(enderecos.length === 0, "diarista NÃO vê endereço de vaga aberta");

erro = await erroDe(`select candidatar($1)`, [p1.id]);
ok(erro?.includes("CPF, chave Pix e experiência"), "candidatura exige CPF e Pix no perfil", erro);
await db.query(
  `insert into diaristas_privado (diarista_id, cpf, chave_pix, tipo_chave_pix) values ($1, '111.111.111-11', 'maria@pix.com', 'email')`,
  [d1],
);
erro = await erroDe(`select candidatar($1)`, [p1.id]);
ok(erro?.includes("experiência"), "candidatura exige também a experiência", erro);
erro = await erroDe(`update diaristas_privado set experiencia = 'curta' where diarista_id = $1`, [d1]);
ok(erro?.includes("check"), "experiência muito curta é recusada pelo banco", erro);
erro = await erroDe(`update diaristas_privado set referencia_nome = 'Ana Lima' where diarista_id = $1`, [d1]);
ok(erro?.includes("referencia_completa"), "referência sem telefone é recusada (nome e telefone andam juntos)", erro);
erro = await erroDe(
  `update diaristas_privado set referencia_nome = 'Ana Lima', referencia_telefone = '(11) 9999' where diarista_id = $1`,
  [d1],
);
ok(erro?.includes("check"), "telefone da referência fora do formato é recusado", erro);
// Referência é opcional: só a experiência já libera a candidatura
await db.query(
  `update diaristas_privado set experiencia = 'Trabalho com limpeza residencial há 5 anos.' where diarista_id = $1`,
  [d1],
);
const [c1] = await linhas(`select candidatar($1) as codigo`, [p1.id]);
ok(c1.codigo === "IMP-000001", "candidatar devolve o código para a mensagem do WhatsApp");
await linhas(`select candidatar($1)`, [p1.id]);
ok(true, "candidatar duas vezes na mesma vaga não dá erro nem duplica");
await linhas(`select candidatar($1)`, [p2.id]);

await comoUsuario(d2);
await db.query(
  `insert into diaristas_privado (diarista_id, cpf, chave_pix, tipo_chave_pix, experiencia, referencia_nome, referencia_telefone)
   values ($1, '222.222.222-22', 'joana@pix.com', 'email', 'Faxinas e passadoria em apartamentos desde 2019.', 'Carla Dias', '11988887777')`,
  [d2],
);
await linhas(`select candidatar($1)`, [p1.id]);
await linhas(`select candidatar($1)`, [p3.id]);
let pix = await linhas(`select * from diaristas_privado`);
ok(pix.length === 1 && pix[0].diarista_id === d2, "diarista só vê o próprio CPF/Pix");

await comoUsuario(cliente);
pix = await linhas(`select * from diaristas_privado`);
ok(pix.length === 0, "cliente NÃO vê CPF/Pix de ninguém");
erro = await erroDe(`select candidatar($1)`, [p1.id]);
ok(erro?.includes("Somente diaristas"), "cliente não se candidata", erro);

await comoSuperusuario();
let [ped] = await linhas(`select status from pedidos where id = $1`, [p1.id]);
ok(ped.status === "candidatura_recebida", "1ª candidatura muda status para candidatura_recebida");
let [{ n }] = await linhas(`select count(*)::int as n from candidaturas where pedido_id = $1`, [p1.id]);
ok(n === 2, "duas candidaturas registradas no IMP-000001");

secao("4. Aprovação pela admin");
const [candD1] = await linhas(`select id from candidaturas where pedido_id = $1 and diarista_id = $2`, [p1.id, d1]);
await comoUsuario(cliente);
erro = await erroDe(`select aprovar_candidatura($1)`, [candD1.id]);
ok(erro?.includes("Somente a admin"), "cliente NÃO aprova candidatura", erro);
await comoUsuario(d1);
erro = await erroDe(`select aprovar_candidatura($1)`, [candD1.id]);
ok(erro?.includes("Somente a admin"), "diarista NÃO se autoaprova", erro);

await comoUsuario(dona);
await linhas(`select aprovar_candidatura($1)`, [candD1.id]);
[ped] = await linhas(`select status, diarista_id from pedidos where id = $1`, [p1.id]);
ok(ped.status === "aprovada" && ped.diarista_id === d1, "pedido aprovado com a diarista Maria");
const cands = await linhas(`select diarista_id, status from candidaturas where pedido_id = $1 order by status`, [p1.id]);
ok(
  cands.find((c) => c.diarista_id === d1)?.status === "aprovada" &&
    cands.find((c) => c.diarista_id === d2)?.status === "recusada",
  "candidatura aprovada e a outra recusada",
);
const pixAdmin = await linhas(`select * from diaristas_privado`);
ok(pixAdmin.length === 2, "admin vê CPF/Pix das diaristas");

secao("5. Endereço só para a diarista aprovada");
await comoUsuario(d1);
enderecos = await linhas(`select rua, numero from pedido_enderecos where pedido_id = $1`, [p1.id]);
ok(enderecos.length === 1 && enderecos[0].rua === "Rua Secreta", "diarista aprovada VÊ o endereço");
await comoUsuario(d2);
enderecos = await linhas(`select * from pedido_enderecos`);
ok(enderecos.length === 0, "diarista recusada NÃO vê o endereço");
vagas = await linhas(`select codigo, status from pedidos where id = $1`, [p1.id]);
ok(vagas.length === 1, "diarista recusada ainda vê o pedido (para saber o resultado), sem endereço");
await comoUsuario(cliente);
enderecos = await linhas(`select * from pedido_enderecos`);
ok(enderecos.length === 3, "cliente vê os endereços dos próprios pedidos");
let perfis = await linhas(`select id, nome from profiles`);
ok(
  perfis.some((p) => p.id === d1) && !perfis.some((p) => p.id === d2),
  "cliente vê o perfil da diarista aprovada, e não o da recusada",
);
await comoUsuario(d1);
perfis = await linhas(`select id from profiles`);
ok(perfis.some((p) => p.id === cliente) && !perfis.some((p) => p.id === d2), "diarista aprovada vê o perfil do cliente");

secao("6. Status e histórico");
await comoUsuario(dona);
erro = await erroDe(`select mudar_status_pedido($1, 'paga')`, [p1.id]);
ok(erro?.includes("inválida"), "não pula etapas (aprovada → paga)", erro);
erro = await erroDe(`select mudar_status_pedido($1, 'aprovada')`, [p2.id]);
ok(erro?.includes("automaticamente"), "admin não força 'aprovada' sem candidatura", erro);
for (const s of ["confirmada", "paga", "concluida"]) await linhas(`select mudar_status_pedido($1, $2)`, [p1.id, s]);
[ped] = await linhas(`select status from pedidos where id = $1`, [p1.id]);
ok(ped.status === "concluida", "fluxo completo até concluída");
erro = await erroDe(`select mudar_status_pedido($1, 'cancelada')`, [p1.id]);
ok(erro?.includes("inválida"), "pedido concluído não pode ser cancelado", erro);
await comoUsuario(d1);
erro = await erroDe(`select mudar_status_pedido($1, 'cancelada')`, [p2.id]);
ok(erro?.includes("Somente a admin"), "diarista não muda status", erro);

await comoUsuario(cliente);
const hist = await linhas(`select status_novo from pedido_historico where pedido_id = $1 order by id`, [p1.id]);
ok(
  hist.map((h) => h.status_novo).join(",") ===
    "aberta,candidatura_recebida,aprovada,confirmada,paga,concluida",
  "histórico completo visível ao cliente",
  hist.map((h) => h.status_novo).join(","),
);
await comoUsuario(d1);
ok((await linhas(`select * from pedido_historico`)).length === 0, "diarista não vê o histórico");

secao("7. Cancelamento tira o acesso ao endereço");
await comoUsuario(dona);
const [candP3] = await linhas(`select id from candidaturas where pedido_id = $1`, [p3.id]);
await linhas(`select aprovar_candidatura($1)`, [candP3.id]);
await comoUsuario(d2);
ok((await linhas(`select * from pedido_enderecos where pedido_id = $1`, [p3.id])).length === 1, "Joana aprovada vê o endereço do IMP-000003");
await comoUsuario(dona);
await linhas(`select mudar_status_pedido($1, 'cancelada')`, [p3.id]);
await comoUsuario(d2);
ok((await linhas(`select * from pedido_enderecos where pedido_id = $1`, [p3.id])).length === 0, "após cancelar, Joana perde o acesso ao endereço");
await comoUsuario(d1);
ok((await linhas(`select * from pedidos where id = $1`, [p3.id])).length === 0, "Maria não vê pedido aprovado para outra diarista");

secao("8. Visitante sem login");
await comoAnonimo();
for (const t of ["profiles", "pedidos", "pedido_enderecos", "diaristas_privado", "candidaturas", "pedido_historico"]) {
  const r = await erroDe(`select * from ${t}`);
  const vazio = r === null ? (await linhas(`select * from ${t}`)).length === 0 : true;
  ok(vazio, `visitante não lê ${t}`);
}
erro = await erroDe(`select candidatar($1)`, [p2.id]);
ok(erro !== null, "visitante não chama funções", erro);

console.log(falhas === 0 ? "\nTodos os testes passaram." : `\n${falhas} teste(s) falharam.`);
process.exit(falhas === 0 ? 0 : 1);
