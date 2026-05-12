import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Avatar,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ReactApexChart from 'react-apexcharts';
import { formatAmount, getMonthName } from '../../utils';

// Procesa el historial de ahorros: filtra los últimos 6 meses y devuelve
// las entradas ordenadas cronológicamente con su clave, fecha y newTotal.
const buildHistoryEntries = (history) => {
  if (!history) return [];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(new Date().getMonth() - 6);

  return Object.keys(history)
    .map((key) => {
      const dateStr = history[key].date;
      let entryDate;
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        entryDate = new Date(year, month - 1, day);
      } else {
        entryDate = new Date(key);
      }
      return {
        key,
        date: entryDate,
        rawDate: dateStr,
        total: history[key].newTotal,
      };
    })
    .filter((entry) => !isNaN(entry.date.getTime()) && entry.date >= sixMonthsAgo)
    .sort((a, b) => a.date - b.date);
};

const SavingsEvolutionCard = ({ userData, dollarRate }) => {
  const theme = useTheme();

  const historyEntries = buildHistoryEntries(userData?.savings?.amountARSHistory);
  const hasHistory = historyEntries.length > 0;

  // Etiquetas del eje X (formato "Mes/AA")
  const categories = historyEntries.map((entry) => {
    if (typeof entry.rawDate === 'string' && entry.rawDate.includes('/')) {
      const [, month, year] = entry.rawDate.split('/').map(Number);
      const monthName = getMonthName(month).substring(0, 3);
      return `${monthName}/${year.toString().slice(2)}`;
    }
    return entry.rawDate;
  });

  // Tooltip del eje X muestra fecha completa
  const tooltipFormatter = (value, { dataPointIndex }) => {
    const entry = historyEntries[dataPointIndex];
    if (!entry) return value;
    if (typeof entry.rawDate === 'string' && entry.rawDate.includes('/')) {
      const [day, month, year] = entry.rawDate.split('/').map(Number);
      return `${day} de ${getMonthName(month)} de ${year}`;
    }
    return entry.rawDate;
  };

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
              background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                Evolución Histórica de Ahorros
              </Typography>
            </Stack>
          </Box>

          <CardContent sx={{ p: 3, position: 'relative' }}>
            {/* Resumen de ahorros actuales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Ahorros en ARS */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    >
                      <MonetizationOnIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      Ahorros en ARS
                    </Typography>
                  </Stack>
                  {userData && userData.savings ? (
                    <>
                      <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ mb: 1 }}>
                        {formatAmount(userData.savings.amountARS || 0)}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Equivalente en USD
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                          <Typography
                            variant="caption"
                            fontWeight="medium"
                            color="primary.main"
                          >
                            {formatAmount((userData.savings.amountARS || 0) / (dollarRate?.venta || 1), true)}
                          </Typography>
                        </Box>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Ahorros en USD */}
              <Grid item xs={12} sm={6}>
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
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }}
                      >
                        <AttachMoneyIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" color="info.main">
                        Ahorros en USD
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      icon={<CurrencyExchangeIcon fontSize="small" />}
                      label={`$${dollarRate?.venta || '-'}`}
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontWeight: 'medium',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </Stack>
                  {userData && userData.savings ? (
                    <>
                      <Typography variant="h4" color="info.main" fontWeight="bold" sx={{ mb: 1 }}>
                        {formatAmount(userData.savings.amountUSD || 0, true)}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Valor en ARS
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="medium"
                            color="info.main"
                          >
                            {formatAmount((userData.savings.amountUSD || 0) * (dollarRate?.venta || 1))}
                          </Typography>
                        </Box>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Gráfico de evolución histórica (últimos 6 meses) */}
            {hasHistory ? (
              <ReactApexChart
                options={{
                  chart: {
                    type: 'area',
                    height: 250,
                    toolbar: { show: false },
                    fontFamily: theme.typography.fontFamily,
                  },
                  dataLabels: { enabled: false },
                  stroke: { curve: 'smooth', width: 3 },
                  xaxis: {
                    type: 'category',
                    categories,
                    labels: {
                      style: { colors: theme.palette.text.secondary },
                      rotate: 0
                    }
                  },
                  yaxis: {
                    labels: {
                      formatter: (value) => formatAmount(value),
                      style: { colors: theme.palette.text.secondary }
                    }
                  },
                  tooltip: {
                    x: { formatter: tooltipFormatter },
                    y: { formatter: (value) => formatAmount(value) },
                    theme: theme.palette.mode === 'dark' ? 'dark' : 'light'
                  },
                  grid: { borderColor: theme.palette.divider },
                  colors: [theme.palette.warning.main],
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
                    size: 4,
                    colors: [theme.palette.warning.main],
                    strokeWidth: 0
                  }
                }}
                series={[{
                  name: 'Saldo en ARS',
                  data: historyEntries.map((entry) => entry.total),
                }]}
                type="area"
                height={280}
              />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay datos históricos disponibles
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SavingsEvolutionCard;
