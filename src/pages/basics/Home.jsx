import React, { useState } from 'react';
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
  ListItemText
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

const Home = () => {
  const { userData, dollarRate } = useStore(); 
  const [chartPeriod, setChartPeriod] = useState('anual'); // 'anual' o 'mensual'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

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
    return userData.finances.expenses[currentYear].months[currentMonth].total;
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
                auxExpenses[month - 1] += (userData.finances.expenses[year].months[month].total);
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

  // Configuración del gráfico
  const chartOptions = {
    chart: {
      height: 350,
      type: 'mixed',
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
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: labels,
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
    grid: {
      borderColor: theme.palette.divider,
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.2
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.info.main]
  };

  const chartSeries = [
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
        >
          <DashboardIcon 
            color="disabled" 
            style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} 
          />
          <Typography variant="h5" color="textSecondary" align="center" gutterBottom>
            Cargando tu dashboard financiero...
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Por favor espera mientras obtenemos tus datos financieros.
          </Typography>
        </Box>
      </Layout>
    );
  }

  // Componentes para los KPI cards
  const KpiCard = ({ title, value, icon, change, positiveIsGood = true, secondaryValue }) => {
    const isPositive = change >= 0;
    const isChangeGood = positiveIsGood ? isPositive : !isPositive;
    const changeColor = isChangeGood ? theme.palette.success.main : theme.palette.error.main;
    const IconComponent = isPositive ? ArrowUpwardIcon : ArrowDownwardIcon;
    
    return (
      <Card elevation={3} sx={{ 
        height: '100%', 
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
        },
        borderTop: isChangeGood ? `3px solid ${theme.palette.success.main}` : `3px solid ${theme.palette.error.main}`
      }}>
        <CardContent>
          <Box sx={{ color: theme.palette.text.secondary, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              mr: 1, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${theme.palette.primary.main}20`,
              borderRadius: '50%',
              width: 36,
              height: 36
            }}>
              {React.cloneElement(icon, { color: 'primary' })}
            </Box>
            <Typography variant="body2" fontWeight="medium">
              {title}
            </Typography>
          </Box>
          
          <Typography variant="h5" component="div" fontWeight="bold" sx={{ mb: 1 }}>
            {value}
          </Typography>
          
          {secondaryValue && (
            <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mb: 1 }}>
              {secondaryValue}
            </Typography>
          )}
          
          {change !== undefined && Math.abs(change) > 0 && (
            <Box display="flex" alignItems="center" mt={1}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: changeColor,
                bgcolor: `${changeColor}15`,
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <IconComponent fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" fontWeight="medium">
                  {Math.abs(change).toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                vs. mes anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Componente para botones de acción rápida
  const ActionButton = ({ to, icon, label, color = "primary" }) => {
    return (
      <Link to={to} style={{ textDecoration: 'none' }}>
        <Button 
          variant="contained" 
          color={color}
          startIcon={icon}
          fullWidth
          sx={{ 
            py: 1.5, 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          {label}
        </Button>
      </Link>
    );
  };

  return (
    <Layout title="Dashboard Financiero">
      {/* Encabezado con resumen financiero */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        
        {/* KPIs principales */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard 
            title="Balance Mensual" 
            value={formatAmount(getBalance())}
            icon={<CompareArrowsIcon />}
            change={balanceChange}
            secondaryValue={`USD ${formatAmount(getBalance() / (dollarRate?.venta || 1))}`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard 
            title="Ingresos Mensuales" 
            value={formatAmount(getIncomeTotal())}
            icon={<TrendingUpIcon />}
            change={incomeChange}
            secondaryValue={`USD ${formatAmount(getIncomeTotal() / (dollarRate?.venta || 1))}`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard 
            title="Gastos Mensuales" 
            value={formatAmount(getExpenseTotal())}
            icon={<TrendingDownIcon />}
            change={expenseChange}
            positiveIsGood={false}
            secondaryValue={`USD ${formatAmount(getExpenseTotal() / (dollarRate?.venta || 1))}`}
          />
        </Grid>
      </Grid>
      
      {/* Sección de Gráficos y Resumen */}
      <Grid container spacing={3}>
        {/* Gráfico principal */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      mr: 1.5, 
                      bgcolor: `${theme.palette.primary.main}15`,
                      p: 1,
                      borderRadius: '50%',
                      display: 'flex'
                    }}
                  >
                    <AccountBalanceWalletIcon color="primary" />
                  </Box>
                  <Typography variant="h6">Evolución Financiera</Typography>
                </Box>
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    variant={chartPeriod === 'anual' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setChartPeriod('anual')}
                  >
                    Anual
                  </Button>
                  <Button 
                    size="small" 
                    variant={chartPeriod === 'mensual' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setChartPeriod('mensual')}
                  >
                    Mensual
                  </Button>
                </Stack>
              }
            />
            <Divider />
            <CardContent>
              <ReactApexChart 
                options={chartOptions} 
                series={chartSeries} 
                type="area" 
                height={350}
              />
            </CardContent>
          </Card>
          
          {/* Acciones rápidas */}
          <Card elevation={3}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <AddIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Acciones Rápidas</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ActionButton
                    to="/NuevoGasto"
                    icon={<TrendingDownIcon />}
                    label="Añadir Gasto"
                    color="error"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionButton
                    to="/NuevoIngreso"
                    icon={<TrendingUpIcon />}
                    label="Añadir Ingreso"
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionButton
                    to="/Exchange"
                    icon={<CurrencyExchangeIcon />}
                    label="Cambio de Divisas"
                    color="info"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionButton
                    to="/Finanzas"
                    icon={<DashboardIcon />}
                    label="Panel Financiero"
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sidebar derecha con información resumida */}
        <Grid item xs={12} md={4}>
          {/* Valor del dólar */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <CurrencyExchangeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Cotización Dólar</Typography>
                </Box>
              } 
              subheader="Valor actual del dólar"
            />
            <Divider />
            <CardContent sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">Compra</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {dollarRate && dollarRate.compra ? formatAmount(dollarRate.compra) : 'N/A'}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">Venta</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {dollarRate && dollarRate.venta ? formatAmount(dollarRate.venta) : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          {/* Resumen de Ahorros */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <SavingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Resumen de Ahorros</Typography>
                </Box>
              }
              action={
                <Tooltip title="Ver Detalles">
                  <Link to="/Finanzas" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Link>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <List disablePadding>
                <ListItem sx={{ px: 0, pb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box 
                      sx={{ 
                        bgcolor: `${theme.palette.success.main}15`,
                        p: 0.75,
                        borderRadius: '50%',
                        display: 'flex'
                      }}
                    >
                      <MonetizationOnIcon style={{ color: theme.palette.success.main }} fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ahorros en ARS"
                    secondary={userData.savings && userData.savings.amountARS ? formatAmount(userData.savings.amountARS) : 'N/A'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box 
                      sx={{ 
                        bgcolor: `${theme.palette.info.main}15`,
                        p: 0.75,
                        borderRadius: '50%',
                        display: 'flex'
                      }}
                    >
                      <AttachMoneyIcon style={{ color: theme.palette.info.main }} fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ahorros en USD"
                    secondary={userData.savings && userData.savings.amountUSD ? formatAmount(userData.savings.amountUSD) : 'N/A'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, pt: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box 
                      sx={{ 
                        bgcolor: `${theme.palette.warning.main}15`,
                        p: 0.75,
                        borderRadius: '50%',
                        display: 'flex'
                      }}
                    >
                      <DirectionsCarIcon style={{ color: theme.palette.warning.main }} fontSize="small" />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fondo Mantenimiento"
                    secondary={userData.savings && userData.savings.carMaintenance ? formatAmount(userData.savings.carMaintenance) : 'N/A'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          {/* Próximos Eventos o Calendario - Ahora enlaza a la sección de Hábitos */}
          <Card elevation={3}>
            <CardHeader 
              title={
                <Box display="flex" alignItems="center">
                  <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Seguimiento de Hábitos</Typography>
                </Box>
              }
              action={
                <Tooltip title="Ver Hábitos">
                  <Link to="/Habitos" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Link>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2
                }}
              >
                <Box 
                  sx={{ 
                    mb: 2,
                    bgcolor: `${theme.palette.secondary.main}15`,
                    p: 2,
                    borderRadius: '50%',
                    display: 'flex'
                  }}
                >
                  <CalendarTodayIcon color="secondary" style={{ fontSize: 40 }} />
                </Box>
                <Typography variant="body1" align="center" gutterBottom fontWeight="medium">
                  Seguimiento de Hábitos
                </Typography>
                <Typography variant="body2" align="center" color="textSecondary">
                  Registra tus hábitos diarios y establece recordatorios para mejorar tu productividad personal.
                </Typography>
                <Button 
                  component={Link}
                  to="/Habitos"
                  variant="contained" 
                  color="secondary" 
                  startIcon={<CalendarTodayIcon />}
                  size="small" 
                  sx={{ mt: 2 }} 
                >
                  Ir a Hábitos
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;
