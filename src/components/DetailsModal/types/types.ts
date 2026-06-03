import type { PesquisaRegistro } from "../../../types/types";

export interface TicketDetailsModalProps {
    open: boolean;
    onClose: () => void;
    chamadoSelecionado: PesquisaRegistro | null;
    primaryColor: string;
    META_SLA_HORAS?: number;
    formatarData: (data?: string) => string;
    formatarHorasMinutos: (horas: number | null) => string;
    calcularDiferencaHoras: (inicio?: string, fim?: string) => number | null;
    obterCorPorPontuacao: (pontuacao: number | string | null | undefined) => string;
}