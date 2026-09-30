import { NextResponse, type NextRequest } from "next/server";
import { PAINEL_DO_PAPEL, type Papel } from "@/lib/papeis";
import { supabaseConfigurado } from "@/lib/supabase/env";
import { lerSessao } from "@/lib/supabase/proxy";

// 1ª camada de segurança: manda cada pessoa para a área certa.
// - Sem login numa área restrita → /entrar (e volta depois do login)
// - Logada na área de outro papel → vai para o próprio painel
// - Logada abrindo /entrar ou /cadastro → vai para o próprio painel
// ATENÇÃO: isto não substitui as checagens nas Server Actions nem o RLS.

const AREAS: Papel[] = ["cliente", "diarista", "admin"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const area = AREAS.find((a) => pathname === `/${a}` || pathname.startsWith(`/${a}/`));
  const paginaDeAcesso = pathname === "/entrar" || pathname === "/cadastro";

  // Sem .env.local: Entrar/Cadastro abrem com um aviso; áreas restritas mandam para lá
  if (!supabaseConfigurado()) {
    return area ? NextResponse.redirect(new URL("/entrar", request.url)) : NextResponse.next();
  }

  const { usuarioId, papel, resposta, redirecionar } = await lerSessao(request);

  if (area) {
    if (!usuarioId || !papel) {
      return redirecionar(`/entrar?proximo=${encodeURIComponent(pathname + search)}`);
    }
    if (papel !== area) {
      return redirecionar(PAINEL_DO_PAPEL[papel]);
    }
  }

  if (paginaDeAcesso && usuarioId && papel) {
    return redirecionar(PAINEL_DO_PAPEL[papel]);
  }

  return resposta();
}

export const config = {
  matcher: ["/cliente/:path*", "/diarista/:path*", "/admin/:path*", "/entrar", "/cadastro"],
};
