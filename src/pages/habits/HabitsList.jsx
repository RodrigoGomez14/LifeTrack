import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Card,
  Typography,
  Button,
  useTheme,
  Chip,
  Stack,
  Avatar,
  CircularProgress,
  alpha,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { DashedAddCard } from '../../design-system/SectionCard';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import {
  shouldShowHabitForDate,
  formatDate,
} from '../../components/habits/habitsHelpers';

const DIFFICULTY_COLORS = {
  1: '#4caf50',
  2: '#8bc34a',
  3: '#ff9800',
  4: '#f44336',
  5: '#9c27b0',
};

const DIFFICULTY_LABELS = {
  1: 'Muy Fácil',
  2: 'Fácil',
  3: 'Moderado',
  4: 'Difícil',
  5: 'Muy Difícil',
};

const getFrequencyText = (habit) => {
  switch (habit.frequency) {
    case 'daily':
      return 'Diario';
    case 'weekdays':
      return 'Lunes a Viernes';
    case 'weekends':
      return 'Fines de semana';
    case 'custom': {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const sorted = [...(habit.customDays || [])].sort((a, b) => a - b);
      return sorted.map((d) => dayNames[d]).join(', ');
    }
    case 'monthly': {
      const sorted = [...(habit.monthlyDays || [])].sort((a, b) => a - b);
      return `Día${sorted.length > 1 ? 's' : ''} ${sorted.join(', ')}`;
    }
    case 'yearly': {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const sortedMonths = [...(habit.yearlyMonths || [])].sort((a, b) => a - b);
      return sortedMonths.map((m) => months[m - 1]).join(', ');
    }
    default:
      return 'No definida';
  }
};

const HabitsList = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    if (userData && userData.habits) {
      const habitsArray = Object.keys(userData.habits)
        .filter((key) => key !== 'completed')
        .map((id) => ({ id, ...userData.habits[id] }));
      setHabits(habitsArray);
      if (userData.habits.completed) {
        setCompletedHabits(userData.habits.completed);
      }
      setLoading(false);
    } else {
      setHabits([]);
      setCompletedHabits({});
      setLoading(false);
    }
  }, [userData]);

  const calculateStats = (habit) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    let totalPossible = 0;
    let totalCompleted = 0;

    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      if (shouldShowHabitForDate(habit, d)) {
        totalPossible++;
        const dateStr = formatDate(d);
        if (completedHabits[dateStr] && completedHabits[dateStr][habit.id]) {
          totalCompleted++;
        }
      }
    }

    return {
      percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      completed: totalCompleted,
      possible: totalPossible,
      points: Math.round(10 * (habit.difficultyMultiplier || 1.0)),
    };
  };

  const filtered = habits.filter((h) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.description && h.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <Layout title="Mis Hábitos">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (habits.length === 0) {
    return (
      <Layout title="Mis Hábitos">
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PlaylistAddCheckIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              No tenés hábitos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Creá tu primer hábito para comenzar el seguimiento.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/NuevoHabito')}
              sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Crear hábito
            </Button>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Mis Hábitos">
      <Box sx={{ maxWidth: 700, mx: 'auto', px: 2, py: 2 }}>
        {/* Buscador pill */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar hábitos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: alpha(theme.palette.action.hover, 0.35),
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.3) },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1.5 },
              },
            }}
          />
        </Box>

        {/* Lista */}
        <AnimatedGroup component={Stack} spacing={1.5}>
          {filtered.map((habit) => {
            const stats = calculateStats(habit);
            const diffColor = DIFFICULTY_COLORS[habit.difficulty || 1];
            const diffLabel = DIFFICULTY_LABELS[habit.difficulty || 1];
            const freqText = getFrequencyText(habit);
            const habitColor = theme.palette[habit.color]?.main || theme.palette.primary.main;

            return (
              <AnimatedItem key={habit.id}>
              <Card
                key={habit.id}
                elevation={0}
                onClick={() => navigate(`/DetalleHabito/${habit.id}`)}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: 'pointer',
                  transition: '0.15s',
                  '&:hover': {
                    borderColor: alpha(habitColor, 0.4),
                    bgcolor: alpha(habitColor, 0.02),
                  },
                }}
              >
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(habitColor, 0.15),
                      color: habitColor,
                      width: 44,
                      height: 44,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    }}
                  >
                    {habit.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                      {habit.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {freqText}
                      </Typography>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: diffColor,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {diffLabel}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 50 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: stats.percentage >= 80 ? 'success.main' : stats.percentage >= 50 ? 'info.main' : 'text.secondary',
                      }}
                    >
                      {stats.percentage}%
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/EditarHabito/${habit.id}`);
                    }}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
              </AnimatedItem>
            );
          })}
        </AnimatedGroup>

        {/* Card fantasma para agregar */}
        <AnimatedItem>
        <Box sx={{ mt: 2 }}>
          <DashedAddCard
            label="Agregar hábito"
            desc="Crear un nuevo seguimiento"
            onClick={() => navigate('/NuevoHabito')}
          />
        </Box>
        </AnimatedItem>
      </Box>
    </Layout>
  );
};

export default HabitsList;
