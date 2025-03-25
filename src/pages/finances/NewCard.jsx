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
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTheme } from '@mui/material/styles';

const NewCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Datos de la tarjeta
  const [name, setName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardType, setCardType] = useState('visa');
  
  // Validación de inputs
  const [errors, setErrors] = useState({
    name: false,
    lastFourDigits: false
  });

  // Función para validar los campos
  const validateInputs = () => {
    const newErrors = {
      name: name.trim() === '',
      lastFourDigits: lastFourDigits.length !== 4 || !/^\d+$/.test(lastFourDigits)
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };

  // Función para guardar la tarjeta en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Crear la fecha actual para usar como timestamp
      const now = new Date();
      
      // Datos de la tarjeta
      const cardData = {
        name,
        lastFourDigits,
        cardType,
        createdAt: now.toISOString()
      };
      
      // Guardar la tarjeta en Firebase
      await database.ref(`${auth.currentUser.uid}/creditCards`).push(cardData);
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Resetear formulario
      setName('');
      setLastFourDigits('');
      setCardType('visa');
      
      // Redirigir al usuario a la página de tarjetas después de 1.5 segundos
      setTimeout(() => {
        navigate('/TarjetasCredito');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar la tarjeta:', error);
      setError('Error al guardar la tarjeta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Nueva Tarjeta">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={4}>
          <CardContent sx={{ p: 3 }}>
            <Box mb={3} display="flex" alignItems="center">
              <CreditCardIcon color="primary" sx={{ fontSize: 30, mr: 1.5 }} />
              <Typography variant="h5" fontWeight="medium">
                Añadir Nueva Tarjeta
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Ingresa los datos básicos de tu tarjeta. Las fechas de cierre y vencimiento se configurarán más adelante en la pantalla de tarjetas.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Nombre de la Tarjeta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    error={errors.name}
                    helperText={errors.name ? 'El nombre es obligatorio' : ''}
                    placeholder="Ej. Visa Banco Galicia"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Últimos 4 Dígitos"
                    value={lastFourDigits}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,4}$/.test(value)) {
                        setLastFourDigits(value);
                      }
                    }}
                    fullWidth
                    required
                    error={errors.lastFourDigits}
                    helperText={errors.lastFourDigits ? 'Ingresa los últimos 4 dígitos' : ''}
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="card-type-label">Tipo de Tarjeta</InputLabel>
                    <Select
                      labelId="card-type-label"
                      value={cardType}
                      label="Tipo de Tarjeta"
                      onChange={(e) => setCardType(e.target.value)}
                    >
                      <MenuItem value="visa">Visa</MenuItem>
                      <MenuItem value="mastercard">Mastercard</MenuItem>
                      <MenuItem value="amex">American Express</MenuItem>
                      <MenuItem value="other">Otra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    startIcon={<CreditCardIcon />}
                  >
                    {loading ? 'Guardando...' : 'Guardar Tarjeta'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
      
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          ¡Tarjeta añadida con éxito!
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default NewCard; 