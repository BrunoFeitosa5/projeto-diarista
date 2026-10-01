import { STATUS, type StatusPedido } from "@/lib/status";

export function EtiquetaStatus({ status }: { status: StatusPedido }) {
  const { nome, classe } = STATUS[status];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-pequeno font-medium whitespace-nowrap ${classe}`}>
      {nome}
    </span>
  );
}
