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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Stack,
  Paper
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useTheme } from '@mui/material/styles';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from "../../store";

const NewLog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { userData } = useStore();
  const [description, setDescription] = useState("");
  const [logDate, setLogDate] = useState(new Date());
  const [selectedPlants, setSelectedPlants] = useState([]);

  const plantId = checkSearch(location.search);
  
  // Obtener todas las plantas activas del usuario
  const activePlants = userData?.plants?.active ? Object.keys(userData.plants.active).map(id => ({
    id,
    name: userData.plants.active[id].name,
    strain: userData.plants.active[id].strain
  })) : [];
  
  // Preseleccionar la planta actual si venimos de una planta específica
  React.useEffect(() => {
    if (plantId && activePlants.length > 0 && selectedPlants.length === 0) {
      const currentPlant = activePlants.find(plant => plant.id === plantId);
      if (currentPlant) {
        setSelectedPlants([plantId]);
      }
    }
  }, [activePlants.length]); // Solo ejecutar cuando cambien las plantas, no cuando cambien selectedPlants

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleNewLog = () => {
    const logData = {
      date: formatDate(logDate),
      description: description,
      timestamp: Date.now()
    };

    // Guardar el registro en todas las plantas seleccionadas
    const promises = selectedPlants.map(currentPlantId => {
      return database
        .ref(`${auth.currentUser.uid}/plants/active/${currentPlantId}/logs`)
        .push(logData);
    });

    Promise.all(promises).then(() => {
      setDescription("");
      setLogDate(new Date());

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

  const isFormValid = description.trim().length > 0 && selectedPlants.length > 0;

  return (
    <Layout title="Nuevo Registro">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información del registro */}
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
                      <NoteAltIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Nuevo Registro
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Registra observaciones, eventos o detalles importantes sobre tu planta
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha del registro"
                          value={logDate}
                          onChange={(newValue) => setLogDate(newValue)}
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
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          height: 'fit-content'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <InfoIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight="medium" color="info.main">
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

                    <Grid item xs={12} sm={6}>
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          height: 'fit-content'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="medium" color="info.main" gutterBottom>
                          💡 Consejos para tu registro
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          • Estado general de la planta<br/>
                          • Cambios observados<br/>
                          • Condiciones ambientales<br/>
                          • Problemas detectados
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Descripción del registro"
                        placeholder="Escribe los detalles de tu registro aquí..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        fullWidth
                        multiline
                        rows={6}
                        helperText="Registra cualquier evento, observación o detalle relevante sobre tu planta"
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

            {/* Botón de acción */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNewLog}
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
                  Guardar Registro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewLog; 