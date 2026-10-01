import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

// Cliente com a chave service_role: IGNORA o RLS. Usar só em Server Actions,
// depois de conferir a sessão com exigirPapel(). Hoje serve só para chamar
// criar_pedido (a função só aceita esta chave).
// "server-only" faz o build falhar se alguém importar isto num Client Component.
export function criarClienteServico() {
  const { url } = supabaseEnv();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY no .env.local (veja o .env.example) e reinicie o npm run dev.");
  }
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
