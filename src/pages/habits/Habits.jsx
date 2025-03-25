import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box,
  Divider,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  Stack,
  Paper,
  LinearProgress,
  Avatar
} from '@mui/material';
import { useStore } from '../../store';
import { database, auth } from '../../firebase';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import HistoryIcon from '@mui/icons-material/History';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';

const Habits = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Estado para la navegación temporal
  const [viewMode, setViewMode] = useState('today'); // 'today', 'all', 'history'
  const [selectedDate, setSelectedDate] = useState(new Date()); // Fecha seleccionada para navegación
  
  // Estados para los hábitos
  const [habits, setHabits] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    completion: 0,
    streakHabits: []
  });
  
  // Cargar hábitos del usuario
  useEffect(() => {
    setLoading(true);
    if (userData && userData.habits) {
      // Transformar el objeto de hábitos en un array con sus IDs
      const habitsArray = Object.keys(userData.habits)
        .filter(key => key !== 'completed') // Excluir el nodo "completed"
        .map(id => ({
          id,
          ...userData.habits[id]
        }));
      
      setHabits(habitsArray);
      
      // Cargar los hábitos completados para la fecha seleccionada
      const dateStr = formatDate(selectedDate);
      if (userData.habits.completed && userData.habits.completed[dateStr]) {
        setCompletedHabits(userData.habits.completed[dateStr]);
      } else {
        setCompletedHabits({});
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [userData, selectedDate]); // Ahora dependemos de selectedDate también

  // Filtrar hábitos según el modo de vista y la fecha seleccionada
  useEffect(() => {
    if (habits.length === 0) {
      setFilteredHabits([]);
      return;
    }

    let filtered = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Si la vista es "today", filtramos por la fecha seleccionada
    if (viewMode === 'today') {
      filtered = habits.filter(habit => shouldShowHabitForDate(habit, selectedDate));
    } 
    // Si la vista es "all", mostramos todos los hábitos
    else if (viewMode === 'all') {
      filtered = habits;
    }
    // Para el historial, mostramos todos por ahora (se podría implementar un filtro más sofisticado)
    else {
      filtered = habits;
    }

    setFilteredHabits(filtered);

    // Calcular estadísticas
    const totalActive = filtered.length;
    const habitsCompletedOnSelectedDate = filtered.filter(habit => 
      completedHabits[habit.id] && completedHabits[habit.id].completedAt
    ).length;
    
    const completionPercentage = totalActive > 0 
      ? Math.round((habitsCompletedOnSelectedDate / totalActive) * 100) 
      : 0;

    // Hábitos con racha
    const habitsWithStreak = habits.filter(habit => habit.streak && habit.streak > 2)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3);

    setStats({
      totalHabits: totalActive,
      completedToday: habitsCompletedOnSelectedDate,
      completion: completionPercentage,
      streakHabits: habitsWithStreak
    });

  }, [habits, viewMode, completedHabits, selectedDate]);
  
  // Determinar si un hábito debe mostrarse para una fecha específica
  const shouldShowHabitForDate = (habit, date) => {
    const dayOfWeek = date.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Lunes a viernes
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6; // Sábado o domingo
      case 'custom':
        return habit.customDays && habit.customDays.includes(dayOfWeek);
      default:
        return true;
    }
  };
  
  // Formatear fecha como YYYY-MM-DD para usar como clave
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Marcar/desmarcar un hábito como completado
  const toggleHabitCompletion = (habitId) => {
    const dateStr = formatDate(selectedDate);
    const newCompletedHabits = { ...completedHabits };
    
    if (newCompletedHabits[habitId]) {
      delete newCompletedHabits[habitId];
    } else {
      newCompletedHabits[habitId] = {
        completedAt: new Date().toISOString(),
        habitId: habitId
      };
    }
    
    setCompletedHabits(newCompletedHabits);
    
    // Guardar en Firebase
    database.ref(`${auth.currentUser.uid}/habits/completed/${dateStr}`).set(newCompletedHabits);

    // Actualizar racha del hábito
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      let newStreak;
      if (!newCompletedHabits[habitId]) {
        // Si se desmarca, decrementar la racha si es mayor que 0
        newStreak = Math.max(0, (habit.streak || 0) - 1);
      } else {
        // Si se marca, incrementar la racha
        newStreak = (habit.streak || 0) + 1;
      }
      database.ref(`${auth.currentUser.uid}/habits/${habitId}/streak`).set(newStreak);
    }
  };
  
  // Crear un nuevo hábito
  const createNewHabit = () => {
    navigate('/NuevoHabito');
  };
  
  // Navegación entre días
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };
  
  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Obtener nombre del día de la semana
  const getDayName = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };
  
  // Obtener nombre del mes
  const getMonthName = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[date.getMonth()];
  };
  
  // Comprobar si la fecha seleccionada es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Panel de estadísticas y navegación
  const StatsAndNav = () => {
    return (
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            py: 1.5, 
            px: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            color: 'white'
          }}
        >
          <Stack 
            direction={isMobile ? "column" : "row"} 
            justifyContent="space-between"
            alignItems={isMobile ? "flex-start" : "center"}
            spacing={2}
          >
            <Typography variant="h6">
              Seguimiento de Hábitos
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button 
                variant={viewMode === 'today' ? 'contained' : 'outlined'} 
                color="inherit"
                size="small"
                onClick={() => setViewMode('today')}
                startIcon={<TodayIcon />}
                sx={{
                  bgcolor: viewMode === 'today' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Por Día
              </Button>
              
              <Button 
                variant={viewMode === 'all' ? 'contained' : 'outlined'}
                color="inherit"
                size="small"
                onClick={() => setViewMode('all')}
                startIcon={<DateRangeIcon />}
                sx={{
                  bgcolor: viewMode === 'all' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Todos
              </Button>
            </Stack>
          </Stack>
        </Box>
        
        {viewMode === 'today' && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent="center"
              spacing={2}
            >
              <IconButton 
                onClick={goToPreviousDay}
                color="primary"
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                align="center"
                color="text.primary"
                sx={{ 
                  fontWeight: 'medium',
                  minWidth: isMobile ? '200px' : '300px',
                  textAlign: 'center'
                }}
              >
                {getDayName(selectedDate)}, {selectedDate.getDate()} de {getMonthName(selectedDate)} de {selectedDate.getFullYear()}
              </Typography>
              
              <IconButton 
                onClick={goToNextDay}
                color="primary"
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
              
              {!isToday(selectedDate) && (
                <Tooltip title="Ir a hoy">
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="small"
                    onClick={goToToday}
                    startIcon={<CalendarTodayIcon />}
                    sx={{ ml: 1 }}
                  >
                    Hoy
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Box>
        )}
        
        <CardContent>
          <Grid container spacing={3}>
            {/* Progreso del día */}
            <Grid item xs={12} sm={4}>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgressWithLabel value={stats.completion} />
                <Typography variant="h6" fontWeight="bold" mt={1}>
                  {stats.completedToday}/{stats.totalHabits}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isToday(selectedDate) 
                    ? 'Hábitos completados hoy' 
                    : 'Hábitos completados este día'}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Rachas más largas */}
            <Grid item xs={12} sm={8}>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1.5
                  }}
                >
                  <LocalFireDepartmentIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Mejores rachas
                  </Typography>
                </Box>
                
                {stats.streakHabits.length > 0 ? (
                  <Stack spacing={1.5}>
                    {stats.streakHabits.map(habit => (
                      <Box 
                        key={habit.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          bgcolor: `${theme.palette.warning.light}10`,
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: `${theme.palette.warning.light}20`
                          }
                        }}
                        onClick={() => navigate(`/DetalleHabito?id=${habit.id}`)}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {habit.name}
                        </Typography>
                        <Chip 
                          icon={<LocalFireDepartmentIcon />} 
                          label={`${habit.streak} días`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Aún no tienes rachas destacadas
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Panel de hábitos filtrados
  const HabitsPanel = () => {
    if (loading) {
      return (
        <Card elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box textAlign="center" py={4}>
            <CircularProgressIndicator />
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Cargando hábitos...
            </Typography>
          </Box>
        </Card>
      );
    }
    
    // Texto para el encabezado según la vista y fecha
    let headerText = '';
    if (viewMode === 'today') {
      if (isToday(selectedDate)) {
        headerText = 'Mis Hábitos para Hoy';
      } else {
        const futureDate = selectedDate > new Date();
        headerText = futureDate ? 'Mis Hábitos para Este Día' : 'Mis Hábitos Completados';
      }
    } else {
      headerText = 'Todos Mis Hábitos';
    }
    
    return (
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardHeader 
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">
                {headerText}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={createNewHabit}
                size="small"
              >
                Nuevo Hábito
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {filteredHabits.length > 0 ? (
            <Grid container spacing={2}>
              {filteredHabits.map((habit) => (
                <Grid item xs={12} sm={6} md={4} key={habit.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderColor: completedHabits[habit.id] ? theme.palette.success.main : theme.palette.divider,
                      bgcolor: completedHabits[habit.id] ? `${theme.palette.success.main}10` : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => navigate(`/DetalleHabito?id=${habit.id}`)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {habit.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getFrequencyText(habit)}
                          </Typography>
                          {habit.streak > 0 && (
                            <Chip 
                              label={`Racha: ${habit.streak} días`} 
                              size="small" 
                              color="warning" 
                              icon={<LocalFireDepartmentIcon />}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                        <Tooltip title={completedHabits[habit.id] ? "Desmarcar como completado" : "Marcar como completado"}>
                          <IconButton 
                            color={completedHabits[habit.id] ? "success" : "default"}
                            onClick={(e) => {
                              e.stopPropagation(); // Previene que se abra la vista de detalles
                              toggleHabitCompletion(habit.id);
                            }}
                            sx={{
                              bgcolor: completedHabits[habit.id] ? `${theme.palette.success.light}20` : 'transparent'
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <SentimentVerySatisfiedIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
              {viewMode === 'today' ? (
                isToday(selectedDate) ? (
                  <>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      ¡No tienes hábitos para completar hoy!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                      Puedes crear nuevos hábitos o revisar otros días.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No hay hábitos programados para esta fecha
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                      Prueba a revisar otro día o añade nuevos hábitos.
                    </Typography>
                  </>
                )
              ) : (
                <>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No hay hábitos configurados
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                    Comienza a crear hábitos para mejorar tu productividad diaria.
                  </Typography>
                </>
              )}
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={createNewHabit}
                size="small"
              >
                Crear mi primer hábito
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Obtener texto para frecuencia
  const getFrequencyText = (habit) => {
    switch (habit.frequency) {
      case 'daily':
        return 'Todos los días';
      case 'weekdays':
        return 'Lunes a viernes';
      case 'weekends':
        return 'Fines de semana';
      case 'custom':
        if (habit.customDays && habit.customDays.length > 0) {
          const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          return habit.customDays.map(day => days[day]).join(', ');
        }
        return 'Días personalizados';
      default:
        return 'Frecuencia no especificada';
    }
  };
  
  // Componente interno para el círculo de progreso
  const CircularProgressWithLabel = (props) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: `conic-gradient(${theme.palette.primary.main} ${props.value}%, ${theme.palette.grey[200]} 0)`,
            transform: 'rotate(-90deg)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              {`${props.value}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Indicador circular de carga
  const CircularProgressIndicator = () => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            borderTop: `3px solid ${theme.palette.primary.main}`,
            borderRight: `3px solid ${theme.palette.primary.main}`,
            borderBottom: `3px solid ${theme.palette.grey[300]}`,
            borderLeft: `3px solid ${theme.palette.grey[300]}`,
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(0deg)',
              },
              '100%': {
                transform: 'rotate(360deg)',
              },
            },
          }}
        />
      </Box>
    );
  };
  
  return (
    <Layout title="Seguimiento de Hábitos">
      <Box sx={{ py: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StatsAndNav />
          </Grid>
          
          <Grid item xs={12}>
            <HabitsPanel />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Habits;
