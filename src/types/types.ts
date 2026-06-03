// types.ts

import type { Variants } from "framer-motion";

export interface PesquisaRegistro {
  id: number;
  numero_chamado: string;
  nome_usuario: string;
  data_abertura: string;
  data_termino: string;
  mensagem_chamado: string;
  urgencia_ps?: string; 
  titulo_ps?: string;  
  avaliacao_texto: string | null;
  pontuacao: number | null;
  status: string;
  tentativas_envio: number;
  tempo_resposta_ps?: number;
  opiniao_usuario: string;
  criado_em: string | null;
}




export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 110 } },
};

type UrgenciaAtendimento = "Muito Urgente" | "Urgente" | "Média Urgência" | "Pouco Urgente";

export const MAPEAMENTO_REGRAS_TI: Record<string, { urgencia: UrgenciaAtendimento; tempo: string }> = {
  "Em relação ao Sysemp": { urgencia: "Muito Urgente", tempo: "1h 30min" },
  "Em relação ao Chatguru": { urgencia: "Muito Urgente", tempo: "48 min" },
  "Em relação ao 3CX": { urgencia: "Muito Urgente", tempo: "1h 30min" },
  "Em relação a Telefonia": { urgencia: "Muito Urgente", tempo: "1h 30min" },
  "Em relação a Impressora": { urgencia: "Pouco Urgente", tempo: "2h 24min" },
  "Em relação a E-mail corporativo": { urgencia: "Média Urgência", tempo: "3 horas" },
  "Em relação a Dashboard (B.I)": { urgencia: "Média Urgência", tempo: "96 horas" },
  "Solicitação de equipamento": { urgencia: "Média Urgência", tempo: "50h 24min" },
  "Problema com equipamento": { urgencia: "Urgente", tempo: "18 horas" },
  "Outros (questões gerais)": { urgencia: "Pouco Urgente", tempo: "Até 72 horas" },
  "Sugestões": { urgencia: "Pouco Urgente", tempo: "Até 72 horas" },
};
