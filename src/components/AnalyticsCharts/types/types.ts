

export interface AnalyticsChartsProps {
    primaryColor: string;
    analisesMetricas: {
        dadosTimeline: Array<{ data: string; total: number }>;
        dadosMixPizza: Array<{ id: number; label: string; value: number; color: string }>;
        
        dadosTitulo: Array<{ 
            titulo: string; 
            ruim: number; 
            regular: number; 
            bom: number; 
            excelente: number; 
        }>;
        
        dadosUrgencia: Array<{ urgencia: string; quantidade: number }>;
    };
}

export const CORES_SISTEMA = {
    muitoUrgente: "#cf1616",
    urgente: "#ff9428",
    mediaUrgencia: "#c95904",
    poucoUrgente: "#15803d"
};
