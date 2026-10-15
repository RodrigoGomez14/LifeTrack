import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
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

const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getDayKey = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
};

const getActivityIndicators = (date, allPlants) => {
  const key = getDayKey(date);
  const indicators = [];
  if (!allPlants) return indicators;
  allPlants.forEach((plant) => {
    ['irrigations', 'prunings', 'insecticides', 'transplants', 'images', 'logs'].forEach((prop) => {
      if (plant[prop]) {
        const has = Object.values(plant[prop]).some((e) => normalizeDate(e.date) === key);
        if (has) indicators.push(prop === 'irrigations' ? '#2196F3' : prop === 'prunings' ? '#4CAF50' : prop === 'insecticides' ? '#FF5722' : prop === 'transplants' ? '#9C27B0' : prop === 'images' ? '#FF9800' : '#607D8B');
      }
    });
  });
  return indicators.slice(0, 4);
};

const DayCell = ({ date, isToday, isSelected, indicators, label, onClick, stageColor }) => (
  <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1, py: 2, bgcolor: stageColor ? alpha(stageColor, 0.2) : 'transparent', transition: 'background-color 0.15s' }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700,
      bgcolor: isSelected ? '#D4A017' : isToday ? alpha('#3f51b5', 0.2) : 'transparent',
      color: isSelected ? '#fff' : isToday ? '#7986cb' : stageColor ? '#fff' : 'text.secondary',
      transition: 'background-color 0.1s, color 0.1s',
    }}>
      {date.getDate()}
    </Box>
    <Box sx={{ display: 'flex', gap: 0.15, justifyContent: 'center', alignItems: 'center', height: 6, mt: 0.25, mb: 1 }}>
      {indicators.map((c, j) => (
        <Box key={j} sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: c }} />
      ))}
    </Box>
    <Typography sx={{ fontSize: 8, fontWeight: 600, color: isSelected ? '#D4A017' : isToday ? '#7986cb' : alpha('rgba(255,255,255,0.4)', 0.5), textAlign: 'center', whiteSpace: 'nowrap' }}>
      {label}
    </Typography>
  </Box>
);

const WeekStrip = ({ weekOffset: externalOffset, onWeekChange, allPlants, selectedDay, onDaySelect, showLabels = true, getStageColor, getIndicators }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const arrowSx = { color: 'text.secondary', p: 0.25, borderRadius: '6px', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) } };
  const touchRef = useRef({ startX: 0, currentX: 0 });
  const [internalOffset, setInternalOffset] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const daySelectedRef = useRef(false);
  const originalDayRef = useRef(null);

  const offset = externalOffset !== undefined ? externalOffset : internalOffset;
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const prevDates = useMemo(() => getWeekDates(offset - 1), [offset]);
  const currDates = useMemo(() => getWeekDates(offset), [offset]);
  const nextDates = useMemo(() => getWeekDates(offset + 1), [offset]);

  const containerWidthRef = useRef(containerWidth);
  useEffect(() => { containerWidthRef.current = containerWidth; }, [containerWidth]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setContainerWidth(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const translateX = useMotionValue(0);
  const totalX = useTransform(translateX, (t) => -containerWidth + t);

  const navigateWeek = useCallback((direction) => {
    const cw = containerWidthRef.current || 0;
    const newOffset = offset + direction;
    if (externalOffset !== undefined) {
      onWeekChange?.(newOffset);
    } else {
      setInternalOffset(newOffset);
      onWeekChange?.(newOffset);
    }
    translateX.set(direction > 0 ? -cw : cw);
    requestAnimationFrame(() => {
      animate(translateX, 0, { type: 'spring', stiffness: 250, damping: 30, mass: 0.8 });
    });
  }, [offset, externalOffset, onWeekChange, translateX]);

  const handleTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, currentX: e.touches[0].clientX };
    daySelectedRef.current = false;
    originalDayRef.current = selectedDay;
    setIsGrabbing(true);
  };

  const handleTouchMove = (e) => {
    if (!touchRef.current) return;
    const delta = e.touches[0].clientX - touchRef.current.startX;
    touchRef.current.currentX = e.touches[0].clientX;
    translateX.set(delta);
    if (!daySelectedRef.current && containerWidthRef.current && Math.abs(delta) > containerWidthRef.current * 0.2) {
      daySelectedRef.current = true;
      const dir = delta > 0 ? -1 : 1;
      const newWeekDates = getWeekDates(offset + dir);
      onDaySelect?.(dir === 1 ? newWeekDates[0] : newWeekDates[6]);
    }
  };

  const handleTouchEnd = () => {
    if (!touchRef.current) return;
    setIsGrabbing(false);
    const delta = touchRef.current.currentX - touchRef.current.startX;
    const threshold = 40;
    if (Math.abs(delta) > threshold) {
      const dir = delta > 0 ? -1 : 1;
      const newOffset = offset + dir;
      translateX.jump(delta + dir * containerWidthRef.current);
      if (externalOffset !== undefined) {
        onWeekChange?.(newOffset);
      } else {
        setInternalOffset(newOffset);
        onWeekChange?.(newOffset);
      }
      requestAnimationFrame(() => {
        animate(translateX, 0, { type: 'spring', stiffness: 250, damping: 30, mass: 0.8 });
      });
    } else {
      if (daySelectedRef.current) {
        onDaySelect?.(originalDayRef.current);
      }
      animate(translateX, 0, { type: 'spring', stiffness: 350, damping: 35, mass: 0.6 });
    }
    touchRef.current = null;
  };

  const renderWeekRow = (dates) => {
    if (!containerWidth) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-around', width: containerWidth, flexShrink: 0, px: isDesktop ? 0.5 : 0 }}>
        {dates.map((date, i) => {
          const isToday = sameDay(date, today);
          const isSelected = sameDay(date, selectedDay);
          const indicators = getIndicators ? getIndicators(date) : getActivityIndicators(date, allPlants);
          return (
            <DayCell
              key={i}
              date={date}
              isToday={isToday}
              isSelected={isSelected}
              indicators={indicators}
              label={DAYS_FULL[date.getDay()]}
              onClick={() => onDaySelect?.(date)}
              stageColor={getStageColor ? getStageColor(date) : null}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ userSelect: 'none', px: isDesktop ? 1 : 0 }}>
      {showLabels && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          {isDesktop && (
            <IconButton size="small" onClick={() => navigateWeek(-1)} sx={arrowSx}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flex: 1 }}>
            {DAYS_SHORT.map((d, i) => (
              <Typography key={i} variant="caption" sx={{ fontWeight: 600, fontSize: 10, color: i === 0 || i === 6 ? alpha(theme.palette.text.secondary, 0.6) : 'text.secondary', textAlign: 'center', flex: 1 }}>
                {d}
              </Typography>
            ))}
          </Box>
          {isDesktop && (
            <IconButton size="small" onClick={() => navigateWeek(1)} sx={arrowSx}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isDesktop && !showLabels && (
          <IconButton size="small" onClick={() => navigateWeek(-1)} sx={arrowSx}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}

        <Box
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{ flex: 1, overflow: 'hidden', cursor: isGrabbing ? 'grabbing' : 'grab', position: 'relative' }}
        >
          {containerWidth > 0 && (
            <motion.div style={{ display: 'flex', x: totalX }}>
              {renderWeekRow(prevDates)}
              {renderWeekRow(currDates)}
              {renderWeekRow(nextDates)}
            </motion.div>
          )}
        </Box>

        {isDesktop && !showLabels && (
          <IconButton size="small" onClick={() => navigateWeek(1)} sx={arrowSx}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default WeekStrip;
export { getDayKey };
