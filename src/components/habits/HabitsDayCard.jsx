import React from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Skeleton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getDifficultyColor } from './habitsHelpers';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Devuelve un color de progreso consistente con el resto del módulo.
const progressColorFor = (percentage, theme) => {
  if (percentage >= 80) return theme.palette.success.main;
  if (percentage >= 50) return theme.palette.info.main;
  if (percentage > 0) return theme.palette.warning.main;
  return alpha(theme.palette.text.disabled, 0.4);
};

const HabitsDayCard = ({ date, events = [], stats = { total: 0, completed: 0, percentage: 0 }, loading, onToggle, onOpenHabit }) => {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const hasHabits = stats.total > 0;
  const pColor = progressColorFor(stats.percentage, theme);
  const isFuture = date.getTime() > today.getTime();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
        borderWidth: isToday ? 1.5 : 1,
        overflow: 'hidden',
      }}
    >
      {/* Header del día */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ minWidth: 44, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: 0.5,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              color: isToday ? 'primary.main' : 'text.secondary',
            }}
          >
            {DAY_NAMES[date.getDay()].substring(0, 3)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, color: isToday ? 'primary.main' : 'text.primary' }}
          >
            {date.getDate()}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {DAY_NAMES[date.getDay()]} {date.getDate()} de {MONTH_NAMES[date.getMonth()]}
            </Typography>
            {isToday && (
              <Chip
                label="Hoy"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            )}
          </Box>
          {hasHabits ? (
            <LinearProgress
              variant="determinate"
              value={stats.percentage}
              sx={{
                mt: 0.75,
                height: 5,
                borderRadius: 2,
                bgcolor: alpha(pColor, 0.12),
                '& .MuiLinearProgress-bar': { bgcolor: pColor, borderRadius: 2 },
              }}
            />
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
              Sin hábitos para este día
            </Typography>
          )}
        </Box>

        {hasHabits && (
          <Chip
            label={`${stats.completed}/${stats.total}`}
            size="small"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(pColor, 0.12), color: pColor }}
          />
        )}
      </Box>

      {/* Hábitos del día */}
      {hasHabits && (
        <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
          <AnimatedGroup>
            {events.map((event) => {
              const habit = event.resource.habit;
              const isCompleted = event.resource.isCompleted;
              const habitColor = theme.palette[habit.color]?.main || theme.palette.primary.main;
              const diffColor = getDifficultyColor(habit.difficulty || 1);
              const points = Math.round(10 * (habit.difficultyMultiplier || 1.0));

              return (
                <AnimatedItem key={event.id}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:not(:last-child)': { borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}` },
                      '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.3) },
                    }}
                  >
                    <IconButton
                      size="small"
                      disabled={isFuture}
                      onClick={() => onToggle(habit.id, event.resource.date)}
                      sx={{
                        p: 0.25,
                        color: isCompleted ? 'success.main' : alpha(theme.palette.text.disabled, 0.6),
                        '&.Mui-disabled': { color: alpha(theme.palette.text.disabled, 0.3) },
                      }}
                    >
                      {isCompleted ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />}
                    </IconButton>

                    <Box
                      sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => onOpenHabit(habit.id)}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 600,
                          color: isCompleted ? 'text.disabled' : 'text.primary',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {habit.name}
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
                      +{points}
                    </Typography>

                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(diffColor, 0.15),
                        color: diffColor,
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {habit.difficulty || 1}
                    </Box>

                    <Box sx={{ width: 3, height: 24, borderRadius: 1.5, bgcolor: habitColor, flexShrink: 0 }} />
                  </Box>
                </AnimatedItem>
              );
            })}
          </AnimatedGroup>
        </Box>
      )}

      {/* Estado vacío */}
      {!hasHabits && (
        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
          <EventAvailableIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            No hay hábitos programados para este día
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default HabitsDayCard;
