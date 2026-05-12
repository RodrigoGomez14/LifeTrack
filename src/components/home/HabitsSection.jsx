import React from 'react';
import {
  Grid,
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import StarIcon from '@mui/icons-material/Star';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { toggleHabitCompletion as toggleHabitService } from '../../services/habits';

// Helper: clave canónica de fecha (YYYY-MM-DD), igual que la usa el módulo de hábitos.
const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Determina si un hábito aplica para una fecha según su frecuencia y la fecha de creación.
const shouldShowHabitForDate = (habit, date) => {
  if (habit.createdAt) {
    const createdDate = new Date(habit.createdAt);
    createdDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < createdDate) return false;
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
    case 'yearly': {
      const isCorrectMonth = Array.isArray(habit.yearlyMonths) && habit.yearlyMonths.includes(month);
      const isCorrectDay = Array.isArray(habit.yearlyDays) && habit.yearlyDays.includes(dayOfMonth);
      return isCorrectMonth && isCorrectDay;
    }
    default:
      return true;
  }
};

// Devuelve el inicio de la semana ISO (lunes 00:00) para una fecha dada.
const getMondayOfWeek = (date) => {
  const today = new Date(date);
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(today);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// Estadísticas agregadas de la semana actual (lunes → hoy).
const calculateWeeklyHabitsStats = (userData, habits, today) => {
  if (!userData?.habits?.completed) {
    return { completion: 0, weightedCompletion: 0, weeklyCompletedPoints: 0, weeklyTotalPoints: 0 };
  }

  const weekStart = getMondayOfWeek(today);

  let totalPossible = 0;
  let totalCompleted = 0;
  let weightedPossible = 0;
  let weightedCompleted = 0;

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    if (day > today) break;
    const dayStr = formatDateKey(day);

    habits.forEach((habit) => {
      if (!shouldShowHabitForDate(habit, day)) return;
      const multiplier = habit.difficultyMultiplier || 1.0;
      totalPossible++;
      weightedPossible += 10 * multiplier;
      if (userData.habits.completed[dayStr]?.[habit.id]) {
        totalCompleted++;
        weightedCompleted += 10 * multiplier;
      }
    });
  }

  return {
    completion: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
    weightedCompletion: weightedPossible > 0 ? Math.round((weightedCompleted / weightedPossible) * 100) : 0,
    weeklyCompletedPoints: Math.round(weightedCompleted),
    weeklyTotalPoints: Math.round(weightedPossible),
  };
};

// Hábito más consistente de la semana, ponderado por dificultad.
const findBestHabit = (userData, habits, today) => {
  if (!userData?.habits?.completed || habits.length === 0) return null;

  const weekStart = getMondayOfWeek(today);
  let bestHabit = null;
  let bestScore = -1;

  habits.forEach((habit) => {
    let possibleDays = 0;
    let completedDays = 0;
    let weightedScore = 0;
    let weightedPossible = 0;
    const multiplier = habit.difficultyMultiplier || 1.0;

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      if (day > today) break;

      if (shouldShowHabitForDate(habit, day)) {
        possibleDays++;
        weightedPossible += 10 * multiplier;
        const dayStr = formatDateKey(day);
        if (userData.habits.completed[dayStr]?.[habit.id]) {
          completedDays++;
          weightedScore += 10 * multiplier;
        }
      }
    }

    if (possibleDays > 0 && weightedScore > bestScore) {
      const percentage = (completedDays / possibleDays) * 100;
      const weightedPercentage = weightedPossible > 0 ? (weightedScore / weightedPossible) * 100 : 0;
      bestScore = weightedScore;
      bestHabit = {
        ...habit,
        completedDays,
        possibleDays,
        percentage: Math.round(percentage),
        weightedScore: Math.round(weightedScore),
        weightedPercentage: Math.round(weightedPercentage),
        totalPossiblePoints: Math.round(weightedPossible),
      };
    }
  });

  return bestHabit;
};

// Calcula todas las stats que consumen las 4 sub-cards.
const computeHabitsStats = (userData) => {
  if (!userData?.habits) {
    return {
      totalHabits: 0,
      completedToday: 0,
      weightedTodayCompletion: 0,
      weightedWeeklyCompletion: 0,
      weeklyCompletedPoints: 0,
      weeklyTotalPoints: 0,
      bestHabit: null,
      todayHabits: [],
    };
  }

  const today = new Date();
  const todayStr = formatDateKey(today);

  const habits = Object.keys(userData.habits)
    .filter((key) => key !== 'completed')
    .map((id) => ({ id, ...userData.habits[id] }));

  const todayHabits = habits.filter((habit) => shouldShowHabitForDate(habit, today));
  const completedTodayHabits = todayHabits.filter((habit) =>
    userData.habits.completed?.[todayStr]?.[habit.id]
  );
  const completedToday = completedTodayHabits.length;

  const todayWeightedPossible = todayHabits.reduce(
    (sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0), 0
  );
  const todayWeightedCompleted = completedTodayHabits.reduce(
    (sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0), 0
  );
  const weightedTodayCompletion = todayWeightedPossible > 0
    ? Math.round((todayWeightedCompleted / todayWeightedPossible) * 100)
    : 0;

  const weekStats = calculateWeeklyHabitsStats(userData, habits, today);
  const bestHabit = findBestHabit(userData, habits, today);

  return {
    totalHabits: habits.length,
    completedToday,
    weightedTodayCompletion,
    weightedWeeklyCompletion: weekStats.weightedCompletion,
    weeklyCompletedPoints: weekStats.weeklyCompletedPoints,
    weeklyTotalPoints: weekStats.weeklyTotalPoints,
    bestHabit,
    todayHabits,
  };
};

const HabitsSection = ({ userData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const habitsStats = computeHabitsStats(userData);
  const todayStr = formatDateKey(new Date());

  const handleToggle = async (habitId) => {
    if (!userData?.habits) return;
    try {
      const isCurrentlyCompleted = userData.habits.completed?.[todayStr]?.[habitId];
      await toggleHabitService(habitId, todayStr, !isCurrentlyCompleted);
    } catch (error) {
      console.error('Error updating habit completion:', error);
    }
  };

  // Color del progreso de hoy según el porcentaje
  const todayColor =
    habitsStats.weightedTodayCompletion >= 80 ? theme.palette.success.main :
    habitsStats.weightedTodayCompletion >= 50 ? theme.palette.warning.main :
    theme.palette.error.main;

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2 }}
      sx={{
        mb: { xs: 2, sm: 3 },
        mt: { xs: 2, sm: 3 },
        justifyContent: 'center'
      }}
    >
      {/* Resumen de Hábitos de Hoy */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s ease',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
            },
          }}
          onClick={() => navigate('/habitos')}
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
                  Hábitos de Hoy
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Progreso diario
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Completados hoy
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                color: todayColor,
                letterSpacing: '-0.5px'
              }}>
                {habitsStats.completedToday}/{habitsStats.todayHabits.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                {habitsStats.weightedTodayCompletion}% completado
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={habitsStats.weightedTodayCompletion}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '& .MuiLinearProgress-bar': { bgcolor: todayColor },
                mb: 2
              }}
            />

            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {habitsStats.totalHabits} hábitos activos
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Progreso Semanal */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s ease',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
            },
          }}
          onClick={() => navigate('/habitos')}
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
                <CalendarViewWeekIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Progreso Semanal
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Esta semana
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Completitud semanal
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                color: theme.palette.info.main,
                letterSpacing: '-0.5px'
              }}>
                {habitsStats.weightedWeeklyCompletion}%
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                {habitsStats.weeklyCompletedPoints} de {habitsStats.weeklyTotalPoints} puntos
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={habitsStats.weightedWeeklyCompletion}
              color="info"
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                mb: 2
              }}
            />

            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Lunes a {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()]}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Mejor Hábito */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            position: 'relative',
            transition: 'all 0.3s ease',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-5px)' },
              boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
            },
          }}
          onClick={() => navigate('/habitos')}
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
                <StarIcon />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Mejor Hábito
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Más consistente
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {habitsStats.bestHabit ? (
              <>
                <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {habitsStats.bestHabit.name}
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                    color: theme.palette.primary.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {habitsStats.bestHabit.weightedPercentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {habitsStats.bestHabit.weightedScore} de {habitsStats.bestHabit.totalPossiblePoints} puntos
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={habitsStats.bestHabit.weightedPercentage}
                  color="primary"
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2
                  }}
                />
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Sin datos suficientes
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Esta semana
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Lista interactiva: Hábitos de Hoy */}
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
              background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
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
                  <PlaylistAddCheckIcon />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                    Lista de Hoy
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    Marca tus hábitos
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box sx={{
            p: { xs: 1, sm: 2 },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {habitsStats.todayHabits.length > 0 ? (
              <List dense sx={{ py: 0 }}>
                {habitsStats.todayHabits.map((habit) => {
                  const isCompleted = userData?.habits?.completed?.[todayStr]?.[habit.id];
                  return (
                    <ListItem
                      key={habit.id}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: isCompleted ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                        '&:hover': {
                          bgcolor: isCompleted ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.grey[500], 0.1)
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          checked={!!isCompleted}
                          onChange={() => handleToggle(habit.id)}
                          icon={<CheckCircleIcon sx={{ color: theme.palette.grey[400] }} />}
                          checkedIcon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={habit.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? theme.palette.text.secondary : theme.palette.text.primary,
                            fontWeight: isCompleted ? 'normal' : 'medium'
                          }
                        }}
                      />
                      {habit.color && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette[habit.color]?.main || theme.palette.primary.main,
                            ml: 1
                          }}
                        />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                textAlign: 'center'
              }}>
                <PlaylistAddCheckIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay hábitos para hoy
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  ¡Disfruta tu día libre!
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default HabitsSection;
