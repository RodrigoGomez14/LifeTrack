import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Container,
  LinearProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ForestIcon from '@mui/icons-material/Forest';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SpaIcon from '@mui/icons-material/Spa';
import ScienceIcon from '@mui/icons-material/Science';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpacityIcon from '@mui/icons-material/Opacity';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import ParkIcon from '@mui/icons-material/Park';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const PlantsList = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentPlantId, setCurrentPlantId] = useState(null);
  
  // Función para calcular días entre fechas
  const calculateDaysBetween = (startDateStr, endDateStr = null) => {
    if (!startDateStr) return null;
    
    const startParts = startDateStr.split('/');
    if (startParts.length !== 3) return null;
    
    const startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
    
    let endDate;
    if (endDateStr) {
      const endParts = endDateStr.split('/');
      if (endParts.length === 3) {
        endDate = new Date(parseInt(endParts[2]), parseInt(endParts[1]) - 1, parseInt(endParts[0]));
      } else {
        endDate = new Date();
      }
    } else {
      endDate = new Date();
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Función para calcular días en cada etapa
  const calculateDaysInStage = (plant, stageName) => {
    if (stageName === 'Germinacion' && plant.birthDate) {
      if (plant.inicioVegetativo) {
        return calculateDaysBetween(plant.birthDate, plant.inicioVegetativo);
      } else if (plant.etapa === 'Germinacion') {
        return calculateDaysBetween(plant.birthDate);
      }
    } else if (stageName === 'Vegetativo' && plant.inicioVegetativo) {
      if (plant.inicioFloracion) {
        return calculateDaysBetween(plant.inicioVegetativo, plant.inicioFloracion);
      } else if (plant.etapa === 'Vegetativo') {
        return calculateDaysBetween(plant.inicioVegetativo);
      }
    } else if (stageName === 'Floracion' && plant.inicioFloracion) {
      if (plant.finishDate) {
        return calculateDaysBetween(plant.inicioFloracion, plant.finishDate);
      } else if (plant.etapa === 'Floracion') {
        return calculateDaysBetween(plant.inicioFloracion);
      }
    } else if (stageName === 'Secado' && plant.finishDate) {
      if (plant.finalSecado) {
        return calculateDaysBetween(plant.finishDate, plant.finalSecado);
      } else if (plant.etapa === 'Secado') {
        return calculateDaysBetween(plant.finishDate);
      }
    }
    return null;
  };

  // Función para calcular días totales de vida
  const calculateTotalLifeDays = (plant) => {
    let totalDays = 0;
    
    const germinacionDays = calculateDaysInStage(plant, 'Germinacion');
    if (germinacionDays) totalDays += germinacionDays;
    
    const vegetativoDays = calculateDaysInStage(plant, 'Vegetativo');
    if (vegetativoDays) totalDays += vegetativoDays;
    
    const floracionDays = calculateDaysInStage(plant, 'Floracion');
    if (floracionDays) totalDays += floracionDays;
    
    const secadoDays = calculateDaysInStage(plant, 'Secado');
    if (secadoDays) totalDays += secadoDays;
    
    return totalDays > 0 ? totalDays : null;
  };

  // Función para obtener el ícono de etapa
  const getStageIcon = (stage) => {
    switch(stage) {
      case 'Germinacion':
        return <SpaIcon fontSize="small" />;
      case 'Vegetativo':
        return <GrassIcon fontSize="small" />;
      case 'Floracion':
        return <LocalFloristIcon fontSize="small" />;
      case 'Secado':
        return <ParkIcon fontSize="small" />;
      case 'Enfrascado':
        return <ForestIcon fontSize="small" />;
      default:
        return <ForestIcon fontSize="small" />;
    }
  };

  // Función para obtener el color de etapa
  const getStageColor = (stage) => {
    switch(stage) {
      case 'Germinacion':
        return theme.palette.info.main;
      case 'Vegetativo':
        return theme.palette.success.main;
      case 'Floracion':
        return theme.palette.warning.main;
      case 'Secado':
        return theme.palette.error.main;
      case 'Enfrascado':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Filtrar plantas según término de búsqueda
  const filteredPlants = userData?.plants?.active 
    ? Object.entries(userData.plants.active)
      .filter(([id, plant]) => plant.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
    : [];

  // Variable para plantas archivadas
  const archivedPlants = (() => {
    if (!userData?.plants) return [];
    
    if (userData.plants.history && typeof userData.plants.history === 'object') {
      return Object.entries(userData.plants.history)
        .filter(([key, plant]) => 
          plant && typeof plant === 'object' && 
          (!searchTerm || (plant.name && plant.name.toLowerCase().includes(searchTerm.toLowerCase())))
        )
        .sort((a, b) => {
          if (a[1]?.name && b[1]?.name) return a[1].name.localeCompare(b[1].name);
          return 0;
        });
    }
    
    return [];
  })();

  // Función para obtener un ícono aleatorio para las plantas que no tienen imágenes
  const getPlantIcon = (index) => {
    const icons = [
      <GrassIcon fontSize="large" />,
      <LocalFloristIcon fontSize="large" />,
      <SpaIcon fontSize="large" />
    ];
    return icons[index % icons.length];
  };

  // Manejadores para el menú contextual
  const handleOpenMenu = (event, plantId) => {
    event.stopPropagation();
    event.preventDefault();
    setCurrentPlantId(plantId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOptionSelect = (option) => {
    handleCloseMenu();
    
    switch (option) {
      case 'edit':
        navigate(`/EditarPlanta/?${currentPlantId}`);
        break;
      case 'delete':
        // Lógica para eliminar planta (añadir confirmación)
        break;
      default:
        break;
    }
  };

  return (
    <Layout title="Mis Plantas">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ mb: 4, mt: { xs: 6, sm: 8 } }}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2.5, 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.07)}`,
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8} md={9}>
                <TextField
                  placeholder="Buscar plantas por nombre, tipo o genética..."
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                  sx={{ 
                    '& .MuiInputBase-root': {
                      height: 56,
                      fontSize: '1.05rem',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Button 
                  variant="contained" 
                  startIcon={<ScienceIcon />}
                  component={Link}
                  to="/Aditivos"
                  size="large"
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    color: '#ffffff',
                    borderRadius: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                    padding: '12px 24px',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { sm: '180px' },
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                  }}
                >
                  Ver Aditivos
                </Button>
              </Grid>
              {searchTerm && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip 
                      label={`${filteredPlants.length} resultados encontrados`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onDelete={() => setSearchTerm('')}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>

        {userData?.plants ? (
          <>
            <Card 
              elevation={3} 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ 
                p: 2, 
                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                color: '#ffffff',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 'medium',
                    color: '#ffffff' 
                  }}
                >
                  <ForestIcon sx={{ mr: 1, color: '#ffffff' }} />
                  Plantas Activas 
                  <Chip 
                    label={filteredPlants.length} 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      bgcolor: alpha('#ffffff', 0.2),
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }} 
                  />
                </Typography>
              </Box>
            </Card>
            
            {filteredPlants.length > 0 ? (
              <Grid container spacing={3}>
                {filteredPlants.map(([id, plant], index) => {
                  const hasImage = plant.images && Object.keys(plant.images).length > 0;
                  const totalLifeDays = calculateTotalLifeDays(plant);
                  const currentStageDays = calculateDaysInStage(plant, plant.etapa);
                  const stageColor = getStageColor(plant.etapa);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          borderRadius: 3,
                          position: 'relative',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                          },
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleOpenMenu(e, id)}
                            sx={{ 
                              bgcolor: alpha('#ffffff', 0.9),
                              backdropFilter: 'blur(4px)',
                              '&:hover': {
                                bgcolor: '#ffffff'
                              }
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <CardActionArea 
                          component={Link}
                          to={`/Planta/?${id}`}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          {/* Imagen de la planta */}
                          <Box sx={{ 
                            height: 180, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            color: theme.palette.primary.main,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {hasImage ? (
                              <CardMedia
                                component="img"
                                height="180"
                                image={plant.profilePhotoUrl || plant.images[Object.keys(plant.images)[0]].url || plant.images[Object.keys(plant.images)[0]].dataUrl}
                                alt={plant.name}
                                sx={{ 
                                  objectFit: 'cover',
                                  transition: '0.3s transform ease-in-out',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              />
                            ) : getPlantIcon(index)}
                            
                            {/* Overlay con nombre y etapa */}
                            <Box 
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: hasImage ? 
                                  'linear-gradient(transparent, rgba(0,0,0,0.7))' : 
                                  'transparent',
                                p: 2,
                                zIndex: 1
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  color: hasImage ? '#ffffff' : 'text.primary',
                                  textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                                  fontWeight: 'bold',
                                  mb: 1
                                }}
                              >
                                {plant.name}
                              </Typography>
                              
                              <Chip
                                icon={getStageIcon(plant.etapa)}
                                label={plant.etapa}
                                size="small"
                                sx={{
                                  bgcolor: alpha(stageColor, hasImage ? 0.9 : 0.1),
                                  color: hasImage ? '#ffffff' : stageColor,
                                  fontWeight: 'medium',
                                  border: hasImage ? `1px solid ${alpha('#ffffff', 0.3)}` : 'none'
                                }}
                              />
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                            {/* Información básica */}
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                {plant.genetic && (
                                  <Chip 
                                    label={plant.genetic} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                      color: theme.palette.secondary.main,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                )}
                                {plant.potVolume && (
                                  <Chip 
                                    label={`${plant.potVolume}L`} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      color: theme.palette.info.main,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Información de tiempo de vida */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon fontSize="small" />
                                Tiempo de vida
                              </Typography>
                              
                              <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 1 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" fontWeight="bold" color={stageColor}>
                                    {totalLifeDays || 0}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    días totales
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" fontWeight="bold" color={stageColor}>
                                    {currentStageDays || 0}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    en {plant.etapa}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                            
                            {/* Información de etapas completadas */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarTodayIcon fontSize="small" />
                                Etapas completadas
                              </Typography>
                              
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {plant.birthDate && (
                                  <Chip
                                    icon={<SpaIcon fontSize="small" />}
                                    label={`G: ${calculateDaysInStage(plant, 'Germinacion') || 0}d`}
                                    size="small"
                                    variant={plant.etapa === 'Germinacion' ? 'filled' : 'outlined'}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      height: 24,
                                      bgcolor: plant.etapa === 'Germinacion' ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                                      color: theme.palette.info.main,
                                      borderColor: theme.palette.info.main
                                    }}
                                  />
                                )}
                                
                                {plant.inicioVegetativo && (
                                  <Chip
                                    icon={<GrassIcon fontSize="small" />}
                                    label={`V: ${calculateDaysInStage(plant, 'Vegetativo') || 0}d`}
                                    size="small"
                                    variant={plant.etapa === 'Vegetativo' ? 'filled' : 'outlined'}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      height: 24,
                                      bgcolor: plant.etapa === 'Vegetativo' ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                                      color: theme.palette.success.main,
                                      borderColor: theme.palette.success.main
                                    }}
                                  />
                                )}
                                
                                {plant.inicioFloracion && (
                                  <Chip
                                    icon={<LocalFloristIcon fontSize="small" />}
                                    label={`F: ${calculateDaysInStage(plant, 'Floracion') || 0}d`}
                                    size="small"
                                    variant={plant.etapa === 'Floracion' ? 'filled' : 'outlined'}
                                    sx={{ 
                                      fontSize: '0.7rem',
                                      height: 24,
                                      bgcolor: plant.etapa === 'Floracion' ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                                      color: theme.palette.warning.main,
                                      borderColor: theme.palette.warning.main
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                            
                            {/* Información de peso (solo si existe) */}
                            {(plant.pesoHumedo || plant.pesoSeco) && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScaleIcon fontSize="small" />
                                  Peso registrado
                                </Typography>
                                
                                <Stack direction="row" spacing={2} justifyContent="space-around">
                                  {plant.pesoHumedo && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="bold" color={theme.palette.warning.main}>
                                        {plant.pesoHumedo}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        húmedo
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {plant.pesoSeco && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="bold" color={theme.palette.success.main}>
                                        {plant.pesoSeco}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        seco
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4,
                mb: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
                border: `1px dashed ${theme.palette.divider}`,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`
              }}>
                <ForestIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay plantas activas
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primera planta para comenzar'}
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/NuevaPlanta"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: '#ffffff',
                    borderRadius: 8,
                    px: 3,
                    py: 1,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    }
                  }}
                >
                  Agregar Planta
                </Button>
              </Box>
            )}
            
            {/* Sección de Archivo de Plantas */}
            <Card 
              elevation={3} 
              sx={{ 
                mt: 6,
                mb: 4, 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.1)}`,
              }}
            >
              <Box sx={{ 
                p: 2, 
                background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                color: '#ffffff',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 'medium',
                    color: '#ffffff' 
                  }}
                >
                  <HistoryIcon sx={{ mr: 1, color: '#ffffff' }} />
                  Archivo de Plantas 
                  <Chip 
                    label={archivedPlants.length} 
                    size="small" 
                    sx={{ 
                      ml: 1, 
                      bgcolor: alpha('#ffffff', 0.2),
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }} 
                  />
                </Typography>
              </Box>
            </Card>
            
            {archivedPlants.length > 0 ? (
              <Grid container spacing={3}>
                {archivedPlants.map(([id, plant], index) => {
                  if (!plant || typeof plant !== 'object' || !plant.name) {
                    return null;
                  }
                  
                  const hasImage = plant.images && Object.keys(plant.images).length > 0;
                  const totalLifeDays = calculateTotalLifeDays(plant);
                  const stageColor = getStageColor(plant.etapa);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={id}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          borderRadius: 3,
                          position: 'relative',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 10px 20px ${alpha(theme.palette.secondary.main, 0.15)}`
                          },
                          opacity: 0.95,
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                          <Chip
                            size="small"
                            label="Archivada"
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.2),
                              color: theme.palette.secondary.main,
                              fontWeight: 'medium',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        
                        <CardActionArea 
                          component={Link}
                          to={`/Planta/?${id}`}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          {/* Imagen de la planta */}
                          <Box sx={{ 
                            height: 160, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            color: theme.palette.secondary.main,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {hasImage ? (
                              <CardMedia
                                component="img"
                                height="160"
                                image={
                                  plant.profilePhotoUrl || 
                                  (plant.images && Object.keys(plant.images).length > 0 && 
                                    (plant.images[Object.keys(plant.images)[0]]?.url || 
                                     plant.images[Object.keys(plant.images)[0]]?.dataUrl)
                                  )
                                }
                                alt={plant.name}
                                sx={{ 
                                  objectFit: 'cover',
                                  opacity: 0.9,
                                  filter: 'grayscale(20%)',
                                }}
                              />
                            ) : getPlantIcon(index)}
                            
                            {/* Overlay con nombre */}
                            <Box 
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: hasImage ? 
                                  'linear-gradient(transparent, rgba(0,0,0,0.6))' : 
                                  'transparent',
                                p: 2,
                                zIndex: 1
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  color: hasImage ? '#ffffff' : 'text.primary',
                                  textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                                  fontWeight: 'bold'
                                }}
                              >
                                {plant.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                            {/* Información de finalización */}
                            {plant.finishDate && (
                              <Box sx={{ mb: 2 }}>
                                <Chip 
                                  icon={<HistoryIcon fontSize="small" />}
                                  label={`Completada: ${plant.finishDate}`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                    fontSize: '0.75rem',
                                    width: '100%',
                                    justifyContent: 'flex-start'
                                  }}
                                />
                              </Box>
                            )}
                            
                            {/* Información básica */}
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {plant.genetic && (
                                  <Chip 
                                    label={plant.genetic} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                      color: theme.palette.secondary.main,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                )}
                                
                                <Chip
                                  icon={getStageIcon(plant.etapa)}
                                  label={plant.etapa}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(stageColor, 0.1),
                                    color: stageColor,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Stack>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Información de tiempo total */}
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon fontSize="small" />
                                Ciclo completo
                              </Typography>
                              
                              <Typography variant="h6" fontWeight="bold" color={theme.palette.secondary.main} sx={{ textAlign: 'center' }}>
                                {totalLifeDays || 0} días
                              </Typography>
                            </Box>
                            
                            {/* Información de peso final */}
                            {(plant.pesoHumedo || plant.pesoSeco) && (
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScaleIcon fontSize="small" />
                                  Cosecha final
                                </Typography>
                                
                                <Stack direction="row" spacing={2} justifyContent="space-around">
                                  {plant.pesoHumedo && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="bold" color={theme.palette.warning.main}>
                                        {plant.pesoHumedo}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        húmedo
                                      </Typography>
                                    </Box>
                                  )}
                                  
                                  {plant.pesoSeco && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="bold" color={theme.palette.success.main}>
                                        {plant.pesoSeco}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        seco
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                p: 4, 
                mb: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
                border: `1px dashed ${theme.palette.divider}`,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`
              }}>
                <HistoryIcon sx={{ fontSize: 60, color: alpha(theme.palette.secondary.main, 0.2), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay plantas archivadas
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Cuando coseches plantas, aparecerán aquí para mantener un historial
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            p: 4, 
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`
          }}>
            <ForestIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aún no tienes plantas
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Agrega tu primera planta para comenzar a hacer seguimiento
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              component={Link}
              to="/NuevaPlanta"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: '#ffffff',
                borderRadius: 8,
                px: 3,
                py: 1,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark
                }
              }}
            >
              Agregar Planta
            </Button>
          </Box>
        )}
      </Container>
      
      {/* Menú contextual simplificado */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            borderRadius: 2,
            overflow: 'visible',
            mt: 1,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
      >
        <MenuItem onClick={() => handleOptionSelect('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Editar planta</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOptionSelect('delete')} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Layout>
  );
};

export default PlantsList;
