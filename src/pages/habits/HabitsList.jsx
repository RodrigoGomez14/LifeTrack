import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  Container,
  Fab,
  CircularProgress,
  alpha,
  Skeleton,
} from '@mui/material';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const HabitsList = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar hábitos del usuario
  useEffect(() => {
    setLoading(true);
    if (userData && userData.habits) {
      const habitsArray = Object.keys(userData.habits)
        .filter(key => key !== 'completed')
        .map(id => ({
          id,
          ...userData.habits[id]
        }));
      
      setHabits(habitsArray);
      
      // Cargar hábitos completados para calcular estadísticas
      if (userData.habits.completed) {
        setCompletedHabits(userData.habits.completed);
      }
      
      setLoading(false);
    } else {
      setHabits([]);
      setCompletedHabits({});
      setLoading(false);
    }
  }, [userData]);

  // Función para obtener el color de dificultad
  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: '#4caf50', // Muy Fácil - Verde
      2: '#8bc34a', // Fácil - Verde claro
      3: '#ff9800', // Moderado - Naranja
      4: '#f44336', // Difícil - Rojo
      5: '#9c27b0'  // Muy Difícil - Púrpura
    };
    return colors[difficulty] || colors[1];
  };

  // Función para obtener el nombre de dificultad
  const getDifficultyLabel = (difficulty) => {
    const labels = {
      1: 'Muy Fácil',
      2: 'Fácil',
      3: 'Moderado',
      4: 'Difícil',
      5: 'Muy Difícil'
    };
    return labels[difficulty] || 'Fácil';
  };

  // Función para calcular puntos por completar el hábito
  const calculateHabitPoints = (habit) => {
    const multiplier = habit.difficultyMultiplier || 1.0;
    return Math.round(10 * multiplier);
  };

  // Obtener texto para frecuencia
  const getFrequencyText = (habit) => {
    switch (habit.frequency) {
      case 'daily': return 'Todos los días';
      case 'weekdays': return 'Lunes a Viernes';
      case 'weekends': return 'Sábados y Domingos';
      case 'custom':
        if (Array.isArray(habit.customDays) && habit.customDays.length > 0) {
          const dayNames = ['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'];
          const sortedDays = [...habit.customDays].sort((a, b) => a - b);
          const daysList = sortedDays.map(dayIndex => dayNames[dayIndex]);
          
          if (daysList.length === 1) {
            return `Cada ${daysList[0]}`;
          } else if (daysList.length === 2) {
            return `${daysList[0]} y ${daysList[1]}`;
          } else {
            const lastDay = daysList.pop();
            return `${daysList.join(', ')} y ${lastDay}`;
          }
        }
        return 'Días personalizados';
      case 'monthly':
        if (Array.isArray(habit.monthlyDays) && habit.monthlyDays.length > 0) {
          const sortedDays = [...habit.monthlyDays].sort((a, b) => a - b);
          
          if (sortedDays.length === 1) {
            return `El día ${sortedDays[0]} de cada mes`;
          } else if (sortedDays.length === 2) {
            return `Los días ${sortedDays[0]} y ${sortedDays[1]} de cada mes`;
          } else {
            const lastDay = sortedDays.pop();
            return `Los días ${sortedDays.join(', ')} y ${lastDay} de cada mes`;
          }
        }
        return 'Mensualmente';
      case 'yearly':
        if (Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.length > 0 && 
            Array.isArray(habit.yearlyDays) && habit.yearlyDays.length > 0) {
          const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          const sortedMonths = [...habit.yearlyMonths].sort((a, b) => a - b);
          const sortedDays = [...habit.yearlyDays].sort((a, b) => a - b);
          
          const monthsList = sortedMonths.map(month => monthNames[month - 1]);
          
          let monthsText;
          if (monthsList.length === 1) {
            monthsText = monthsList[0];
          } else if (monthsList.length === 2) {
            monthsText = `${monthsList[0]} y ${monthsList[1]}`;
          } else {
            const lastMonth = monthsList.pop();
            monthsText = `${monthsList.join(', ')} y ${lastMonth}`;
          }
          
          let daysText;
          if (sortedDays.length === 1) {
            daysText = `el día ${sortedDays[0]}`;
          } else if (sortedDays.length === 2) {
            daysText = `los días ${sortedDays[0]} y ${sortedDays[1]}`;
          } else {
            const lastDay = sortedDays.pop();
            daysText = `los días ${sortedDays.join(', ')} y ${lastDay}`;
          }
          
          return `${daysText} de ${monthsText}`;
        }
        return 'Anualmente';
      default: return 'Frecuencia no definida';
    }
  };

  // Calcular estadísticas de un hábito (últimos 30 días)
  const calculateHabitStats = (habit) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    // Verificar cada día de los últimos 30 días
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      if (shouldShowHabitForDate(habit, d)) {
        totalPossible++;
        
        const dateStr = formatDate(d);
        if (completedHabits[dateStr] && completedHabits[dateStr][habit.id]) {
          totalCompleted++;
        }
      }
    }
    
    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const points = calculateHabitPoints(habit);
    
    return {
      percentage,
      completed: totalCompleted,
      possible: totalPossible,
      points
    };
  };

  // Determinar si un hábito debe mostrarse para una fecha específica
  const shouldShowHabitForDate = (habit, date) => {
    if (habit.createdAt) {
      const createdDate = new Date(habit.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate < createdDate) {
        return false;
      }
    }
    
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    
    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6;
      case 'custom':
        return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
      case 'monthly':
        return Array.isArray(habit.monthlyDays) && habit.monthlyDays.includes(dayOfMonth);
      case 'yearly':
        const isCorrectMonth = Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.includes(month);
        const isCorrectDay = Array.isArray(habit.yearlyDays) && habit.yearlyDays.includes(dayOfMonth);
        return isCorrectMonth && isCorrectDay;
      default:
        return true;
    }
  };

  // Formatear fecha como YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Crear un nuevo hábito
  const createNewHabit = () => {
    navigate('/NuevoHabito');
  };

  // Editar hábito
  const editHabit = (habitId) => {
    navigate(`/EditarHabito/${habitId}`);
  };

  // Obtener colores de gradiente basados en el color del hábito
  const getGradientColors = (habitColor) => {
    const colorMap = {
      primary: [theme.palette.primary.dark, theme.palette.primary.main],
      secondary: [theme.palette.secondary.dark, theme.palette.secondary.main],
      success: [theme.palette.success.dark, theme.palette.success.main],
      info: [theme.palette.info.dark, theme.palette.info.main],
      warning: [theme.palette.warning.dark, theme.palette.warning.main],
      error: [theme.palette.error.dark, theme.palette.error.main],
    };
    return colorMap[habitColor] || colorMap.primary;
  };

  if (loading) {
    return (
      <Layout title="Mis Hábitos">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Layout>
    );
  }

  if (habits.length === 0) {
    return (
      <Layout title="Mis Hábitos">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PlaylistAddCheckIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h4" color="text.secondary" gutterBottom>
              No tienes hábitos configurados
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              Crea tu primer hábito para comenzar tu seguimiento y establecer rutinas positivas en tu vida.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />} 
              onClick={createNewHabit}
              sx={{ borderRadius: 3, py: 1.5, px: 4 }}
            >
              Crear Mi Primer Hábito
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Hábitos">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {habits.map((habit) => {
            const stats = calculateHabitStats(habit);
            const difficultyColor = getDifficultyColor(habit.difficulty || 1);
            const difficultyLabel = getDifficultyLabel(habit.difficulty || 1);
            const frequencyText = getFrequencyText(habit);
            const [gradientStart, gradientEnd] = getGradientColors(habit.color || 'primary');
            
            return (
              <Grid item xs={12} sm={6} md={4} key={habit.id}>
                <Card
                  elevation={6}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    }
                  }}
                >
                  {/* Header con gradiente */}
                  <Box
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {habit.name.substring(0, 1).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {habit.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {frequencyText}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button
                        size="small"
                        onClick={() => editHabit(habit.id)}
                        sx={{
                          minWidth: 40,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                    </Stack>
                  </Box>

                  {/* Contenido principal con fondo oscuro */}
                  <Box
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: 'white',
                      p: 3,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Información de puntos y dificultad */}
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      <Chip
                        icon={<FlashOnIcon sx={{ fontSize: '0.9rem !important' }} />}
                        label={`${stats.points} puntos`}
                        size="medium"
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.2),
                          color: theme.palette.warning.light,
                          fontWeight: 'bold',
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                          '& .MuiChip-icon': {
                            color: theme.palette.warning.light
                          }
                        }}
                      />
                      
                      <Chip
                        label={difficultyLabel}
                        size="medium"
                        sx={{
                          bgcolor: alpha(difficultyColor, 0.2),
                          color: difficultyColor,
                          fontWeight: 'bold',
                          border: `1px solid ${alpha(difficultyColor, 0.4)}`,
                        }}
                      />
                    </Stack>

                    {/* Información adicional del hábito */}
                    <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {habit.description ? (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)', 
                            fontStyle: 'italic',
                            px: 2,
                            lineHeight: 1.4
                          }}
                        >
                          "{habit.description}"
                        </Typography>
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.4)', 
                            fontStyle: 'italic'
                          }}
                        >
                          Sin descripción
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Botón Flotante para añadir */}
      <Fab 
        color="primary" 
        aria-label="añadir hábito" 
        onClick={createNewHabit}
        sx={{
          position: 'fixed',
          bottom: { xs: 70, sm: 30 },
          right: { xs: 16, sm: 30 },
          boxShadow: 6
        }}
      >
        <AddIcon />
      </Fab>
    </Layout>
  );
};

export default HabitsList; 