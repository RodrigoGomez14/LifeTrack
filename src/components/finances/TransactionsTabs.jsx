import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  Tabs,
  Tab,
  Card,
  CardHeader,
  Paper,
  Box,
  Divider,
  Chip,
  Button,
  Stack,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { formatAmount, getMonthName, sumTransactionsByCategory } from '../../utils';
import TransactionsTabsList from './TransactionsTabsList';
import ReactApexChart from 'react-apexcharts';
import { useStore } from '../../store'; 
import { useTheme } from '@mui/material/styles';

const TransactionsTabs = ({ data, type }) => {
  const [tabValue, setTabValue] = useState(0);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Comprobación para asegurar que el año actual existe en los datos
  const [yearTabValue, setYearTabValue] = useState(
    Object.keys(data).includes(currentYear.toString()) 
      ? currentYear 
      : Object.keys(data).length > 0 
        ? parseInt(Object.keys(data)[0]) 
        : currentYear
  );
  
  const {dollarRate} = useStore();

  const handleTransactionTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleYearTabChange = (event, newValue) => {
    setYearTabValue(newValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const categories = type === 'expenses' 
    ? ['Auto', 'Servicios', 'Indoor', 'Supermercado', 'Transporte', 'Extras', 'Exchange']
    : ['Sueldo', 'Freelance', 'Camila', 'Extras', 'Exchange'];

  // Comprobar si existen los datos necesarios para el gráfico de pie
  const hasCurrentMonthData = data && 
    data[currentYear] && 
    data[currentYear].months && 
    data[currentYear].months[currentMonth] && 
    data[currentYear].months[currentMonth].data;

  let seriesPieChart = [];
  let labelsPieChart = [];
  
  // Ordenar categorías por monto para un mejor análisis visual
  if (hasCurrentMonthData) {
    const categoriesWithValues = categories.map(category => {
      const total = sumTransactionsByCategory(data[currentYear].months[currentMonth].data, category);
      return { category, total };
    }).filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
    
    seriesPieChart = categoriesWithValues.map(item => item.total);
    labelsPieChart = categoriesWithValues.map(item => item.category);
  }

  // Preparar datos para el gráfico anual por categoría
  const getCategoryDataByMonth = (category) => {
    const monthlySeries = Array(12).fill(0);
    
    if (data[yearTabValue]?.months) {
      Object.keys(data[yearTabValue].months).forEach(month => {
        if (data[yearTabValue].months[month]?.data) {
          monthlySeries[parseInt(month) - 1] = sumTransactionsByCategory(
            data[yearTabValue].months[month].data, 
            category
          );
        }
      });
    }
    
    return monthlySeries;
  };
  
  // Generar series por categoría para mostrar en el gráfico anual
  const categorySeries = categories
    .filter(category => {
      const categoryData = getCategoryDataByMonth(category);
      return categoryData.some(value => value > 0);
    })
    .map(category => ({
      name: category,
      data: getCategoryDataByMonth(category)
    }));
  
  // Configuración para el gráfico de categorías por mes
  const categoryChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        formatter: val => formatAmount(val),
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      y: {
        formatter: val => formatAmount(val)
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    grid: {
      borderColor: theme.palette.divider,
    }
  };

  // Configuración para el gráfico de pie
  const optionsPieChart = {
    labels: labelsPieChart,
    legend: {
      position: 'bottom',
      fontSize: '14px',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    tooltip: {
      y: {
        formatter: val => formatAmount(val)
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: type === 'incomes' ? 'Ingresos' : 'Gastos',
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatAmount(sum);
              }
            }
          }
        }
      }
    },
    chart: {
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    dataLabels: {
      formatter: (val, opts) => {
        return `${Math.round(val)}% - ${formatAmount(opts.w.globals.series[opts.seriesIndex])}`;
      }
    },
    colors: [
      '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#3f51b5', 
      '#009688', '#e91e63', '#673ab7', '#ffc107', '#795548', '#607d8b'
    ]
  };

  // Si no hay datos, mostrar un mensaje amigable
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="300px"
        p={3}
      >
        <AnalyticsIcon 
          color="disabled" 
          style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} 
        />
        <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
          No hay datos disponibles para mostrar
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Los datos de {type === 'incomes' ? 'ingresos' : 'gastos'} aparecerán aquí una vez que los registres.
        </Typography>
      </Box>
    );
  }

  // Renderizar el resumen mensual completo
  const renderMonthSummary = () => {
    if (!hasCurrentMonthData) return null;
    
    return (
      <Card elevation={4} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center">
              <Box 
                sx={{ 
                  mr: 1.5, 
                  display: 'flex',
                  p: 1,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.primary.main}15`,
                }}
              >
                {type === 'incomes' ? 
                  <TrendingUpIcon color="primary" /> : 
                  <TrendingDownIcon color="error" />
                }
              </Box>
              <Typography variant="h6">
                {type === 'incomes' ? 'Resumen de Ingresos' : 'Resumen de Gastos'} - {getMonthName(currentMonth)} {currentYear}
              </Typography>
            </Box>
          }
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                size="small" 
                variant={viewMode === 'chart' ? 'contained' : 'outlined'} 
                onClick={() => handleViewModeChange('chart')}
                startIcon={<AnalyticsIcon />}
                color="primary"
              >
                Gráfico
              </Button>
              <Button 
                size="small" 
                variant={viewMode === 'table' ? 'contained' : 'outlined'} 
                onClick={() => handleViewModeChange('table')}
                startIcon={<FilterListIcon />}
                color="primary"
              >
                Detalles
              </Button>
            </Stack>
          }
        />
        <Divider />
        
        <Box p={3}>
          <Grid container spacing={3}>
            {viewMode === 'chart' ? (
              <>
                {/* Vista de gráfico */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Distribución por Categoría
                  </Typography>
                  <Box sx={{ height: 380, mt: 1 }}>
                    {seriesPieChart.length > 0 ? (
                      <ReactApexChart
                        options={{
                          ...optionsPieChart,
                          chart: {
                            ...optionsPieChart.chart,
                            type: 'donut'
                          }
                        }}
                        series={seriesPieChart}
                        type="donut"
                        height={350}
                      />
                    ) : (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        opacity: 0.7
                      }}>
                        <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="textSecondary" align="center">
                          No hay datos por categoría para mostrar en este período
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Distribución Anual por Categoría - {yearTabValue}
                  </Typography>
                  <Box sx={{ height: 380, mt: 1 }}>
                    {categorySeries.length > 0 ? (
                      <ReactApexChart
                        options={categoryChartOptions}
                        series={categorySeries}
                        type="bar"
                        height={350}
                      />
                    ) : (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexDirection: 'column',
                        opacity: 0.7
                      }}>
                        <DateRangeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="textSecondary" align="center">
                          No hay datos anuales para mostrar
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                {/* Resumen por categoría en formato Card */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
                    Resumen por Categoría
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {categories.map(category => {
                      const categoryTotal = hasCurrentMonthData 
                        ? sumTransactionsByCategory(data[currentYear].months[currentMonth].data, category) 
                        : 0;
                        
                      if (categoryTotal <= 0) return null;
                      
                      const percentage = hasCurrentMonthData 
                        ? (categoryTotal / data[currentYear].months[currentMonth].total) * 100 
                        : 0;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={category}>
                          <Paper 
                            elevation={2} 
                            sx={{ 
                              p: 2, 
                              height: '100%', 
                              borderLeft: `4px solid ${theme.palette.primary.main}`,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: theme.shadows[4]
                              }
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Typography variant="body2" color="textSecondary">
                                {category}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={`${percentage.toFixed(1)}%`} 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                              {formatAmount(categoryTotal)}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              </>
            ) : (
              // Vista de tabla/detalles
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                      value={yearTabValue}
                      onChange={handleYearTabChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ 
                        mb: 2,
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          fontWeight: 'medium',
                          minWidth: 'auto',
                          px: 2
                        }
                      }}
                    >
                      {Object.keys(data).reverse().map(year => (
                        <Tab 
                          key={year}
                          value={parseInt(year)}
                          label={
                            <Box display="flex" alignItems="center">
                              <Typography>{year}</Typography>
                              <Chip 
                                size="small" 
                                label={formatAmount(data[year].total)} 
                                color="primary" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                        />
                      ))}
                    </Tabs>
                  </Box>
                  
                  {Object.keys(data).map(year => (
                    yearTabValue === parseInt(year) && (
                      <Box key={year} mt={2}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          {year} - Total: {formatAmount(data[year].total)} 
                          <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                            (USD {formatAmount(data[year].totalUSD)})
                          </Typography>
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          {data[year].months && Object.keys(data[year].months)
                            .sort((a, b) => parseInt(b) - parseInt(a))
                            .map(month => (
                              data[year].months[month] && 
                              data[year].months[month].data && 
                              data[year].months[month].data.length > 0 && (
                                <Accordion 
                                  key={month} 
                                  elevation={2}
                                  sx={{ 
                                    mb: 2,
                                    borderRadius: '8px',
                                    '&::before': {
                                      display: 'none',
                                    },
                                    '&:first-of-type': {
                                      borderTopLeftRadius: '8px',
                                      borderTopRightRadius: '8px',
                                    },
                                    '&:last-of-type': {
                                      borderBottomLeftRadius: '8px',
                                      borderBottomRightRadius: '8px',
                                    },
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                      backgroundColor: type === 'incomes' 
                                        ? `${theme.palette.success.main}15`
                                        : `${theme.palette.error.main}15`,
                                      borderTopLeftRadius: '8px',
                                      borderTopRightRadius: '8px',
                                      borderLeft: `4px solid ${type === 'incomes' 
                                        ? theme.palette.success.main
                                        : theme.palette.error.main}`
                                    }}
                                  >
                                    <Box width="100%">
                                      <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography fontWeight="bold">
                                          {getMonthName(month)} {year}
                                        </Typography>
                                        <Box>
                                          <Typography component="span" fontWeight="bold">
                                            {formatAmount(data[year].months[month].total)}
                                          </Typography>
                                          <Typography 
                                            component="span" 
                                            variant="body2" 
                                            color="textSecondary"
                                            sx={{ ml: 1 }}
                                          >
                                            (USD {formatAmount(data[year].months[month].totalUSD)})
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </AccordionSummary>
                                  
                                  <AccordionDetails sx={{ p: 0 }}>
                                    <Tabs
                                      value={tabValue}
                                      onChange={handleTransactionTabChange}
                                      variant="scrollable"
                                      scrollButtons="auto"
                                      sx={{ 
                                        borderBottom: 1, 
                                        borderColor: 'divider',
                                        bgcolor: theme.palette.background.default,
                                        '& .MuiTab-root': {
                                          textTransform: 'none',
                                          py: 1.5,
                                          fontWeight: 'medium'
                                        }
                                      }}
                                    >
                                      {categories.map((category, index) => {
                                        const categoryTotal = sumTransactionsByCategory(
                                          data[year].months[month].data, 
                                          category
                                        );
                                        
                                        if (categoryTotal <= 0) return null;
                                        
                                        return (
                                          <Tab 
                                            key={index}
                                            value={index}
                                            label={
                                              <Box display="flex" alignItems="center">
                                                <Typography>{category}</Typography>
                                                <Chip 
                                                  size="small" 
                                                  label={formatAmount(categoryTotal)} 
                                                  color="primary" 
                                                  variant="outlined"
                                                  sx={{ ml: 1 }}
                                                />
                                              </Box>
                                            }
                                          />
                                        );
                                      })}
                                    </Tabs>
                                    
                                    {categories.map((category, index) => (
                                      <Box
                                        key={index}
                                        role="tabpanel"
                                        hidden={tabValue !== index}
                                        id={`expense-tabpanel-${index}`}
                                        aria-labelledby={`expense-tab-${index}`}
                                        sx={{ p: 2 }}
                                      >
                                        {tabValue === index && (
                                          sumTransactionsByCategory(data[year].months[month].data, category) > 0 ? (
                                            <TransactionsTabsList data={data[year].months[month].data} category={category} />
                                          ) : (
                                            <Typography color="textSecondary" align="center" py={2}>
                                              No hay transacciones en esta categoría.
                                            </Typography>
                                          )
                                        )}
                                      </Box>
                                    ))}
                                  </AccordionDetails>
                                </Accordion>
                              )
                            ))}
                        </Box>
                      </Box>
                    )
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header con información básica */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Valor del dólar */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ 
            p: 2, 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.info.main}`,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.shadows[4]
            } 
          }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Valor USD
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {dollarRate && dollarRate['venta'] ? formatAmount(dollarRate['venta']) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Total mes actual */}
        {hasCurrentMonthData && (
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ 
              p: 2, 
              height: '100%',
              borderLeft: `4px solid ${type === 'incomes' ? theme.palette.success.main : theme.palette.error.main}`,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: theme.shadows[4]
              } 
            }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {type === 'incomes' ? 'Ingresos' : 'Gastos'} de {getMonthName(currentMonth)}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatAmount(data[currentYear].months[currentMonth].total)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                USD {formatAmount(data[currentYear].months[currentMonth].totalUSD)}
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {/* Total anual */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ 
            p: 2, 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.warning.main}`,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.shadows[4]
            } 
          }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {type === 'incomes' ? 'Ingresos' : 'Gastos'} de {currentYear}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {data[currentYear] ? formatAmount(data[currentYear].total) : 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              USD {data[currentYear] ? formatAmount(data[currentYear].totalUSD) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Promedio mensual */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ 
            p: 2, 
            height: '100%',
            borderLeft: `4px solid ${theme.palette.secondary.main}`,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.shadows[4]
            }  
          }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Promedio Mensual ({currentYear})
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {data[currentYear] ? formatAmount(data[currentYear].total / 12) : 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              USD {data[currentYear] ? formatAmount(data[currentYear].totalUSD / 12) : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Contenido principal */}
      {renderMonthSummary()}
    </Box>
  );
};

export default TransactionsTabs;