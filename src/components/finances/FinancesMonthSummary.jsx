import React from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Divider,
  Avatar,
  LinearProgress,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { formatAmount, getMonthName } from '../../utils';
import { getCategoryIcon } from './financesHelpers';
import { AnimatedItem } from '../../design-system';

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const todayIfCurrent = (year, month) => {
  const t = new Date();
  if (year === t.getFullYear() && month === t.getMonth() + 1) return t.getDate();
  return daysInMonth(year, month);
};

const FinancesMonthSummary = ({
  monthlyData,
  monthlyTrendsData,
  dataType,
  selectedYear,
  selectedMonth,
  dollarRate,
  userData,
}) => {
  const theme = useTheme();
  const isExpense = dataType === 'expenses';
  const accent = isExpense ? theme.palette.error.main : theme.palette.success.main;
  const accentDark = isExpense ? theme.palette.error.dark : theme.palette.success.dark;

  // Total del mes (suma de categorías efectivas, mismo cálculo que monthlyData)
  const total = monthlyData
    ? Object.values(monthlyData.categoryData || {}).reduce((sum, cat) => sum + cat.total, 0)
    : 0;
  const totalUSD = total / (dollarRate?.venta || 1);

  // Transacciones visibles del mes
  const txCount = monthlyData?.data
    ? monthlyData.data.filter((t) => !t.hiddenFromList && !t.excludeFromTotal && !t.isFutureTransaction).length
    : 0;

  // Promedio por día (usa el día actual si es el mes en curso, sino los días del mes completos)
  const days = Math.max(1, todayIfCurrent(selectedYear, selectedMonth));
  const avgPerDay = total / days;

  // Vs mes anterior — proporcional al mismo día del mes
  const prevIndex = selectedMonth - 2;
  let prevAmount = 0;
  if (prevIndex >= 0) {
    const arr = isExpense ? monthlyTrendsData?.expenses : monthlyTrendsData?.incomes;
    prevAmount = arr?.[prevIndex] || 0;
  }
  // Si es el mes actual, ajustar el mes anterior al mismo día para una comparación justa
  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
  if (isCurrentMonth && prevAmount > 0) {
    const dayOfMonth = now.getDate();
    const pM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const pY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const pMonthData = userData?.finances?.[dataType]?.[pY]?.months?.[pM];
    if (pMonthData?.data && Array.isArray(pMonthData.data)) {
      prevAmount = pMonthData.data
        .filter((tx) => {
          if (!tx.date || tx.excludeFromTotal) return false;
          const parts = tx.date.split('/').map(Number);
          return parts.length === 3 && parts[0] <= dayOfMonth;
        })
        .reduce((s, tx) => s + (tx.amount || 0) - (tx.refundAmount || 0), 0);
    }
  }
  const percentChange = prevAmount > 0 ? ((total - prevAmount) / prevAmount) * 100 : null;

  // Top 3 categorías
  const top3 = (monthlyData?.sortedCategories || []).slice(0, 3);

  // Datos todavía no calculados (useEffect no corrió aún)
  if (!monthlyData) return null;

  // Estado vacío
  if (total === 0) {
    return (
      <AnimatedItem>
        <Card
          elevation={0}
          sx={{
            mx: 2,
            mt: 1.5,
            mb: 3,
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(accent, 0.12),
              color: accent,
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
            }}
          >
            {isExpense ? <TrendingDownIcon /> : <TrendingUpIcon />}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Sin {isExpense ? 'gastos' : 'ingresos'} este mes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getMonthName(selectedMonth)} {selectedYear} aún no tiene registros.
          </Typography>
        </Card>
      </AnimatedItem>
    );
  }

  return (
    <AnimatedItem>
    <Card
      elevation={0}
      sx={{
        mx: 2,
        mt: 1.5,
        mb: 3,
        borderRadius: 4,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${alpha(accent, 0.08)} 0%, ${alpha(accent, 0.02)} 100%)`,
        border: `1px solid ${alpha(accent, 0.15)}`,
      }}
    >
      {/* Monto principal */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: accentDark,
            letterSpacing: -1,
            fontSize: { xs: '2.5rem', sm: '3rem' },
          }}
        >
          {formatAmount(total)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          = {formatAmount(totalUSD, true)}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: alpha(accent, 0.15) }} />

      {/* 3 métricas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          py: 2,
          px: 1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            TRANSACCIONES
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>
            {txCount}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', borderLeft: `1px solid ${alpha(accent, 0.15)}`, borderRight: `1px solid ${alpha(accent, 0.15)}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            PROMEDIO/DÍA
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25 }}>
            {formatAmount(avgPerDay)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            VS MES ANT.
          </Typography>
          {percentChange === null ? (
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25, color: 'text.secondary' }}>
              —
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.25 }}>
              {percentChange >= 0 ? (
                <ArrowUpwardIcon sx={{ fontSize: 14, color: percentChange >= 0 && isExpense ? theme.palette.error.main : theme.palette.success.main }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 14, color: !isExpense ? theme.palette.error.main : theme.palette.success.main }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color:
                    (percentChange >= 0 && isExpense) || (percentChange < 0 && !isExpense)
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                }}
              >
                {Math.abs(percentChange).toFixed(0)}%
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: alpha(accent, 0.15) }} />

      {/* Top 3 categorías */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1.5 }}>
          TOP CATEGORÍAS
        </Typography>
        <Stack spacing={1.75}>
          {top3.map(([catName, catData]) => (
            <Box key={catName}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(accent, 0.15),
                      color: accent,
                      width: 28,
                      height: 28,
                    }}
                  >
                    {getCategoryIcon(catName)}
                  </Avatar>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }} noWrap>
                    {catName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: accentDark, whiteSpace: 'nowrap' }}>
                    {formatAmount(catData.total)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, catData.percentage)}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: alpha(accent, 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: accent, borderRadius: 999 },
                  }}
                />
              </Box>
            ))}
        </Stack>


      </Box>
    </Card>
    </AnimatedItem>
  );
};

export default FinancesMonthSummary;
