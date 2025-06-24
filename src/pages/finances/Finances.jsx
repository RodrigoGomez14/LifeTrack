import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Card, 
  CardContent,
  CardHeader,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
  Button,
  Fade,
  Zoom,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Avatar,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Dialog,
  DialogContent,
  TextField
} from '@mui/material';
import TransactionsTabs from '../../components/finances/TransactionsTabs';
import SavingsTab from '../../components/finances/SavingsTab';
import { useStore } from '../../store'; 
import { formatAmount, getMonthName } from '../../utils';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PieChartIcon from '@mui/icons-material/PieChart';
import CategoriesIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CommuteIcon from '@mui/icons-material/Commute';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Payments';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AddIcon from '@mui/icons-material/Add';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InfoIcon from '@mui/icons-material/Info';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import { database, auth } from '../../firebase';
import { getDate } from '../../utils';

const Finances = () => {
  const { userData, dollarRate } = useStore();
  const [dataType, setDataType] = useState('expenses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState({
    transactionsListPanel: false,
    yearlyAnalysis: false,
    categoryAnalysis: false,
    savingsPanel: false
  });
  
  // Estados para el dialog de devolución
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    description: ''
  });
  
  const navigate = useNavigate();
  
  // Función para abrir el dialog de devolución
  const handleOpenRefund = (transaction) => {
    // Solo permitir devoluciones en gastos, no en ingresos
    if (dataType !== 'expenses') return;
    
    setSelectedTransaction(transaction);
    setRefundForm({
      amount: '',
      description: `Devolución de ${transaction.description}`
    });
    setOpenRefundDialog(true);
  };
  
  // Función para cerrar el dialog de devolución
  const handleCloseRefund = () => {
    setOpenRefundDialog(false);
    setSelectedTransaction(null);
    setRefundForm({
      amount: '',
      description: ''
    });
  };
  
  // Función para procesar la devolución
  const handleProcessRefund = async () => {
    if (!selectedTransaction || !refundForm.amount || parseFloat(refundForm.amount) <= 0) {
      return;
    }
    
    const refundAmount = parseFloat(refundForm.amount);
    const originalAmount = selectedTransaction.amount || 0;
    
    // Validar que la devolución no sea mayor al gasto original
    if (refundAmount > originalAmount) {
      alert('La devolución no puede ser mayor al gasto original');
      return;
    }
    
    try {
      const updates = {};
      
      // Encontrar la transacción en la base de datos para actualizarla
      // Necesitamos buscar por todos los campos para encontrar la transacción exacta
      const expensesRef = database.ref(`${auth.currentUser.uid}/expenses`);
      const snapshot = await expensesRef.once('value');
      let transactionKey = null;
      
      if (snapshot.exists()) {
        const expenses = snapshot.val();
        // Buscar la transacción que coincida con los datos
        for (const [key, expense] of Object.entries(expenses)) {
          if (expense.date === selectedTransaction.date &&
              expense.description === selectedTransaction.description &&
              expense.amount === selectedTransaction.amount &&
              expense.category === selectedTransaction.category) {
            transactionKey = key;
            break;
          }
        }
      }
      
      if (transactionKey) {
        // Actualizar la transacción original con el campo de devolución
        updates[`${auth.currentUser.uid}/expenses/${transactionKey}/refundAmount`] = refundAmount;
        updates[`${auth.currentUser.uid}/expenses/${transactionKey}/refundDescription`] = refundForm.description;
        updates[`${auth.currentUser.uid}/expenses/${transactionKey}/refundDate`] = getDate();
        updates[`${auth.currentUser.uid}/expenses/${transactionKey}/hasRefund`] = true;
      }
      
      // Actualizar ahorros (aumentar por el monto devuelto)
      const currentSavings = userData?.savings?.amountARS || 0;
      updates[`${auth.currentUser.uid}/savings/amountARS`] = currentSavings + refundAmount;
      
      // Registrar en historial de ahorros
      const newHistoryKey = database.ref().child(`${auth.currentUser.uid}/savings/amountARSHistory`).push().key;
      updates[`${auth.currentUser.uid}/savings/amountARSHistory/${newHistoryKey}`] = {
        date: getDate(),
        amount: refundAmount,
        newTotal: currentSavings + refundAmount,
        description: `Devolución: ${refundForm.description}`
      };
      
      // Ejecutar todas las actualizaciones
      await database.ref().update(updates);
      
      // Cerrar el dialog
      handleCloseRefund();
      
      // Mostrar mensaje de éxito
      alert('Devolución procesada exitosamente');
      
    } catch (error) {
      console.error('Error al procesar devolución:', error);
      alert('Error al procesar la devolución');
    }
  };
  
  // Estados para los datos procesados
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], data: [], percentages: [] });
  const [monthlyTrendsData, setMonthlyTrendsData] = useState({ 
    months: [], 
    expenses: [], 
    incomes: [], 
    balance: [] 
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Función auxiliar para obtener iconos según categoría
  const getCategoryIcon = (category) => {
    const categoryMapping = {
      'Supermercado': <ShoppingCartIcon fontSize="small" />,
      'Alimentos': <RestaurantIcon fontSize="small" />,
      'Restaurante': <RestaurantIcon fontSize="small" />,
      'Comida': <FastfoodIcon fontSize="small" />,
      'Transporte': <CommuteIcon fontSize="small" />,
      'Auto': <DirectionsCarIcon fontSize="small" />,
      'Nafta': <LocalGasStationIcon fontSize="small" />,
      'Viajes': <FlightIcon fontSize="small" />,
      'Educación': <SchoolIcon fontSize="small" />,
      'Entretenimiento': <SportsEsportsIcon fontSize="small" />,
      'Hogar': <HomeIcon fontSize="small" />,
      'Casa': <HomeIcon fontSize="small" />,
      'Servicios': <ElectricalServicesIcon fontSize="small" />,
      'Salud': <HealthAndSafetyIcon fontSize="small" />,
      'Ropa': <CheckroomIcon fontSize="small" />,
      'Tecnología': <DevicesIcon fontSize="small" />,
      'Trabajo': <WorkIcon fontSize="small" />,
      'Extras': <MoreHorizIcon fontSize="small" />,
      'Ahorro': <SavingsIcon fontSize="small" />,
      'Inversiones': <TrendingUpIcon fontSize="small" />
    };
    
    // Busca coincidencias parciales si no hay una coincidencia exacta
    if (categoryMapping[category]) {
      return categoryMapping[category];
    }
    
    const categoryLower = category.toLowerCase();
    for (const [key, icon] of Object.entries(categoryMapping)) {
      if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
        return icon;
      }
    }
    
    return <CategoryIcon fontSize="small" />;
  };
  
  // Generar array de años disponibles (desde el año actual hasta 3 años atrás)
  const availableYears = Array.from(
    { length: 4 }, 
    (_, i) => new Date().getFullYear() - i
  );
  
  // Generar array de meses
  const months = Array.from(
    { length: 12 }, 
    (_, i) => ({ value: i + 1, label: getMonthName(i + 1) })
  );
  
  // Actualizar datos cuando cambia el año, mes o tipo de datos
  useEffect(() => {
    if (userData?.finances) {
      // Actualizar datos del mes seleccionado
      updateMonthlyData();
      // Actualizar datos para gráficos
      updateCategoryChartData();
      // Actualizar tendencias mensuales
      updateMonthlyTrends();
    }
  }, [userData, selectedYear, selectedMonth, dataType]);
  
  // Función para actualizar datos del mes seleccionado
  const updateMonthlyData = () => {
    const monthData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a las 00:00:00

    if (monthData) {
      // Preparar datos de categorías para el mes seleccionado
      const categoryData = {};
      
      // Si hay un array de datos, procesamos todas las transacciones para agrupar por categoría
      if (monthData.data && Array.isArray(monthData.data)) {
        // Procesar todas las transacciones, excluyendo las que deben omitirse de los totales
        monthData.data.forEach(transaction => {
          const category = transaction.category || "Sin categoría";
          
          if (!categoryData[category]) {
            categoryData[category] = {
              total: 0,
              percentage: 0,
              subcategories: {}
            };
          }
          
          // Verificar si la transacción tiene fecha futura
          let isFutureTransaction = false;
          
          if (transaction.date) {
            let transactionDate;
            // Convertir la fecha de la transacción al formato Date
            if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
              const [day, month, year] = transaction.date.split('/').map(Number);
              transactionDate = new Date(year, month - 1, day);
            } else {
              transactionDate = new Date(transaction.date);
            }
            
            // Si la fecha es válida y es posterior a hoy, es una transacción futura
            if (!isNaN(transactionDate.getTime()) && transactionDate > today) {
              isFutureTransaction = true;
            }
          }
          
                      // Si no está oculta, no es una transacción futura y no debe excluirse de totales, sumamos al total
            if (!transaction.hiddenFromList && !isFutureTransaction && !transaction.excludeFromTotal) {
              // Calcular el monto efectivo considerando devoluciones
              const originalAmount = transaction.amount || 0;
              const refundAmount = transaction.refundAmount || 0;
              const effectiveAmount = originalAmount - refundAmount;
              
              categoryData[category].total += effectiveAmount;
            
                          // Agregar subcategoría si existe
              if (transaction.subcategory) {
                if (!categoryData[category].subcategories[transaction.subcategory]) {
                  categoryData[category].subcategories[transaction.subcategory] = 0;
                }
                categoryData[category].subcategories[transaction.subcategory] += effectiveAmount;
              }
          }
        });
        
        // Calcular el total de todas las transacciones visibles
        let total = 0;
        Object.values(categoryData).forEach(cat => {
          total += cat.total;
        });
        
        // Calcular porcentajes
        Object.keys(categoryData).forEach(category => {
          categoryData[category].percentage = total > 0 ? (categoryData[category].total / total) * 100 : 0;
        });
        
        // Definir el objeto monthlyData con el total calculado
        setMonthlyData({
          ...monthData,
          formattedTotal: formatAmount(total),
          formattedTotalUSD: formatAmount(total / (dollarRate?.venta || 1)),
          categoryData: categoryData,
          sortedCategories: Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total)
        });
      } else if (monthData.categories) {
        // Si ya tiene las categorías procesadas, las usamos directamente
        let total = monthData.total || 0;
        
        Object.entries(monthData.categories).forEach(([category, data]) => {
          categoryData[category] = {
            total: data.total,
            percentage: total > 0 ? (data.total / total) * 100 : 0,
            subcategories: { ...data.subcategories }
          };
        });
        
        // Ordenar categorías por monto
        const sortedCategories = Object.entries(categoryData)
          .sort((a, b) => b[1].total - a[1].total);
        
        setMonthlyData({
          ...monthData,
          formattedTotal: formatAmount(total),
          formattedTotalUSD: formatAmount(total / (dollarRate?.venta || 1)),
          categoryData: categoryData,
          sortedCategories: sortedCategories
        });
      } else {
        setMonthlyData(null);
      }
    } else {
      setMonthlyData(null);
    }
  };
  
  // Función para actualizar datos del gráfico de categorías
  const updateCategoryChartData = () => {
    const monthData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
    
    if (!monthData) {
      setCategoryChartData({ labels: [], data: [], percentages: [] });
      return;
    }
    
    // Si ya tenemos los datos procesados en monthlyData, los usamos
    if (monthlyData && monthlyData.sortedCategories && monthlyData.sortedCategories.length > 0) {
      setCategoryChartData({
        labels: monthlyData.sortedCategories.map(([cat]) => cat),
        data: monthlyData.sortedCategories.map(([_, data]) => data.total),
        percentages: monthlyData.sortedCategories.map(([_, data]) => data.percentage.toFixed(1))
      });
      return;
    }
    
    // Procesar datos si no tenemos monthlyData actualizado
    let categoryData = {};
    
    if (monthData.data && Array.isArray(monthData.data)) {
      // Filtrar datos para no mostrar transacciones marcadas como ocultas
      const visibleData = monthData.data.filter(transaction => !transaction.hiddenFromList);
      
      // Agrupar transacciones por categoría (solo las visibles)
      visibleData.forEach(transaction => {
        const category = transaction.category || "Sin categoría";
        
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        
        categoryData[category] += transaction.amount || 0;
      });
      
      // Calcular el total basado solo en transacciones visibles
      let total = visibleData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      
      // Ordenar categorías por monto
      const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1]);
      
      setCategoryChartData({
        labels: sortedCategories.map(([cat]) => cat),
        data: sortedCategories.map(([_, value]) => value),
        percentages: sortedCategories.map(([_, value]) => (total > 0 ? (value / total) * 100 : 0).toFixed(1))
      });
    } else if (monthData.categories) {
      // Si ya tiene las categorías procesadas
      Object.entries(monthData.categories).forEach(([category, data]) => {
        categoryData[category] = data.total;
      });
      
      // Usar el total de monthData (que debería estar ya filtrado)
      let total = monthData.total || 0;
      
      // Ordenar categorías por monto
      const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1]);
      
      setCategoryChartData({
        labels: sortedCategories.map(([cat]) => cat),
        data: sortedCategories.map(([_, value]) => value),
        percentages: sortedCategories.map(([_, value]) => (total > 0 ? (value / total) * 100 : 0).toFixed(1))
      });
    }
  };
  
  // Función para actualizar tendencias mensuales
  const updateMonthlyTrends = () => {
    const monthsArr = Array(12).fill(0).map((_, i) => i + 1);
    const expenseData = Array(12).fill(0);
    const incomeData = Array(12).fill(0);
    const balanceData = Array(12).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a las 00:00:00
    
    // Llenar los datos de gastos e ingresos por mes, excluyendo transacciones ocultas y futuras
    if (userData.finances?.expenses?.[selectedYear]?.months) {
      Object.keys(userData.finances.expenses[selectedYear].months).forEach(month => {
        const monthIndex = parseInt(month) - 1;
        const monthData = userData.finances.expenses[selectedYear].months[month];
        
        // Si hay datos detallados, calcular el total excluyendo transacciones ocultas y futuras
        if (monthData.data && Array.isArray(monthData.data)) {
          // Filtrar para excluir transacciones ocultas, futuras o con tarjeta
          const visibleData = monthData.data.filter(transaction => {
            // Comprobar si es una transacción futura
            if (transaction.date) {
              let transactionDate;
              // Convertir la fecha de la transacción al formato Date
              if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
                const [day, month, year] = transaction.date.split('/').map(Number);
                transactionDate = new Date(year, month - 1, day);
              } else {
                transactionDate = new Date(transaction.date);
              }
              
              // Si la fecha es válida y es posterior a hoy, excluir esta transacción
              if (!isNaN(transactionDate.getTime()) && transactionDate > today) {
                return false;
              }
            }
            
            // Incluir solo si no está oculta y no debe excluirse de los totales
            return !transaction.hiddenFromList && !transaction.excludeFromTotal;
          });
          
          expenseData[monthIndex] = visibleData.reduce((sum, transaction) => {
            const originalAmount = transaction.amount || 0;
            const refundAmount = transaction.refundAmount || 0;
            return sum + (originalAmount - refundAmount);
          }, 0);
        } else {
          // Si no hay datos detallados, usar el total
          expenseData[monthIndex] = monthData.total || 0;
        }
      });
    }
    
    // Hacer lo mismo para los ingresos
    if (userData.finances?.incomes?.[selectedYear]?.months) {
      Object.keys(userData.finances.incomes[selectedYear].months).forEach(month => {
        const monthIndex = parseInt(month) - 1;
        const monthData = userData.finances.incomes[selectedYear].months[month];
        
        // Si hay datos detallados, calcular el total excluyendo transacciones ocultas y futuras
        if (monthData.data && Array.isArray(monthData.data)) {
          // Filtrar para excluir transacciones ocultas
          const visibleData = monthData.data.filter(transaction => {
            // Comprobar si es una transacción futura
            if (transaction.date) {
              let transactionDate;
              // Convertir la fecha de la transacción al formato Date
              if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
                const [day, month, year] = transaction.date.split('/').map(Number);
                transactionDate = new Date(year, month - 1, day);
              } else {
                transactionDate = new Date(transaction.date);
              }
              
              // Si la fecha es válida y es posterior a hoy, excluir esta transacción
              if (!isNaN(transactionDate.getTime()) && transactionDate > today) {
                return false;
              }
            }
            
            // Incluir solo si no está oculta
            return !transaction.hiddenFromList;
          });
          
          incomeData[monthIndex] = visibleData.reduce((sum, transaction) => {
            const originalAmount = transaction.amount || 0;
            const refundAmount = transaction.refundAmount || 0;
            return sum + (originalAmount - refundAmount);
          }, 0);
        } else {
          // Si no hay datos detallados, usar el total
          incomeData[monthIndex] = monthData.total || 0;
        }
      });
    }
    
    // Calcular balance mensual
    balanceData.forEach((_, index) => {
      balanceData[index] = incomeData[index] - expenseData[index];
    });
    
    setMonthlyTrendsData({
      months: monthsArr.map(m => getMonthName(m).substring(0, 3)),
      expenses: expenseData,
      incomes: incomeData,
      balance: balanceData
    });
  };
  
  // Función global para obtener color específico para la categoría
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Supermercado': return theme.palette.error.main;
      case 'Transporte': return theme.palette.info.main;
      case 'Auto': return theme.palette.warning.main;
      case 'Indoor': return theme.palette.success.main;
      case 'Porro': return theme.palette.secondary.main;
      case 'Hogar': return theme.palette.primary.main;
      case 'Entretenimiento': return '#FF4081'; // pink
      case 'Viajes': return '#00BCD4'; // cyan
      case 'Educacion': return '#9C27B0'; // purple
      case 'Salud': return '#4CAF50'; // green
      case 'Extras': return theme.palette.grey[600];
      case 'Salidas': return '#FF9800'; // orange
      default:
        return dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main;
    }
  };
  
  // Manejadores de navegación
  const handleDataTypeChange = (event, newDataType) => {
    if (newDataType !== null) {
      setDataType(newDataType);
    }
  };
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prevYear => prevYear - 1);
    } else {
      setSelectedMonth(prevMonth => prevMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prevYear => prevYear + 1);
    } else {
      setSelectedMonth(prevMonth => prevMonth + 1);
    }
  };
  
  // Verificar si los datos están cargados correctamente
  if (!userData || !userData.finances || !userData.savings) {
    return (
      <Layout title="Análisis Financiero">
        <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
          <Grid item>
            <Typography variant="h5" color="textSecondary">
              Cargando datos financieros, por favor espere...
            </Typography>
          </Grid>
        </Grid>
      </Layout>
    );
  }

  // Datos para análisis
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Identificar meses con gastos mayores a ingresos (alerta)
  const alertMonths = monthlyTrendsData.months.filter((_, index) => 
    monthlyTrendsData.expenses[index] > monthlyTrendsData.incomes[index] && 
    monthlyTrendsData.expenses[index] > 0
  );
  
  // Calcular totales anuales
  const annualExpenses = monthlyTrendsData.expenses.reduce((a, b) => a + b, 0);
  const annualIncomes = monthlyTrendsData.incomes.reduce((a, b) => a + b, 0);
  const annualBalance = annualIncomes - annualExpenses;
  
  // Configuración de gráfico de área para tendencias mensuales
  const areaChartOptions = {
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
      fontFamily: theme.typography.fontFamily
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
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
      size: 5,
      hover: {
        size: 7
      }
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
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    colors: [theme.palette.error.main, theme.palette.success.main, theme.palette.info.main]
  };
  
  const areaChartSeries = [
    {
      name: 'Gastos',
      data: monthlyTrendsData.expenses
    },
    {
      name: 'Ingresos',
      data: monthlyTrendsData.incomes
    },
    {
      name: 'Balance',
      data: monthlyTrendsData.balance
    }
  ];
  
  // Componente para tarjeta de insights/análisis
  const InsightCard = ({ title, icon, children, color = 'primary', elevation = 1 }) => {
    // Determinar colores basados en el tipo
    let colorMain, colorLight;
    switch (color) {
      case 'expense':
        colorMain = theme.palette.error.main;
        colorLight = theme.palette.error.light;
        break;
      case 'income':
        colorMain = theme.palette.success.main;
        colorLight = theme.palette.success.light;
        break;
      default:
        colorMain = theme.palette.primary.main;
        colorLight = theme.palette.primary.light;
    }
    
    return (
      <Card elevation={elevation} sx={{ 
        height: '100%',
        borderTop: `3px solid ${colorMain}`,
        borderRadius: 2,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        },
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <CardHeader 
          avatar={
            <Box 
              sx={{ 
                bgcolor: `${colorLight}50`,
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {React.cloneElement(icon, { style: { color: colorMain } })}
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
              {title}
            </Typography>
          }
          sx={{ 
            bgcolor: theme.palette.grey[100],
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        />
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );
  };

  // Navegador de tiempo (Año/Mes) con UX/UI mejorada
  const TimeNavigator = () => {
    const isCurrentMonth = selectedMonth === (new Date().getMonth() + 1) && selectedYear === new Date().getFullYear();
    
    // Limitar la navegación al mes actual
    const isAtCurrentLimit = (() => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentYear = today.getFullYear();
      
      // Calcular cuál sería el mes y año siguiente
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      
      // Permitir navegación normal en años pasados, excepto si navegamos al año actual
      // a un mes más allá del límite permitido
      if (selectedYear < currentYear && nextYear < currentYear) {
        return false;
      }
      
      // Si navegaríamos al año actual, verificar el límite de meses
      if (nextYear === currentYear && nextMonth <= currentMonth) {
        return false;
      }
      
      // En cualquier otro caso, deshabilitar
      return true;
    })();
    
    // Función para manejar la navegación al mes siguiente teniendo en cuenta el límite
    const handleNextMonthWithLimit = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Calcular cuál sería el mes y año siguiente
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      
      // Verificar si estamos intentando ir a un mes futuro más allá del límite
      const isFutureLimitExceeded = 
        (nextYear > currentYear) || 
        (nextYear === currentYear && nextMonth > currentMonth);
      
      // Si excede el límite y estamos en un año anterior, ir al mes actual del año actual
      if (isFutureLimitExceeded && selectedYear < currentYear) {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
      } 
      // Si no excede el límite o estamos navegando normalmente, avanzar un mes
      else if (!isFutureLimitExceeded) {
        if (selectedMonth === 12) {
          setSelectedMonth(1);
          setSelectedYear(selectedYear + 1);
        } else {
          setSelectedMonth(selectedMonth + 1);
        }
      }
      // Si excede el límite y estamos en el año actual, no hacer nada (botón debería estar deshabilitado)
    };
    
    return (
      <Card 
        elevation={3} 
        sx={{ 
          mb: 3, 
          borderRadius: { xs: '0 0 16px 16px', sm: '0 0 20px 20px' },
          overflow: 'hidden',
          position: 'sticky',
          top: {
            xs: 56, // Altura del AppBar en móviles
            sm: 64  // Altura del AppBar en escritorio
          },
          zIndex: 10,
          boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`
          }
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            py: 1.5,
            px: { xs: 1.5, sm: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {/* Fila 1: Información contextual y tipo de datos */}
          <Box 
            sx={{
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', md: 'center' },
              gap: { xs: 2, md: 0 },
              width: '100%'
            }}
          >
            {/* Indicador contextual del período seleccionado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.2),
                  color: theme.palette.common.white,
                  width: 40,
                  height: 40
                }}
              >
                <CalendarTodayIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="white"
                  sx={{ 
                    lineHeight: 1.2,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(theme.palette.common.white, 0.85),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontWeight: 500
                  }}
                >
                  {dataType === 'expenses' ? 
                    <TrendingDownIcon fontSize="inherit" /> : 
                    <TrendingUpIcon fontSize="inherit" />
                  } 
                  {dataType === 'expenses' ? 'Gastos' : 'Ingresos'} • 
                  {monthlyData ? ` Total: ${monthlyData.formattedTotal}` : ' Sin datos'}
                </Typography>
              </Box>
            </Box>

            {/* Controles - Tipo de datos (Gastos/Ingresos) y botón de Mes actual */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <ButtonGroup 
                variant="contained" 
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.12),
                  borderRadius: 2,
                  padding: 0.5,
                  '& .MuiButton-root': {
                    bgcolor: 'transparent',
                    color: 'white',
                    borderColor: alpha(theme.palette.common.white, 0.2),
                    textTransform: 'none',
                    fontWeight: 'medium',
                    px: { xs: 1.5, sm: 2 },
                    py: 0.75,
                    '&.Mui-disabled': {
                      bgcolor: 'transparent',
                      color: 'white',
                      opacity: 1
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.15)
                    },
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <Button 
                  startIcon={
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: dataType === 'expenses' ? theme.palette.error.main : alpha(theme.palette.common.white, 0.2),
                        color: 'white'
                      }}
                    >
                      <TrendingDownIcon fontSize="small" />
                    </Avatar>
                  }
                  onClick={() => setDataType('expenses')}
                  disabled={dataType === 'expenses'}
                  aria-label="Ver gastos"
                  aria-pressed={dataType === 'expenses'}
                  sx={{
                    boxShadow: dataType === 'expenses' ? `0 0 0 1px ${alpha(theme.palette.common.white, 0.5)}` : 'none',
                    '&.Mui-disabled': {
                      fontWeight: 'bold',
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                    }
                  }}
                >
                  Gastos
                </Button>
                <Button 
                  startIcon={
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: dataType === 'incomes' ? theme.palette.success.main : alpha(theme.palette.common.white, 0.2),
                        color: 'white'
                      }}
                    >
                      <TrendingUpIcon fontSize="small" />
                    </Avatar>
                  }
                  onClick={() => setDataType('incomes')}
                  disabled={dataType === 'incomes'}
                  aria-label="Ver ingresos"
                  aria-pressed={dataType === 'incomes'}
                  sx={{
                    boxShadow: dataType === 'incomes' ? `0 0 0 1px ${alpha(theme.palette.common.white, 0.5)}` : 'none',
                    '&.Mui-disabled': {
                      fontWeight: 'bold',
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                    }
                  }}
                >
                  Ingresos
                </Button>
              </ButtonGroup>

              {/* Botón de mes actual */}
              <Button
                variant="contained"
                size="small"
                startIcon={<TodayIcon />}
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(now.getMonth() + 1);
                  setSelectedYear(now.getFullYear());
                }}
                sx={{
                  bgcolor: alpha(theme.palette.background.paper, 0.25),
                  color: theme.palette.common.white,
                  backdropFilter: 'blur(4px)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.35),
                  }
                }}
              >
                Mes actual
              </Button>
            </Box>
          </Box>

          {/* Fila 2: Selección detallada de mes y año */}
          <Box
            sx={{
              mt: { xs: 1, md: 2 },
              bgcolor: alpha(theme.palette.background.paper, 0.12),
              borderRadius: 3,
              p: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backdropFilter: 'blur(5px)'
            }}
          >
            {/* Selector de mes táctil y accesible */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%',
              position: 'relative' 
            }}>
              <Tooltip title="Mes anterior" arrow placement="top">
                <IconButton
                  onClick={handlePreviousMonth}
                  color="inherit"
                  size="small"
                  aria-label="Mes anterior"
                  sx={{
                    color: theme.palette.common.white,
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.background.paper, 0.25),
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  mx: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    px: 1,
                    transition: 'transform 0.3s ease-in-out',
                    '& > *': {
                      minWidth: { xs: 'auto', sm: 40 }
                    }
                  }}
                >
                  {months.map((month) => {
                    const isActive = selectedMonth === month.value;
                    const isVisible = 
                      Math.abs(month.value - selectedMonth) <= 2 ||
                      (!isMobile && !isTablet);
                    
                    // Determinar si este mes es futuro
                    const isFutureMonth = 
                      (month.value > new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()) || 
                      (selectedYear > new Date().getFullYear());
                    
                    return (
                      <Button
                        key={month.value}
                        onClick={() => setSelectedMonth(month.value)}
                        aria-label={`Mes de ${month.label}`}
                        aria-current={isActive ? 'date' : undefined}
                        disabled={isFutureMonth}
                        sx={{
                          py: 0.75,
                          px: { xs: 1, sm: 1.5 },
                          minWidth: { xs: 32, sm: 36 },
                          color: isActive ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.85),
                          bgcolor: isActive ? alpha(theme.palette.common.white, 0.9) : 'transparent',
                          fontWeight: isActive ? 'bold' : 'medium',
                          borderRadius: 1.5,
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          transition: 'all 0.2s ease',
                          opacity: isVisible ? (isFutureMonth ? 0.5 : 1) : { xs: 0, sm: 0.5 },
                          display: { xs: isVisible ? 'flex' : 'none', sm: 'flex' },
                          '&:hover': {
                            bgcolor: isActive 
                              ? alpha(theme.palette.common.white, 0.9)
                              : alpha(theme.palette.common.white, 0.15),
                            transform: isFutureMonth ? 'none' : 'translateY(-2px)'
                          },
                          pointerEvents: isVisible && !isFutureMonth ? 'auto' : { xs: 'none', sm: 'auto' },
                          textTransform: 'none',
                          '&.Mui-disabled': {
                            color: alpha(theme.palette.common.white, 0.4),
                            pointerEvents: 'none'
                          }
                        }}
                      >
                        {month.label.substring(0, 3)}
                        {isActive && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: theme.palette.primary.dark,
                              mt: 0.5
                            }}
                          />
                        )}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              <Tooltip title={isAtCurrentLimit ? "No se puede avanzar a meses futuros" : "Mes siguiente"} arrow placement="top">
                <span>
                  <IconButton
                    onClick={handleNextMonthWithLimit}
                    color="inherit"
                    size="small"
                    aria-label="Mes siguiente"
                    disabled={isAtCurrentLimit}
                    sx={{
                      color: theme.palette.common.white,
                      opacity: isAtCurrentLimit ? 0.5 : 1,
                      '&:hover': { 
                        bgcolor: isAtCurrentLimit ? 'transparent' : alpha(theme.palette.background.paper, 0.25),
                        transform: isAtCurrentLimit ? 'none' : 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease',
                      '&.Mui-disabled': {
                        color: alpha(theme.palette.common.white, 0.4)
                      }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </span>
              </Tooltip>
              
              {/* Selector de año intuitivo con flechas */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  ml: 1.5,
                  pl: 1.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  aria-label="Año anterior"
                  sx={{ 
                    color: theme.palette.common.white,
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.background.paper, 0.25)
                    }
                  }}
                >
                  <KeyboardArrowLeftIcon fontSize="small" />
                </IconButton>
                
                <Tooltip title="Seleccionar año" arrow>
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label={`Año ${selectedYear}`}
                    onClick={() => {
                      // Aquí podría abrirse un selector de año más avanzado
                      const currentYear = new Date().getFullYear();
                      setSelectedYear(currentYear);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const currentYear = new Date().getFullYear();
                        setSelectedYear(currentYear);
                      }
                    }}
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 2,
                      minWidth: 60,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      userSelect: 'none',
                      mx: 0.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.25),
                        transform: 'translateY(-2px)'
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                        outlineOffset: 2
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={theme.palette.common.white}
                    >
                      {selectedYear}
                    </Typography>
                  </Box>
                </Tooltip>
                
                <Tooltip title={selectedYear >= new Date().getFullYear() ? "No se puede avanzar a años futuros" : "Año siguiente"} arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const nextYear = selectedYear + 1;
                        const today = new Date();
                        const currentMonth = today.getMonth() + 1; // 1-12
                        const currentYear = today.getFullYear();
                        
                        // Si el año al que vamos es el actual Y el mes seleccionado
                        // está más allá del mes actual, ajustamos al mes actual
                        if (nextYear === currentYear && selectedMonth > currentMonth) {
                          setSelectedMonth(currentMonth);
                        }
                        
                        // Solo avanzar si no estamos ya en el año actual o futuro
                        if (selectedYear < currentYear) {
                          setSelectedYear(nextYear);
                        }
                      }}
                      aria-label="Año siguiente"
                      disabled={selectedYear >= new Date().getFullYear()}
                      sx={{ 
                        color: theme.palette.common.white,
                        opacity: selectedYear >= new Date().getFullYear() ? 0.5 : 1,
                        '&:hover': { 
                          bgcolor: selectedYear >= new Date().getFullYear() ? 'transparent' : alpha(theme.palette.background.paper, 0.25)
                        },
                        '&.Mui-disabled': {
                          color: alpha(theme.palette.common.white, 0.4)
                        }
                      }}
                    >
                      <KeyboardArrowRightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    );
  };
  
  // Componente para el panel de detalles de transacciones con gráfico integrado
  const TransactionsPanelWithChart = () => {
    // Si no hay datos para el mes seleccionado
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

    // Preparar datos para el gráfico de torta (solo top 3 + otros)
    const preparePieChartData = () => {
      if (!monthlyData || !monthlyData.sortedCategories || monthlyData.sortedCategories.length === 0) {
        return { series: [], labels: [], colors: [] };
      }
      
      const top3Categories = monthlyData.sortedCategories.slice(0, 3);
      const otherCategories = monthlyData.sortedCategories.slice(3);
      
      const pieData = [];
      const pieLabels = [];
      const pieColors = [];
      
      // Agregar las top 3 categorías
      top3Categories.forEach(([category, data], index) => {
        pieData.push(data.total);
        pieLabels.push(category);
        pieColors.push(getCategoryColor(category, index));
      });
      
      // Agregar "Otras categorías" si hay más de 3
      if (otherCategories.length > 0) {
        const otherTotal = otherCategories.reduce((sum, [_, data]) => sum + data.total, 0);
        pieData.push(otherTotal);
        pieLabels.push('Otras');
        pieColors.push(theme.palette.grey[500]);
      }
      
      return { series: pieData, labels: pieLabels, colors: pieColors };
    };

    const pieChartData = preparePieChartData();

    // Configuración del gráfico de torta
    const pieOptions = {
      chart: {
        type: 'pie',
        fontFamily: theme.typography.fontFamily,
        foreColor: theme.palette.text.secondary,
        toolbar: {
          show: false
        }
      },
      labels: pieChartData.labels,
      colors: pieChartData.colors,
      legend: {
        show: false
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
          formatter: function(value) {
            return formatAmount(value);
          }
        }
      },
      stroke: {
        width: 1
      },
      plotOptions: {
        pie: {
          donut: {
            size: '0%'
          }
        }
      }
    };
    
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card 
          elevation={1} 
          sx={{ 
            mb: 3, 
            overflow: 'hidden', // Cambiar a auto para permitir scroll si es necesario
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
                  
                  {monthlyData && monthlyData.sortedCategories && monthlyData.sortedCategories.length > 0 ? (
                    <Stack>
                      {monthlyData.sortedCategories.slice(0, 3).map(([category, data], index) => {
                        const categoryColor = getCategoryColor(category, index);
                        
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

  // Componente para el panel de detalles de transacciones (original)
  const TransactionsPanel = () => {
    // Si no hay datos para el mes seleccionado
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
    
    // Función auxiliar para obtener iconos según categoría
    const getCategoryIcon = (category) => {
      const categoryMapping = {
        'Supermercado': <ShoppingCartIcon fontSize="small" />,
        'Alimentos': <RestaurantIcon fontSize="small" />,
        'Restaurante': <RestaurantIcon fontSize="small" />,
        'Comida': <FastfoodIcon fontSize="small" />,
        'Transporte': <CommuteIcon fontSize="small" />,
        'Auto': <DirectionsCarIcon fontSize="small" />,
        'Nafta': <LocalGasStationIcon fontSize="small" />,
        'Viajes': <FlightIcon fontSize="small" />,
        'Educación': <SchoolIcon fontSize="small" />,
        'Entretenimiento': <SportsEsportsIcon fontSize="small" />,
        'Hogar': <HomeIcon fontSize="small" />,
        'Casa': <HomeIcon fontSize="small" />,
        'Servicios': <ElectricalServicesIcon fontSize="small" />,
        'Salud': <HealthAndSafetyIcon fontSize="small" />,
        'Ropa': <CheckroomIcon fontSize="small" />,
        'Tecnología': <DevicesIcon fontSize="small" />,
        'Trabajo': <WorkIcon fontSize="small" />,
        'Extras': <MoreHorizIcon fontSize="small" />,
        'Ahorro': <SavingsIcon fontSize="small" />,
        'Inversiones': <TrendingUpIcon fontSize="small" />
      };
      
      // Busca coincidencias parciales si no hay una coincidencia exacta
      if (categoryMapping[category]) {
        return categoryMapping[category];
      }
      
      const categoryLower = category.toLowerCase();
      for (const [key, icon] of Object.entries(categoryMapping)) {
        if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
          return icon;
        }
      }
      
      return <CategoryIcon fontSize="small" />;
    };
    
    // Función para obtener un color para cada categoría
    const getCategoryColor = (category, index) => {
      // Paleta de colores atractiva y diversa
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.success.main,
        '#8E44AD', // Púrpura
        '#16A085', // Verde azulado
        '#D35400', // Naranja oscuro
        '#2E86C1', // Azul
        '#CB4335', // Rojo ladrillo
        '#27AE60', // Verde esmeralda
        '#F1C40F', // Amarillo
        '#884EA0', // Púrpura oscuro
        '#E74C3C', // Rojo
        '#3498DB', // Azul claro
        '#1ABC9C', // Turquesa
        '#F39C12', // Ámbar
        '#7D3C98', // Morado oscuro
        '#2ECC71'  // Verde
      ];
      
      // Si la categoría es común, intentar asignar un color consistente
      const categoryColorMapping = {
        'Supermercado': colors[0],
        'Alimentos': colors[1],
        'Restaurante': colors[2],
        'Comida': colors[3],
        'Transporte': colors[4],
        'Auto': colors[5],
        'Nafta': colors[6],
        'Viajes': colors[7],
        'Educación': colors[8],
        'Entretenimiento': colors[9],
        'Hogar': colors[10],
        'Casa': colors[10], // Mismo color que Hogar
        'Servicios': colors[11],
        'Salud': colors[12],
        'Ropa': colors[13],
        'Tecnología': colors[14],
        'Trabajo': colors[15],
        'Extras': colors[16],
        'Ahorro': colors[17],
        'Inversiones': colors[18]
      };
      
      // Si la categoría está en el mapping, devolver ese color
      if (categoryColorMapping[category]) {
        return categoryColorMapping[category];
      }
      
      // Si no, devolver un color basado en el índice
      return colors[index % colors.length];
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
            mt: 1, // Evitar solapamiento
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
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
            <Grid container spacing={3}>
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
                  pt: { xs: 2, md: 0 } // Padding-top en móviles
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
                        Distribución por Categoría
                      </Typography>
                    </Stack>
                    
                    {monthlyData.sortedCategories.length > 0 ? (
                      <Box>
                        {monthlyData.sortedCategories.slice(0, 3).map(([category, data], index) => {
                          const categoryColor = getCategoryColor(category, index);
                          
                          return (
                            <Box key={index} sx={{ mb: 1.5 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar
                                    sx={{ 
                                      width: 28, 
                                      height: 28, 
                                      bgcolor: `${categoryColor}20`,
                                      color: categoryColor
                                    }}
                                  >
                                    {getCategoryIcon(category)}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="medium" sx={{ color: categoryColor }}>
                                    {category}
                                  </Typography>
                                </Stack>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold" 
                                  color={categoryColor}
                                >
                                  {formatAmount(data.total)}
                                </Typography>
                              </Stack>
                              <Box sx={{ width: '100%', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 5, height: 8 }}>
                                <Box
                                  sx={{
                                    width: `${Math.min(data.percentage, 100)}%`,
                                    bgcolor: categoryColor,
                                    height: 8,
                                    borderRadius: 5
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                                {data.percentage.toFixed(1)}%
                              </Typography>
                            </Box>
                          );
                        })}
                        
                        {monthlyData.sortedCategories.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                            + {monthlyData.sortedCategories.length - 3} categorías más
                          </Typography>
                        )}
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
          </Box>
        </Card>
      </Box>
    );
  };
  
  // Componente para gráfico de categorías
  const CategoryChart = () => {
    if (categoryChartData.labels.length === 0) {
      return (
        <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No hay datos disponibles para mostrar en el gráfico
          </Typography>
        </Box>
    );
  }
  
  return (
      <ReactApexChart
        options={{
          ...areaChartOptions,
          title: {
            text: `Distribución ${dataType === 'expenses' ? 'de Gastos' : 'de Ingresos'} - ${getMonthName(selectedMonth)} ${selectedYear}`,
            align: 'center',
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }
          }
        }}
        series={categoryChartData.data}
        type="area"
        height={350}
      />
    );
  };

  // Función auxiliar para formatear fechas en un formato amigable
  function obtenerFechaFormateada(dateStr) {
    // Si la fecha no existe o es inválida, mostrar un valor genérico
    if (!dateStr || dateStr === 'Invalid Date') {
      return '(Sin fecha)';
    }
    
    try {
      // Si es formato DD/MM/YYYY (el formato estándar en nuestra app)
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        
        // Crear un array con nombres de días
        const diasSemana = [
          'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ];
        
        // Crear un array con nombres de meses
        const meses = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        // Crear fecha pero sin usarla para conversión de zona horaria
        const date = new Date(year, month - 1, day);
        
        // Formatear manualmente para evitar problemas de zona horaria
        return `${diasSemana[date.getDay()]} ${day} de ${meses[month - 1]} de ${year}`;
      }
      
      // Intentamos parsearlo a una fecha
      const parsedDate = parseFechaFlexible(dateStr);
      
      // Si es una fecha válida, obtener sus componentes manualmente
      if (!isNaN(parsedDate.getTime())) {
        const day = parsedDate.getDate();
        const month = parsedDate.getMonth(); // 0-11
        const year = parsedDate.getFullYear();
        const dayOfWeek = parsedDate.getDay(); // 0-6
        
        // Crear arrays para los nombres
        const diasSemana = [
          'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ];
        
        const meses = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        // Formatear manualmente para evitar problemas de zona horaria
        return `${diasSemana[dayOfWeek]} ${day} de ${meses[month]} de ${year}`;
      }
      
      // Si no es una fecha válida, intentamos usar el formato que nos han dado
      return dateStr;
    } catch (e) {
      console.error('Error al formatear fecha:', dateStr, e);
      return dateStr;
    }
  }

  // Función auxiliar para parsear diversos formatos de fecha
  function parseFechaFlexible(dateStr) {
    if (!dateStr || dateStr === 'Invalid Date') {
      return new Date(0); // Fecha inválida
    }
    
    // Verificar y limpiar la cadena de fecha
    const cleanDateStr = dateStr.trim();
    console.log('Procesando fecha:', cleanDateStr);
    
    try {
      // Si es formato DD/MM/YYYY (el formato estándar en nuestra app)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDateStr)) {
        const [day, month, year] = cleanDateStr.split('/').map(Number);
        // Crear la fecha manualmente sin conversiones de zona horaria
        return new Date(year, month - 1, day);
      }
      
      // Si es ISO format con tiempo (2025-03-24T...)
      if (/^\d{4}-\d{2}-\d{2}T/.test(cleanDateStr)) {
        // Extraer solo la parte de fecha (YYYY-MM-DD)
        const datePart = cleanDateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        // Crear la fecha manualmente sin conversiones de zona horaria
        return new Date(year, month - 1, day);
      }
      
      // Si es ISO format sin tiempo (2025-03-24)
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) {
        const [year, month, day] = cleanDateStr.split('-').map(Number);
        // Crear la fecha manualmente sin conversiones de zona horaria
        return new Date(year, month - 1, day);
      }
      
      // Si es formato DD-MM-YYYY
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDateStr)) {
        const [day, month, year] = cleanDateStr.split('-').map(Number);
        // Crear la fecha manualmente sin conversiones de zona horaria
        return new Date(year, month - 1, day);
      }
      
      // Intenta como último recurso con Date.parse
      const timestamp = Date.parse(cleanDateStr);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        // Extraer componentes y crear una nueva fecha sin ajustes de zona horaria
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }
      
      console.warn('Formato de fecha no reconocido:', cleanDateStr);
      return new Date(0); // Fecha inválida
    } catch (error) {
      console.error('Error al parsear fecha:', cleanDateStr, error);
      return new Date(0); // Fecha inválida
    }
  }

  // Componente para mostrar lista de transacciones individuales por categoría con tabs
  const TransactionsListPanel = () => {
    const [searchText, setSearchText] = useState('');
    const [expandedDates, setExpandedDates] = useState({});
    
    // Cambiar el estado expandido de una fecha
    const handleToggleDate = (date) => {
      setExpandedDates(prev => ({
        ...prev,
        [date]: !prev[date]
      }));
    };
    
    // Obtener todas las transacciones, incluyendo las ocultas y las de tarjeta de crédito
    const getAllTransactions = () => {
      const allTransactions = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizar el día actual a las 00:00:00
      
      // Obtener datos del mes actual directamente de userData, sin filtrar
      try {
        const monthData = userData?.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
        
        if (!monthData) return [];
        
        // Si existe data como array, lo usamos directamente
        if (monthData.data && Array.isArray(monthData.data)) {
          // IMPORTANTE: Accedemos a los datos originales, no a los filtrados en monthlyData
          // Obtenemos los datos directamente de userData
          const rawData = userData.finances[dataType][selectedYear].months[selectedMonth].data;
          
          // Copiamos todas las transacciones (visibles, ocultas y de tarjeta)
          rawData.forEach(transaction => {
            // Aseguramos que creditCardTransaction sea booleano (para transacciones de tarjeta)
            if (transaction.paymentMethod === 'creditCard' && transaction.creditCardTransaction !== true) {
              transaction.creditCardTransaction = true;
            }
            
            // Comprobar si la fecha de la transacción es futura
            let transactionDate;
            if (transaction.date) {
              // Convertir la fecha de la transacción al formato Date
              if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
                const [day, month, year] = transaction.date.split('/').map(Number);
                transactionDate = new Date(year, month - 1, day);
              } else {
                transactionDate = new Date(transaction.date);
              }
              
              // Si la fecha es inválida, asumimos que no es futura
              if (isNaN(transactionDate.getTime())) {
                transactionDate = today;
              }
            } else {
              // Si no hay fecha, asumimos que no es futura
              transactionDate = today;
            }
            
            // Solo incluimos la transacción si su fecha no es posterior a hoy
            // o si está marcada como hiddenFromList (para mantener consistencia con datos existentes)
            if (transactionDate <= today || transaction.hiddenFromList) {
              // Añadimos la transacción sin modificar hiddenFromList
              allTransactions.push({...transaction});
            } else {
              // Es una transacción futura, la añadimos pero marcada como oculta
              allTransactions.push({...transaction, hiddenFromList: true, isFutureTransaction: true});
            }
          });
          
          console.log('Transacciones recuperadas:', allTransactions.length, 
            'incluyendo tarjetas:', allTransactions.filter(t => t.creditCardTransaction || t.paymentMethod === 'creditCard').length,
            'ocultando futuras:', allTransactions.filter(t => t.isFutureTransaction).length);
        }
      } catch (error) {
        console.error('Error al cargar transacciones:', error);
      }
      
      return allTransactions;
    };
    
    // Obtener todas las transacciones
    const allTransactions = getAllTransactions();
    
    // Inicializar fechas expandidas cuando cambia el mes o tipo de datos
    // Modificar para que estén cerradas por defecto
    useEffect(() => {
      if (allTransactions.length > 0) {
        const dateGroups = {};
        allTransactions.forEach(transaction => {
          const dateStr = transaction.date || 'Invalid Date';
          dateGroups[dateStr] = false; // Inicializar como cerrado (false) en lugar de abierto (true)
        });
        setExpandedDates(dateGroups);
      }
    }, [selectedYear, selectedMonth, dataType]);
    
    // Si no hay datos, mostrar mensaje
    if (!allTransactions || allTransactions.length === 0) {
      return (
        <Card elevation={1} sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor:theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CategoryIcon color="primary" />
            <Typography variant="h6">
              Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
            </Typography>
          </Box>
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4
          }}>
            <Stack 
              spacing={2} 
              alignItems="center" 
              sx={{ 
                maxWidth: 400, 
                textAlign: 'center',
                p: 3,
                borderRadius: 2
              }}
            >
              {dataType === 'expenses' 
                ? <TrendingDownIcon sx={{ fontSize: 48, color: theme.palette.error.light }} />
                : <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.success.light }} />
              }
              <Typography variant="h6" color="textSecondary">
                No hay datos disponibles
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No se encontraron {dataType === 'expenses' ? 'gastos' : 'ingresos'} para {getMonthName(selectedMonth)} de {selectedYear}.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={dataType === 'expenses' ? <TrendingDownIcon /> : <TrendingUpIcon />}
                color={dataType === 'expenses' ? 'error' : 'success'}
                onClick={() => navigate(dataType === 'expenses' ? '/NuevoGasto' : '/NuevoIngreso')}
              >
                Añadir {dataType === 'expenses' ? 'Gasto' : 'Ingreso'}
              </Button>
            </Stack>
          </Box>
        </Card>
      );
    }
    
    // Filtrar transacciones según texto de búsqueda
    const getFilteredTransactions = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalizar a las 00:00:00
      
      return allTransactions.filter(transaction => {
        // Identificar si es una transacción con tarjeta
        const isCreditCard = transaction.paymentMethod === 'creditCard' || 
                            transaction.creditCardTransaction === true ||
                            transaction.excludeFromTotal === true;
        
        // Excluir transacciones con fecha futura
        if (transaction.isFutureTransaction) {
          return false;
        }
        
        // No excluir transacciones con tarjeta aunque estén marcadas como hiddenFromList
        if (transaction.hiddenFromList && !isCreditCard) {
          return false;
        }
        
        // Verificar si la fecha es futura (doble verificación por seguridad)
        if (transaction.date) {
          let transactionDate;
          // Convertir la fecha de la transacción al formato Date
          if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
            const [day, month, year] = transaction.date.split('/').map(Number);
            transactionDate = new Date(year, month - 1, day);
          } else {
            transactionDate = new Date(transaction.date);
          }
          
          // Si la fecha es válida y es posterior a hoy, excluir la transacción
          if (!isNaN(transactionDate.getTime()) && transactionDate > today) {
            return false;
          }
        }
        
        // Filtrar por texto de búsqueda
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower);
          const categoryMatch = transaction.category?.toLowerCase().includes(searchLower);
          const subcategoryMatch = transaction.subcategory?.toLowerCase().includes(searchLower);
          const amountMatch = transaction.amount?.toString().includes(searchLower);
          const paymentMethodMatch = 
            (transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction || transaction.excludeFromTotal) 
              ? 'tarjeta'.includes(searchLower) 
              : 'efectivo'.includes(searchLower);
          
          if (!(descriptionMatch || categoryMatch || subcategoryMatch || amountMatch || paymentMethodMatch)) {
            return false;
          }
        }
        
        return true;
      });
    };
    
    const filteredTransactions = getFilteredTransactions();
    
    // Agrupar transacciones por fecha
    const transactionsByDate = filteredTransactions.reduce((groups, transaction) => {
      // Crear una clave para agrupar transacciones basada en la fecha
      let dateKey;
      if (!transaction.date) {
        dateKey = 'Invalid Date';
      } else {
        try {
          // Si transaction.date ya es un formato de fecha reconocible, usarlo directamente
          const date = parseFechaFlexible(transaction.date);
          
          if (isNaN(date.getTime())) {
            dateKey = transaction.date; // Mantener el formato original si no se puede parsear
          } else {
            // Formato YYYY-MM-DD para la clave
            dateKey = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Error al procesar fecha de transacción:', transaction.date, error);
          dateKey = transaction.date; // Usar la fecha original como clave en caso de error
        }
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          transactions: [],
          total: 0,
          visibleTotal: 0,
          hiddenTotal: 0,
          cashTotal: 0, // Nuevo campo para el total solo de transacciones en efectivo
          date: dateKey
        };
      }
      
      // Sumar al total del día considerando devoluciones
      const originalAmount = transaction.amount || 0;
      const refundAmount = transaction.refundAmount || 0;
      const effectiveAmount = originalAmount - refundAmount;
      
      groups[dateKey].transactions.push(transaction);
      
      // Verificar si es una transacción con tarjeta de crédito
      const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;
      
      // Para el total general siempre sumamos todas las transacciones (con monto efectivo)
      groups[dateKey].total += effectiveAmount;
      
      // Solo sumamos al cashTotal si NO es una transacción con tarjeta
      if (!isCreditCard) {
        groups[dateKey].cashTotal += effectiveAmount;
      }
      
      if (transaction.hiddenFromList) {
        groups[dateKey].hiddenTotal += effectiveAmount;
      } else {
        groups[dateKey].visibleTotal += effectiveAmount;
      }
      
      return groups;
    }, {});
    
    // Ordenar fechas de más reciente a más antigua
    const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
      if (a === 'Invalid Date') return 1; // 'Invalid Date' al final
      if (b === 'Invalid Date') return -1;
      
      // Intentar convertir a formatos de fecha más común
      const dateA = parseFechaFlexible(a);
      const dateB = parseFechaFlexible(b);
      
      return dateB - dateA; // De más reciente a más antigua
    });
    
    // Objeto para íconos de categoría
    const getCategoryIcon = (category) => {
      const categoryMapping = {
        'Supermercado': <ShoppingCartIcon />,
        'Alimentos': <RestaurantIcon />,
        'Restaurante': <RestaurantIcon />,
        'Comida': <FastfoodIcon />,
        'Transporte': <CommuteIcon />,
        'Auto': <DirectionsCarIcon />,
        'Nafta': <LocalGasStationIcon />,
        'Viajes': <FlightIcon />,
        'Educación': <SchoolIcon />,
        'Entretenimiento': <SportsEsportsIcon />,
        'Hogar': <HomeIcon />,
        'Casa': <HomeIcon />,
        'Servicios': <ElectricalServicesIcon />,
        'Salud': <HealthAndSafetyIcon />,
        'Ropa': <CheckroomIcon />,
        'Tecnología': <DevicesIcon />,
        'Trabajo': <WorkIcon />,
        'Extras': <MoreHorizIcon />,
        'Ahorro': <SavingsIcon />,
        'Inversiones': <TrendingUpIcon />
      };
      
      // Busca coincidencias parciales si no hay una coincidencia exacta
      if (categoryMapping[category]) {
        return categoryMapping[category];
      }
      
      const categoryLower = category?.toLowerCase() || '';
      for (const [key, icon] of Object.entries(categoryMapping)) {
        if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
          return icon;
        }
      }
      
      return <CategoryIcon />;
    };
    
    // Función para obtener información visual del método de pago
    const getPaymentMethodInfo = (transaction) => {
      // Verificar explícitamente si es una transacción de tarjeta de crédito
      const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;
      
      if (isCreditCard) {
        return {
          icon: <CreditCardIcon />,
          label: 'Tarjeta de crédito', // Simplificar a un texto fijo sin mostrar IDs confusos
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1),
          borderColor: alpha(theme.palette.info.light, 0.5)
        };
      } else {
        // Siempre usar el estilo verde para efectivo
        return {
          icon: <PaymentsIcon />,
          label: 'Efectivo',
          color: theme.palette.success.dark,
          bgColor: alpha(theme.palette.success.main, 0.1),
          borderColor: alpha(theme.palette.success.light, 0.5)
        };
      }
    };
    
    // Calcular totales para los contadores superiores considerando devoluciones
    const totals = {
      all: filteredTransactions.reduce((sum, t) => {
        const originalAmount = t.amount || 0;
        const refundAmount = t.refundAmount || 0;
        return sum + (originalAmount - refundAmount);
      }, 0),
      visible: filteredTransactions.filter(t => !t.hiddenFromList).reduce((sum, t) => {
        const originalAmount = t.amount || 0;
        const refundAmount = t.refundAmount || 0;
        return sum + (originalAmount - refundAmount);
      }, 0),
      hidden: filteredTransactions.filter(t => t.hiddenFromList).reduce((sum, t) => {
        const originalAmount = t.amount || 0;
        const refundAmount = t.refundAmount || 0;
        return sum + (originalAmount - refundAmount);
      }, 0),
      // Totales adicionales
      withoutCard: filteredTransactions.filter(t => !t.hiddenFromList && !t.excludeFromTotal).reduce((sum, t) => {
        const originalAmount = t.amount || 0;
        const refundAmount = t.refundAmount || 0;
        return sum + (originalAmount - refundAmount);
      }, 0),
      withCard: filteredTransactions.filter(t => !t.hiddenFromList && t.excludeFromTotal).reduce((sum, t) => {
        const originalAmount = t.amount || 0;
        const refundAmount = t.refundAmount || 0;
        return sum + (originalAmount - refundAmount);
      }, 0),
      count: filteredTransactions.length,
      hiddenCount: filteredTransactions.filter(t => t.hiddenFromList).length,
      visibleCount: filteredTransactions.filter(t => !t.hiddenFromList).length,
      cardCount: filteredTransactions.filter(t => t.excludeFromTotal).length
    };
    
    // Componente para renderizar una transacción individual
    const TransactionItem = ({ transaction, dateGroup }) => {
      const paymentInfo = getPaymentMethodInfo(transaction);
      
      // Determinar si es una transacción con tarjeta que se excluye de los totales
      const isExcludedFromTotal = transaction.excludeFromTotal;
      
      // Calcular montos considerando devoluciones
      const originalAmount = transaction.amount || 0;
      const refundAmount = transaction.refundAmount || 0;
      const effectiveAmount = originalAmount - refundAmount;
      const hasRefund = transaction.hasRefund || false;
      
      return (
        <Box 
          sx={{ 
            p: 2,
            borderRadius: 2,
            mb: 1,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            ...(isExcludedFromTotal && {
              borderStyle: 'dashed',
              borderColor: theme.palette.info.light,
              bgcolor: alpha(theme.palette.info.main, 0.04)
            }),
            ...(hasRefund && {
              borderLeftWidth: 4,
              borderLeftColor: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.02)
            })
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2} sm={1}>
              <Box 
                sx={{ 
                  bgcolor: getCategoryColor(transaction.category || 'default', 0),
                  color: 'white',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {getCategoryIcon(transaction.category || 'default')}
                {hasRefund && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      bgcolor: theme.palette.success.main,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${theme.palette.background.paper}`
                    }}
                  >
                    <UndoIcon sx={{ fontSize: 10, color: 'white' }} />
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={dataType === 'expenses' ? 6 : 7} sm={dataType === 'expenses' ? 7 : 8}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {transaction.description}
                {isExcludedFromTotal && (
                  <Chip 
                    label="Tarjeta" 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      borderRadius: 1
                    }} 
                  />
                )}
                {hasRefund && (
                  <Chip 
                    label={`Devolución: ${formatAmount(refundAmount)}`}
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      borderRadius: 1
                    }} 
                  />
                )}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  label={transaction.category}
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: alpha(getCategoryColor(transaction.category || 'default', 0), 0.1),
                    color: getCategoryColor(transaction.category || 'default', 0)
                  }}
                />
                {transaction.subcategory && (
                  <Chip
                    label={transaction.subcategory}
                    size="small"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(getCategoryColor(transaction.category || 'default', 0), 0.2)}`,
                      color: 'text.secondary'
                    }}
                  />
                )}
                
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    ml: 1,
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    bgcolor: paymentInfo.bgColor,
                    border: `1px solid ${paymentInfo.borderColor}`
                  }}
                >
                  <Box component="span" sx={{ color: paymentInfo.color, display: 'flex', mr: 0.5, fontSize: 14 }}>
                    {paymentInfo.icon}
                  </Box>
                  <Typography variant="caption" sx={{ color: paymentInfo.color, fontWeight: 'medium' }}>
                    {paymentInfo.label}
                  </Typography>
                </Box>
              </Stack>
              
            </Grid>
            <Grid item xs={1} sm={1} sx={{ textAlign: 'right' }}>
              {/* Botón de devolución para gastos */}
                {dataType === 'expenses' && !hasRefund && (
                  <Grid item xs={1} sm={1} sx={{ textAlign: 'right' }}>
                    <Tooltip title="Procesar devolución" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenRefund(transaction)}
                        sx={{
                          color: theme.palette.success.main,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.success.main, 0.2),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <UndoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
            </Grid>
            <Grid item xs={3} sm={3} sx={{ textAlign: 'right' }}>
              {hasRefund ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: 'text.secondary',
                      fontSize: '0.9rem'
                    }}
                  >
                    ${formatAmount(originalAmount)}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold" 
                    color={effectiveAmount < 0 ? 'success.main' : 'error.main'}
                  >
                    {formatAmount(effectiveAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    USD {formatAmount(effectiveAmount / (transaction.valorUSD || dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold" 
                    color={originalAmount < 0 ? 'success.main' : 'error.main'}
                  >
                    ${formatAmount(originalAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    USD {formatAmount(transaction.amountUSD || (originalAmount / (transaction.valorUSD || dollarRate?.venta || 1)))}
                  </Typography>
                </Box>
              )}
            </Grid>
            
          </Grid>
        </Box>
      );
    };
    
    // Componente para renderizar el grupo de una fecha
    const DateGroupCard = ({ dateData, date }) => {
      const formattedDate = obtenerFechaFormateada(date);
      const isExpanded = expandedDates[date] === true; // Explícitamente comprobar si es true
      
      // Verificar si hay transacciones con tarjeta en este grupo
      const hasCreditCardTransactions = dateData.transactions.some(
        t => t.paymentMethod === 'creditCard' || t.creditCardTransaction === true || t.excludeFromTotal === true
      );
      
      // Calcular los totales separados por método de pago considerando devoluciones
      const cashTotal = dateData.transactions
        .filter(t => !t.excludeFromTotal)
        .reduce((sum, t) => {
          const originalAmount = t.amount || 0;
          const refundAmount = t.refundAmount || 0;
          return sum + (originalAmount - refundAmount);
        }, 0);
        
      const cardTotal = dateData.transactions
        .filter(t => t.excludeFromTotal)
        .reduce((sum, t) => {
          const originalAmount = t.amount || 0;
          const refundAmount = t.refundAmount || 0;
          return sum + (originalAmount - refundAmount);
        }, 0);
      
      return (
        <Card 
          elevation={5} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'transform 0.2s',
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.08)}`
            }
          }}
        >
          {/* Cabecera de fecha */}
          <Box 
            onClick={() => handleToggleDate(date)}
            sx={{ 
              p: 2,
              borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
                }}
              >
                <CalendarTodayIcon />
              </Avatar>
              
              <Box>
                <Typography variant="h6" fontWeight="medium">
                  {formattedDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dateData.transactions.length} {dateData.transactions.length === 1 ? 'transacción' : 'transacciones'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Stack alignItems="flex-end">
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                >
                  ${formatAmount(cashTotal)} {/* Solo mostramos el total en efectivo */}
                </Typography>
                
              </Stack>
              
              <IconButton 
                size="small" 
                edge="end"
                sx={{ 
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(180deg)' : 'none'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Contenido de las transacciones */}
          {isExpanded && (
            <Box sx={{ p: 2 }}>
              {dateData.transactions.map((transaction, idx) => (
                <TransactionItem 
                  key={idx} 
                  transaction={transaction} 
                  dateGroup={dateData}
                />
              ))}
            </Box>
          )}
        </Card>
      );
    };
    
    return (
      <Card 
        elevation={1} 
        sx={{ 
          height: '625px', // Altura aumentada para más espacio en el listado
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Cabecera */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(90deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
          display: 'none'
        }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">
            Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
          </Typography>
        </Box>
        
        {/* Panel de búsqueda mejorado (quitar el panel de totales) */}
        <Box sx={{ 
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <FormControl variant="outlined" size="small" fullWidth>
                <OutlinedInput
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Buscar por descripción, categoría, subcategoría, monto o método de pago..."
                  startAdornment={<FilterListIcon color="action" sx={{ mr: 1 }} />}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    '&:hover': {
                      boxShadow: `0 0 5px ${alpha(theme.palette.primary.main, 0.2)}`
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                />
                {searchText && (
                  <Typography variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                    Mostrando {filteredTransactions.length} resultados para "{searchText}"
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {/* Lista de transacciones */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
        }}>
          {sortedDates.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: theme.palette.background.paper,
                border: `1px dashed ${theme.palette.divider}`
              }}
            >
              <FilterListIcon color="disabled" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No hay resultados
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Prueba a cambiar tu búsqueda para ver más transacciones
              </Typography>
            </Paper>
          ) : (
            sortedDates.map(date => (
              <DateGroupCard 
                key={date} 
                date={date} 
                dateData={transactionsByDate[date]} 
              />
            ))
          )}
        </Box>
      </Card>
    );
  };

  // Definir acciones para el SpeedDial
  const actions = [
    { icon: <TrendingDownIcon />, name: 'Nuevo Gasto', action: () => navigate('/NuevoGasto'), color: theme.palette.error.main },
    { icon: <TrendingUpIcon />, name: 'Nuevo Ingreso', action: () => navigate('/NuevoIngreso'), color: theme.palette.success.main }
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanels({
      ...expandedPanels,
      [panel]: isExpanded
    });
  };
  
  // El return principal del componente Finances
  return (
    <Layout title="Análisis Financiero">
      <Box 
        sx={{ 
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          pt: 0,
          pb: 4,
          margin: 0,
          maxWidth: 'none'
        }}
      >
        {/* Navegador de tiempo/fecha */}
        <TimeNavigator />
        
        
        
        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 2 }, mt: 0 }}>
          {/* Columna izquierda */}
          <Grid item xs={12} md={6}>
            {/* Panel superior - Resumen de gastos con gráfico integrado */}
            <TransactionsPanelWithChart />
            
          </Grid>
          
          {/* Panel superior derecho - Lista de transacciones */}
          <Grid item xs={12} md={6}>
            <TransactionsListPanel />
          </Grid>

          
          {/* Tendencias Anuales con totales integrados */}
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
            {/* Tarjeta grande: Gráfico de tendencias anuales con totales integrados */}
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
                          {annualBalance >= 0 ? 
                            <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} /> : 
                            <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
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
          
          {/* Nueva sección de Ahorros y Patrimonio con tarjetas */}
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
            {/* Tarjeta: Evolución de Ahorros con resumen integrado */}
            <Grid item xs={12} sm={12} md={12} lg={12}>
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
                           {/* Cotización en la misma línea del título */}
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

                  {/* Gráfico de evolución histórica */}
                  {userData && userData.savings && userData.savings.amountARSHistory && Object.keys(userData.savings.amountARSHistory).length > 0 ? (
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
                          categories: (() => {
                            // Obtener todas las fechas disponibles
                            const allDates = Object.keys(userData.savings.amountARSHistory);
                            
                            // Convertir claves a fechas para poder filtrar por los últimos 6 meses
                            const dateEntries = allDates.map(key => {
                              // Intentar extraer fecha del registro
                              let entryDate;
                              const dateStr = userData.savings.amountARSHistory[key].date;
                              
                              if (typeof dateStr === 'string' && dateStr.includes('/')) {
                                const [day, month, year] = dateStr.split('/').map(Number);
                                entryDate = new Date(year, month - 1, day);
                              } else {
                                // Si no hay fecha en formato estándar, intentar con la clave
                                entryDate = new Date(key);
                              }
                              
                              return { 
                                key, 
                                date: entryDate
                              };
                            });
                            
                            // Calcular fecha límite (6 meses atrás desde hoy)
                            const today = new Date();
                            const sixMonthsAgo = new Date();
                            sixMonthsAgo.setMonth(today.getMonth() - 6);
                            
                            // Filtrar solo entradas de los últimos 6 meses
                            const filteredEntries = dateEntries
                              .filter(entry => !isNaN(entry.date.getTime()) && entry.date >= sixMonthsAgo)
                              .sort((a, b) => a.date - b.date); // Ordenar cronológicamente
                            
                            // Extraer las claves ordenadas
                            const filteredKeys = filteredEntries.map(entry => entry.key);
                            
                            // Convertir fechas a formato legible
                            return filteredKeys.map(key => {
                              const dateStr = userData.savings.amountARSHistory[key].date;
                              
                              if (typeof dateStr === 'string' && dateStr.includes('/')) {
                                // Extraer mes y año para mostrar "Mes/Año"
                                const [day, month, year] = dateStr.split('/').map(Number);
                                const monthName = getMonthName(month).substring(0, 3);
                                return `${monthName}/${year.toString().slice(2)}`;
                              }
                              return dateStr;
                            });
                          })(),
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
                          x: { 
                            formatter: function(value, { series, seriesIndex, dataPointIndex }) {
                              // Recuperar la clave original y mostrar la fecha completa
                              const allDates = Object.keys(userData.savings.amountARSHistory);
                              const dateEntries = allDates.map(key => {
                                let entryDate;
                                const dateStr = userData.savings.amountARSHistory[key].date;
                                
                                if (typeof dateStr === 'string' && dateStr.includes('/')) {
                                  const [day, month, year] = dateStr.split('/').map(Number);
                                  entryDate = new Date(year, month - 1, day);
                                } else {
                                  entryDate = new Date(key);
                                }
                                
                                return { key, date: entryDate };
                              });

                              // Filtrar por los últimos 6 meses
                              const today = new Date();
                              const sixMonthsAgo = new Date();
                              sixMonthsAgo.setMonth(today.getMonth() - 6);
                              
                              const filteredEntries = dateEntries
                                .filter(entry => !isNaN(entry.date.getTime()) && entry.date >= sixMonthsAgo)
                                .sort((a, b) => a.date - b.date);
                              
                              // Obtener la fecha original del punto seleccionado
                              if (filteredEntries[dataPointIndex]) {
                                const key = filteredEntries[dataPointIndex].key;
                                const originalDate = userData.savings.amountARSHistory[key].date;
                                
                                if (typeof originalDate === 'string' && originalDate.includes('/')) {
                                  const [day, month, year] = originalDate.split('/').map(Number);
                                  return `${day} de ${getMonthName(month)} de ${year}`;
                                }
                                return originalDate;
                              }
                              return value;
                            }
                          },
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
                        data: (() => {
                          // Obtener todas las fechas disponibles
                          const allDates = Object.keys(userData.savings.amountARSHistory);
                          
                          // Convertir claves a fechas para poder filtrar por los últimos 6 meses
                          const dateEntries = allDates.map(key => {
                            // Intentar extraer fecha del registro
                            let entryDate;
                            const dateStr = userData.savings.amountARSHistory[key].date;
                            
                            if (typeof dateStr === 'string' && dateStr.includes('/')) {
                              const [day, month, year] = dateStr.split('/').map(Number);
                              entryDate = new Date(year, month - 1, day);
                            } else {
                              // Si no hay fecha en formato estándar, intentar con la clave
                              entryDate = new Date(key);
                            }
                            
                            return { 
                              key, 
                              date: entryDate,
                              total: userData.savings.amountARSHistory[key].newTotal
                            };
                          });
                          
                          // Calcular fecha límite (6 meses atrás desde hoy)
                          const today = new Date();
                          const sixMonthsAgo = new Date();
                          sixMonthsAgo.setMonth(today.getMonth() - 6);
                          
                          // Filtrar solo entradas de los últimos 6 meses
                          const filteredEntries = dateEntries
                            .filter(entry => !isNaN(entry.date.getTime()) && entry.date >= sixMonthsAgo)
                            .sort((a, b) => a.date - b.date); // Ordenar cronológicamente
                          
                          // Extraer los valores ordenados
                          return filteredEntries.map(entry => entry.total);
                        })()
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
        </Grid>

      {/* Dialog para procesar devolución */}
      <Dialog 
        open={openRefundDialog} 
        onClose={handleCloseRefund}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: 56,
                height: 56
              }}
            >
              <UndoIcon fontSize="large" />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                Procesar Devolución
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {selectedTransaction?.description}
              </Typography>
            </Box>
            
            <IconButton
              onClick={handleCloseRefund}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Información del gasto original */}
            <Card
              elevation={0}
              sx={{
                mb: 3,
                p: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Gasto original
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {formatAmount(selectedTransaction?.amount || 0)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {selectedTransaction?.date}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Monto a devolver
                </Typography>
                <TextField
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  fullWidth
                  type="number"
                  placeholder="0"
                  variant="outlined"
                  size="large"
                  inputProps={{
                    max: selectedTransaction?.amount || 0,
                    min: 0.01,
                    step: 0.01
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          $
                        </Typography>
                      </Box>
                    ),
                    sx: {
                      fontSize: '1.2rem',
                      fontWeight: 'medium',
                      '& input': {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.08)
                      },
                      '&.Mui-focused': {
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        '& fieldset': {
                          borderColor: theme.palette.success.main,
                          borderWidth: 2
                        }
                      }
                    }
                  }}
                />
                {refundForm.amount && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Equivalente: USD {formatAmount(parseFloat(refundForm.amount || 0) / (dollarRate?.venta || 1))}
                  </Typography>
                )}
                {refundForm.amount && parseFloat(refundForm.amount) > (selectedTransaction?.amount || 0) && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                    La devolución no puede ser mayor al gasto original
                  </Typography>
                )}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Descripción
                </Typography>
                <TextField
                  value={refundForm.description}
                  onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
                  fullWidth
                  placeholder="Describe el motivo de la devolución"
                  variant="outlined"
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Opcional - Describe el motivo de esta devolución
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        <Box
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button 
            onClick={handleProcessRefund}
            variant="contained"
            disabled={
              !refundForm.amount || 
              parseFloat(refundForm.amount) <= 0 ||
              parseFloat(refundForm.amount) > (selectedTransaction?.amount || 0)
            }
            startIcon={<UndoIcon />}
            fullWidth
            size="large"
            sx={{
              borderRadius: 2,
              py: 1.5,
              bgcolor: theme.palette.success.main,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: theme.shadows[3],
              '&:hover': {
                bgcolor: theme.palette.success.dark,
                boxShadow: theme.shadows[6],
                transform: 'translateY(-1px)'
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.grey[300],
                color: theme.palette.grey[500]
              },
              transition: 'all 0.2s ease'
            }}
          >
            Procesar Devolución
          </Button>
        </Box>
      </Dialog>

      {/* SpeedDial para acciones rápidas */}
      <SpeedDial
        ariaLabel="Acciones rápidas de finanzas"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
            right: 24 
        }}
        icon={<SpeedDialIcon />}
        open={openSpeedDial}
          onOpen={() => setOpenSpeedDial(true)}
          onClose={() => setOpenSpeedDial(false)}
      >
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

export default Finances;