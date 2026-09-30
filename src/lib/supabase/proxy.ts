import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Papel } from "@/lib/papeis";
import { supabaseEnv } from "./env";

// Usado pelo src/proxy.ts: renova a sessão (cookies) e descobre quem é o usuário
// e qual o papel dele (cliente, diarista ou admin).
export async function lerSessao(request: NextRequest) {
  const { url, anonKey } = supabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista, cabecalhos) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cabecalhos).forEach(([nome, valor]) => response.headers.set(nome, valor));
      },
    },
  });

  // getClaims confere a assinatura do token; não confie em getSession() no servidor.
  const { data } = await supabase.auth.getClaims();
  const usuarioId = data?.claims?.sub ?? null;

  let papel: Papel | null = null;
  if (usuarioId) {
    const { data: perfil } = await supabase.from("profiles").select("papel").eq("id", usuarioId).single();
    papel = (perfil?.papel as Papel | undefined) ?? null;
  }

  // Redireciona levando junto os cookies renovados (senão o usuário "desloga")
  function redirecionar(destino: string) {
    const r = NextResponse.redirect(new URL(destino, request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }

  return { usuarioId, papel, resposta: () => response, redirecionar };
}
