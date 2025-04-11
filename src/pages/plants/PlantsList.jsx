import React, { useState, useRef } from 'react';
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
  Fab, 
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
  Backdrop,
  Zoom,
  Container
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ForestIcon from '@mui/icons-material/Forest';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpaIcon from '@mui/icons-material/Spa';
import FilterListIcon from '@mui/icons-material/FilterList';
import ScienceIcon from '@mui/icons-material/Science';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import OpacityIcon from '@mui/icons-material/Opacity';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';

const PlantsList = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentPlantId, setCurrentPlantId] = useState(null);
  const [showDetailBackdrop, setShowDetailBackdrop] = useState(false);
  const [detailPlant, setDetailPlant] = useState(null);
  const [sort, setSortMethod] = useState('name');
  
  // Debugging userData structure
  console.log("userData:", userData);
  console.log("userData?.plants:", userData?.plants);
  
  // Filtrar plantas según término de búsqueda
  const filteredPlants = userData?.plants?.active 
    ? Object.entries(userData.plants.active)
      .filter(([id, plant]) => plant.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
    : [];

  // Variable para plantas archivadas - mejorar acceso a los datos
  const archivedPlants = (() => {
    if (!userData?.plants) return [];
    
    // Intentar acceder a history directamente
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
    
    // Intentar con "archived" como alternativa
    if (userData.plants.archived && typeof userData.plants.archived === 'object') {
      return Object.entries(userData.plants.archived)
        .filter(([key, plant]) => 
          plant && typeof plant === 'object' && 
          (!searchTerm || (plant.name && plant.name.toLowerCase().includes(searchTerm.toLowerCase())))
        )
        .sort((a, b) => {
          if (a[1]?.name && b[1]?.name) return a[1].name.localeCompare(b[1].name);
          return 0;
        });
    }
    
    // Buscar en posibles propiedades alternativas
    for (const key in userData.plants) {
      if (key !== 'active' && typeof userData.plants[key] === 'object') {
        console.log(`Revisando propiedad alternativa: ${key}`);
        const entries = Object.entries(userData.plants[key]);
        // Revisar si esta propiedad contiene plantas archivadas
        for (const [id, possiblePlant] of entries) {
          if (possiblePlant && typeof possiblePlant === 'object' && possiblePlant.finishDate) {
            console.log(`Posible colección de plantas archivadas encontrada en: ${key}`);
            return entries
              .filter(([_, plant]) => 
                plant && typeof plant === 'object' && 
                (!searchTerm || (plant.name && plant.name.toLowerCase().includes(searchTerm.toLowerCase())))
              )
              .sort((a, b) => {
                if (a[1]?.name && b[1]?.name) return a[1].name.localeCompare(b[1].name);
                return 0;
              });
          }
        }
      }
    }
    
    console.log("No se encontraron plantas archivadas en ninguna estructura");
    return [];
  })();
  
  console.log("Plantas archivadas encontradas:", archivedPlants);

  // Función para obtener un ícono aleatorio para las plantas que no tienen imágenes
  const getPlantIcon = (index) => {
    const icons = [
      <GrassIcon fontSize="large" />,
      <LocalFloristIcon fontSize="large" />,
      <SpaIcon fontSize="large" />
    ];
    return icons[index % icons.length];
  };

  // Función para obtener estadísticas de una planta
  const getPlantStats = (plant) => {
    const stats = [
      { 
        label: 'Riegos', 
        value: plant.irrigations ? Object.keys(plant.irrigations).length : 0,
        icon: <WaterDropIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.info.main
      },
      { 
        label: 'Podas', 
        value: plant.prunings ? Object.keys(plant.prunings).length : 0,
        icon: <ScienceIcon sx={{ fontSize: 16 }} />,
        color: theme.palette.success.main
      }
    ];
    return stats;
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
        // ...
        break;
      case 'calendar':
        navigate(`/PlantaCalendario/?${currentPlantId}`);
        break;
      case 'water':
        navigate(`/NuevoRiego/?${currentPlantId}`);
        break;
      case 'prune':
        navigate(`/NuevaPoda/?${currentPlantId}`);
        break;
      default:
        break;
    }
  };

  // Manejador para seleccionar planta
  const handlePlantSelect = (plantId) => {
    setSelectedPlant(plantId);
  };

  // Mostrar detalle rápido de planta
  const handleShowDetail = (event, plant, id) => {
    event.stopPropagation();
    event.preventDefault();
    setDetailPlant({...plant, id});
    setShowDetailBackdrop(true);
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
            
            <Grid container spacing={3}>
              {filteredPlants.map(([id, plant], index) => {
                const isSelected = selectedPlant === id;
                const plantStats = getPlantStats(plant);
                const hasImage = plant.images && Object.keys(plant.images).length > 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={id}>
                    <Card 
                      elevation={isSelected ? 3 : 1}
                      onClick={() => handlePlantSelect(id)}
                      sx={{ 
                        borderRadius: 3,
                        position: 'relative',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        transform: isSelected ? 'translateY(-4px)' : 'none',
                        cursor: 'pointer',
                        border: isSelected 
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: isSelected 
                          ? `0 10px 20px ${alpha(theme.palette.primary.main, 0.15)}` 
                          : `0 2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                        },
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleOpenMenu(e, id)}
                          sx={{ 
                            bgcolor: alpha('#ffffff', 0.8),
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
                        <Box sx={{ 
                          height: 160, 
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
                              height="160"
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
                          
                          <Box 
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '40%',
                              background: hasImage ? 
                                'linear-gradient(transparent, rgba(0,0,0,0.6))' : 
                                'transparent',
                              display: 'flex',
                              alignItems: 'flex-end',
                              px: 2,
                              py: 1,
                              zIndex: 1
                            }}
                          >
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{
                                color: hasImage ? '#ffffff' : 'text.primary',
                                textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                                fontWeight: 'medium',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              {plant.name}
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleShowDetail(e, plant, id)}
                                sx={{ 
                                  color: hasImage ? '#ffffff' : theme.palette.primary.main,
                                  bgcolor: hasImage ? 
                                    alpha('#ffffff', 0.2) : 
                                    alpha(theme.palette.primary.main, 0.1),
                                  backdropFilter: 'blur(4px)',
                                  '&:hover': {
                                    bgcolor: hasImage ? 
                                      alpha('#ffffff', 0.3) : 
                                      alpha(theme.palette.primary.main, 0.2)
                                  }
                                }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Typography>
                          </Box>
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              icon={<LocalFloristIcon fontSize="small" />}
                              label={`${plant.quantity} unid.`} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                borderRadius: 1.5
                              }}
                            />
                            {plant.potVolume && (
                              <Chip 
                                label={`${plant.potVolume}L`} 
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.light, 0.2),
                                  color: theme.palette.primary.dark,
                                  borderRadius: 1.5
                                }}
                              />
                            )}
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Stack direction="row" spacing={2} justifyContent="space-around" mt={2}>
                            {plantStats.map((stat, idx) => (
                              <Box key={idx} sx={{ textAlign: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    mb: 0.5,
                                    mx: 'auto'
                                  }}
                                >
                                  {stat.icon}
                                </Avatar>
                                <Typography variant="body2" fontWeight="medium" color={theme.palette.primary.main}>
                                  {stat.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {stat.label}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {/* Sección de Archivo de Plantas - siempre visible */}
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
                  if (!plant || typeof plant !== 'object') {
                    console.log("Datos de planta archivada inválidos:", id, plant);
                    return null;
                  }
                  
                  const isSelected = selectedPlant === id;
                  const plantStats = getPlantStats(plant);
                  const hasImage = plant.images && Object.keys(plant.images).length > 0;
                  
                  // Verificar que la planta tiene datos válidos para mostrar
                  const hasValidData = plant.name && typeof plant.name === 'string';
                  if (!hasValidData) {
                    console.log("Planta sin datos válidos:", id, plant);
                    return null;
                  }
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={id}>
                      <Card 
                        elevation={isSelected ? 3 : 1}
                        onClick={() => handlePlantSelect(id)}
                        sx={{ 
                          borderRadius: 3,
                          position: 'relative',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          transform: isSelected ? 'translateY(-4px)' : 'none',
                          cursor: 'pointer',
                          border: isSelected 
                            ? `2px solid ${theme.palette.secondary.main}`
                            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: isSelected 
                            ? `0 10px 20px ${alpha(theme.palette.secondary.main, 0.15)}` 
                            : `0 2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 10px 20px ${alpha(theme.palette.secondary.main, 0.15)}`
                          },
                          opacity: 0.9,
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
                                  ) || 
                                  'https://placehold.co/600x400?text=Planta'
                                }
                                alt={plant.name}
                                sx={{ 
                                  objectFit: 'cover',
                                  opacity: 0.9,
                                  filter: 'grayscale(20%)',
                                }}
                              />
                            ) : getPlantIcon(index)}
                            
                            <Box 
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '40%',
                                background: hasImage ? 
                                  'linear-gradient(transparent, rgba(0,0,0,0.6))' : 
                                  'transparent',
                                display: 'flex',
                                alignItems: 'flex-end',
                                px: 2,
                                py: 1,
                                zIndex: 1
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  color: hasImage ? '#ffffff' : 'text.primary',
                                  textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                                  fontWeight: 'medium',
                                  width: '100%',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                {plant.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                              {plant.finishDate && (
                                <Chip 
                                  icon={<HistoryIcon fontSize="small" />}
                                  label={`Completada: ${plant.finishDate}`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                    borderRadius: 1.5,
                                    mb: 1,
                                    width: '100%'
                                  }}
                                />
                              )}
                              
                              {plant.quantity && (
                                <Chip 
                                  icon={<LocalFloristIcon fontSize="small" />}
                                  label={`${plant.quantity} unid.`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    color: theme.palette.secondary.main,
                                    borderRadius: 1.5
                                  }}
                                />
                              )}
                              
                              {plant.genetic && (
                                <Chip 
                                  label={plant.genetic} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.secondary.light, 0.2),
                                    color: theme.palette.secondary.dark,
                                    borderRadius: 1.5
                                  }}
                                />
                              )}
                            </Box>
                            
                            {plant.wetFlowersWeight && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Cosecha:
                                </Typography>
                                <Stack direction="row" spacing={2} justifyContent="space-around">
                                  {plant.wetFlowersWeight && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="medium" color={theme.palette.secondary.main}>
                                        {plant.wetFlowersWeight}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Flores húmedas
                                      </Typography>
                                    </Box>
                                  )}
                                  {plant.dryFlowersWeight && (
                                    <Box sx={{ textAlign: 'center' }}>
                                      <Typography variant="body2" fontWeight="medium" color={theme.palette.secondary.main}>
                                        {plant.dryFlowersWeight}g
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Flores secas
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
            
            {filteredPlants.length === 0 && archivedPlants.length === 0 && (
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
                  No se encontraron plantas
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
      
      {/* Componente de depuración solo visible en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 9999,
          maxWidth: 350,
          maxHeight: 400,
          overflow: 'auto',
          p: 2,
          borderRadius: 2,
          bgcolor: 'rgba(0,0,0,0.8)',
          color: 'white',
          backdropFilter: 'blur(8px)',
          display: 'none', // Inicialmente oculto, cambiar a 'block' para activar
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Debug Data:</Typography>
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({ 
              userData: userData,
              archivedPlants: archivedPlants,
              filteredPlants: filteredPlants
            }, null, 2)}
          </pre>
        </Box>
      )}
      
      {/* Menú contextual para opciones de planta */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
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
        <MenuItem onClick={() => handleOptionSelect('calendar')}>
          <ListItemIcon>
            <EventIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText>Ver calendario</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect('water')}>
          <ListItemIcon>
            <OpacityIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText>Registrar riego</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect('prune')}>
          <ListItemIcon>
            <ContentCutIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Registrar poda</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleOptionSelect('delete')} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Backdrop para vista rápida */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showDetailBackdrop}
        onClick={() => setShowDetailBackdrop(false)}
      >
        {detailPlant && (
          <Zoom in={showDetailBackdrop}>
            <Paper
              elevation={4}
              sx={{
                width: { xs: '90%', sm: '70%', md: '50%' },
                maxWidth: 500,
                maxHeight: '80vh',
                overflow: 'auto',
                borderRadius: 2,
                p: 3
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {detailPlant.name}
                </Typography>
                <IconButton onClick={() => setShowDetailBackdrop(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Información General
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      icon={<LocalFloristIcon fontSize="small" />}
                      label={`${detailPlant.quantity} unidades`} 
                      size="small" 
                      sx={{ mr: 1, mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                    {detailPlant.potVolume && (
                      <Chip 
                        label={`Maceta de ${detailPlant.potVolume}L`} 
                        size="small"
                        sx={{ mr: 1, mb: 1, bgcolor: alpha(theme.palette.primary.light, 0.2) }}
                      />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to={`/Planta/?${detailPlant.id}`}
                    sx={{ borderRadius: 2 }}
                  >
                    Ver detalles completos
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Zoom>
        )}
      </Backdrop>
    </Layout>
  );
};

export default PlantsList;
