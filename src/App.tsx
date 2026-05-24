import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, CircularProgress, Tooltip, } from "@mui/material";
import type { ContagemAvaliacoes, PesquisaRegistro } from "./types/types";
import Logo from "../public/logo1.png";

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [registros, setRegistros] = useState<PesquisaRegistro[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const primaryColor = "#142B4D";

  const infoAvaliacoes: Record<string, { label: string; icon: string; color: string }> = {
    ruim: { label: "Ruim", icon: "😞", color: "#D12029" },
    regular: { label: "Regular", icon: "😐", color: "#F1C40F" },
    bom: { label: "Bom", icon: "😊", color: "#2980B9" },
    excelente: { label: "Excelente", icon: "🤩", color: "#2E7D32" },
  };

  const fetchPesquisas = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://avaliacoes.arenavidros.com.br/api/pesquisas");
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

    const intervalo = setInterval(() => {
      fetchPesquisas();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, []);

  const contagemCards = registros.reduce<ContagemAvaliacoes>(
    (acc, curr) => {
      const tipo = String(curr.avaliacao_texto).toLowerCase();
      if (acc[tipo] !== undefined) {
        acc[tipo]++;
      }
      return acc;
    },
    { ruim: 0, regular: 0, bom: 0, excelente: 0 }
  );

  const registrosFiltrados = registros.filter((item) => {
    const termo = filtro.toLowerCase();
    return (
      (item.nome_usuario && item.nome_usuario.toLowerCase().includes(termo)) ||
      (item.numero_chamado && item.numero_chamado.toLowerCase().includes(termo)) ||
      (item.opiniao_usuario && item.opiniao_usuario.toLowerCase().includes(termo)) ||
      (item.avaliacao_texto && item.avaliacao_texto.toLowerCase().includes(termo))
    );
  });

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr || dataStr.startsWith("0000")) return "---";
    return new Date(dataStr).toLocaleString("pt-BR");
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#0D1F3A",
          px: 4,
          py: 2,
          borderBottom: "1px solid #eef0f2",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <Box>
          <img
            src={Logo}
            alt="Arena Vidros Logo"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: .5 }}>
            <Typography variant="caption" sx={{ color: "#9aa8bc", fontWeight: 600, textTransform: "uppercase" }}>
              Última atualização
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 17, textTransform: "uppercase", color: "#333333", fontWeight: 600, bgcolor: "#fff", px: 3.5, py: .5, borderRadius: 2 }}>
              {ultimaAtualizacao ? `${ultimaAtualizacao}` : "Sincronizando..."}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 4 }}>

        {/* CARDS */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 3,
            mb: 4,
          }}
        >
          {Object.keys(infoAvaliacoes).map((chave) => {
            const config = infoAvaliacoes[chave];
            return (
              <Box
                key={chave}
                sx={{
                  flex: "1 1 calc(25% - 24px)",
                  minWidth: { xs: "100%", sm: "200px" },
                }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", borderLeft: `6px solid ${config.color}` }}>
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2, "&:last-child": { pb: 2 } }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "#777", fontWeight: 600 }}>
                        {config.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: "#333", mt: 0.5 }}>
                        {contagemCards[chave]}
                      </Typography>
                    </Box>
                    <Box sx={{ fontSize: "2.8rem" }}>{config.icon}</Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* TABELA */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.04)", border: "1px solid #eef0f2" }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: primaryColor }}>
              Registros Completos de Pesquisa
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "#666", fontWeight: 600 }}>Pesquisar</Typography>
              <TextField
                size="small"
                placeholder="Buscar em qualquer campo..."
                value={filtro}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFiltro(e.target.value); setPage(0); }}
                sx={{ bgcolor: "#fff", width: 250 }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 1100, tableLayout: "fixed" }}>
              <TableHead sx={{ bgcolor: "#fafafa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "90px" }}>Avaliação</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "100px" }}>Chamado</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "140px" }}>Usuário</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "130px" }}>Término</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "170px" }}>Mensagem original</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "70px" }}>Pontos</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "180px" }}>Opinião / Feedback</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#555", width: "140px" }}>Data Envio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && registros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 4, textAlign: "center" }}>
                      <CircularProgress size={30} sx={{ color: primaryColor }} />
                    </TableCell>
                  </TableRow>
                ) : registrosFiltrados
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const textoFormatado = String(row.avaliacao_texto).toLowerCase();
                    const emojiCorrespondente = infoAvaliacoes[textoFormatado]?.icon || "❓";

                    return (
                      <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>

                        {/* Avaliação */}
                        <TableCell sx={{ fontSize: "1.5rem", pl: 4 }}>{emojiCorrespondente}</TableCell>

                        {/* Chamado */}
                        <TableCell sx={{ fontWeight: 600, color: primaryColor, whiteSpace: "nowrap" }}>{row.numero_chamado}</TableCell>

                        {/* Usuário */}
                        <TableCell sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={row.nome_usuario || ""} arrow placement="top">
                            <span>{row.nome_usuario}</span>
                          </Tooltip>
                        </TableCell>

                        {/* Término */}
                        <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>{formatarData(row.data_termino)}</TableCell>

                        {/* Mensagem do chamado */}
                        <TableCell sx={{ color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={row.mensagem_chamado || "Sem mensagem"} arrow placement="top">
                            <span>{row.mensagem_chamado || "---"}</span>
                          </Tooltip>
                        </TableCell>

                        {/* Pontuação */}
                        <TableCell sx={{ fontWeight: 700, color: row.pontuacao >= 3 ? "#2E7D32" : "#D12029" }}>
                          {row.pontuacao}
                        </TableCell>

                        {/* Opinião / Feedback */}
                        <TableCell sx={{ fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={row.opiniao_usuario || "Sem opinião"} arrow placement="top">
                            <span>{row.opiniao_usuario || "---"}</span>
                          </Tooltip>
                        </TableCell>

                        {/* Criado Em */}
                        <TableCell sx={{ color: "#777", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                          {formatarData(row.criado_em)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!loading && registrosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#999" }}>
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
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
            labelDisplayedRows={({ from, to, count }) => `${from} até ${to} de ${count}`}
          />
        </Paper>
      </Box>
    </Box>
  );
}