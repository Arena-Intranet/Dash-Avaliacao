import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { motion } from "framer-motion";
import { CORES_SISTEMA, type AnalyticsChartsProps } from "./types/types";
import { itemVariants } from "../../types/types";



export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ primaryColor, analisesMetricas }) => {
    return (
        <Box>
            {/* Primeira Linha de Gráficos */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3, mb: 4 }}>
                <Box component={motion.div} variants={itemVariants}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "none", height: "100%" }} elevation={0}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 2 }}>Volume de Entrada por Período</Typography>
                        <Box sx={{ width: "100%", height: 280 }}>
                            {analisesMetricas.dadosTimeline.length > 0 ? (
                                <LineChart
                                    xAxis={[{
                                        scaleType: "point",
                                        data: analisesMetricas.dadosTimeline.map(d => d.data),
                                        tickLabelStyle: { fill: "#0D1F3A", fontSize: 11, fontWeight: 500 }
                                    }]}
                                    series={[{
                                        data: analisesMetricas.dadosTimeline.map(d => d.total),
                                        color: "#06233f",
                                        area: true,
                                        showMark: true,
                                    }]}
                                    margin={{ left: 35, right: 20, top: 20, bottom: 20 }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>Sem dados históricos</Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Gráfico de Distribuição Geral de Satisfação */}
                <Box component={motion.div} variants={itemVariants}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "none", height: "100%" }} elevation={0}>

                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 2 }}>
                            Distribuição Geral de Satisfação
                        </Typography>

                        <Box sx={{ width: "100%", height: 240, display: "flex", justifyContent: "center", alignItems: "center", "& .MuiChartsLegend-root": { display: "none !important" }, "& text.MuiPieArcLabel-root, & .MuiPieArcLabel-root, & text[class*='MuiPieArcLabel']": { fill: "#FFFFFF !important", color: "#FFFFFF !important", fontSize: "12px !important", fontWeight: "900 !important", textShadow: "0px 1px 2px rgba(0,0,0,0.4)" } }}>
                            {analisesMetricas.dadosMixPizza.length > 0 ? (
                                <PieChart
                                    series={[{
                                        data: analisesMetricas.dadosMixPizza,
                                        innerRadius: 0,
                                        outerRadius: 120,
                                        paddingAngle: 0,
                                        cornerRadius: 0,
                                        arcLabel: (item) => {
                                            const total = analisesMetricas.dadosMixPizza.reduce((acc, curr) => acc + curr.value, 0);
                                            const percentual = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                            return percentual > 0 ? `${percentual}%` : '';
                                        },
                                        arcLabelMinAngle: 5,
                                    }]}
                                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                />
                            ) : (
                                <Box sx={{ color: '#94A3B8' }}>Nenhuma avaliação recebida</Box>
                            )}
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5, mt: 2, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                            {[
                                { key: 'ruim', label: 'Ruim 😞', color: '#d32f2f' },
                                { key: 'regular', label: 'Regular 😐', color: '#f57c00' },
                                { key: 'bom', label: 'Bom 😊', color: '#0288d1' },
                                { key: 'excelente', label: 'Excelente 🤩', color: '#15803d' }
                                
                            ].map((item) => {
                                const dadoExistente = analisesMetricas.dadosMixPizza.find(d => d.label.toLowerCase() === item.key);
                                return (
                                    <Box key={item.key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
                                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                                            {item.label} {dadoExistente ? `(${dadoExistente.value})` : ''}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                    </Paper>
                </Box>
            </Box>

            {/* Gráfico de Títulos x Satisfação */}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3, mb: 4 }}>
                <Box component={motion.div} variants={itemVariants}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "none", height: "100%" }} elevation={0}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 2 }}>
                            Top 5: Temas x Nível de Satisfação
                        </Typography>
                        <Box sx={{ width: "100%", height: 320, "& .MuiChartsLegend-root": { paddingTop: "0px !important" }, "& .custom-bar-label": { fontSize: "12px", fontWeight: 700, fill: "#1E293B", fontFamily: "inherit" } }}>
                            {analisesMetricas.dadosTitulo.length > 0 ? (
                                <BarChart
                                    dataset={analisesMetricas.dadosTitulo}
                                    yAxis={[
                                        {
                                            scaleType: "band",
                                            dataKey: "titulo",
                                            width: 400,
                                            tickLabelStyle: { fontSize: 12, fontWeight: 700, fill: "#1E293B", },
                                        },
                                    ]}
                                    series={[
                                        { dataKey: 'ruim', color: '#d32f2f', label: 'Ruim 😞', stack: 'A' },
                                        { dataKey: 'regular', color: '#f57c00', label: 'Regular 😐', stack: 'A' },
                                        { dataKey: 'bom', color: '#0288d1', label: 'Bom 😊', stack: 'A' },
                                        { dataKey: 'excelente', color: '#15803d', label: 'Excelente 🤩', stack: 'A' }
                                    ]}
                                    layout="horizontal"
                                    borderRadius={8}
                                    margin={{ left: -200, right: 50, top: 25, bottom: 30 }}

                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                    Sem dados de títulos
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>

                {/* Gráfico de Distribuição de Urgência */}
                <Box component={motion.div} variants={itemVariants}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "none", height: "100%" }} elevation={0}>

                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: primaryColor, mb: 2 }}>
                            Distribuição de Urgência
                        </Typography>
                        <Box sx={{ width: "100%", height: 250, "& .MuiChartsLegend-root": { display: "none !important" } }}>
                            {analisesMetricas.dadosUrgencia.length > 0 ? (
                                <BarChart
                                    dataset={analisesMetricas.dadosUrgencia}
                                    xAxis={[{
                                        scaleType: 'band',
                                        dataKey: 'urgencia',
                                        tickLabelStyle: { fill: "#64748B", fontSize: 10, fontWeight: 600 },
                                        colorMap: {
                                            type: 'ordinal',
                                            values: ['Muito Urgente', 'Urgente', 'Média Urgência', 'Pouco Urgente'],
                                            colors: [CORES_SISTEMA.muitoUrgente, CORES_SISTEMA.urgente, CORES_SISTEMA.mediaUrgencia, CORES_SISTEMA.poucoUrgente]
                                        }
                                    }]}
                                    series={[{ dataKey: 'quantidade', valueFormatter: (value) => `${value} chamados`, }]}
                                    borderRadius={6}
                                    margin={{ top: 30, bottom: 30, left: -15, right: 25 }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                    Sem dados de urgência
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, mt: 2, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                            {[{ label: "Muito Urgente", cor: CORES_SISTEMA.muitoUrgente }, { label: "Urgente", cor: CORES_SISTEMA.urgente }, { label: "Média Urgência", cor: CORES_SISTEMA.mediaUrgencia }, { label: "Pouco Urgente", cor: CORES_SISTEMA.poucoUrgente }].map((item) => (
                                <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.cor }} />
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};