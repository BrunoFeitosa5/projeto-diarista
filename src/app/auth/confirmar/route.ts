import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

// Link do e-mail de confirmação do Supabase. Aceita os dois formatos:
// - ?token_hash=...&type=signup  (modelo de e-mail recomendado para SSR)
// - ?code=...                    (fluxo PKCE padrão)
// Depois de confirmar, manda para /entrar: como já há sessão, o proxy leva ao painel certo.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");

  const supabase = await criarClienteServidor();
  let erro = true;

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    erro = Boolean(error);
  } else if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    erro = Boolean(error);
  }

  const destino = erro ? "/entrar?erro=link" : "/entrar";
  return NextResponse.redirect(new URL(destino, request.url));
}
