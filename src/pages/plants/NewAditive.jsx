import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Input,
  Select,
  MenuItem,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  ButtonGroup,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Divider,
  Stack,
  Chip,
  Container,
  CardHeader,
  IconButton,
  Avatar,
  Tooltip
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import BugReportIcon from '@mui/icons-material/BugReport';

const NewAditive = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [dosisList, setDosisList] = useState([]);
  const [dosis, setDosis] = useState("");
  const [dosisMeasure, setDosisMeasure] = useState("");
  const [dosisName, setDosisName] = useState("");

  const handleNewAditive = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/aditives`
      )
      .push({
        type: type,
        name: name,
        brand: brand,
        dosis: dosisList
      });

    setName("");
    setType("");
    setBrand("");
    setDosisList([]);

    navigate(`/Aditivos`);
  };

  const handleAddDosis = () => {
    let auxDosis = [...dosisList];
    auxDosis.push({ quantity: dosis, measure: dosisMeasure, name: dosisName });
    setDosisList(auxDosis);
    setDosis("");
    setDosisMeasure("");
    setDosisName("");
  };

  const handleRemoveDosis = (index) => {
    const newDosisList = dosisList.filter((_, i) => i !== index);
    setDosisList(newDosisList);
  };

  const isFormValid = type && name && brand && dosisList.length > 0;

  const aditivesTypes = [
    {
      value: 'Fertilizante',
      label: 'Fertilizante',
      description: 'Nutrientes para el crecimiento y desarrollo de la planta',
      icon: <LocalPharmacyIcon />,
      color: theme.palette.success.main
    },
    {
      value: 'Insecticida',
      label: 'Insecticida',
      description: 'Protección contra plagas e insectos dañinos',
      icon: <BugReportIcon />,
      color: theme.palette.warning.main
    }
  ];

  return (
    <Layout title="Nuevo Aditivo">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información básica del aditivo */}
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
                      <ScienceIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Información del Aditivo
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nombre del aditivo"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                        placeholder="Ej: Bio Grow, Top Max, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Marca"
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                        fullWidth
                        placeholder="Ej: BioBizz, Advanced Nutrients, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
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
                          <ScienceIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                            💡 Información importante
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Los aditivos se guardan en tu biblioteca personal y estarán disponibles para usar en <strong>todas tus plantas</strong> durante riegos y aplicaciones de insecticidas.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Selección de tipo */}
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
                      <LocalPharmacyIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Tipo de Aditivo
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Selecciona el tipo de aditivo que estás agregando
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
                    {aditivesTypes.map((aditive, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper 
                          elevation={type === aditive.value ? 3 : 1}
                          sx={{ 
                            p: 3,
                            borderRadius: 2,
                            border: type === aditive.value 
                              ? `2px solid ${aditive.color}` 
                              : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            bgcolor: type === aditive.value 
                              ? alpha(aditive.color, 0.05) 
                              : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(aditive.color, 0.2)}`
                            }
                          }}
                          onClick={() => setType(aditive.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(aditive.color, 0.1),
                                color: aditive.color,
                                width: 48,
                                height: 48
                              }}
                            >
                              {aditive.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="medium" gutterBottom>
                                {aditive.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {aditive.description}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Gestión de dosis */}
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
                        Configuración de Dosis
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Define las dosis recomendadas para diferentes etapas
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
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      mb: 3
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                      Agregar nueva dosis
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Etapa"
                          type="text"
                          value={dosisName}
                          onChange={(e) => setDosisName(e.target.value)}
                          fullWidth
                          placeholder="Ej: Vegetativo, Floración, etc."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Cantidad"
                          type="number"
                          value={dosis}
                          onChange={(e) => setDosis(e.target.value)}
                          fullWidth
                          inputProps={{ min: 0, step: 0.1 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Medida</InputLabel>
                          <Select
                            value={dosisMeasure}
                            label="Medida"
                            onChange={(e) => setDosisMeasure(e.target.value)}
                            sx={{
                              borderRadius: 2
                            }}
                          >
                            <MenuItem value='Ml/L'>Ml/L</MenuItem>
                            <MenuItem value='Grs/L'>Grs/L</MenuItem>
                            <MenuItem value='Cm3/L'>Cm3/L</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleAddDosis}
                          disabled={!dosisName || !dosis || !dosisMeasure}
                          fullWidth
                          startIcon={<AddIcon />}
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
                          Agregar
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {dosisList.length > 0 && (
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                        Dosis configuradas ({dosisList.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {dosisList.map((item, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card 
                              elevation={1}
                              sx={{ 
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                position: 'relative'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: theme.palette.info.main,
                                    width: 40,
                                    height: 40
                                  }}
                                >
                                  <ScienceIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    {item.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.quantity} {item.measure}
                                  </Typography>
                                </Box>
                                <Tooltip title="Eliminar dosis">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleRemoveDosis(index)}
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
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Botón de acción */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNewAditive}
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
                  Guardar Aditivo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewAditive;
