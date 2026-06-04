import React, { useMemo } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const DAYS_HEADER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const MonthGrid = ({ expanded, year, month, selectedDay, onDaySelect, allPlants, getDayKey }) => {
  const theme = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { weeks, prevMonthDays } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    const totalDays = daysInMonth + startDow;
    const rows = Math.ceil(totalDays / 7);
    const weeks = [];
    let day = 1;

    for (let r = 0; r < rows; r++) {
      const week = [];
      for (let c = 0; c < 7; c++) {
        if (r === 0 && c < startDow) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      weeks.push(week);
    }

    // Previous month days for first row
    const prevLastDay = new Date(year, month - 1, 0).getDate();
    const prevDays = [];
    for (let i = startDow - 1; i >= 0; i--) {
      prevDays.push(prevLastDay - i);
    }

    return { weeks, prevMonthDays: prevDays };
  }, [year, month]);

  return (
    <Collapse in={expanded} timeout={300} unmountOnExit>
      <Box sx={{ px: 2, pb: 1.5 }}>
        {/* Day headers */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 0.5 }}>
          {DAYS_HEADER.map((d, i) => (
            <Typography key={i} variant="caption" sx={{ fontWeight: 600, fontSize: 10, color: i === 0 || i === 6 ? alpha(theme.palette.text.secondary, 0.5) : 'text.secondary', width: 32, textAlign: 'center' }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <Box key={wi} sx={{ display: 'flex', justifyContent: 'space-around', mb: 0.25 }}>
            {week.map((day, ci) => {
              const isPrev = day === null && wi === 0 && ci < prevMonthDays.length;
              const dayNum = isPrev ? prevMonthDays[ci] : day;
              const isToday = dayNum && year === today.getFullYear() && month === today.getMonth() + 1 && dayNum === today.getDate();
              const date = dayNum ? new Date(year, month - 1, dayNum) : null;
              const isSelected = selectedDay && date && date.getTime() === selectedDay.getTime();

              if (!dayNum && !isPrev) {
                return <Box key={ci} sx={{ width: 32, height: 28 }} />;
              }

              return (
                <Box
                  key={ci}
                  onClick={() => date && onDaySelect?.(date)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: isToday ? 700 : 500,
                    bgcolor: isToday ? '#D4A017' : isSelected ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                    color: isToday ? '#fff' : isPrev ? alpha(theme.palette.text.secondary, 0.35) : isSelected ? theme.palette.primary.light : 'text.secondary',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {dayNum}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Collapse>
  );
};

export default MonthGrid;
