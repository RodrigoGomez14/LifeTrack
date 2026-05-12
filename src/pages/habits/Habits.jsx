import React, { useState, useEffect } from 'react';
import { Box, Fab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { toggleHabitCompletion as toggleHabitCompletionService } from '../../services/habits';
import {
  formatDate,
  getWeekRange,
  shouldShowHabitForDate,
} from '../../components/habits/habitsHelpers';
import WeekNavigator from '../../components/habits/WeekNavigator';
import WeeklyEvolutionChart from '../../components/habits/WeeklyEvolutionChart';
import HabitsStatCards from '../../components/habits/HabitsStatCards';
import HabitsCalendarPanel from '../../components/habits/HabitsCalendarPanel';

const Habits = () => {
  const { userData } = useStore();
  const navigate = useNavigate();
  
  // Estado para la navegación temporal
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
    let weightedCompletions = 0; // Nuevo: completados ponderados por dificultad
    let weightedPossible = 0;    // Nuevo: posibles ponderados por dificultad
    let habitStats = {};
    let dayStats = {};
    
    // Determinar hasta qué día debemos considerar para las estadísticas
    // Si estamos viendo la semana actual, solo contar hasta hoy
    // Si estamos viendo una semana pasada, contar todos los días
    const currentToday = new Date();
    const isCurrentWeek = 
      start.getFullYear() === currentToday.getFullYear() &&
      start.getMonth() === currentToday.getMonth() &&
      Math.abs(start.getDate() - currentToday.getDate()) < 7;
    
    // Establecer el límite hasta donde contar los hábitos para estadísticas
    const statisticsEndDate = isCurrentWeek 
      ? new Date(Math.min(end.getTime(), currentToday.getTime())) // El menor entre fin de semana y hoy
      : new Date(end); // Toda la semana si es una semana pasada
    
    // Definir orden de colores para clasificación
    const colorOrder = {
      'primary': 0,
      'secondary': 1,
      'success': 2,
      'info': 3,
      'warning': 4,
      'error': 5,
      'inherit': 6,
      'default': 7
    };

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
        score: 0,
        weightedScore: 0 // Nuevo: score ponderado por dificultad
      };
      
      // Para cada hábito, verificar si corresponde a este día
      habits.forEach(habit => {
        if (shouldShowHabitForDate(habit, currentDate)) {
          // Obtener multiplicador de dificultad (por defecto 1.0 si no existe)
          const difficultyMultiplier = habit.difficultyMultiplier || 1.0;
          
          // Incrementar el contador total de hábitos para este día
          dayStats[dateStr].total++;
          
          // Solo contabilizar para estadísticas semanales si no es un día futuro
          if (currentDate <= statisticsEndDate) {
            totalPossible++;
            weightedPossible += difficultyMultiplier; // Sumar peso de dificultad
          }
          
          // Inicializar estadísticas para este hábito si no existen
          if (!habitStats[habit.id]) {
            habitStats[habit.id] = {
              id: habit.id,
              name: habit.name,
              color: habit.color || 'primary',
              difficulty: habit.difficulty || 1,
              difficultyMultiplier: difficultyMultiplier,
              possibleDays: 0,
              completedDays: 0,
              percentage: 0,
              weightedScore: 0 // Nuevo: score ponderado
            };
          }
          
          // Solo contabilizar días posibles hasta la fecha actual
          if (currentDate <= statisticsEndDate) {
            habitStats[habit.id].possibleDays++;
          }
          
          // Verificar si el hábito fue completado este día
          const isCompleted = completedHabits[dateStr] && completedHabits[dateStr][habit.id];
          if (isCompleted) {
            dayStats[dateStr].completed++;
            
            // Solo contabilizar completados hasta la fecha actual
            if (currentDate <= statisticsEndDate) {
              totalCompletions++;
              weightedCompletions += difficultyMultiplier; // Sumar peso de dificultad
              habitStats[habit.id].completedDays++;
              habitStats[habit.id].weightedScore += (10 * difficultyMultiplier); // 10 puntos base * multiplicador de dificultad
            }
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
      
      // Calcular porcentaje y scores para este día
      if (dayStats[dateStr].total > 0) {
        // Score ponderado por dificultad
        const dayWeightedCompletions = habits
          .filter(habit => shouldShowHabitForDate(habit, currentDate))
          .filter(habit => completedHabits[dateStr] && completedHabits[dateStr][habit.id])
          .reduce((sum, habit) => sum + (10 * (habit.difficultyMultiplier || 1.0)), 0); // 10 puntos base * multiplicador
        
        const dayWeightedPossible = habits
          .filter(habit => shouldShowHabitForDate(habit, currentDate))
          .reduce((sum, habit) => sum + (10 * (habit.difficultyMultiplier || 1.0)), 0); // 10 puntos base * multiplicador
        
        // Calcular porcentaje basado en puntos ponderados, no en número de hábitos
        dayStats[dateStr].percentage = dayWeightedPossible > 0 
          ? Math.round((dayWeightedCompletions / dayWeightedPossible) * 100) 
          : 0;
        
        // Score original (sin ponderar) - mantener para compatibilidad
        dayStats[dateStr].score = (dayStats[dateStr].percentage * 0.3) + (dayStats[dateStr].completed * 20);
        
        dayStats[dateStr].weightedScore = dayWeightedCompletions; // Mostrar directamente los puntos obtenidos
        dayStats[dateStr].totalPossiblePoints = dayWeightedPossible; // Agregar puntos totales posibles
      }
      
      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Ordenar eventos por color dentro de cada día
    events.sort((a, b) => {
      // Primero ordenar por fecha para mantener agrupación por día
      const dateCompare = a.start.getTime() - b.start.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // Luego ordenar por color dentro del mismo día
      const colorA = a.resource.habit.color || 'primary';
      const colorB = b.resource.habit.color || 'primary';
      const orderA = colorOrder[colorA] !== undefined ? colorOrder[colorA] : 999;
      const orderB = colorOrder[colorB] !== undefined ? colorOrder[colorB] : 999;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Si tienen el mismo color, ordenar alfabéticamente por nombre
      return a.resource.habit.name.localeCompare(b.resource.habit.name);
    });
    
    // Calcular porcentajes y scores para hábitos
    Object.keys(habitStats).forEach(habitId => {
      const habit = habitStats[habitId];
      habit.percentage = habit.possibleDays > 0 
        ? Math.round((habit.completedDays / habit.possibleDays) * 100) 
        : 0;
    });
    
    setHabitEvents(events);
    
    // Calcular estadísticas para el día actual con ponderación
    const today = formatDate(new Date());
    const todayHabits = habits.filter(habit => shouldShowHabitForDate(habit, new Date()));
    const completedTodayHabits = todayHabits.filter(habit => 
      completedHabits[today] && completedHabits[today][habit.id]
    );
    const completedToday = completedTodayHabits.length;
    
    // Calcular ponderación para hoy
    const todayWeightedPossible = todayHabits.reduce((sum, habit) => sum + (10 * (habit.difficultyMultiplier || 1.0)), 0); // 10 puntos base * multiplicador
    const todayWeightedCompleted = completedTodayHabits.reduce((sum, habit) => sum + (10 * (habit.difficultyMultiplier || 1.0)), 0); // 10 puntos base * multiplicador
    const todayWeightedCompletion = todayWeightedPossible > 0 
      ? Math.round((todayWeightedCompleted / todayWeightedPossible) * 100) 
      : 0;
    
    // Encontrar el hábito más consistente basado en score ponderado
    let mostConsistentHabit = { weightedScore: 0, percentage: 0, completedDays: 0 };
    let leastConsistentHabit = { percentage: 100, weightedScore: Infinity };
    
    Object.values(habitStats).forEach(habit => {
      // El hábito más consistente ahora se basa en el score ponderado
      if (habit.possibleDays > 0 && habit.weightedScore > mostConsistentHabit.weightedScore) {
        mostConsistentHabit = habit;
      }
      if (habit.percentage < leastConsistentHabit.percentage && habit.possibleDays > 0) {
        leastConsistentHabit = habit;
      }
    });
    
    // Encontrar el mejor y peor día usando score ponderado
    let bestDay = { weightedScore: 0 };
    let worstDay = { percentage: 100, weightedScore: Infinity };
    
    Object.values(dayStats).forEach(day => {
      if (day.weightedScore > bestDay.weightedScore && day.total > 0) {
        bestDay = day;
      }
      if (day.percentage < worstDay.percentage && day.total > 0) {
        worstDay = {
          ...day,
          percentage: day.percentage
        };
      }
    });
    
    // Calcular porcentaje de compleción ponderado por dificultad con puntos base
    const weightedCompletion = weightedPossible > 0 
      ? Math.round((weightedCompletions / weightedPossible) * 100) 
      : 0;
    
    // Calcular puntos semanales (multiplicar por 10 para obtener puntos reales)
    const weeklyCompletedPoints = Math.round(weightedCompletions * 10);
    const weeklyTotalPoints = Math.round(weightedPossible * 10);
    
    setStats({
      totalHabits: habits.length,
      todayHabits: todayHabits.length,
      completedToday,
      completion: todayHabits.length > 0 
        ? Math.round((completedToday / todayHabits.length) * 100) 
        : 0,
      weightedTodayCompletion: todayWeightedCompletion, // Nueva métrica ponderada para hoy
      weeklyCompletion: totalPossible > 0 
        ? Math.round((totalCompletions / totalPossible) * 100) 
        : 0,
      weightedWeeklyCompletion: weightedCompletion, // Porcentaje ponderado semanal
      weeklyCompletedPoints, // Puntos completados esta semana
      weeklyTotalPoints, // Puntos totales posibles esta semana
      mostConsistentHabit,
      leastConsistentHabit,
      bestDay,
      worstDay,
      habitStats: Object.values(habitStats).sort((a, b) => b.weightedScore - a.weightedScore), // Ordenar por score ponderado
      dayStats: dayStats
    });
  };
  
  
  
  // Marcar/desmarcar un hábito como completado
  const toggleHabitCompletion = async (habitId, dateStr) => {
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
      await toggleHabitCompletionService(habitId, dateStr, newCompletedStatus);

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
  





  // Panel Superior (Navegación y Estadísticas)
  // Componente de Tarjetas de Estadísticas

  // Componente del Calendario

  // Componente para el gráfico de evolución semanal

  return (
    <Layout title="Seguimiento de Hábitos">
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
        <WeekNavigator currentWeek={currentWeek} onNavigate={handleNavigate} />
        
        {/* Tarjetas de Estadísticas */}
        <HabitsStatCards
          loading={loading}
          stats={stats}
          habits={habits}
          allWeeksCompletedHabits={allWeeksCompletedHabits}
        />

        {/* Panel del Calendario */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          mb: { xs: 4, sm: 2 }
        }}>
          <HabitsCalendarPanel
            habitEvents={habitEvents}
            currentWeek={currentWeek}
            loading={loading}
            dayStats={stats.dayStats}
            onToggle={toggleHabitCompletion}
          />
        </Box>

        {/* Gráfico de Evolución de Hábitos */}
        <WeeklyEvolutionChart
          userData={userData}
          habits={habits}
          allWeeksCompletedHabits={allWeeksCompletedHabits}
        />
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
