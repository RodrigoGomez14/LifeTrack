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
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ReactApexChart from 'react-apexcharts';
import { formatAmount } from '../../utils';

// Parser tolerante: acepta DD/MM/YYYY o ISO. Devuelve null si no parsea.
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        if (!isNaN(date.getTime())) return date;
      }
    }
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    if (!isNaN(date.getTime())) return date;
  } catch (e) {
    console.warn(`Error parsing date: ${dateStr}`, e);
  }
  return null;
};

// Construye las series de los últimos 12 meses (gastos, ingresos, balance) + labels.
// Para el mes/año en curso filtra hasta el día actual; meses pasados toman el total.
const buildLast12Months = (userData) => {
  if (!userData?.finances?.incomes && !userData?.finances?.expenses) {
    return { labels: [], incomes: [], expenses: [], balance: [] };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const auxIncomes = Array(12).fill(0);
  const auxExpenses = Array(12).fill(0);

  let mesInicio = now.getMonth() - 12;
  let anioInicio = now.getFullYear();
  if (mesInicio < 0) {
    mesInicio += 12;
    anioInicio -= 1;
  }
  const initialDate = new Date();
  initialDate.setFullYear(anioInicio, mesInicio + 1, 1);
  initialDate.setHours(0, 0, 0, 0);

  const fillSeries = (kind, target, includeFilters) => {
    const root = userData.finances?.[kind];
    if (!root) return;
    Object.keys(root).forEach((year) => {
      Object.keys(root[year].months || {}).forEach((month) => {
        const monthData = root[year].months[month];
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        monthDate.setHours(0, 0, 0, 0);
        const isCurrentPeriod = parseInt(year) === currentYear && parseInt(month) === currentMonth;

        if (monthData.data && Array.isArray(monthData.data) && monthDate >= initialDate && monthDate <= now) {
          const monthTotal = monthData.data
            .filter((transaction) => {
              if (!includeFilters(transaction)) return false;
              if (isCurrentPeriod) {
                const transactionDate = parseDate(transaction.date);
                return transactionDate && transactionDate <= now;
              }
              return true;
            })
            .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
          target[parseInt(month) - 1] = monthTotal;
        } else if (monthData.total && monthDate >= initialDate && monthDate <= now && !isCurrentPeriod) {
          target[parseInt(month) - 1] = monthData.total;
        }
      });
    });
  };

  fillSeries('expenses', auxExpenses, (t) => !t.hiddenFromList && !t.excludeFromTotal);
  fillSeries('incomes', auxIncomes, () => true);

  const auxMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const labels = [...auxMeses.slice(mesInicio + 1), ...auxMeses.slice(0, mesInicio + 1)];
  const incomes = [...auxIncomes.slice(mesInicio + 1), ...auxIncomes.slice(0, mesInicio + 1)];
  const expenses = [...auxExpenses.slice(mesInicio + 1), ...auxExpenses.slice(0, mesInicio + 1)];
  const balance = incomes.map((income, i) => income - expenses[i]);

  return { labels, incomes, expenses, balance };
};

const FinancialEvolutionChart = ({ userData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { labels, incomes, expenses, balance } = buildLast12Months(userData);

  const series = [
    { name: 'Ingresos', type: 'area', data: incomes },
    { name: 'Gastos', type: 'area', data: expenses },
    { name: 'Balance', type: 'column', data: balance },
  ];

  const options = {
    chart: {
      height: isMobile ? 300 : 450,
      type: 'area',
      toolbar: {
        show: !isMobile,
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
      categories: labels,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatAmount(value),
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => formatAmount(val) },
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
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: { height: 240 },
          legend: { show: false },
        },
      },
    ],
    plotOptions: {
      bar: { columnWidth: '50%', borderRadius: 4 },
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.primary.main],
  };

  return (
    <Card
      elevation={3}
      sx={{
        mt: { xs: 3, sm: 4 },
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
          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
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
            <AutoGraphIcon />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
              Evolución Financiera
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Últimos 12 meses
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2.5, sm: 3 }, bgcolor: 'background.paper' }}>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={isMobile ? 300 : 450}
        />
      </Box>
    </Card>
  );
};

export default FinancialEvolutionChart;
