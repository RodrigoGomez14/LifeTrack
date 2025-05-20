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
  Skeleton,
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from 'moment';
import 'moment/locale/es';
import { useStore } from '../../store';
import { database, auth } from '../../firebase';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Global } from '@emotion/react';
import ReactApexChart from 'react-apexcharts';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Configurar locale de moment
moment.locale('es');
const localizer = momentLocalizer(moment);

const Habits = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Estado para la navegación temporal
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Estados para los hábitos
  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [allWeeksCompletedHabits, setAllWeeksCompletedHabits] = useState({});
  const [habitEvents, setHabitEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    completion: 0
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
      
      // Cargar hábitos completados para la semana actual
      loadCompletedHabitsForWeek(currentWeek);
      
      // Cargar datos de todas las semanas para el gráfico
      loadAllWeeksCompletedHabits();
      
      setLoading(false);
    } else {
      setHabits([]); // Asegurarse de limpiar los hábitos si no hay datos
      setCompletedHabits({});
      setAllWeeksCompletedHabits({});
      setLoading(false);
    }
  }, [userData]); // Solo depende de userData inicialmente

  // Obtener el inicio y fin de la semana actual
  const getWeekRange = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando el día es domingo
    
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { start: weekStart, end: weekEnd };
  };

  // Cargar hábitos completados para una semana específica
  const loadCompletedHabitsForWeek = (date) => {
    if (!userData?.habits?.completed) {
      setCompletedHabits({});
      return;
    }
    
    const { start, end } = getWeekRange(date);
    
    // Crear un objeto para almacenar todos los hábitos completados de la semana
    const weeklyCompleted = {};
    
    // Recorrer cada día de la semana
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = formatDate(currentDate);
      if (userData.habits.completed[dateStr]) {
        weeklyCompleted[dateStr] = userData.habits.completed[dateStr];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCompletedHabits(weeklyCompleted);
  };

  // Nueva función para cargar datos de hábitos completados para múltiples semanas
  const loadAllWeeksCompletedHabits = () => {
    if (!userData?.habits?.completed) {
      setAllWeeksCompletedHabits({});
      return;
    }
    
    const allCompleted = {};
    
    // Obtener la fecha actual
    const currentDate = new Date();
    
    // Cargar datos para las últimas 5 semanas
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
      
      const { start, end } = getWeekRange(weekStart);
      
      // Recorrer cada día de la semana
      const weekDate = new Date(start);
      while (weekDate <= end) {
        const dateStr = formatDate(weekDate);
        if (userData.habits.completed[dateStr]) {
          allCompleted[dateStr] = userData.habits.completed[dateStr];
        }
        weekDate.setDate(weekDate.getDate() + 1);
      }
    }
    
    setAllWeeksCompletedHabits(allCompleted);
  };
  
  // Efecto para actualizar los eventos cuando cambian los hábitos o los hábitos completados
  useEffect(() => {
    if (habits.length > 0) {
      generateHabitEvents();
    } else {
      setHabitEvents([]);
    }
  }, [habits, completedHabits, currentWeek]);
  
  // Generar eventos de hábitos para el calendario
  const generateHabitEvents = () => {
    if (!habits.length) return;
    
    const events = [];
    const { start, end } = getWeekRange(currentWeek);
    
    // Variables para estadísticas
    let totalCompletions = 0;
    let totalPossible = 0;
    let habitStats = {};
    let dayStats = {};
    
    // Para cada día de la semana
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];
      
      // Inicializar estadísticas para este día
      dayStats[dateStr] = {
        day: dayName,
        total: 0,
        completed: 0,
        percentage: 0,
        score: 0
      };
      
      // Para cada hábito, verificar si corresponde a este día
      habits.forEach(habit => {
        if (shouldShowHabitForDate(habit, currentDate)) {
          // Incrementar el contador total de hábitos para este día
          dayStats[dateStr].total++;
          totalPossible++;
          
          // Inicializar estadísticas para este hábito si no existen
          if (!habitStats[habit.id]) {
            habitStats[habit.id] = {
              id: habit.id,
              name: habit.name,
              color: habit.color || 'primary',
              possibleDays: 0,
              completedDays: 0,
              percentage: 0
            };
          }
          
          habitStats[habit.id].possibleDays++;
          
          // Verificar si el hábito fue completado este día
          const isCompleted = completedHabits[dateStr] && completedHabits[dateStr][habit.id];
          if (isCompleted) {
            dayStats[dateStr].completed++;
            totalCompletions++;
            habitStats[habit.id].completedDays++;
          }
          
          // Crear evento para el calendario
          events.push({
            id: `${habit.id}-${dateStr}`,
            title: habit.name,
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59),
            allDay: true,
            resource: {
              habit,
              date: dateStr,
              isCompleted: !!isCompleted
            }
          });
        }
      });
      
      // Calcular porcentaje para este día
      if (dayStats[dateStr].total > 0) {
        dayStats[dateStr].percentage = Math.round((dayStats[dateStr].completed / dayStats[dateStr].total) * 100);
        
        // Calcular score ponderado para este día, similar a la fórmula de hábitos
        // La fórmula combina 30% del porcentaje con 20 puntos por cada hábito completado
        dayStats[dateStr].score = (dayStats[dateStr].percentage * 0.3) + (dayStats[dateStr].completed * 20);
      }
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calcular porcentajes para hábitos
    Object.keys(habitStats).forEach(habitId => {
      const habit = habitStats[habitId];
      habit.percentage = habit.possibleDays > 0 
        ? Math.round((habit.completedDays / habit.possibleDays) * 100) 
        : 0;
    });
    
    setHabitEvents(events);
    
    // Calcular estadísticas para el día actual
    const today = formatDate(new Date());
    const todayHabits = habits.filter(habit => shouldShowHabitForDate(habit, new Date()));
    const completedToday = todayHabits.filter(habit => 
      completedHabits[today] && completedHabits[today][habit.id]
    ).length;
    
    // Encontrar el hábito más consistente
    let mostConsistentHabit = { percentage: 0, completedDays: 0, score: 0 };
    let leastConsistentHabit = { percentage: 100 };
    
    Object.values(habitStats).forEach(habit => {
      // Calcular una puntuación ponderada que considere tanto el porcentaje como la cantidad de días completados
      // La fórmula da más peso a hábitos con más días completados cuando los porcentajes son similares
      const score = (habit.percentage * 0.5) + (habit.completedDays * 15);
      
      // Agregar la puntuación al objeto habit
      habit.score = score;
      
      if (habit.possibleDays > 0 && score > mostConsistentHabit.score) {
        mostConsistentHabit = habit;
      }
      if (habit.percentage < leastConsistentHabit.percentage && habit.possibleDays > 0) {
        leastConsistentHabit = habit;
      }
    });
    
    // Encontrar el mejor y peor día, ahora usando el score ponderado
    let bestDay = { score: 0 };
    let worstDay = { percentage: 100 };
    
    Object.values(dayStats).forEach(day => {
      if (day.score > bestDay.score && day.total > 0) {
        bestDay = day;
      }
      if (day.percentage < worstDay.percentage && day.total > 0) {
        worstDay = {
          ...day,
          percentage: day.percentage
        };
      }
    });
    
      setStats({
      totalHabits: habits.length,
      todayHabits: todayHabits.length,
      completedToday,
      completion: todayHabits.length > 0 
        ? Math.round((completedToday / todayHabits.length) * 100) 
        : 0,
      weeklyCompletion: totalPossible > 0 
        ? Math.round((totalCompletions / totalPossible) * 100) 
        : 0,
      mostConsistentHabit,
      leastConsistentHabit,
      bestDay,
      worstDay,
      habitStats: Object.values(habitStats).sort((a, b) => b.percentage - a.percentage),
      dayStats: dayStats
    });
  };
  
  // Determinar si un hábito debe mostrarse para una fecha específica
  const shouldShowHabitForDate = (habit, date) => {
    const dayOfWeek = date.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
    const dayOfMonth = date.getDate(); // 1-31
    const month = date.getMonth() + 1; // 1-12
    
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
      case 'monthly':
        // Verificar si el día del mes está en la lista de días mensuales
        return Array.isArray(habit.monthlyDays) && habit.monthlyDays.includes(dayOfMonth);
      case 'yearly':
        // Verificar si el mes actual está en la lista de meses anuales
        return Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.includes(month);
      default:
        return true; // Por defecto, mostrar si no hay frecuencia clara
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
  const toggleHabitCompletion = async (habitId, dateStr) => {
    const habitRef = database.ref(`${auth.currentUser.uid}/habits/${habitId}`);
    const completedRef = database.ref(`${auth.currentUser.uid}/habits/completed/${dateStr}/${habitId}`);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;

    const isCurrentlyCompleted = completedHabits[dateStr] && completedHabits[dateStr][habitId];
    const newCompletedStatus = !isCurrentlyCompleted;

    // Optimistic UI Update for completion status in both state variables
    setCompletedHabits(prev => {
      const updated = {...prev};
      if (!updated[dateStr]) {
        updated[dateStr] = {};
      }
      
      if (newCompletedStatus) {
        updated[dateStr][habitId] = { completedAt: new Date().toISOString(), habitId };
      } else {
        if (updated[dateStr]) {
          delete updated[dateStr][habitId];
          // Si ya no hay hábitos completados para esta fecha, eliminar la fecha
          if (Object.keys(updated[dateStr]).length === 0) {
            delete updated[dateStr];
          }
        }
      }
      return updated;
    });
    
    // También actualizar allWeeksCompletedHabits para mantener el gráfico actualizado
    setAllWeeksCompletedHabits(prev => {
      const updated = {...prev};
      if (!updated[dateStr]) {
        updated[dateStr] = {};
      }
      
      if (newCompletedStatus) {
        updated[dateStr][habitId] = { completedAt: new Date().toISOString(), habitId };
      } else {
        if (updated[dateStr]) {
          delete updated[dateStr][habitId];
          // Si ya no hay hábitos completados para esta fecha, eliminar la fecha
          if (Object.keys(updated[dateStr]).length === 0) {
            delete updated[dateStr];
          }
        }
      }
      return updated;
    });

    try {
      // Actualizar estado de completado en Firebase
      if (newCompletedStatus) {
        await completedRef.set({ completedAt: new Date().toISOString(), habitId });
      } else {
        await completedRef.remove();
      }

    } catch (error) {
      console.error("Error updating habit completion:", error);
      // Revertir UI en caso de error - ambos estados
      setCompletedHabits(prev => {
        const reverted = {...prev};
        if (!reverted[dateStr]) {
          reverted[dateStr] = {};
        }
        
        if (!newCompletedStatus) { // Si estábamos desmarcando
          if (isCurrentlyCompleted) { // Y originalmente estaba completado
            reverted[dateStr][habitId] = { completedAt: 'reverted', habitId };
          }
        } else { // Si estábamos marcando
          if (reverted[dateStr] && reverted[dateStr][habitId]) {
            delete reverted[dateStr][habitId];
            // Si ya no hay hábitos completados para esta fecha, eliminar la fecha
            if (Object.keys(reverted[dateStr]).length === 0) {
              delete reverted[dateStr];
            }
          }
        }
        return reverted;
      });
      
      // También revertir allWeeksCompletedHabits
      setAllWeeksCompletedHabits(prev => {
        const reverted = {...prev};
        if (!reverted[dateStr]) {
          reverted[dateStr] = {};
        }
        
        if (!newCompletedStatus) { // Si estábamos desmarcando
          if (isCurrentlyCompleted) { // Y originalmente estaba completado
            reverted[dateStr][habitId] = { completedAt: 'reverted', habitId };
          }
        } else { // Si estábamos marcando
          if (reverted[dateStr] && reverted[dateStr][habitId]) {
            delete reverted[dateStr][habitId];
            // Si ya no hay hábitos completados para esta fecha, eliminar la fecha
            if (Object.keys(reverted[dateStr]).length === 0) {
              delete reverted[dateStr];
            }
          }
        }
        return reverted;
      });
    }
  };
  
  // Crear un nuevo hábito
  const createNewHabit = () => {
    navigate('/NuevoHabito');
  };
  
  // Navegación entre semanas
  const handleNavigate = (action) => {
    let newDate = new Date(currentWeek);
    
    if (action === 'PREV') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (action === 'NEXT') {
      // Verificar si ya estamos en la semana actual o futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener el inicio de la semana actual que se está viendo
      const { start: currentWeekStart } = getWeekRange(currentWeek);
      
      // Obtener el inicio de la semana que contiene la fecha actual
      const nowWeekStart = getWeekRange(today).start;
      
      // Si ya estamos en la semana actual o posterior, no permitir avanzar
      if (currentWeekStart >= nowWeekStart) {
        return; // No navegar al futuro
      }
      
      newDate.setDate(newDate.getDate() + 7);
    } else if (action === 'TODAY') {
      newDate = new Date();
    }
    
    setCurrentWeek(newDate);
    loadCompletedHabitsForWeek(newDate);
    
    // No necesitamos volver a cargar allWeeksCompletedHabits ya que contiene datos de todas las semanas
    // y se mantiene actualizado con los cambios
  };
  
  // Comprobar si la fecha seleccionada es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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
        return 'Semanal';
      case 'monthly':
        if (Array.isArray(habit.monthlyDays) && habit.monthlyDays.length > 0) {
          if (habit.monthlyDays.length === 1) {
            return `Día ${habit.monthlyDays[0]} del mes`;
          }
          const sortedDays = [...habit.monthlyDays].sort((a, b) => a - b);
          return `Días ${sortedDays.join(', ')} del mes`;
        }
        return 'Mensual';
      case 'yearly':
        if (Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.length > 0) {
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          // Ordenar los meses seleccionados
          const sortedMonths = [...habit.yearlyMonths].sort((a, b) => a - b);
          return sortedMonths.map(month => monthNames[month - 1]).join(', ');
        }
        return 'Anual';
      default: return ''; // Frecuencia no especificada o desconocida
    }
  };

  // Formatear el rango de la semana
  const formatWeekRangeDisplay = (date) => {
    const { start, end } = getWeekRange(date);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString('es-ES', { month: 'long' });
    const endMonth = end.toLocaleString('es-ES', { month: 'long' });
    const year = start.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} de ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  };

  // Componente personalizado para el evento del calendario
  const HabitEvent = ({ event }) => {
    const { habit, date, isCompleted } = event.resource;
    
    // Usar el color específico del hábito o un color por defecto
    const habitColor = habit.color ? theme.palette[habit.color].main : theme.palette.primary.main;
    
    return (
      <Box 
          sx={{
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: isCompleted 
            ? alpha(habitColor, 0.15) // Mantener el color del hábito incluso cuando está completado
            : alpha(habitColor, 0.2),
          borderLeft: `3px solid ${habitColor}`,
          mb: 0.5,
          boxShadow: isCompleted ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: isCompleted 
              ? alpha(habitColor, 0.25)
              : alpha(habitColor, 0.35),
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: habitColor,
              mr: 1 
            }} 
          />
          <Typography variant="body2" noWrap sx={{ 
            fontWeight: isCompleted ? 'normal' : 'medium',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? alpha(theme.palette.text.primary, 0.7) : theme.palette.text.primary,
            fontSize: '0.8rem'
          }}>
            {habit.name}
          </Typography>
        </Box>
        <Checkbox
          checked={isCompleted}
          onChange={() => toggleHabitCompletion(habit.id, date)}
          icon={<RadioButtonUncheckedIcon fontSize="small" />}
          checkedIcon={<CheckCircleIcon fontSize="small" />}
          size="small"
          sx={{ 
            p: 0.25,
            color: habitColor,
            '& svg': {
              fontSize: '1rem'
            },
            '&.Mui-checked': {
              color: habitColor // Mantener el color del hábito para la marca de verificación
            }
          }}
        />
      </Box>
    );
  };

  // Componente personalizado para renderizar estadísticas en cada día
  const DayStatsWrapper = ({ children, value, day }) => {
    const dateStr = formatDate(value);
    const stats = window.dailyHabitStats?.[dateStr] || { total: 0, completed: 0 };
    const isToday = value.getDate() === new Date().getDate() && 
                   value.getMonth() === new Date().getMonth() && 
                   value.getFullYear() === new Date().getFullYear();
    
    // Calcular el porcentaje de completado para la barra de progreso
    const completionPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const showStats = stats.total > 0;
    
    return (
      <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
        {children}
        
        {showStats && (
        <Box
          sx={{
            position: 'absolute',
              top: 10, 
              right: 10, 
              borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
              p: '4px 8px',
              bgcolor: isToday ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.grey[600], 0.15),
              border: `1px solid ${isToday ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.grey[500], 0.2)}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 5
          }}
        >
          <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 'bold', 
                color: isToday ? 'primary.main' : 'text.primary',
                lineHeight: 1,
                fontSize: '0.8rem'
              }}
            >
              {stats.completed}/{stats.total}
          </Typography>
        </Box>
        )}
        
        {showStats && (
          <Box 
            sx={{ 
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '4px',
              bgcolor: alpha(theme.palette.grey[300], 0.5),
              overflow: 'hidden',
              zIndex: 5
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${completionPercent}%`,
                bgcolor: completionPercent === 100 
                  ? theme.palette.success.main 
                  : completionPercent > 50 
                    ? theme.palette.info.main 
                    : theme.palette.warning.main,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  // Función auxiliar para crear los componentes de cabecera
  const CustomHeader = ({ date, label }) => {
    // Determinar si es el día actual
    const isCurrentDay = isToday(date);
    const dayOfWeek = date.getDay();
    const dayDate = date.getDate();
    
    // Nombres de días en español abreviados
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return (
      <div 
        style={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isCurrentDay ? theme.palette.primary.main : 'transparent',
          boxShadow: isCurrentDay ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
          borderRadius: '10px 10px 0 0',
          position: 'relative',
          padding: '8px 0',
          margin: 0,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 1.5,
            width: '100%',
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold',
              color: isCurrentDay ? theme.palette.common.white : theme.palette.text.secondary,
              fontSize: '0.85rem',
              lineHeight: 1,
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {dayNames[dayOfWeek]}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: isCurrentDay ? theme.palette.common.white : theme.palette.text.primary,
              fontSize: '1.2rem',
              lineHeight: 1
            }}
          >
            {dayDate}
          </Typography>
        </Box>
      </div>
    );
  };

  // Estilos para personalizar el calendario
  const calendarStyles = {
    position: 'relative',
    '.rbc-toolbar': {
      display: 'none'
    },
    '.rbc-header': {
      padding: 0,
      fontWeight: 'normal',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      boxShadow: 'none',
      overflow: 'hidden',
    },
    '.rbc-header + .rbc-header': {
      borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    },
    '.rbc-time-header': {
      display: 'none'
    },
    '.rbc-time-content': {
      display: 'none'
    },
    '.rbc-month-view, .rbc-agenda-view, .rbc-week-view': {
      border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
    },
    '.rbc-month-row, .rbc-time-row': {
      minHeight: 'auto',
    },
    '.rbc-day-bg': {
      transition: 'all 0.3s ease',
      backgroundColor: 'white', // Fondo blanco para mejor contraste
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      margin: '0 2px', // Agregar margen horizontal entre los días
      borderRadius: '0 0 8px 8px', // Redondear las esquinas inferiores
    },
    '.rbc-day-bg:hover': {
      backgroundColor: alpha(theme.palette.background.default, 0.5)
    },
    '.rbc-today': {
      backgroundColor: alpha(theme.palette.primary.light, 0.06),
      borderTop: `2px solid ${theme.palette.primary.main}`,
      boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
    },
    '.rbc-date-cell': {
      padding: '10px 12px',
      textAlign: 'center',
      fontSize: '1rem',
      fontWeight: 'medium',
      position: 'relative',
    },
    '.rbc-date-cell.rbc-now': {
      fontWeight: 'bold',
      color: theme.palette.primary.main,
    },
    '.rbc-date-cell.rbc-now::after': {
      content: '""',
      position: 'absolute',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: -1,
    },
    '.rbc-row-bg': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    },
    '.rbc-row-content': {
      margin: '4px 0'
    },
    '.rbc-event': {
      backgroundColor: 'transparent',
      padding: 0,
      border: 'none'
    },
    '.rbc-event-content': {
      width: '100%'
    },
    '.rbc-row-segment': {
      padding: '2px 6px'
    },
    '.rbc-show-more': {
      backgroundColor: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.dark,
      fontWeight: 'medium',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: '0.75rem',
      marginTop: 4,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.info.main, 0.2),
      }
    },
    '.rbc-off-range-bg': {
      backgroundColor: alpha(theme.palette.background.default, 0.8)
    },
    '.rbc-off-range': {
      color: alpha(theme.palette.text.disabled, 0.6)
    },
    // Establecer un espacio entre los días en la vista de semana
    '.rbc-time-view .rbc-day-slot': {
      margin: '0 2px',
    },
    '.rbc-time-header-content .rbc-header': {
      margin: '0 2px',
    },
    // Añadir espacio entre las filas del calendario
    '.rbc-row': {
      marginBottom: '2px',
    }
  };

  // Estilos globales para el calendario
  const GlobalStyles = () => (
    <Global
      styles={{
        '.habits-calendar .rbc-event': {
          backgroundColor: 'transparent !important',
          border: 'none !important'
        },
        '.habits-calendar .rbc-event-content': {
          width: '100% !important'
        },
        '.habits-calendar .rbc-day-bg': {
          overflow: 'auto !important',
          msOverflowStyle: 'none !important',
          scrollbarWidth: 'thin !important',
          '&::-webkit-scrollbar': {
            width: '4px !important'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent !important'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.1) !important',
            borderRadius: '4px !important'
          }
        },
        '.habits-calendar .rbc-month-view': {
          flex: '1 0 0'
        },
        '.habits-calendar .rbc-month-header': {
          fontWeight: 'bold !important'
        },
        '.habits-calendar .rbc-month-row': {
          overflow: 'visible !important',
        },
        '.habits-calendar .rbc-off-range': {
          opacity: '0.6 !important'
        },
        '.habits-calendar .rbc-day-slot': {
          background: 'white !important'
        },
        '.habits-calendar .rbc-week-view': {
          background: 'white !important',
          flex: '1 !important',
          display: 'flex !important',
          flexDirection: 'column !important',
        },
        '.habits-calendar .rbc-calendar': {
          display: 'flex !important',
          flexDirection: 'column !important'
        },
        // Restaurar y mejorar estilos para el encabezado
        '.habits-calendar .rbc-header': {
          padding: '0 !important',
          position: 'relative !important',
          height: 'auto !important',
          width: '100% !important'
        },
        '.habits-calendar .rbc-header > *': {
          width: '100% !important',
          height: '100% !important'
        },
        '.habits-calendar .rbc-row-content': {
          marginTop: '12px !important' // Aumentar margen superior
        },
        '.habits-calendar .rbc-header > span': {
          display: 'none !important' // Ocultar texto original del header
        },
        '.habits-calendar .rbc-row.rbc-month-header': {
          marginBottom: '10px !important', // Aumentar margen inferior
        },
        '.habits-calendar .rbc-header + .rbc-header': {
          borderLeftWidth: '2px !important',
          borderLeftColor: 'rgba(0,0,0,0.04) !important'
        },
        '.habits-calendar .rbc-time-view': {
          border: '1px solid #ddd !important',
          borderRadius: '12px !important',
          overflow: 'hidden !important'
        },
        '.habits-calendar .rbc-time-header-content .rbc-header.rbc-today': {
          backgroundColor: 'transparent !important'
        }
      }}
    />
  );

  // Panel Superior (Navegación y Estadísticas)
  const WeekNavigator = () => {
    // Verificar si ya estamos en la semana actual o en el futuro
    const isCurrentOrFutureWeek = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener el inicio de la semana actual que se está viendo
      const { start: currentWeekStart } = getWeekRange(currentWeek);
      
      // Obtener el inicio de la semana que contiene la fecha actual
      const nowWeekStart = getWeekRange(today).start;
      
      // Verificar si la semana que se está visualizando es la actual o posterior
      return currentWeekStart >= nowWeekStart;
    };
    
    // Calcular cuántas semanas en el pasado estamos
    const getWeeksInPast = () => {
      if (isCurrentOrFutureWeek()) return 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener el inicio de la semana actual que se está viendo
      const { start: currentWeekStart } = getWeekRange(currentWeek);
      
      // Obtener el inicio de la semana que contiene la fecha actual
      const nowWeekStart = getWeekRange(today).start;
      
      // Calcular la diferencia en días y convertir a semanas
      const diffTime = Math.abs(nowWeekStart - currentWeekStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.round(diffDays / 7);
    };
    
    const nextDisabled = isCurrentOrFutureWeek();
    const weeksInPast = getWeeksInPast();
    const isCurrentWeek = weeksInPast === 0;
    
    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          mb: 3,
          mt: 2, // Agregar margen superior para separar del appbar
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: { xs: theme.shadows[3], sm: theme.shadows[6] },
          },
          bgcolor: '#1a1a1a' // Fondo oscuro para mejor contraste
        }}
      >
        <Box sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          bgcolor: 'rgba(0,0,0,0.8)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between" 
            spacing={2}
          >
            <Tooltip title="Semana anterior">
              <IconButton 
                onClick={() => handleNavigate('PREV')} 
                size="small" 
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  color: theme.palette.common.white,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.25),
                  }
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="common.white" align="center">
                {formatWeekRangeDisplay(currentWeek)}
              </Typography>
              
              {/* Mostrar el chip solo si no es la semana actual y es menor a 10 semanas atrás */}
              {!isCurrentWeek && weeksInPast <= 10 && (
                <Chip
                  label={`${weeksInPast} ${weeksInPast === 1 ? 'semana' : 'semanas'} atrás`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    mt: 0.5, 
                    fontSize: '0.75rem',
                    height: 22,
                    color: 'white',
                    borderColor: alpha(theme.palette.common.white, 0.5),
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
              
              {isCurrentWeek && (
                <Chip
                  label="Semana actual"
                  size="small"
                  color="success"
                  sx={{ 
                    mt: 0.5, 
                    fontSize: '0.75rem',
                    height: 22,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
            </Box>

            <Tooltip title={nextDisabled ? "No se puede navegar al futuro" : "Semana siguiente"}>
              <span>
                <IconButton 
                  onClick={() => handleNavigate('NEXT')} 
                  size="small"
                  disabled={nextDisabled}
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, nextDisabled ? 0.05 : 0.15),
                    color: nextDisabled ? alpha(theme.palette.common.white, 0.4) : theme.palette.common.white,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: nextDisabled ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.white, 0.25),
                    }
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          
          {!isCurrentWeek && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                size="small" 
                onClick={() => handleNavigate('TODAY')} 
                startIcon={<CalendarTodayIcon />}
                sx={{ 
                  borderRadius: 2,
                  py: 0.5,
                  px: 2,
                  boxShadow: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.25),
                  }
                }}
              >
                Ir a semana actual
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  // Componente de Tarjetas de Estadísticas
  const StatCards = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      );
    }
    
    const getColoredPercentage = (percentage) => {
      if (percentage >= 80) return { color: theme.palette.success.main, text: 'Excelente' };
      if (percentage >= 60) return { color: theme.palette.info.main, text: 'Muy bien' };
      if (percentage >= 40) return { color: theme.palette.warning.main, text: 'Regular' };
      return { color: theme.palette.error.main, text: 'Necesita mejorar' };
    };
    
    return (
      <Grid container spacing={3}>
        {/* Tarjeta 1: Resumen de la semana */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: { xs: 2, sm: 3 }, 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-5px)' },
                boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
              }
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
                  <CalendarViewWeekIcon />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                    Progreso Semanal
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    {formatWeekRangeDisplay(currentWeek)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
                        <CardContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.weeklyCompletion}%
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'medium', 
                    color: getColoredPercentage(stats.weeklyCompletion).color
                  }}
                >
                  {getColoredPercentage(stats.weeklyCompletion).text}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={stats.weeklyCompletion} 
                color="primary"
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mb: 2
                }}
              />
              
              {/* Mini gráfico de progreso semanal */}
              <Box sx={{ mt: 1, mb: 1, height: 80 }}>
                {allWeeksCompletedHabits && Object.keys(allWeeksCompletedHabits).length > 0 && (
                  <ReactApexChart
                    options={{
                      chart: {
                        type: 'line',
                        toolbar: { show: false },
                        sparkline: { enabled: true },
                      },
                      stroke: {
                        curve: 'smooth',
                        width: 3,
                      },
                      colors: [theme.palette.primary.main],
                      tooltip: {
                        fixed: { enabled: false },
                        x: { show: false },
                        y: {
                          formatter: (val) => `${val}%`,
                          title: { formatter: () => 'Progreso:' },
                        },
                        marker: { show: false },
                        theme: 'dark',
                        style: {
                          fontSize: '12px',
                          fontFamily: theme.typography.fontFamily
                        },
                        background: 'rgba(0, 0, 0, 0.85)',
                        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                          const value = series[seriesIndex][dataPointIndex];
                          const date = w.globals.categoryLabels[dataPointIndex];
                          return (
                            '<div class="apexcharts-tooltip-box" style="padding: 8px; background: rgba(0, 0, 0, 0.85); color: white; border-radius: 4px; border: none; font-weight: 500;">' +
                            `<span style="font-weight: bold;">${date}</span><br/>` + 
                            `<span>Progreso: <span style="color: #5c9eff; font-weight: bold;">${value}%</span></span>` +
                            '</div>'
                          );
                        }
                      },
                      xaxis: {
                        categories: (() => {
                          // Obtener las últimas 5 semanas
                          const weekLabels = [];
                          const currentDate = new Date();
                          for (let i = 4; i >= 0; i--) {
                            const weekStart = new Date(currentDate);
                            weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
                            // Formatear como "DD/MM"
                            const monthDay = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
                            weekLabels.push(monthDay);
                          }
                          return weekLabels;
                        })(),
                      }
                    }}
                    series={[{
                      name: 'Progreso',
                      data: (() => {
                        // Calcular el progreso semanal para las últimas 5 semanas
                        const weeklyData = [];
                        const currentDate = new Date();
                        
                        for (let i = 4; i >= 0; i--) {
                          // Fecha de inicio para esta semana
                          const weekStart = new Date(currentDate);
                          weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
                          
                          // Fecha de fin para esta semana
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekStart.getDate() + 6);
                          
                          // Inicializar contadores
                          let totalPossible = 0;
                          let totalCompleted = 0;
                          
                          // Para cada día de la semana
                          const dayIterator = new Date(weekStart);
                          while (dayIterator <= weekEnd) {
                            const dateStr = formatDate(dayIterator);
                            
                            // Contar hábitos posibles y completados para este día
                            habits.forEach(habit => {
                              if (shouldShowHabitForDate(habit, dayIterator)) {
                                totalPossible++;
                                if (allWeeksCompletedHabits[dateStr] && allWeeksCompletedHabits[dateStr][habit.id]) {
                                  totalCompleted++;
                                }
                              }
                            });
                            
                            // Avanzar al siguiente día
                            dayIterator.setDate(dayIterator.getDate() + 1);
                          }
                          
                          // Calcular el porcentaje para esta semana
                          const weeklyPercentage = totalPossible > 0
                            ? Math.round((totalCompleted / totalPossible) * 100)
                            : 0;
                          
                          weeklyData.push(weeklyPercentage);
                        }
                        
                        return weeklyData;
                      })()
                    }]}
                    type="line"
                    height={80}
                  />
                )}
              </Box>
              
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <span>Total hábitos: {stats.totalHabits}</span>
                  <span>Completado hoy: {stats.completedToday}/{stats.todayHabits}</span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta 2: Hábito más consistente */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: { xs: 2, sm: 3 }, 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-5px)' },
                boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
              }
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
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                    Mejor Rendimiento
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    Hábito más consistente
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {stats.habitStats && stats.habitStats.length > 0 ? (
                <>
                  <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette[stats.mostConsistentHabit.color]?.main || theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      {stats.mostConsistentHabit.name?.substring(0, 1) || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {stats.mostConsistentHabit.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.mostConsistentHabit.completedDays} de {stats.mostConsistentHabit.possibleDays} días
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.mostConsistentHabit.percentage} 
                    color="success"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      mb: 2
                    }}
                  />
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      color: theme.palette.success.main,
                      mb: 1
                    }}
                  >
                    {stats.mostConsistentHabit.percentage}%
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.success.main
                        }}
                      >
                        Efectividad alta
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.success.dark
                        }}
                      >
                        Consistencia {stats.mostConsistentHabit.completedDays} días
                      </Typography>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay datos suficientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta 3: Mejor día de la semana */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: { xs: 2, sm: 3 }, 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-5px)' },
                boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
              }
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3 },
                background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
                  <TodayIcon />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                    Mejor Día
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    Mayor cumplimiento
                  </Typography>
                </Box>
              </Stack>
            </Box>
                        <CardContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {stats.bestDay && stats.bestDay.day ? (
                <>
                  <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: theme.palette.info.main
                      }}
                    >
                      {stats.bestDay.day}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.bestDay.completed} de {stats.bestDay.total} hábitos
                    </Typography>
                    <Typography variant="caption" color="info.dark" sx={{ mt: 0.5, display: 'block', fontWeight: 'medium' }}>
                      Rendimiento destacado
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.bestDay.percentage} 
                    color="info"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      mb: 2
                    }}
                  />
                  
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.info.main
                        }}
                      >
                        {stats.bestDay.percentage}% completado
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.info.dark
                        }}
                      >
                        {stats.bestDay.completed} hábitos
                      </Typography>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay datos suficientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tarjeta 4: Hábito que necesita mejorar */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: { xs: 2, sm: 3 }, 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-5px)' },
                boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
              }
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3 },
                background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                    Necesita Mejorar
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    Hábito menos consistente
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <CardContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
              {stats.habitStats && stats.habitStats.length > 0 && stats.leastConsistentHabit && stats.leastConsistentHabit.name ? (
                <>
                  <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette[stats.leastConsistentHabit.color]?.main || theme.palette.warning.main,
                        mr: 2
                      }}
                    >
                      {stats.leastConsistentHabit.name?.substring(0, 1) || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {stats.leastConsistentHabit.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.leastConsistentHabit.completedDays} de {stats.leastConsistentHabit.possibleDays} días
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.leastConsistentHabit.percentage} 
                    color="warning" 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      mb: 2
                    }}
                  />
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold', 
                      textAlign: 'center',
                      color: theme.palette.warning.main,
                      mb: 1
                    }}
                  >
                    {stats.leastConsistentHabit.percentage}%
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.warning.main
                        }}
                      >
                        Prioridad alta
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: theme.palette.warning.dark
                        }}
                      >
                        Oportunidad de mejora
                      </Typography>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay datos suficientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Componente del Calendario
  const CalendarPanel = () => {
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

    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
          }
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 }
                }}
              >
                <DateRangeIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Seguimiento Semanal
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  {formatWeekRangeDisplay(currentWeek)}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'background.paper' }} className="habits-calendar">
          <Calendar
            localizer={localizer}
            events={habitEvents}
            startAccessor="start"
            endAccessor="end"
            style={calendarStyles}
            view="week"
            views={['week']}
            components={{
              event: HabitEvent,
              toolbar: () => null,
              dateCellWrapper: DayStatsWrapper,
              header: CustomHeader
            }}
            messages={{
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              week: 'Semana',
              date: 'Fecha',
              noEventsInRange: 'No hay hábitos para mostrar en este período',
            }}
            date={currentWeek}
          />
        </Box>
      </Card>
    );
  };

  // Componente para el gráfico de evolución semanal
  const WeeklyEvolutionChart = () => {
    const [chartData, setChartData] = useState({
      series: [],
      options: {}
    });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Obtener datos históricos de hábitos completados
    useEffect(() => {
      if (!userData || !habits.length) return;

      // Obtener la fecha actual
      const currentDate = new Date();
      
      // Obtener las últimas 5 semanas (incluyendo la actual)
      const weekLabels = [];
      const weekDates = [];
      
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
        
        // Formatear la fecha para mostrar como etiqueta
        const weekLabel = `${formatDate(weekStart).substring(5)}`;
        weekLabels.push(weekLabel);
        
        // Almacenar las fechas de inicio de cada semana
        weekDates.push(weekStart);
      }

      // Preparar series de datos para el gráfico
      const series = [];
      
      // Para cada una de las últimas 5 semanas
      weekDates.forEach((weekStartDate, weekIndex) => {
        // Calcular la fecha final de la semana (fecha inicial + 6 días)
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        
        // Formatear fechas como DD/MM
        const startFormatted = `${weekStartDate.getDate().toString().padStart(2, '0')}/${(weekStartDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const endFormatted = `${weekEndDate.getDate().toString().padStart(2, '0')}/${(weekEndDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const weekData = {
          name: `${startFormatted} - ${endFormatted}`,
          data: Array(7).fill(0) // Inicializar con 0 completados para cada día
        };
        
        // Calcular el porcentaje de completados para cada día de la semana
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const currentDay = new Date(weekStartDate);
          currentDay.setDate(weekStartDate.getDate() + dayOffset);
          const dateStr = formatDate(currentDay);
          
          // Contar hábitos posibles y completados para ese día
          let possibleHabits = 0;
          let completedHabitsCount = 0;
          
          habits.forEach(habit => {
            if (shouldShowHabitForDate(habit, currentDay)) {
              possibleHabits++;
              
              // Verificar si el hábito fue completado
              if (allWeeksCompletedHabits[dateStr] && allWeeksCompletedHabits[dateStr][habit.id]) {
                completedHabitsCount++;
              }
            }
          });
          
          // Calcular porcentaje de completitud para ese día
          weekData.data[dayOffset] = possibleHabits > 0 
            ? Math.round((completedHabitsCount / possibleHabits) * 100) 
            : 0;
        }
        
        series.push(weekData);
      });

      // Configuración del gráfico
      const chartOptions = {
        chart: {
          height: 350,
          type: 'line',
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          },
          fontFamily: theme.typography.fontFamily,
          background: 'transparent',
          dropShadow: {
            enabled: true,
            top: 2,
            left: 2,
            blur: 4,
            opacity: 0.15
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3,
          lineCap: 'round'
        },
        markers: {
          size: 4,
          strokeWidth: 2,
          hover: {
            size: 7
          }
        },
        xaxis: {
          categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
          labels: {
            style: {
              colors: theme.palette.text.secondary,
              fontSize: '12px'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          min: 0,
          max: 100,
          labels: {
            formatter: (val) => `${val}%`,
            style: {
              colors: theme.palette.text.secondary
            }
          }
        },
        tooltip: {
          x: {
            show: true
          },
          y: {
            formatter: val => `${val}%`
          },
          theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
          style: {
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily
          }
        },
        grid: {
          borderColor: theme.palette.divider,
          strokeDashArray: 5,
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          },
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 10
          }
        },
        legend: {
          position: 'left',
          horizontalAlign: 'left',
          labels: {
            colors: theme.palette.text.secondary
          },
          fontSize: '13px',
          itemMargin: {
            horizontal: 10,
            vertical: 5
          },
          offsetX: 10,
          offsetY: 5
        },
        responsive: [
          {
            breakpoint: 600,
            options: {
              chart: {
                height: 240
              },
              legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                offsetY: 5,
                fontSize: '11px',
                itemMargin: {
                  horizontal: 6,
                  vertical: 3
                }
              }
            }
          }
        ],
        colors: [
          theme.palette.primary.main,
          theme.palette.info.main, 
          theme.palette.success.main, 
          theme.palette.warning.main,
          theme.palette.error.main
        ]
      };

      setChartData({
        series,
        options: chartOptions
      });
    }, [userData, habits, allWeeksCompletedHabits, theme]);

    // Si no hay datos, mostrar un mensaje
    if (chartData.series.length === 0) {
      return null;
    }

    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
          }
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 }
                }}
              >
                <ShowChartIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Evolución Semanal
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Comparativa de las últimas 5 semanas
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', height: isMobile ? 300 : 400 }}>
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height={isMobile ? 240 : 350}
          />
        </Box>
      </Card>
    );
  };

  return (
    <Layout title="Seguimiento de Hábitos">
      <GlobalStyles />
      <Box sx={{ 
        maxWidth: { xs: 1200, md: 1400, lg: 1600 }, 
        mx: 'auto', 
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        pb: { xs: 10, sm: 8 }
      }}>
        {/* Navegador de Semanas */}
        <WeekNavigator />
        
        {/* Tarjetas de Estadísticas */}
        <StatCards />

        {/* Panel del Calendario */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          mb: { xs: 4, sm: 2 }
        }}>
          <CalendarPanel />
        </Box>

        {/* Gráfico de Evolución de Hábitos */}
        <WeeklyEvolutionChart />
      </Box>

      {/* Botón Flotante para añadir */}
      <Fab 
        color="primary" 
        aria-label="añadir hábito" 
        onClick={createNewHabit}
        sx={{
          position: 'fixed',
          bottom: { xs: 70, sm: 30 }, // Ajustar posición para evitar barra inferior en móvil
          right: { xs: 16, sm: 30 },
          boxShadow: 6
        }}
      >
        <AddIcon />
      </Fab>
    </Layout>
  );
};

export default Habits;
