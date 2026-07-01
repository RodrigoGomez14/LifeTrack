import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  IconButton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Chart from 'react-apexcharts';
import { formatAmount, getMonthName } from '../../utils';
import { getCategoryColor } from './financesHelpers';
import { AnimatedItem } from '../../design-system';

// Helper: últimos N meses incluyendo el seleccionado, retorna labels cortos + valores
const buildLastNMonths = (year, month, monthlyTrendsData, dataType, n = 6) => {
  // monthlyTrendsData es del año seleccionado. Para casos de cross-year usamos sólo lo disponible.
  // Para simplicidad: tomamos los meses index [month-n .. month-1] del año actual, completando con 0 si faltan.
  const labels = [];
  const values = [];
  const arr = (dataType === 'expenses' ? monthlyTrendsData?.expenses : monthlyTrendsData?.incomes) || [];

  for (let i = n - 1; i >= 0; i--) {
    let m = month - i;
    let y = year;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    labels.push(`${getMonthName(m).substring(0, 3)} ${String(y).slice(2)}`);
    // Si es del mismo año seleccionado, usar el array; si es otro, dejamos 0 (no tenemos ese año cargado acá)
    if (y === year) {
      values.push(arr[m - 1] || 0);
    } else {
      values.push(0);
    }
  }
  return { labels, values };
};

const FinancesCharts = ({
  dataType,
  selectedYear,
  selectedMonth,
  monthlyData,
  monthlyTrendsData,
}) => {
  const theme = useTheme();
  const [chartIndex, setChartIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const isExpense = dataType === 'expenses';
  const accent = isExpense ? theme.palette.error.main : theme.palette.success.main;

  // ─── Datos del Chart A — evolución últimos 6 meses ───
  const evolution = useMemo(
    () => buildLastNMonths(selectedYear, selectedMonth, monthlyTrendsData, dataType, 6),
    [selectedYear, selectedMonth, monthlyTrendsData, dataType]
  );

  const evolutionOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 300 },
      sparkline: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 3, colors: [accent] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: accent, opacity: 0.4 },
          { offset: 100, color: accent, opacity: 0.02 },
        ],
      },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      colors: [accent],
      strokeColors: theme.palette.background.paper,
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      categories: evolution.labels,
      labels: { style: { fontSize: '11px', colors: theme.palette.text.secondary } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '10px', colors: theme.palette.text.secondary },
        formatter: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`),
      },
    },
    grid: {
      borderColor: alpha(theme.palette.text.secondary, 0.1),
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: { formatter: (v) => `${formatAmount(v)}` },
    },
    colors: [accent],
  };
  const evolutionSeries = [{ name: isExpense ? 'Gastos' : 'Ingresos', data: evolution.values }];

  // ─── Datos del Chart B — top 6 categorías ───
  const categoriesData = useMemo(() => {
    if (!monthlyData?.sortedCategories) return [];
    return monthlyData.sortedCategories.slice(0, 6).map(([name, data]) => ({
      name,
      value: data.total,
      color: getCategoryColor(name, theme, dataType),
    }));
  }, [monthlyData, theme, dataType]);

  const categoriesOptions = {
    chart: { toolbar: { show: false }, animations: { enabled: true } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '72%',
        distributed: true,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${formatAmount(v)}`,
      offsetX: 50,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: [theme.palette.text.primary],
      },
    },
    xaxis: {
      categories: categoriesData.map((c) => c.name),
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: theme.palette.text.secondary, fontWeight: 600 },
      },
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: {
      theme: theme.palette.mode,
      y: { formatter: (v) => `${formatAmount(v)}` },
    },
    colors: categoriesData.map((c) => c.color),
  };
  const categoriesSeries = [{ data: categoriesData.map((c) => c.value) }];

  // ─── Swipe handlers (touch) ───
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const dx = touchStartX.current - touchEndX.current;
    if (Math.abs(dx) < 40) return;
    if (dx > 0 && chartIndex === 0) setChartIndex(1);
    else if (dx < 0 && chartIndex === 1) setChartIndex(0);
  };

  const hasEvolution = evolution.values.some((v) => v > 0);
  const hasCategories = categoriesData.length > 0;

  return (
    <AnimatedItem>
    <Card
      elevation={0}
      sx={{
        mx: 2,
        mb: 3,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          pt: 2,
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
            {chartIndex === 0 ? 'EVOLUCIÓN' : 'POR CATEGORÍAS'}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {chartIndex === 0 ? 'Últimos 6 meses' : 'Top 6 del mes'}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => setChartIndex(0)} disabled={chartIndex === 0}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setChartIndex(1)} disabled={chartIndex === 1}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{ px: 1, pb: 1 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {chartIndex === 0 ? (
          hasEvolution ? (
            <Chart options={evolutionOptions} series={evolutionSeries} type="area" height={240} />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Sin datos suficientes en los últimos 6 meses.
              </Typography>
            </Box>
          )
        ) : hasCategories ? (
          <Chart options={categoriesOptions} series={categoriesSeries} type="bar" height={Math.max(220, 50 * categoriesData.length + 40)} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Sin categorías este mes.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dots indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, pb: 2 }}>
        {[0, 1].map((i) => (
          <Box
            key={i}
            onClick={() => setChartIndex(i)}
            sx={{
              width: chartIndex === i ? 20 : 6,
              height: 6,
              borderRadius: 999,
              bgcolor: chartIndex === i ? accent : alpha(theme.palette.text.disabled, 0.4),
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Card>
    </AnimatedItem>
  );
};

export default FinancesCharts;
