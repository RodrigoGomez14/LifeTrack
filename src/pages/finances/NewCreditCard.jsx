import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Container,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton
} from '@mui/material';
import { database, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store'; 
import { useTheme } from '@mui/material/styles';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisaIcon from '../../components/icons/VisaIcon';
import MastercardIcon from '../../components/icons/MastercardIcon';
import AmexIcon from '../../components/icons/AmexIcon';

const NewCreditCard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [type, setType] = useState('visa');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [error, setError] = useState('');
  
  // Validación de campos básica
  const validateFields = () => {
    if (!name.trim()) {
      setError('Por favor ingresa un nombre para la tarjeta');
      return false;
    }
    
    if (!/^\d{4}$/.test(lastFourDigits)) {
      setError('Por favor ingresa los últimos 4 dígitos de la tarjeta');
      return false;
    }
    
    if (!creditLimit.trim() || isNaN(parseFloat(creditLimit))) {
      setError('Por favor ingresa un límite de crédito válido');
      return false;
    }
    
    const closingDayNum = parseInt(closingDay);
    if (isNaN(closingDayNum) || closingDayNum < 1 || closingDayNum > 31) {
      setError('Por favor ingresa un día de cierre válido (1-31)');
      return false;
    }
    
    const dueDayNum = parseInt(dueDay);
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      setError('Por favor ingresa un día de vencimiento válido (1-31)');
      return false;
    }
    
    setError('');
    return true;
  };
  
  // Guardar tarjeta
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateFields()) {
      return;
    }
    
    // Fecha actual para timestamp
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Referencia al nodo de tarjetas de crédito
    const newCardRef = database.ref(`${auth.currentUser.uid}/creditCards`).push();
    
    // Datos de la tarjeta
    const cardData = {
      name: name.trim(),
      type: type,
      lastFourDigits: lastFourDigits,
      creditLimit: parseFloat(creditLimit),
      defaultClosingDay: parseInt(closingDay),
      defaultDueDay: parseInt(dueDay),
      createdAt: now.toISOString(),
      // Estructura inicial para el mes actual
      months: {
        [currentYear]: {
          [currentMonth]: {
            closingDate: calculateDate(currentYear, currentMonth, parseInt(closingDay)).toISOString(),
            dueDate: calculateDate(currentYear, currentMonth, parseInt(dueDay)).toISOString()
          }
        }
      }
    };
    
    // Guardar la tarjeta en Firebase
    newCardRef.set(cardData)
      .then(() => {
        // Navegar a la página de tarjetas
        navigate('/TarjetasCredito');
      })
      .catch(error => {
        setError('Error al guardar la tarjeta: ' + error.message);
      });
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
  
  // Ir atrás
  const handleBack = () => {
    navigate('/TarjetasCredito');
  };
  
  return (
    <Layout title="Nueva Tarjeta de Crédito">
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
            <CreditCardIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Añadir Nueva Tarjeta de Crédito
            </Typography>
          </Box>
          
          <Divider />
          
          <CardContent sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Información Básica
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre de la Tarjeta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    placeholder="Ej. Visa Banco Río"
                    helperText="Nombre para identificar fácilmente tu tarjeta"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Últimos 4 dígitos"
                    value={lastFourDigits}
                    onChange={(e) => {
                      // Solo permitir números y máximo 4 dígitos
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                      setLastFourDigits(value);
                    }}
                    fullWidth
                    required
                    placeholder="1234"
                    inputProps={{ maxLength: 4 }}
                    helperText="Para identificar esta tarjeta en tus estados de cuenta"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">****</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle2" gutterBottom>
                      Tipo de Tarjeta
                    </Typography>
                    <RadioGroup
                      row
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <FormControlLabel 
                        value="visa" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <VisaIcon sx={{ mr: 0.5, color: '#1A1F71' }} />
                            <Typography>Visa</Typography>
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="mastercard" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <MastercardIcon sx={{ mr: 0.5 }} />
                            <Typography>Mastercard</Typography>
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="amex" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <AmexIcon sx={{ mr: 0.5, color: '#006FCF' }} />
                            <Typography>American Express</Typography>
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="other" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <CreditCardIcon sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                            <Typography>Otra</Typography>
                          </Box>
                        } 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ mt: 2 }}>
                    Detalles Financieros
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Límite de Crédito"
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    helperText="Monto máximo de la tarjeta"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TextField
                      label="Día de Cierre"
                      type="number"
                      value={closingDay}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        // No permitir valores mayores a 31
                        if (parseInt(value) > 31) return;
                        setClosingDay(value);
                      }}
                      fullWidth
                      required
                      inputProps={{ min: 1, max: 31 }}
                      helperText="Día del mes en que cierra la tarjeta"
                    />
                    <Tooltip title="Es el día en que se cierra el período y se genera el resumen">
                      <IconButton size="small" sx={{ mt: -3 }}>
                        <InfoIcon color="primary" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TextField
                      label="Día de Vencimiento"
                      type="number"
                      value={dueDay}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        // No permitir valores mayores a 31
                        if (parseInt(value) > 31) return;
                        setDueDay(value);
                      }}
                      fullWidth
                      required
                      inputProps={{ min: 1, max: 31 }}
                      helperText="Día del mes en que vence el pago"
                    />
                    <Tooltip title="Es el día límite para pagar sin recargos">
                      <IconButton size="small" sx={{ mt: -3 }}>
                        <InfoIcon color="primary" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Los días de cierre y vencimiento son usados para configurar recordatorios y organizar tus pagos.
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="space-between">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={handleBack}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      startIcon={<SaveIcon />}
                    >
                      Guardar Tarjeta
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default NewCreditCard; 