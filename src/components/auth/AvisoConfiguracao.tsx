import { supabaseConfigurado } from "@/lib/supabase/env";
import { Aviso } from "./Aviso";

// Mostrado em Entrar/Cadastro enquanto o .env.local não tiver as chaves do Supabase.
export function AvisoConfiguracao() {
  if (supabaseConfigurado()) return null;
  return (
    <div className="mb-5">
      <Aviso tipo="erro">
        Login ainda não configurado: preencha as chaves do Supabase no arquivo .env.local (veja o .env.example) e
        reinicie o servidor.
      </Aviso>
    </div>
  );
}
