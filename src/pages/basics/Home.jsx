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
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
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
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CommuteIcon from '@mui/icons-material/Commute';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkIcon from '@mui/icons-material/Work';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CategoryIcon from '@mui/icons-material/Category';
import LaptopIcon from '@mui/icons-material/Laptop';
import PeopleIcon from '@mui/icons-material/People';

const Home = () => {
  const { userData, dollarRate } = useStore(); 
  // Using fixed chart configuration for simplified view
  const [dolarOficial, setDolarOficial] = useState(null);
  const [dolarBlue, setDolarBlue] = useState(null);
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
        setDolarBlue(data.blue); // Guardamos también los datos del dólar blue
      } catch (error) {
        console.error('Error al obtener el valor del dólar oficial:', error);
      }
    };
    
    fetchDolarOficial();
  }, []);

  // Función auxiliar para parsear fechas con flexibilidad
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    
    try {
      // Intentar formato DD/MM/YYYY
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month - 1, day);
          // Resetear la hora para comparar solo la fecha
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) return date;
        }
      }
      
      // Intentar otros formatos estándar
      const date = new Date(dateStr);
      // Resetear la hora para comparar solo la fecha
      date.setHours(0, 0, 0, 0);
      if (!isNaN(date.getTime())) return date;

    } catch (e) {
      console.warn(`Error parsing date: ${dateStr}`, e);
    }
    
    return null; // Devolver null si no se pudo parsear
  };

  // Funciones auxiliares para comprobar si existen los datos
  const getIncomeTotal = () => {
    const monthData = userData?.finances?.incomes?.[currentYear]?.months?.[currentMonth];
    if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
      return 0;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurar comparación solo por fecha

    return monthData.data
      .filter(transaction => {
        const transactionDate = parseDate(transaction.date);
        return transactionDate && transactionDate <= today;
      })
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  }

  const getExpenseTotal = () => {
    const monthData = userData?.finances?.expenses?.[currentYear]?.months?.[currentMonth];
    if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
      return 0;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurar comparación solo por fecha

    return monthData.data
      .filter(transaction => {
        if (transaction.hiddenFromList) return false; // Excluir transacciones ocultas
        if (transaction.excludeFromTotal) return false; // Excluir gastos con tarjeta de crédito
        const transactionDate = parseDate(transaction.date);
        return transactionDate && transactionDate <= today;
      })
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  }

  const getBalance = () => {
    return getIncomeTotal() - getExpenseTotal();
  }

  // Calcular porcentajes de cambio comparando con el mes anterior
  const getPreviousMonthData = () => {
    const today = new Date();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Obtener el último día del mes anterior para comparar con la fecha actual
    const currentDay = today.getDate();
    
    // Crear una fecha que represente "hoy pero del mes anterior" para mostrar en la UI
    const firstDayLastMonth = new Date(previousYear, previousMonth - 1, 1);
    const lastMonthToday = new Date(today);
    if (currentMonth === 1) {
      lastMonthToday.setFullYear(previousYear);
    }
    lastMonthToday.setMonth(previousMonth - 1); // Restar 1 porque los meses en JS son 0-indexed
    
    // Ajustar la fecha si el día actual es mayor al último día del mes anterior
    const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
    if (currentDay > lastDayOfPreviousMonth) {
      lastMonthToday.setDate(lastDayOfPreviousMonth);
    }
    
    // Formatear las fechas para mostrar en la UI
    const formatDateShort = (date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };
    
    const comparisonDateRange = `${formatDateShort(firstDayLastMonth)} - ${formatDateShort(lastMonthToday)}`;
    
    // Función para obtener ingresos hasta la fecha actual pero del mes anterior
    const getPreviousMonthIncomeTotal = () => {
      const monthData = userData?.finances?.incomes?.[previousYear]?.months?.[previousMonth];
      if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
        return 0;
      }
      
      // Crear una fecha que represente "hoy pero del mes anterior"
      const lastMonthToday = new Date(today);
      if (currentMonth === 1) {
        lastMonthToday.setFullYear(previousYear);
      }
      lastMonthToday.setMonth(previousMonth - 1); // Restar 1 porque los meses en JS son 0-indexed
      
      // Ajustar la fecha si el día actual es mayor al último día del mes anterior
      const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
      if (currentDay > lastDayOfPreviousMonth) {
        lastMonthToday.setDate(lastDayOfPreviousMonth);
      }
      
      return monthData.data
        .filter(transaction => {
          const transactionDate = parseDate(transaction.date);
          return transactionDate && transactionDate <= lastMonthToday;
        })
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    };
    
    // Función para obtener gastos hasta la fecha actual pero del mes anterior
    const getPreviousMonthExpenseTotal = () => {
      const monthData = userData?.finances?.expenses?.[previousYear]?.months?.[previousMonth];
      if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
        return 0;
      }
      
      // Crear una fecha que represente "hoy pero del mes anterior"
      const lastMonthToday = new Date(today);
      if (currentMonth === 1) {
        lastMonthToday.setFullYear(previousYear);
      }
      lastMonthToday.setMonth(previousMonth - 1); // Restar 1 porque los meses en JS son 0-indexed
      
      // Ajustar la fecha si el día actual es mayor al último día del mes anterior
      const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
      if (currentDay > lastDayOfPreviousMonth) {
        lastMonthToday.setDate(lastDayOfPreviousMonth);
      }
      
      return monthData.data
        .filter(transaction => {
          if (transaction.hiddenFromList) return false;
          if (transaction.excludeFromTotal) return false;
          const transactionDate = parseDate(transaction.date);
          return transactionDate && transactionDate <= lastMonthToday;
        })
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
    };
    
    // Calcular totales del mes anterior hasta la fecha equivalente actual
    const previousIncome = getPreviousMonthIncomeTotal();
    const previousExpense = getPreviousMonthExpenseTotal();
    const previousBalance = previousIncome - previousExpense;
    
    return { previousIncome, previousExpense, previousBalance, comparisonDateRange };
  }
  
  const { previousIncome, previousExpense, previousBalance, comparisonDateRange } = getPreviousMonthData();
  
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurar comparación solo por fecha

    // Filtrar transacciones ocultas, por fecha y agrupar por categoría
    const categoryTotals = {};
    const currentExpenseTotal = getExpenseTotal(); // Usar el total ya filtrado por fecha
    
    monthData.data
      .filter(tx => {
        if (tx.hiddenFromList) return false;
        if (tx.excludeFromTotal) return false; // Excluir gastos con tarjeta de crédito
        const transactionDate = parseDate(tx.date);
        return transactionDate && transactionDate <= today;
      })
      .forEach(transaction => {
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
        percentage: currentExpenseTotal > 0 ? (amount / currentExpenseTotal) * 100 : 0 // Evitar división por cero
      }));
  };

  // Calcular las principales categorías de ingresos para este mes
  const getTopIncomeCategories = () => {
    const monthData = userData?.finances?.incomes?.[currentYear]?.months?.[currentMonth];
    
    if (!monthData || !monthData.data || !Array.isArray(monthData.data)) {
      return [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Asegurar comparación solo por fecha

    // Filtrar por fecha y agrupar por categoría
    const categoryTotals = {};
    const currentIncomeTotal = getIncomeTotal(); // Usar el total ya filtrado por fecha
    
    monthData.data
      .filter(tx => {
        const transactionDate = parseDate(tx.date);
        return transactionDate && transactionDate <= today;
      })
      .forEach(transaction => {
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
        percentage: currentIncomeTotal > 0 ? (amount / currentIncomeTotal) * 100 : 0 // Evitar división por cero
      }));
  };

  // Generar datos para el gráfico de ingresos/gastos - vista anual (últimos 12 meses)
  const generateChartData = () => {
    let incomes = [];
    let expenses = [];
    let balance = [];
    let labels = [];

    if (userData?.finances?.incomes || userData?.finances?.expenses) {
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
            const monthData = userData.finances.expenses[year].months[month];
            const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            monthDate.setHours(0,0,0,0); // Normalizar fecha del mes
            fecha.setHours(0,0,0,0); // Normalizar fecha actual
            initialDate.setHours(0,0,0,0); // Normalizar fecha inicial

            if (monthData.data && Array.isArray(monthData.data) && monthDate >= initialDate && monthDate <= fecha) {
                const monthTotal = monthData.data
                  .filter(transaction => {
                    if (transaction.hiddenFromList) return false;
                    if (transaction.excludeFromTotal) return false; // Excluir gastos con tarjeta de crédito
                    const transactionDate = parseDate(transaction.date);
                    // Incluir solo transacciones hasta la fecha actual si es el mes y año actual
                    if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
                      return transactionDate && transactionDate <= currentDate;
                    } 
                    return true; // Incluir todas las transacciones para meses anteriores
                  })
                  .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
                auxExpenses[parseInt(month) - 1] = monthTotal; // Usar el total filtrado por fecha para el mes actual
            } else if (monthData.total && monthDate >= initialDate && monthDate <= fecha && !(parseInt(year) === currentYear && parseInt(month) === currentMonth)) {
              // Para meses anteriores sin datos detallados, usar el total (puede ser impreciso si hay ocultos)
              auxExpenses[parseInt(month) - 1] = monthData.total;
            }
          });
        });
      }

      // Procesar ingresos
      if (userData?.finances?.incomes) {
        Object.keys(userData.finances.incomes).forEach(year => {
          Object.keys(userData.finances.incomes[year].months || {}).forEach(month => {
            const monthData = userData.finances.incomes[year].months[month];
            const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            monthDate.setHours(0,0,0,0); // Normalizar fecha del mes
            fecha.setHours(0,0,0,0); // Normalizar fecha actual
            initialDate.setHours(0,0,0,0); // Normalizar fecha inicial
            
            if (monthData.data && Array.isArray(monthData.data) && monthDate >= initialDate && monthDate <= fecha) {
                const monthTotal = monthData.data
                  .filter(transaction => {
                    const transactionDate = parseDate(transaction.date);
                    // Incluir solo transacciones hasta la fecha actual si es el mes y año actual
                    if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
                      return transactionDate && transactionDate <= currentDate;
                    }
                    return true; // Incluir todas las transacciones para meses anteriores
                  })
                  .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
                auxIncomes[parseInt(month) - 1] = monthTotal; // Usar el total filtrado por fecha para el mes actual
            } else if (monthData.total && monthDate >= initialDate && monthDate <= fecha && !(parseInt(year) === currentYear && parseInt(month) === currentMonth)) {
              // Para meses anteriores sin datos detallados, usar el total
              auxIncomes[parseInt(month) - 1] = monthData.total;
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

      // Calcular balance
      balance = incomes.map((income, i) => income - expenses[i]);
    }

    return { labels, incomes, expenses, balance };
  };

  const { labels, incomes, expenses, balance } = generateChartData();

  // Chart data for the general view (fixed configuration)
  const getChartData = () => {
    return [
      {
        name: 'Ingresos',
        type: 'area',
        data: incomes
      },
      {
        name: 'Gastos',
        type: 'area',
        data: expenses
      },
      {
        name: 'Balance',
        type: 'column',
        data: balance
      }
    ];
  };

  // Configuración del gráfico con ajustes fijos
  const chartOptions = {
    chart: {
      height: 350,
      type: 'area',
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
      dashArray: [0, 0, 0]
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
        formatter: (value) => formatAmount(value),
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        show: true,
        formatter: function(timestamp, opts) {
          // Obtener los datos ordenados para acceder al punto correcto
          if (!timestamp) return '';
          
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) return '';
          
          // Formatear fecha al formato español DD/MM/YYYY
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }
      },
      y: {
        formatter: val => formatAmount(val)
      },
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      style: {
        fontSize: '12px',
        fontFamily: theme.typography.fontFamily
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
  const [formattedArsAmount, setFormattedArsAmount] = useState('');
  const [formattedUsdAmount, setFormattedUsdAmount] = useState('');

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
  
  // Obtener las principales categorías de ingresos
  const topIncomeCategories = getTopIncomeCategories();

  return (
    <Layout title="Home">
      <Box 
        sx={{ 
          maxWidth: { xs: 1200, md: 1400, lg: 1600 }, 
          mx: 'auto', 
          width: '100%',
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2 }} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            mt: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}
        >
          <Grid item xs={12} sm={6} md={4} lg={4}>
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
                  p: { xs: 2, sm: 3 },
                  background: getBalance() >= 0 
                    ? `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                    : `linear-gradient(to right, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
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
                    <ShowChartIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Balance Mensual
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      {currentMonthName} {currentYear}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                bgcolor: 'background.paper', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                justifyContent: 'center' 
              }}>
                {/* Combined container with centered balance and progress chart */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {/* Monto principal */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Balance Total
                    </Typography>
                    <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                      color: getBalance() >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      letterSpacing: '-0.5px'
                    }}>
                      {formatAmount(getBalance())}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                      USD {formatAmount(getBalance() / (dollarRate?.venta || 1))}
                    </Typography>
                  </Box>
                  
                  {/* Circular progress indicator */}
                  <Box sx={{ 
                    height: 160, 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <ReactApexChart 
                      options={{
                        chart: {
                          type: 'radialBar',
                          offsetY: 0,
                          offsetX: 0,
                          sparkline: {
                            enabled: true
                          }
                        },
                        plotOptions: {
                          radialBar: {
                            startAngle: 0,
                            endAngle: 360,
                            track: {
                              background: alpha(theme.palette.grey[500], 0.15),
                              strokeWidth: '97%',
                              margin: 5,
                              dropShadow: {
                                enabled: false
                              }
                            },
                            dataLabels: {
                              name: {
                                show: false
                              },
                              value: {
                                show: true,
                                offsetY: 0,
                                fontSize: '22px',
                                fontWeight: 'bold',
                                formatter: function (val) {
                                  return Math.round(val) + '%';
                                },
                                color: isOverBudget ? theme.palette.error.main : budgetProgress > 80 ? theme.palette.warning.main : theme.palette.success.main
                              }
                            },
                            hollow: {
                              margin: 0,
                              size: '65%'
                            }
                          }
                        },
                        fill: {
                          type: 'gradient',
                          gradient: {
                            shade: 'light',
                            type: 'horizontal',
                            shadeIntensity: 0.5,
                            gradientToColors: [isOverBudget ? theme.palette.error.light : budgetProgress > 80 ? theme.palette.warning.light : theme.palette.success.light],
                            inverseColors: true,
                            opacityFrom: 1,
                            opacityTo: 1,
                            stops: [0, 100]
                          }
                        },
                        colors: [isOverBudget ? theme.palette.error.main : budgetProgress > 80 ? theme.palette.warning.main : theme.palette.success.main],
                        labels: ['Gastado'],
                        stroke: {
                          lineCap: 'round'
                        }
                      }}
                      series={[Math.min(budgetProgress, 100)]}
                      type="radialBar"
                      height={160}
                    />
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        
          <Grid item xs={12} sm={6} md={4} lg={4}>
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
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Ingresos Mensuales
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      {currentMonthName} {currentYear}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Monto principal */}
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total de Ingresos
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.success.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(getIncomeTotal())}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(getIncomeTotal() / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                {/* Información comparativa */}
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  mb: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {incomeChange >= 0 ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.success.main }} /> :
                        <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
                      }
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {Math.abs(incomeChange).toFixed(1)}% {incomeChange >= 0 ? 'más' : 'menos'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      vs. período {comparisonDateRange}
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography variant="caption" color="text.secondary">
                      Mes anterior
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatAmount(previousIncome)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={getIncomeTotal() >= previousIncome ? "success.main" : "error.main"}
                      sx={{ mt: 0.5, fontWeight: 'medium' }}
                    >
                      {getIncomeTotal() >= previousIncome ? '+' : '-'}{formatAmount(Math.abs(getIncomeTotal() - previousIncome))}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Información adicional específica - Principales categorías */}
                <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Principales categorías
                  </Typography>
                  
                  {topIncomeCategories.slice(0, 2).map((category, index) => {
                    // Función para obtener el icono según la categoría
                    const getCategoryIcon = (categoryName) => {
                      const categoryMapping = {
                        'Sueldo': <WorkIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Freelance': <LaptopIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Camila': <PeopleIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Extras': <MoreHorizIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Inversiones': <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      };
                      
                      // Busca coincidencias parciales si no hay una coincidencia exacta
                      if (categoryMapping[categoryName]) {
                        return categoryMapping[categoryName];
                      }
                      
                      const categoryLower = categoryName.toLowerCase();
                      for (const [key, icon] of Object.entries(categoryMapping)) {
                        if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
                          return icon;
                        }
                      }
                      
                      return <CategoryIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />;
                    };

                    return (
                      <Box key={index} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(category.category)}
                            <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: '70%' }}>
                              {category.category}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {formatAmount(category.amount)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(category.percentage, 100)}
                          sx={{ 
                            height: 5, 
                            borderRadius: 4, 
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.success.main
                            },
                            mb: 1
                          }}
                        />
                      </Box>
                    );
                  })}
                  
                  {topIncomeCategories.length > 2 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Otras categorías
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        {formatAmount(
                          topIncomeCategories
                            .slice(2)
                            .reduce((acc, cat) => acc + cat.amount, 0)
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        
          <Grid item xs={12} sm={6} md={4} lg={4}>
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
                  p: { xs: 2, sm: 3 },
                  background: `linear-gradient(to right, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
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
                    <TrendingDownIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Gastos Mensuales
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      {currentMonthName} {currentYear}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Monto principal */}
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total de Gastos
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.error.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(getExpenseTotal())}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(getExpenseTotal() / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                {/* Información comparativa */}
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.error.main, 0.1), 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  mb: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {expenseChange <= 0 ? 
                        <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.success.main }} /> :
                        <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
                      }
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {Math.abs(expenseChange).toFixed(1)}% {expenseChange <= 0 ? 'menos' : 'más'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      vs. período {comparisonDateRange}
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography variant="caption" color="text.secondary">
                      Mes anterior
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {formatAmount(previousExpense)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={getExpenseTotal() <= previousExpense ? "success.main" : "error.main"}
                      sx={{ mt: 0.5, fontWeight: 'medium' }}
                    >
                      {getExpenseTotal() <= previousExpense ? '-' : '+'}{formatAmount(Math.abs(getExpenseTotal() - previousExpense))}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Información adicional específica - Principales categorías */}
                <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Principales categorías
                  </Typography>
                  
                  {topExpenseCategories.slice(0, 2).map((category, index) => {
                    // Función para obtener el icono según la categoría
                    const getCategoryIcon = (categoryName) => {
                      const categoryMapping = {
                        'Supermercado': <ShoppingCartIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Alimentos': <RestaurantIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Restaurante': <RestaurantIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Comida': <FastfoodIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Transporte': <CommuteIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Auto': <DirectionsCarIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Nafta': <LocalGasStationIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Viajes': <FlightIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Educación': <SchoolIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Entretenimiento': <SportsEsportsIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Hogar': <HomeIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Casa': <HomeIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Servicios': <ElectricalServicesIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Salud': <HealthAndSafetyIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Ropa': <CheckroomIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Tecnología': <DevicesIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Trabajo': <WorkIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Extras': <MoreHorizIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Ahorro': <SavingsIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
                        'Inversiones': <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      };
                      
                      // Busca coincidencias parciales si no hay una coincidencia exacta
                      if (categoryMapping[categoryName]) {
                        return categoryMapping[categoryName];
                      }
                      
                      const categoryLower = categoryName.toLowerCase();
                      for (const [key, icon] of Object.entries(categoryMapping)) {
                        if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
                          return icon;
                        }
                      }
                      
                      return <CategoryIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />;
                    };

                    return (
                      <Box key={index} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(category.category)}
                            <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: '70%' }}>
                              {category.category}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {formatAmount(category.amount)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(category.percentage, 100)}
                          sx={{ 
                            height: 5, 
                            borderRadius: 4, 
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.error.main
                            },
                            mb: 1
                          }}
                        />
                      </Box>
                    );
                  })}
                  
                  {topExpenseCategories.length > 2 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Otras categorías
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        {formatAmount(
                          topExpenseCategories
                            .slice(2)
                            .reduce((acc, cat) => acc + cat.amount, 0)
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        {/* Gráfico de evolución financiera */}
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
              options={{
                ...chartOptions,
                colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.primary.main],
                chart: {
                  ...chartOptions.chart,
                  height: isMobile ? 300 : 450,
                  toolbar: {
                    show: !isMobile,
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
                legend: {
                  position: isMobile ? 'bottom' : 'top',
                  horizontalAlign: isMobile ? 'center' : 'right',
                  labels: {
                    colors: theme.palette.text.secondary
                  },
                  fontSize: '13px',
                  itemMargin: {
                    horizontal: 10
                  }
                }
              }} 
              series={getChartData()} 
              type="area" 
              height={isMobile ? 300 : 450}
            />
          </Box>
        </Card>

        {/* Evolución de Ahorros - Ancho completo como Evolución Financiera */}
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
            {userData?.savings ? (
              <>
                {/* Key metrics at the top */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                          <MonetizationOnIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ahorros en ARS
                          </Typography>
                          <Typography variant="h5" color="primary.dark" fontWeight="bold">
                            {formatAmount(userData.savings.amountARS || 0)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
                          <AttachMoneyIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Ahorros en USD
                          </Typography>
                          <Typography variant="h5" color="info.dark" fontWeight="bold">
                            {formatAmount(userData.savings.amountUSD || 0, true)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {/* Chart with same structure as Financial Evolution */}
                <ReactApexChart 
                  options={{
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
                      dashArray: [0, 0, 0]
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
                      type: 'datetime',
                      labels: {
                        style: {
                          colors: theme.palette.text.secondary,
                          fontSize: '12px'
                        },
                        datetimeFormatter: {
                          year: 'yyyy',
                          month: "MMM 'yy",
                          day: 'dd MMM'
                        }
                      },
                      axisBorder: {
                        show: false
                      },
                      axisTicks: {
                        show: false
                      }
                    },
                    yaxis: [
                      {
                        title: {
                          text: "Pesos (ARS)",
                          style: {
                            color: theme.palette.primary.main
                          }
                        },
                        labels: {
                          formatter: (value) => formatAmount(value),
                          style: {
                            colors: theme.palette.primary.main
                          }
                        }
                      },
                      {
                        opposite: true,
                        title: {
                          text: "Dólares (USD)",
                          style: {
                            color: theme.palette.info.main
                          }
                        },
                        labels: {
                          formatter: (value) => formatAmount(value, true),
                          style: {
                            colors: theme.palette.info.main
                          }
                        }
                      }
                    ],
                    tooltip: {
                      shared: true,
                      intersect: false,
                      x: {
                        show: true,
                        formatter: function(timestamp, opts) {
                          if (!timestamp) return '';
                          
                          const date = new Date(timestamp);
                          if (isNaN(date.getTime())) return '';
                          
                          // Formatear fecha al formato español DD/MM/YYYY
                          const day = date.getDate().toString().padStart(2, '0');
                          const month = (date.getMonth() + 1).toString().padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}/${month}/${year}`;
                        }
                      },
                      y: {
                        formatter: (val, { seriesIndex }) => {
                          return seriesIndex === 1 ? formatAmount(val, true) : formatAmount(val);
                        }
                      },
                      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                      style: {
                        fontSize: '12px',
                        fontFamily: theme.typography.fontFamily
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
                      position: isMobile ? 'bottom' : 'top',
                      horizontalAlign: isMobile ? 'center' : 'right',
                      labels: {
                        colors: theme.palette.text.secondary
                      },
                      fontSize: '13px',
                      itemMargin: {
                        horizontal: 10
                      }
                    },
                    colors: [theme.palette.primary.main, theme.palette.info.main],
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
                    ]
                  }} 
                  series={[
                    {
                      name: 'Ahorros en ARS',
                      type: 'area',
                      data: (() => {
                        const dailyBalances = {};
                        
                        const getValidDateKey = (dateString) => {
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
                            console.warn('Fecha inválida:', dateString);
                            return null;
                          }
                        };
                        
                        // Calcular la fecha de hace un año
                        const oneYearAgo = new Date();
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                        oneYearAgo.setHours(0, 0, 0, 0);
                        
                        if (userData.savings?.amountARSHistory) {
                          Object.values(userData.savings.amountARSHistory).forEach(entry => {
                            if (entry.date) {
                              const dateKey = getValidDateKey(entry.date);
                              if (dateKey) {
                                const entryDate = new Date(dateKey);
                                // Solo incluir datos del último año
                                if (entryDate >= oneYearAgo) {
                                  dailyBalances[dateKey] = entry.newTotal || 0;
                                }
                              }
                            }
                          });
                        }
                        
                        const sortedData = Object.entries(dailyBalances)
                          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                          .map(([date, amount]) => ({
                            x: new Date(date).getTime(),
                            y: amount
                          }));
                        
                        return sortedData;
                      })()
                    },
                    {
                      name: 'Ahorros en USD',
                      type: 'area',
                      data: (() => {
                        const dailyBalances = {};
                        
                        const getValidDateKey = (dateString) => {
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
                            console.warn('Fecha inválida:', dateString);
                            return null;
                          }
                        };
                        
                        // Calcular la fecha de hace un año
                        const oneYearAgo = new Date();
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                        oneYearAgo.setHours(0, 0, 0, 0);
                        
                        if (userData.savings?.amountUSDHistory) {
                          Object.values(userData.savings.amountUSDHistory || {}).forEach(entry => {
                            if (entry.date) {
                              const dateKey = getValidDateKey(entry.date);
                              if (dateKey) {
                                const entryDate = new Date(dateKey);
                                // Solo incluir datos del último año
                                if (entryDate >= oneYearAgo) {
                                  dailyBalances[dateKey] = entry.newTotal || 0;
                                }
                              }
                            }
                          });
                        }
                        
                        const sortedData = Object.entries(dailyBalances)
                          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                          .map(([date, amount]) => ({
                            x: new Date(date).getTime(),
                            y: amount
                          }));
                        
                        return sortedData;
                      })()
                    }
                  ]}
                  type="area"
                  height={isMobile ? 300 : 450}
                />
              </>
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

        
        {/* Cotizaciones del Dólar */}
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
              background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
                <CurrencyExchangeIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Cotizaciones del Dólar
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Valores actualizados
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2.5, sm: 3 } }}>
            {dolarOficial && dolarBlue ? (
              <Grid container spacing={3}>
                {/* Dólar Oficial */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    height: '100%'
                  }}>
                    <Typography variant="h6" color="primary.dark" fontWeight="bold" gutterBottom>
                      Dólar Oficial
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Compra
                        </Typography>
                        <Typography variant="h5" color="primary.dark" fontWeight="bold">
                          $ {dolarOficial.value_buy.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Venta
                        </Typography>
                        <Typography variant="h5" color="primary.dark" fontWeight="bold">
                          $ {dolarOficial.value_sell.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                  </Box>
                </Grid>
                
                {/* Dólar Blue */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    height: '100%'
                  }}>
                    <Typography variant="h6" color="info.dark" fontWeight="bold" gutterBottom>
                      Dólar Blue
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Compra
                        </Typography>
                        <Typography variant="h5" color="info.dark" fontWeight="bold">
                          $ {dolarBlue.value_buy.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Venta
                        </Typography>
                        <Typography variant="h5" color="info.dark" fontWeight="bold">
                          $ {dolarBlue.value_sell.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                  </Box>
                </Grid>
                
                {/* Brecha */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    mt: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CompareArrowsIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        Brecha cambiaria
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${Math.round(((dolarBlue.value_sell / dolarOficial.value_sell) - 1) * 100)}%`}
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
                
              </Grid>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CurrencyExchangeIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Cargando cotizaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Consultando la última información disponible del mercado cambiario...
                </Typography>
                <LinearProgress sx={{ width: '60%', maxWidth: 300, mx: 'auto', borderRadius: 1 }} />
              </Box>
            )}
          </Box>
        </Card>


      </Box>
    </Layout>
  );
};

export default Home;