import React from 'react';
import {
  Grid,
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  LinearProgress,
  Chip,
  Skeleton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import ReactApexChart from 'react-apexcharts';
import { formatDate, shouldShowHabitForDate } from './habitsHelpers';

const getColoredPercentage = (percentage, theme) => {
  if (percentage >= 80) return { color: theme.palette.success.main, text: 'Excelente' };
  if (percentage >= 60) return { color: theme.palette.info.main, text: 'Muy bien' };
  if (percentage >= 40) return { color: theme.palette.warning.main, text: 'Regular' };
  return { color: theme.palette.error.main, text: 'Necesita mejorar' };
};

const getDifficultyColor = (difficulty) => {
  const colors = { 1: '#4caf50', 2: '#8bc34a', 3: '#ff9800', 4: '#f44336', 5: '#9c27b0' };
  return colors[difficulty] || colors[1];
};

const getDifficultyLabel = (difficulty) => {
  const labels = { 1: 'Muy Fácil', 2: 'Fácil', 3: 'Moderado', 4: 'Difícil', 5: 'Muy Difícil' };
  return labels[difficulty] || 'Fácil';
};

const cardSx = (theme, accentColor) => ({
  elevation: 0,
  borderRadius: 3,
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: 'background.paper',
  overflow: 'hidden',
});

const headerSx = (accentColor) => ({
  px: 2.5,
  py: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  borderBottom: `1px solid ${alpha(accentColor, 0.15)}`,
});

const HabitsStatCards = ({ loading, stats, habits, allWeeksCompletedHabits }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} component={AnimatedGroup}>
      {/* Tarjeta 1: Progreso Semanal */}
      <Grid item xs={12} sm={6} md={3} component={AnimatedItem}>
        <Card sx={cardSx(theme, theme.palette.primary.main)}>
          <Box sx={headerSx(theme.palette.primary.main)}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                width: 36,
                height: 36,
              }}
            >
              <CalendarViewWeekIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Progreso Semanal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ponderado por dificultad
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                {stats.weightedWeeklyCompletion || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.weeklyCompletedPoints || 0} de {stats.weeklyTotalPoints || 0} puntos
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.25,
                  fontWeight: 600,
                  color: getColoredPercentage(stats.weightedWeeklyCompletion || 0, theme).color,
                }}
              >
                {getColoredPercentage(stats.weightedWeeklyCompletion || 0, theme).text}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={stats.weightedWeeklyCompletion || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mb: 1.5,
                '& .MuiLinearProgress-bar': { bgcolor: theme.palette.primary.main, borderRadius: 3 },
              }}
            />

            <Box sx={{ height: 70 }}>
              {allWeeksCompletedHabits && Object.keys(allWeeksCompletedHabits).length > 0 && (
                <ReactApexChart
                  options={{
                    chart: { type: 'line', toolbar: { show: false }, sparkline: { enabled: true } },
                    stroke: { curve: 'smooth', width: 2.5 },
                    colors: [theme.palette.primary.main],
                    tooltip: {
                      fixed: { enabled: false },
                      x: { show: false },
                      y: { formatter: (val) => `${val}%`, title: { formatter: () => 'Progreso:' } },
                      marker: { show: false },
                      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
                    },
                    xaxis: {
                      categories: (() => {
                        const labels = [];
                        const cur = new Date();
                        for (let i = 5; i >= 1; i--) {
                          const ws = new Date(cur);
                          ws.setDate(cur.getDate() - (cur.getDay() - 1 + i * 7));
                          labels.push(`${ws.getDate().toString().padStart(2, '0')}/${(ws.getMonth() + 1).toString().padStart(2, '0')}`);
                        }
                        return labels;
                      })(),
                    },
                  }}
                  series={[
                    {
                      name: 'Progreso',
                      data: (() => {
                        const data = [];
                        const cur = new Date();
                        for (let i = 5; i >= 1; i--) {
                          const ws = new Date(cur);
                          ws.setDate(cur.getDate() - (cur.getDay() - 1 + i * 7));
                          const we = new Date(ws);
                          we.setDate(ws.getDate() + 6);
                          let wp = 0,
                            wc = 0;
                          const di = new Date(ws);
                          while (di <= we) {
                            const ds = formatDate(di);
                            habits.forEach((h) => {
                              if (!shouldShowHabitForDate(h, di)) return;
                              const m = h.difficultyMultiplier || 1.0;
                              wp += 10 * m;
                              if (allWeeksCompletedHabits[ds]?.[h.id]) wc += 10 * m;
                            });
                            di.setDate(di.getDate() + 1);
                          }
                          data.push(wp > 0 ? Math.round((wc / wp) * 100) : 0);
                        }
                        return data;
                      })(),
                    },
                  ]}
                  type="line"
                  height={70}
                />
              )}
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Tarjeta 2: Mejor Rendimiento */}
      <Grid item xs={12} sm={6} md={3} component={AnimatedItem}>
        <Card sx={cardSx(theme, theme.palette.success.main)}>
          <Box sx={headerSx(theme.palette.success.main)}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                width: 36,
                height: 36,
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Mejor Rendimiento
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hábito más consistente
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            {stats.habitStats && stats.habitStats.length > 0 ? (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette[stats.mostConsistentHabit.color]?.main || theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      fontWeight: 700,
                    }}
                  >
                    {stats.mostConsistentHabit.name?.substring(0, 1) || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {stats.mostConsistentHabit.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(stats.mostConsistentHabit.weightedScore || 0)} pts
                      </Typography>
                      <Chip
                        label={getDifficultyLabel(stats.mostConsistentHabit.difficulty)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: alpha(getDifficultyColor(stats.mostConsistentHabit.difficulty), 0.1),
                          color: getDifficultyColor(stats.mostConsistentHabit.difficulty),
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={stats.mostConsistentHabit.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    mb: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: theme.palette.success.main, borderRadius: 3 },
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', color: theme.palette.success.main }}>
                  {stats.mostConsistentHabit.percentage}%
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay datos suficientes
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Tarjeta 3: Mejor Día */}
      <Grid item xs={12} sm={6} md={3} component={AnimatedItem}>
        <Card sx={cardSx(theme, theme.palette.info.main)}>
          <Box sx={headerSx(theme.palette.info.main)}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
                width: 36,
                height: 36,
              }}
            >
              <TodayIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Mejor Día
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mayor cumplimiento
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            {stats.bestDay && stats.bestDay.day ? (
              <>
                <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {stats.bestDay.day}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(stats.bestDay.weightedScore || stats.bestDay.score || 0)} de{' '}
                    {Math.round(stats.bestDay.totalPossiblePoints || 0)} pts
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={stats.bestDay.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    mb: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: theme.palette.info.main, borderRadius: 3 },
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', color: theme.palette.info.main }}>
                  {stats.bestDay.percentage}%
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay datos suficientes
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Tarjeta 4: Necesita Mejorar */}
      <Grid item xs={12} sm={6} md={3} component={AnimatedItem}>
        <Card sx={cardSx(theme, theme.palette.warning.main)}>
          <Box sx={headerSx(theme.palette.warning.main)}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                width: 36,
                height: 36,
              }}
            >
              <HistoryIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Necesita Mejorar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hábito menos consistente
              </Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            {stats.habitStats && stats.habitStats.length > 0 && stats.leastConsistentHabit && stats.leastConsistentHabit.name ? (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette[stats.leastConsistentHabit.color]?.main || theme.palette.warning.main,
                      width: 40,
                      height: 40,
                      fontWeight: 700,
                    }}
                  >
                    {stats.leastConsistentHabit.name?.substring(0, 1) || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {stats.leastConsistentHabit.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(stats.leastConsistentHabit.weightedScore || 0)} pts
                      </Typography>
                      <Chip
                        label={getDifficultyLabel(stats.leastConsistentHabit.difficulty)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: alpha(getDifficultyColor(stats.leastConsistentHabit.difficulty), 0.1),
                          color: getDifficultyColor(stats.leastConsistentHabit.difficulty),
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={stats.leastConsistentHabit.percentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    mb: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: theme.palette.warning.main, borderRadius: 3 },
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', color: theme.palette.warning.main }}>
                  {stats.leastConsistentHabit.percentage}%
                </Typography>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay datos suficientes
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default HabitsStatCards;
