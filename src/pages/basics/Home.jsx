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
  Checkbox,
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
import { Link, useNavigate } from 'react-router-dom';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Home = () => {
  const { userData, dollarRate } = useStore(); 
  const navigate = useNavigate();
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

  // Funciones auxiliares para obtener estadísticas de hábitos
  const getHabitsStats = () => {
    if (!userData?.habits) {
      return {
        totalHabits: 0,
        completedToday: 0,
        todayCompletion: 0,
        weeklyCompletion: 0,
        streak: 0,
        bestHabit: null,
        todayHabits: []
      };
    }

    const today = new Date();
    const todayStr = formatDateForHabits(today);
    
    // Obtener hábitos activos (excluyendo el nodo "completed")
    const habits = Object.keys(userData.habits)
      .filter(key => key !== 'completed')
      .map(id => ({
        id,
        ...userData.habits[id]
      }));

    // Filtrar hábitos que aplican para hoy
    const todayHabits = habits.filter(habit => shouldShowHabitForDate(habit, today));
    
    // Contar hábitos completados hoy
    const completedToday = todayHabits.filter(habit => 
      userData.habits.completed?.[todayStr]?.[habit.id]
    ).length;

    // Calcular porcentaje de completitud de hoy
    const todayCompletion = todayHabits.length > 0 
      ? Math.round((completedToday / todayHabits.length) * 100) 
      : 0;

    // Calcular estadísticas semanales
    const weekStats = calculateWeeklyHabitsStats(habits, today);

    // Encontrar el mejor hábito (más consistente en la semana)
    const bestHabit = findBestHabit(habits, today);

    return {
      totalHabits: habits.length,
      completedToday,
      todayCompletion,
      weeklyCompletion: weekStats.completion,
      bestHabit,
      todayHabits
    };
  };

  // Función para formatear fecha para hábitos (YYYY-MM-DD)
  const formatDateForHabits = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para determinar si un hábito aplica para una fecha
  const shouldShowHabitForDate = (habit, date) => {
    const dayOfWeek = date.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
    const dayOfMonth = date.getDate(); // 1-31
    const month = date.getMonth() + 1; // 1-12
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Lunes a viernes
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6; // Sábado o domingo
      case 'custom':
        return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
      case 'monthly':
        return Array.isArray(habit.monthlyDays) && habit.monthlyDays.includes(dayOfMonth);
      case 'yearly':
        return Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.includes(month);
      default:
        return true;
    }
  };

  // Función para calcular estadísticas semanales
  const calculateWeeklyHabitsStats = (habits, currentDate) => {
    if (!userData?.habits?.completed) return { completion: 0 };

    // Obtener el rango de la semana actual (lunes a domingo)
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    let totalPossible = 0;
    let totalCompleted = 0;

    // Para cada día de la semana hasta hoy
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      if (day > today) break; // No contar días futuros

      const dayStr = formatDateForHabits(day);
      
      habits.forEach(habit => {
        if (shouldShowHabitForDate(habit, day)) {
          totalPossible++;
          if (userData.habits.completed[dayStr]?.[habit.id]) {
            totalCompleted++;
          }
        }
      });
    }

    return {
      completion: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
  };

  // Función para encontrar el mejor hábito
  const findBestHabit = (habits, currentDate) => {
    if (!userData?.habits?.completed || habits.length === 0) return null;

    // Obtener el rango de la semana actual (lunes a domingo)
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    let bestHabit = null;
    let bestScore = -1;

    habits.forEach(habit => {
      let possibleDays = 0;
      let completedDays = 0;

      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        
        if (day > today) break;

        if (shouldShowHabitForDate(habit, day)) {
          possibleDays++;
          const dayStr = formatDateForHabits(day);
          if (userData.habits.completed[dayStr]?.[habit.id]) {
            completedDays++;
          }
        }
      }

      if (possibleDays > 0) {
        const percentage = (completedDays / possibleDays) * 100;
        const score = percentage * 0.7 + completedDays * 10; // Fórmula ponderada
        
        if (score > bestScore) {
          bestScore = score;
          bestHabit = {
            ...habit,
            completedDays,
            possibleDays,
            percentage: Math.round(percentage)
          };
        }
      }
    });

    return bestHabit;
  };

  // Función para toggle de hábitos
  const toggleHabitCompletion = async (habitId) => {
    if (!userData?.habits) return;

    const today = new Date();
    const todayStr = formatDateForHabits(today);
    
    try {
      // Importar las dependencias de Firebase
      const { database, auth } = await import('../../firebase');
      
      const completedRef = database.ref(`${auth.currentUser.uid}/habits/completed/${todayStr}/${habitId}`);
      const isCurrentlyCompleted = userData.habits.completed?.[todayStr]?.[habitId];
      
      if (isCurrentlyCompleted) {
        // Desmarcar hábito
        await completedRef.remove();
      } else {
        // Marcar hábito como completado
        await completedRef.set({ 
          completedAt: new Date().toISOString(), 
          habitId 
        });
      }
      
      // El estado se actualizará automáticamente a través del store
    } catch (error) {
      console.error("Error updating habit completion:", error);
    }
  };

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

  // Obtener estadísticas de hábitos
  const habitsStats = getHabitsStats();

  // Función para formatear fecha completa en español
  const formatFullDate = (dateString) => {
    if (!dateString) return '-';
    
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    let date;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-indexed
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '-';
    
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName} ${dayNumber} de ${monthName}`;
  };

  // Funciones auxiliares para tarjetas de crédito
  const getCreditCardsData = () => {
    if (!userData?.creditCards) {
      return {
        totalAmount: 0,
        cards: [],
        closingDates: [],
        dueDates: [],
        hasStatements: false,
        statements: {}
      };
    }

    // Obtener todas las tarjetas (excluyendo el nodo 'transactions')
    const cards = Object.keys(userData.creditCards)
      .filter(key => key !== 'transactions')
      .map(id => ({
        id,
        ...userData.creditCards[id]
      }));

    // Calcular el total de todas las tarjetas para el mes actual
    let totalAmount = 0;
    const closingDates = new Set();
    const dueDates = new Set();
    let hasStatements = false;
    const statements = {};

    cards.forEach(card => {
      // Calcular total de la tarjeta para el mes actual
      const cardTotal = getCreditCardTotal(card.id);
      totalAmount += cardTotal;

      // Obtener fechas de cierre y vencimiento
      const cardDates = getCreditCardDates(card.id);
      if (cardDates) {
        if (cardDates.closingDate) {
          closingDates.add(formatFullDate(cardDates.closingDate));
        }
        if (cardDates.dueDate) {
          dueDates.add(formatFullDate(cardDates.dueDate));
        }
      }

      // Verificar si hay resúmenes disponibles
      const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      if (card.statements && card.statements[monthKey]) {
        hasStatements = true;
        statements[card.id] = {
          name: card.name,
          statement: card.statements[monthKey],
          total: cardTotal
        };
      }
    });

    return {
      totalAmount,
      cards,
      closingDates: Array.from(closingDates).filter(date => date !== '-'),
      dueDates: Array.from(dueDates).filter(date => date !== '-'),
      hasStatements,
      statements
    };
  };

  const getCreditCardTotal = (cardId) => {
    if (!userData?.creditCards?.transactions?.[cardId]) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener fechas de cierre para determinar el período de facturación
    const cardDates = getCreditCardDates(cardId);
    if (!cardDates) return 0;

    const currentClosingDate = new Date(cardDates.closingDate);
    
    // Calcular fecha de cierre del mes anterior
    let prevMonthClosingDate = null;
    if (cardDates.prevClosingDate) {
      prevMonthClosingDate = new Date(cardDates.prevClosingDate);
    } else {
      // Calcular fecha de cierre del mes anterior
      const prevMonth = new Date(currentClosingDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      prevMonthClosingDate = prevMonth;
    }

    // Filtrar transacciones del período de facturación actual
    let total = 0;
    Object.values(userData.creditCards.transactions[cardId]).forEach(transaction => {
      const transactionDate = parseDate(transaction.date);
      if (transactionDate && 
          transactionDate > prevMonthClosingDate && 
          transactionDate <= currentClosingDate) {
        total += transaction.amount || 0;
      }
    });

    return total;
  };

  const getCreditCardDates = (cardId) => {
    if (!userData?.creditCards?.[cardId]) return null;

    const card = userData.creditCards[cardId];
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    // Si hay fechas específicas configuradas para este mes, usarlas
    if (card.dates && card.dates[monthKey]) {
      return card.dates[monthKey];
    }

    // Si no, usar las fechas por defecto
    const closingDay = card.defaultClosingDay || 15;
    const dueDay = card.defaultDueDay || 10;

    // Fecha de cierre del mes actual
    const closingDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(closingDay).padStart(2, '0')}`;

    // Fecha de vencimiento (generalmente el mes siguiente)
    let dueYear = currentYear;
    let dueMonth = currentMonth + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
    const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

    return { closingDate, dueDate };
  };

  // Función para ver resúmenes de tarjetas
  const handleViewStatement = async (cardId, statement) => {
    try {
      if (statement.downloadURL) {
        // Abrir en nueva pestaña para visualizar
        window.open(statement.downloadURL, '_blank');
      }
    } catch (error) {
      console.error('Error al ver el resumen:', error);
    }
  };



  // Obtener datos de tarjetas de crédito
  const creditCardsData = getCreditCardsData();

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
        {/* Fila superior: Ahorros y Balance */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2 }} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            mt: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}
        >
          {/* Ahorros en ARS */}
          <Grid item xs={12} sm={6} md={4}>
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
                    <MonetizationOnIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Ahorros en ARS
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total en ARS
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.primary.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(userData?.savings?.amountARS || 0)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount((userData?.savings?.amountARS || 0) / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Ahorros en USD */}
          <Grid item xs={12} sm={6} md={4}>
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
                  background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 }
                      }}
                    >
                      <AttachMoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Ahorros en USD
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip 
                    size="small"
                    icon={<CurrencyExchangeIcon fontSize="small" />}
                    label={`$${dollarRate?.venta || '-'}`}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'medium',
                      fontSize: '0.7rem',
                      height: 24
                    }}
                  />
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total en USD
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.info.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(userData?.savings?.amountUSD || 0, true)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    ARS {formatAmount((userData?.savings?.amountUSD || 0) * (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Balance Mensual */}
          <Grid item xs={12} sm={12} md={4}>
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
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
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
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Fila inferior: Ingresos, Gastos y Tarjetas de Crédito */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Ingresos Mensuales */}
          <Grid item xs={12} md={4}>
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
                      Ingresos {currentMonthName} {currentYear}
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

          {/* Gastos Mensuales */}
          <Grid item xs={12} md={4}>
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

          {/* Tarjetas de Crédito */}
          <Grid item xs={12} md={4}>
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
                  background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                    <CreditCardIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Tarjetas de Crédito
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
                    Total a Pagar
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.warning.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(creditCardsData.totalAmount)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(creditCardsData.totalAmount / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
                
                {/* Información de fechas */}
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  mb: 1.5
                }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      Cierre:
                    </Typography>
                    {creditCardsData.closingDates.length > 0 ? (
                      creditCardsData.closingDates.map((date, index) => (
                        <Typography key={index} variant="body2" fontWeight="bold" color="text.primary" sx={{ mt: 0.5 }}>
                          {date}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No configurado
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      Vencimiento:
                    </Typography>
                    {creditCardsData.dueDates.length > 0 ? (
                      creditCardsData.dueDates.map((date, index) => (
                        <Typography key={index} variant="body2" fontWeight="bold" color="text.primary" sx={{ mt: 0.5 }}>
                          {date}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No configurado
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Resúmenes disponibles como subtarjetas */}
                <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {creditCardsData.hasStatements ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                        Resúmenes disponibles:
                      </Typography>
                      {Object.entries(creditCardsData.statements).map(([cardId, statementData]) => (
                        <ButtonBase
                          key={cardId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStatement(cardId, statementData.statement);
                          }}
                          sx={{ 
                            p: 1.5,
                            mb: 1,
                            width: '100%',
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            borderRadius: 1,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.15),
                              borderColor: alpha(theme.palette.success.main, 0.4),
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.success.main, 0.2),
                              flexShrink: 0
                            }}>
                              <CreditCardIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                            </Box>
                            <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                {statementData.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                Resumen {currentMonthName} {currentYear}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 'auto' }}>
                              <Typography variant="body2" color="text.primary" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                {formatAmount(statementData.total)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                USD {formatAmount(statementData.total / (dollarRate?.venta || 1))}
                              </Typography>
                            </Box>
                          </Box>
                        </ButtonBase>
                      ))}
                    </Box>
                  ) : creditCardsData.totalAmount === 0 && creditCardsData.cards.length > 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      mt: 1,
                      p: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        Sin saldo pendiente
                      </Typography>
                    </Box>
                  ) : creditCardsData.cards.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      py: 2,
                      textAlign: 'center'
                    }}>
                      <CreditCardIcon sx={{ fontSize: 32, color: theme.palette.grey[400], mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay tarjetas registradas
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        {/* Gráfico de evolución financiera */}
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

        
        {/* Sección de Hábitos */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2 }} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            mt: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}
        >
          {/* Resumen de Hábitos de Hoy */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                position: 'relative',
                transition: 'all 0.3s ease',
                borderRadius: { xs: 2, sm: 3 },
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-5px)' },
                  boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
                },
              }}
              onClick={() => navigate('/habits')}
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
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Hábitos de Hoy
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Progreso diario
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Completados hoy
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: habitsStats.todayCompletion >= 80 ? theme.palette.success.main : 
                           habitsStats.todayCompletion >= 50 ? theme.palette.warning.main : 
                           theme.palette.error.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {habitsStats.completedToday}/{habitsStats.todayHabits.length}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {habitsStats.todayCompletion}% completado
                  </Typography>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={habitsStats.todayCompletion} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: habitsStats.todayCompletion >= 80 ? theme.palette.success.main : 
                               habitsStats.todayCompletion >= 50 ? theme.palette.warning.main : 
                               theme.palette.error.main
                    },
                    mb: 2
                  }}
                />

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {habitsStats.totalHabits} hábitos activos
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Progreso Semanal */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                position: 'relative',
                transition: 'all 0.3s ease',
                borderRadius: { xs: 2, sm: 3 },
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-5px)' },
                  boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
                },
              }}
              onClick={() => navigate('/habits')}
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
                    <CalendarViewWeekIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Progreso Semanal
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Esta semana
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Completitud semanal
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.info.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {habitsStats.weeklyCompletion}%
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {habitsStats.weeklyCompletion >= 80 ? 'Excelente' : 
                     habitsStats.weeklyCompletion >= 60 ? 'Muy bien' : 
                     habitsStats.weeklyCompletion >= 40 ? 'Regular' : 'Necesita mejorar'}
                  </Typography>
                </Box>

                <LinearProgress 
                  variant="determinate" 
                  value={habitsStats.weeklyCompletion} 
                  color="info"
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    mb: 2
                  }}
                />

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Lunes a {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()]}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Mejor Hábito */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                position: 'relative',
                transition: 'all 0.3s ease',
                borderRadius: { xs: 2, sm: 3 },
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-5px)' },
                  boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
                },
              }}
              onClick={() => navigate('/habits')}
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
                    <StarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Mejor Hábito
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Más consistente
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {habitsStats.bestHabit ? (
                  <>
                    <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {habitsStats.bestHabit.name}
                      </Typography>
                      <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                        color: theme.palette.primary.main,
                        letterSpacing: '-0.5px'
                      }}>
                        {habitsStats.bestHabit.percentage}%
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                        {habitsStats.bestHabit.completedDays} de {habitsStats.bestHabit.possibleDays} días
                      </Typography>
                    </Box>

                    <LinearProgress 
                      variant="determinate" 
                      value={habitsStats.bestHabit.percentage} 
                      color="primary"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mb: 2
                      }}
                    />
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Sin datos suficientes
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Esta semana
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Hábitos de Hoy - Lista Interactiva */}
          <Grid item xs={12} sm={6} md={3}>
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
                  background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 }
                      }}
                    >
                      <PlaylistAddCheckIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Lista de Hoy
                      </Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                        Marca tus hábitos
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ 
                p: { xs: 1, sm: 2 }, 
                bgcolor: 'background.paper', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {habitsStats.todayHabits.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {habitsStats.todayHabits.map((habit) => {
                      const todayStr = formatDateForHabits(new Date());
                      const isCompleted = userData?.habits?.completed?.[todayStr]?.[habit.id];
                      
                      return (
                        <ListItem 
                          key={habit.id} 
                          sx={{ 
                            px: 1, 
                            py: 0.5,
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: isCompleted ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                            '&:hover': {
                              bgcolor: isCompleted ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.grey[500], 0.1)
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              checked={!!isCompleted}
                              onChange={() => toggleHabitCompletion(habit.id)}
                              icon={<CheckCircleIcon sx={{ color: theme.palette.grey[400] }} />}
                              checkedIcon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                              size="small"
                              sx={{ p: 0.5 }}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={habit.name}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: {
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                color: isCompleted ? theme.palette.text.secondary : theme.palette.text.primary,
                                fontWeight: isCompleted ? 'normal' : 'medium'
                              }
                            }}
                          />
                          {habit.color && (
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette[habit.color]?.main || theme.palette.primary.main,
                                ml: 1
                              }} 
                            />
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 4,
                    textAlign: 'center'
                  }}>
                    <PlaylistAddCheckIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No hay hábitos para hoy
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      ¡Disfruta tu día libre!
                    </Typography>
                  </Box>
                )}

                {habitsStats.todayHabits.length > 0 && (
                  <Box sx={{ mt: 'auto', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={habitsStats.todayCompletion} 
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: habitsStats.todayCompletion >= 80 ? theme.palette.success.main : 
                                   habitsStats.todayCompletion >= 50 ? theme.palette.warning.main : 
                                   theme.palette.error.main
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                      {habitsStats.todayCompletion}% completado
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Cotizaciones del Dólar */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2 }} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            mt: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}
        >
          {dolarOficial && dolarBlue ? (
            <>
              {/* Dólar Oficial */}
              <Grid item xs={12} sm={6} md={4}>
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
                        <CurrencyExchangeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                          Dólar Oficial
                        </Typography>
                        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                          Banco Central
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Compra
                          </Typography>
                          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                            color: theme.palette.primary.main,
                            letterSpacing: '-0.5px'
                          }}>
                            ${dolarOficial.value_buy.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Venta
                          </Typography>
                          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                            color: theme.palette.primary.main,
                            letterSpacing: '-0.5px'
                          }}>
                            ${dolarOficial.value_sell.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>

              {/* Dólar Blue */}
              <Grid item xs={12} sm={6} md={4}>
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
                          Dólar Blue
                        </Typography>
                        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                          Mercado paralelo
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Compra
                          </Typography>
                          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                            color: theme.palette.info.main,
                            letterSpacing: '-0.5px'
                          }}>
                            ${dolarBlue.value_buy.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Venta
                          </Typography>
                          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                            color: theme.palette.info.main,
                            letterSpacing: '-0.5px'
                          }}>
                            ${dolarBlue.value_sell.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>

              {/* Brecha Cambiaria */}
              <Grid item xs={12} sm={12} md={4}>
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
                      background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                        <CompareArrowsIcon />
                      </Avatar>
                      <Box>
                        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                          Brecha Cambiaria
                        </Typography>
                        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                          Diferencia Blue vs Oficial
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" sx={{ 
                        color: theme.palette.warning.main,
                        letterSpacing: '-0.5px'
                      }}>
                        {Math.round(((dolarBlue.value_sell / dolarOficial.value_sell) - 1) * 100)}%
                      </Typography>
                      
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: { xs: 2, sm: 3 },
                  overflow: 'hidden'
                }}
              >
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
              </Card>
            </Grid>
          )}
        </Grid>

        {/* SpeedDial para acciones rápidas */}
        <SpeedDial
          ariaLabel="Acciones rápidas"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24 
          }}
          icon={<SpeedDialIcon />}
          onOpen={handleOpenSpeedDial}
          onClose={handleCloseSpeedDial}
        >
          <SpeedDialAction
            key="nuevoHabito"
            icon={<PlaylistAddCheckIcon />}
            tooltipTitle="Nuevo Hábito"
            onClick={() => navigate('/NuevoHabito')}
          />
          <SpeedDialAction
            key="nuevoGasto"
            icon={<TrendingDownIcon />}
            tooltipTitle="Nuevo Gasto"
            onClick={() => navigate('/NuevoGasto')}
          />
          <SpeedDialAction
            key="nuevoIngreso"
            icon={<TrendingUpIcon />}
            tooltipTitle="Nuevo Ingreso"
            onClick={() => navigate('/NuevoIngreso')}
          />
        </SpeedDial>



      </Box>
    </Layout>
  );
};

export default Home;