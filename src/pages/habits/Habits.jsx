import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  Container,
  List,
  ListItem,
  Checkbox,
  Fab,
  CircularProgress,
  alpha,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ToggleButtonGroup,
  ToggleButton
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
import CheckIcon from '@mui/icons-material/Check';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TaskAltIcon from '@mui/icons-material/TaskAlt'; // Icono para completado

const Habits = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Ajustado a 'sm' para mejor responsividad
  const navigate = useNavigate();
  
  // Estado para la navegación temporal
  const [viewMode, setViewMode] = useState('today'); // 'today', 'all'
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
      const habitsArray = Object.keys(userData.habits)
        .filter(key => key !== 'completed') // Excluir el nodo "completed"
        .map(id => ({
          id,
          ...userData.habits[id]
        }));
      
      setHabits(habitsArray);
      
      const dateStr = formatDate(selectedDate);
      if (userData.habits.completed && userData.habits.completed[dateStr]) {
        setCompletedHabits(userData.habits.completed[dateStr]);
      } else {
        setCompletedHabits({});
      }

      setLoading(false);
    } else {
      setHabits([]); // Asegurarse de limpiar los hábitos si no hay datos
      setCompletedHabits({});
      setLoading(false);
    }
  }, [userData]); // Solo depende de userData inicialmente

  // Recargar hábitos completados cuando cambia la fecha seleccionada
  useEffect(() => {
    if (viewMode === 'today' && userData?.habits?.completed) {
      const dateStr = formatDate(selectedDate);
      setCompletedHabits(userData.habits.completed[dateStr] || {});
    } else if (viewMode === 'all') {
      setCompletedHabits({}); // No hay hábitos completados en la vista 'all'
    }
  }, [selectedDate, viewMode, userData]);


  // Filtrar hábitos según el modo de vista y la fecha seleccionada
  useEffect(() => {
    if (habits.length === 0) {
      setFilteredHabits([]);
      setStats({ totalHabits: 0, completedToday: 0, completion: 0, streakHabits: [] });
      return;
    }

    let filtered = [];
    
    if (viewMode === 'today') {
      filtered = habits.filter(habit => shouldShowHabitForDate(habit, selectedDate));
    } else if (viewMode === 'all') {
      filtered = habits; // Mostrar todos en la vista 'all'
    }

    setFilteredHabits(filtered);

    // Calcular estadísticas (solo relevantes para 'today')
    if (viewMode === 'today') {
      const totalActive = filtered.length;
      const habitsCompletedOnSelectedDate = filtered.filter(habit => 
        completedHabits[habit.id]?.completedAt
      ).length;
      
      const completionPercentage = totalActive > 0 
        ? Math.round((habitsCompletedOnSelectedDate / totalActive) * 100) 
        : 0;

      const habitsWithStreak = habits.filter(habit => habit.streak && habit.streak > 2)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3); // Mostrar las 3 mejores rachas

      setStats({
        totalHabits: totalActive,
        completedToday: habitsCompletedOnSelectedDate,
        completion: completionPercentage,
        streakHabits: habitsWithStreak
      });
    } else {
      // Resetear o ajustar stats para la vista 'all' si es necesario
      setStats({
        totalHabits: habits.length, // Total de hábitos creados
        completedToday: 0, // No aplica
        completion: 0, // No aplica
        streakHabits: habits.filter(habit => habit.streak && habit.streak > 2)
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 3) // Mostrar rachas generales
      });
    }

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
        // Asegurarse de que customDays es un array antes de usar includes
        return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
      default:
        return true; // Por defecto, mostrar si no hay frecuencia clara (o manejar como error)
    }
  };
  
  // Formatear fecha como YYYY-MM-DD para usar como clave
  const formatDate = (date) => {
    const d = new Date(date); // Asegurarse de que es un objeto Date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Marcar/desmarcar un hábito como completado
  const toggleHabitCompletion = async (habitId) => {
    const dateStr = formatDate(selectedDate);
    const habitRef = database.ref(`${auth.currentUser.uid}/habits/${habitId}`);
    const completedRef = database.ref(`${auth.currentUser.uid}/habits/completed/${dateStr}/${habitId}`);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const isCurrentlyCompleted = !!completedHabits[habitId];
    const newCompletedStatus = !isCurrentlyCompleted;
    let newStreak = habit.streak || 0;

    // --- Calcular Nueva Racha ---
    if (newCompletedStatus) { // Marcando como completado
      const previousScheduledDate = getPreviousScheduledDate(habit, selectedDate);
      if (previousScheduledDate) {
        const prevDateStr = formatDate(previousScheduledDate);
        const wasCompletedPreviously = !!(userData?.habits?.completed?.[prevDateStr]?.[habitId]);
        if (wasCompletedPreviously) {
          newStreak = (habit.streak || 0) + 1; // Continuar racha
        } else {
          newStreak = 1; // Iniciar nueva racha
        }
      } else {
        newStreak = 1; // Iniciar nueva racha (primera vez o sin fecha anterior válida)
      }
    } else { // Desmarcando
      const currentStreak = habit.streak || 0;
      // Solo decrementar racha si se desmarca el día de hoy
      if (isToday(selectedDate)) {
        newStreak = Math.max(0, currentStreak - 1);
      } else {
        newStreak = currentStreak; // No cambiar racha al desmarcar días pasados
      }
    }
    // ---------------------------

    // Optimistic UI Update for completion status
    setCompletedHabits(prev => {
      const updated = {...prev};
      if (newCompletedStatus) {
        updated[habitId] = { completedAt: new Date().toISOString(), habitId };
      } else {
        delete updated[habitId];
      }
      return updated;
    });

    // Optimistic UI Update for streak
    setHabits(prevHabits => prevHabits.map(h => 
      h.id === habitId ? { ...h, streak: newStreak } : h
    ));

    try {
      // Actualizar estado de completado en Firebase
      if (newCompletedStatus) {
        await completedRef.set({ completedAt: new Date().toISOString(), habitId });
      } else {
        await completedRef.remove();
      }
      
      // Actualizar racha en Firebase solo si cambió
      if (newStreak !== (habit.streak || 0)) {
        await habitRef.update({ streak: newStreak });
      }

    } catch (error) {
      console.error("Error updating habit completion:", error);
      // Revertir UI en caso de error
      setCompletedHabits(prev => { // Revertir estado completado
        const reverted = {...prev};
        if (newCompletedStatus) { 
          delete reverted[habitId];
        } else { 
          // Para revertir el desmarcado, necesitamos el estado original
          // Si no lo guardamos, podríamos simplemente dejarlo como estaba antes del error
          // o intentar buscarlo de nuevo. Por simplicidad, lo dejamos así.
          // Considera guardar el estado previo si la reversión precisa es crucial.
          if (isCurrentlyCompleted) { // Si originalmente estaba completado
             reverted[habitId] = { completedAt: 'reverted', habitId }; // O estado original
          }
        }
        return reverted;
      });
      setHabits(prevHabits => prevHabits.map(h => // Revertir racha
        h.id === habitId ? { ...h, streak: habit.streak || 0 } : h
      ));
      // Mostrar un mensaje de error al usuario (ej. con un Snackbar)
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
  
  // Obtener nombre del día de la semana (corto)
  const getShortDayName = (date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };
  
  // Formato de fecha legible
  const getFormattedDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  // Comprobar si la fecha seleccionada es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Función auxiliar para obtener la fecha anterior en que un hábito estaba programado
  const getPreviousScheduledDate = (habit, currentDate) => {
    let previousDate = new Date(currentDate);
    // Retroceder máximo 30 días para evitar bucles infinitos y mejorar rendimiento
    for (let i = 0; i < 30; i++) { 
      previousDate.setDate(previousDate.getDate() - 1);
      if (shouldShowHabitForDate(habit, previousDate)) {
        return previousDate; // Devolver la primera fecha anterior encontrada donde debía hacerse
      }
    }
    return null; // No se encontró una fecha anterior programada en el rango
  };

  // Obtener texto para frecuencia
  const getFrequencyText = (habit) => {
    switch (habit.frequency) {
      case 'daily': return 'Diario';
      case 'weekdays': return 'L-V';
      case 'weekends': return 'S-D';
      case 'custom':
        if (Array.isArray(habit.customDays) && habit.customDays.length > 0) {
          const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
          // Ordenar los días seleccionados
          const sortedDays = [...habit.customDays].sort((a, b) => a - b);
          return sortedDays.map(dayIndex => days[dayIndex]).join(', ');
        }
        return 'Personalizado';
      default: return ''; // Frecuencia no especificada o desconocida
    }
  };

  // Componente interno para el círculo de progreso mejorado
  const CircularProgressWithLabel = ({ value }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', width: 80, height: 80 }}>
        <CircularProgress
          variant="determinate"
          sx={{
            color: (theme) => theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
            position: 'absolute',
            left: 0,
            zIndex: 1, // Detrás del progreso real
          }}
          size={80}
          thickness={4}
          value={100}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          sx={{ 
            color: 'primary.main', 
            zIndex: 2, // Encima del fondo gris
            animation: 'progress-animation 0.5s ease-out',
            '@keyframes progress-animation': {
              '0%': { strokeDashoffset: 100 }, // Ajusta según el tamaño
              '100%': { strokeDashoffset: 0 },
            },
          }}
          size={80}
          thickness={4}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography 
            variant="h6" 
            component="div" 
            color="text.primary"
            fontWeight="bold"
          >
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  // --- Componentes de UI Rediseñados ---

  // Panel Superior (Navegación y Estadísticas)
  const ControlPanel = () => (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        border: 'none',
        // background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`
        bgcolor: 'background.paper' // Fondo sólido para mejor contraste
      }}
    >
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        divider={!isMobile && <Divider orientation="vertical" flexItem />}
      >
        {/* Columna Izquierda: Navegación y Progreso Diario */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Selector de Vista */}
          <ToggleButtonGroup
            color="primary"
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            aria-label="Modo de vista"
            size="small"
            fullWidth={isMobile}
          >
            <ToggleButton value="today" aria-label="Vista por día">
              <TodayIcon sx={{ mr: 0.5 }} fontSize="small"/> 
              Por Día
            </ToggleButton>
            <ToggleButton value="all" aria-label="Todos los hábitos">
              <ListAltIcon sx={{ mr: 0.5 }} fontSize="small"/> 
              Todos
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Navegador de Día (Solo visible en modo 'today') */}
          {viewMode === 'today' && (
            <Box>
               <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between" 
                spacing={1}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.05), 
                  p: 1, 
                  borderRadius: 2 
                }}
              >
                <Tooltip title="Día anterior">
                  <IconButton onClick={goToPreviousDay} size="small" color="primary">
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>
                
                <Stack direction="column" alignItems="center" sx={{ textAlign: 'center' }}>
                   <Typography variant="body1" fontWeight="medium">
                    {getShortDayName(selectedDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getFormattedDate(selectedDate)}
                  </Typography>
                </Stack>

                <Tooltip title="Día siguiente">
                  <IconButton onClick={goToNextDay} size="small" color="primary" disabled={isToday(selectedDate)}>
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
               {!isToday(selectedDate) && (
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={goToToday} 
                  startIcon={<CalendarTodayIcon />}
                  sx={{ mt: 1, display: 'flex', mx: 'auto' }} // Centrar botón
                >
                  Ir a Hoy
                </Button>
              )}
            </Box>
          )}

           {/* Progreso Diario (Solo visible en modo 'today') */}
           {viewMode === 'today' && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
               <CircularProgressWithLabel value={stats.completion} />
              <Stack>
                <Typography variant="h5" fontWeight="bold">
                  {stats.completedToday} / {stats.totalHabits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completados {isToday(selectedDate) ? 'hoy' : 'ese día'}
                </Typography>
              </Stack>
            </Stack>
           )}
        </Stack>

        {/* Columna Derecha: Rachas (Visible en ambos modos) */}
        <Stack spacing={1.5} sx={{ flex: 1, pt: { xs: 2, md: 0 } }}>
           <Stack direction="row" alignItems="center" spacing={1}>
            <LocalFireDepartmentIcon color="warning" />
            <Typography variant="subtitle1" fontWeight="medium">
              Mejores Rachas
            </Typography>
          </Stack>
          {stats.streakHabits.length > 0 ? (
            <List dense disablePadding>
              {stats.streakHabits.map((habit) => (
                <ListItem 
                  key={habit.id} 
                  disablePadding
                  secondaryAction={
                    <Chip 
                      label={`${habit.streak} días`} 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                      icon={<LocalFireDepartmentIcon fontSize="small"/>}
                    />
                  }
                  sx={{ 
                    mb: 0.5, 
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    borderRadius: 1.5,
                    pl: 1.5, // Padding a la izquierda
                  }}
                >
                  <ListItemText 
                    primary={habit.name} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 80 }}>
              <Typography variant="body2" color="text.secondary">
                Aún no hay rachas destacadas.
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  // Componente para un Item de Hábito en la lista
  const HabitItem = ({ habit }) => {
    const isCompleted = viewMode === 'today' && !!completedHabits[habit.id];
    
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          mb: 1.5, 
          borderRadius: 2.5, // Bordes más redondeados
          overflow: 'hidden', // Para que el fondo no se salga
          transition: 'all 0.2s ease',
          bgcolor: isCompleted ? alpha(theme.palette.success.main, 0.08) : 'background.paper',
          borderColor: isCompleted ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider,
          '&:hover': {
            boxShadow: theme.shadows[2],
            borderColor: isCompleted ? theme.palette.success.main : theme.palette.primary.main,
          }
        }}
      >
        <ListItem
          secondaryAction={
             viewMode === 'today' ? ( // Checkbox solo en vista 'today'
               <Checkbox
                edge="end"
                onChange={() => toggleHabitCompletion(habit.id)}
                checked={isCompleted}
                icon={<RadioButtonUncheckedIcon />}
                checkedIcon={<CheckCircleIcon />}
                color="success"
                disabled={!isToday(selectedDate) && !isCompleted} // Deshabilitar si no es hoy y no está completado
                sx={{ mr: 1 }} // Margen para separar del borde
              />
             ) : ( // Flecha en vista 'all'
               <IconButton edge="end" aria-label="details" onClick={() => navigate(`/DetalleHabito?id=${habit.id}`)} size="small">
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
             )
          }
          disablePadding
          sx={{ pt: 1, pb: 1 }} // Padding vertical
        >
          <ListItemButton 
             onClick={() => navigate(`/DetalleHabito?id=${habit.id}`)} 
             sx={{ borderRadius: 'inherit', py: 1 }} // Heredar border radius y ajustar padding
           >
            {/* Puedes añadir un icono aquí si lo implementas */}
             {/* <ListItemIcon sx={{ minWidth: 40 }}> 
              <SomeIcon /> 
            </ListItemIcon> */}
            <ListItemText
              primary={habit.name}
              secondary={getFrequencyText(habit)}
              primaryTypographyProps={{ fontWeight: 'medium', color: isCompleted ? 'text.secondary' : 'text.primary', sx: { textDecoration: isCompleted ? 'line-through' : 'none' } }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {habit.streak > 0 && viewMode === 'all' && ( // Mostrar racha solo en vista 'all'
              <Chip 
                label={`${habit.streak}`} 
                size="small" 
                color="warning" 
                icon={<LocalFireDepartmentIcon />} 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Paper>
    );
  };

  // Panel Principal de Hábitos
  const HabitsListPanel = () => {
    if (loading) {
      return (
        <Box textAlign="center" py={5}>
          <CircularProgress />
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Cargando hábitos...
          </Typography>
        </Box>
      );
    }

    const title = viewMode === 'today' 
      ? (isToday(selectedDate) ? 'Hábitos de Hoy' : 'Hábitos para el ' + getFormattedDate(selectedDate))
      : 'Todos los Hábitos';

    return (
      <Box>
         <Typography variant="h6" gutterBottom sx={{ pl: 1, mb: 2 }}>
          {title} ({filteredHabits.length})
        </Typography>
        {filteredHabits.length > 0 ? (
          <List disablePadding>
            {filteredHabits.map((habit) => (
              <HabitItem key={habit.id} habit={habit} />
            ))}
          </List>
        ) : (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderStyle: 'dashed', 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03)
            }}
          >
            <AssignmentTurnedInIcon sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.6, mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {viewMode === 'today'
                ? (habits.length === 0 ? 'Aún no has creado ningún hábito.' : 'No hay hábitos programados para este día.')
                : 'Aún no has creado ningún hábito.'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={createNewHabit}
              size="medium"
            >
              Crear Hábito
            </Button>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Layout title="Seguimiento de Hábitos">
       <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}> {/* Ajusta maxWidth según necesidad */}
        <Stack spacing={3}>
          {/* Panel de Control (Stats y Navegación) */}
          <ControlPanel />

          {/* Lista de Hábitos */}
          <HabitsListPanel />
          
        </Stack>
      </Container>

      {/* Botón Flotante para añadir */}
      <Fab 
        color="primary" 
        aria-label="añadir hábito" 
        onClick={createNewHabit}
        sx={{
          position: 'fixed',
          bottom: { xs: 70, sm: 30 }, // Ajustar posición para evitar barra inferior en móvil
          right: { xs: 16, sm: 30 }
        }}
      >
        <AddIcon />
      </Fab>
    </Layout>
  );
};

export default Habits;
