import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { GhostStatCard, AnimatedGroup, AnimatedItem } from '../../design-system';
import { getFrequencyText, getDifficultyColor, getDifficultyLabel } from './habitsHelpers';
import HabitForm from './HabitForm';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';

const HISTORY_PAGE_SIZE = 10;

const HabitDetail = ({ habitId }) => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [habit, setHabit] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [visibleHistory, setVisibleHistory] = useState(HISTORY_PAGE_SIZE);
  const [editOpen, setEditOpen] = useState(() => !!location.state?.openEdit);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    if (userData && userData.habits && habitId && userData.habits[habitId]) {
      const habitData = { ...userData.habits[habitId], id: habitId };
      setHabit(habitData);

      if (userData.habits.completed) {
        const history = [];
        Object.keys(userData.habits.completed).forEach((dateStr) => {
          const dateCompletions = userData.habits.completed[dateStr];
          if (dateCompletions[habitId]) {
            history.push({
              date: dateStr,
              completed: true,
              completedAt: dateCompletions[habitId].completedAt,
            });
          }
        });
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        setCompletionHistory(history);
        calculateStats(history, habitData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, habitId]);

  const calculateStats = (history, habitData) => {
    const totalCompleted = history.length;
    let currentStreak = 0;
    let previousDate = null;
    let longestStreak = habitData.streak || 0;

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < sortedHistory.length; i++) {
      const completionDate = new Date(sortedHistory[i].date);
      if (i === 0) {
        if (completionDate.getTime() === today.getTime() || completionDate.getTime() === yesterday.getTime()) {
          currentStreak = 1;
          previousDate = completionDate;
        } else {
          break;
        }
      } else {
        const expectedPreviousDate = new Date(previousDate);
        expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);
        if (completionDate.getTime() === expectedPreviousDate.getTime()) {
          currentStreak++;
          previousDate = completionDate;
        } else {
          break;
        }
      }
    }

    const creationDate = habitData.createdAt ? new Date(habitData.createdAt) : new Date();
    const daysSinceCreation = Math.max(1, Math.floor((today - creationDate) / (1000 * 60 * 60 * 24)));
    const completionRate = Math.round((totalCompleted / daysSinceCreation) * 100);

    setStats({ totalCompleted, completionRate, currentStreak, longestStreak });
  };

  const formatFullDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  if (!habit) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          Cargando información del hábito...
        </Typography>
      </Box>
    );
  }

  const habitColor = theme.palette[habit.color]?.main || theme.palette.primary.main;
  const diffColor = getDifficultyColor(habit.difficulty || 1);

  const statItems = [
    { key: 'completed', icon: CheckCircleIcon, label: 'COMPLETADOS', value: stats.totalCompleted, color: 'primary' },
    { key: 'current', icon: LocalFireDepartmentIcon, label: 'RACHA ACTUAL', value: stats.currentStreak, color: 'warning' },
    { key: 'longest', icon: EmojiEventsIcon, label: 'RACHA MÁS LARGA', value: stats.longestStreak, color: 'info' },
    { key: 'rate', icon: MoreTimeIcon, label: 'TASA DE ÉXITO', value: `${stats.completionRate}%`, color: 'success' },
  ];

  const remainingHistory = completionHistory.length - visibleHistory;

  return (
    <>
      <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header */}
        <AnimatedItem>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(habitColor, 0.25)}`,
              bgcolor: alpha(habitColor, 0.05),
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(habitColor, 0.18),
                  color: habitColor,
                  width: 52,
                  height: 52,
                  fontWeight: 700,
                  fontSize: '1.3rem',
                }}
              >
                {habit.name.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
                  {habit.name}
                </Typography>
                {habit.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                    {habit.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
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

              <Button
                onClick={() => setEditOpen(true)}
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                sx={{
                  flexShrink: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 999,
                  px: 1.5,
                  color: habitColor,
                  bgcolor: alpha(habitColor, 0.1),
                  '&:hover': { bgcolor: alpha(habitColor, 0.18) },
                }}
              >
                Editar
              </Button>
            </Box>
          </Card>
        </AnimatedItem>

        {/* Stats */}
        <AnimatedItem>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {statItems.map((s) => (
              <GhostStatCard key={s.key} icon={s.icon} label={s.label} value={s.value} color={s.color} />
            ))}
          </Box>
        </AnimatedItem>

        {/* Historial */}
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
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <HistoryIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
                Historial de completados
              </Typography>
              {completionHistory.length > 0 && (
                <Chip
                  label={completionHistory.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>

            {completionHistory.length > 0 ? (
              <Box>
                {completionHistory.slice(0, visibleHistory).map((entry) => (
                  <Box
                    key={entry.date}
                    sx={{
                      px: 2,
                      py: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:not(:last-child)': { borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}` },
                    }}
                  >
                    <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {formatFullDate(entry.date)}
                      </Typography>
                      {entry.completedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Completado a las {formatTime(entry.completedAt)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}

                {remainingHistory > 0 && (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Button
                      onClick={() => setVisibleHistory((c) => c + HISTORY_PAGE_SIZE)}
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
                    >
                      Mostrar más ({remainingHistory})
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Aún no hay registros de completado
                </Typography>
              </Box>
            )}
          </Card>
        </AnimatedItem>
      </AnimatedGroup>

      {/* Modal de edición */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          Editar hábito
          <IconButton onClick={() => setEditOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <HabitForm
            habit={habit}
            onSaved={() => setEditOpen(false)}
            onDeleted={() => {
              setEditOpen(false);
              navigate('/Habitos');
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HabitDetail;
