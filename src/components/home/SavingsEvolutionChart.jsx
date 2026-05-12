import React from 'react';
import {
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SavingsIcon from '@mui/icons-material/Savings';
import ReactApexChart from 'react-apexcharts';
import { formatAmount } from '../../utils';

// Convierte una fecha (DD/MM/YYYY o ISO) a string `YYYY-MM-DD`. Devuelve null si falla.
const toIsoDateKey = (dateString) => {
  try {
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
};

// Convierte un history `{ key: { date, newTotal } }` en una serie ordenada
// `[{ x: timestamp, y: amount }, ...]`, restringiendo al último año.
const buildHistorySeries = (history) => {
  if (!history) return [];

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const dailyBalances = {};
  Object.values(history).forEach((entry) => {
    if (!entry.date) return;
    const dateKey = toIsoDateKey(entry.date);
    if (!dateKey) return;
    const entryDate = new Date(dateKey);
    if (entryDate >= oneYearAgo) {
      dailyBalances[dateKey] = entry.newTotal || 0;
    }
  });

  return Object.entries(dailyBalances)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, amount]) => ({ x: new Date(date).getTime(), y: amount }));
};

const SavingsEvolutionChart = ({ userData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const arsSeries = buildHistorySeries(userData?.savings?.amountARSHistory);
  const usdSeries = buildHistorySeries(userData?.savings?.amountUSDHistory);
  const hasData = userData?.savings && (arsSeries.length > 0 || usdSeries.length > 0);

  const options = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.15,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round',
      dashArray: [0, 0, 0],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: { size: 7 },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: {
          text: 'Pesos (ARS)',
          style: { color: theme.palette.primary.main },
        },
        labels: {
          formatter: (value) => formatAmount(value),
          style: { colors: theme.palette.primary.main },
        },
      },
      {
        opposite: true,
        title: {
          text: 'Dólares (USD)',
          style: { color: theme.palette.info.main },
        },
        labels: {
          formatter: (value) => formatAmount(value, true),
          style: { colors: theme.palette.info.main },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        show: true,
        formatter: (timestamp) => {
          if (!timestamp) return '';
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) return '';
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        },
      },
      y: {
        formatter: (val, { seriesIndex }) =>
          seriesIndex === 1 ? formatAmount(val, true) : formatAmount(val),
      },
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: theme.typography.fontFamily },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 5,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    legend: {
      position: isMobile ? 'bottom' : 'top',
      horizontalAlign: isMobile ? 'center' : 'right',
      labels: { colors: theme.palette.text.secondary },
      fontSize: '13px',
      itemMargin: { horizontal: 10 },
    },
    colors: [theme.palette.primary.main, theme.palette.info.main],
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { height: 240 },
          legend: { show: false },
        },
      },
    ],
  };

  const series = [
    { name: 'Ahorros en ARS', type: 'area', data: arsSeries },
    { name: 'Ahorros en USD', type: 'area', data: usdSeries },
  ];

  return (
    <Card
      elevation={3}
      sx={{
        mb: { xs: 2, sm: 3 },
        borderRadius: { xs: 2, sm: 3 },
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-5px)' },
          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 }
            }}
          >
            <SavingsIcon />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
              Evolución de Ahorros
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Historial de ahorros en ARS y USD
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2.5, sm: 3 }, bgcolor: 'background.paper' }}>
        {hasData ? (
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={isMobile ? 300 : 450}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SavingsIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay datos de ahorros disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Cuando registres ahorros, podrás visualizar aquí la evolución y análisis detallado de tu patrimonio.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SavingsEvolutionChart;
