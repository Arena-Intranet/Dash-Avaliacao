import React from "react";
import { Box, Card, CardContent, Typography, Avatar, LinearProgress } from "@mui/material";
import { SentimentSatisfiedAlt, Speed, QueryBuilder, AssignmentLate, Send } from "@mui/icons-material";
import { motion } from "framer-motion";
import type { MetricCardsProps } from "./types/types";
import { itemVariants } from "../../types/types";



export const MetricCards: React.FC<MetricCardsProps> = ({analisesMetricas,formatarHorasMinutos,getSlaColor}) => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }, gap: 3, mb: 4 }}>
      
      <Box component={motion.div} variants={itemVariants}>
        <Card sx={{ borderRadius: 3, boxShadow: "none", border: "1px solid #E2E8F0", height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>CSAT Geral</Typography>
              <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0284C7", width: 32, height: 32 }}><SentimentSatisfiedAlt fontSize="small" /></Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0284C7" }}>{analisesMetricas.csatScore}%</Typography>
            <LinearProgress variant="determinate" value={analisesMetricas.csatScore} sx={{ mt: 2.5, height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#0284C7" } }} />
          </CardContent>
        </Card>
      </Box>

      {/* CARD SLA */}
      <Box component={motion.div} variants={itemVariants}>
        <Card sx={{ borderRadius: 3, boxShadow: "none", border: "1px solid #E2E8F0", height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>SLA Dentro do Prazo</Typography>
              <Avatar sx={{ bgcolor: `${getSlaColor(analisesMetricas.percentualSLA)}15`, color: getSlaColor(analisesMetricas.percentualSLA), width: 32, height: 32 }}><Speed fontSize="small" /></Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: getSlaColor(analisesMetricas.percentualSLA) }}>{analisesMetricas.percentualSLA}%</Typography>
            <LinearProgress variant="determinate" value={analisesMetricas.percentualSLA} sx={{ mt: 2.5, height: 6, borderRadius: 3, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: getSlaColor(analisesMetricas.percentualSLA) } }} />
          </CardContent>
        </Card>
      </Box>

      {/* CARD TMA */}
      <Box component={motion.div} variants={itemVariants}>
        <Card sx={{ borderRadius: 3, boxShadow: "none", border: "1px solid #E2E8F0", height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>TMA (Fechamento)</Typography>
              <Avatar sx={{ bgcolor: "#EFF6FF", color: "#3B82F6", width: 32, height: 32 }}><QueryBuilder fontSize="small" /></Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1E293B" }}>
              {formatarHorasMinutos(analisesMetricas.tmaDecimal)}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1.5, fontWeight: 500 }}>Tempo médio de conclusão</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* CARD ALERTAS */}
      <Box component={motion.div} variants={itemVariants}>
        <Card sx={{ borderRadius: 3, boxShadow: "none", border: "1px solid #E2E8F0", height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>Estouros / Pendentes</Typography>
              <Avatar sx={{ bgcolor: "#FFF1F2", color: "#EF4444", width: 32, height: 32 }}><AssignmentLate fontSize="small" /></Avatar>
            </Box>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#EF4444" }}>{analisesMetricas.estouroSLA}</Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>Atrasados</Typography>
              </Box>
              <Box sx={{ borderLeft: "1px solid #E2E8F0", pl: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#64748B" }}>{analisesMetricas.kpis.totalPendentes}</Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>Pendentes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* CARD: Envios x Respostas */}
      <Box component={motion.div} variants={itemVariants}>
        <Card sx={{ borderRadius: 3, boxShadow: "none", border: "1px solid #E2E8F0", height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>Respostas / Envios</Typography>
              <Avatar sx={{ bgcolor: "#F5F3FF", color: "#8B5CF6", width: 32, height: 32 }}><Send fontSize="small" /></Avatar>
            </Box>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#8B5CF6" }}>{analisesMetricas.kpis.totalRespondidos}</Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>Respondidos</Typography>
              </Box>
              <Box sx={{ borderLeft: "1px solid #E2E8F0", pl: 2.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#64748B" }}>{analisesMetricas.kpis.totalTentativasEnvio}</Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>Total Envios</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

    </Box>
  );
};