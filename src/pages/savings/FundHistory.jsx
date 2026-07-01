import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Avatar, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReactApexChart from 'react-apexcharts';
import Layout from '../../components/layout/Layout';
import MonthNav from '../../components/shared/MonthNav';
import { useStore } from '../../store';
import { formatAmount } from '../../utils';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const parseDate = (dateString) => {
  if (!dateString) return new Date(0);
  if (dateString instanceof Date) return dateString;
  const parts = dateString.split('/');
  if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  return new Date(dateString);
};

const fmt = (v) => {
  const r = formatAmount(v || 0);
  return r.startsWith('$') ? r : `$ ${r}`;
};

const FundHistory = () => {
  const theme = useTheme();
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { userData } = useStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fund = userData?.savingsFunds?.[fundId];
  const COLOR = theme.palette.secondary.main;

  const monthStats = useMemo(() => {
    if (!fund?.history) return { totalDeposits: 0, totalWithdrawals: 0, count: 0 };
    let totalDeposits = 0, totalWithdrawals = 0, count = 0;
    Object.values(fund.history).forEach((tx) => {
      const d = parseDate(tx.date);
      if (d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth) {
        count++;
        if (tx.type === 'deposit') totalDeposits += tx.amount || 0;
        else totalWithdrawals += tx.amount || 0;
      }
    });
    return { totalDeposits, totalWithdrawals, count };
  }, [fund, selectedYear, selectedMonth]);

  const { chartLabels, chartData } = useMemo(() => {
    if (!fund?.history) return { chartLabels: [], chartData: [] };
    const daily = {};
    Object.values(fund.history).forEach((tx) => {
      if (!tx.date) return;
      const d = parseDate(tx.date);
      if (d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth) {
        daily[tx.date] = tx.newTotal || 0;
      }
    });
    const sorted = Object.keys(daily).sort((a, b) => {
      const da = parseDate(a), db = parseDate(b);
      return da.getTime() - db.getTime();
    });
    return { chartLabels: sorted, chartData: sorted.map((k) => daily[k]) };
  }, [fund, selectedYear, selectedMonth]);

  const transactions = useMemo(() => {
    if (!fund?.history) return [];
    const month = Object.entries(fund.history)
      .filter(([, tx]) => {
        const d = parseDate(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
      })
      .sort((a, b) => {
        const da = parseDate(a[1].date), db = parseDate(b[1].date);
        if (db.getTime() !== da.getTime()) return db.getTime() - da.getTime();
        return (b[1].timestamp || 0) - (a[1].timestamp || 0);
      });
    return month.map(([id, tx]) => ({ id, ...tx }));
  }, [fund, selectedYear, selectedMonth]);

  const groupsByDate = useMemo(() => {
    const groups = new Map();
    transactions.forEach((tx) => {
      const d = parseDate(tx.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!groups.has(key)) groups.set(key, { date: d, items: [] });
      groups.get(key).items.push(tx);
    });
    return Array.from(groups.values());
  }, [transactions]);

  const chartOptions = {
    chart: { type: 'line', toolbar: { show: false }, fontFamily: theme.typography.fontFamily, background: 'transparent' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4, strokeWidth: 2, strokeColors: theme.palette.background.paper },
    xaxis: { categories: chartLabels, labels: { style: { colors: theme.palette.text.secondary, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (v) => formatAmount(v), style: { colors: theme.palette.text.secondary } } },
    tooltip: { y: { formatter: (v) => formatAmount(v) }, theme: theme.palette.mode === 'dark' ? 'dark' : 'light' },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3, padding: { left: 0, right: 0 } },
    colors: [COLOR],
  };

  const disabledNext = selectedYear === new Date().getFullYear() && selectedMonth >= new Date().getMonth() + 1;

  const cardSx = {
    borderRadius: 3, border: `1px solid ${alpha(COLOR, 0.2)}`,
    bgcolor: alpha(COLOR, 0.04), overflow: 'hidden',
  };

  if (!fund) {
    return (
      <Layout title="Historial del Fondo" showBack onBack={() => navigate('/ahorros')}>
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
          <Card elevation={0} sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: `1px dashed ${alpha(COLOR, 0.2)}`, bgcolor: alpha(COLOR, 0.04) }}>
            <Avatar sx={{ bgcolor: alpha(COLOR, 0.12), color: COLOR, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
              <SwapHorizIcon fontSize="medium" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Fondo no encontrado</Typography>
            <Typography variant="body2" color="text.secondary">
              El fondo que buscas no existe o ha sido eliminado.
            </Typography>
          </Card>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={`Historial - ${fund.name}`} showBack onBack={() => navigate('/ahorros')}>
      <MonthNav year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} disabledNext={disabledNext} />

      <AnimatedGroup sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Fund header */}
        <AnimatedItem>
          <Card elevation={0} sx={cardSx}>
            <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>{fund.name}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, color: COLOR }}>
                {fmt(fund.balance || 0)}
              </Typography>
              {fund.target > 0 && (
                <Typography variant="caption" color="text.secondary">
                  de {fmt(fund.target)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </AnimatedItem>

        {/* Stat cards */}
        <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          <AnimatedItem>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`, bgcolor: alpha(theme.palette.success.main, 0.06), textAlign: 'center', py: 1.5 }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.success.main, mb: 0.25 }} />
              <Typography variant="caption" color="text.secondary">Depósitos</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, color: theme.palette.success.main }}>{fmt(monthStats.totalDeposits)}</Typography>
            </Card>
          </AnimatedItem>
          <AnimatedItem>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`, bgcolor: alpha(theme.palette.error.main, 0.06), textAlign: 'center', py: 1.5 }}>
              <TrendingDownIcon sx={{ fontSize: 18, color: theme.palette.error.main, mb: 0.25 }} />
              <Typography variant="caption" color="text.secondary">Retiros</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, color: theme.palette.error.main }}>{fmt(monthStats.totalWithdrawals)}</Typography>
            </Card>
          </AnimatedItem>
        </AnimatedGroup>

        {/* Acciones */}
        <AnimatedItem>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Box onClick={() => navigate(`/agregarFondos/${fundId}`)} sx={{ borderRadius: 2, border: `1px dashed ${alpha(theme.palette.success.main, 0.35)}`, bgcolor: alpha(theme.palette.success.main, 0.05), py: 2.5, px: 1, textAlign: 'center', cursor: 'pointer', transition: '0.15s', '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) } }}>
              <Typography variant="h4" sx={{ mb: 0.3, color: theme.palette.success.main }}>+</Typography>
              <Typography variant="body2" fontWeight={600}>Agregar</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Depositar en {fund.name}</Typography>
            </Box>
            <Box onClick={() => navigate(`/retirarFondos/${fundId}`)} sx={{ borderRadius: 2, border: `1px dashed ${alpha(theme.palette.error.main, 0.35)}`, bgcolor: alpha(theme.palette.error.main, 0.05), py: 2.5, px: 1, textAlign: 'center', cursor: 'pointer', transition: '0.15s', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
              <Typography variant="h4" sx={{ mb: 0.3, color: theme.palette.error.main }}>+</Typography>
              <Typography variant="body2" fontWeight={600}>Retirar</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Extraer de {fund.name}</Typography>
            </Box>
          </Box>
        </AnimatedItem>

        {/* Chart */}
        {chartLabels.length > 0 && (
          <AnimatedItem>
            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 1 } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                  EVOLUCIÓN
                </Typography>
                <ReactApexChart options={chartOptions} series={[{ name: 'Balance', data: chartData }]} type="line" height={220} />
              </CardContent>
            </Card>
          </AnimatedItem>
        )}

        {/* Transactions */}
        {transactions.length > 0 ? (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block', px: 0.5 }}>
              MOVIMIENTOS
            </Typography>
            <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {groupsByDate.map((group, gi) => {
                const d = group.date;
                const isToday = d.toDateString() === new Date().toDateString();
                const isYesterday = d.toDateString() === new Date(Date.now() - 86400000).toDateString();
                const label = isToday ? 'Hoy' : isYesterday ? 'Ayer' : `${d.getDate()} ${MONTH_NAMES[d.getMonth()].substring(0, 3).toLowerCase()}`;

                return (
                  <Box key={gi}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1, px: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{label}</Typography>
                    </Box>
                    <AnimatedItem key={gi}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                        <Box>
                          {group.items.map((tx, ti) => {
                            const isDeposit = tx.type === 'deposit';
                            const txColor = isDeposit ? theme.palette.success.main : theme.palette.error.main;
                            const IconComp = isDeposit ? TrendingUpIcon : TrendingDownIcon;
                            return (
                              <Box key={tx.id || ti} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderTop: ti > 0 ? `1px solid ${alpha(COLOR, 0.1)}` : 'none' }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(txColor, 0.12), color: txColor, borderRadius: 1.5 }}>
                                  <IconComp sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                    {tx.description || (isDeposit ? 'Depósito' : 'Retiro')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {tx.date}
                                    {tx.newTotal !== undefined && ` · Balance: ${fmt(tx.newTotal)}`}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: txColor, whiteSpace: 'nowrap' }}>
                                  {isDeposit ? '+' : '\u2212'}{fmt(tx.amount || 0)}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Card>
                    </AnimatedItem>
                  </Box>
                );
              })}
            </AnimatedGroup>
          </Box>
        ) : (
          <AnimatedItem>
            <Card elevation={0} sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}` }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                <SwapHorizIcon fontSize="medium" />
              </Avatar>
              <Typography variant="body2" color="text.secondary">Sin movimientos este mes</Typography>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedGroup>
    </Layout>
  );
};

export default FundHistory;
