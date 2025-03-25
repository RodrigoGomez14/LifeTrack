import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
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
  Paper,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RepeatIcon from '@mui/icons-material/Repeat';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreTimeIcon from '@mui/icons-material/MoreTime';

const HabitDetail = ({ habitId, onBack }) => {
  const { userData } = useStore();
  const [habit, setHabit] = useState(null);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [stats, setStats] = useState({ 
    totalCompleted: 0, 
    completionRate: 0, 
    currentStreak: 0, 
    longestStreak: 0 
  });
  
  const theme = useTheme();
  
  useEffect(() => {
    if (userData && userData.habits && habitId && userData.habits[habitId]) {
      const habitData = { ...userData.habits[habitId], id: habitId };
      setHabit(habitData);
      
      // Cargar historial de completado
      if (userData.habits.completed) {
        const history = [];
        
        // Recorrer todas las fechas en las que hay registros
        Object.keys(userData.habits.completed).forEach(dateStr => {
          const dateCompletions = userData.habits.completed[dateStr];
          
          // Si este hábito está marcado como completado en esta fecha
          if (dateCompletions[habitId]) {
            history.push({
              date: dateStr,
              completed: true,
              completedAt: dateCompletions[habitId].completedAt
            });
          }
        });
        
        // Ordenar el historial por fecha (más reciente primero)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        setCompletionHistory(history);
        
        // Calcular estadísticas
        calculateStats(history, habitData);
      }
    }
  }, [userData, habitId]);
  
  // Calcular estadísticas del hábito
  const calculateStats = (history, habitData) => {
    const totalCompleted = history.length;
    
    // Calcular racha actual
    let currentStreak = 0;
    let previousDate = null;
    let longestStreak = habitData.streak || 0;
    
    // Ordenar historia por fecha (más reciente primero)
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calcular la racha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const completionDate = new Date(sortedHistory[i].date);
      
      // Si es la primera entrada, verificar si es hoy o ayer
      if (i === 0) {
        if (completionDate.getTime() === today.getTime() || 
            completionDate.getTime() === yesterday.getTime()) {
          currentStreak = 1;
          previousDate = completionDate;
        } else {
          // Si la última vez que se completó no fue hoy ni ayer, no hay racha actual
          break;
        }
      } else {
        // Para el resto de entradas, verificar si son días consecutivos
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
    
    // Calcular tasa de finalización (completados / días desde creación)
    const creationDate = habitData.createdAt ? new Date(habitData.createdAt) : new Date();
    const daysSinceCreation = Math.max(1, Math.floor((today - creationDate) / (1000 * 60 * 60 * 24)));
    const completionRate = Math.round((totalCompleted / daysSinceCreation) * 100);
    
    setStats({
      totalCompleted,
      completionRate,
      currentStreak,
      longestStreak
    });
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Formatear hora para mostrar
  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Obtener texto para la frecuencia
  const getFrequencyText = (frequency, customDays) => {
    switch (frequency) {
      case 'daily':
        return 'Todos los días';
      case 'weekdays':
        return 'Días laborables (Lun-Vie)';
      case 'weekends':
        return 'Fines de semana (Sáb-Dom)';
      case 'custom':
        if (customDays && customDays.length > 0) {
          const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const selectedDays = customDays.map(day => days[day]).join(', ');
          return `Personalizado: ${selectedDays}`;
        }
        return 'Personalizado';
      default:
        return 'No especificada';
    }
  };
  
  if (!habit) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          Cargando información del hábito...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Card elevation={3}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <IconButton 
                onClick={onBack} 
                sx={{ mr: 1 }}
                size="small"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">{habit.name}</Typography>
            </Box>
            <Button
              component={Link}
              to={`/EditarHabito?id=${habitId}`}
              startIcon={<EditIcon />}
              size="small"
              variant="outlined"
            >
              Editar
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Información general */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Información del Hábito
              </Typography>
              
              {habit.description && (
                <Typography variant="body2" paragraph>
                  {habit.description}
                </Typography>
              )}
              
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <RepeatIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Frecuencia" 
                    secondary={getFrequencyText(habit.frequency, habit.customDays)} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                
                {habit.reminder && (
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ScheduleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Recordatorio" 
                      secondary={habit.reminderTime || 'Activado'} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
                
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarMonthIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Creado" 
                    secondary={habit.createdAt ? formatDate(habit.createdAt) : 'Desconocido'} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Estadísticas */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Estadísticas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        margin: '0 auto',
                        width: 48,
                        height: 48,
                        mb: 1
                      }}
                    >
                      <CheckCircleIcon />
                    </Avatar>
                    <Typography variant="h5">{stats.totalCompleted}</Typography>
                    <Typography variant="body2" color="textSecondary">Completados</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.secondary.main, 
                        margin: '0 auto',
                        width: 48,
                        height: 48,
                        mb: 1
                      }}
                    >
                      <LocalFireDepartmentIcon />
                    </Avatar>
                    <Typography variant="h5">{stats.currentStreak}</Typography>
                    <Typography variant="body2" color="textSecondary">Racha actual</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.warning.main, 
                        margin: '0 auto',
                        width: 48,
                        height: 48,
                        mb: 1
                      }}
                    >
                      <EmojiEventsIcon />
                    </Avatar>
                    <Typography variant="h5">{stats.longestStreak}</Typography>
                    <Typography variant="body2" color="textSecondary">Racha más larga</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Box position="relative" display="inline-block" mb={1}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.info.main, 
                          margin: '0 auto',
                          width: 48,
                          height: 48
                        }}
                      >
                        <MoreTimeIcon />
                      </Avatar>
                      <Box position="absolute" bottom={0} right={0} width="100%" height="100%">
                        <Box 
                          position="absolute" 
                          bottom={0} 
                          width="100%" 
                          height={`${stats.completionRate}%`} 
                          bgcolor={`${theme.palette.info.main}50`}
                          borderRadius={1}
                        />
                      </Box>
                    </Box>
                    <Typography variant="h5">{stats.completionRate}%</Typography>
                    <Typography variant="body2" color="textSecondary">Tasa de éxito</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Historial de completados */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Historial de Completados
              </Typography>
              
              {completionHistory.length > 0 ? (
                <List disablePadding>
                  {completionHistory.slice(0, 10).map((entry, index) => (
                    <React.Fragment key={entry.date}>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={formatDate(entry.date)} 
                          secondary={entry.completedAt ? `Completado a las ${formatTime(entry.completedAt)}` : null}
                        />
                      </ListItem>
                      {index < completionHistory.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                  
                  {completionHistory.length > 10 && (
                    <Box textAlign="center" mt={2}>
                      <Chip 
                        label={`+ ${completionHistory.length - 10} más`} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                  )}
                </List>
              ) : (
                <Box textAlign="center" py={2}>
                  <Typography variant="body2" color="textSecondary">
                    Aún no hay registros de completado para este hábito
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HabitDetail; 