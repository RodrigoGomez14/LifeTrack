import React from 'react';
import {
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  Checkbox,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Global } from '@emotion/react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/es';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { formatDate, isToday, formatWeekRangeDisplay } from './habitsHelpers';

moment.locale('es');
const localizer = momentLocalizer(moment);

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

// Estilos globales del calendario (no dependen de props ni theme).
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
        '&::-webkit-scrollbar': { width: '4px !important' },
        '&::-webkit-scrollbar-track': { background: 'transparent !important' },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.1) !important',
          borderRadius: '4px !important'
        }
      },
      '.habits-calendar .rbc-month-view': { flex: '1 0 0' },
      '.habits-calendar .rbc-month-header': { fontWeight: 'bold !important' },
      '.habits-calendar .rbc-month-row': { overflow: 'visible !important' },
      '.habits-calendar .rbc-off-range': { opacity: '0.6 !important' },
      '.habits-calendar .rbc-day-slot': { background: 'white !important' },
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
      '.habits-calendar .rbc-row-content': { marginTop: '12px !important' },
      '.habits-calendar .rbc-header > span': { display: 'none !important' },
      '.habits-calendar .rbc-row.rbc-month-header': { marginBottom: '10px !important' },
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

const HabitsCalendarPanel = ({
  habitEvents,
  currentWeek,
  loading,
  dayStats,
  onToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sub-componente: cada hábito en una celda del calendario (closure sobre theme + onToggle)
  const HabitEvent = ({ event }) => {
    const { habit, date, isCompleted } = event.resource;
    const habitColor = habit.color ? theme.palette[habit.color].main : theme.palette.primary.main;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 0.5,
          borderRadius: 1.5,
          bgcolor: isCompleted ? alpha(habitColor, 0.15) : alpha(habitColor, 0.2),
          borderLeft: `3px solid ${habitColor}`,
          mb: 0.5,
          boxShadow: isCompleted ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': {
            bgcolor: isCompleted ? alpha(habitColor, 0.25) : alpha(habitColor, 0.35),
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: habitColor, mr: 1 }} />
          <Typography variant="body2" noWrap sx={{
            fontWeight: isCompleted ? 'normal' : 'medium',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? alpha(theme.palette.text.primary, 0.7) : theme.palette.text.primary,
            fontSize: '0.8rem',
            flex: 1
          }}>
            {habit.name}
          </Typography>

          {habit.difficulty && habit.difficulty > 1 && (
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: getDifficultyColor(habit.difficulty),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 0.5,
                border: '1px solid white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
                {habit.difficulty}
              </Typography>
            </Box>
          )}
        </Box>
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle(habit.id, date)}
          icon={<RadioButtonUncheckedIcon fontSize="small" />}
          checkedIcon={<CheckCircleIcon fontSize="small" />}
          size="small"
          sx={{
            p: 0.25,
            color: habitColor,
            '& svg': { fontSize: '1rem' },
            '&.Mui-checked': { color: habitColor }
          }}
        />
      </Box>
    );
  };

  // Sub-componente: chip + barra de progreso por día (lee `dayStats` recibido por prop)
  const DayStatsWrapper = ({ children, value }) => {
    const dateStr = formatDate(value);
    const dayStat = dayStats?.[dateStr] || { total: 0, completed: 0 };
    const cellIsToday = isToday(value);

    const completionPercent = dayStat.total > 0 ? (dayStat.completed / dayStat.total) * 100 : 0;
    const showStats = dayStat.total > 0;

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
              bgcolor: cellIsToday ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.grey[600], 0.15),
              border: `1px solid ${cellIsToday ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.grey[500], 0.2)}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 5
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color: cellIsToday ? 'primary.main' : 'text.primary',
                lineHeight: 1,
                fontSize: '0.8rem'
              }}
            >
              {dayStat.completed}/{dayStat.total}
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

  // Sub-componente: header de cada día del calendario
  const CustomHeader = ({ date }) => {
    const isCurrentDay = isToday(date);
    const dayOfWeek = date.getDay();
    const dayDate = date.getDate();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1.5, width: '100%' }}>
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

  // Estilos del calendario (cierra sobre theme)
  const calendarStyles = {
    position: 'relative',
    '.rbc-toolbar': { display: 'none' },
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
    '.rbc-time-header': { display: 'none' },
    '.rbc-time-content': { display: 'none' },
    '.rbc-month-view, .rbc-agenda-view, .rbc-week-view': {
      border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      backgroundColor: alpha(theme.palette.background.paper, 0.95),
    },
    '.rbc-month-row, .rbc-time-row': { minHeight: 'auto' },
    '.rbc-day-bg': {
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      margin: '0 2px',
      borderRadius: '0 0 8px 8px',
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
    '.rbc-row-content': { margin: '4px 0' },
    '.rbc-event': {
      backgroundColor: 'transparent',
      padding: 0,
      border: 'none'
    },
    '.rbc-event-content': { width: '100%' },
    '.rbc-row-segment': { padding: '2px 6px' },
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
    '.rbc-time-view .rbc-day-slot': { margin: '0 2px' },
    '.rbc-time-header-content .rbc-header': { margin: '0 2px' },
    '.rbc-row': { marginBottom: '2px' }
  };

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
    <>
      <GlobalStyles />
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
    </>
  );
};

export default HabitsCalendarPanel;
