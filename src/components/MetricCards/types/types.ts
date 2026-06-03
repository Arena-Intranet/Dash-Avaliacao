


export interface MetricCardsProps {
  analisesMetricas: {
    csatScore: number;
    percentualSLA: number;
    tmaDecimal: number | null;
    estouroSLA: number;
    kpis: {
      totalPendentes: number;
      totalRespondidos: number;
      totalTentativasEnvio: number;
    };
  };
  formatarHorasMinutos: (horas: number | null) => string;
  getSlaColor: (score: number) => string;
}