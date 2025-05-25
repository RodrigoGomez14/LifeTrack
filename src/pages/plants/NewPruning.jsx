import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
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
  CardHeader,
  IconButton,
  Avatar,
  Alert,
  Container,
  TextField,
  Stack,
  Paper,
  Tooltip
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import GrassIcon from '@mui/icons-material/Grass';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

const NewPruning = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState("");
  const [pruningDate, setPruningDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const theme = useTheme();

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleNewPruning = () => {
    const pruningData = {
      date: formatDate(pruningDate),
      type: type,
    };

    if (notes.trim()) {
      pruningData.notes = notes.trim();
    }

    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/prunings`
      )
      .push(pruningData);

    setType("");
    setNotes("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  const pruningTypes = [
    { 
      value: 'Apical', 
      label: 'Poda Apical', 
      description: 'Corte del brote principal para estimular el crecimiento lateral',
      icon: '🌱'
    },
    { 
      value: 'FIM', 
      label: 'Técnica FIM', 
      description: 'Corte parcial del brote principal sin eliminarlo completamente',
      icon: '✂️'
    },
    { 
      value: 'Bajos', 
      label: 'Poda de Bajos', 
      description: 'Eliminación de ramas y hojas inferiores para mejorar la ventilación',
      icon: '🍃'
    },
    { 
      value: 'Hojas', 
      label: 'Defoliación', 
      description: 'Eliminación selectiva de hojas para mejorar la penetración de luz',
      icon: '🌿'
    }
  ];

  const selectedPruningType = pruningTypes.find(p => p.value === type);
  const isFormValid = type;

  return (
    <Layout title="Nueva Poda">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información de la poda */}
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
                      <ContentCutIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Datos de la Poda
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha de la poda"
                          value={pruningDate}
                          onChange={(newValue) => setPruningDate(newValue)}
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
                      {selectedPruningType && (
                        <Alert 
                          severity="info" 
                          icon={<InfoIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            {selectedPruningType.label}
                          </Typography>
                          <Typography variant="body2">
                            {selectedPruningType.description}
                          </Typography>
                        </Alert>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Notas adicionales (opcional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Observaciones sobre la poda, estado de la planta, razón de la poda, etc."
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

            {/* Guía de tipos de poda */}
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
                      <GrassIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Guía de Tipos de Poda
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Información sobre cada tipo de poda disponible
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    {pruningTypes.map((pruningType, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper 
                          elevation={type === pruningType.value ? 3 : 1}
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            border: type === pruningType.value 
                              ? `2px solid ${theme.palette.success.main}` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: type === pruningType.value 
                              ? alpha(theme.palette.success.main, 0.05) 
                              : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`
                            }
                          }}
                          onClick={() => setType(pruningType.value)}
                        >
                          <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                              {pruningType.icon}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {pruningType.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pruningType.description}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNewPruning}
                  disabled={!isFormValid}
                  startIcon={<SaveIcon />}
                  size="large"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Registrar Poda
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewPruning;
