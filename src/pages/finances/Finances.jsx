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
  Avatar
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

const Finances = () => {
  const { userData, dollarRate } = useStore();
  const [dataType, setDataType] = useState('expenses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
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
      let total = monthData.total || 0;
      
      // Si hay un array de datos, procesamos todas las transacciones para agrupar por categoría
      if (monthData.data && Array.isArray(monthData.data)) {
        // Filtrar datos para no mostrar transacciones marcadas como ocultas
        const visibleData = monthData.data.filter(transaction => !transaction.hiddenFromList);
        
        // Agrupar transacciones por categoría (solo las visibles)
        visibleData.forEach(transaction => {
          const category = transaction.category || "Sin categoría";
          
          if (!categoryData[category]) {
            categoryData[category] = {
              total: 0,
              percentage: 0,
              subcategories: {}
            };
          }
          
          categoryData[category].total += transaction.amount || 0;
          
          // Agregar subcategoría si existe
          if (transaction.subcategory) {
            if (!categoryData[category].subcategories[transaction.subcategory]) {
              categoryData[category].subcategories[transaction.subcategory] = 0;
            }
            categoryData[category].subcategories[transaction.subcategory] += transaction.amount || 0;
          }
        });
        
        // Recalcular el total basado solo en transacciones visibles
        total = visibleData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        
        // Calcular porcentajes
        Object.keys(categoryData).forEach(category => {
          categoryData[category].percentage = total > 0 ? (categoryData[category].total / total) * 100 : 0;
        });
        
        // Actualizar monthData.data con solo las transacciones visibles
        monthData.data = visibleData;
      } else if (monthData.categories) {
        // Si ya tiene las categorías procesadas, las usamos directamente
        Object.entries(monthData.categories).forEach(([category, data]) => {
          categoryData[category] = {
            total: data.total,
            percentage: total > 0 ? (data.total / total) * 100 : 0,
            subcategories: { ...data.subcategories }
          };
        });
      }
      
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
    let total = monthData.total || 0;
    
    if (monthData.data && Array.isArray(monthData.data)) {
      // Agrupar transacciones por categoría
      monthData.data.forEach(transaction => {
        const category = transaction.category || "Sin categoría";
        
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        
        categoryData[category] += transaction.amount || 0;
      });
    } else if (monthData.categories) {
      // Si ya tiene las categorías procesadas
      Object.entries(monthData.categories).forEach(([category, data]) => {
        categoryData[category] = data.total;
      });
    }
    
    // Ordenar categorías por monto
    const sortedCategories = Object.entries(categoryData)
      .sort((a, b) => b[1] - a[1]);
    
    // Calcular el total si no está disponible
    if (total === 0 && sortedCategories.length > 0) {
      total = sortedCategories.reduce((sum, [_, value]) => sum + value, 0);
    }
    
    setCategoryChartData({
      labels: sortedCategories.map(([cat]) => cat),
      data: sortedCategories.map(([_, value]) => value),
      percentages: sortedCategories.map(([_, value]) => (total > 0 ? (value / total) * 100 : 0).toFixed(1))
    });
  };
  
  // Función para actualizar tendencias mensuales
  const updateMonthlyTrends = () => {
    const monthsArr = Array(12).fill(0).map((_, i) => i + 1);
    const expenseData = Array(12).fill(0);
    const incomeData = Array(12).fill(0);
    const balanceData = Array(12).fill(0);
    
    // Llenar los datos de gastos e ingresos por mes
    if (userData.finances?.expenses?.[selectedYear]?.months) {
      Object.keys(userData.finances.expenses[selectedYear].months).forEach(month => {
        const monthIndex = parseInt(month) - 1;
        expenseData[monthIndex] = userData.finances.expenses[selectedYear].months[month].total || 0;
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
                        {monthlyData.sortedCategories.slice(0, 5).map(([category, data], index) => (
                          <Box key={index} sx={{ mb: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ 
                                  color: dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main
                                }}>
                                  {getCategoryIcon(category)}
                                </Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {category}
                                </Typography>
                              </Stack>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold" 
                                color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                              >
                                {formatAmount(data.total)}
                              </Typography>
                            </Stack>
                            <Box sx={{ width: '100%', bgcolor: theme.palette.grey[100], borderRadius: 5, height: 8 }}>
                              <Box
                                sx={{
                                  width: `${Math.min(data.percentage, 100)}%`,
                                  bgcolor: dataType === 'expenses' ? theme.palette.error.light : theme.palette.success.light,
                                  height: 8,
                                  borderRadius: 5
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                        
                        {monthlyData.sortedCategories.length > 5 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                            + {monthlyData.sortedCategories.length - 5} categorías más
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
                    Detalle por Subcategorías
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
              <Box sx={{ p: 0 }}>
                {monthlyData.sortedCategories.map(([category, data], index) => {
                  // Ordenar subcategorías por monto
                  const sortedSubcategories = Object.entries(data.subcategories || {})
                    .sort((a, b) => b[1] - a[1]);
                  
                  // Colores más consistentes con el esquema
                  const categoryColor = [
                    theme.palette.primary.main,
                    theme.palette.secondary.main
                  ][index % 2];
                  
                  return (
                    <Box key={index}>
                      <Box 
                        sx={{ 
                          px: 3, 
                          py: 2, 
                          borderLeft: `4px solid ${categoryColor}`,
                          bgcolor: index % 2 === 0 ? theme.palette.background.paper : theme.palette.grey[100],
                          transition: 'background-color 0.2s ease',
                          '&:hover': {
                            bgcolor: dataType === 'expenses' 
                              ? `${theme.palette.error.light}20` 
                              : `${theme.palette.success.light}20`
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: categoryColor }}>
                              {getCategoryIcon(category)}
                            </Box>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="medium"
                              sx={{ color: categoryColor }}
                            >
                              {category}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="bold" 
                              color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                            >
                              {formatAmount(data.total)}
                            </Typography>
                            <Chip
                              label={`${data.percentage.toFixed(1)}%`}
                              size="small"
                              sx={{ 
                                fontWeight: 'bold',
                                bgcolor: dataType === 'expenses' 
                                  ? `${theme.palette.error.light}60` 
                                  : `${theme.palette.success.light}60`,
                                color: dataType === 'expenses' 
                                  ? theme.palette.error.main 
                                  : theme.palette.success.main,
                              }}
                            />
                          </Stack>
                        </Stack>
                        
                        {/* Subcategorías */}
                        {sortedSubcategories.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={1}>
                              {sortedSubcategories.map(([subcategory, amount], subIndex) => (
                                <Grid item xs={12} sm={6} key={subIndex}>
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      p: 1.5, 
                                      borderRadius: 1.5,
                                      bgcolor: 'background.paper',
                                      border: `1px solid ${theme.palette.divider}`,
                                      transition: 'transform 0.2s, box-shadow 0.2s',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                      }
                                    }}
                                  >
                                    <Stack direction="row" justifyContent="space-between">
                                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        {subcategory}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight="medium"
                                        color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
                                      >
                                        {formatAmount(amount)} ({((amount / data.total) * 100).toFixed(1)}%)
                                      </Typography>
                                    </Stack>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                      {index < monthlyData.sortedCategories.length - 1 && (
                        <Divider sx={{ opacity: 0.6 }} />
                      )}
                    </Box>
                  );
                })}
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
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedDates, setExpandedDates] = useState({});
    
    // Manejar la selección de categoría
    const handleCategoryChange = (event, newValue) => {
      setSelectedCategory(newValue);
    };
    
    // Cambiar el estado expandido de una fecha
    const handleToggleDate = (date) => {
      setExpandedDates(prev => ({
        ...prev,
        [date]: !prev[date]
      }));
    };
    
    // Inicializar todas las fechas como expandidas cuando cambia la categoría
    useEffect(() => {
      if (monthlyData && monthlyData.data) {
        console.log('Formatos de fechas encontrados:', monthlyData.data.map(t => t.date).filter(Boolean));
        
        const dateGroups = {};
        monthlyData.data.forEach(transaction => {
          const dateStr = transaction.date || 'Invalid Date';
          dateGroups[dateStr] = true; // Expandir todas por defecto
        });
        setExpandedDates(dateGroups);
      }
    }, [selectedCategory, monthlyData]);
    
    // Si no hay datos, mostrar mensaje
    if (!monthlyData || !monthlyData.data || monthlyData.data.length === 0) {
      return (
        <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            title={
              <Typography variant="h6">
                Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
              </Typography>
            }
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="info" sx={{ width: '100%' }}>
              <AlertTitle>Sin datos</AlertTitle>
              No hay {dataType === 'expenses' ? 'gastos' : 'ingresos'} registrados para {getMonthName(selectedMonth)} de {selectedYear}.
            </Alert>
          </CardContent>
        </Card>
      );
    }
    
    // Filtrar transacciones por categoría seleccionada
    const filteredTransactions = monthlyData.data.filter(transaction => {
      if (selectedCategory === 'all') return true;
      return transaction.category === selectedCategory;
    });
    
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
      
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push({
        ...transaction,
        parsedDate: dateKey !== 'Invalid Date' ? dateKey : null
      });
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
      const iconProps = { sx: { fontSize: 16, mr: 1 } };
      switch (category?.toLowerCase()) {
        case 'alimentación':
        case 'alimentos':
        case 'comida':
          return <RestaurantIcon {...iconProps} />;
        case 'transporte':
          return <DirectionsCarIcon {...iconProps} />;
        case 'entretenimiento':
        case 'ocio':
          return <LocalMoviesIcon {...iconProps} />;
        case 'salud':
          return <LocalHospitalIcon {...iconProps} />;
        case 'hogar':
        case 'casa':
          return <HomeIcon {...iconProps} />;
        case 'servicios':
        case 'facturas':
          return <ReceiptIcon {...iconProps} />;
        case 'educación':
          return <SchoolIcon {...iconProps} />;
        case 'ropa':
        case 'vestuario':
          return <CheckroomIcon {...iconProps} />;
        case 'tecnología':
          return <DevicesIcon {...iconProps} />;
        case 'viajes':
          return <FlightTakeoffIcon {...iconProps} />;
        case 'ahorro':
        case 'inversión':
          return <SavingsIcon {...iconProps} />;
        case 'sueldo':
        case 'ingresos laborales':
          return <WorkIcon {...iconProps} />;
        case 'otros ingresos':
        case 'otros':
          return <AttachMoneyIcon {...iconProps} />;
        default:
          return <PaymentsIcon {...iconProps} />;
      }
    };
    
    // Obtener todas las categorías únicas para los tabs
    const uniqueCategories = Array.from(
      new Set(monthlyData.data.map(t => t.category))
    ).sort();
    
    return (
      <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader 
          title={
            <Typography variant="h6">
              Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
            </Typography>
          }
        />
        <Divider />
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Todas" 
              value="all" 
              icon={<CategoryIcon />} 
              iconPosition="start"
            />
            {Array.from(new Set(monthlyData.data.map(t => t.category))).sort().map(category => (
              <Tab 
                key={category}
                label={category}
                value={category}
                icon={getCategoryIcon(category)}
                iconPosition="start"
              />
            ))}
        </Tabs>
        </Box>
        <Box 
          sx={{ 
            flexGrow: 1, // Ocupar todo el espacio disponible
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'divider',
              borderRadius: 4,
            }
          }}
        >
          {sortedDates.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>Sin datos</AlertTitle>
              No hay {dataType === 'expenses' ? 'gastos' : 'ingresos'} en la categoría seleccionada para {getMonthName(selectedMonth)} de {selectedYear}.
            </Alert>
          ) : (
            sortedDates.map(dateStr => (
              <Paper 
                key={dateStr} 
                elevation={0} 
                sx={{ 
                  mb: 2, 
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {/* Cabecera de fecha con botón expandir/contraer */}
                <Box 
                  onClick={() => handleToggleDate(dateStr)}
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    {obtenerFechaFormateada(dateStr)}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="body2" mr={1}>
                      {transactionsByDate[dateStr].length} {transactionsByDate[dateStr].length === 1 ? 'transacción' : 'transacciones'}
                    </Typography>
                    {expandedDates[dateStr] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </Box>
                
                {/* Lista de transacciones para esta fecha */}
                {expandedDates[dateStr] && (
                  <Box>
                    {transactionsByDate[dateStr].map((transaction, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 1.5, 
                          borderTop: index === 0 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Grid container alignItems="center">
                          <Grid item xs={8}>
                            <Typography 
                              variant="body1" 
                              component="div" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontWeight: 'medium'
                              }}
                            >
                              {getCategoryIcon(transaction.category)}
                              {transaction.description}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ ml: 3.5 }}
                            >
                              {transaction.category}
                            </Typography>
      </Grid>
                          <Grid item xs={4} sx={{ textAlign: 'right' }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: dataType === 'expenses' 
                                  ? theme.palette.error.main 
                                  : theme.palette.success.main,
                                fontWeight: 'bold'
                              }}
                            >
                              {formatAmount(transaction.amount)}
                            </Typography>
      </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Card>
    );
  };

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
    </Layout>
  );
};

export default Finances;