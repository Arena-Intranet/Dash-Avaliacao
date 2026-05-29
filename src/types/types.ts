// types.ts
export interface PesquisaRegistro {
  id: number;
  numero_chamado: string;
  nome_usuario: string;
  data_abertura: string;
  data_termino: string;
  mensagem_chamado: string;
  avaliacao_texto: string;
  pontuacao: number;
  status: string;
  tentativas_envio: number;
  opiniao_usuario: string;
  criado_em: string;
}

export interface ContagemAvaliacoes {
  [key: string]: number;
  ruim: number;
  regular: number;
  bom: number;
  excelente: number;
}

export interface KPIsAnalises {
  totalRespondidos: number;
  somaPontos: number;
  promotores: number;
  somaTempoAtendimento: number;
  chamadosComTempo: number;
  totalPendentes: number;
  totalTentativasEnvio: number;
}