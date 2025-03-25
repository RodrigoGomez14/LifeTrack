import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormLabel, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Radio, 
  RadioGroup, 
  Select, 
  TextField, 
  Typography,
  Checkbox,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { database, auth } from '../../firebase';
import { useStore } from '../../store';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HabitForm = ({ habit = null, isEditing = false }) => {
  const navigate = useNavigate();
  const { userData } = useStore();
  
  // Estado para los campos del formulario
  const [name, setName] = useState(habit ? habit.name : '');
  const [description, setDescription] = useState(habit ? habit.description : '');
  const [frequency, setFrequency] = useState(habit ? habit.frequency : 'daily');
  const [customDays, setCustomDays] = useState(habit ? habit.customDays || [] : []);
  const [reminder, setReminder] = useState(habit ? habit.reminder : false);
  const [reminderTime, setReminderTime] = useState(habit ? habit.reminderTime : '08:00');
  const [color, setColor] = useState(habit ? habit.color : 'primary');
  
  // Opciones para los días de la semana
  const weekdays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];
  
  // Opciones para colores
  const colorOptions = [
    { value: 'primary', label: 'Azul' },
    { value: 'secondary', label: 'Verde' },
    { value: 'error', label: 'Rojo' },
    { value: 'warning', label: 'Naranja' },
    { value: 'info', label: 'Celeste' }
  ];
  
  // Manejar cambio en los días personalizados
  const handleDayToggle = (day) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };
  
  // Determinar si el formulario es válido
  const isFormValid = () => {
    if (!name.trim()) return false;
    if (frequency === 'custom' && customDays.length === 0) return false;
    return true;
  };
  
  // Guardar el hábito
  const saveHabit = () => {
    if (!isFormValid()) return;
    
    const habitData = {
      name,
      description,
      frequency,
      customDays: frequency === 'custom' ? customDays : [],
      reminder,
      reminderTime: reminder ? reminderTime : null,
      color,
      createdAt: habit ? habit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: habit ? habit.streak || 0 : 0
    };
    
    try {
      if (isEditing && habit) {
        // Actualizar hábito existente
        database.ref(`${auth.currentUser.uid}/habits/${habit.id}`).update(habitData)
          .then(() => {
            console.log('Hábito actualizado correctamente');
            navigate('/Habitos');
          })
          .catch(error => {
            console.error('Error al actualizar hábito:', error);
            alert('Error al actualizar hábito: ' + error.message);
          });
      } else {
        // Crear nuevo hábito
        database.ref(`${auth.currentUser.uid}/habits`).push(habitData)
          .then(() => {
            console.log('Hábito creado correctamente');
            navigate('/Habitos');
          })
          .catch(error => {
            console.error('Error al crear hábito:', error);
            alert('Error al crear hábito: ' + error.message);
          });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado: ' + error.message);
    }
  };
  
  // Eliminar el hábito
  const deleteHabit = () => {
    if (isEditing && habit) {
      if (window.confirm('¿Estás seguro de eliminar este hábito? Esta acción no se puede deshacer.')) {
        database.ref(`${auth.currentUser.uid}/habits/${habit.id}`).remove()
          .then(() => {
            navigate('/Habitos');
          })
          .catch(error => {
            console.error('Error al eliminar hábito:', error);
          });
      }
    }
  };
  
  // Cancelar y volver atrás
  const handleCancel = () => {
    navigate('/Habitos');
  };
  
  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">{isEditing ? 'Editar Hábito' : 'Nuevo Hábito'}</Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleCancel}
            size="small"
          >
            Volver
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Nombre del hábito */}
          <Grid item xs={12}>
            <TextField
              label="Nombre del hábito"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              placeholder="Ej: Beber agua, Meditar, Ejercicio..."
            />
          </Grid>
          
          {/* Descripción */}
          <Grid item xs={12}>
            <TextField
              label="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Describe este hábito y por qué es importante para ti"
            />
          </Grid>
          
          {/* Frecuencia */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel id="frequency-label">Frecuencia</FormLabel>
              <RadioGroup
                aria-labelledby="frequency-label"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Diario" />
                <FormControlLabel value="weekdays" control={<Radio />} label="Días laborables (Lun-Vie)" />
                <FormControlLabel value="weekends" control={<Radio />} label="Fines de semana (Sáb-Dom)" />
                <FormControlLabel value="custom" control={<Radio />} label="Personalizado" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          {/* Días personalizados */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: frequency === 'custom' ? 'block' : 'none' }}>
              <FormLabel>Selecciona los días</FormLabel>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {weekdays.map((day) => (
                  <Chip
                    key={day.value}
                    label={day.label}
                    onClick={() => handleDayToggle(day.value)}
                    color={customDays.includes(day.value) ? 'primary' : 'default'}
                    variant={customDays.includes(day.value) ? 'filled' : 'outlined'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
          
          {/* Recordatorio */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={reminder} 
                  onChange={(e) => setReminder(e.target.checked)} 
                />
              }
              label="Activar recordatorio"
            />
            
            {reminder && (
              <TextField
                label="Hora del recordatorio"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </Grid>
          
          {/* Color */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="color-label">Color</InputLabel>
              <Select
                labelId="color-label"
                value={color}
                label="Color"
                onChange={(e) => setColor(e.target.value)}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center">
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          bgcolor: `${option.value}.main`,
                          mr: 1 
                        }} 
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Botones de acción */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Box>
                {isEditing && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={deleteHabit}
                  >
                    Eliminar Hábito
                  </Button>
                )}
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ mr: 2 }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveHabit}
                  disabled={!isFormValid()}
                >
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HabitForm; 