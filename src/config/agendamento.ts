// Regras do formulário de novo pedido. Mudar aqui vale para o site inteiro.
// - HORARIOS: horários de início que o cliente pode escolher.
// - ANTECEDENCIA_DIAS: o pedido mais cedo possível é para daqui a N dias
//   (tempo para a dona encontrar uma diarista).
// - LIMITE_DIAS: até quantos dias para a frente dá para agendar.

export const HORARIOS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"] as const;

export const ANTECEDENCIA_DIAS = 1;
export const LIMITE_DIAS = 90;

const FUSO = "America/Sao_Paulo";

// Data de hoje + N dias no fuso de São Paulo, no formato AAAA-MM-DD (o do <input type="date">)
export function dataDaquiA(dias: number): string {
  const d = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(d);
}

// "2026-10-05" → "seg., 05/10/2026"
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia, 12));
  const semana = d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" });
  return `${semana}, ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
}

// "09:00:00" → "09:00"
export const formatarHorario = (horario: string) => horario.slice(0, 5);
