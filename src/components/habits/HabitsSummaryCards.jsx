import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { AnimatedGroup, AnimatedItem, GhostStatCard } from '../../design-system';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TodayIcon from '@mui/icons-material/Today';

const HabitsSummaryCards = ({ loading, stats }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} variant="rectangular" height={104} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  const best = stats?.mostConsistentHabit;
  const worst = stats?.leastConsistentHabit;
  const bestDay = stats?.bestDay;

  const items = [
    {
      key: 'week',
      icon: TrendingUpIcon,
      label: 'PROGRESO SEMANAL',
      value: `${stats?.weightedWeeklyCompletion || 0}%`,
      sub: `${stats?.weeklyCompletedPoints || 0}/${stats?.weeklyTotalPoints || 0} pts`,
      color: 'primary',
    },
    {
      key: 'best',
      icon: EmojiEventsIcon,
      label: 'MEJOR HÁBITO',
      value: best && best.name ? best.name : '—',
      sub: best && best.name ? `${best.percentage}%` : 'Sin datos',
      color: 'success',
    },
    {
      key: 'day',
      icon: TodayIcon,
      label: 'MEJOR DÍA',
      value: bestDay && bestDay.day ? bestDay.day : '—',
      sub: bestDay && bestDay.day ? `${bestDay.percentage}%` : 'Sin datos',
      color: 'info',
    },
    {
      key: 'worst',
      icon: TrendingDownIcon,
      label: 'A MEJORAR',
      value: worst && worst.name ? worst.name : '—',
      sub: worst && worst.name ? `${worst.percentage}%` : 'Sin datos',
      color: 'warning',
    },
  ];

  return (
    <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      {items.map((item) => (
        <AnimatedItem key={item.key}>
          <GhostStatCard icon={item.icon} label={item.label} value={item.value} sub={item.sub} color={item.color} />
        </AnimatedItem>
      ))}
    </AnimatedGroup>
  );
};

export default HabitsSummaryCards;
