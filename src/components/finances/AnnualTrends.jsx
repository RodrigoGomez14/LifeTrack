import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Avatar,
  Typography,
  Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ReactApexChart from 'react-apexcharts';
import { formatAmount } from '../../utils';

const AnnualTrends = ({ monthlyTrendsData, dollarRate }) => {
  const theme = useTheme();

  // Totales anuales (suma de los 12 meses del año seleccionado)
  const annualExpenses = monthlyTrendsData.expenses.reduce((a, b) => a + b, 0);
  const annualIncomes = monthlyTrendsData.incomes.reduce((a, b) => a + b, 0);
  const annualBalance = annualIncomes - annualExpenses;

  // Configuración del gráfico de área (gastos / ingresos / balance por mes)
  const areaChartOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    markers: {
      size: 5,
      hover: { size: 7 }
    },
    xaxis: {
      categories: monthlyTrendsData.months,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => formatAmount(val),
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      y: { formatter: (val) => formatAmount(val) }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: theme.palette.text.secondary }
    },
    colors: [theme.palette.error.main, theme.palette.success.main, theme.palette.info.main]
  };

  const areaChartSeries = [
    { name: 'Gastos', data: monthlyTrendsData.expenses },
    { name: 'Ingresos', data: monthlyTrendsData.incomes },
    { name: 'Balance', data: monthlyTrendsData.balance }
  ];

  return (
    <Grid
      container
      item
      spacing={{ xs: 2, sm: 2 }}
      sx={{
        mb: { xs: 2, sm: 3 },
        mt: { xs: 2, sm: 1 },
        px: { xs: 0, sm: 0 },
        justifyContent: 'center'
      }}
    >
      <Grid item xs={12}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s ease',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
            },
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: 'white',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              >
                <InsightsIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Tendencias Anuales
              </Typography>
            </Stack>
          </Box>

          <CardContent sx={{ p: 3, position: 'relative' }}>
            {/* Gráfico de tendencias */}
            <Box sx={{ mb: 4 }}>
              <ReactApexChart
                options={areaChartOptions}
                series={areaChartSeries}
                type="area"
                height={350}
              />
            </Box>

            {/* Totales anuales integrados */}
            <Grid container spacing={3}>
              {/* Total Gastos */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main
                      }}
                    >
                      <TrendingDownIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      Total Gastos
                    </Typography>
                  </Stack>
                  <Typography variant="h4" color="error.main" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatAmount(annualExpenses)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    USD {formatAmount(annualExpenses / (dollarRate?.venta || 1), true)}
                  </Typography>
                </Box>
              </Grid>

              {/* Total Ingresos */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main
                      }}
                    >
                      <TrendingUpIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      Total Ingresos
                    </Typography>
                  </Stack>
                  <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatAmount(annualIncomes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    USD {formatAmount(annualIncomes / (dollarRate?.venta || 1), true)}
                  </Typography>
                </Box>
              </Grid>

              {/* Balance Anual */}
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main
                      }}
                    >
                      <CompareArrowsIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      Balance Anual
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h4"
                    color={annualBalance >= 0 ? "success.main" : "error.main"}
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    {formatAmount(annualBalance)}
                  </Typography>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: annualBalance >= 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {annualBalance >= 0
                      ? <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                      : <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                    }
                    <Typography
                      variant="caption"
                      color={annualBalance >= 0 ? "success.main" : "error.main"}
                      fontWeight="medium"
                    >
                      {annualBalance >= 0 ? 'Superávit' : 'Déficit'} anual
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AnnualTrends;
