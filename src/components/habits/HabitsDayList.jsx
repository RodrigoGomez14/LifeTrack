import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Collapse,
  alpha,
  Stack,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatDate } from './habitsHelpers';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const getDifficultyColor = (difficulty) => {
  const colors = { 1: '#4caf50', 2: '#8bc34a', 3: '#ff9800', 4: '#f44336', 5: '#9c27b0' };
  return colors[difficulty] || colors[1];
};

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const HabitsDayList = ({ habitEvents, currentWeek, loading, dayStats, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState({});

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  const toggleDay = (dateStr) => {
    setExpandedDays((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  // Agrupar eventos por fecha
  const eventsByDate = {};
  if (habitEvents && habitEvents.length > 0) {
    habitEvents.forEach((event) => {
      const dateStr = formatDate(new Date(event.start));
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
      eventsByDate[dateStr].push(event);
    });
  }

  // Generar los 7 días de la semana
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentWeek);
    const dayOfWeek = currentWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    dayDate.setDate(currentWeek.getDate() + diff + i);
    dayDate.setHours(0, 0, 0, 0);
    const dateStr = formatDate(dayDate);
    const isToday = dateStr === todayStr;
    const stats = dayStats?.[dateStr] || { total: 0, completed: 0, percentage: 0 };
    const events = eventsByDate[dateStr] || [];

    weekDays.push({
      dateStr,
      dayDate,
      dayName: DAY_NAMES[dayDate.getDay()],
      dayNumber: dayDate.getDate(),
      monthName: MONTH_NAMES[dayDate.getMonth()],
      isToday,
      stats,
      events,
    });
  }

  return (
    <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {weekDays.map((day) => {
        const isExpanded = !!expandedDays[day.dateStr];
        const hasHabits = day.stats.total > 0;
        const progressColor =
          day.stats.percentage >= 80
            ? theme.palette.success.main
            : day.stats.percentage >= 50
            ? theme.palette.info.main
            : day.stats.percentage > 0
            ? theme.palette.warning.main
            : alpha(theme.palette.text.disabled, 0.4);

        return (
          <AnimatedItem key={day.dateStr}>
          <Card
            key={day.dateStr}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${day.isToday ? theme.palette.primary.main : theme.palette.divider}`,
              borderWidth: day.isToday ? 1.5 : 1,
              overflow: 'hidden',
              bgcolor: day.isToday ? alpha(theme.palette.primary.main, 0.03) : 'background.paper',
            }}
          >
            {/* Header del día */}
            <Box
              onClick={() => hasHabits && toggleDay(day.dateStr)}
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: hasHabits ? 'pointer' : 'default',
                '&:hover': hasHabits ? { bgcolor: alpha(theme.palette.action.hover, 0.3) } : {},
              }}
            >
              <Box sx={{ minWidth: 48, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    color: day.isToday ? 'primary.main' : 'text.secondary',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                  }}
                >
                  {day.dayName.substring(0, 3)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: day.isToday ? 'primary.main' : 'text.primary',
                    fontSize: '1.05rem',
                    lineHeight: 1.2,
                  }}
                >
                  {day.dayNumber}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {day.dayName}
                  </Typography>
                  {day.isToday && (
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
                    value={day.stats.percentage}
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(progressColor, 0.12),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: progressColor,
                        borderRadius: 2,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                    Sin hábitos para este día
                  </Typography>
                )}
              </Box>

              {hasHabits && (
                <>
                  <Chip
                    label={`${day.stats.completed}/${day.stats.total}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: alpha(progressColor, 0.12),
                      color: progressColor,
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      p: 0.25,
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      color: 'text.secondary',
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Lista de hábitos expandible */}
            <Collapse in={isExpanded} timeout={200} unmountOnExit>
              <Box
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.action.hover, 0.15),
                }}
              >
                {day.events.map((event) => {
                  const habit = event.resource.habit;
                  const isCompleted = event.resource.isCompleted;
                  const habitColor = theme.palette[habit.color]?.main || theme.palette.primary.main;
                  const diffColor = getDifficultyColor(habit.difficulty || 1);
                  const multiplier = habit.difficultyMultiplier || 1.0;
                  const points = Math.round(10 * multiplier);

                  return (
                    <Box
                      key={event.id}
                      sx={{
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '&:not(:last-child)': {
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        },
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.3) },
                      }}
                    >
                      {/* Checkbox */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggle(habit.id, day.dateStr);
                        }}
                        sx={{ p: 0.25, color: isCompleted ? 'success.main' : alpha(theme.palette.text.disabled, 0.5) }}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon fontSize="small" />
                        )}
                      </IconButton>

                      {/* Info del hábito */}
                      <Box
                        sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => navigate(`/DetalleHabito/${habit.id}`)}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isCompleted ? 'text.disabled' : 'text.primary',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                          noWrap
                        >
                          {habit.name}
                        </Typography>
                      </Box>

                      {/* Puntos */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        +{points}
                      </Typography>

                      {/* Dificultad */}
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

                      {/* Color indicator */}
                      <Box
                        sx={{
                          width: 3,
                          height: 24,
                          borderRadius: 1.5,
                          bgcolor: habitColor,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Card>
          </AnimatedItem>
        );
      })}
    </AnimatedGroup>
  );
};

export default HabitsDayList;
