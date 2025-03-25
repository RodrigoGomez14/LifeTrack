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
  Snackbar
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
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title="Actualizar Fechas de Tarjeta">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <Box 
            sx={{ 
              p: 2, 
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8
            }}
          >
            <DateRangeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Actualizar Fechas de tu Tarjeta
            </Typography>
            <IconButton 
              size="small" 
              sx={{ ml: 'auto', color: 'white' }}
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
          
          <CardContent sx={{ p: 3 }}>
            {card && (
              <>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 4, 
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.light + '10',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    {getCardIcon(card.type)}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {card.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      **** **** **** {card.lastFourDigits}
                    </Typography>
                  </Box>
                </Paper>
                
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4, 
                    bgcolor: theme.palette.info.light + '15',
                    '& .MuiAlert-icon': {
                      color: theme.palette.info.main
                    }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium" paragraph>
                    ¿Por qué es importante configurar estas fechas?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    La fecha de cierre es cuando la tarjeta finaliza el período de facturación del mes actual.
                    La fecha de vencimiento (generalmente en el mes siguiente) es el último día para realizar el pago.
                    Configurar estas fechas correctamente te ayudará a controlar mejor tus gastos con tarjeta.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Selecciona el período
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Mes</InputLabel>
                      <Select
                        value={selectedMonth}
                        label="Mes"
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {months.map(month => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Año</InputLabel>
                      <Select
                        value={selectedYear}
                        label="Año"
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {availableYears.map(year => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={0} 
                      variant="outlined" 
                      sx={{ p: 2, borderRadius: 2, height: '100%' }}
                    >
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Fecha de Cierre
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Es el último día del período de facturación actual.
                      </Typography>
                      
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        <DatePicker
                          label="Fecha de Cierre"
                          value={closingDate ? dayjs(closingDate) : null}
                          onChange={handleClosingDateChange}
                          views={['year', 'month', 'day']}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !closingDate,
                              helperText: !closingDate ? 'Selecciona una fecha válida' : '',
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarTodayIcon fontSize="small" color="primary" />
                                  </InputAdornment>
                                ),
                              }
                            },
                          }}
                        />
                      </LocalizationProvider>
                      
                      {closingDate && (
                        <Box 
                          sx={{ 
                            mt: 2, 
                            p: 1.5, 
                            bgcolor: theme.palette.primary.light + '15',
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.primary.light + '30'}`
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Fecha seleccionada:</strong> {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={0} 
                      variant="outlined" 
                      sx={{ p: 2, borderRadius: 2, height: '100%' }}
                    >
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        Fecha de Vencimiento
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Es el día límite para realizar el pago de tu tarjeta.
                      </Typography>
                      
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        <DatePicker
                          label="Fecha de Vencimiento"
                          value={dueDate ? dayjs(dueDate) : null}
                          onChange={handleDueDateChange}
                          views={['year', 'month', 'day']}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !dueDate,
                              helperText: !dueDate ? 'Selecciona una fecha válida' : '',
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PaymentIcon fontSize="small" color="error" />
                                  </InputAdornment>
                                ),
                              }
                            },
                          }}
                        />
                      </LocalizationProvider>
                      
                      {dueDate && (
                        <Box 
                          sx={{ 
                            mt: 2, 
                            p: 1.5, 
                            bgcolor: theme.palette.error.light + '15',
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.error.light + '30'}`
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Fecha seleccionada:</strong> {dayjs(dueDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
                
                <Box mt={4} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={saving || !closingDate || !dueDate}
                    startIcon={<SaveIcon />}
                    size="large"
                  >
                    {saving ? 'Guardando...' : 'Guardar Fechas'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
        
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            ¡Fechas actualizadas con éxito!
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default UpdateCardDates; 