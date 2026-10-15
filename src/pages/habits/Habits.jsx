import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { toggleHabitCompletion as toggleHabitCompletionService } from '../../services/habits';
import {
  formatDate,
  getWeekRange,
  shouldShowHabitForDate,
} from '../../components/habits/habitsHelpers';
import { AnimatedItem, DashedAddCard } from '../../design-system';
import WeekStrip from '../../components/plants/WeekStrip';
import HabitsSummaryCards from '../../components/habits/HabitsSummaryCards';
import HabitsDayCard from '../../components/habits/HabitsDayCard';
import HabitsListView from '../../components/habits/HabitsListView';

const Habits = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [habitEvents, setHabitEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    completion: 0,
  });

  useEffect(() => {
    setLoading(true);
    if (userData && userData.habits) {
      const habitsArray = Object.keys(userData.habits)
        .filter((key) => key !== 'completed')
        .map((id) => ({
          id,
          ...userData.habits[id],
        }));

      setHabits(habitsArray);
      loadCompletedHabitsForWeek(currentWeek);
      setLoading(false);
    } else {
      setHabits([]);
      setCompletedHabits({});
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const loadCompletedHabitsForWeek = (date) => {
    if (!userData?.habits?.completed) {
      setCompletedHabits({});
      return;
    }

    const { start, end } = getWeekRange(date);
    const weeklyCompleted = {};

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = formatDate(currentDate);
      if (userData.habits.completed[dateStr]) {
        weeklyCompleted[dateStr] = userData.habits.completed[dateStr];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCompletedHabits(weeklyCompleted);
  };

  useEffect(() => {
    if (habits.length > 0) {
      generateHabitEvents();
    } else {
      setHabitEvents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, completedHabits, currentWeek]);

  const generateHabitEvents = () => {
    if (!habits.length) return;

    const events = [];
    const { start, end } = getWeekRange(currentWeek);

    let totalCompletions = 0;
    let totalPossible = 0;
    let weightedCompletions = 0;
    let weightedPossible = 0;
    const habitStats = {};
    const dayStatsObj = {};

    const currentToday = new Date();
    const isCurrentWeek =
      start.getFullYear() === currentToday.getFullYear() &&
      start.getMonth() === currentToday.getMonth() &&
      Math.abs(start.getDate() - currentToday.getDate()) < 7;

    const statisticsEndDate = isCurrentWeek
      ? new Date(Math.min(end.getTime(), currentToday.getTime()))
      : new Date(end);

    const colorOrder = {
      primary: 0,
      secondary: 1,
      success: 2,
      info: 3,
      warning: 4,
      error: 5,
      inherit: 6,
      default: 7,
    };

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];

      dayStatsObj[dateStr] = {
        day: dayName,
        total: 0,
        completed: 0,
        percentage: 0,
        score: 0,
        weightedScore: 0,
      };

      habits.forEach((habit) => {
        if (shouldShowHabitForDate(habit, currentDate)) {
          const difficultyMultiplier = habit.difficultyMultiplier || 1.0;

          dayStatsObj[dateStr].total++;

          if (currentDate <= statisticsEndDate) {
            totalPossible++;
            weightedPossible += difficultyMultiplier;
          }

          if (!habitStats[habit.id]) {
            habitStats[habit.id] = {
              id: habit.id,
              name: habit.name,
              color: habit.color || 'primary',
              difficulty: habit.difficulty || 1,
              difficultyMultiplier,
              possibleDays: 0,
              completedDays: 0,
              percentage: 0,
              weightedScore: 0,
            };
          }

          if (currentDate <= statisticsEndDate) {
            habitStats[habit.id].possibleDays++;
          }

          const isCompleted = completedHabits[dateStr] && completedHabits[dateStr][habit.id];
          if (isCompleted) {
            dayStatsObj[dateStr].completed++;

            if (currentDate <= statisticsEndDate) {
              totalCompletions++;
              weightedCompletions += difficultyMultiplier;
              habitStats[habit.id].completedDays++;
              habitStats[habit.id].weightedScore += 10 * difficultyMultiplier;
            }
          }

          events.push({
            id: `${habit.id}-${dateStr}`,
            title: habit.name,
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59),
            allDay: true,
            resource: {
              habit,
              date: dateStr,
              isCompleted: !!isCompleted,
            },
          });
        }
      });

      if (dayStatsObj[dateStr].total > 0) {
        const dayWeightedCompletions = habits
          .filter((habit) => shouldShowHabitForDate(habit, currentDate))
          .filter((habit) => completedHabits[dateStr] && completedHabits[dateStr][habit.id])
          .reduce((sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0), 0);

        const dayWeightedPossible = habits
          .filter((habit) => shouldShowHabitForDate(habit, currentDate))
          .reduce((sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0), 0);

        dayStatsObj[dateStr].percentage =
          dayWeightedPossible > 0 ? Math.round((dayWeightedCompletions / dayWeightedPossible) * 100) : 0;

        dayStatsObj[dateStr].score = dayStatsObj[dateStr].percentage * 0.3 + dayStatsObj[dateStr].completed * 20;
        dayStatsObj[dateStr].weightedScore = dayWeightedCompletions;
        dayStatsObj[dateStr].totalPossiblePoints = dayWeightedPossible;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    events.sort((a, b) => {
      const dateCompare = a.start.getTime() - b.start.getTime();
      if (dateCompare !== 0) return dateCompare;

      const colorA = a.resource.habit.color || 'primary';
      const colorB = b.resource.habit.color || 'primary';
      const orderA = colorOrder[colorA] !== undefined ? colorOrder[colorA] : 999;
      const orderB = colorOrder[colorB] !== undefined ? colorOrder[colorB] : 999;

      if (orderA !== orderB) return orderA - orderB;
      return a.resource.habit.name.localeCompare(b.resource.habit.name);
    });

    Object.keys(habitStats).forEach((habitId) => {
      const habit = habitStats[habitId];
      habit.percentage = habit.possibleDays > 0 ? Math.round((habit.completedDays / habit.possibleDays) * 100) : 0;
    });

    setHabitEvents(events);

    const today = formatDate(new Date());
    const todayHabits = habits.filter((habit) => shouldShowHabitForDate(habit, new Date()));
    const completedTodayHabits = todayHabits.filter(
      (habit) => completedHabits[today] && completedHabits[today][habit.id]
    );
    const completedToday = completedTodayHabits.length;

    const todayWeightedPossible = todayHabits.reduce(
      (sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0),
      0
    );
    const todayWeightedCompleted = completedTodayHabits.reduce(
      (sum, habit) => sum + 10 * (habit.difficultyMultiplier || 1.0),
      0
    );
    const todayWeightedCompletion =
      todayWeightedPossible > 0 ? Math.round((todayWeightedCompleted / todayWeightedPossible) * 100) : 0;

    let mostConsistentHabit = { weightedScore: 0, percentage: 0, completedDays: 0 };
    let leastConsistentHabit = { percentage: 100, weightedScore: Infinity };

    Object.values(habitStats).forEach((habit) => {
      if (habit.possibleDays > 0 && habit.weightedScore > mostConsistentHabit.weightedScore) {
        mostConsistentHabit = habit;
      }
      if (habit.percentage < leastConsistentHabit.percentage && habit.possibleDays > 0) {
        leastConsistentHabit = habit;
      }
    });

    let bestDay = { weightedScore: 0 };
    let worstDay = { percentage: 100, weightedScore: Infinity };

    Object.values(dayStatsObj).forEach((day) => {
      if (day.weightedScore > bestDay.weightedScore && day.total > 0) {
        bestDay = day;
      }
      if (day.percentage < worstDay.percentage && day.total > 0) {
        worstDay = { ...day, percentage: day.percentage };
      }
    });

    const weightedCompletion =
      weightedPossible > 0 ? Math.round((weightedCompletions / weightedPossible) * 100) : 0;

    const weeklyCompletedPoints = Math.round(weightedCompletions * 10);
    const weeklyTotalPoints = Math.round(weightedPossible * 10);

    setStats({
      totalHabits: habits.length,
      todayHabits: todayHabits.length,
      completedToday,
      completion: todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0,
      weightedTodayCompletion: todayWeightedCompletion,
      weeklyCompletion: totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0,
      weightedWeeklyCompletion: weightedCompletion,
      weeklyCompletedPoints,
      weeklyTotalPoints,
      mostConsistentHabit,
      leastConsistentHabit,
      bestDay,
      worstDay,
      habitStats: Object.values(habitStats).sort((a, b) => b.weightedScore - a.weightedScore),
      dayStats: dayStatsObj,
    });
  };

  const toggleHabitCompletion = async (habitId, dateStr) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCurrentlyCompleted = completedHabits[dateStr] && completedHabits[dateStr][habitId];
    const newCompletedStatus = !isCurrentlyCompleted;

    setCompletedHabits((prev) => {
      const updated = { ...prev };
      if (!updated[dateStr]) updated[dateStr] = {};

      if (newCompletedStatus) {
        updated[dateStr][habitId] = { completedAt: new Date().toISOString(), habitId };
      } else {
        if (updated[dateStr]) {
          delete updated[dateStr][habitId];
          if (Object.keys(updated[dateStr]).length === 0) delete updated[dateStr];
        }
      }
      return updated;
    });

    try {
      await toggleHabitCompletionService(habitId, dateStr, newCompletedStatus);
    } catch (error) {
      setCompletedHabits((prev) => {
        const reverted = { ...prev };
        if (!reverted[dateStr]) reverted[dateStr] = {};

        if (!newCompletedStatus) {
          if (isCurrentlyCompleted) {
            reverted[dateStr][habitId] = { completedAt: 'reverted', habitId };
          }
        } else {
          if (reverted[dateStr] && reverted[dateStr][habitId]) {
            delete reverted[dateStr][habitId];
            if (Object.keys(reverted[dateStr]).length === 0) delete reverted[dateStr];
          }
        }
        return reverted;
      });
    }
  };

  // Al cambiar de semana desde el WeekStrip, alineamos currentWeek y
  // mantenemos selectedDay dentro de la semana visible.
  const handleWeekChange = (offset) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(now);
    target.setDate(now.getDate() + offset * 7);

    setCurrentWeek(target);
    loadCompletedHabitsForWeek(target);

    setSelectedDay((prev) => {
      const { start, end } = getWeekRange(target);
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(23, 59, 59, 999);
      if (prev >= startDay && prev <= endDay) return prev;
      const dayOffset = (prev.getDay() + 6) % 7; // lunes = 0
      const next = new Date(startDay);
      next.setDate(startDay.getDate() + dayOffset);
      return next;
    });
  };

  // Indicadores del WeekStrip: una barra de color por hábito completado.
  const getDayIndicators = (date) => {
    const dateStr = formatDate(date);
    const dayCompletions = userData?.habits?.completed?.[dateStr];
    if (!dayCompletions) return [];
    return habits
      .filter((habit) => dayCompletions[habit.id])
      .map((habit) => theme.palette[habit.color]?.main || theme.palette.primary.main)
      .slice(0, 4);
  };

  const selectedDateStr = formatDate(selectedDay);
  const selectedDayEvents = habitEvents.filter((event) => event.resource.date === selectedDateStr);
  const selectedDayStats = stats.dayStats?.[selectedDateStr] || { total: 0, completed: 0, percentage: 0 };

  return (
    <Layout title="Hábitos">
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          p: 2,
          pb: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
          }}
        >
          <Tab label="Semana" />
          <Tab label="Lista" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <HabitsSummaryCards loading={loading} stats={stats} />

            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <WeekStrip
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                onWeekChange={handleWeekChange}
                getIndicators={getDayIndicators}
              />
            </Box>

            <HabitsDayCard
              date={selectedDay}
              events={selectedDayEvents}
              stats={selectedDayStats}
              loading={loading}
              onToggle={toggleHabitCompletion}
              onOpenHabit={(habitId) => navigate(`/DetalleHabito/${habitId}`)}
            />

            <AnimatedItem>
              <DashedAddCard
                label="Nuevo hábito"
                desc="Creá un nuevo seguimiento"
                onClick={() => navigate('/NuevoHabito')}
              />
            </AnimatedItem>
          </Box>
        )}

        {tab === 1 && (
          <HabitsListView
            habits={habits}
            completedHabits={userData?.habits?.completed || {}}
            onOpen={(habitId) => navigate(`/DetalleHabito/${habitId}`)}
            onEdit={(habitId) => navigate(`/DetalleHabito/${habitId}`, { state: { openEdit: true } })}
            onCreate={() => navigate('/NuevoHabito')}
          />
        )}
      </Box>
    </Layout>
  );
};

export default Habits;
