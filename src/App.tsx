import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { motion, type Variants } from "framer-motion";
import { MAPEAMENTO_REGRAS_TI, type PesquisaRegistro } from "./types/types";
import Logo from "../public/logo1.png";
import { MetricCards } from "./components/MetricCards/MetricCards";
import { AnalyticsCharts } from "./components/AnalyticsCharts/AnalyticsCharts";
import { TicketsTable } from "./components/TicketsTable/TicketsTable";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const formatarData = (dataString?: string) => {
  if (!dataString || dataString.startsWith("0000")) return "---";
  const data = new Date(dataString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${horas}h ${min}min`;
};

const formatarHorasMinutos = (horasDecimais: number | null): string => {
  if (horasDecimais === null) return "---";
  const h = Math.floor(horasDecimais);
  const m = Math.round((horasDecimais - h) * 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min`;
};

const calcularDiferencaHoras = (inicioStr?: string, fimStr?: string): number | null => {
  if (!inicioStr || !fimStr || inicioStr.startsWith("0000") || fimStr.startsWith("0000")) return null;
  const inicio = new Date(inicioStr).getTime();
  const fim = new Date(fimStr).getTime();
  const diferenca = (fim - inicio) / (1000 * 60 * 60);
  return diferenca >= 0 ? diferenca : null;
};

const obterHorasLimiteDaRegra = (tempoStr: string): number => {
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

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [registros, setRegistros] = useState<PesquisaRegistro[]>([]);
  const [filtro, setFiltro] = useState<string>("");
  const [filtroAvaliacao, setFiltroAvaliacao] = useState<string>("todos");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>("");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const primaryColor = "#142B4D";

  const infoAvaliacoes: Record<string, { label: string; icon: string; color: string; bg: string; nota: number }> = {
    ruim: { label: "Ruim", icon: "😞", color: "#E11D48", bg: "#FFF1F2", nota: 2.5 },
    regular: { label: "Regular", icon: "😐", color: "#D97706", bg: "#FEF3C7", nota: 5.0 },
    bom: { label: "Bom", icon: "😊", color: "#2563EB", bg: "#EFF6FF", nota: 7.5 },
    excelente: { label: "Excelente", icon: "🤩", color: "#16A34A", bg: "#F0FDF4", nota: 10.0 },
  };

  const fetchPesquisas = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://arenavidros.com.br/api/pesquisas");
      const dados: PesquisaRegistro[] = await response.json();
      setRegistros(dados);
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
    const contagemUrgencia: Record<string, number> = {};
    const contagemTitulo: Record<string, { titulo: string; ruim: number; regular: number; bom: number; excelente: number; total: number }> = {};

    let totalSLAAtendido = 0;
    let totalSLADentroDoPrazo = 0;

    const kpisIniciais = {
      totalRespondidos: 0,
      somaPontos: 0,
      promotores: 0,
      somaTempoAtendimento: 0,
      chamadosComTempo: 0,
      totalPendentes: 0,
      totalTentativasEnvio: 0
    };

    const processamento = registros.reduce((acc, curr) => {
      acc.totalTentativasEnvio += Number(curr.tentativas_envio || 0);
      const tipoAvaliacao = curr.avaliacao_texto ? String(curr.avaliacao_texto).toLowerCase() : "";
      const titulo = curr.titulo_ps || "Outros";

      if (!contagemTitulo[titulo]) {
        contagemTitulo[titulo] = { titulo, ruim: 0, regular: 0, bom: 0, excelente: 0, total: 0 };
      }

      if (curr.pontuacao !== null && curr.pontuacao !== undefined && tipoAvaliacao && contagem[tipoAvaliacao as keyof typeof contagem] !== undefined) {
        acc.totalRespondidos++;
        acc.somaPontos += Number(curr.pontuacao);
        contagem[tipoAvaliacao as keyof typeof contagem]++;
        contagemTitulo[titulo][tipoAvaliacao as keyof typeof contagem]++;

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

      const urgencia = curr.urgencia_ps || "Não Definida";
      contagemUrgencia[urgencia] = (contagemUrgencia[urgencia] || 0) + 1;
      contagemTitulo[titulo].total++;

      // --- CÁLCULO INTELIGENTE DO SLA INDIVIDUAL ---
      const diferencaHoras = calcularDiferencaHoras(curr.data_abertura, curr.data_termino);
      if (diferencaHoras !== null) {
        acc.somaTempoAtendimento += diferencaHoras;
        acc.chamadosComTempo++;
        totalSLAAtendido++;

        // Descobre a regra configurada para este assunto e converte em horas utilizáveis
        const regraEncontrada = MAPEAMENTO_REGRAS_TI[titulo];
        const limiteHorasSLA = regraEncontrada ? obterHorasLimiteDaRegra(regraEncontrada.tempo) : 24;

        if (diferencaHoras <= limiteHorasSLA) {
          totalSLADentroDoPrazo++;
        }
      }

      return acc;
    }, kpisIniciais);

    const totalChamados = registros.length;
    const taxaResposta = totalChamados > 0 ? Math.round((processamento.totalRespondidos / totalChamados) * 100) : 0;
    const csatScore = processamento.totalRespondidos > 0 ? Math.round(((processamento.somaPontos / processamento.totalRespondidos) / 10) * 100) : 0;

    const tmaDecimal = processamento.chamadosComTempo > 0 ? (processamento.somaTempoAtendimento / processamento.chamadosComTempo) : null;

    const percentualSLA = totalSLAAtendido > 0 ? Math.round((totalSLADentroDoPrazo / totalSLAAtendido) * 100) : 0;
    const estouroSLA = totalSLAAtendido - totalSLADentroDoPrazo;
    const dadosTimeline = Object.values(historicoDatas).slice(-7);

    const dadosMixPizza = Object.keys(infoAvaliacoes).map((chave, index) => ({
      id: index,
      label: infoAvaliacoes[chave].label,
      value: contagem[chave as keyof typeof contagem],
      color: infoAvaliacoes[chave].color,
    })).filter(item => item.value > 0);

    const coresUrgencia: Record<string, string> = { "baixa": "#2563EB", "média": "#D97706", "alta": "#E11D48", "urgente": "#E11D48" };
    const dadosUrgencia = Object.entries(contagemUrgencia).map(([label, value], id) => {
      const corBase = coresUrgencia[label.toLowerCase()] || "#64748B";
      return { id, label, value, color: corBase };
    });

    const dadosTitulo = Object.values(contagemTitulo)
      .sort((a, b) => b.total - a.total)
      .map(({ titulo, ruim, regular, bom, excelente }) => ({
        titulo,
        ruim,
        regular,
        bom,
        excelente
      }));

    return {
      kpis: processamento,
      contagem,
      totalChamados,
      taxaResposta,
      csatScore,
      tmaDecimal,
      percentualSLA,
      estouroSLA,
      dadosTimeline,
      dadosMixPizza,
      dadosUrgencia,
      dadosTitulo
    };
  }, [registros]);

  const getSlaColor = (score: number) => {
    if (score >= 85) return "#16A34A";
    if (score >= 70) return "#D97706";
    return "#E11D48";
  };

  const registrosFiltrados = registros.filter((item) => {
    const termo = filtro.toLowerCase();
    const statusFiltro = !item.avaliacao_texto ? "pendente" : "respondido";

    const correspondeTexto = (
      (item.nome_usuario && item.nome_usuario.toLowerCase().includes(termo)) ||
      (item.numero_chamado && item.numero_chamado.toLowerCase().includes(termo)) ||
      (item.opiniao_usuario && item.opiniao_usuario.toLowerCase().includes(termo)) ||
      (item.mensagem_chamado && item.mensagem_chamado.toLowerCase().includes(termo)) ||
      statusFiltro.includes(termo)
    );
    const avaliacaoItem = item.avaliacao_texto ? item.avaliacao_texto.toLowerCase() : "";
    const correspondeAvaliacao = filtroAvaliacao === "todos" || avaliacaoItem === filtroAvaliacao;

    return correspondeTexto && correspondeAvaliacao;
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

      <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ px: { xs: 2, md: 4 }, pt: 4, maxWidth: "1600px", margin: "0 auto" }}>

        <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase", mb: 2, letterSpacing: 1 }}>
          Indicadores de Performance & SLA de Entrega
        </Typography>

        <MetricCards
          analisesMetricas={analisesMetricas}
          formatarHorasMinutos={formatarHorasMinutos}
          getSlaColor={getSlaColor}
        />

        <AnalyticsCharts
          primaryColor={primaryColor}
          analisesMetricas={{
            dadosTimeline: analisesMetricas.dadosTimeline,
            dadosMixPizza: analisesMetricas.dadosMixPizza,
            dadosTitulo: analisesMetricas.dadosTitulo,
            dadosUrgencia: analisesMetricas.dadosUrgencia.map((item) => ({
              urgencia: item.label,
              quantidade: item.value,
            }))
          }}
        />

        <TicketsTable
          primaryColor={primaryColor}
          filtro={filtro}
          setFiltro={setFiltro}
          setPage={setPage}
          loading={loading}
          filtroAvaliacao={filtroAvaliacao} 
          setFiltroAvaliacao={setFiltroAvaliacao}
          registros={registros}
          registrosFiltrados={registrosFiltrados}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          infoAvaliacoes={infoAvaliacoes}
          obterCorUrgencia={(urgenciaTexto?: string) => {
            if (!urgenciaTexto) return "#64748B";
            switch (urgenciaTexto.toLowerCase()) {
              case "baixa": return "#2563EB";
              case "média":
              case "media": return "#D97706";
              case "alta":
              case "urgente": return "#E11D48";
              default: return "#64748B";
            }
          }}
          formatarData={formatarData}
          formatarHorasMinutos={formatarHorasMinutos}
          calcularDiferencaHoras={calcularDiferencaHoras}
        />
      </Box>
    </Box>
  );
}