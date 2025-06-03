import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Container,
  CardHeader,
  Paper,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SaveIcon from '@mui/icons-material/Save';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const NewTransplant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();
  const theme = useTheme();
  const [newVol, setNewVol] = useState("");
  const [transplantDate, setTransplantDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [selectedPlants, setSelectedPlants] = useState([]);
  
  const plantId = checkSearch(location.search);
  
  // Obtener todas las plantas activas del usuario
  const activePlants = userData?.plants?.active ? Object.keys(userData.plants.active).map(id => ({
    id,
    name: userData.plants.active[id].name,
    strain: userData.plants.active[id].strain,
    currentPotVolume: userData.plants.active[id].potVolume || "No especificado"
  })) : [];
  
  // Preseleccionar la planta actual si venimos de una planta específica
  React.useEffect(() => {
    if (plantId && activePlants.length > 0 && selectedPlants.length === 0) {
      const currentPlant = activePlants.find(plant => plant.id === plantId);
      if (currentPlant) {
        setSelectedPlants([plantId]);
      }
    }
  }, [activePlants.length]);
  
  // Obtener el volumen actual de la maceta (para la primera planta seleccionada)
  const currentPlant = selectedPlants.length > 0 ? activePlants.find(p => p.id === selectedPlants[0]) : null;
  const currentPotVolume = currentPlant?.currentPotVolume || "No especificado";

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleNewTransplant = () => {
    const newVolume = parseInt(newVol);
    
    // Crear las promesas para todas las plantas seleccionadas
    const promises = selectedPlants.map(currentPlantId => {
      const currentPlantData = activePlants.find(p => p.id === currentPlantId);
      const transplantData = {
        date: formatDate(transplantDate),
        previousPot: currentPlantData?.currentPotVolume || "No especificado",
        newPot: newVolume,
      };

      if (notes.trim()) {
        transplantData.notes = notes.trim();
      }

      // Guardar el transplante
      const transplantPromise = database
        .ref(`${auth.currentUser.uid}/plants/active/${currentPlantId}/transplants`)
        .push(transplantData);
      
      // Actualizar el volumen de la maceta
      const updatePromise = database
        .ref(`${auth.currentUser.uid}/plants/active/${currentPlantId}`)
        .transaction((data) => {
          if (data) {
            data.potVolume = newVolume;
          }
          return data;
        });

      return Promise.all([transplantPromise, updatePromise]);
    });

    Promise.all(promises).then(() => {
      setNewVol("");
      setNotes("");

      // Si solo hay una planta seleccionada, navegar a esa planta
      // Si hay múltiples, navegar a la vista general de plantas
      if (selectedPlants.length === 1) {
        navigate(`/Planta/?${selectedPlants[0]}`);
      } else {
        navigate('/Plantas');
      }
    });
  };

  const handlePlantChange = (event) => {
    const value = event.target.value;
    setSelectedPlants(typeof value === 'string' ? value.split(',') : value);
  };

  const isFormValid = newVol && parseFloat(newVol) > 0 && selectedPlants.length > 0;

  const potSizes = [
    { value: 0.5, label: '0.5L', description: 'Maceta muy pequeña' },
    { value: 1, label: '1L', description: 'Maceta pequeña' },
    { value: 2, label: '2L', description: 'Maceta mediana pequeña' },
    { value: 3, label: '3L', description: 'Maceta mediana' },
    { value: 5, label: '5L', description: 'Maceta mediana grande' },
    { value: 7, label: '7L', description: 'Maceta grande' },
    { value: 10, label: '10L', description: 'Maceta muy grande' },
    { value: 15, label: '15L', description: 'Maceta extra grande' },
    { value: 20, label: '20L', description: 'Maceta gigante' }
  ];

  return (
    <Layout title="Nuevo Transplante">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información del transplante */}
            <Grid item xs={12}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  height: 'fit-content'
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <SwapHorizIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Datos del Transplante
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha del transplante"
                          value={transplantDate}
                          onChange={(newValue) => setTransplantDate(newValue)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Plantas seleccionadas</InputLabel>
                        <Select
                          multiple
                          value={selectedPlants}
                          onChange={handlePlantChange}
                          input={<OutlinedInput label="Plantas seleccionadas" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const plant = activePlants.find(p => p.id === value);
                                return (
                                  <Chip 
                                    key={value} 
                                    label={plant ? `${plant.name} ${plant.strain ? `(${plant.strain})` : ''}` : value}
                                    size="small"
                                    color="primary"
                                  />
                                );
                              })}
                            </Box>
                          )}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        >
                          {activePlants.map((plant) => (
                            <MenuItem key={plant.id} value={plant.id}>
                              <Checkbox checked={selectedPlants.indexOf(plant.id) > -1} />
                              <ListItemText 
                                primary={plant.name}
                                secondary={plant.strain || 'Sin cepa especificada'}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <InfoIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                            Maceta actual {selectedPlants.length > 1 ? '(primera seleccionada)' : ''}
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">
                          {currentPotVolume} litros
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          height: 'fit-content'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <InfoIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight="medium" color="success.main">
                            Estado actual
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={`${selectedPlants.length} ${selectedPlants.length === 1 ? 'planta' : 'plantas'}`} 
                            color={selectedPlants.length > 0 ? "success" : "default"}
                            variant={selectedPlants.length > 0 ? "filled" : "outlined"}
                            size="small"
                          />
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Notas adicionales (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Observaciones sobre el transplante, estado de las raíces, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Selección de nueva maceta */}
            <Grid item xs={12}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden'
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocalFloristIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Nueva Maceta
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Selecciona el tamaño de la nueva maceta
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Volumen de la nueva maceta"
                        type="number"
                        value={newVol}
                        onChange={(e) => setNewVol(e.target.value)}
                        required
                        fullWidth
                        InputProps={{ 
                          inputProps: { min: 0.1, step: 0.1 },
                          endAdornment: <Typography variant="body2" color="text.secondary">litros</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                        helperText="Ingresa el volumen en litros"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {newVol && (
                        <Paper 
                          elevation={1}
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            height: 'fit-content'
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight="medium" gutterBottom color="success.main">
                            Cambio de volumen
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                              label={`${currentPotVolume}L`} 
                              size="small" 
                              sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}
                            />
                            <SwapHorizIcon sx={{ color: theme.palette.success.main }} />
                            <Chip 
                              label={`${newVol}L`} 
                              size="small" 
                              color="success"
                            />
                          </Stack>
                          {parseFloat(newVol) > parseFloat(currentPotVolume) && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              ✓ Aumento de {(parseFloat(newVol) - parseFloat(currentPotVolume)).toFixed(1)}L
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Grid>
                  </Grid>

                  {/* Tamaños sugeridos */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Tamaños comunes
                    </Typography>
                    <Grid container spacing={1}>
                      {potSizes.map((size) => (
                        <Grid item key={size.value}>
                          <Chip
                            label={size.label}
                            onClick={() => setNewVol(size.value.toString())}
                            variant={newVol === size.value.toString() ? "filled" : "outlined"}
                            color={newVol === size.value.toString() ? "success" : "default"}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.1)
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Botón de acción */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNewTransplant}
                  disabled={!isFormValid}
                  startIcon={<SaveIcon />}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Registrar Transplante
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewTransplant;
