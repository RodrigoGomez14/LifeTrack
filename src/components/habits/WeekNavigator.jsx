import React from 'react';
import {
  Card,
  Box,
  Stack,
  Tooltip,
  IconButton,
  Typography,
  Chip,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { getWeekRange, formatWeekRangeDisplay } from './habitsHelpers';

const WeekNavigator = ({ currentWeek, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // ¿La semana visible es la actual o futura? (para deshabilitar "siguiente")
  const isCurrentOrFutureWeek = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { start: currentWeekStart } = getWeekRange(currentWeek);
    const nowWeekStart = getWeekRange(today).start;
    return currentWeekStart >= nowWeekStart;
  })();

  // Cuántas semanas en el pasado estamos (para el chip "X semanas atrás")
  const weeksInPast = (() => {
    if (isCurrentOrFutureWeek) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { start: currentWeekStart } = getWeekRange(currentWeek);
    const nowWeekStart = getWeekRange(today).start;
    const diffTime = Math.abs(nowWeekStart - currentWeekStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 7);
  })();

  const isCurrentWeek = weeksInPast === 0;
  const nextDisabled = isCurrentOrFutureWeek;

  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        mb: 3,
        mt: 2,
        borderRadius: { xs: 2, sm: 3 },
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[6] },
        },
        bgcolor: '#1a1a1a'
      }}
    >
      <Box sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: 'rgba(0,0,0,0.8)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Tooltip title="Semana anterior">
            <IconButton
              onClick={() => onNavigate('PREV')}
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

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="common.white" align="center">
              {formatWeekRangeDisplay(currentWeek)}
            </Typography>

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
                onClick={() => onNavigate('NEXT')}
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

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {!isCurrentWeek && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onNavigate('TODAY')}
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
          )}

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/HabitosList')}
            startIcon={<ListAltIcon />}
            sx={{
              borderRadius: 2,
              py: 0.5,
              px: 2,
              boxShadow: 2,
              bgcolor: alpha(theme.palette.info.main, 0.9),
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.info.main,
              }
            }}
          >
            {isMobile ? 'Lista' : 'Lista de Hábitos'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default WeekNavigator;
