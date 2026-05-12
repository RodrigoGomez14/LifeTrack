import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  Avatar,
  Typography,
  LinearProgress,
  Chip,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import ReactApexChart from 'react-apexcharts';
import { formatDate, shouldShowHabitForDate } from './habitsHelpers';

// Color y etiqueta del progreso semanal según el porcentaje.
const getColoredPercentage = (percentage, theme) => {
  if (percentage >= 80) return { color: theme.palette.success.main, text: 'Excelente' };
  if (percentage >= 60) return { color: theme.palette.info.main, text: 'Muy bien' };
  if (percentage >= 40) return { color: theme.palette.warning.main, text: 'Regular' };
  return { color: theme.palette.error.main, text: 'Necesita mejorar' };
};

// Color asociado a cada nivel de dificultad (1-5).
const getDifficultyColor = (difficulty) => {
  const colors = {
    1: '#4caf50',
    2: '#8bc34a',
    3: '#ff9800',
    4: '#f44336',
    5: '#9c27b0',
  };
  return colors[difficulty] || colors[1];
};

const getDifficultyLabel = (difficulty) => {
  const labels = {
    1: 'Muy Fácil',
    2: 'Fácil',
    3: 'Moderado',
    4: 'Difícil',
    5: 'Muy Difícil',
  };
  return labels[difficulty] || 'Fácil';
};

const HabitsStatCards = ({ loading, stats, habits, allWeeksCompletedHabits }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  return (
    <Grid container spacing={3}>
      {/* Tarjeta 1: Resumen de la semana con estadísticas ponderadas */}
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
                  Ponderado por dificultad
                </Typography>
              </Box>
            </Stack>
          </Box>
          <CardContent sx={{ p: 3, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
              <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {stats.weightedWeeklyCompletion || 0}%
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {stats.weeklyCompletedPoints || 0} de {stats.weeklyTotalPoints || 0} puntos
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'medium',
                  color: getColoredPercentage(stats.weightedWeeklyCompletion || 0, theme).color,
                  mt: 0.5
                }}
              >
                {getColoredPercentage(stats.weightedWeeklyCompletion || 0, theme).text}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={stats.weightedWeeklyCompletion || 0}
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
                    stroke: { curve: 'smooth', width: 3 },
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
                      style: { fontSize: '12px', fontFamily: theme.typography.fontFamily },
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
                        const weekLabels = [];
                        const currentDate = new Date();
                        const startWeekOffset = 5;
                        const endWeekOffset = 1;
                        for (let i = startWeekOffset; i >= endWeekOffset; i--) {
                          const weekStart = new Date(currentDate);
                          weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
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
                      const weeklyData = [];
                      const currentDate = new Date();
                      const startWeekOffset = 5;
                      const endWeekOffset = 1;
                      for (let i = startWeekOffset; i >= endWeekOffset; i--) {
                        const weekStart = new Date(currentDate);
                        weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);

                        let totalWeightedPossible = 0;
                        let totalWeightedCompleted = 0;
                        const dayIterator = new Date(weekStart);
                        while (dayIterator <= weekEnd) {
                          const dateStr = formatDate(dayIterator);
                          habits.forEach((habit) => {
                            if (!shouldShowHabitForDate(habit, dayIterator)) return;
                            const multiplier = habit.difficultyMultiplier || 1.0;
                            totalWeightedPossible += 10 * multiplier;
                            if (allWeeksCompletedHabits[dateStr]?.[habit.id]) {
                              totalWeightedCompleted += 10 * multiplier;
                            }
                          });
                          dayIterator.setDate(dayIterator.getDate() + 1);
                        }

                        const weeklyPercentage = totalWeightedPossible > 0
                          ? Math.round((totalWeightedCompleted / totalWeightedPossible) * 100)
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
          </CardContent>
        </Card>
      </Grid>

      {/* Tarjeta 2: Hábito más consistente con indicador de dificultad */}
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
                      mr: 2,
                      position: 'relative'
                    }}
                  >
                    {stats.mostConsistentHabit.name?.substring(0, 1) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {stats.mostConsistentHabit.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(stats.mostConsistentHabit.weightedScore || 0)} de {Math.round((stats.mostConsistentHabit.possibleDays * 10 * (stats.mostConsistentHabit.difficultyMultiplier || 1.0)) || 0)} puntos
                      </Typography>
                      <Chip
                        label={getDifficultyLabel(stats.mostConsistentHabit.difficulty)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(stats.mostConsistentHabit.difficulty), 0.1),
                          color: getDifficultyColor(stats.mostConsistentHabit.difficulty),
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    </Stack>
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

                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', color: theme.palette.success.main, mb: 1 }}>
                  {stats.mostConsistentHabit.percentage}%
                </Typography>

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.success.main }}>
                      Efectividad alta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.success.dark }}>
                      {Math.round(stats.mostConsistentHabit.weightedScore || 0)} pts
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

      {/* Tarjeta 3: Mejor día de la semana con score ponderado */}
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
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                    {stats.bestDay.day}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(stats.bestDay.weightedScore || stats.bestDay.score || 0)} de {Math.round(stats.bestDay.totalPossiblePoints || 0)} puntos
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

                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', color: theme.palette.info.main, mb: 1 }}>
                  {stats.bestDay.percentage}%
                </Typography>

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.info.main }}>
                      {stats.bestDay.percentage}% completado
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.info.dark }}>
                      {Math.round(stats.bestDay.weightedScore || stats.bestDay.score || 0)} pts
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
                      mr: 2,
                      position: 'relative'
                    }}
                  >
                    {stats.leastConsistentHabit.name?.substring(0, 1) || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {stats.leastConsistentHabit.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(stats.leastConsistentHabit.weightedScore || 0)} de {Math.round((stats.leastConsistentHabit.possibleDays * 10 * (stats.leastConsistentHabit.difficultyMultiplier || 1.0)) || 0)} puntos
                      </Typography>
                      <Chip
                        label={getDifficultyLabel(stats.leastConsistentHabit.difficulty)}
                        size="small"
                        sx={{
                          bgcolor: alpha(getDifficultyColor(stats.leastConsistentHabit.difficulty), 0.1),
                          color: getDifficultyColor(stats.leastConsistentHabit.difficulty),
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                    </Stack>
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

                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', color: theme.palette.warning.main, mb: 1 }}>
                  {stats.leastConsistentHabit.percentage}%
                </Typography>

                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.warning.main }}>
                      Prioridad alta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.warning.dark }}>
                      {Math.round(stats.leastConsistentHabit.weightedScore || 0)} pts
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

export default HabitsStatCards;
