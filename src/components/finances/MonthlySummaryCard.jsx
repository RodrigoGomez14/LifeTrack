import React from 'react';
import {
  Box,
  Card,
  Paper,
  Stack,
  Typography,
  Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import PieChartIcon from '@mui/icons-material/PieChart';
import CategoryIcon from '@mui/icons-material/Category';
import ReactApexChart from 'react-apexcharts';
import { formatAmount, getMonthName } from '../../utils';
import { getCategoryIcon, getCategoryColor } from './financesHelpers';

const MonthlySummaryCard = ({ monthlyData, dataType, selectedYear, selectedMonth }) => {
  const theme = useTheme();

  // Estado vacío: no hay datos para el mes seleccionado
  if (!monthlyData) {
    return (
      <Card sx={{
        p: 4,
        textAlign: 'center',
        height: '100%',
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 4 }}>
          <Box
            sx={{
              bgcolor: dataType === 'expenses'
                ? `${theme.palette.error.light}50`
                : `${theme.palette.success.light}50`,
              borderRadius: '50%',
              p: 2,
              mb: 2
            }}
          >
            {dataType === 'expenses'
              ? <TrendingDownIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
              : <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
            }
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No hay datos para {getMonthName(selectedMonth)} {selectedYear}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '300px', mx: 'auto', mt: 1 }}>
            No hay registros de {dataType === 'expenses' ? 'gastos' : 'ingresos'} para este período.
            Selecciona otro período o agrega nuevas transacciones.
          </Typography>
        </Box>
      </Card>
    );
  }

  // Top 3 + "Otras" para el pie chart
  const preparePieChartData = () => {
    if (!monthlyData.sortedCategories || monthlyData.sortedCategories.length === 0) {
      return { series: [], labels: [], colors: [] };
    }

    const top3Categories = monthlyData.sortedCategories.slice(0, 3);
    const otherCategories = monthlyData.sortedCategories.slice(3);

    const pieData = [];
    const pieLabels = [];
    const pieColors = [];

    top3Categories.forEach(([category, data]) => {
      pieData.push(data.total);
      pieLabels.push(category);
      pieColors.push(getCategoryColor(category, theme, dataType));
    });

    if (otherCategories.length > 0) {
      const otherTotal = otherCategories.reduce((sum, [, data]) => sum + data.total, 0);
      pieData.push(otherTotal);
      pieLabels.push('Otras');
      pieColors.push(theme.palette.grey[500]);
    }

    return { series: pieData, labels: pieLabels, colors: pieColors };
  };

  const pieChartData = preparePieChartData();

  const pieOptions = {
    chart: {
      type: 'pie',
      fontFamily: theme.typography.fontFamily,
      foreColor: theme.palette.text.secondary,
      toolbar: { show: false }
    },
    labels: pieChartData.labels,
    colors: pieChartData.colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (value) => formatAmount(value)
      }
    },
    stroke: { width: 1 },
    plotOptions: {
      pie: {
        donut: { size: '0%' }
      }
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card
        elevation={1}
        sx={{
          mb: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          borderRadius: 2,
          position: 'relative',
          mt: 1,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: dataType === 'expenses'
              ? `linear-gradient(45deg, ${theme.palette.error.main} 30%, ${theme.palette.error.dark} 90%)`
              : `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
            zIndex: 0
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
          {/* Fila superior: Total y Distribución */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}>
                    {dataType === 'expenses'
                      ? <TrendingDownIcon sx={{ fontSize: 24 }} />
                      : <TrendingUpIcon sx={{ fontSize: 24 }} />
                    }
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {dataType === 'expenses' ? 'Resumen de Gastos' : 'Resumen de Ingresos'}
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                  {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
              </Box>

              <Paper elevation={5} sx={{
                p: 3,
                borderRadius: 2,
                mt: 1,
                bgcolor: theme.palette.background.paper,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                }
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{
                    bgcolor: dataType === 'expenses' ? theme.palette.error.light : theme.palette.success.light,
                    color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main,
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {dataType === 'expenses'
                      ? <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
                      : <SavingsIcon sx={{ fontSize: 40 }} />
                    }
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography
                      variant="h3"
                      color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                      fontWeight="bold"
                      sx={{ lineHeight: 1.1 }}
                    >
                      {monthlyData.formattedTotal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      USD {monthlyData.formattedTotalUSD}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pt: { xs: 2, md: 0 }
              }}>
                <Card
                  elevation={5}
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PieChartIcon sx={{
                      color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main
                    }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Distribución
                    </Typography>
                  </Stack>

                  {pieChartData.series.length > 0 ? (
                    <Box>
                      <ReactApexChart
                        options={pieOptions}
                        series={pieChartData.series}
                        type="pie"
                        height={200}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No hay categorías registradas para este mes
                    </Typography>
                  )}
                </Card>
              </Box>
            </Grid>
          </Grid>

          {/* Fila inferior: Top Categorías */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                elevation={5}
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <CategoryIcon sx={{
                    color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main
                  }} />
                  <Typography variant="h6" fontWeight="medium">
                    Top Categorías
                  </Typography>
                </Stack>

                {monthlyData.sortedCategories && monthlyData.sortedCategories.length > 0 ? (
                  <Stack>
                    {monthlyData.sortedCategories.slice(0, 3).map(([category, data], index) => {
                      const categoryColor = getCategoryColor(category, theme, dataType);

                      return (
                        <Box
                          key={index}
                          sx={{
                            py: 1.5,
                            transition: 'all 0.2s ease',
                            width: '100%'
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: categoryColor,
                                  color: 'white',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {React.cloneElement(getCategoryIcon(category), { fontSize: 'small' })}
                              </Box>
                              <Typography variant="body2" fontWeight="medium" sx={{ color: categoryColor }}>
                                {category}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color={categoryColor}
                            >
                              {formatAmount(data.total)}
                            </Typography>
                          </Stack>
                          <Box sx={{ width: '100%', bgcolor: alpha(categoryColor, 0.2), borderRadius: 1, height: 6, mb: 0.5 }}>
                            <Box
                              sx={{
                                width: `${Math.min(data.percentage, 100)}%`,
                                bgcolor: categoryColor,
                                height: 6,
                                borderRadius: 1
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                            {data.percentage.toFixed(1)}% del total
                          </Typography>
                        </Box>
                      );
                    })}

                    {monthlyData.sortedCategories.length > 3 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        + {monthlyData.sortedCategories.length - 3} categorías más
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay categorías registradas para este mes
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default MonthlySummaryCard;
