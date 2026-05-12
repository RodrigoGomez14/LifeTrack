import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReactApexChart from 'react-apexcharts';
import { formatDate, shouldShowHabitForDate } from './habitsHelpers';

const WeeklyEvolutionChart = ({ userData, habits, allWeeksCompletedHabits }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    if (!userData || !habits.length) return;

    const currentDate = new Date();
    const weekDates = [];

    // Últimas 5 semanas completadas (excluye la actual: nunca está terminada hasta el domingo)
    const startWeekOffset = 5;
    const endWeekOffset = 1;
    for (let i = startWeekOffset; i >= endWeekOffset; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (currentDate.getDay() - 1 + (i * 7)));
      weekDates.push(weekStart);
    }

    // Para cada semana, calcular % ponderado de completitud por día (lun→dom)
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

        data[dayOffset] = weightedPossible > 0
          ? Math.round((weightedCompleted / weightedPossible) * 100)
          : 0;
      }

      return { name: `${startFormatted} - ${endFormatted}`, data };
    });

    const options = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        fontFamily: theme.typography.fontFamily,
        background: 'transparent',
        dropShadow: { enabled: true, top: 2, left: 2, blur: 4, opacity: 0.15 },
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
        labels: {
          formatter: (val) => `${val}%`,
          style: { colors: theme.palette.text.secondary },
        },
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
        fontSize: '13px',
        itemMargin: { horizontal: 10, vertical: 5 },
        offsetX: 10,
        offsetY: 5,
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: { height: 240 },
            legend: {
              show: true,
              position: 'bottom',
              horizontalAlign: 'center',
              offsetY: 5,
              fontSize: '11px',
              itemMargin: { horizontal: 6, vertical: 3 },
            },
          },
        },
      ],
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
    <Card
      elevation={3}
      sx={{
        width: '100%',
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
              <ShowChartIcon />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                Evolución Ponderada
              </Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                Últimas 5 semanas (por dificultad)
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', height: isMobile ? 300 : 400 }}>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={isMobile ? 240 : 350}
        />
      </Box>
    </Card>
  );
};

export default WeeklyEvolutionChart;
