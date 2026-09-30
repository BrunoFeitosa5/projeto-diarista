import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

// Cliente do Supabase para Server Components, Server Actions e Route Handlers.
// Age como o usuário logado (lê a sessão dos cookies), então o RLS vale normalmente.
export async function criarClienteServidor() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado dentro de um Server Component, que não pode gravar cookies.
          // Sem problema: o proxy.ts já renova a sessão a cada requisição.
        }
      },
    },
  });
}
