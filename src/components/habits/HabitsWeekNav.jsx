import React from 'react';
import { Box, Typography, IconButton, Chip, Button, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TodayIcon from '@mui/icons-material/Today';
import { formatWeekRangeDisplay, getWeekRange } from './habitsHelpers';

const HabitsWeekNav = ({ currentWeek, onNavigate }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { start: nowWeekStart } = getWeekRange(today);
  const { start: currentWeekStart } = getWeekRange(currentWeek);
  const isCurrentWeek = currentWeekStart.getTime() === nowWeekStart.getTime();

  const weeksInPast = Math.round((nowWeekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const weekLabel = formatWeekRangeDisplay(currentWeek);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <IconButton
        onClick={() => onNavigate('PREV')}
        size="small"
        sx={{
          color: 'text.secondary',
          bgcolor: alpha(theme.palette.action.hover, 0.5),
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) },
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            letterSpacing: -0.3,
            color: 'text.primary',
          }}
        >
          {weekLabel}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 0.5 }}>
          {isCurrentWeek ? (
            <Chip
              label="Semana actual"
              size="small"
              icon={<TodayIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                letterSpacing: 0.3,
                '& .MuiChip-icon': { color: theme.palette.primary.main, marginLeft: '4px' },
              }}
            />
          ) : weeksInPast === 1 ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              1 semana atrás
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {weeksInPast} semanas atrás
            </Typography>
          )}
        </Box>
      </Box>

      <IconButton
        onClick={() => onNavigate('NEXT')}
        size="small"
        disabled={isCurrentWeek}
        sx={{
          color: 'text.secondary',
          bgcolor: alpha(theme.palette.action.hover, 0.5),
          '&:hover': { bgcolor: isCurrentWeek ? undefined : alpha(theme.palette.action.hover, 0.8) },
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>

      {!isCurrentWeek && (
        <Button
          size="small"
          onClick={() => onNavigate('TODAY')}
          startIcon={<TodayIcon fontSize="small" />}
          sx={{
            ml: 0.5,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 999,
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            px: 1.5,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
          }}
        >
          Hoy
        </Button>
      )}

      <Button
        size="small"
        onClick={() => navigate('/HabitosList')}
        startIcon={<FormatListBulletedIcon fontSize="small" />}
        sx={{
          ml: 0.5,
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 999,
          color: 'text.secondary',
          bgcolor: alpha(theme.palette.action.hover, 0.35),
          px: 1.5,
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.6) },
        }}
      >
        Lista
      </Button>
    </Box>
  );
};

export default HabitsWeekNav;
