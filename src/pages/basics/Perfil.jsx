import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useStore } from '../../store';
import { auth, database } from '../../firebase';
import Layout from '../../components/layout/Layout';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
  LinearProgress,
  Alert,
  Tooltip
} from '@mui/material';

// Iconos
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Perfil = () => {
  const theme = useTheme();
  const { userData } = useStore();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Estados
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    finances: {
      currentMonthIncome: 0,
      currentMonthExpense: 0,
      balance: 0,
      topCategories: [],
      annualSavings: 0,
      savingsProgress: 0
    },
    habits: {
      total: 0,
      active: 0,
      completed: 0,
      streak: 0,
      topHabits: []
    }
  });
  
  useEffect(() => {
    if (userData) {
      calculateStats();
      setLoading(false);
    }
  }, [userData]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const calculateStats = () => {
    // Calcular estadísticas financieras
    const financeStats = calculateFinanceStats();
    
    // Calcular estadísticas de hábitos
    const habitStats = calculateHabitStats();
    
    // Actualizar el estado
    setStats({
      finances: financeStats,
      habits: habitStats
    });
  };
  
  const calculateFinanceStats = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Obtener ingresos del mes actual
    let currentMonthIncome = 0;
    if (userData?.finances?.incomes?.[currentYear]?.months?.[currentMonth]) {
      currentMonthIncome = userData.finances.incomes[currentYear].months[currentMonth].total || 0;
    }
    
    // Obtener gastos del mes actual (excluyendo transacciones ocultas)
    let currentMonthExpense = 0;
    if (userData?.finances?.expenses?.[currentYear]?.months?.[currentMonth]) {
      const monthData = userData.finances.expenses[currentYear].months[currentMonth];
      if (monthData.data && Array.isArray(monthData.data)) {
        currentMonthExpense = monthData.data
          .filter(transaction => !transaction.hiddenFromList)
          .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      } else {
        currentMonthExpense = monthData.total || 0;
      }
    }
    
    // Calcular balance
    const balance = currentMonthIncome - currentMonthExpense;
    
    // Obtener categorías principales de gastos
    const topCategories = calculateTopCategories();
    
    // Calcular ahorro anual
    const annualSavings = calculateAnnualSavings(currentYear);
    
    // Calcular progreso de ahorro
    const savingsGoal = userData?.config?.finances?.savingsGoal || 10000;
    const savingsProgress = Math.min((annualSavings / savingsGoal) * 100, 100);
    
    return {
      currentMonthIncome,
      currentMonthExpense,
      balance,
      topCategories,
      annualSavings,
      savingsProgress
    };
  };
  
  const calculateTopCategories = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
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
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / stats.finances.currentMonthExpense) * 100
      }));
  };
  
  const calculateAnnualSavings = (year) => {
    let annualSavings = 0;
    
    if (userData?.finances?.incomes?.[year] && userData?.finances?.expenses?.[year]) {
      for (let month = 1; month <= 12; month++) {
        const monthlyIncome = userData.finances.incomes[year]?.months?.[month]?.total || 0;
        let monthlyExpense = 0;
        
        if (userData.finances.expenses[year]?.months?.[month]) {
          const monthData = userData.finances.expenses[year].months[month];
          if (monthData.data && Array.isArray(monthData.data)) {
            monthlyExpense = monthData.data
              .filter(transaction => !transaction.hiddenFromList)
              .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
          } else {
            monthlyExpense = monthData.total || 0;
          }
        }
        
        annualSavings += (monthlyIncome - monthlyExpense);
      }
    }
    
    return annualSavings;
  };
  
  const calculateHabitStats = () => {
    if (!userData?.habits) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        streak: 0,
        topHabits: []
      };
    }
    
    // Obtener todos los hábitos (excluyendo el nodo "completed")
    const habitsArray = Object.keys(userData.habits)
      .filter(key => key !== 'completed')
      .map(id => ({
        id,
        ...userData.habits[id]
      }));
    
    // Contar hábitos activos
    const total = habitsArray.length;
    const active = habitsArray.filter(habit => habit.active !== false).length;
    
    // Calcular hábitos completados hoy
    const today = new Date();
    const dateStr = formatDate(today);
    let completed = 0;
    if (userData.habits.completed && userData.habits.completed[dateStr]) {
      completed = Object.keys(userData.habits.completed[dateStr]).length;
    }
    
    // Encontrar racha más larga
    const streak = habitsArray.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
    
    // Hábitos principales (con mayor racha)
    const topHabits = habitsArray
      .sort((a, b) => (b.streak || 0) - (a.streak || 0))
      .slice(0, 3)
      .map(habit => ({
        name: habit.name,
        streak: habit.streak || 0
      }));
    
    return {
      total,
      active,
      completed,
      streak,
      topHabits
    };
  };
  
  // Formatear fecha como YYYY-MM-DD para usar como clave
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    const currency = userData?.config?.finances?.defaultCurrency || 'ARS';
    const showCents = userData?.config?.finances?.showCents !== undefined ? userData.config.finances.showCents : true;
    
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    });
    
    return formatter.format(amount);
  };
  
  const renderProfileTab = () => (
    <Box>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            bgcolor: theme.palette.primary.main,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            zIndex: 0
          }}
        />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center', zIndex: 1, mt: 1 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={auth.currentUser?.photoURL}
                alt={userData?.displayName || auth.currentUser?.displayName || "Usuario"}
                sx={{
                  width: 140,
                  height: 140,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[5],
                  bgcolor: theme.palette.primary.dark,
                  fontSize: 48
                }}
              >
                {!auth.currentUser?.photoURL && (userData?.displayName || auth.currentUser?.displayName || "U").charAt(0).toUpperCase()}
              </Avatar>
              
              <label htmlFor="profile-image-upload">
                <input
                  accept="image/*"
                  id="profile-image-upload"
                  type="file"
                  style={{ display: 'none' }}
                />
                <IconButton
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: theme.palette.secondary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark
                    },
                    boxShadow: theme.shadows[2]
                  }}
                >
                  <CameraAltIcon />
                </IconButton>
              </label>
            </Box>
            
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
              {userData?.displayName || auth.currentUser?.displayName || "Usuario"}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {auth.currentUser?.email}
            </Typography>
            
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Chip 
                icon={<PersonIcon />} 
                label="Perfil" 
                color="primary" 
                variant="filled" 
              />
              <Chip 
                icon={<SettingsIcon />} 
                label="Configuración" 
                variant="outlined"
                onClick={() => navigate('/Configuracion')} 
                clickable
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={8} zIndex={1}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[1], mt: { xs: 2, md: 8 } }}>
              <Typography variant="h6" gutterBottom>
                Resumen Personal
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Tema preferido
                    </Typography>
                    <Typography variant="body1">
                      {userData?.config?.theme?.selectedTheme ? 
                        predefinedThemes[userData.config.theme.selectedTheme]?.name || "Tema predeterminado" : 
                        "Tema predeterminado"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Moneda predeterminada
                    </Typography>
                    <Typography variant="body1">
                      {userData?.config?.finances?.defaultCurrency === 'ARS' ? 'Peso Argentino (ARS)' : 
                       userData?.config?.finances?.defaultCurrency === 'USD' ? 'Dólar Estadounidense (USD)' :
                       userData?.config?.finances?.defaultCurrency === 'EUR' ? 'Euro (EUR)' : 'Peso Argentino (ARS)'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Hábitos activos
                    </Typography>
                    <Typography variant="body1">
                      {stats.habits.active} de {stats.habits.total}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Meta de ahorro mensual
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(userData?.config?.finances?.savingsGoal || 0)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => navigate('/Configuracion')}
                  startIcon={<EditIcon />}
                >
                  Editar Perfil
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalanceWalletIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Estado Financiero
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Balance del mes actual
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: stats.finances.balance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {formatCurrency(stats.finances.balance)}
                {stats.finances.balance >= 0 ? 
                  <ArrowUpwardIcon sx={{ ml: 1, fontSize: 20 }} /> : 
                  <ArrowDownwardIcon sx={{ ml: 1, fontSize: 20 }} />
                }
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Ingresos
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(stats.finances.currentMonthIncome)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Gastos
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(stats.finances.currentMonthExpense)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/finanzas')}
              sx={{ mt: 1 }}
            >
              Ver Detalles Financieros
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              Progreso de Hábitos
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Hábitos completados hoy
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {stats.habits.completed} de {stats.habits.active}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.habits.active > 0 ? (stats.habits.completed / stats.habits.active) * 100 : 0} 
                color="success" 
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Racha más larga
              </Typography>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                {stats.habits.streak} días
                <CheckCircleIcon sx={{ ml: 1, color: theme.palette.success.main }} />
              </Typography>
            </Box>
            
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={() => navigate('/Habitos')}
              sx={{ mt: 1 }}
            >
              Ver Todos los Hábitos
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderStatsTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Gastos por Categoría
            </Typography>
            
            {stats.finances.topCategories.length > 0 ? (
              <Box>
                {stats.finances.topCategories.map((category, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="body2">
                          {category.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(category.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={category.percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: index === 0 ? theme.palette.error.main : 
                                  index === 1 ? theme.palette.warning.main : 
                                  theme.palette.info.main
                        }
                      }}
                    />
                  </Box>
                ))}
                
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={() => navigate('/finanzas')}
                  sx={{ mt: 1 }}
                >
                  Ver Todas las Categorías
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  No hay datos de gastos para mostrar
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Hábitos Destacados
            </Typography>
            
            {stats.habits.topHabits.length > 0 ? (
              <Box>
                {stats.habits.topHabits.map((habit, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {habit.name}
                      </Typography>
                      <Chip 
                        label={`${habit.streak} días`}
                        size="small"
                        color={
                          habit.streak > 30 ? "success" : 
                          habit.streak > 7 ? "info" : "primary"
                        }
                        icon={<CheckIcon />}
                      />
                    </Box>
                  </Box>
                ))}
                
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={() => navigate('/Habitos')}
                  sx={{ mt: 1 }}
                >
                  Ver Todos los Hábitos
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  No hay hábitos para mostrar
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SavingsIcon sx={{ mr: 1, color: theme.palette.success.main }} />
              Ahorro Anual
            </Typography>
            
            <Box sx={{ textAlign: 'center', position: 'relative', my: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={stats.finances.savingsProgress} 
                  size={140}
                  thickness={4}
                  sx={{ 
                    color: theme.palette.success.main,
                    position: 'relative'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Ahorrado
                  </Typography>
                  <Typography variant="h6" component="div" color="success.main" fontWeight="bold">
                    {formatCurrency(stats.finances.annualSavings)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">
                  Meta anual
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(userData?.config?.finances?.savingsGoal * 12 || 0)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.finances.savingsProgress} 
                color="success" 
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Alert severity={stats.finances.savingsProgress >= 100 ? "success" : "info"} sx={{ borderRadius: 1 }}>
                {stats.finances.savingsProgress >= 100 ? (
                  <Typography variant="body2">
                    ¡Felicidades! Has alcanzado tu meta de ahorro para este año.
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    Estás al {Math.round(stats.finances.savingsProgress)}% de alcanzar tu meta de ahorro anual.
                  </Typography>
                )}
              </Alert>
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOnIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              Próximos Vencimientos
            </Typography>
            
            {userData?.creditCards && Object.keys(userData.creditCards).length > 0 ? (
              <Box>
                {Object.entries(userData.creditCards)
                  .slice(0, 3)
                  .map(([id, card]) => (
                    <Box 
                      key={id} 
                      sx={{ 
                        mb: 2, 
                        p: 1.5, 
                        bgcolor: theme.palette.background.default, 
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[1]
                        }
                      }}
                    >
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {card.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(card.debtAmount || 0)}
                        </Typography>
                        <Chip 
                          label={card.closingDate ? `Cierre: ${card.closingDate}` : 'Sin fecha'} 
                          size="small" 
                          color="info"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))}
                
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={() => navigate('/TarjetasCredito')}
                  sx={{ mt: 1 }}
                >
                  Ver Todas las Tarjetas
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  No hay tarjetas de crédito registradas
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => navigate('/NuevaTarjeta')}
                  sx={{ mt: 2 }}
                >
                  Agregar Tarjeta
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Temas predefinidos (igual que en App.js y Configuracion.jsx)
  const predefinedThemes = {
    indigoTeal: {
      primary: "indigo",
      secondary: "teal",
      name: 'Índigo y Verde azulado'
    },
    purpleGreen: {
      primary: "deepPurple",
      secondary: "green",
      name: 'Púrpura y Verde'
    },
    blueAmber: {
      primary: "blue",
      secondary: "amber",
      name: 'Azul y Ámbar'
    },
    cyanOrange: {
      primary: "cyan",
      secondary: "orange",
      name: 'Cian y Naranja'
    },
    redLightBlue: {
      primary: "red",
      secondary: "lightBlue",
      name: 'Rojo y Azul claro'
    },
    brownTeal: {
      primary: "brown",
      secondary: "teal",
      name: 'Marrón y Verde azulado'
    },
    greenPink: {
      primary: "green",
      secondary: "pink",
      name: 'Verde y Rosa'
    },
    orangeBlue: {
      primary: "deepOrange",
      secondary: "blue",
      name: 'Naranja y Azul'
    }
  };
  
  return (
    <Layout title="Mi Perfil">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando información del perfil...
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant={isMobile ? "fullWidth" : "standard"}
                centered={!isMobile}
                sx={{ 
                  '& .MuiTab-root': {
                    fontWeight: 'medium',
                    py: 2
                  }
                }}
              >
                <Tab 
                  label="Perfil" 
                  icon={<PersonIcon />} 
                  iconPosition="start" 
                  sx={{ 
                    textTransform: 'none',
                    fontSize: 16
                  }} 
                />
                <Tab 
                  label="Estadísticas" 
                  icon={<BarChartIcon />} 
                  iconPosition="start" 
                  sx={{ 
                    textTransform: 'none',
                    fontSize: 16
                  }} 
                />
              </Tabs>
            </Box>
            
            {activeTab === 0 && renderProfileTab()}
            {activeTab === 1 && renderStatsTab()}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Perfil; 