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
  SpeedDialAction
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const Finances = () => {
  const { userData, dollarRate } = useStore();
  const [dataType, setDataType] = useState('expenses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  
  const navigate = useNavigate();
  
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
    if (monthData) {
      // Preparar datos de categorías para el mes seleccionado
      const categoryData = {};
      
      // Si hay un array de datos, procesamos todas las transacciones para agrupar por categoría
      if (monthData.data && Array.isArray(monthData.data)) {
        // Procesar todas las transacciones, incluidas las de tarjeta
        monthData.data.forEach(transaction => {
          const category = transaction.category || "Sin categoría";
          
          if (!categoryData[category]) {
            categoryData[category] = {
              total: 0,
              percentage: 0,
              subcategories: {}
            };
          }
          
          // Si no está oculta de la lista, sumamos al total
          if (!transaction.hiddenFromList) {
            categoryData[category].total += transaction.amount || 0;
            
            // Agregar subcategoría si existe
            if (transaction.subcategory) {
              if (!categoryData[category].subcategories[transaction.subcategory]) {
                categoryData[category].subcategories[transaction.subcategory] = 0;
              }
              categoryData[category].subcategories[transaction.subcategory] += transaction.amount || 0;
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
    
    // Llenar los datos de gastos e ingresos por mes, excluyendo transacciones ocultas
    if (userData.finances?.expenses?.[selectedYear]?.months) {
      Object.keys(userData.finances.expenses[selectedYear].months).forEach(month => {
        const monthIndex = parseInt(month) - 1;
        const monthData = userData.finances.expenses[selectedYear].months[month];
        
        // Si hay datos detallados, calcular el total excluyendo transacciones ocultas
        if (monthData.data && Array.isArray(monthData.data)) {
          const visibleData = monthData.data.filter(transaction => !transaction.hiddenFromList);
          expenseData[monthIndex] = visibleData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        } else {
          // Si no hay datos detallados, usar el total (que puede incluir transacciones ocultas)
          expenseData[monthIndex] = monthData.total || 0;
        }
      });
    }
    
    if (userData.finances?.incomes?.[selectedYear]?.months) {
      Object.keys(userData.finances.incomes[selectedYear].months).forEach(month => {
        const monthIndex = parseInt(month) - 1;
        incomeData[monthIndex] = userData.finances.incomes[selectedYear].months[month].total || 0;
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

  // Navegador de tiempo (Año/Mes)
  const TimeNavigator = () => {
    // Obtener el mes y año actuales para resaltarlos
    const isCurrentMonth = selectedMonth === (new Date().getMonth() + 1) && selectedYear === new Date().getFullYear();
    
    return (
      <Card 
        elevation={3} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5, // Asegurar que esté por encima de otros elementos
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          py: 1.5,
          px: 2
        }}>
          <Grid container spacing={2} alignItems="center">
            {/* Tipo de datos (Gastos/Ingresos) */}
            <Grid item xs={12} sm={4} md={3} lg={2}>
              <ButtonGroup 
                variant="contained" 
                fullWidth
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiButton-root': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 'bold'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)'
                    }
                  }
                }}
              >
                <Button 
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setDataType('expenses')}
                  disabled={dataType === 'expenses'}
                  sx={{
                    bgcolor: dataType === 'expenses' ? theme.palette.error.main : 'rgba(255,255,255,0.15)',
                    '&.Mui-disabled': {
                      bgcolor: theme.palette.error.main,
                    }
                  }}
                >
                  Gastos
                </Button>
                <Button 
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setDataType('incomes')}
                  disabled={dataType === 'incomes'}
                  sx={{
                    bgcolor: dataType === 'incomes' ? theme.palette.success.main : 'rgba(255,255,255,0.15)',
                    '&.Mui-disabled': {
                      bgcolor: theme.palette.success.main,
                    }
                  }}
                >
                  Ingresos
                </Button>
              </ButtonGroup>
            </Grid>
            
            {/* Navegación meses */}
            <Grid item xs={12} sm={8} md={9} lg={10}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    alignItems="center" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      p: 0.5,
                      height: '100%'
                    }}
                  >
                    <IconButton 
                      onClick={handlePreviousMonth} 
                      color="inherit"
                      size="small"
                      sx={{ 
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    
                    <ButtonGroup
                      variant="text"
                      sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        '& .MuiButton-root': {
                          borderRadius: 1.5,
                          color: 'white',
                          px: 1,
                          mx: 0.2,
                          minWidth: 'auto',
                          fontSize: '0.8rem',
                          '&.active': {
                            bgcolor: 'rgba(255,255,255,0.25)',
                            fontWeight: 'bold'
                          },
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.15)'
                          }
                        }
                      }}
                    >
                      {months.map((month) => (
                        <Button
                          key={month.value}
                          className={selectedMonth === month.value ? 'active' : ''}
                          onClick={() => setSelectedMonth(month.value)}
                          sx={{
                            display: isMobile ? (
                              month.value === selectedMonth - 1 || 
                              month.value === selectedMonth || 
                              month.value === selectedMonth + 1 ? 'block' : 'none'
                            ) : (
                              isTablet ? (
                                Math.abs(month.value - selectedMonth) <= 2 ? 'block' : 'none'
                              ) : 'block'
                            )
                          }}
                        >
                          {month.label.substring(0, 3)}
                        </Button>
                      ))}
                    </ButtonGroup>
                    
                    <IconButton 
                      onClick={handleNextMonth} 
                      color="inherit"
                      size="small"
                      sx={{ 
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </Stack>
                </Grid>
                
                <Grid item xs={6} md={2.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.15)'
                      }}
                    >
                      <CalendarTodayIcon sx={{ color: 'white', fontSize: '1rem' }} />
                    </Box>
                    <Select
                      value={selectedYear}
                      onChange={handleYearChange}
                      displayEmpty
                      size="small"
                      sx={{
                        width: '100%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white'
                        },
                        '& .MuiSelect-select': {
                          fontWeight: 'bold'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: theme.palette.primary.main,
                            '& .MuiMenuItem-root': {
                              color: 'white',
                              '&.Mui-selected': {
                                bgcolor: 'rgba(255,255,255,0.15)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.25)'
                                }
                              },
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)'
                              }
                            }
                          }
                        }
                      }}
                    >
                      {availableYears.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </Stack>
                </Grid>
                
                <Grid item xs={6} md={2.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => {
                      setSelectedMonth(new Date().getMonth() + 1);
                      setSelectedYear(new Date().getFullYear());
                    }}
                    sx={{
                      height: '100%',
                      color: 'white',
                      borderColor: isCurrentMonth ? 'white' : 'rgba(255,255,255,0.5)',
                      bgcolor: isCurrentMonth ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Mes Actual
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Card>
    );
  };
  
  // Componente para el panel de detalles de transacciones
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
              background: `linear-gradient(45deg, ${dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main} 30%, ${dataType === 'expenses' ? theme.palette.error.dark : theme.palette.success.dark} 90%)`,
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
                
                <Paper elevation={2} sx={{ 
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
                    elevation={2} 
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
                              <Box sx={{ width: '100%', bgcolor: theme.palette.grey[100], borderRadius: 5, height: 8 }}>
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
        
        {/* Detalle de Subcategorías */}
        {monthlyData.sortedCategories.length > 0 && (
          <Card elevation={1} sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
            borderRadius: 2, 
            mb: 3,
            flexGrow: 1, // Ocupa el espacio restante
            bgcolor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}>
            <CardHeader
              title={
                <Stack direction="row" spacing={1} alignItems="center">
                  <CategoryIcon sx={{ 
                    color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main
                  }} />
                  <Typography variant="h6">
                    Análisis por Categoría
                  </Typography>
                </Stack>
              }
              sx={{ 
                bgcolor: theme.palette.grey[100], 
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            />

            <CardContent sx={{ 
              p: 0, 
              overflowY: 'auto',
              flexGrow: 1, // Para que ocupe el espacio restante
              '&:last-child': { pb: 0 } // Quitar padding-bottom por defecto
            }}>
              {/* Nuevas pestañas para diferentes tipos de análisis */}
              <Box sx={{ p: 0 }}>
                {/* Sección con métricas clave */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Grid container spacing={2}>
                    {/* Top 3 categorías */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: theme.palette.grey[50],
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }
                      }}>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                          Top Categorías
                        </Typography>
                        
                        {monthlyData.sortedCategories.slice(0, 3).map(([category, data], index) => {
                          const categoryColors = [
                            dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main,
                            theme.palette.warning.main,
                            theme.palette.info.main
                          ];
                          
                          return (
                            <Stack 
                              key={index} 
                              direction="row" 
                              alignItems="center" 
                              spacing={1.5} 
                              sx={{ 
                                mt: 1,
                                p: 1,
                                bgcolor: `${categoryColors[index]}15`,
                                borderRadius: 1,
                                border: `1px solid ${categoryColors[index]}30`
                              }}
                            >
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: `${categoryColors[index]}25`, 
                                  color: categoryColors[index]
                                }}
                              >
                                {getCategoryIcon(category)}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="medium" 
                                  noWrap 
                                  sx={{ color: categoryColors[index] }}
                                >
                                  {category}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ display: 'block', color: 'text.secondary' }}
                                >
                                  {data.percentage.toFixed(1)}% del total
                                </Typography>
                              </Box>
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="bold"
                                sx={{ color: categoryColors[index] }}
                              >
                                {formatAmount(data.total)}
                              </Typography>
                            </Stack>
                          );
                        })}
                        
                        {monthlyData.sortedCategories.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                            + {monthlyData.sortedCategories.length - 3} categorías más
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                    
                    {/* Frecuencia de gastos */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: theme.palette.grey[50],
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }
                      }}>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                          Distribución de Transacciones
                        </Typography>
                        
                        {/* Calcular la cantidad de transacciones por categoría */}
                        {(() => {
                          // Obtener las transacciones del mes
                          const transactionsData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth]?.data || [];
                          
                          // Contar transacciones por categoría
                          const countByCategory = {};
                          let totalCount = 0;
                          
                          transactionsData.forEach(transaction => {
                            if (!transaction.hiddenFromList) {
                              const category = transaction.category || "Sin categoría";
                              countByCategory[category] = (countByCategory[category] || 0) + 1;
                              totalCount++;
                            }
                          });
                          
                          // Ordenar por cantidad de transacciones
                          const sortedByCount = Object.entries(countByCategory)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3);
                          
                          return sortedByCount.map(([category, count], index) => {
                            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                            const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main];
  
  return (
                              <Box key={index} sx={{ mt: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {category}
                                  </Typography>
                                  <Chip 
                                    size="small" 
                                    label={`${count} ${count === 1 ? 'transacción' : 'transacciones'}`}
                                    sx={{ 
                                      bgcolor: `${colors[index]}15`,
                                      color: colors[index],
                                      fontWeight: 'medium',
                                      fontSize: '0.7rem'
                                    }} 
                                  />
                                </Stack>
                                <Box sx={{ width: '100%', bgcolor: theme.palette.grey[200], borderRadius: 5, height: 6 }}>
                                  <Box
                                    sx={{
                                      width: `${Math.min(percentage, 100)}%`,
                                      bgcolor: colors[index],
                                      height: 6,
                                      borderRadius: 5
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                                  {percentage.toFixed(1)}% del total
                                </Typography>
                              </Box>
                            );
                          });
                        })()}
                      </Paper>
      </Grid>
                    
                    {/* Promedio por transacción */}
                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        border: `1px solid ${theme.palette.divider}`, 
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: theme.palette.grey[50],
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }
                      }}>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                          Promedio por Transacción
                        </Typography>
                        
                        {(() => {
                          // Obtener las transacciones del mes
                          const transactionsData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth]?.data || [];
                          
                          // Calcular promedio por categoría
                          const avgByCategory = {};
                          const countByCategory = {};
                          
                          transactionsData.forEach(transaction => {
                            if (!transaction.hiddenFromList) {
                              const category = transaction.category || "Sin categoría";
                              const amount = transaction.amount || 0;
                              
                              if (!avgByCategory[category]) {
                                avgByCategory[category] = 0;
                                countByCategory[category] = 0;
                              }
                              
                              avgByCategory[category] += amount;
                              countByCategory[category]++;
                            }
                          });
                          
                          // Calcular el promedio
                          Object.keys(avgByCategory).forEach(category => {
                            avgByCategory[category] = countByCategory[category] > 0 
                              ? avgByCategory[category] / countByCategory[category] 
                              : 0;
                          });
                          
                          // Ordenar por promedio
                          const sortedByAvg = Object.entries(avgByCategory)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3);
                          
                          return sortedByAvg.map(([category, avg], index) => {
                            const colors = [
                              theme.palette.success.dark,
                              theme.palette.warning.dark,
                              theme.palette.info.dark
                            ];
                            
                            // Encontrar el valor máximo para escalar la barra
                            const maxAvg = sortedByAvg[0][1];
                            const percentage = maxAvg > 0 ? (avg / maxAvg) * 100 : 0;
                            
                            return (
                              <Box key={index} sx={{ mt: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {category}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color={colors[index]}>
                                    {formatAmount(avg)}
                                  </Typography>
                                </Stack>
                                <Box sx={{ 
                                  p: 1, 
                                  bgcolor: `${colors[index]}15`,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ 
                                      bgcolor: colors[index],
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      mr: 1
                                    }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {countByCategory[category]} {countByCategory[category] === 1 ? 'transacción' : 'transacciones'}
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    size="small"
                                    label={`${formatAmount(avg)}/tx`}
                                    sx={{ 
                                      height: 20,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      bgcolor: `${colors[index]}25`,
                                      color: colors[index]
                                    }}
                                  />
                                </Box>
                              </Box>
                            );
                          });
                        })()}
                      </Paper>
      </Grid>
                  </Grid>
                </Box>
                
                {/* Tabla de categorías detallada */}
                <Box sx={{ p: 0 }}>
                  {/* Título de sección */}
                  <Box sx={{ 
                    px: 3, 
                    py: 2, 
                    bgcolor: theme.palette.grey[50],
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EqualizerIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Desglose Detallado
                      </Typography>
                    </Stack>
                  </Box>
                  
                  {/* Tabla de categorías */}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                          <TableCell width="40%">Categoría</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="center">Promedio</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlyData.sortedCategories.map(([category, data], index) => {
                          // Calcular estadísticas avanzadas
                          const transactionsData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth]?.data || [];
                          const categoryTransactions = transactionsData.filter(
                            t => !t.hiddenFromList && t.category === category
                          );
                          
                          const count = categoryTransactions.length;
                          const total = data.total;
                          const average = count > 0 ? total / count : 0;
                          
                          // Color alternado para filas
                          const bgColor = index % 2 === 0 ? 'transparent' : theme.palette.grey[50];
                          
                          return (
                            <TableRow 
                              key={index}
                              sx={{ 
                                bgcolor: bgColor,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  bgcolor: dataType === 'expenses' 
                                    ? `${theme.palette.error.light}10`
                                    : `${theme.palette.success.light}10`
                                }
                              }}
                            >
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ 
                                    width: 28, 
                                    height: 28, 
                                    bgcolor: `${dataType === 'expenses' ? theme.palette.error.light : theme.palette.success.light}20`,
                                    color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main
                                  }}>
                                    {React.cloneElement(getCategoryIcon(category), { style: { fontSize: '1rem' } })}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="medium">
                                    {category}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  size="small" 
                                  label={count}
                                  sx={{ 
                                    minWidth: 60,
                                    height: 20,
                                    fontSize: '0.75rem',
                                    bgcolor: theme.palette.grey[100]
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  {formatAmount(average)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                                >
                                  {formatAmount(total)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  size="small" 
                                  label={`${data.percentage.toFixed(1)}%`}
                                  sx={{ 
                                    minWidth: 50,
                                    height: 20,
                                    fontSize: '0.75rem',
                                    bgcolor: dataType === 'expenses' 
                                      ? `${theme.palette.error.light}20` 
                                      : `${theme.palette.success.light}20`,
                                    color: dataType === 'expenses' 
                                      ? theme.palette.error.main 
                                      : theme.palette.success.main
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Sección de subcategorías destacadas */}
                  <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Subcategorías Destacadas
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {(() => {
                        // Aplanar todas las subcategorías
                        const allSubcategories = [];
                        
                        monthlyData.sortedCategories.forEach(([category, data]) => {
                          Object.entries(data.subcategories || {}).forEach(([subcategory, amount]) => {
                            allSubcategories.push({
                              category,
                              subcategory,
                              amount
                            });
                          });
                        });
                        
                        // Ordenar por monto
                        const sortedSubcategories = allSubcategories
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 9); // Mostrar top 9
                        
                        return sortedSubcategories.map((item, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper elevation={0} sx={{ 
                              p: 1.5, 
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                              }
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="medium"
                                    sx={{ 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.subcategory}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.category}
                                  </Typography>
                                </Stack>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight="bold" 
                                  color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                                >
                                  {formatAmount(item.amount)}
                                </Typography>
                              </Box>
                              
                              {/* Barra de progreso */}
                              <Box sx={{ 
                                mt: 1, 
                                width: '100%', 
                                bgcolor: theme.palette.grey[100], 
                                borderRadius: 5, 
                                height: 6 
                              }}>
                                <Box
                                  sx={{
                                    width: `${Math.min((item.amount / monthlyData.sortedCategories[0][1].total) * 100, 100)}%`,
                                    bgcolor: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main,
                                    height: 6,
                                    borderRadius: 5
                                  }}
                                />
                              </Box>
                            </Paper>
                          </Grid>
                        ));
                      })()}
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
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
            
            // Añadimos todas las transacciones sin filtrar
            allTransactions.push({...transaction});
          });
          
          console.log('Transacciones recuperadas:', allTransactions.length, 'incluyendo tarjetas:', 
            allTransactions.filter(t => t.creditCardTransaction || t.paymentMethod === 'creditCard').length);
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
            background: `linear-gradient(90deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
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
                bgcolor: theme.palette.grey[50],
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
      return allTransactions.filter(transaction => {
        // Filtrar por texto de búsqueda
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower);
          const categoryMatch = transaction.category?.toLowerCase().includes(searchLower);
          const subcategoryMatch = transaction.subcategory?.toLowerCase().includes(searchLower);
          const amountMatch = transaction.amount?.toString().includes(searchLower);
          const paymentMethodMatch = 
            (transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction) 
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
      
      // Sumar al total del día
      const amount = transaction.amount || 0;
      groups[dateKey].transactions.push(transaction);
      
      // Verificar si es una transacción con tarjeta de crédito
      const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;
      
      // Para el total general siempre sumamos todas las transacciones
      groups[dateKey].total += amount;
      
      // Solo sumamos al cashTotal si NO es una transacción con tarjeta
      if (!isCreditCard) {
        groups[dateKey].cashTotal += amount;
      }
      
      if (transaction.hiddenFromList) {
        groups[dateKey].hiddenTotal += amount;
      } else {
        groups[dateKey].visibleTotal += amount;
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
          bgColor: `${theme.palette.info.light}20`,
          borderColor: theme.palette.info.light
        };
      } else {
        // Siempre usar el estilo verde para efectivo
        return {
          icon: <PaymentsIcon />,
          label: 'Efectivo',
          color: theme.palette.success.dark,
          bgColor: `${theme.palette.success.light}20`,
          borderColor: theme.palette.success.light
        };
      }
    };
    
    // Calcular totales para los contadores superiores
    const totals = {
      all: filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      visible: filteredTransactions.filter(t => !t.hiddenFromList).reduce((sum, t) => sum + (t.amount || 0), 0),
      hidden: filteredTransactions.filter(t => t.hiddenFromList).reduce((sum, t) => sum + (t.amount || 0), 0),
      count: filteredTransactions.length,
      hiddenCount: filteredTransactions.filter(t => t.hiddenFromList).length,
      visibleCount: filteredTransactions.filter(t => !t.hiddenFromList).length
    };
    
    // Componente para renderizar una transacción individual
    const TransactionItem = ({ transaction, dateGroup }) => {
      const paymentMethod = getPaymentMethodInfo(transaction);
      // Detectar explícitamente si es transacción de tarjeta
      const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;
      
      return (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 1.5, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: isCreditCard ? `${theme.palette.info.light}40` : theme.palette.divider,
            bgcolor: isCreditCard ? `${theme.palette.info.light}08` : 'background.paper',
            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
              bgcolor: isCreditCard ? `${theme.palette.info.light}12` : theme.palette.grey[50]
            }
          }}
        >
          {/* Indicador lateral de tipo de pago */}
          <Box 
            sx={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: 4,
              bgcolor: paymentMethod.color,
              opacity: 0.7
            }} 
          />
          
          <Grid container spacing={2} alignItems="flex-start">
            {/* Icono de categoría */}
            <Grid item>
              <Avatar 
                sx={{ 
                  bgcolor: `${isCreditCard ? theme.palette.info.light : theme.palette.grey[200]}20`,
                  color: isCreditCard ? theme.palette.info.main : theme.palette.grey[700],
                  width: 40,
                  height: 40
                }}
              >
                {React.cloneElement(getCategoryIcon(transaction.category), { fontSize: 'small' })}
              </Avatar>
      </Grid>
            
            {/* Información principal */}
            <Grid item xs>
              <Stack spacing={0.5}>
                <Typography 
                  variant="subtitle1" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: isCreditCard ? theme.palette.info.dark : 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {transaction.description}
                  {isCreditCard && (
                    <Chip 
                      size="small" 
                      label="Tarjeta" 
                      color="info" 
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }} 
                    />
                  )}
                  {transaction.installments > 1 && (
                    <Chip 
                      size="small"
                      label={`${transaction.currentInstallment || 1}/${transaction.installments}`}
                      color="warning"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Chip 
                    size="small"
                    label={transaction.category}
                    sx={{ 
                      height: 22,
                      bgcolor: theme.palette.grey[100],
                      color: theme.palette.text.secondary
                    }}
                  />
                  
                  {transaction.subcategory && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChevronRightIcon fontSize="inherit" sx={{ mx: -0.5 }} />
                      {transaction.subcategory}
                    </Typography>
                  )}
                </Box>
              </Stack>
      </Grid>
            
            {/* Método de pago e importe */}
            <Grid item xs={12} sm="auto">
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                sx={{ mt: { xs: 1, sm: 0 } }}
              >
                <Chip
                  size="small"
                  icon={React.cloneElement(paymentMethod.icon, { fontSize: 'small' })}
                  label={paymentMethod.label}
                  sx={{
                    bgcolor: paymentMethod.bgColor,
                    color: paymentMethod.color,
                    border: '1px solid',
                    borderColor: paymentMethod.borderColor,
                    '& .MuiChip-icon': {
                      color: paymentMethod.color
                    }
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    fontWeight: 'bold',
                    color: isCreditCard 
                      ? theme.palette.info.main
                      : dataType === 'expenses' 
                        ? theme.palette.error.main 
                        : theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {formatAmount(transaction.amount)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      );
    };
    
    // Componente para renderizar el grupo de una fecha
    const DateGroupCard = ({ dateData, date }) => {
      const formattedDate = obtenerFechaFormateada(date);
      const isExpanded = expandedDates[date] === true; // Explícitamente comprobar si es true
      
      // Verificar si hay transacciones con tarjeta en este grupo
      const hasCreditCardTransactions = dateData.transactions.some(
        t => t.paymentMethod === 'creditCard' || t.creditCardTransaction === true
      );
      
      return (
        <Card 
          elevation={1} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            transition: 'transform 0.2s',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
            }
          }}
        >
          {/* Cabecera de fecha */}
          <Box 
            onClick={() => handleToggleDate(date)}
            sx={{ 
              p: 2,
              bgcolor: theme.palette.grey[50],
              borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: theme.palette.grey[100] },
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  {formatAmount(dateData.cashTotal)} {/* Mostramos solo el total en efectivo */}
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
          height: '100%', 
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
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">
            Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
          </Typography>
        </Box>
        
        {/* Panel de búsqueda mejorado (quitar el panel de totales) */}
        <Box sx={{ 
          p: 2,
          bgcolor: theme.palette.grey[50],
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
                    bgcolor: 'white',
                    '&:hover': {
                      boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 8px rgba(0,0,0,0.2)'
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
            {/* Eliminar el panel de totales que estaba aquí */}
          </Grid>
        </Box>
        
        {/* Lista de transacciones */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          bgcolor: theme.palette.grey[50]
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
                bgcolor: 'background.paper',
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

  return (
    <Layout title="Análisis Financiero">
      <Box sx={{ bgcolor: theme.palette.background.main, minHeight: '100vh', pt: 2, pb: 4 }}>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TimeNavigator />
      </Grid>
      </Grid>
        
        {/* Contenido principal */}
        <Grid container spacing={3} alignItems="stretch">
          {/* Panel superior - Resumen y categorías */}
          <Grid item xs={12} md={6}>
            <TransactionsPanel />
          </Grid>
          
          {/* Panel superior derecho - Lista de transacciones */}
          <Grid item xs={12} md={6}>
            <TransactionsListPanel />
          </Grid>
          
          {/* Panel inferior - Análisis completo del año (ahora ocupa toda la fila) */}
          <Grid item xs={12}>
            <InsightCard 
              title={`Análisis Anual ${selectedYear}`} 
              icon={<AnalyticsIcon />}
              color={dataType === 'expenses' ? 'expense' : 'income'}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ReactApexChart
                    options={{
                      ...areaChartOptions,
                      colors: [theme.palette.error.main, theme.palette.success.main, theme.palette.info.main],
                      title: {
                        text: `Comparativa Ingresos vs Gastos ${selectedYear}`,
                        align: 'center',
                        style: {
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }
                      }
                    }}
                    series={areaChartSeries}
                    type="area"
                    height={350}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${theme.palette.error.main}`,
                    borderRadius: 1,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ 
                        bgcolor: `${theme.palette.error.light}30`,
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" color={theme.palette.error.main} gutterBottom>
                          Total Gastos {selectedYear}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={theme.palette.error.main}>
                          {formatAmount(annualExpenses)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    borderRadius: 1,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ 
                        bgcolor: `${theme.palette.success.light}30`,
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" color={theme.palette.success.main} gutterBottom>
                          Total Ingresos {selectedYear}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main}>
                          {formatAmount(annualIncomes)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                    borderRadius: 1,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ 
                        bgcolor: `${theme.palette.info.light}20`,
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CompareArrowsIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" color={theme.palette.info.main} gutterBottom>
                          Balance {selectedYear}
                        </Typography>
                        <Typography 
                          variant="h4" 
                          fontWeight="bold" 
                          color={annualBalance >= 0 ? theme.palette.success.main : theme.palette.error.main}
                        >
                          {formatAmount(annualBalance)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </InsightCard>
          </Grid>
          
          {/* Panel Ahorros y Patrimonio (ahora en una fila separada) */}
          <Grid item xs={12}>
            <InsightCard 
              title="Ahorros y Patrimonio" 
              icon={<SavingsIcon />}
              color="primary"
            >
              {/* Componente modificado para mostrar un resumen mejorado de los ahorros */}
              <Box sx={{ p: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ 
                      p: 2, 
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      borderRadius: 1,
                      height: '100%',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                      }
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                          bgcolor: `${theme.palette.primary.light}30`,
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <AccountBalanceWalletIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            Total Ahorros
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
                            {formatAmount(userData.savings?.total || 0)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            USD {formatAmount((userData.savings?.total || 0) / (dollarRate?.venta || 1))}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <SavingsTab 
                      data={{
                        ...userData.savings,
                        // Quitamos el mantenimiento de auto de los ahorros
                        funds: userData.savings?.funds?.filter(fund => fund.name !== 'Mantenimiento Auto') || []
                      }} 
                      type="savings" 
                    />
                  </Grid>
                </Grid>
              </Box>
            </InsightCard>
          </Grid>
        </Grid>
      </Box>

      {/* SpeedDial para acciones rápidas */}
      <SpeedDial
        ariaLabel="Acciones rápidas de finanzas"
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
        onClose={() => setOpenSpeedDial(false)}
        onOpen={() => setOpenSpeedDial(true)}
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
            setOpenSpeedDial(false);
            navigate('/NuevoGasto');
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
            setOpenSpeedDial(false);
            navigate('/NuevoIngreso');
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

export default Finances;