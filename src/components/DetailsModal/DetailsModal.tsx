import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Divider, Chip, Paper, Button } from "@mui/material";
import { Info } from "@mui/icons-material";
import type { TicketDetailsModalProps } from "./types/types";
import { MAPEAMENTO_REGRAS_TI } from "../../types/types";
import { CORES_SISTEMA } from "../AnalyticsCharts/types/types";

export const obterHorasLimiteDaRegra = (tempoStr: string): number => {
    const texto = tempoStr.toLowerCase();
    
    if (texto.includes("hora") && !texto.includes("min")) {
        const apenasNumeros = texto.replace(/[^0-9]/g, "");
        return apenasNumeros ? parseFloat(apenasNumeros) : 24; 
    }
    
    if (texto.includes("h") && texto.includes("min")) {
        const partes = texto.split("h");
        const horas = parseFloat(partes[0].replace(/[^0-9]/g, "")) || 0;
        const minutos = parseFloat(partes[1].replace(/[^0-9]/g, "")) || 0;
        return horas + (minutos / 60);
    }
    
    if (texto.includes("min") && !texto.includes("h")) {
        const minutos = parseFloat(texto.replace(/[^0-9]/g, "")) || 0;
        return minutos / 60;
    }

    return 24; 
};

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ open, onClose, chamadoSelecionado, primaryColor, formatarData, formatarHorasMinutos, calcularDiferencaHoras, obterCorPorPontuacao }) => {
    if (!chamadoSelecionado) return null;

    const horasGastas = calcularDiferencaHoras(chamadoSelecionado.data_abertura, chamadoSelecionado.data_termino);
    const tituloChamado = chamadoSelecionado.titulo_ps || "";
    const regraEncontrada = MAPEAMENTO_REGRAS_TI[tituloChamado];
    
    const tempoRespostaFormatado = regraEncontrada ? regraEncontrada.tempo : "Não definido";

    // Cálculo dinâmico do limite do SLA baseado na regra de negócio do título
    const limiteHorasSLA = regraEncontrada ? obterHorasLimiteDaRegra(regraEncontrada.tempo) : 24;
    const dentroDoPrazo = horasGastas !== null ? horasGastas <= limiteHorasSLA : null;

    const tratarCorUrgenciaModal = (urgencia: string | null | undefined): string => {
        if (!urgencia) return "#64748B";
        const texto = urgencia.toLowerCase().trim();
        
        if (texto.includes("muito")) return CORES_SISTEMA.muitoUrgente;
        if (texto.includes("média") || texto.includes("media")) return CORES_SISTEMA.mediaUrgencia;
        if (texto.includes("pouco")) return CORES_SISTEMA.poucoUrgente;
        if (texto === "urgente") return CORES_SISTEMA.urgente;
        
        return "#64748B";
    };

    const corUrgenciaFinal = tratarCorUrgenciaModal(chamadoSelecionado.urgencia_ps);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
            <DialogTitle sx={{ fontWeight: 800, color: primaryColor, display: "flex", alignItems: "center", gap: 1 }}>
                <Info sx={{ color: "#3B82F6" }} /> Ficha de Detalhes — {chamadoSelecionado.numero_chamado}
            </DialogTitle>
            <Divider sx={{ mx: 3 }} />

            <DialogContent sx={{ py: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5 }}>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Usuário Solicitante</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "#1E293B", mt: 0.5 }}>{chamadoSelecionado.nome_usuario || "Não Informado"}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Urgência Cadastrada</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip
                                    label={chamadoSelecionado.urgencia_ps || "Não Definida"}
                                    size="small"
                                    sx={{ 
                                        bgcolor: `${corUrgenciaFinal}15`,
                                        color: corUrgenciaFinal,
                                        fontWeight: 700, 
                                        borderRadius: 1.5 
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Título do Problema */}
                    <Box>
                        <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Título do Problema</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mt: 0.5 }}>{chamadoSelecionado.titulo_ps || "Sem título"}</Typography>
                    </Box>

                    {/* Mensagem / Descrição */}
                    <Box>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E2E8F0" }}>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase", display: "block", mb: 0.5 }}>Mensagem / Descrição do Chamado</Typography>
                            <Typography variant="body2" sx={{ color: "#334155", whiteSpace: "pre-line", lineHeight: 1.5, fontWeight: 500 }}>
                                {chamadoSelecionado.mensagem_chamado || "Nenhum histórico textual anexado ao chamado."}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Tempos, SLA e o Tempo Limite Baseado na Regra */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Data de Abertura</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mt: 0.5 }}>{formatarData(chamadoSelecionado.data_abertura)}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Data de Fechamento</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mt: 0.5 }}>{formatarData(chamadoSelecionado.data_termino)}</Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Tempo de Resposta Limite</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", mt: 0.5 }}>
                                {tempoRespostaFormatado}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Tempo Gasto & SLA</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: primaryColor, mt: 0.5 }} component="div">
                                {horasGastas !== null ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                        {formatarHorasMinutos(horasGastas)}
                                        {dentroDoPrazo ? (
                                            <Chip label="No Prazo" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                                        ) : (
                                            <Chip label="Atrasado" size="small" sx={{ bgcolor: "#FFF1F2", color: "#EF4444", fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                                        )}
                                    </Box>
                                ) : (
                                    "Em andamento / Sem dados"
                                )}
                            </Typography>
                        </Box>
                    </Box>

                    {chamadoSelecionado.avaliacao_texto && (
                        <Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: primaryColor, mb: 1.5, mt: 1 }}>Retorno da Pesquisa de Satisfação</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2.5 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Nota Concedida</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: obterCorPorPontuacao(chamadoSelecionado.pontuacao), mt: 0.5 }}>
                                        {chamadoSelecionado.pontuacao ? `${Number(chamadoSelecionado.pontuacao).toFixed(1)} / 10.0` : "---"}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Opinião / Feedback do Usuário</Typography>
                                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "#475569", mt: 0.5 }}>
                                        "{chamadoSelecionado.opiniao_usuario || "O usuário preferiu não deixar comentários adicionais."}"
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pr: 3 }}>
                <Button onClick={onClose} variant="contained" disableElevation sx={{ bgcolor: primaryColor, borderRadius: 2, textTransform: "none", px: 3 }}>
                    Fechar Detalhes
                </Button>
            </DialogActions>
        </Dialog>
    );
};