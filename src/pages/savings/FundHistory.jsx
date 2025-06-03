import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  IconButton,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  useMediaQuery,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount, getDate } from '../../utils';
import { database, auth } from '../../firebase';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import PetsIcon from '@mui/icons-material/Pets';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import EmptyStateIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const FundHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { fundId } = useParams();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();
  
  // Obtener el fondo específico
  const fund = userData?.savingsFunds?.[fundId];
  
  // Estados para navegación mensual
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth()
    };
  });
  
  // Estados para estadísticas del mes seleccionado
  const [monthStats, setMonthStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    transactionCount: 0,
    avgDeposit: 0,
    avgWithdrawal: 0
  });

  // Iconos disponibles para los fondos
  const availableIcons = {
    SavingsIcon: <SavingsIcon />,
    HomeIcon: <HomeIcon />,
    DevicesIcon: <DevicesIcon />,
    CheckroomIcon: <CheckroomIcon />,
    RestaurantIcon: <RestaurantIcon />,
    DirectionsCarIcon: <DirectionsCarIcon />,
    FlightIcon: <FlightIcon />,
    LocalHospitalIcon: <LocalHospitalIcon />,
    SchoolIcon: <SchoolIcon />,
    PetsIcon: <PetsIcon />,
    MonetizationOnIcon: <MonetizationOnIcon />,
    AccountBalanceIcon: <AccountBalanceIcon />
  };

  // Función para parsear fechas en formato DD/MM/YYYY correctamente
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    // Si ya es un objeto Date, devolverlo tal como está
    if (dateString instanceof Date) return dateString;
    
    // Separar DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JavaScript van de 0-11
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Si no tiene el formato esperado, intentar crear la fecha normalmente
    return new Date(dateString);
  };

  // Funciones para navegación mensual
  const navigateMonth = (direction) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev.year, prev.month + direction, 1);
      return {
        year: newDate.getFullYear(),
        month: newDate.getMonth()
      };
    });
  };

  // Función para filtrar transacciones por mes
  const filterTransactionsByMonth = (transactions, year, month) => {
    return transactions.filter(([_, transaction]) => {
      const transactionDate = parseDate(transaction.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });
  };

  // Función para obtener meses disponibles
  const getAvailableMonths = () => {
    if (!fund?.history) return [];
    
    const months = new Set();
    Object.values(fund.history).forEach(transaction => {
      const date = parseDate(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(monthKey);
    });
    
    return Array.from(months).map(monthKey => {
      const [year, month] = monthKey.split('-');
      return {
        year: parseInt(year),
        month: parseInt(month),
        label: new Date(parseInt(year), parseInt(month)).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        })
      };
    }).sort((a, b) => new Date(b.year, b.month) - new Date(a.year, a.month));
  };

  // Función para formatear el mes seleccionado
  const formatSelectedMonth = () => {
    return new Date(selectedMonth.year, selectedMonth.month).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Calcular estadísticas del mes seleccionado
  useEffect(() => {
    if (fund?.history) {
      const allTransactions = Object.entries(fund.history);
      const monthTransactions = filterTransactionsByMonth(allTransactions, selectedMonth.year, selectedMonth.month);
      const monthDeposits = monthTransactions.filter(([_, t]) => t.type === 'deposit');
      const monthWithdrawals = monthTransactions.filter(([_, t]) => t.type === 'withdrawal');
      
      const totalDeposits = monthDeposits.reduce((sum, [_, t]) => sum + (t.amount || 0), 0);
      const totalWithdrawals = monthWithdrawals.reduce((sum, [_, t]) => sum + (t.amount || 0), 0);
      
      setMonthStats({
        totalDeposits,
        totalWithdrawals,
        transactionCount: monthTransactions.length,
        avgDeposit: monthDeposits.length > 0 ? totalDeposits / monthDeposits.length : 0,
        avgWithdrawal: monthWithdrawals.length > 0 ? totalWithdrawals / monthWithdrawals.length : 0
      });
    }
  }, [fund, selectedMonth]);

  // Obtener transacciones ordenadas por fecha
  const sortedTransactions = fund?.history 
    ? Object.entries(fund.history)
        .sort((a, b) => parseDate(b[1].date) - parseDate(a[1].date))
    : [];

  // Obtener transacciones filtradas según el modo de vista
  const getFilteredTransactions = () => {
    return filterTransactionsByMonth(sortedTransactions, selectedMonth.year, selectedMonth.month);
  };

  const filteredTransactions = getFilteredTransactions();
  const currentStats = monthStats;
  const availableMonths = getAvailableMonths();

  // Si no se encuentra el fondo, mostrar error
  if (!fund) {
    return (
      <Layout title="Historial del Fondo">
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <EmptyStateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Fondo no encontrado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              El fondo que buscas no existe o ha sido eliminado.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/ahorros')}
            >
              Volver a Ahorros
            </Button>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title={`Historial - ${fund.name}`}>
      <Box 
        sx={{ 
          maxWidth: { xs: 1200, md: 1400, lg: 1600 }, 
          mx: 'auto', 
          width: '100%',
          px: { xs: 1, sm: 2, md: 3 },
          py: 3
        }}
      >
        {/* Breadcrumbs */}
        <Box 
          sx={{ 
            mb: 4, 
            p: { xs: 2, sm: 3 },
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ 
              '& .MuiBreadcrumbs-separator': {
                color: theme.palette.primary.main,
                opacity: 0.7
              }
            }}
          >
            <Link 
              underline="hover" 
              color="primary"
              onClick={() => navigate('/ahorros')}
              sx={{ 
                cursor: 'pointer',
                fontWeight: 'medium',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  color: theme.palette.primary.dark
                }
              }}
            >
              <SavingsIcon fontSize="small" />
              Ahorros
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {availableIcons[fund.icon] && React.cloneElement(availableIcons[fund.icon], { fontSize: "small" })}
              {fund.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Navegador Mensual */}
        <Card 
          elevation={2}
          sx={{ 
            mb: 4,
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${theme.palette.primary.main} 100%)`,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 }
                  }}
                >
                  <CalendarMonthIcon />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                    Navegador Mensual
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Controles de navegación mensual */}
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              {/* Botón anterior */}
              <IconButton
                onClick={() => navigateMonth(-1)}
                disabled={availableMonths.length === 0}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <NavigateBeforeIcon color="primary" />
              </IconButton>

              {/* Selector de mes */}
              <Box sx={{ 
                flex: 1, 
                textAlign: 'center',
                px: 2,
                py: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatSelectedMonth()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentStats.transactionCount} {currentStats.transactionCount === 1 ? 'transacción' : 'transacciones'}
                </Typography>
              </Box>

              {/* Botón siguiente */}
              <IconButton
                onClick={() => navigateMonth(1)}
                disabled={availableMonths.length === 0 || 
                  (selectedMonth.year === new Date().getFullYear() && selectedMonth.month === new Date().getMonth())
                }
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <NavigateNextIcon color="primary" />
              </IconButton>
            </Stack>
          </Box>
        </Card>

        {/* Estadísticas del fondo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
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
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Total Depositado
                      </Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                        En el mes
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.success.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(currentStats.totalDeposits)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(currentStats.totalDeposits / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
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
                  background: `linear-gradient(to right, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
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
                      <TrendingDownIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Total Retirado
                      </Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                        En el mes
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.error.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(currentStats.totalWithdrawals)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(currentStats.totalWithdrawals / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
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
                      <HistoryIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Transacciones
                      </Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                        Del mes
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.info.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {currentStats.transactionCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {currentStats.transactionCount === 1 ? 'movimiento' : 'movimientos'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
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
                  background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                      <TimelineIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Promedio Depósito
                      </Typography>
                      <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                        Por transacción
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.warning.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(currentStats.avgDeposit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(currentStats.avgDeposit / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de transacciones */}
        <Card 
          elevation={3}
          sx={{ 
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-2px)' },
              boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
            }
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              background: `linear-gradient(to right, ${fund.color ? alpha(fund.color, 0.8) : theme.palette.primary.dark}, ${fund.color || theme.palette.primary.main})`,
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
                <HistoryIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Historial de Transacciones
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transacción registrada' : 'transacciones registradas'}
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          {filteredTransactions.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay transacciones en {formatSelectedMonth().toLowerCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prueba navegando a otro mes usando los controles de arriba
              </Typography>
            </Box>
          ) : (
            <Box sx={{ bgcolor: 'background.paper' }}>
              <List>
                {filteredTransactions.map(([transactionId, transaction], index) => (
                  <React.Fragment key={transactionId}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: transaction.type === 'deposit' 
                              ? theme.palette.success.main 
                              : theme.palette.error.main,
                            width: 48,
                            height: 48
                          }}
                        >
                          {transaction.type === 'deposit' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {transaction.description}
                            </Typography>
                            {/* Indicador visual del balance si está disponible */}
                            {transaction.newTotal !== undefined && (
                              <Box 
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  borderRadius: 1,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                }}
                              >
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  Balance:
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="primary.main" 
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {formatAmount(transaction.newTotal)}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip
                              icon={<CalendarTodayIcon />}
                              label={parseDate(transaction.date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={transaction.type === 'deposit' ? 'Depósito' : 'Retiro'}
                              size="small"
                              sx={{
                                bgcolor: transaction.type === 'deposit' 
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.error.main, 0.1),
                                color: transaction.type === 'deposit' 
                                  ? theme.palette.success.main
                                  : theme.palette.error.main
                              }}
                            />
                            {/* Mostrar balance después de la transacción si está disponible */}
                            {transaction.newTotal !== undefined && (
                              <Chip
                                label={`Balance: ${formatAmount(transaction.newTotal)}`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 'medium'
                                }}
                              />
                            )}
                          </Stack>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                          >
                            {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            USD {formatAmount(transaction.amount / (dollarRate?.venta || 1))}
                          </Typography>
                          {/* Mostrar balance resultante en la parte derecha también */}
                          {transaction.newTotal !== undefined && (
                            <Typography 
                              variant="caption" 
                              color="primary.main" 
                              sx={{ 
                                display: 'block',
                                fontWeight: 'bold',
                                mt: 0.5
                              }}
                            >
                              → {formatAmount(transaction.newTotal)}
                            </Typography>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    {index < filteredTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Card>
      </Box>
    </Layout>
  );
};

export default FundHistory; 