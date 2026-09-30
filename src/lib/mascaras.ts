// Máscaras de digitação para campos brasileiros. Recebem o texto digitado e devolvem formatado.

const digitos = (valor: string, max: number) => valor.replace(/\D/g, "").slice(0, max);

// 00.000.000/0001-00
export function mascaraCnpj(valor: string): string {
  const d = digitos(valor, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// (11) 91234-5678 ou (11) 1234-5678
export function mascaraTelefone(valor: string): string {
  const d = digitos(valor, 11);
  if (d.length <= 2) return d.replace(/^(\d{1,2})/, "($1");
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{0,4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

// 31/12/1990
export function mascaraData(valor: string): string {
  const d = digitos(valor, 8);
  return d.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}
