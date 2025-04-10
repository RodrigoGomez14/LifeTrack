import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControlLabel, 
  Grid, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Paper, 
  Stack,
  FormControl, 
  FormLabel,
  FormHelperText,
  InputLabel,
  Alert,
  alpha
} from '@mui/material';
import { database, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import ForestIcon from '@mui/icons-material/Forest';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { useTheme } from '@mui/material/styles';

const NewPlant = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [potVolume, setPotVolume] = useState('');
  const [genetic, setGenetic] = useState('');
  const [etapa, setEtapa] = useState('Germinacion');
  const [birthDate, setBirthDate] = useState(null);
  const [inicioVegetativo, setInicioVegetativo] = useState(null);
  const [inicioFloracion, setInicioFloracion] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Ingresa una cantidad válida';
    }
    
    if (potVolume && (isNaN(potVolume) || potVolume <= 0)) {
      newErrors.potVolume = 'Ingresa un volumen válido';
    }
    
    if (!genetic.trim()) {
      newErrors.genetic = 'La genética es obligatoria';
    }
    
    if (!birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const plantData = {
      name: name.trim(),
      quantity: parseInt(quantity),
      potVolume: potVolume ? parseFloat(potVolume) : null,
      etapa: etapa,
      genetic: genetic.trim()
    };
    
    if (birthDate) {
      plantData.birthDate = formatDate(birthDate);
    }
    
    if (inicioVegetativo) {
      plantData.inicioVegetativo = formatDate(inicioVegetativo);
    }
    
    if (inicioFloracion) {
      plantData.inicioFloracion = formatDate(inicioFloracion);
    }

    database.ref(`${auth.currentUser.uid}/plants/active`).push(plantData);

    setName('');
    setQuantity('');
    setPotVolume('');
    setGenetic('');
    setEtapa('Germinacion');
    setBirthDate(null);
    setInicioVegetativo(null);
    setInicioFloracion(null);

    navigate('/Plantas');
  };

  return (
    <Layout title="Nueva Planta">
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <ForestIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Agregar Nueva Planta
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre de la planta"
                  placeholder="Ej: Albahaca, Tomate, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Genética"
                  placeholder="Ej: White Widow, Northern Lights, etc."
                  value={genetic}
                  onChange={(e) => setGenetic(e.target.value)}
                  fullWidth
                  error={!!errors.genetic}
                  helperText={errors.genetic}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cantidad"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                  required
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Volumen de maceta (L)"
                  type="number"
                  value={potVolume}
                  onChange={(e) => setPotVolume(e.target.value)}
                  fullWidth
                  error={!!errors.potVolume}
                  helperText={errors.potVolume || 'Opcional'}
                  InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ETAPA DE CRECIMIENTO
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="etapa-label">Etapa actual</InputLabel>
                  <Select
                    labelId="etapa-label"
                    value={etapa}
                    label="Etapa actual"
                    onChange={(e) => setEtapa(e.target.value)}
                  >
                    <MenuItem value="Germinacion">Germinación</MenuItem>
                    <MenuItem value="Vegetativo">Vegetativo</MenuItem>
                    <MenuItem value="Floracion">Floración</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Stack spacing={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha de nacimiento (Inicio de Germinación)"
                      value={birthDate}
                      onChange={(date) => setBirthDate(date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          required: true,
                          error: !!errors.birthDate,
                          helperText: errors.birthDate
                        }
                      }}
                    />
                    
                    <DatePicker
                      label="Inicio de Vegetativo"
                      value={inicioVegetativo}
                      onChange={(date) => setInicioVegetativo(date)}
                      disabled={etapa === 'Germinacion'}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                        }
                      }}
                    />
                    
                    <DatePicker
                      label="Inicio de Floración"
                      value={inicioFloracion}
                      onChange={(date) => setInicioFloracion(date)}
                      disabled={etapa !== 'Floracion'}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/Plantas')}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained"
                sx={{ 
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark
                  }
                }}
                onClick={handleFormSubmit}
                disabled={!name || !quantity || !genetic || !birthDate}
                startIcon={<AddIcon />}
              >
                Agregar Planta
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewPlant;
