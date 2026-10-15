import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { DashedAddCard, AnimatedGroup, AnimatedItem } from '../../design-system';
import {
  formatDate,
  shouldShowHabitForDate,
  getDifficultyColor,
  getDifficultyLabel,
  getFrequencyText,
} from './habitsHelpers';

const HabitsListView = ({ habits, completedHabits, onOpen, onEdit, onCreate }) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');

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
    return h.name.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q));
  });

  if (habits.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <PlaylistAddCheckIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          No tenés hábitos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Creá tu primer hábito para comenzar el seguimiento.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreate}
          sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Crear hábito
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar hábito..."
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
          sx: { borderRadius: 2 },
        }}
        sx={{ mb: 2 }}
      />

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body2" color="text.secondary">
            Sin resultados
          </Typography>
        </Box>
      ) : (
        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((habit) => {
            const stats = calculateStats(habit);
            const diffColor = getDifficultyColor(habit.difficulty || 1);
            const habitColor = theme.palette[habit.color]?.main || theme.palette.primary.main;

            return (
              <AnimatedItem key={habit.id}>
                <Card
                  elevation={0}
                  onClick={() => onOpen(habit.id)}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: '0.15s',
                    '&:hover': { borderColor: alpha(habitColor, 0.4), bgcolor: alpha(habitColor, 0.02) },
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
                          {getFrequencyText(habit)}
                        </Typography>
                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: diffColor }} />
                        <Typography variant="caption" color="text.secondary">
                          {getDifficultyLabel(habit.difficulty || 1)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', minWidth: 50 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color:
                            stats.percentage >= 80 ? 'success.main' : stats.percentage >= 50 ? 'info.main' : 'text.secondary',
                        }}
                      >
                        {stats.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.points} pts
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(habit.id);
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
      )}

      <AnimatedItem>
        <Box sx={{ mt: 2 }}>
          <DashedAddCard label="Agregar hábito" desc="Crear un nuevo seguimiento" onClick={onCreate} />
        </Box>
      </AnimatedItem>
    </Box>
  );
};

export default HabitsListView;
