import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Divider,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreTimeIcon from '@mui/icons-material/MoreTime';

const HabitDetail = ({ habitId, onBack }) => {
  const { userData } = useStore();
  const theme = useTheme();
  const [habit, setHabit] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onBack} size="small" sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {habit.name}
          </Typography>
        </Box>
        <Button
          component={Link}
          to={`/EditarHabito/${habitId}`}
          startIcon={<EditIcon />}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 999,
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
          }}
        >
          Editar
        </Button>
      </Box>

      {/* Stats grid */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                width: 40,
                height: 40,
                mx: 'auto',
                mb: 1,
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.totalCompleted}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completados
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                width: 40,
                height: 40,
                mx: 'auto',
                mb: 1,
              }}
            >
              <LocalFireDepartmentIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.currentStreak}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Racha actual
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
                width: 40,
                height: 40,
                mx: 'auto',
                mb: 1,
              }}
            >
              <EmojiEventsIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.longestStreak}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Racha más larga
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                width: 40,
                height: 40,
                mx: 'auto',
                mb: 1,
              }}
            >
              <MoreTimeIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {stats.completionRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tasa de éxito
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Historial */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight={700}>
            Historial de Completados
          </Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          {completionHistory.length > 0 ? (
            <List disablePadding>
              {completionHistory.slice(0, 10).map((entry, index) => (
                <Box key={entry.date}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={formatFullDate(entry.date)}
                      secondary={entry.completedAt ? `Completado a las ${formatTime(entry.completedAt)}` : null}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  {index < Math.min(completionHistory.length, 10) - 1 && (
                    <Divider component="li" />
                  )}
                </Box>
              ))}

              {completionHistory.length > 10 && (
                <Box textAlign="center" mt={1.5} mb={0.5}>
                  <Chip
                    label={`+ ${completionHistory.length - 10} más`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              )}
            </List>
          ) : (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="text.secondary">
                Aún no hay registros de completado
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default HabitDetail;
