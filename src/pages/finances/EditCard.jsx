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
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { database } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useTheme } from '@mui/material/styles';

const EditCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cardId } = useParams();
  const { userData } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Datos de la tarjeta
  const [name, setName] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardType, setCardType] = useState('visa');
  
  // Validación de inputs
  const [errors, setErrors] = useState({
    name: false,
    lastFourDigits: false
  });

  // Cargar los datos de la tarjeta
  useEffect(() => {
    if (!cardId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (userData && userData.creditCards && userData.creditCards[cardId]) {
      const card = userData.creditCards[cardId];
      
      setName(card.name || '');
      setLastFourDigits(card.lastFourDigits || '');
      setCardType(card.cardType || 'visa');
      
      setLoading(false);
    } else if (userData) {
      // Si userData está cargado pero no encontramos la tarjeta
      setNotFound(true);
      setLoading(false);
    }
  }, [cardId, userData]);

  // Función para validar los campos
  const validateInputs = () => {
    const newErrors = {
      name: name.trim() === '',
      lastFourDigits: lastFourDigits.length !== 4 || !/^\d+$/.test(lastFourDigits)
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(error => error);
  };

  // Función para actualizar la tarjeta en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Datos de la tarjeta actualizados
      const cardData = {
        name,
        lastFourDigits,
        cardType,
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar la tarjeta en Firebase
      await database.ref(`${auth.currentUser.uid}/creditCards/${cardId}`).update(cardData);
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Redirigir al usuario a la página de tarjetas después de 1.5 segundos
      setTimeout(() => {
        navigate('/TarjetasCredito');
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar la tarjeta:', error);
      setError('Error al actualizar la tarjeta. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Editando Tarjeta">
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Cargando datos de la tarjeta...
          </Typography>
        </Container>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout title="Tarjeta no encontrada">
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" color="error" gutterBottom>
                Tarjeta no encontrada
              </Typography>
              <Typography variant="body1" paragraph>
                La tarjeta que intentas editar no existe o no tienes permisos para acceder a ella.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/TarjetasCredito')}
              >
                Volver a mis tarjetas
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Editar Tarjeta">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={4}>
          <CardContent sx={{ p: 3 }}>
            <Box mb={3} display="flex" alignItems="center">
              <CreditCardIcon color="primary" sx={{ fontSize: 30, mr: 1.5 }} />
              <Typography variant="h5" fontWeight="medium">
                Editar Tarjeta
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Modifica los datos básicos de tu tarjeta. Las fechas de cierre y vencimiento se configurarán mensualmente en la pantalla de tarjetas.
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
                    disabled={saving}
                    startIcon={<CreditCardIcon />}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
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
          ¡Tarjeta actualizada con éxito!
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default EditCard; 