import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Typography, 
  TextField, 
  Stack,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Select,
  MenuItem,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { database, auth } from '../../firebase';
import { useStore } from '../../store';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

const NewHabit = () => {
  const navigate = useNavigate();
  const { userData } = useStore();
  const theme = useTheme();
  
  // Estado para el formulario de múltiples pasos
  const [step, setStep] = useState(1);
  
  // Estados para los campos del hábito
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState([]);
  const [monthlyDays, setMonthlyDays] = useState([]);
  const [yearlyMonths, setYearlyMonths] = useState([]);
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [color, setColor] = useState('primary');
  
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

  // Opciones para los días del mes
  const monthDays = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `Día ${i + 1}`
  }));

  // Opciones para los meses del año
  const yearMonths = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];
  
  // Opciones para colores
  const colorOptions = [
    { value: 'primary', label: 'Azul', hex: '#1976d2' },
    { value: 'secondary', label: 'Verde', hex: '#2e7d32' },
    { value: 'error', label: 'Rojo', hex: '#d32f2f' },
    { value: 'warning', label: 'Naranja', hex: '#ed6c02' },
    { value: 'info', label: 'Celeste', hex: '#0288d1' }
  ];
  
  // Manejar cambio en los días personalizados
  const handleDayToggle = (day) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  // Manejar cambio en los días del mes
  const handleMonthlyDayToggle = (day) => {
    if (monthlyDays.includes(day)) {
      setMonthlyDays(monthlyDays.filter(d => d !== day));
    } else {
      setMonthlyDays([...monthlyDays, day]);
    }
  };

  // Manejar cambio en los meses del año
  const handleYearlyMonthToggle = (month) => {
    if (yearlyMonths.includes(month)) {
      setYearlyMonths(yearlyMonths.filter(m => m !== month));
    } else {
      setYearlyMonths([...yearlyMonths, month]);
    }
  };
  
  // Determinar si el formulario es válido
  const isFormValid = () => {
    if (!name.trim()) return false;
    if (frequency === 'custom' && customDays.length === 0) return false;
    if (frequency === 'monthly' && monthlyDays.length === 0) return false;
    if (frequency === 'yearly' && yearlyMonths.length === 0) return false;
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
      monthlyDays: frequency === 'monthly' ? monthlyDays : [],
      yearlyMonths: frequency === 'yearly' ? yearlyMonths : [],
      reminder,
      reminderTime: reminder ? reminderTime : null,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0
    };
    
    database.ref(`${auth.currentUser.uid}/habits`).push(habitData)
      .then(() => {
        navigate('/Habitos');
      })
      .catch(error => {
        console.error('Error al crear hábito:', error);
      });
  };
  
  // Avanzar o retroceder pasos en el formulario
  const handleStepChange = (direction) => {
    if (direction === 'back') {
      if (step === 1) {
        navigate('/Habitos');
      } else {
        setStep(step - 1);
      }
    } else if (direction === 'next') {
      if (step < 4) {
        setStep(step + 1);
      } else {
        saveHabit();
      }
    }
  };
  
  // Obtener color según la selección
  const getColorObject = (colorValue) => {
    return colorOptions.find(option => option.value === colorValue) || colorOptions[0];
  };
  
  // Renderizado del paso 1: Información básica
  const renderStep1 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ¿Qué hábito deseas crear?
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Los buenos hábitos son la clave para alcanzar tus metas. Define el tuyo.
      </Typography>
      
      <Card 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          mt: 2
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: theme.palette.primary.main
          }}
        />
        
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Nombre del hábito
            </Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="Ej: Beber agua, Meditar, Leer..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="h6" color="primary">
                      <DescriptionIcon />
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Descripción (opcional)
            </Typography>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe este hábito y por qué es importante para ti"
              variant="outlined"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
        </Stack>
      </Card>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleStepChange('next')}
          disabled={!name.trim()}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
  
  // Renderizado del paso 2: Frecuencia
  const renderStep2 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ¿Con qué frecuencia realizarás este hábito?
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<DescriptionIcon />}
            label={name}
            sx={{ 
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              height: 32
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Define la frecuencia para tu seguimiento
          </Typography>
        </Stack>
      </Box>
      
      <Card 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: theme.palette.primary.main
          }}
        />
        
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend" sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 2 }}>
            Selecciona la frecuencia
          </FormLabel>
          
          <Stack spacing={2}>
            {[
              { value: 'daily', label: 'Diario', description: 'Todos los días de la semana' },
              { value: 'weekdays', label: 'Días laborables', description: 'De lunes a viernes' },
              { value: 'weekends', label: 'Fines de semana', description: 'Sábados y domingos' },
              { value: 'custom', label: 'Semanal', description: 'Selecciona días específicos de la semana' },
              { value: 'monthly', label: 'Mensual', description: 'Una o varias veces al mes' },
              { value: 'yearly', label: 'Anual', description: 'Una o varias veces al año' }
            ].map((option) => (
              <Card
                key={option.value}
                elevation={frequency === option.value ? 3 : 1}
                onClick={() => setFrequency(option.value)}
                sx={{ 
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  transform: frequency === option.value ? 'scale(1.02)' : 'scale(1)',
                  border: `2px solid ${frequency === option.value ? theme.palette.primary.main : 'transparent'}`,
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: '50%',
                        p: 1.5,
                        color: theme.palette.primary.main
                      }}
                    >
                      <RepeatIcon fontSize="large" />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                    <Radio 
                      checked={frequency === option.value}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        }
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </FormControl>
      </Card>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleStepChange('next')}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
  
  // Renderizado del paso 3: Días personalizados (si aplica) y recordatorio
  const renderStep3 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Personaliza tu hábito
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<DescriptionIcon />}
            label={name}
            sx={{ 
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              height: 32
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            icon={<RepeatIcon />}
            label={frequency === 'daily' ? 'Diario' : 
                  frequency === 'weekdays' ? 'Días laborables' : 
                  frequency === 'weekends' ? 'Fines de semana' : 
                  frequency === 'monthly' ? 'Mensual' :
                  frequency === 'yearly' ? 'Anual' : 'Semanal'}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              height: 32
            }}
          />
        </Stack>
      </Box>
      
      <Card 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: theme.palette.primary.main
          }}
        />
        
        <Stack spacing={4}>
          {/* Días personalizados - solo mostrar si la frecuencia es personalizada */}
          {frequency === 'custom' && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selecciona los días de la semana
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Elige en qué días de la semana realizarás este hábito
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {weekdays.map((day) => (
                  <Chip
                    key={day.value}
                    label={day.label}
                    onClick={() => handleDayToggle(day.value)}
                    color={customDays.includes(day.value) ? 'primary' : 'default'}
                    variant={customDays.includes(day.value) ? 'filled' : 'outlined'}
                    sx={{ 
                      mb: 1,
                      borderWidth: 2,
                      fontWeight: customDays.includes(day.value) ? 'bold' : 'normal',
                      '&:hover': {
                        borderWidth: 2,
                        opacity: 0.9
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Días mensuales - solo mostrar si la frecuencia es mensual */}
          {frequency === 'monthly' && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selecciona los días del mes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Elige en qué días del mes realizarás este hábito (por ejemplo, el día 1, el día 15, etc.)
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {monthDays.map((day) => (
                  <Chip
                    key={day.value}
                    label={day.value}
                    onClick={() => handleMonthlyDayToggle(day.value)}
                    color={monthlyDays.includes(day.value) ? 'primary' : 'default'}
                    variant={monthlyDays.includes(day.value) ? 'filled' : 'outlined'}
                    sx={{ 
                      mb: 1,
                      borderWidth: 2,
                      fontWeight: monthlyDays.includes(day.value) ? 'bold' : 'normal',
                      '&:hover': {
                        borderWidth: 2,
                        opacity: 0.9
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Meses anuales - solo mostrar si la frecuencia es anual */}
          {frequency === 'yearly' && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Selecciona los meses del año
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Elige en qué meses del año realizarás este hábito
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {yearMonths.map((month) => (
                  <Chip
                    key={month.value}
                    label={month.label}
                    onClick={() => handleYearlyMonthToggle(month.value)}
                    color={yearlyMonths.includes(month.value) ? 'primary' : 'default'}
                    variant={yearlyMonths.includes(month.value) ? 'filled' : 'outlined'}
                    sx={{ 
                      mb: 1,
                      borderWidth: 2,
                      fontWeight: yearlyMonths.includes(month.value) ? 'bold' : 'normal',
                      '&:hover': {
                        borderWidth: 2,
                        opacity: 0.9
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          {/* Recordatorio */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Recordatorio
            </Typography>
            
            <Card
              elevation={reminder ? 3 : 1}
              onClick={() => setReminder(!reminder)}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: reminder ? 'scale(1.02)' : 'scale(1)',
                border: `2px solid ${reminder ? theme.palette.primary.main : 'transparent'}`,
                mb: 2,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: '50%',
                      p: 1.5,
                      color: theme.palette.primary.main
                    }}
                  >
                    <NotificationsActiveIcon fontSize="large" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      Activar recordatorio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recibe notificaciones para no olvidar este hábito
                    </Typography>
                  </Box>
                  <Radio 
                    checked={reminder}
                    sx={{ 
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
            
            {reminder && (
              <Card
                elevation={1}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px dashed ${theme.palette.primary.main}`
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Hora del recordatorio
                </Typography>
                <TextField
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Card>
            )}
          </Box>
        </Stack>
      </Card>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleStepChange('next')}
          disabled={(frequency === 'custom' && customDays.length === 0) || 
                   (frequency === 'monthly' && monthlyDays.length === 0) ||
                   (frequency === 'yearly' && yearlyMonths.length === 0)}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
  
  // Renderizado del paso 4: Color y Confirmación
  const renderStep4 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Finaliza la creación
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<DescriptionIcon />}
            label={name}
            sx={{ 
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              height: 32,
              mb: 1
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            icon={<RepeatIcon />}
            label={frequency === 'daily' ? 'Diario' : 
                  frequency === 'weekdays' ? 'Días laborables' : 
                  frequency === 'weekends' ? 'Fines de semana' : 
                  frequency === 'monthly' ? 'Mensual' :
                  frequency === 'yearly' ? 'Anual' : 'Semanal'}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 'medium',
              height: 32,
              mb: 1
            }}
          />
          {reminder && (
            <>
              <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              <Chip
                icon={<NotificationsActiveIcon />}
                label={`Recordatorio: ${reminderTime}`}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 'medium',
                  height: 32,
                  mb: 1
                }}
              />
            </>
          )}
        </Stack>
      </Box>
      
      <Card 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: theme.palette.primary.main
          }}
        />
        
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Elige un color para identificar tu hábito
          </Typography>
          
          <Stack spacing={2}>
            {colorOptions.map((option) => (
              <Card
                key={option.value}
                elevation={color === option.value ? 3 : 1}
                onClick={() => setColor(option.value)}
                sx={{ 
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  transform: color === option.value ? 'scale(1.02)' : 'scale(1)',
                  border: `2px solid ${color === option.value ? option.hex : 'transparent'}`,
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                      sx={{ 
                        bgcolor: alpha(option.hex, 0.2),
                        borderRadius: '50%',
                        p: 1.5,
                        color: option.hex
                      }}
                    >
                      <FormatPaintIcon fontSize="large" />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Para identificar visualmente tu hábito
                      </Typography>
                    </Box>
                    <Radio 
                      checked={color === option.value}
                      sx={{ 
                        color: option.hex,
                        '&.Mui-checked': {
                          color: option.hex
                        }
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Resumen
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Nombre:</Typography>
              <Typography variant="body2" fontWeight="medium">{name}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Frecuencia:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {frequency === 'daily' ? 'Diario' : 
                 frequency === 'weekdays' ? 'Días laborables' : 
                 frequency === 'weekends' ? 'Fines de semana' : 
                 frequency === 'monthly' ? 'Mensual' :
                 frequency === 'yearly' ? 'Anual' : 'Semanal'}
              </Typography>
            </Stack>

            {frequency === 'custom' && (
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">Días:</Typography>
                <Box textAlign="right">
                  {customDays.sort().map(day => (
                    <Typography key={day} variant="body2" fontWeight="medium">
                      {weekdays.find(d => d.value === day)?.label}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            )}

            {frequency === 'monthly' && (
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">Días del mes:</Typography>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight="medium">
                    {monthlyDays.sort((a, b) => a - b).join(', ')}
                  </Typography>
                </Box>
              </Stack>
            )}

            {frequency === 'yearly' && (
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="body2" color="text.secondary">Meses:</Typography>
                <Box textAlign="right">
                  {yearlyMonths.sort((a, b) => a - b).map(month => (
                    <Typography key={month} variant="body2" fontWeight="medium">
                      {yearMonths.find(m => m.value === month)?.label}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Recordatorio:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {reminder ? `Activado (${reminderTime})` : 'Desactivado'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Color:</Typography>
              <Box display="flex" alignItems="center">
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: `${getColorObject(color).value}.main`,
                    mr: 1 
                  }} 
                />
                <Typography variant="body2" fontWeight="medium">
                  {getColorObject(color).label}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Card>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={() => handleStepChange('next')}
          endIcon={<CheckCircleIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Crear Hábito
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Layout title="Crear Nuevo Hábito">
      <Box 
        sx={{ 
          minHeight: '100vh',
          pt: 8,
          pb: 4,
          px: 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth={false} sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Panel de progreso */}
          <Card 
            elevation={4} 
            sx={{ 
              width: '100%',
              bgcolor: 'background.paper',
              borderRadius: 3
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Nuevo Hábito
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Completa los siguientes pasos para crear tu nuevo hábito
              </Typography>
              
              <Stack direction="row" spacing={2} mt={4} sx={{ overflowX: 'auto', pb: 1 }}>
                {[
                  { label: 'Información', icon: <DescriptionIcon /> },
                  { label: 'Frecuencia', icon: <RepeatIcon /> },
                  { label: 'Personalización', icon: <NotificationsActiveIcon /> },
                  { label: 'Finalizar', icon: <FormatPaintIcon /> }
                ].map((item, index) => (
                  <Box 
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: step === index + 1 ? 'primary.main' : 'transparent',
                      color: step === index + 1 ? 'white' : 'text.primary',
                      border: `1px solid ${step === index + 1 ? 'transparent' : theme.palette.divider}`,
                      opacity: step >= index + 1 ? 1 : 0.5,
                      minWidth: 'fit-content'
                    }}
                  >
                    {React.cloneElement(item.icon, { 
                      style: { 
                        color: step === index + 1 ? 'white' : theme.palette.text.secondary 
                      }
                    })}
                    <Typography variant="body1" fontWeight={step === index + 1 ? 'bold' : 'regular'}>
                      {item.label}
                    </Typography>
                    {step > index + 1 && (
                      <CheckCircleIcon sx={{ ml: 'auto', color: theme.palette.success.main }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Card>
          
          {/* Panel principal */}
          <Card 
            elevation={4} 
            sx={{ 
              flex: 1,
              bgcolor: 'background.paper',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minHeight: 0
            }}
          >
            <Box sx={{ 
              p: 3,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
              },
            }}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </Box>
          </Card>
        </Container>
      </Box>
    </Layout>
  );
};

export default NewHabit; 