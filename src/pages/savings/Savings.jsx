import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  Fade,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Tooltip,
  Container
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount, getDate } from '../../utils';
import { database, auth } from '../../firebase';

import SavingsIcon from '@mui/icons-material/Savings';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useNavigate } from 'react-router-dom';

const Savings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  
  // Estados para diálogos
  const [openCreateFund, setOpenCreateFund] = useState(false);
  const [openAddMoney, setOpenAddMoney] = useState(false);
  const [openWithdrawMoney, setOpenWithdrawMoney] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  
  // Estados para formularios
  const [fundForm, setFundForm] = useState({
    name: '',
    description: '',
    frequency: 'daily', // daily, weekly, monthly
    target: ''
  });
  
  const [moneyForm, setMoneyForm] = useState({
    amount: '',
    description: ''
  });

  // Obtener fondos de ahorro del userData
  const savingsFunds = userData?.savingsFunds || {};

  // Debug: verificar qué datos tenemos
  useEffect(() => {
    console.log('userData:', userData);
    console.log('savingsFunds:', savingsFunds);
    console.log('Object.keys(savingsFunds):', Object.keys(savingsFunds));
  }, [userData, savingsFunds]);

  // Función para crear un nuevo fondo
  const handleCreateFund = async () => {
    if (!fundForm.name.trim()) return;

    const newFund = {
      name: fundForm.name.trim(),
      description: fundForm.description.trim(),
      frequency: fundForm.frequency,
      target: fundForm.target ? parseFloat(fundForm.target) : null,
      balance: 0,
      createdAt: new Date().toISOString(),
      lastContribution: null,
      history: []
    };

    try {
      // Crear el fondo en Firebase usando push()
      database.ref(`${auth.currentUser.uid}/savingsFunds`).push(newFund);
      
      setOpenCreateFund(false);
      setFundForm({
        name: '',
        description: '',
        frequency: 'daily',
        target: ''
      });
    } catch (error) {
      console.error('Error al crear fondo:', error);
    }
  };

  // Función para agregar dinero a un fondo
  const handleAddMoney = async () => {
    if (!selectedFund || !moneyForm.amount) return;

    const amount = parseFloat(moneyForm.amount);
    if (amount <= 0) return;

    // Verificar que hay suficientes ahorros
    const currentSavings = userData.savings?.amountARS || 0;
    if (amount > currentSavings) {
      alert('No tienes suficientes ahorros para transferir a este fondo');
      return;
    }

    // Calcular el nuevo balance del fondo
    const newBalance = (selectedFund.balance || 0) + amount;

    const transaction = {
      type: 'deposit',
      amount: amount,
      description: moneyForm.description.trim() || 'Depósito',
      date: getDate(),
      timestamp: Date.now(),
      newTotal: newBalance // Almacenar el balance después de la operación
    };

    try {
      // Actualizar el balance del fondo
      database.ref(`${auth.currentUser.uid}/savingsFunds/${selectedFund.id}/balance`).set(newBalance);
      database.ref(`${auth.currentUser.uid}/savingsFunds/${selectedFund.id}/lastContribution`).set(new Date().toISOString());
      
      // Agregar transacción al historial del fondo
      database.ref(`${auth.currentUser.uid}/savingsFunds/${selectedFund.id}/history`).push(transaction);

      // Reducir los ahorros (movemos dinero DESDE ahorros HACIA el fondo)
      const newSavingsTotal = currentSavings - amount;
      database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(newSavingsTotal);
      
      // Registrar en el historial de savings (con signo negativo porque se reduce)
      database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
        date: getDate(),
        amount: -amount,
        newTotal: newSavingsTotal,
        description: `Transferencia a fondo: ${selectedFund.name}`,
        type: 'fund_transfer'
      });
      
      setOpenAddMoney(false);
      setMoneyForm({ amount: '', description: '' });
      setSelectedFund(null);
    } catch (error) {
      console.error('Error al agregar dinero:', error);
    }
  };

  // Función para retirar dinero de un fondo
  const handleWithdrawMoney = async () => {
    if (!selectedFund || !moneyForm.amount) return;

    const amount = parseFloat(moneyForm.amount);
    if (amount <= 0) return;

    if (amount > (selectedFund.balance || 0)) {
      alert('No hay suficiente dinero en el fondo');
      return;
    }

    // Calcular el nuevo balance del fondo
    const newBalance = (selectedFund.balance || 0) - amount;

    const transaction = {
      type: 'withdrawal',
      amount: amount,
      description: moneyForm.description.trim() || 'Retiro',
      date: getDate(),
      timestamp: Date.now(),
      newTotal: newBalance // Almacenar el balance después de la operación
    };

    try {
      // Actualizar el balance del fondo
      database.ref(`${auth.currentUser.uid}/savingsFunds/${selectedFund.id}/balance`).set(newBalance);
      
      // Agregar transacción al historial del fondo
      database.ref(`${auth.currentUser.uid}/savingsFunds/${selectedFund.id}/history`).push(transaction);

      // Aumentar los ahorros (movemos dinero DESDE el fondo HACIA ahorros)
      const currentSavings = userData.savings?.amountARS || 0;
      const newSavingsTotal = currentSavings + amount;
      database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(newSavingsTotal);
      
      // Registrar en el historial de savings (con signo positivo porque se incrementa)
      database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
        date: getDate(),
        amount: amount,
        newTotal: newSavingsTotal,
        description: `Retiro de fondo: ${selectedFund.name}`,
        type: 'fund_withdrawal'
      });
      
      setOpenWithdrawMoney(false);
      setMoneyForm({ amount: '', description: '' });
      setSelectedFund(null);
    } catch (error) {
      console.error('Error al retirar dinero:', error);
    }
  };

  // Función para obtener el icono de frecuencia
  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'daily': return <TodayIcon />;
      case 'weekly': return <CalendarViewWeekIcon />;
      case 'monthly': return <DateRangeIcon />;
      default: return <AccessTimeIcon />;
    }
  };

  // Función para obtener el texto de frecuencia
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return 'Personalizado';
    }
  };

  // Calcular total de todos los fondos
  const totalFundsBalance = Object.values(savingsFunds)
    .filter(fund => fund && typeof fund === 'object') // Filtrar valores null/undefined
    .reduce((total, fund) => total + (fund.balance || 0), 0);



  return (
    <Layout title="Fondos de Ahorro">
      <Box 
        sx={{ 
          maxWidth: { xs: 1200, md: 1400, lg: 1600 }, 
          mx: 'auto', 
          width: '100%',
          px: { xs: 1, sm: 2, md: 3 },
          py: 3
        }}
      >
        {/* Fila superior: Tarjetas de ahorros como en Home */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2 }} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            mt: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}
        >
          {/* Ahorros Disponibles */}
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
                      <MonetizationOnIcon />
                    </Avatar>
                    <Box>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                        Ahorros Disponibles
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
                    Dinero disponible para fondos
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.info.main,
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

          {/* Total en Fondos */}
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
                      Total en Fondos
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Dinero en todos los fondos
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.success.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount(totalFundsBalance)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {Object.values(savingsFunds).filter(fund => fund && typeof fund === 'object').length} {Object.values(savingsFunds).filter(fund => fund && typeof fund === 'object').length === 1 ? 'fondo' : 'fondos'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Total Ahorros (Disponibles + Fondos) */}
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
                    <AccountBalanceIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Total Patrimonio ARS
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Ahorros disponibles + fondos
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ 
                    color: theme.palette.primary.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {formatAmount((userData?.savings?.amountARS || 0) + totalFundsBalance)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    USD {formatAmount(((userData?.savings?.amountARS || 0) + totalFundsBalance) / (dollarRate?.venta || 1))}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Lista de fondos */}
        <Grid container spacing={3}>
          {Object.values(savingsFunds).filter(fund => fund && typeof fund === 'object').length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <SavingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No tienes fondos de ahorro
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Crea tu primer fondo para empezar a ahorrar de forma organizada
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateFund(true)}
                >
                  Crear Primer Fondo
                </Button>
              </Card>
            </Grid>
          ) : (
            Object.entries(savingsFunds)
              .filter(([fundId, fund]) => fund && typeof fund === 'object') // Filtrar fondos null/undefined
              .map(([fundId, fund]) => (
              <Grid item xs={12} sm={6} md={4} key={fundId}>
                <Card 
                  elevation={3}
                  sx={{ 
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
                  {/* Header del fondo con gradiente */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 }
                          }}
                        >
                          <SavingsIcon fontSize={isMobile ? "small" : "medium"} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            lineHeight: 1.2
                          }}>
                            {fund.name}
                          </Typography>
                          {fund.description && (
                            <Typography variant="caption" color="white" sx={{ 
                              opacity: 0.8,
                              fontSize: '0.75rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {fund.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Chip
                        icon={getFrequencyIcon(fund.frequency)}
                        label={getFrequencyText(fund.frequency)}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 24,
                          '& .MuiChip-icon': { 
                            color: 'white',
                            fontSize: 14
                          }
                        }}
                      />
                    </Stack>
                  </Box>

                  {/* Contenido compacto */}
                  <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.paper' }}>
                    {/* Balance principal */}
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                        Balance actual
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ 
                        color: theme.palette.primary.main,
                        letterSpacing: '-0.5px',
                        mb: 0.5,
                        fontSize: { xs: '1.5rem', sm: '1.8rem' }
                      }}>
                        {formatAmount(fund.balance || 0)}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" fontWeight="medium">
                        USD {formatAmount((fund.balance || 0) / (dollarRate?.venta || 1))}
                      </Typography>
                    </Box>

                    {/* Progreso hacia la meta */}
                    {fund.target && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="medium">
                            Progreso hacia la meta
                          </Typography>
                          <Typography variant="caption" color="text.primary" fontWeight="bold">
                            {(((fund.balance || 0) / fund.target) * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(((fund.balance || 0) / fund.target) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: theme.palette.primary.main,
                              borderRadius: 3
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Meta: {formatAmount(fund.target)}
                        </Typography>
                      </Box>
                    )}

                    {/* Botones de acción más compactos */}
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedFund({ ...fund, id: fundId });
                            setOpenAddMoney(true);
                          }}
                          sx={{ 
                            flex: 1,
                            bgcolor: theme.palette.primary.main,
                            py: 0.8,
                            fontWeight: 'medium',
                            fontSize: '0.8rem',
                            '&:hover': { 
                              bgcolor: theme.palette.primary.dark,
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Agregar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<TrendingDownIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setSelectedFund({ ...fund, id: fundId });
                            setOpenWithdrawMoney(true);
                          }}
                          sx={{ 
                            flex: 1,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            py: 0.8,
                            fontWeight: 'medium',
                            fontSize: '0.8rem',
                            '&:hover': { 
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Retirar
                        </Button>
                      </Stack>
                      
                      {/* Botón de historial más pequeño */}
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<HistoryIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/ahorros/fondo/${fundId}`)}
                        sx={{ 
                          color: theme.palette.primary.main,
                          py: 0.5,
                          fontWeight: 'medium',
                          fontSize: '0.75rem',
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Ver Historial
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* FAB para crear nuevo fondo */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setOpenCreateFund(true)}
        >
          <AddIcon />
        </Fab>

        {/* Dialog para crear fondo */}
        <Dialog 
          open={openCreateFund} 
          onClose={() => setOpenCreateFund(false)}
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
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
              position: 'relative'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  width: 56,
                  height: 56
                }}
              >
                <SavingsIcon fontSize="large" />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Crear Nuevo Fondo
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Organiza tus ahorros
                </Typography>
              </Box>
              
              <IconButton
                onClick={() => setOpenCreateFund(false)}
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
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Nombre del fondo
                  </Typography>
                  <TextField
                    value={fundForm.name}
                    onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })}
                    fullWidth
                    placeholder="Ej: Fondo puchito, Tecnología, Vacaciones..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2
                          }
                        }
                      }
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Descripción
                  </Typography>
                  <TextField
                    value={fundForm.description}
                    onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Describe el propósito de este fondo..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Opcional - Explica para qué vas a usar este fondo
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Frecuencia de contribución
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={fundForm.frequency}
                      onChange={(e) => setFundForm({ ...fundForm, frequency: e.target.value })}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 2
                        }
                      }}
                    >
                      <MenuItem value="daily">Diaria</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    ¿Con qué frecuencia planeas agregar dinero?
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Meta de ahorro
                  </Typography>
                  <TextField
                    value={fundForm.target}
                    onChange={(e) => setFundForm({ ...fundForm, target: e.target.value })}
                    fullWidth
                    type="number"
                    placeholder="0"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                            $
                          </Typography>
                        </Box>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Opcional - Establece una meta hacia la cual ahorrar
                  </Typography>
                </Box>

                {/* Vista previa del fondo */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                      <SavingsIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                        {fundForm.name || 'Nombre del fondo'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fundForm.description || 'Descripción del fondo'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        $ 0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getFrequencyText(fundForm.frequency)}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
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
              onClick={handleCreateFund}
              variant="contained"
              disabled={!fundForm.name.trim()}
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: theme.palette.primary.main,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: theme.shadows[3],
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
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
              Crear Fondo
            </Button>
          </Box>
        </Dialog>

        {/* Dialog para agregar dinero */}
        <Dialog 
          open={openAddMoney} 
          onClose={() => setOpenAddMoney(false)}
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
                <SavingsIcon fontSize="large" />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Transferir Dinero
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {selectedFund?.name}
                </Typography>
              </Box>
              
              <IconButton
                onClick={() => setOpenAddMoney(false)}
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
              {/* Información de ahorros disponibles */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                    <AccountBalanceWalletIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ahorros disponibles
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {formatAmount(userData?.savings?.amountARS || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      USD
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                      {formatAmount((userData?.savings?.amountARS || 0) / (dollarRate?.venta || 1))}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Cantidad a transferir
                  </Typography>
                  <TextField
                    value={moneyForm.amount}
                    onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })}
                    fullWidth
                    type="number"
                    placeholder="0"
                    variant="outlined"
                    size="large"
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
                            borderColor: selectedFund?.color || theme.palette.success.main,
                            borderWidth: 2
                          }
                        }
                      }
                    }}
                  />
                  {moneyForm.amount && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Equivalente: USD {formatAmount(parseFloat(moneyForm.amount || 0) / (dollarRate?.venta || 1))}
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Descripción
                  </Typography>
                  <TextField
                    value={moneyForm.description}
                    onChange={(e) => setMoneyForm({ ...moneyForm, description: e.target.value })}
                    fullWidth
                    placeholder="Ej: Ahorros del cigarrillo de hoy"
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
                    Opcional - Describe el motivo de esta transferencia
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
              onClick={handleAddMoney}
              variant="contained"
              disabled={
                !moneyForm.amount || 
                parseFloat(moneyForm.amount) <= 0 ||
                parseFloat(moneyForm.amount) > (userData?.savings?.amountARS || 0)
              }
              startIcon={<TrendingUpIcon />}
              fullWidth
              size="large"
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: selectedFund?.color || theme.palette.success.main,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: theme.shadows[3],
                '&:hover': {
                  bgcolor: selectedFund?.color ? alpha(selectedFund.color, 0.8) : theme.palette.success.dark,
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
              Transferir
            </Button>
          </Box>
        </Dialog>

        {/* Dialog para retirar dinero */}
        <Dialog 
          open={openWithdrawMoney} 
          onClose={() => setOpenWithdrawMoney(false)}
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
              background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
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
                <SavingsIcon fontSize="large" />
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Retirar Dinero
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {selectedFund?.name}
                </Typography>
              </Box>
              
              <IconButton
                onClick={() => setOpenWithdrawMoney(false)}
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
              {/* Información del saldo del fondo */}
              <Card
                elevation={0}
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    width: 40, 
                    height: 40 
                  }}>
                    <SavingsIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Saldo disponible en el fondo
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ 
                      color: theme.palette.primary.main 
                    }}>
                      {formatAmount(selectedFund?.balance || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      USD
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="text.primary">
                      {formatAmount((selectedFund?.balance || 0) / (dollarRate?.venta || 1))}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Cantidad a retirar
                  </Typography>
                  <TextField
                    value={moneyForm.amount}
                    onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })}
                    fullWidth
                    type="number"
                    placeholder="0"
                    variant="outlined"
                    size="large"
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
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2
                          }
                        }
                      }
                    }}
                  />
                  {moneyForm.amount && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Equivalente: USD {formatAmount(parseFloat(moneyForm.amount || 0) / (dollarRate?.venta || 1))}
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Descripción
                  </Typography>
                  <TextField
                    value={moneyForm.description}
                    onChange={(e) => setMoneyForm({ ...moneyForm, description: e.target.value })}
                    fullWidth
                    placeholder="Ej: Compra de equipamiento"
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
                    Opcional - Describe el motivo de este retiro
                  </Typography>
                </Box>

                {/* Advertencia sobre el retiro */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.warning.main,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      El dinero retirado se agregará a tus ahorros disponibles
                    </Typography>
                  </Stack>
                </Card>
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
              onClick={handleWithdrawMoney}
              variant="contained"
              disabled={
                !moneyForm.amount || 
                parseFloat(moneyForm.amount) <= 0 || 
                parseFloat(moneyForm.amount) > (selectedFund?.balance || 0)
              }
              startIcon={<TrendingDownIcon />}
              fullWidth
              size="large"
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: theme.palette.error.main,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: theme.shadows[3],
                '&:hover': {
                  bgcolor: theme.palette.error.dark,
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
              Retirar
            </Button>
          </Box>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Savings; 