import React, { useState, useEffect } from 'react';
import { Card, Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReactApexChart from 'react-apexcharts';
import { formatDate, shouldShowHabitForDate } from './habitsHelpers';
import { AnimatedItem } from '../../design-system';

const WeeklyEvolutionChart = ({ userData, habits, allWeeksCompletedHabits }) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    if (!userData || !habits.length) return;

    const currentDate = new Date();
    const weekDates = [];

    const startWeekOffset = 5;
    const endWeekOffset = 1;
    for (let i = startWeekOffset; i >= endWeekOffset; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + i * 7));
      weekDates.push(weekStart);
    }

    const series = weekDates.map((weekStartDate) => {
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const startFormatted = `${weekStartDate.getDate().toString().padStart(2, '0')}/${(weekStartDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const endFormatted = `${weekEndDate.getDate().toString().padStart(2, '0')}/${(weekEndDate.getMonth() + 1).toString().padStart(2, '0')}`;

      const data = Array(7).fill(0);
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = new Date(weekStartDate);
        currentDay.setDate(weekStartDate.getDate() + dayOffset);
        const dateStr = formatDate(currentDay);

        let weightedPossible = 0;
        let weightedCompleted = 0;
        habits.forEach((habit) => {
          if (!shouldShowHabitForDate(habit, currentDay)) return;
          const multiplier = habit.difficultyMultiplier || 1.0;
          weightedPossible += 10 * multiplier;
          if (allWeeksCompletedHabits[dateStr]?.[habit.id]) {
            weightedCompleted += 10 * multiplier;
          }
        });

        data[dayOffset] = weightedPossible > 0 ? Math.round((weightedCompleted / weightedPossible) * 100) : 0;
      }

      return { name: `${startFormatted} - ${endFormatted}`, data };
    });

    const options = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
        fontFamily: theme.typography.fontFamily,
        background: 'transparent',
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
      markers: { size: 4, strokeWidth: 2, hover: { size: 7 } },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { formatter: (val) => `${val}%`, style: { colors: theme.palette.text.secondary } },
      },
      tooltip: {
        x: { show: true },
        y: { formatter: (val) => `${val}%` },
        theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        style: { fontSize: '12px', fontFamily: theme.typography.fontFamily },
      },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 5,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 },
      },
      legend: {
        position: 'left',
        horizontalAlign: 'left',
        labels: { colors: theme.palette.text.secondary },
        fontSize: '12px',
        itemMargin: { horizontal: 10, vertical: 5 },
        offsetX: 10,
        offsetY: 5,
      },
      colors: [
        theme.palette.primary.main,
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
      ],
    };

    setChartData({ series, options });
  }, [userData, habits, allWeeksCompletedHabits, theme]);

  if (chartData.series.length === 0) return null;

  return (
    <AnimatedItem>
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        <Box
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShowChartIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            Evolución Ponderada
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Últimas 5 semanas
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'background.paper' }}>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={350}
        />
      </Box>
    </Card>
    </AnimatedItem>
  );
};

export default WeeklyEvolutionChart;
