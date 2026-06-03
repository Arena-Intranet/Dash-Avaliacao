
import type { PesquisaRegistro } from "../../../types/types";

export interface TicketsTableProps {
    primaryColor: string;
    filtro: string;
    setFiltro: (val: string) => void;
    setPage: (page: number) => void;
    loading: boolean;
    registros: PesquisaRegistro[];
    registrosFiltrados: PesquisaRegistro[];
    page: number;
    rowsPerPage: number;
    handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    infoAvaliacoes: Record<string, { icon: string }>;
    obterCorUrgencia: (urgenciaTexto?: string) => string;
    formatarData: (data?: string) => string;
    formatarHorasMinutos: (horas: number | null) => string;
    calcularDiferencaHoras: (inicio?: string, fim?: string) => number | null;
    META_SLA_HORAS?: number;
}