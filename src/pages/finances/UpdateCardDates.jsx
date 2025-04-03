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
  Slide
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
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3,
                        mb: 2, 
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <Box 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          p: 2,
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}
                      >
                        {getCardIcon(card.type)}
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {card.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                          **** {card.lastFourDigits}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        gap: 2,
                        mb: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="medium" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          minWidth: 180,
                          gap: 1 
                        }}
                      >
                        <EventIcon color="primary" /> Configura para:
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          gap: 2, 
                          flexGrow: 1, 
                          flexWrap: 'wrap' 
                        }}
                      >
                        <FormControl sx={{ minWidth: 150 }}>
                          <InputLabel id="month-select-label">Mes</InputLabel>
                          <Select
                            labelId="month-select-label"
                            value={selectedMonth}
                            label="Mes"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            sx={{ borderRadius: 2 }}
                            MenuProps={{
                              PaperProps: {
                                sx: { maxHeight: 300, borderRadius: 2 }
                              }
                            }}
                          >
                            {months.map(month => (
                              <MenuItem key={month.value} value={month.value}>
                                {month.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel id="year-select-label">Año</InputLabel>
                          <Select
                            labelId="year-select-label"
                            value={selectedYear}
                            label="Año"
                            onChange={(e) => setSelectedYear(e.target.value)}
                            sx={{ borderRadius: 2 }}
                          >
                            {availableYears.map(year => (
                              <MenuItem key={year} value={year}>
                                {year}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  
                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3, 
                          height: '100%',
                          transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                          <CalendarTodayIcon color="primary" fontSize="small" />
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            Fecha de Cierre
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          mb: 3, 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.primary.light, 0.07),
                          border: `1px solid ${alpha(theme.palette.primary.light, 0.1)}`
                        }}>
                          <Typography variant="body2" color="text.secondary">
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
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                error: !closingDate,
                                helperText: !closingDate ? 'Fecha requerida para continuar' : '',
                                margin: "normal",
                                sx: { mt: 1, mb: 2 },
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarTodayIcon fontSize="small" color="primary" />
                                    </InputAdornment>
                                  ),
                                }
                              },
                              day: {
                                sx: { 
                                  '&.Mui-selected': {
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': { bgcolor: theme.palette.primary.dark }
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
                              bgcolor: theme.palette.primary.main + '15',
                              border: `1px solid ${theme.palette.primary.main + '30'}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CheckCircleIcon color="primary" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
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
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 4, 
                  pt: 3,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 'medium',
                      borderWidth: 1.5
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={saving || !closingDate || !dueDate}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`
                      },
                      transition: 'transform 0.2s ease, box-shadow 0.3s ease'
                    }}
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
          TransitionComponent={Slide}
        >
          <Alert 
            severity="success" 
            variant="filled"
            icon={<CheckCircleIcon />}
            sx={{ 
              minWidth: 280,
              boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.4)}`,
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
      </Container>
    </Layout>
  );
};

export default UpdateCardDates; 