import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Container,
  CardHeader,
  IconButton,
  Avatar,
  Paper,
  Tooltip,
  Stack,
  Chip
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";
import BugReportIcon from '@mui/icons-material/BugReport';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ScienceIcon from '@mui/icons-material/Science';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const NewInsecticide = () => {
  const { userData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [appMethod, setAppMethod] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [insecticides, setInsecticides] = useState([]);
  const [selectedInsecticide, setSelectedInsecticide] = useState('');
  const [selectedDosis, setSelectedDosis] = useState('');
  const [applicationDate, setApplicationDate] = useState(new Date());
  const [notes, setNotes] = useState("");

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleNewInsecticide = () => {
    const insecticideData = {
      date: formatDate(applicationDate),
      appMethod: appMethod,
      treatmentType: treatmentType,
      insecticides: insecticides,
    };

    if (notes.trim()) {
      insecticideData.notes = notes.trim();
    }

    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/insecticides`
      )
      .push(insecticideData);

    setAppMethod("");
    setTreatmentType("");
    setInsecticides([]);
    setNotes("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  const handleAddInsecticide = () => {
    if (!selectedInsecticide || !selectedDosis) return;
    
    let auxList = [...insecticides];
    auxList.push({
      name: userData.plants.aditives.insecticidas[selectedInsecticide].name,
      dosis: selectedDosis
    });
    setInsecticides(auxList);
    setSelectedInsecticide("");
    setSelectedDosis("");
  };

  const handleRemoveInsecticide = (index) => {
    const newInsecticides = insecticides.filter((_, i) => i !== index);
    setInsecticides(newInsecticides);
  };

  const isFormValid = appMethod && treatmentType && insecticides.length > 0;

  const treatmentTypes = [
    {
      value: 'Preventivo',
      label: 'Tratamiento Preventivo',
      description: 'Aplicación preventiva para evitar plagas',
      icon: '🛡️'
    },
    {
      value: 'Curativo',
      label: 'Tratamiento Curativo',
      description: 'Tratamiento específico contra plagas detectadas',
      icon: '🎯'
    }
  ];

  const applicationMethods = [
    {
      value: 'Foliar',
      label: 'Aplicación Foliar',
      description: 'Pulverización directa sobre las hojas',
      icon: '🌿'
    },
    {
      value: 'Raices',
      label: 'Aplicación en Raíces',
      description: 'Aplicación directa en el sustrato/raíces',
      icon: '🌱'
    }
  ];

  return (
    <Layout title="Nuevo Insecticida">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información de la aplicación */}
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
                      <BugReportIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Datos de la Aplicación
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha de aplicación"
                          value={applicationDate}
                          onChange={(newValue) => setApplicationDate(newValue)}
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
                      <TextField
                        label="Notas adicionales (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Observaciones sobre la aplicación, plagas detectadas, etc."
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

            {/* Tipo de tratamiento */}
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
                      <ShieldIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Tipo de Tratamiento
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      ¿Es un tratamiento preventivo o curativo?
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {treatmentTypes.map((treatment, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper 
                          elevation={treatmentType === treatment.value ? 3 : 1}
                          sx={{ 
                            p: 3,
                            borderRadius: 2,
                            border: treatmentType === treatment.value 
                              ? `2px solid ${theme.palette.info.main}` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: treatmentType === treatment.value 
                              ? alpha(theme.palette.info.main, 0.05) 
                              : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`
                            }
                          }}
                          onClick={() => setTreatmentType(treatment.value)}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                              {treatment.icon}
                            </Typography>
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                              {treatment.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {treatment.description}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Método de aplicación */}
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
                      <WaterDropIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Método de Aplicación
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      ¿Cómo vas a aplicar el insecticida?
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {applicationMethods.map((method, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper 
                          elevation={appMethod === method.value ? 3 : 1}
                          sx={{ 
                            p: 3,
                            borderRadius: 2,
                            border: appMethod === method.value 
                              ? `2px solid ${theme.palette.warning.main}` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: appMethod === method.value 
                              ? alpha(theme.palette.warning.main, 0.05) 
                              : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`
                            }
                          }}
                          onClick={() => setAppMethod(method.value)}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                              {method.icon}
                            </Typography>
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                              {method.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.description}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Gestión de insecticidas almacenados */}
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
                        Insecticidas a Utilizar
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Selecciona los insecticidas almacenados que vas a usar
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
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
                        <InputLabel>Seleccionar insecticida</InputLabel>
                        <Select
                          value={selectedInsecticide}
                          label="Seleccionar insecticida"
                          onChange={(e) => setSelectedInsecticide(e.target.value)}
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {userData?.plants?.aditives?.insecticidas && Object.keys(userData.plants.aditives.insecticidas).map(insecticide => (
                            <MenuItem key={insecticide} value={insecticide}>
                              {userData.plants.aditives.insecticidas[insecticide].name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth disabled={!selectedInsecticide}>
                        <InputLabel>Dosis</InputLabel>
                        <Select
                          value={selectedDosis}
                          label="Dosis"
                          onChange={(e) => setSelectedDosis(e.target.value)}
                          sx={{
                            borderRadius: 2
                          }}
                        >
                          {selectedInsecticide && userData?.plants?.aditives?.insecticidas?.[selectedInsecticide]?.dosis?.map((dosis, index) => (
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
                        color="secondary"
                        disabled={!selectedInsecticide || !selectedDosis}
                        onClick={handleAddInsecticide}
                        startIcon={<AddIcon />}
                        fullWidth
                        size="large"
                        sx={{
                          height: 56,
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                          '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`
                          }
                        }}
                      >
                        Agregar Insecticida
                      </Button>
                    </Grid>

                    {insecticides.length > 0 && (
                      <Grid item xs={12}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                          }}
                        >
                          <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                            Insecticidas seleccionados ({insecticides.length})
                          </Typography>
                          <Grid container spacing={2}>
                            {insecticides.map((insecticide, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card 
                                  elevation={1}
                                  sx={{ 
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                                    position: 'relative'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                        color: theme.palette.secondary.main,
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      <BugReportIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle2" fontWeight="medium">
                                        {insecticide.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {insecticide.dosis} ml/l
                                      </Typography>
                                    </Box>
                                    <Tooltip title="Eliminar insecticida">
                                      <IconButton 
                                        size="small"
                                        onClick={() => handleRemoveInsecticide(index)}
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
                  color="error"
                  onClick={handleNewInsecticide}
                  disabled={!isFormValid}
                  startIcon={<SaveIcon />}
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Registrar Aplicación
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewInsecticide;
