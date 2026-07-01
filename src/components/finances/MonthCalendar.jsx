import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DAYS_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const MonthCalendar = ({ value, onChange, shouldDisableDate }) => {
  const theme = useTheme();

  const selected = parseDate(value);
  const initial = selected || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isSelectedDay = (day) => {
    if (!selected) return false;
    return selected.getFullYear() === viewYear
        && selected.getMonth() === viewMonth
        && selected.getDate() === day;
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (shouldDisableDate && shouldDisableDate({ toDate: () => d })) return;
    onChange(formatDate(d));
  };

  const isDisabled = (day) => {
    if (!shouldDisableDate) return false;
    return shouldDisableDate({ toDate: () => new Date(viewYear, viewMonth, day) });
  };

  const cells = [];
  for (let i = 0; i < mondayOffset; i++) {
    cells.push(<Box key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const disabled = isDisabled(d);
    const sel = isSelectedDay(d);
    cells.push(
      <Box
        key={d}
        onClick={() => !disabled && handleDayClick(d)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 2, cursor: disabled ? 'default' : 'pointer',
          transition: '0.1s',
          bgcolor: sel ? 'primary.main' : 'transparent',
          color: disabled ? 'text.disabled'
               : sel ? '#fff'
               : 'text.primary',
          fontWeight: sel ? 700 : 400,
          '&:hover': !disabled && !sel ? { bgcolor: theme.palette.action.hover } : {},
        }}
      >
        {d}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        <IconButton size="small" onClick={goPrevMonth} sx={{ color: 'text.secondary' }}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 180, textAlign: 'center' }}>
          {MONTHS[viewMonth]} {viewYear}
        </Typography>
        <IconButton size="small" onClick={goNextMonth} sx={{ color: 'text.secondary' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DAYS_HEADER.map((label, i) => (
          <Typography key={i} variant="caption" sx={{
            textAlign: 'center', fontWeight: 600, color: 'text.secondary', py: 0.5,
          }}>
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)', flex: 1,
      }}>
        {cells}
      </Box>
    </Box>
  );
};

export default MonthCalendar;
