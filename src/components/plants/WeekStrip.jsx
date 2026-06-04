import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DAYS_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const DAYS_FULL = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const getWeekDates = (weekOffset = 0) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getDayKey = (date) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return `${d}/${m}/${date.getFullYear()}`;
};

const getActivityIndicators = (date, allPlants) => {
  const key = getDayKey(date);
  const indicators = [];
  if (!allPlants) return indicators;
  allPlants.forEach((plant) => {
    ['irrigations', 'prunings', 'insecticides', 'transplants', 'images', 'logs'].forEach((prop) => {
      if (plant[prop]) {
        const has = Object.values(plant[prop]).some((e) => e.date === key);
        if (has) indicators.push(prop === 'irrigations' ? '#2196F3' : prop === 'prunings' ? '#4CAF50' : prop === 'insecticides' ? '#FF5722' : prop === 'transplants' ? '#9C27B0' : prop === 'images' ? '#FF9800' : '#607D8B');
      }
    });
  });
  return indicators.slice(0, 3);
};

const DayCell = ({ date, isToday, isSelected, indicators, label, onClick }) => (
  <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25, cursor: 'pointer', flex: 1 }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700,
      bgcolor: isSelected ? '#D4A017' : isToday ? alpha('#3f51b5', 0.2) : 'transparent',
      color: isSelected ? '#fff' : isToday ? '#7986cb' : 'text.secondary',
      transition: 'all 0.1s',
    }}>
      {date.getDate()}
    </Box>
    <Box sx={{ display: 'flex', gap: 0.15, justifyContent: 'center', height: 3 }}>
      {indicators.map((c, j) => (
        <Box key={j} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: c }} />
      ))}
    </Box>
    <Typography sx={{ fontSize: 8, fontWeight: 600, color: isSelected ? '#D4A017' : isToday ? '#7986cb' : alpha('rgba(255,255,255,0.4)', 0.5), textAlign: 'center', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  </Box>
);

const WeekStrip = ({ weekOffset: externalOffset, onWeekChange, allPlants, selectedDay, onDaySelect, showLabels = true }) => {
  const theme = useTheme();
  const touchRef = useRef({ startX: 0, currentX: 0, hasAutoSelected: false });
  const [internalOffset, setInternalOffset] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const offset = externalOffset !== undefined ? externalOffset : internalOffset;
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const prevDates = useMemo(() => getWeekDates(offset - 1), [offset]);
  const currDates = useMemo(() => getWeekDates(offset), [offset]);
  const nextDates = useMemo(() => getWeekDates(offset + 1), [offset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setContainerWidth(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const navigateWeek = useCallback((direction, finalDelta = 0) => {
    setTranslateX(finalDelta);
    setIsDragging(false);
    const newOffset = offset + direction;
    if (externalOffset !== undefined) {
      onWeekChange?.(newOffset);
    } else {
      setInternalOffset(newOffset);
      onWeekChange?.(newOffset);
    }
    // Esperar 2 frames: garantiza que el browser pintó las semanas nuevas
    // en translateX=finalDelta ANTES de disparar la animación al centro
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTranslateX(0);
      });
    });
  }, [offset, externalOffset, onWeekChange]);

  const commitSwipe = useCallback((deltaX) => {
    if (Math.abs(deltaX) > 40) {
      navigateWeek(deltaX > 0 ? -1 : 1, deltaX);
    } else {
      setIsDragging(false);
      setTranslateX(0);
    }
  }, [navigateWeek]);

  const handleTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, currentX: e.touches[0].clientX, hasAutoSelected: false };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchRef.current) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    touchRef.current.currentX = e.touches[0].clientX;
    setTranslateX(delta);
    // Auto-seleccionar día apenas el swipe cruce el umbral
    if (!touchRef.current.hasAutoSelected && Math.abs(delta) > 40) {
      touchRef.current.hasAutoSelected = true;
      if (delta > 0) {
        onDaySelect?.(prevDates[6]); // domingo semana anterior
      } else {
        onDaySelect?.(nextDates[0]); // lunes semana siguiente
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current) return;
    const delta = touchRef.current.currentX - touchRef.current.startX;
    commitSwipe(delta);
    touchRef.current = null;
  };

  const renderWeekRow = (dates) => {
    if (!containerWidth) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-around', width: containerWidth, flexShrink: 0, px: 0.5 }}>
        {dates.map((date, i) => {
          const isToday = sameDay(date, today);
          const isSelected = sameDay(date, selectedDay);
          const indicators = getActivityIndicators(date, allPlants);
          return (
            <DayCell
              key={i}
              date={date}
              isToday={isToday}
              isSelected={isSelected}
              indicators={indicators}
              label={DAYS_FULL[date.getDay()]}
              onClick={() => onDaySelect?.(date)}
            />
          );
        })}
      </Box>
    );
  };

  const weekLabel = useMemo(() => {
    const start = currDates[0]; const end = currDates[6];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (start.getMonth() === end.getMonth()) return `${start.getDate()} - ${end.getDate()} ${months[start.getMonth()]}`;
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
  }, [currDates]);

  return (
    <Box sx={{ userSelect: 'none' }}>
      {showLabels && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <IconButton size="small" onClick={() => navigateWeek(-1)} sx={{ color: 'text.secondary', p: 0.25 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flex: 1 }}>
            {DAYS_SHORT.map((d, i) => (
              <Typography key={i} variant="caption" sx={{ fontWeight: 600, fontSize: 10, color: i === 0 || i === 6 ? alpha(theme.palette.text.secondary, 0.6) : 'text.secondary', textAlign: 'center', flex: 1 }}>
                {d}
              </Typography>
            ))}
          </Box>
          <IconButton size="small" onClick={() => navigateWeek(1)} sx={{ color: 'text.secondary', p: 0.25 }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {!showLabels && (
          <IconButton size="small" onClick={() => navigateWeek(-1)} sx={{ color: 'text.secondary', p: 0.25 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}

        <Box
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{ flex: 1, overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative' }}
        >
          {containerWidth > 0 && (
            <Box
              sx={{
                display: 'flex',
                transform: `translateX(${-containerWidth + translateX}px)`,
                transition: !isDragging ? 'transform 0.25s ease' : 'none',
              }}
            >
              {renderWeekRow(prevDates)}
              {renderWeekRow(currDates)}
              {renderWeekRow(nextDates)}
            </Box>
          )}
        </Box>

        {!showLabels && (
          <IconButton size="small" onClick={() => navigateWeek(1)} sx={{ color: 'text.secondary', p: 0.25 }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {!showLabels && (
        <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mt: 0.5, color: 'text.secondary', fontSize: 10 }}>
          {weekLabel}
        </Typography>
      )}
    </Box>
  );
};

export default WeekStrip;
export { getDayKey };
