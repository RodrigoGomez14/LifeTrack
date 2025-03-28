import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  IconButton, 
  Tooltip,
  Stack,
  Chip,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress,
  Badge,
  Tab,
  Tabs,
  alpha,
  ButtonBase,
  Zoom,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TextField,
  InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useTheme } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SpeedIcon from '@mui/icons-material/Speed';

const Home = () => {
  const { userData, dollarRate } = useStore(); 
  const [chartPeriod, setChartPeriod] = useState('anual'); // 'anual' o 'mensual'
  const [chartType, setChartType] = useState('mixed'); // 'mixed', 'bar', 'area', 'line'
  const [viewType, setViewType] = useState(0); // 0: General, 1: Ingresos, 2: Gastos
  const [dolarOficial, setDolarOficial] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);

  // Obtener el valor del dólar oficial
  useEffect(() => {
    const fetchDolarOficial = async () => {
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
        const data = await response.json();
        setDolarOficial(data.oficial);
      } catch (error) {
        console.error('Error al obtener el valor del dólar oficial:', error);
      }
    };
    
    fetchDolarOficial();
  }, []);

  // Funciones auxiliares para comprobar si existen los datos
  const getIncomeTotal = () => {
    if (!userData?.finances?.incomes?.[currentYear]?.months?.[currentMonth]) {
      return 0;
    }
    return userData.finances.incomes[currentYear].months[currentMonth].total;
  }

  const getExpenseTotal = () => {
    if (!userData?.finances?.expenses?.[currentYear]?.months?.[currentMonth]) {
      return 0;
    }
    
    // Si hay datos, pero necesitamos excluir las transacciones ocultas (pagos con tarjeta)
    const monthData = userData.finances.expenses[currentYear].months[currentMonth];
    
    // Si hay transacciones, filtrar las que están marcadas como ocultas (hiddenFromList)
    if (monthData.data && Array.isArray(monthData.data)) {
      const visibleData = monthData.data.filter(transaction => !transaction.hiddenFromList);
      return visibleData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    }
    
    // Si no hay datos detallados, usar el total
    return monthData.total || 0;
  }

  const getBalance = () => {
    return getIncomeTotal() - getExpenseTotal();
  }

  // Calcular porcentajes de cambio comparando con el mes anterior
  const getPreviousMonthData = () => {
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const previousIncome = userData?.finances?.incomes?.[previousYear]?.months?.[previousMonth]?.total || 0;
    const previousExpense = userData?.finances?.expenses?.[previousYear]?.months?.[previousMonth]?.total || 0;
    const previousBalance = previousIncome - previousExpense;
    
    return { previousIncome, previousExpense, previousBalance };
  }
  
  const { previousIncome, previousExpense, previousBalance } = getPreviousMonthData();
  
  const getPercentChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  }
  
  const incomeChange = getPercentChange(getIncomeTotal(), previousIncome);
  const expenseChange = getPercentChange(getExpenseTotal(), previousExpense);
  const balanceChange = previousBalance ? getPercentChange(getBalance(), previousBalance) : 0;

  // Calcular el presupuesto restante para el mes (basado en los ingresos y gastos)
  const getBudgetProgress = () => {
    const income = getIncomeTotal();
    const expense = getExpenseTotal();
    
    if (income <= 0) return 0;
    
    // Porcentaje de ingresos gastado
    const percentSpent = Math.min((expense / income) * 100, 100);
    
    return percentSpent;
  };

  // Calcular las principales categorías de gastos para este mes
  const getTopExpenseCategories = () => {
    const monthData = userData?.finances?.expenses?.[currentYear]?.months?.[currentMonth];
    
    if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
      return [];
    }
    
    // Filtrar transacciones ocultas y agrupar por categoría
    const categoryTotals = {};
    
    monthData.data.filter(tx => !tx.hiddenFromList).forEach(transaction => {
      const category = transaction.category || 'Sin categoría';
      categoryTotals[category] = (categoryTotals[category] || 0) + (transaction.amount || 0);
    });
    
    // Convertir a array y ordenar
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / getExpenseTotal()) * 100
      }));
  };

  // Generar datos para el gráfico de ingresos/gastos
  const generateChartData = () => {
    let incomes = [];
    let expenses = [];
    let balance = [];
    let labels = [];

    if (userData?.finances?.incomes || userData?.finances?.expenses) {
      if (chartPeriod === 'anual') {
        // Datos de los últimos 12 meses
        const fecha = new Date();
        const mesActual = fecha.getMonth();
        const anioActual = fecha.getFullYear();
        
        let auxIncomes = Array(12).fill(0);
        let auxExpenses = Array(12).fill(0);

        const mesesDesdeUltimoAnio = 12;
        let mesInicio = mesActual - mesesDesdeUltimoAnio;
        let anioInicio = anioActual;
        if (mesInicio < 0) {
            mesInicio += 12;
            anioInicio -= 1;
        }
        const initialDate = new Date();
        initialDate.setFullYear(anioInicio, mesInicio + 1, 1);

        // Procesar gastos
        if (userData?.finances?.expenses) {
          Object.keys(userData.finances.expenses).forEach(year => {
            Object.keys(userData.finances.expenses[year].months || {}).forEach(month => {
              const auxFecha = new Date();
              auxFecha.setFullYear(year, month - 1, 1);
              if (auxFecha >= initialDate && auxFecha <= fecha) {
                // Revisar si hay datos detallados para filtrar transacciones ocultas
                const monthData = userData.finances.expenses[year].months[month];
                if (monthData.data && Array.isArray(monthData.data)) {
                  // Filtrar transacciones ocultas (tarjetas de crédito)
                  const visibleData = monthData.data.filter(transaction => !transaction.hiddenFromList);
                  auxExpenses[month - 1] += visibleData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
                } else {
                  // Si no hay datos detallados, usar el total (aunque podría incluir ocultos)
                  auxExpenses[month - 1] += monthData.total;
                }
              }
            });
          });
        }

        // Procesar ingresos
        if (userData?.finances?.incomes) {
          Object.keys(userData.finances.incomes).forEach(year => {
            Object.keys(userData.finances.incomes[year].months || {}).forEach(month => {
              const auxFecha = new Date();
              auxFecha.setFullYear(year, month - 1, 1);
              if (auxFecha >= initialDate && auxFecha <= fecha) {
                auxIncomes[month - 1] += (userData.finances.incomes[year].months[month].total);
              }
            });
          });
        }

        const auxMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const arr1Meses = auxMeses.slice(mesInicio + 1);
        const arr2Meses = auxMeses.slice(0, mesInicio + 1);

        const arr1Incomes = auxIncomes.slice(mesInicio + 1);
        const arr2Incomes = auxIncomes.slice(0, mesInicio + 1);

        const arr1Expenses = auxExpenses.slice(mesInicio + 1);
        const arr2Expenses = auxExpenses.slice(0, mesInicio + 1);

        labels = [...arr1Meses, ...arr2Meses];
        incomes = [...arr1Incomes, ...arr2Incomes];
        expenses = [...arr1Expenses, ...arr2Expenses];
      } else {
        // Datos del mes actual por semana
        // Implementación futura para vista mensual por semanas
        labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        incomes = [0, 0, 0, 0];
        expenses = [0, 0, 0, 0];
      }

      // Calcular balance
      balance = incomes.map((income, i) => income - expenses[i]);
    }

    return { labels, incomes, expenses, balance };
  };

  const { labels, incomes, expenses, balance } = generateChartData();

  // Función para obtener el tipo de gráfico según la vista seleccionada
  const getChartType = () => {
    switch (chartType) {
      case 'bar': return 'bar';
      case 'area': return 'area';
      case 'line': return 'line';
      default: return 'area'; // Tipo mixed
    }
  };

  // Filtrar datos según la vista seleccionada
  const getFilteredChartData = () => {
    switch (viewType) {
      case 1: // Solo ingresos
        return [
          {
            name: 'Ingresos',
            type: chartType === 'mixed' ? 'area' : getChartType(),
            data: incomes
          }
        ];
      case 2: // Solo gastos
        return [
          {
            name: 'Gastos',
            type: chartType === 'mixed' ? 'area' : getChartType(),
            data: expenses
          }
        ];
      default: // Vista general (ingresos, gastos y balance)
        return [
          {
            name: 'Ingresos',
            type: chartType === 'mixed' ? 'area' : getChartType(),
            data: incomes
          },
          {
            name: 'Gastos',
            type: chartType === 'mixed' ? 'area' : getChartType(),
            data: expenses
          },
          {
            name: 'Balance',
            type: chartType === 'mixed' ? 'column' : getChartType(),
            data: balance
          }
        ];
    }
  };

  // Configuración del gráfico con ajustes mejorados
  const chartOptions = {
    chart: {
      height: 350,
      type: getChartType(),
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
      },
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 4,
        opacity: 0.15
      }
    },
    dataLabels: {
      enabled: false
        },
        stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round',
      dashArray: chartType === 'line' ? [0, 0, 5] : [0, 0, 0]
    },
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
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
                formatter: val => formatAmount(val),
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      y: {
        formatter: val => formatAmount(val)
      },
      theme: 'dark',
      x: {
        show: true
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary
      },
      fontSize: '13px',
      itemMargin: {
        horizontal: 10
      }
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 240
          },
          legend: {
            show: false
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4
      }
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.info.main]
  };

  // Nueva función para controlar el SpeedDial
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const handleOpenSpeedDial = () => setOpenSpeedDial(true);
  const handleCloseSpeedDial = () => setOpenSpeedDial(false);

  // Añadir estos estados al inicio del componente Home
  const [selectedRate, setSelectedRate] = useState(null);
  const [arsAmount, setArsAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');

  // Comprobación adicional para evitar errores si userData no está completamente cargado
  if (!userData || !userData.finances || !userData.savings) {
    return (
      <Layout title="Dashboard">
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="80vh"
          p={3}
          sx={{
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              mb: 3
            }}
          >
            <DashboardIcon 
              color="primary" 
              style={{ fontSize: 50, opacity: 0.7 }} 
            />
          </Box>
          <Typography variant="h5" color="primary" align="center" gutterBottom>
            Preparando tu dashboard financiero...
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
            Estamos cargando y analizando tus datos para brindarte la información financiera más actualizada.
          </Typography>
          <LinearProgress 
            sx={{ width: '60%', maxWidth: 300, borderRadius: 1, mb: 2 }} 
            color="primary"
          />
          <Typography variant="caption" color="textSecondary">
            Esto solo tomará unos segundos
          </Typography>
        </Box>
      </Layout>
    );
  }

  // Calcular el presupuesto y el progreso
  const budgetProgress = getBudgetProgress();
  const isOverBudget = budgetProgress > 100;
  const progressColor = isOverBudget ? theme.palette.error.main : 
                         budgetProgress > 80 ? theme.palette.warning.main : 
                         theme.palette.success.main;

  // Obtener las principales categorías de gastos
  const topExpenseCategories = getTopExpenseCategories();

  return (
    <Layout title="Home">
      
      {/* KPIs principales con diseño mejorado y mayor contraste */}
      <Grid container spacing={3} sx={{ mb: 4,mt:2 , mx: 2}}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              position: 'relative',
              transition: 'all 0.3s ease',
              borderRadius: 3,
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: getBalance() >= 0 
                ? `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="white" sx={{ mb: 0.5, fontWeight: 500, opacity: 0.9 }}>
                    Balance Mensual
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    color: 'white',
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(getBalance())}
                  </Typography>
                  
                  <Typography variant="body2" color="white" fontWeight="medium" sx={{ mt: 0.5, opacity: 0.9 }}>
                    USD {formatAmount(getBalance() / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    width: 48,
                    height: 48
                  }}
                >
                  <ShowChartIcon />
                </Avatar>
              </Box>
              
              <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={balanceChange >= 0 ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                  label={`${Math.abs(balanceChange).toFixed(1)}%`}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: 'medium',
                    borderRadius: 1,
                    '& .MuiChip-icon': {
                      color: 'inherit'
                    }
                  }}
                />
                <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                  vs. mes anterior
                </Typography>
              </Stack>
              
              {/* Barra de progreso del presupuesto con fondo más claro */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                    Presupuesto gastado
                  </Typography>
                  <Chip 
                    label={`${Math.round(budgetProgress)}%`}
                    size="small"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold', 
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white'
                    }} 
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(budgetProgress, 100)}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4, 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'rgba(255, 255, 255, 0.85)'
                    }
                  }}
                />
                <Typography variant="caption" color="white" sx={{ display: 'block', mt: 0.5, opacity: 0.9 }}>
                  {isOverBudget 
                    ? `Has excedido tu presupuesto mensual en ${formatAmount(getExpenseTotal() - getIncomeTotal())}`
                    : `Restante: ${formatAmount(getIncomeTotal() - getExpenseTotal())}`
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              position: 'relative',
              transition: 'all 0.3s ease',
              borderRadius: 3,
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="white" sx={{ mb: 0.5, fontWeight: 500, opacity: 0.9 }}>
                    Ingresos Mensuales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    color: 'white',
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(getIncomeTotal())}
                  </Typography>
                  
                  <Typography variant="body2" color="white" fontWeight="medium" sx={{ mt: 0.5, opacity: 0.9 }}>
                    USD {formatAmount(getIncomeTotal() / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    width: 48,
                    height: 48
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="white" fontWeight="medium" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  {incomeChange >= 0 ? (
                    <>
                      <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.abs(incomeChange).toFixed(1)}% más que el mes anterior
                    </>
                  ) : (
                    <>
                      <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.abs(incomeChange).toFixed(1)}% menos que el mes anterior
                    </>
                  )}
                </Typography>
                
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                      Mes anterior
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="white">
                      {formatAmount(previousIncome)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                      Mes actual
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="white">
                      {formatAmount(getIncomeTotal())}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
                </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              position: 'relative',
              transition: 'all 0.3s ease',
              borderRadius: 3,
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[10],
              },
              background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="white" sx={{ mb: 0.5, fontWeight: 500, opacity: 0.9 }}>
                    Gastos Mensuales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    color: 'white',
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(getExpenseTotal())}
                  </Typography>
                  
                  <Typography variant="body2" color="white" fontWeight="medium" sx={{ mt: 0.5, opacity: 0.9 }}>
                    USD {formatAmount(getExpenseTotal() / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    width: 48,
                    height: 48
                  }}
                >
                  <TrendingDownIcon />
                </Avatar>
              </Box>
              
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle2" color="white" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  {expenseChange <= 0 ? (
                    <>
                      <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.abs(expenseChange).toFixed(1)}% menos que el mes anterior
                    </>
                  ) : (
                    <>
                      <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.abs(expenseChange).toFixed(1)}% más que el mes anterior
                    </>
                  )}
                </Typography>
                
                {/* Principales categorías de gastos con colores más claros */}
                <Box sx={{ mt: 1.5 }}>
                  {topExpenseCategories.slice(0, 3).map((category, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                        <Typography variant="caption" color="white" noWrap sx={{ maxWidth: '70%', opacity: 0.9 }}>
                          {category.category}
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color="white">
                          {formatAmount(category.amount)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(category.percentage, 100)}
                        sx={{ 
                          height: 5, 
                          borderRadius: 4, 
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'rgba(255, 255, 255, 0.85)'
                          },
                          mb: 1
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Gráfico de evolución financiera a pantalla completa
          Ahora sin nada a sus costados, ocupando todo el ancho */}
      <Card 
        elevation={3} 
        sx={{ 
          mb: 4, 
          mx: 2,
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          width: '100%'
        }}
      >
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  <AutoGraphIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Evolución Financiera
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    {chartPeriod === 'anual' ? 'Últimos 12 meses' : 'Mes actual por semana'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                justifyContent="flex-end"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                {/* Selector de tipo vista */}
                <Tabs
                  value={viewType}
                  onChange={(e, newValue) => setViewType(newValue)}
                  textColor="inherit"
                  TabIndicatorProps={{
                    style: {
                      backgroundColor: 'white',
                    }
                  }}
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 40,
                      py: 1,
                      color: 'white',
                      opacity: 0.7,
                      '&.Mui-selected': {
                        color: 'white',
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Tab 
                    icon={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <DonutLargeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                          General
                        </Typography>
                      </Box>
                    }
                    sx={{ minWidth: { xs: 'auto', md: 100 } }}
                  />
                  <Tab 
                    icon={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                          Ingresos
                        </Typography>
                      </Box>
                    }
                    sx={{ minWidth: { xs: 'auto', md: 100 } }}
                  />
                  <Tab 
                    icon={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                          Gastos
                        </Typography>
                      </Box>
                    }
                    sx={{ minWidth: { xs: 'auto', md: 100 } }}
                  />
                </Tabs>
                
                {/* Selector de periodo */}
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    p: 0.5,
                    borderRadius: 2,
                    border: `1px solid rgba(255, 255, 255, 0.2)`
                  }}
                >
                  <Button 
                    size="small" 
                    variant={chartPeriod === 'anual' ? 'contained' : 'text'}
                    sx={{
                      color: 'white',
                      bgcolor: chartPeriod === 'anual' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': {
                        bgcolor: chartPeriod === 'anual' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    onClick={() => setChartPeriod('anual')}
                  >
                    Anual
                  </Button>
                  <Button 
                    size="small" 
                    variant={chartPeriod === 'mensual' ? 'contained' : 'text'}
                    sx={{
                      color: 'white',
                      bgcolor: chartPeriod === 'mensual' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': {
                        bgcolor: chartPeriod === 'mensual' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    onClick={() => setChartPeriod('mensual')}
                  >
                    Mensual
                  </Button>
                </Stack>
                
                {/* Selector de tipo de gráfico */}
                <Stack 
                  direction="row" 
                  spacing={0.5}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    p: 0.5,
                    borderRadius: 2,
                    border: `1px solid rgba(255, 255, 255, 0.2)`
                  }}
                >
                  <IconButton 
                    size="small" 
                    onClick={() => setChartType('mixed')}
                    sx={{ 
                      color: 'white',
                      bgcolor: chartType === 'mixed' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': { 
                        bgcolor: chartType === 'mixed' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' 
                      }
                    }}
                  >
                    <DonutLargeIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setChartType('bar')}
                    sx={{ 
                      color: 'white',
                      bgcolor: chartType === 'bar' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': { 
                        bgcolor: chartType === 'bar' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' 
                      }
                    }}
                  >
                    <BarChartIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setChartType('area')}
                    sx={{ 
                      color: 'white',
                      bgcolor: chartType === 'area' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': { 
                        bgcolor: chartType === 'area' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' 
                      }
                    }}
                  >
                    <AutoGraphIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setChartType('line')}
                    sx={{ 
                      color: 'white',
                      bgcolor: chartType === 'line' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': { 
                        bgcolor: chartType === 'line' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)' 
                      }
                    }}
                  >
                    <TimelineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
        </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ p: 3, pt: 4, bgcolor: 'background.paper' }}>
          <ReactApexChart 
            options={{
              ...chartOptions,
              colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.primary.main]
            }} 
            series={getFilteredChartData()} 
            type={getChartType()} 
            height={isMobile ? 350 : 450}
          />
        </Box>
          </Card>

      {/* Secciones inferiores en dos columnas */}
      <Grid container spacing={3} sx={{ mx: 2}}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={6}>
          {/* Cotización del dólar */}
          <Card 
            elevation={3} 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.1)}`
            }}
          >
            <CardHeader
              title={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main
                    }}
                  >
                    <AttachMoneyIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Cotización USD
                  </Typography>
                </Stack>
              }
              sx={{
                p: 2.5,
                pb: 1.5,
                bgcolor: theme.palette.warning.main,
                color: 'white',
                '& .MuiCardHeader-title': { m: 0 }
              }}
            />
            
            <CardContent sx={{ p: 3 }}>
              {(dollarRate || dolarOficial) && (
                <>
                  <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                    Dólar Blue
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <ButtonBase 
                        sx={{ 
                          width: '100%',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          // Aquí se actualizará el estado para usar esta cotización
                          setSelectedRate({
                            type: 'Blue Compra',
                            value: dollarRate?.compra || 0
                          });
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 2, 
                            width: '100%',
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Compra
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="success.dark">
                            $ {dollarRate?.compra || "-"}
                          </Typography>
                        </Box>
                      </ButtonBase>
        </Grid>
                    <Grid item xs={6}>
                      <ButtonBase 
                        sx={{ 
                          width: '100%',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          setSelectedRate({
                            type: 'Blue Venta',
                            value: dollarRate?.venta || 0
                          });
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 2, 
                            width: '100%',
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.15),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Venta
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="error.dark">
                            $ {dollarRate?.venta || "-"}
                          </Typography>
                        </Box>
                      </ButtonBase>
      </Grid>
        </Grid>
                  
                  <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                    Dólar Oficial
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <ButtonBase 
                        sx={{ 
                          width: '100%',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          setSelectedRate({
                            type: 'Oficial Compra',
                            value: dolarOficial?.value_buy || 0
                          });
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 2, 
                            width: '100%',
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.15),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Compra
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="info.dark">
                            $ {dolarOficial?.value_buy || "-"}
                          </Typography>
                        </Box>
                      </ButtonBase>
        </Grid>
                    <Grid item xs={6}>
                      <ButtonBase 
                        sx={{ 
                          width: '100%',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => {
                          setSelectedRate({
                            type: 'Oficial Venta',
                            value: dolarOficial?.value_sell || 0
                          });
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 2, 
                            width: '100%',
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.15),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Venta
                          </Typography>
                          <Typography variant="h5" fontWeight="bold" color="info.dark">
                            $ {dolarOficial?.value_sell || "-"}
                          </Typography>
                        </Box>
                      </ButtonBase>
        </Grid>
        </Grid>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2.5,
                      background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.5)}, ${alpha(theme.palette.background.paper, 0.8)})`,
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          width: 40,
                          height: 40
                        }}
                      >
                        <CurrencyExchangeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Convertidor Rápido
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedRate ? `Usando ${selectedRate.type} - $${selectedRate.value}` : 'Selecciona una cotización'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Pesos (ARS)"
                          value={arsAmount}
                          onChange={(e) => {
                            setArsAmount(e.target.value);
                            if (selectedRate && e.target.value) {
                              setUsdAmount((parseFloat(e.target.value) / selectedRate.value).toFixed(2));
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Dólares (USD)"
                          value={usdAmount}
                          onChange={(e) => {
                            setUsdAmount(e.target.value);
                            if (selectedRate && e.target.value) {
                              setArsAmount((parseFloat(e.target.value) * selectedRate.value).toFixed(2));
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                USD
                              </InputAdornment>
                            ),
                          }}
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
      </Grid>
                    </Grid>
                    
                    {!selectedRate && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 2,
                          fontStyle: 'italic'
                        }}
                      >
                        Haz clic en cualquier cotización para usar el convertidor
                      </Typography>
                    )}
                  </Paper>
                </>
              )}
              
              {!dollarRate && !dolarOficial && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay información disponible
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Columna derecha */}
        <Grid item xs={12} md={6}>
          {/* Resumen de ahorros */}
          <Card 
            elevation={3} 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.1)}`
            }}
          >
            <CardHeader
              title={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main
                    }}
                  >
                    <SavingsIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Resumen de Ahorros
                  </Typography>
                </Stack>
              }
              sx={{
                p: 2.5,
                pb: 1.5,
                bgcolor: theme.palette.success.main,
                color: 'white',
                '& .MuiCardHeader-title': { m: 0 }
              }}
            />
            
            <CardContent sx={{ p: 2.5 }}>
              {userData?.savings && (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2.5,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                      Total Ahorrado
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.dark">
                      {formatAmount(userData.savings.total || 0)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" sx={{ mb: 1.5 }}>
                    Distribución de ahorros
                  </Typography>
                  
                  <Box sx={{ mb: 2.5 }}>
                    {Object.entries(userData.savings.accounts || {}).map(([key, value], index) => {
                      // Asignar un color basado en el índice
                      const colors = [
                        { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main },
                        { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main },
                        { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main },
                        { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }
                      ];
                      const colorIndex = index % colors.length;
                      
                      // Calcular el porcentaje del total
                      const percentage = userData.savings.total ? (value / userData.savings.total) * 100 : 0;
                      
                      return (
                        <Box key={key} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {key}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatAmount(value)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                flexGrow: 1,
                                mr: 1,
                                bgcolor: colors[colorIndex].color
                              }}
                            />
                            <Typography variant="caption" fontWeight="bold" sx={{ width: 35 }}>
                              {Math.round(percentage)}%
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
              
              {!userData?.savings && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay información de ahorros disponible
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SpeedDial para acciones rápidas */}
      <SpeedDial
        ariaLabel="Acciones rápidas"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          '& .MuiFab-primary': {
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={handleCloseSpeedDial}
        onOpen={handleOpenSpeedDial}
        open={openSpeedDial}
        direction="up"
        FabProps={{
          sx: { 
            boxShadow: theme.shadows[8],
          }
        }}
      >
        <SpeedDialAction
          key="nuevo-gasto"
          icon={<TrendingDownIcon />}
          tooltipTitle="Nuevo Gasto"
          tooltipOpen={isMobile}
          onClick={() => {
            handleCloseSpeedDial();
            window.location.href = '/NuevoGasto';
          }}
          FabProps={{
            sx: { 
              bgcolor: theme.palette.error.main, 
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.error.dark
              }
            }
          }}
        />
        <SpeedDialAction
          key="nuevo-ingreso"
          icon={<TrendingUpIcon />}
          tooltipTitle="Nuevo Ingreso"
          tooltipOpen={isMobile}
          onClick={() => {
            handleCloseSpeedDial();
            window.location.href = '/NuevoIngreso';
          }}
          FabProps={{
            sx: { 
              bgcolor: theme.palette.success.main, 
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.success.dark
              }
            }
          }}
        />
      </SpeedDial>
    </Layout>
  );
};

export default Home;
