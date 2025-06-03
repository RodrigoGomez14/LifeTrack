import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  List,
  ListItemText,
  Select,
  MenuItem,
  Grid,
  ListItem,
  Paper,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Chip,
  Stack,
  Divider,
  CardHeader,
  IconButton,
  Avatar,
  Alert,
  Container,
  Fade,
  Tooltip,
  Checkbox,
  ListItemText as MuiListItemText,
  OutlinedInput
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const NewIrrigation = () => {
  const {userData} = useStore()
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [quantity, setQuantity] = useState("");
  const [aditives, setAditives] = useState([]);
  const [selectedAditive, setSelectedAditive] = useState('');
  const [selectedDosis, setSelectedDosis] = useState('');
  const [irrigationDate, setIrrigationDate] = useState(new Date());
  const [notes, setNotes] = useState("");
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

  const handleNewIrrigation = () => {
    const irrigationData = {
      date: formatDate(irrigationDate),
      quantity: parseInt(quantity),
      aditives: aditives,
    };

    if (notes.trim()) {
      irrigationData.notes = notes.trim();
    }

    // Guardar el riego en todas las plantas seleccionadas
    const promises = selectedPlants.map(currentPlantId => {
      return database
        .ref(`${auth.currentUser.uid}/plants/active/${currentPlantId}/irrigations`)
        .push(irrigationData);
    });

    Promise.all(promises).then(() => {
      setQuantity("");
      setAditives([]);
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

  const handleAddAditive = () => {
    if (!selectedAditive || !selectedDosis) return;
    
    let auxList = [...aditives];
    auxList.push({
      name: userData.plants.aditives.fertilizantes[selectedAditive].name,
      dosis: selectedDosis
    });
    setAditives(auxList);
    setSelectedAditive("");
    setSelectedDosis("");
  };

  const handleRemoveAditive = (index) => {
    const newAditives = aditives.filter((_, i) => i !== index);
    setAditives(newAditives);
  };

  const handlePlantChange = (event) => {
    const value = event.target.value;
    setSelectedPlants(typeof value === 'string' ? value.split(',') : value);
  };

  const isFormValid = quantity && parseInt(quantity) > 0 && selectedPlants.length > 0;

  return (
    <Layout title="Nuevo Riego">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información del riego */}
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
                      <WaterDropIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Datos del Riego
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha del riego"
                          value={irrigationDate}
                          onChange={(newValue) => setIrrigationDate(newValue)}
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
                              <MuiListItemText 
                                primary={plant.name}
                                secondary={plant.strain || 'Sin cepa especificada'}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Cantidad de agua"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        fullWidth
                        InputProps={{ 
                          inputProps: { min: 1 },
                          endAdornment: <Typography variant="body2" color="text.secondary">ml</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                        helperText="Cantidad en mililitros"
                      />
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
                          {aditives.length > 0 && (
                            <Chip 
                              label={`${aditives.length} ${aditives.length === 1 ? 'aditivo' : 'aditivos'}`} 
                              color="secondary"
                              variant="filled"
                              size="small"
                            />
                          )}
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
                        placeholder="Observaciones sobre el riego, estado de la planta, etc."
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

            {/* Gestión de aditivos */}
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
                      <ScienceIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Aditivos y Fertilizantes
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Agrega fertilizantes o aditivos al riego (opcional)
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
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Seleccionar aditivo</InputLabel>
                        <Select
                          value={selectedAditive}
                          label="Seleccionar aditivo"
                          onChange={(e) => setSelectedAditive(e.target.value)}
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {userData?.plants?.aditives?.fertilizantes && Object.keys(userData.plants.aditives.fertilizantes).map(aditive => (
                            <MenuItem key={aditive} value={aditive}>
                              {userData.plants.aditives.fertilizantes[aditive].name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth disabled={!selectedAditive}>
                        <InputLabel>Dosis</InputLabel>
                        <Select
                          value={selectedDosis}
                          label="Dosis"
                          onChange={(e) => setSelectedDosis(e.target.value)}
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {selectedAditive && userData?.plants?.aditives?.fertilizantes?.[selectedAditive]?.dosis?.map((dosis, index) => (
                            <MenuItem key={index} value={dosis.quantity}>
                              {dosis.quantity}{dosis.measure}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!selectedAditive || !selectedDosis}
                        onClick={handleAddAditive}
                        startIcon={<AddIcon />}
                        fullWidth
                        size="large"
                        sx={{
                          height: 56,
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                          '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`
                          }
                        }}
                      >
                        Agregar Aditivo
                      </Button>
                    </Grid>

                    {aditives.length > 0 && (
                      <Grid item xs={12}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                          }}
                        >
                          <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                            Aditivos seleccionados ({aditives.length})
                          </Typography>
                          <Grid container spacing={2}>
                            {aditives.map((aditive, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card 
                                  elevation={1}
                                  sx={{ 
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                    position: 'relative'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                        color: theme.palette.success.main,
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      <ScienceIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" fontWeight="medium">
                                        {aditive.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {aditive.dosis} ml/l
                                      </Typography>
                                    </Box>
                                    <Tooltip title="Eliminar aditivo">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleRemoveAditive(index)}
                                        sx={{ 
                                          color: theme.palette.error.main,
                                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}
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
                  onClick={handleNewIrrigation}
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
                  Registrar Riego
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewIrrigation;
