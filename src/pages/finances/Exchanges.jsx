import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Collapse,
  LinearProgress,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import Layout from '../../components/layout/Layout';
import MonthNav from '../../components/shared/MonthNav';
import { DashedAddCard, AnimatedGroup, AnimatedItem } from '../../design-system';
import { useStore } from '../../store';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const formatARS = (n) => `$ ${(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (n) => `USD ${(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const labelFromDate = (dateStr) => {
  if (!dateStr) return '';
  const today = new Date();
  const [d, m] = dateStr.split('/').map(Number);
  const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getDate()}/${yesterday.getMonth() + 1}/${yesterday.getFullYear()}`;
  if (dateStr === todayStr) return 'Hoy';
  if (dateStr === yesterdayStr) return 'Ayer';
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3).toLowerCase()}`;
};

const groupByDate = (transactions) => {
  const map = new Map();
  transactions.forEach((tx) => {
    const key = tx.date || '?';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(tx);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const [da, ma, ya] = a.split('/').map(Number);
      const [db, mb, yb] = b.split('/').map(Number);
      return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    })
    .map(([date, txs]) => ({ date, transactions: txs }));
};

const slideVariants = {
  enter: (dir) => ({
    x: dir * 40,
    opacity: 0,
    transition: {
      x: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.4, ease: 'easeOut' },
    },
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x: dir * -60,
    opacity: 0,
    transition: {
      x: { duration: 0.35, ease: 'easeIn' },
      opacity: { duration: 0.18, ease: 'easeIn', delay: 0.17 },
    },
  }),
};

const Exchanges = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [expandedTxIdx, setExpandedTxIdx] = useState(null);
  const [direction, setDirection] = useState(0);

  const handleMonthChange = (m) => {
    setDirection(m > selectedMonth ? 1 : -1);
    setSelectedMonth(m);
  };

  const handleYearChange = (y) => {
    setDirection(y > selectedYear ? 1 : -1);
    setSelectedYear(y);
  };

  const disabledNext = selectedYear > currentYear || (selectedYear === currentYear && selectedMonth >= currentMonth);

  const monthData = useMemo(() => {
    const year = userData?.exchanges?.[selectedYear];
    const raw = (year?.months?.[selectedMonth]) || { data: [], totalCompras: 0, totalVentas: 0 };
    const rawData = raw.data || [];
    const sorted = [...rawData].sort((a, b) => {
      const [da, ma, ya] = (a.date || '1/1/2000').split('/').map(Number);
      const [db, mb, yb] = (b.date || '1/1/2000').split('/').map(Number);
      return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    });
    const netUSDCompras = rawData.filter((tx) => tx.operationType === 'Compra').reduce((s, tx) => s + (tx.amountUSD || 0), 0);
    const netUSDVentas = rawData.filter((tx) => tx.operationType === 'Venta').reduce((s, tx) => s + (tx.amountUSD || 0), 0);
    const totalVolume = (raw.totalCompras || 0) + (raw.totalVentas || 0);
    const comprasPct = totalVolume > 0 ? ((raw.totalCompras || 0) / totalVolume) * 100 : 0;
    const ventasPct = totalVolume > 0 ? ((raw.totalVentas || 0) / totalVolume) * 100 : 0;
    return {
      transactions: sorted,
      totalCompras: raw.totalCompras || 0,
      totalVentas: raw.totalVentas || 0,
      netUSDCompras, netUSDVentas,
      comprasPct, ventasPct,
      netUSD: netUSDCompras - netUSDVentas,
      dateGroups: groupByDate(sorted),
    };
  }, [userData, selectedYear, selectedMonth]);

  const { transactions, totalCompras, totalVentas, netUSD, comprasPct, ventasPct, dateGroups } = monthData;

  return (
    <Layout title="Exchange">
      <Box sx={{ minHeight: '100vh', pb: 12 }}>
        <MonthNav year={selectedYear} month={selectedMonth} onYearChange={handleYearChange} onMonthChange={handleMonthChange} disabledNext={disabledNext} />

        <AnimatePresence custom={direction}>
          <motion.div
            key={`${selectedYear}-${selectedMonth}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <AnimatedGroup sx={{ maxWidth: 600, mx: 'auto', pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* 1. Card principal de resumen */}
              {transactions.length > 0 && (
                <AnimatedItem>
                  <Card elevation={0} sx={{ mx: 2, borderRadius: 4, overflow: 'hidden', background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>FLUJO NETO USD</Typography>
                      <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: -1, color: netUSD >= 0 ? theme.palette.info.main : theme.palette.warning.main, mt: 1, fontSize: { xs: '2.5rem', sm: '3rem' } }}>
                        {netUSD >= 0 ? '+' : '\u2212'}{formatUSD(Math.abs(netUSD))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Volumen total: {formatARS(totalCompras + totalVentas)}</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', py: 2, px: 1 }}>
                      <Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>COMPRAS</Typography><Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25, color: 'info.main' }}>{formatARS(totalCompras)}</Typography></Box>
                      <Box sx={{ textAlign: 'center', borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`, borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}><Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>VENTAS</Typography><Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25, color: 'warning.main' }}>{formatARS(totalVentas)}</Typography></Box>
                      <Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>TRANSACCIONES</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{transactions.length}</Typography></Box>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1.5 }}>DISTRIBUCIÓN</Typography>
                      <Box sx={{ mb: 1.5 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>Compras</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{Math.round(comprasPct)}%</Typography></Box><LinearProgress variant="determinate" value={Math.min(100, comprasPct)} sx={{ height: 8, borderRadius: 999, bgcolor: alpha(theme.palette.info.main, 0.12), '& .MuiLinearProgress-bar': { bgcolor: theme.palette.info.main, borderRadius: 999 } }} /></Box>
                      <Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>Ventas</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{Math.round(ventasPct)}%</Typography></Box><LinearProgress variant="determinate" value={Math.min(100, ventasPct)} sx={{ height: 8, borderRadius: 999, bgcolor: alpha(theme.palette.warning.main, 0.12), '& .MuiLinearProgress-bar': { bgcolor: theme.palette.warning.main, borderRadius: 999 } }} /></Box>
                    </Box>
                  </Card>
                </AnimatedItem>
              )}

              {transactions.length === 0 && (
                <AnimatedItem><Card elevation={0} sx={{ mx: 2, borderRadius: 4, p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}` }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, width: 56, height: 56, mx: 'auto', mb: 1.5 }}><SwapHorizIcon fontSize="medium" /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Sin exchanges este mes</Typography>
                  <Typography variant="body2" color="text.secondary">Tus compras y ventas de USD aparecerán acá</Typography>
                </Card></AnimatedItem>
              )}

              {/* 2. Card fantasma */}
              <AnimatedItem>
                <Box sx={{ px: 2 }}>
                  <DashedAddCard label="Nuevo exchange" desc={transactions.length === 0 ? 'Registrá tu primer exchange' : 'Comprá o vendé USD'} onClick={() => navigate('/exchange')} />
                </Box>
              </AnimatedItem>

              {/* 3. Movimientos */}
              {dateGroups.length > 0 && (
                <AnimatedItem>
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>MOVIMIENTOS</Typography>
                      <Typography variant="caption" color="text.secondary">{transactions.length} transacciones</Typography>
                    </Box>

                    <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dateGroups.map((group) => {
                        const groupNetUSD = group.transactions.reduce((sum, tx) => { const usd = tx.amountUSD || 0; return tx.operationType === 'Compra' ? sum + usd : sum - usd; }, 0);
                        return (
                          <Box key={group.date}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1, px: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{labelFromDate(group.date)}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: groupNetUSD >= 0 ? 'info.main' : 'warning.main' }}>{groupNetUSD >= 0 ? '+' : '\u2212'}{formatUSD(Math.abs(groupNetUSD))}</Typography>
                            </Box>
                            <AnimatedItem key={group.date}>
                              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                                {group.transactions.map((tx) => {
                                  const isCompra = tx.operationType === 'Compra';
                                  const txColor = isCompra ? theme.palette.info.main : theme.palette.warning.main;
                                  const IconComp = isCompra ? ArrowUpwardIcon : ArrowDownwardIcon;
                                  const txId = `${tx.date}-${tx.amountARS}-${tx.amountUSD}`;
                                  const isExpanded = expandedTxIdx === txId;
                                  return (
                                    <Box key={txId}>
                                      <Box onClick={() => setExpandedTxIdx(isExpanded ? null : txId)} sx={{ cursor: 'pointer', p: 1.5, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(txColor, 0.15), color: txColor }}><IconComp fontSize="small" /></Avatar>
                                          <Box sx={{ flex: 1, minWidth: 0 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{isCompra ? 'Comprá USD' : 'Vendiste USD'}</Typography>{isExpanded ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />}</Box><Typography variant="caption" color="text.secondary" noWrap>TC {formatARS(tx.rate || tx.valorUSD || 1)} · {tx.date}</Typography></Box>
                                          <Box sx={{ textAlign: 'right', flexShrink: 0 }}><Typography variant="body2" sx={{ fontWeight: 700, color: txColor, whiteSpace: 'nowrap' }}>{isCompra ? '\u2212' : '+'}{formatARS(tx.amountARS || tx.amount || 0)}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{isCompra ? '+' : '\u2212'}{formatUSD(tx.amountUSD || 0)}</Typography></Box>
                                        </Box>
                                      </Box>
                                      <Collapse in={isExpanded} timeout={200} unmountOnExit>
                                        <Box sx={{ mt: 1.5, pt: 1.5, mx: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', gap: 0.5, pb: 1.5 }}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Operación</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: txColor }}>{isCompra ? 'Comprá USD' : 'Vendiste USD'}</Typography></Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Tasa</Typography><Typography variant="caption" sx={{ fontWeight: 500 }}>{formatARS(tx.rate || tx.valorUSD || 1)}</Typography></Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">ARS</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: txColor }}>{isCompra ? '\u2212' : '+'}{formatARS(tx.amountARS || tx.amount || 0)}</Typography></Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">USD</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: txColor }}>{isCompra ? '+' : '\u2212'}{formatUSD(tx.amountUSD || 0)}</Typography></Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">Fecha</Typography><Typography variant="caption" sx={{ fontWeight: 500 }}>{tx.date}</Typography></Box>
                                        </Box>
                                      </Collapse>
                                    </Box>
                                  );
                                })}
                              </Card>
                            </AnimatedItem>
                          </Box>
                        );
                      })}
                    </AnimatedGroup>
                  </Box>
                </AnimatedItem>
              )}
            </AnimatedGroup>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Layout>
  );
};

export default Exchanges;
