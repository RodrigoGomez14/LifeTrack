import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Button, 
  TextField, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider,
  Container,
  Stack,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  Snackbar,
  AlertTitle,
  Slide,
  Chip,
  Avatar
} from '@mui/material';
import { database, auth } from '../../firebase';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useStore } from '../../store'; 
import { useTheme } from '@mui/material/styles';
import { getMonthName } from '../../utils';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoIcon from '@mui/icons-material/Info';
import VisaIcon from '../../components/icons/VisaIcon';
import MastercardIcon from '../../components/icons/MastercardIcon';
import AmexIcon from '../../components/icons/AmexIcon';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Configurar dayjs para usar español globalmente
dayjs.locale('es');

const UpdateCardDates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();
  const theme = useTheme();
  const { cardId } = useParams();
  
  // Obtener mes y año de los parámetros de la URL
  const searchParams = new URLSearchParams(location.search);
  const urlMonth = searchParams.get('month');
  const urlYear = searchParams.get('year');
  
  // Estados para el componente
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Estados para los campos del formulario con valores iniciales de la URL o valores actuales
  const [selectedYear, setSelectedYear] = useState(
    urlYear ? parseInt(urlYear, 10) : new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    urlMonth ? parseInt(urlMonth, 10) : new Date().getMonth() + 1
  );
  const [closingDate, setClosingDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Generar array de años disponibles (desde el año actual hasta 2 años en adelante)
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() + i - 2
  );
  
  // Generar array de meses
  const months = Array.from(
    { length: 12 }, 
    (_, i) => ({ value: i + 1, label: getMonthName(i + 1) })
  );
  
  // Función para verificar si una fecha está fuera del límite permitido (1 mes)
  const isDateBeyondLimit = (date) => {
    const checkDate = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    // No restringir fechas pasadas
    if (checkDate <= today) {
      return false;
    }
    
    const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
    const currentYear = today.getFullYear();
    
    // Mes y año de la fecha a comprobar
    const checkMonth = checkDate.getMonth() + 1; // Convertir a formato 1-12
    const checkYear = checkDate.getFullYear();
    
    // Calcular el mes límite (puede ser en el año siguiente)
    let limitMonth = currentMonth + 1; // Límite de 1 mes
    let limitYear = currentYear;
    
    // Ajustar si el mes límite se extiende al año siguiente
    if (limitMonth > 12) {
      limitYear += 1;
      limitMonth = limitMonth % 12;
      if (limitMonth === 0) {
        limitMonth = 12;
      }
    }
    
    // Comparar años primero
    if (checkYear > limitYear) return true;
    if (checkYear < limitYear) return false;
    
    // Si estamos en el mismo año, comparar meses
    return checkMonth > limitMonth;
  };

  // Función para verificar si un mes ya tiene fechas configuradas (tanto cierre como vencimiento)
  const isMonthAlreadyConfigured = (year, month) => {
    if (!card || !card.dates) return false;
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    // Verificar si existen ambas fechas para este mes
    return card.dates[monthKey] && 
      card.dates[monthKey].closingDate && 
      card.dates[monthKey].dueDate &&
      // Excluir el mes actual que estamos editando
      !(selectedYear === year && selectedMonth === month);
  };

  // Función para determinar si una fecha debe ser deshabilitada
  const shouldDisableClosingDate = (date) => {
    const jsDate = date.toDate();
    return isDateBeyondLimit(jsDate);
  };

  // Función para determinar si una fecha debe ser deshabilitada para vencimiento
  // El vencimiento puede ser posterior al cierre, generalmente en el mes siguiente
  const shouldDisableDueDate = (date) => {
    const jsDate = date.toDate();
    
    // Si no hay fecha de cierre seleccionada, solo aplicar el límite de 3 meses
    if (!closingDate) return isDateBeyondLimit(jsDate);
    
    // Si hay fecha de cierre, la fecha de vencimiento debe ser posterior a ésta
    const closingDateObj = new Date(closingDate);
    return jsDate < closingDateObj || isDateBeyondLimit(jsDate);
  };
  
  // Extraer el ID de la tarjeta de la URL
  useEffect(() => {
    if (!cardId) {
      setError('No se especificó una tarjeta para actualizar');
      setNotFound(true);
      setLoading(false);
    }
  }, [cardId]);
  
  // Cargar datos de la tarjeta seleccionada
  useEffect(() => {
    if (cardId && userData && userData.creditCards) {
      const cardData = userData.creditCards[cardId];
      if (cardData) {
        setCard(cardData);
        
        // Consultar las fechas para el mes y año seleccionados
        const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        if (cardData.dates && cardData.dates[monthKey]) {
          const monthData = cardData.dates[monthKey];
          
          if (monthData.closingDate) {
            setClosingDate(monthData.closingDate);
          } else if (cardData.defaultClosingDay) {
            // Si no hay fecha de cierre configurada, usar el día por defecto con el mes y año seleccionados
            const day = String(cardData.defaultClosingDay).padStart(2, '0');
            setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
          } else {
            setClosingDate('');
          }
          
          if (monthData.dueDate) {
            setDueDate(monthData.dueDate);
          } else if (cardData.defaultDueDay) {
            // Para la fecha de vencimiento, calcular con el mes siguiente
            let dueYear = selectedYear;
            let dueMonth = selectedMonth;
            
            if (selectedMonth === 12) {
              dueMonth = 1;
              dueYear = selectedYear + 1;
            } else {
              dueMonth = selectedMonth + 1;
            }
            
            const day = String(cardData.defaultDueDay).padStart(2, '0');
            setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
          } else {
            setDueDate('');
          }
        } else {
          // No hay fechas para este mes, usar valores por defecto
          if (cardData.defaultClosingDay) {
            const day = String(cardData.defaultClosingDay).padStart(2, '0');
            setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
          } else {
            setClosingDate('');
          }
          
          if (cardData.defaultDueDay) {
            let dueYear = selectedYear;
            let dueMonth = selectedMonth;
            
            if (selectedMonth === 12) {
              dueMonth = 1;
              dueYear = selectedYear + 1;
            } else {
              dueMonth = selectedMonth + 1;
            }
            
            const day = String(cardData.defaultDueDay).padStart(2, '0');
            setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
          } else {
            setDueDate('');
          }
        }
      } else {
        setError('La tarjeta especificada no existe');
      }
      setLoading(false);
    }
  }, [cardId, userData, selectedYear, selectedMonth]);
  
  // Manejar cambios en mes/año seleccionado
  useEffect(() => {
    if (card && card.dates && 
        card.dates[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`]) {
      const monthData = card.dates[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`];
      
      // Comprobar si las fechas ya son strings con formato YYYY-MM-DD
      if (monthData.closingDate) {
        if (typeof monthData.closingDate === 'string' && monthData.closingDate.includes('-')) {
          // Ya es una fecha en formato YYYY-MM-DD
          setClosingDate(monthData.closingDate);
        } else {
          // Es solo un número de día, convertirlo a formato YYYY-MM-DD
          const day = String(monthData.closingDate).padStart(2, '0');
          setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
        }
      } else {
        // Si no hay fecha de cierre configurada y existe un valor por defecto
        if (card.defaultClosingDay) {
          const day = String(card.defaultClosingDay).padStart(2, '0');
          setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
        } else {
          setClosingDate('');
        }
      }
      
      if (monthData.dueDate) {
        if (typeof monthData.dueDate === 'string' && monthData.dueDate.includes('-')) {
          // Ya es una fecha en formato YYYY-MM-DD
          setDueDate(monthData.dueDate);
        } else {
          // Es solo un número de día, calculamos el mes de vencimiento (normalmente el siguiente)
          let dueYear = selectedYear;
          let dueMonth = selectedMonth;
          
          // Si es diciembre, la fecha de vencimiento es en enero del siguiente año
          if (selectedMonth === 12) {
            dueMonth = 1;
            dueYear = selectedYear + 1;
          } else {
            dueMonth = selectedMonth + 1;
          }
          
          const day = String(monthData.dueDate).padStart(2, '0');
          setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
        }
      } else {
        // Si no hay fecha de vencimiento configurada y existe un valor por defecto
        if (card.defaultDueDay) {
          // El vencimiento suele ser en el mes siguiente
          let dueYear = selectedYear;
          let dueMonth = selectedMonth;
          
          if (selectedMonth === 12) {
            dueMonth = 1;
            dueYear = selectedYear + 1;
          } else {
            dueMonth = selectedMonth + 1;
          }
          
          const day = String(card.defaultDueDay).padStart(2, '0');
          setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
        } else {
          setDueDate('');
        }
      }
    } else if (card) {
      // Si no hay datos para ese mes, usar los valores por defecto
      if (card.defaultClosingDay) {
        const day = String(card.defaultClosingDay).padStart(2, '0');
        setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
      } else {
        setClosingDate('');
      }
      
      if (card.defaultDueDay) {
        // El vencimiento suele ser en el mes siguiente
        let dueYear = selectedYear;
        let dueMonth = selectedMonth;
        
        if (selectedMonth === 12) {
          dueMonth = 1;
          dueYear = selectedYear + 1;
        } else {
          dueMonth = selectedMonth + 1;
        }
        
        const day = String(card.defaultDueDay).padStart(2, '0');
        setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
      } else {
        setDueDate('');
      }
    }
  }, [card, selectedYear, selectedMonth]);
  
  // Función para crear un objeto dayjs a partir del día seleccionado
  const createDateFromDay = (day, month, year) => {
    if (!day) return null;
    return dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };

  // Función para manejar el cambio de fecha de cierre
  const handleClosingDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el día
      const formattedDate = date.format('YYYY-MM-DD');
      setClosingDate(formattedDate);
    }
  };

  // Función para manejar el cambio de fecha de vencimiento
  const handleDueDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el día
      const formattedDate = date.format('YYYY-MM-DD');
      setDueDate(formattedDate);
    }
  };
  
  // Validación de campos básica
  const validateInputs = () => {
    const newErrors = {
      closingDate: !closingDate,
      dueDate: !dueDate
    };
    
    setError(newErrors.closingDate ? 'Por favor selecciona una fecha de cierre válida' : '');
    setError(newErrors.dueDate ? 'Por favor selecciona una fecha de vencimiento válida' : '');
    
    return !Object.values(newErrors).some(error => error);
  };
  
  // Calcular fecha específica dado un año, mes y día
  const calculateDate = (year, month, day) => {
    // Ajustar para evitar fechas inválidas (ej. 31 de abril)
    const date = new Date(year, month - 1, day);
    
    // Si el día resultante es diferente al solicitado, ajustar al último día del mes
    if (date.getDate() !== day) {
      // Establecer al último día del mes
      date.setDate(0);
    }
    
    return date;
  };
  
  // Función para actualizar las fechas de la tarjeta en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      
      // Actualizar las fechas en Firebase (ahora como fechas completas)
      await database.ref(`${auth.currentUser.uid}/creditCards/${cardId}/dates/${monthKey}`).update({
        closingDate: closingDate,
        dueDate: dueDate
      });
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Redirigir al usuario a la página de tarjetas después de 1.5 segundos
      setTimeout(() => {
        navigate('/TarjetasCredito');
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar las fechas:', error);
      setError('Error al actualizar las fechas. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };
  
  // Ir atrás
  const handleBack = () => {
    navigate(`/TarjetasCredito`);
  };
  
  // Obtener icono según el tipo de tarjeta
  const getCardIcon = (cardType) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return <VisaIcon />;
      case 'mastercard':
        return <MastercardIcon />;
      case 'amex':
      case 'american express':
        return <AmexIcon />;
      default:
        return <CreditCardIcon />;
    }
  };
  
  if (loading && !card) {
    return (
      <Layout title="Actualizar Fechas">
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" color="primary" fontWeight="medium">
            Cargando información de tarjeta...
          </Typography>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Actualizar Fechas">
      <Box 
        sx={{ 
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          pt: 0,
          pb: 4,
          margin: 0,
          maxWidth: 'none',
          bgcolor: '#02a597', // Color de fondo turquesa como se ve en la imagen
        }}
      >
        {/* Panel principal con información y controles */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: { xs: 0, sm: '0 0 20px 20px' },
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: {
              xs: 56, 
              sm: 64  
            },
            zIndex: 10,
            border: 'none',
            bgcolor: '#343434', // Fondo oscuro para la tarjeta
          }}
        >
          {/* Cabecera del panel */}
          <Box
            sx={{
              bgcolor: '#474bc2', // Color azul-violeta como en la imagen
              py: 2,
              px: { xs: 2, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CreditCardIcon />
              <Typography variant="h6" fontWeight="bold">
                {card?.name || 'Tarjeta'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, ml: 1 }}>
                **** {card?.lastFourDigits || ''}
              </Typography>
            </Box>
            
            <IconButton 
              size="small" 
              sx={{ color: 'white' }}
              onClick={handleBack}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          
          {card && (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: '#343434', // Fondo oscuro para la tarjeta
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'flex-end',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: 'white', mr: 1 }} />
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="medium" 
                    color="white"
                  >
                    Configura para:
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 1,
                      color: 'white',
                      '& .MuiSelect-icon': { color: 'white' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { maxHeight: 300, borderRadius: 1 }
                      }
                    }}
                    displayEmpty
                    renderValue={(selected) => selected ? getMonthName(selected) : 'Mes'}
                  >
                    {months.map(month => {
                      const monthDate = new Date(selectedYear, month.value - 1, 1);
                      const isDisabled = isDateBeyondLimit(monthDate) || 
                                         isMonthAlreadyConfigured(selectedYear, month.value);
                      
                      return (
                        <MenuItem 
                          key={month.value} 
                          value={month.value}
                          disabled={isDisabled}
                          sx={{
                            opacity: isDisabled ? 0.5 : 1,
                            '&.Mui-disabled': {
                              color: 'text.disabled'
                            }
                          }}
                        >
                          {month.label}
                          {isMonthAlreadyConfigured(selectedYear, month.value) && 
                            <Chip 
                              size="small" 
                              label="Configurado" 
                              color="success" 
                              variant="outlined"
                              sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                            />
                          }
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 1,
                      color: 'white',
                      '& .MuiSelect-icon': { color: 'white' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                    }}
                    displayEmpty
                    renderValue={(selected) => selected || 'Año'}
                  >
                    {availableYears.map(year => {
                      const yearLimit = new Date();
                      yearLimit.setMonth(yearLimit.getMonth() + 3);
                      const isDisabled = year > yearLimit.getFullYear();
                      
                      return (
                        <MenuItem 
                          key={year} 
                          value={year}
                          disabled={isDisabled}
                          sx={{
                            opacity: isDisabled ? 0.5 : 1
                          }}
                        >
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* Contenido principal */}
        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 3 }, mt: 0 }}>
          {card && (
            <>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    height: '100%',
                    bgcolor: '#343434', // Color oscuro para tarjetas
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: '#5d9cec' }} fontSize="small" />
                    <Typography variant="h6" sx={{ color: '#5d9cec' }} fontWeight="bold">
                      Fecha de Cierre
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }}>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                      La fecha de cierre es cuando finaliza el período de facturación. 
                      Todas las compras posteriores se incluirán en el próximo mes.
                    </Typography>
                  </Box>
                  
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DatePicker
                      label="Seleccionar fecha de cierre"
                      value={closingDate ? dayjs(closingDate) : null}
                      onChange={handleClosingDateChange}
                      views={['year', 'month', 'day']}
                      format="DD/MM/YYYY"
                      shouldDisableDate={shouldDisableClosingDate}
                      disableFuture={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !closingDate,
                          helperText: !closingDate ? 'Fecha requerida para continuar' : '',
                          margin: "normal",
                          sx: { 
                            mt: 1, 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'white',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputBase-input': {
                              color: 'white',
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'white',
                            },
                          },
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon fontSize="small" sx={{ color: '#5d9cec' }} />
                              </InputAdornment>
                            ),
                          }
                        },
                        day: {
                          sx: { 
                            '&.Mui-selected': {
                              bgcolor: '#5d9cec',
                              '&:hover': { bgcolor: '#4a8edb' }
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                  
                  {closingDate && (
                    <Box 
                      sx={{ 
                        mt: 3, 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: 'rgba(93, 156, 236, 0.2)',
                        border: '1px solid rgba(93, 156, 236, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CheckCircleIcon sx={{ color: '#5d9cec' }} fontSize="small" />
                      <Typography variant="body2" fontWeight="medium" color="white">
                        {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    height: '100%',
                    bgcolor: '#343434', // Color oscuro para tarjetas
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <PaymentIcon sx={{ color: '#f06292' }} fontSize="small" />
                    <Typography variant="h6" sx={{ color: '#f06292' }} fontWeight="bold">
                      Fecha de Vencimiento
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }}>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                      Es el día límite para realizar el pago de tu tarjeta.
                      Debes pagar antes de esta fecha para evitar intereses.
                    </Typography>
                  </Box>
                  
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DatePicker
                      label="Seleccionar fecha de vencimiento"
                      value={dueDate ? dayjs(dueDate) : null}
                      onChange={handleDueDateChange}
                      views={['year', 'month', 'day']}
                      format="DD/MM/YYYY"
                      shouldDisableDate={shouldDisableDueDate}
                      disableFuture={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !dueDate,
                          helperText: !dueDate ? 'Fecha requerida para continuar' : 'Selecciona una fecha posterior al cierre',
                          margin: "normal",
                          sx: { 
                            mt: 1, 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'white',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputBase-input': {
                              color: 'white',
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'white',
                            },
                          },
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PaymentIcon fontSize="small" sx={{ color: '#f06292' }} />
                              </InputAdornment>
                            ),
                          }
                        },
                        day: {
                          sx: { 
                            '&.Mui-selected': {
                              bgcolor: '#f06292',
                              '&:hover': { bgcolor: '#e45884' }
                            }
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                  
                  {dueDate && (
                    <Box 
                      sx={{ 
                        mt: 3, 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: 'rgba(240, 98, 146, 0.2)',
                        border: '1px solid rgba(240, 98, 146, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CheckCircleIcon sx={{ color: '#f06292' }} fontSize="small" />
                      <Typography variant="body2" fontWeight="medium" color="white">
                        {dayjs(dueDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <InfoIcon sx={{ color: 'white' }} fontSize="small" />
                  <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                    Solo puedes configurar fechas hasta un máximo de 1 mes en el futuro. 
                    Los meses ya configurados se muestran como deshabilitados.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 2,
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ 
                      borderRadius: 1,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 'medium',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving || !closingDate || !dueDate}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ 
                      borderRadius: 1,
                      px: 4,
                      py: 1.2,
                      bgcolor: '#474bc2', // Color del botón como la barra superior
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#3a3ea6',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(71, 75, 194, 0.5)'
                      }
                    }}
                  >
                    {saving ? 'Guardando...' : 'Guardar Fechas'}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="success" 
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{ 
            minWidth: 280,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            '& .MuiAlert-icon': {
              fontSize: 28,
              opacity: 0.9
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>¡Cambios guardados!</AlertTitle>
          Fechas de tarjeta actualizadas correctamente
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default UpdateCardDates; 