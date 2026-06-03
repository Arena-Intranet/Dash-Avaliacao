import React, { useState } from "react";
import { Box, Paper, Typography, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Chip, Tooltip, TablePagination } from "@mui/material";
import { Search, CheckCircle, Error, HourglassEmpty, TaskAlt } from "@mui/icons-material";
import { motion } from "framer-motion";
import { itemVariants, type PesquisaRegistro, MAPEAMENTO_REGRAS_TI } from "../../types/types";
import { TicketDetailsModal, obterHorasLimiteDaRegra } from "../DetailsModal/DetailsModal";
import type { TicketsTableProps } from "./types/types";
import { CORES_SISTEMA } from "../AnalyticsCharts/types/types";


export const TicketsTable: React.FC<TicketsTableProps> = ({ primaryColor, filtro, setFiltro, setPage, loading, registros, registrosFiltrados, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, infoAvaliacoes, formatarData, formatarHorasMinutos, calcularDiferencaHoras }) => {

    const [modalAberto, setModalAberto] = useState<boolean>(false);
    const [chamadoSelecionado, setChamadoSelecionado] = useState<PesquisaRegistro | null>(null);
    const abrirDetalhesChamado = (chamado: PesquisaRegistro) => { setChamadoSelecionado(chamado); setModalAberto(true); };

    const obterCorPorPontuacao = (nota: number | string | null | undefined): string => {
        if (!nota) return "#64748B";
        const num = Number(nota);
        if (num >= 8) return "#16A34A";
        if (num >= 5) return "#D97706";
        return "#E11D48";
    };

    const tratarCorUrgenciaTabela = (urgencia: string | null | undefined): string => {
        if (!urgencia) return "#64748B";
        const texto = urgencia.toLowerCase().trim();

        if (texto.includes("muito")) return CORES_SISTEMA.muitoUrgente;
        if (texto.includes("média") || texto.includes("media")) return CORES_SISTEMA.mediaUrgencia;
        if (texto.includes("pouco")) return CORES_SISTEMA.poucoUrgente;
        if (texto === "urgente") return CORES_SISTEMA.urgente;

        return "#64748B";
    };

    return (
        <Box>
            <Paper component={motion.div} variants={itemVariants} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: primaryColor }}>Monitoramento de Chamados</Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>Clique em qualquer linha para abrir a ficha de detalhes do chamado.</Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Buscar por usuário, chamado ou assunto..."
                        value={filtro}
                        onChange={(e) => { setFiltro(e.target.value); setPage(0); }}
                        slotProps={{ input: { startAdornment: <Search sx={{ color: "#94A3B8", mr: 1, fontSize: 18 }} /> } }}
                        sx={{ bgcolor: "#FFF", width: { xs: "100%", sm: 320 }, "& .MuiOutlinedInput-root": { borderRadius: 2, "& fieldset": { borderColor: "#E2E8F0" } } }}
                    />
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 1200 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f8f8f8", "& th": { borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 700, fontSize: "0.8rem" }, }}>
                                <TableCell align="center" width="40">Avaliação</TableCell>
                                <TableCell width="80">ID Chamado</TableCell>
                                <TableCell width="80">Status</TableCell>
                                <TableCell width="150">Usuário</TableCell>
                                <TableCell width="50" align="center">Envios</TableCell>
                                <TableCell width="80">Urgência</TableCell>
                                <TableCell width="160">Abertura</TableCell>
                                <TableCell width="160">Fechamento</TableCell>
                                <TableCell width="110">Tempo Resposta</TableCell>
                                <TableCell width="90" align="center">SLA Meta</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && registros.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} sx={{ py: 6, textAlign: "center" }}><CircularProgress size={28} sx={{ color: primaryColor }} /></TableCell>
                                </TableRow>
                            ) : registrosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                const textoFormatado = String(row.avaliacao_texto).toLowerCase();
                                const configAvaliacao = infoAvaliacoes[textoFormatado];
                                const isRespondido = !!row.avaliacao_texto;
                                const horasGastas = calcularDiferencaHoras(row.data_abertura, row.data_termino);
                                const tituloChamado = row.titulo_ps || "";
                                const regraEncontrada = MAPEAMENTO_REGRAS_TI[tituloChamado];
                                const limiteHorasSLA = regraEncontrada ? obterHorasLimiteDaRegra(regraEncontrada.tempo) : 24;
                                const dentroDoPrazo = horasGastas !== null ? horasGastas <= limiteHorasSLA : null;

                                const corUrgenciaFinal = tratarCorUrgenciaTabela(row.urgencia_ps);

                                return (
                                    <TableRow key={row.id} hover onClick={() => abrirDetalhesChamado(row)} sx={{ cursor: "pointer", "& td": { borderBottom: "1px solid #F1F5F9", py: 1.8 } }}>
                                        <TableCell align="center" sx={{ fontSize: "1.3rem" }}>
                                            {isRespondido && configAvaliacao ? configAvaliacao.icon : "❓"}
                                        </TableCell>

                                        <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>{row.numero_chamado}</TableCell>

                                        <TableCell>
                                            {isRespondido ? (
                                                <Chip
                                                    icon={<TaskAlt style={{ color: "#16A34A", fontSize: 14 }} />}
                                                    label="Respondido"
                                                    size="small"
                                                    sx={{ bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700, borderRadius: 1.5, fontSize: "0.72rem" }}
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<HourglassEmpty style={{ color: "#eb2525", fontSize: 14 }} />}
                                                    label="Pendente"
                                                    size="small"
                                                    sx={{ bgcolor: "#fedbdb", color: "#eb2525", fontWeight: 700, borderRadius: 1.5, fontSize: "0.72rem" }}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.nome_usuario}</TableCell>

                                        <TableCell align="center" sx={{ fontWeight: 700, color: row.tentativas_envio > 1 ? "#D97706" : "#475569" }}>
                                            {row.tentativas_envio || 0}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={row.urgencia_ps || "Não Definida"}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${corUrgenciaFinal}15`,
                                                    color: corUrgenciaFinal,
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    fontSize: "0.72rem"
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{formatarData(row.data_abertura)}</TableCell>

                                        <TableCell sx={{ color: "#64748B", fontSize: "0.82rem" }}>{formatarData(row.data_termino)}</TableCell>

                                        <TableCell sx={{ fontWeight: 600, color: "#334155", fontSize: "0.82rem" }}>
                                            {formatarHorasMinutos(horasGastas)}
                                        </TableCell>

                                        <TableCell align="center">
                                            {dentroDoPrazo === null ? (
                                                <Typography sx={{ color: "#CBD5E1", fontSize: "0.82rem", textAlign: "center" }}>-</Typography>
                                            ) : dentroDoPrazo ? (
                                                <Tooltip title={`Dentro da meta estipulada de até ${regraEncontrada?.tempo || '24h'}`}>
                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                                        <CheckCircle sx={{ color: "#16A34A", fontSize: 22 }} />
                                                    </Box>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title={`Estouro do SLA planejado de ${regraEncontrada?.tempo || '24h'}`}>
                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                                        <Error sx={{ color: "#EF4444", fontSize: 22 }} />
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={registrosFiltrados.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Linhas por página:"
                />
            </Paper>

            <TicketDetailsModal
                open={modalAberto}
                onClose={() => setModalAberto(false)}
                chamadoSelecionado={chamadoSelecionado}
                primaryColor={primaryColor}
                formatarData={formatarData}
                formatarHorasMinutos={formatarHorasMinutos}
                calcularDiferencaHoras={calcularDiferencaHoras}
                obterCorPorPontuacao={obterCorPorPontuacao}
            />
        </Box>
    );
};