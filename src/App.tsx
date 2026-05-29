import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableRow, Paper, TablePagination, TextField, CircularProgress, Tooltip, LinearProgress, TableHead, Chip, Avatar } from "@mui/material";
import { TrendingUp, QueryBuilder, Search, Send, } from "@mui/icons-material";
import { motion, type Variants } from "framer-motion";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import type { PesquisaRegistro, KPIsAnalises } from "./types/types";
import Logo from "../public/logo1.png";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110 }
  }
};

// Formatação rápida de datas para o padrão da imagem
const formatarData = (dataString?: string) => {
  if (!dataString || dataString.startsWith("0000")) return "---";
  const data = new Date(dataString);
  return data.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
};

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [registros, setRegistros] = useState<PesquisaRegistro[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const primaryColor = "#142B4D";

  const infoAvaliacoes: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    ruim: { label: "Ruim", icon: "😞", color: "#E11D48", bg: "#FFF1F2" },
    regular: { label: "Regular", icon: "😐", color: "#D97706", bg: "#FEF3C7" },
    bom: { label: "Bom", icon: "😊", color: "#2563EB", bg: "#EFF6FF" },
    excelente: { label: "Excelente", icon: "🤩", color: "#16A34A", bg: "#F0FDF4" },
  };

  const fetchPesquisas = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://arenavidros.com.br/api/pesquisas");
      const dados: PesquisaRegistro[] = await response.json();

      const dadosOrdenados = [...dados].reverse();
      setRegistros(dadosOrdenados);

      const agora = new Date();
      setUltimaAtualizacao(agora.toLocaleTimeString("pt-BR"));
    } catch (error) {
      console.error("Erro ao buscar pesquisas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesquisas();
    const intervalo = setInterval(fetchPesquisas, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const analisesMetricas = useMemo(() => {
    const contagem = { ruim: 0, regular: 0, bom: 0, excelente: 0 };
    const historicoDatas: Record<string, { data: string; total: number }> = {};

    const kpisIniciais: KPIsAnalises = {
      totalRespondidos: 0,
      somaPontos: 0,
      promotores: 0,
      somaTempoAtendimento: 0,
      chamadosComTempo: 0,
      totalPendentes: 0,
      totalTentativasEnvio: 0
    };

    const processamento = registros.reduce<KPIsAnalises>((acc, curr) => {
      acc.totalTentativasEnvio += Number(curr.tentativas_envio || 0);

      const tipoAvaliacao = curr.avaliacao_texto ? String(curr.avaliacao_texto).toLowerCase() : "";

      if (curr.pontuacao !== null && curr.pontuacao !== undefined && tipoAvaliacao && contagem[tipoAvaliacao as keyof typeof contagem] !== undefined) {
        acc.totalRespondidos++;
        acc.somaPontos += Number(curr.pontuacao);
        contagem[tipoAvaliacao as keyof typeof contagem]++;

        if (Number(curr.pontuacao) >= 3) {
          acc.promotores++;
        }

        if (curr.criado_em && !curr.criado_em.startsWith("0000")) {
          const dataFormatada = new Date(curr.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          if (!historicoDatas[dataFormatada]) {
            historicoDatas[dataFormatada] = { data: dataFormatada, total: 0 };
          }
          historicoDatas[dataFormatada].total++;
        }
      } else {
        acc.totalPendentes++;
      }

      if (curr.data_abertura && curr.data_termino && !curr.data_abertura.startsWith("0000")) {
        const inicio = new Date(curr.data_abertura).getTime();
        const fim = new Date(curr.data_termino).getTime();
        const diferencaHoras = (fim - inicio) / (1000 * 60 * 60);

        if (diferencaHoras > 0) {
          acc.somaTempoAtendimento += diferencaHoras;
          acc.chamadosComTempo++;
        }
      }

      return acc;
    }, kpisIniciais);

    const totalChamados = registros.length;
    const taxaResposta = totalChamados > 0 ? Math.round((processamento.totalRespondidos / totalChamados) * 100) : 0;
    const csatScore = processamento.totalRespondidos > 0 ? Math.round((processamento.promotores / processamento.totalRespondidos) * 100) : 0;
    const tmaMedio = processamento.chamadosComTempo > 0 ? (processamento.somaTempoAtendimento / processamento.chamadosComTempo).toFixed(1) : "0.0";

    const dadosTimeline = Object.values(historicoDatas).slice(-10);

    const dadosMixPizza = (Object.keys(infoAvaliacoes) as Array<keyof typeof infoAvaliacoes>).map((chave, index) => ({
      id: index,
      label: infoAvaliacoes[chave].label,
      value: contagem[chave as keyof typeof contagem],
      color: infoAvaliacoes[chave].color,
    }));

    return {
      kpis: processamento,
      contagem,
      totalChamados,
      taxaResposta,
      csatScore,
      tmaMedio,
      dadosTimeline,
      dadosMixPizza
    };
  }, [registros]);

  const getCsatColor = (score: number) => {
    if (score >= 80) return "#16A34A";
    if (score >= 60) return "#D97706";
    return "#E11D48";
  };

  const registrosFiltrados = registros.filter((item) => {
    const termo = filtro.toLowerCase();
    const statusFiltro = !item.avaliacao_texto ? "pendente" : "respondido";
    return (
      (item.nome_usuario && item.nome_usuario.toLowerCase().includes(termo)) ||
      (item.numero_chamado && item.numero_chamado.toLowerCase().includes(termo)) ||
      (item.opiniao_usuario && item.opiniao_usuario.toLowerCase().includes(termo)) ||
      (item.avaliacao_texto && item.avaliacao_texto.toLowerCase().includes(termo)) ||
      statusFiltro.includes(termo)
    );
  });

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ bgcolor: "#F4F7FA", minHeight: "100vh", pb: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#0D1F3A", px: 19, py: 2.3, boxShadow: "0px 4px 20px rgba(0,0,0,0.15)" }}>
        <Box><img src={Logo} alt="Arena Vidros Logo" style={{ height: "42px", objectFit: "contain" }} /></Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#9aa8bc", fontWeight: 600, textTransform: "uppercase", }}>Última Atualização</Typography>
          <Typography variant="body2" sx={{ fontSize: 18, color: "#0D1F3A", fontWeight: 700, bgcolor: "#FFF", px: 3, py: 1, borderRadius: 2, mt: 0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            {ultimaAtualizacao ? ultimaAtualizacao : "Sincronizando..."}
          </Typography>
        </Box>
      </Box>

      {/* CONTAINER PRINCIPAL */}
      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ px: { xs: 2, md: 0 }, pt: 4, maxWidth: "1600px", margin: "0 auto" }}>

        {/* ================= KPIs ESTRATÉGICOS ================= */}
        <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 1 }}>
          Indicadores Chave de Performance (KPIs)
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4 }}>
          {/* CSAT */}
          <Box component={motion.div} variants={itemVariants} sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", height: "100%", border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>Índice de Satisfação (CSAT)</Typography>
                  <Avatar sx={{ bgcolor: `${getCsatColor(analisesMetricas.csatScore)}15`, color: getCsatColor(analisesMetricas.csatScore), width: 36, height: 36 }}>
                    <TrendingUp fontSize="small" />
                  </Avatar>
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: getCsatColor(analisesMetricas.csatScore) }}>{analisesMetricas.csatScore}%</Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>meta: &gt;80%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={analisesMetricas.csatScore} sx={{ mt: 3, height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: getCsatColor(analisesMetricas.csatScore) } }} />
              </CardContent>
            </Card>
          </Box>

          {/* TMA */}
          <Box component={motion.div} variants={itemVariants} sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", height: "100%", border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>Tempo Médio (TMA)</Typography>
                  <Avatar sx={{ bgcolor: "#EFF6FF", color: "#3B82F6", width: 36, height: 36 }}><QueryBuilder fontSize="small" /></Avatar>
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#1E293B" }}>{analisesMetricas.tmaMedio}</Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 700 }}>horas</Typography>
                </Box>
                <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 3, fontWeight: 600 }}>Média de tempo até a resolução</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* ENGAJAMENTO */}
          <Box component={motion.div} variants={itemVariants} sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", height: "100%", border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>Disparos e Interações</Typography>
                  <Avatar sx={{ bgcolor: "#F5F3FF", color: "#8B5CF6", width: 36, height: 36 }}><Send fontSize="small" /></Avatar>
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#1E293B" }}>{analisesMetricas.kpis.totalTentativasEnvio}</Typography>
                  <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>envios totais</Typography>
                </Box>
                <Typography variant="caption" sx={{ display: "inline-block", color: "#8B5CF6", mt: 3, fontWeight: 700, bgcolor: "#F5F3FF", px: 1.5, py: 0.5, borderRadius: 2 }}>
                  Taxa de Engajamento: {analisesMetricas.taxaResposta}%
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* ================= GRÁFICOS MUI ================= */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, mb: 4 }}>
          {/* Gráfico de Linha (Timeline) com MUI X Charts */}
          <Box component={motion.div} variants={itemVariants} sx={{ flex: 2, minWidth: 0 }}>
            <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)" }} elevation={0}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 3 }}>Frequência de Feedbacks (Últimos dias)</Typography>
              <Box sx={{ width: "100%", height: 260 }}>
                <LineChart
                  xAxis={[{
                    scaleType: "point",
                    data: analisesMetricas.dadosTimeline.map(d => d.data),
                    tickLabelStyle: { fill: "#64748B", fontSize: 12, fontWeight: 500 }
                  }]}
                  series={[{
                    data: analisesMetricas.dadosTimeline.map(d => d.total),
                    color: primaryColor,
                    area: true,
                    showMark: true,
                    curve: "linear",
                  }]}
                  margin={{ left: 30, right: 30, top: 10, bottom: 20 }}
                  sx={{
                    "& .MuiChartsTooltip-root": {
                      borderRadius: 8
                    }
                  }}
                />
              </Box>
            </Paper>
          </Box>

          <Box component={motion.div} variants={itemVariants} sx={{ flex: 1.2, minWidth: 0 }}>
            <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", height: "100%" }} elevation={0}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 3 }}>Mix de Sentimentos</Typography>
              <Box sx={{ width: "100%", height: 250 }}>
                <PieChart
                  series={[{
                    data: analisesMetricas.dadosMixPizza,
                    innerRadius: 65,
                    paddingAngle: 4,
                    cornerRadius: 6,
                  }]}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'bottom', horizontal: 'center' },

                    }
                  }}
                  margin={{ top: 10, bottom: 60, left: 10, right: 10 }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* ================= TABELA DE REGISTROS (ESTILO IMAGEM) ================= */}
        <Paper component={motion.div} variants={itemVariants} elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: primaryColor }}>Gestão de Avaliações</Typography>
              <Typography variant="caption" sx={{ color: "#64748B", fontSize: 13 }}>Mostrando {registrosFiltrados.length} de {analisesMetricas.totalChamados} registros no total</Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Buscar chamado, usuário, status..."
              value={filtro}
              onChange={(e) => { setFiltro(e.target.value); setPage(0); }}
              slotProps={{ input: { startAdornment: <Search sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} /> } }}
              sx={{ bgcolor: "#F8FAFC", width: { xs: "100%", sm: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 3, "& fieldset": { borderColor: "#E2E8F0" } } }}
            />
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC", "& th": { borderBottom: "2px solid #F1F5F9", color: "#475569", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" } }}>
                  <TableCell align="center" width="80">Avaliação</TableCell>
                  <TableCell width="110">Chamado</TableCell>
                  <TableCell width="140">Usuário</TableCell>
                  <TableCell width="80" align="center">Envios</TableCell>
                  <TableCell width="110">Status</TableCell>
                  <TableCell width="160">Término</TableCell>
                  <TableCell width="200">Mensagem original</TableCell>
                  <TableCell width="80" align="center">Pontos</TableCell>
                  <TableCell width="220">Opinião / Feedback</TableCell>
                  <TableCell width="160">Data Envio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ py: 8, textAlign: "center" }}><CircularProgress size={32} sx={{ color: primaryColor }} /></TableCell>
                  </TableRow>
                ) : registrosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const textoFormatado = String(row.avaliacao_texto).toLowerCase();
                  const configAvaliacao = infoAvaliacoes[textoFormatado];
                  const isRespondido = !!row.avaliacao_texto;

                  return (
                    <TableRow key={row.id} hover sx={{ "& td": { borderBottom: "1px solid #F1F5F9", py: 2 }, transition: "background-color 0.2s" }}>

                      {/* 1. Emoji / Avaliação */}
                      <TableCell align="center" sx={{ fontSize: "1.5rem" }}>
                        {isRespondido && configAvaliacao ? configAvaliacao.icon : <span style={{ color: "#EF4444", fontWeight: 'bold' }}>❓</span>}
                      </TableCell>

                      {/* 2. Chamado */}
                      <TableCell sx={{ fontWeight: 800, color: "#0F172A" }}>{row.numero_chamado}</TableCell>

                      {/* 3. Usuário */}
                      <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.nome_usuario}</TableCell>

                      {/* 4. Envios */}
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748B" }}>
                          {row.tentativas_envio || 0}
                        </Typography>
                      </TableCell>

                      {/* 5. Status (Pendente / Respondido) -> Agora posicionado logo após Envios */}
                      <TableCell>
                        <Chip
                          label={isRespondido ? "Respondido" : "Pendente"}
                          size="small"
                          sx={{
                            bgcolor: isRespondido ? "#F0FDF4" : "#FFF1F2",
                            color: isRespondido ? "#16A34A" : "#EF4444",
                            fontWeight: 700, borderRadius: 2, fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>

                      {/* 6. Término */}
                      <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        {formatarData(row.data_termino)}
                      </TableCell>

                      {/* 7. Mensagem Original */}
                      <TableCell sx={{ color: "#64748B", fontSize: "0.85rem", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Tooltip title={row.mensagem_chamado || ""} placement="top" arrow>
                          <span>{row.mensagem_chamado || "---"}</span>
                        </Tooltip>
                      </TableCell>

                      {/* 8. Pontos */}
                      <TableCell align="center">
                        {row.pontuacao !== null && row.pontuacao !== undefined ? (
                          <Typography sx={{ fontWeight: 800, color: row.pontuacao >= 3 ? "#16A34A" : "#E11D48", fontSize: "1rem" }}>
                            {row.pontuacao}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: "#CBD5E1" }}>-</Typography>
                        )}
                      </TableCell>

                      {/* 9. Opinião / Feedback */}
                      <TableCell sx={{ color: "#334155", fontSize: "0.85rem", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Tooltip title={row.opiniao_usuario || ""} placement="top" arrow>
                          <span>{row.opiniao_usuario || "---"}</span>
                        </Tooltip>
                      </TableCell>

                      {/* 10. Data Envio */}
                      <TableCell sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        {isRespondido ? formatarData(row.criado_em) : "---"}
                      </TableCell>

                    </TableRow>
                  );
                })}

                {!loading && registrosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8, color: "#94A3B8", fontWeight: 500 }}>
                      Nenhum registro encontrado para essa busca.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={registrosFiltrados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{ borderTop: "1px solid #F1F5F9", mt: 1, ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontWeight: 500, color: "#64748B" } }}
          />
        </Paper>
      </Box>
    </Box>
  );
}