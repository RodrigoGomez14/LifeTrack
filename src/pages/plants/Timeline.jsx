import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { 
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import { useStore } from '../../store';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import { useTheme, alpha } from '@mui/material/styles';
import { checkSearch } from "../../utils";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Global } from '@emotion/react';

// Función auxiliar para convertir fechas a formato detallado
const convertToDetailedDate = (dateString) => {
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  // Formatear la fecha con el día de la semana y el mes completo
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  // Función capitalize inline para evitar dependencia externa
  const formatStr = date.toLocaleDateString('es-ES', options);
  return formatStr.charAt(0).toUpperCase() + formatStr.slice(1);
};

const Timeline = () => {
  const { userData } = useStore();
  const location = useLocation();
  const theme = useTheme();
  
  // Scroll al inicio de la página cuando se carga el componente
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Obtener la planta desde el store
  const id = checkSearch(location.search);
  let plant = null;
  
  // Buscar en plantas activas
  if (userData?.plants?.active && userData.plants.active[id]) {
    plant = {...userData.plants.active[id], id};
  } 
  // Si no está en activas, buscar en plantas archivadas
  else if (userData?.plants?.history && userData.plants.history[id]) {
    plant = {...userData.plants.history[id], id, isArchived: true};
  }
  // Buscar en otras posibles ubicaciones
  else if (userData?.plants) {
    // Verificar si existe la propiedad 'archived'
    if (userData.plants.archived && userData.plants.archived[id]) {
      plant = {...userData.plants.archived[id], id, isArchived: true};
    } else {
      // Buscar en todas las propiedades que no sean 'active'
      for (const key in userData.plants) {
        if (key !== 'active' && typeof userData.plants[key] === 'object') {
          for (const plantId in userData.plants[key]) {
            if (plantId === id) {
              plant = {...userData.plants[key][plantId], id, isArchived: true};
              break;
            }
          }
          if (plant) break;
        }
      }
    }
  }

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

  // Función para determinar la etapa en una fecha específica
  const getStageAtDate = (dateStr) => {
    const eventDate = new Date(dateStr.split('/').reverse().join('-'));
    
    // Convertir fechas de etapas a objetos Date para comparación
    const birthDate = plant.birthDate ? new Date(plant.birthDate.split('/').reverse().join('-')) : null;
    const vegDate = plant.inicioVegetativo ? new Date(plant.inicioVegetativo.split('/').reverse().join('-')) : null;
    const florDate = plant.inicioFloracion ? new Date(plant.inicioFloracion.split('/').reverse().join('-')) : null;
    const harvestDate = plant.finishDate ? new Date(plant.finishDate.split('/').reverse().join('-')) : null;
    const dryEndDate = plant.finalSecado ? new Date(plant.finalSecado.split('/').reverse().join('-')) : null;
    
    if (dryEndDate && eventDate >= dryEndDate) {
      return { stage: 'Enfrascado', startDate: plant.finalSecado };
    } else if (harvestDate && eventDate >= harvestDate) {
      return { stage: 'Secado', startDate: plant.finishDate };
    } else if (florDate && eventDate >= florDate) {
      return { stage: 'Floración', startDate: plant.inicioFloracion };
    } else if (vegDate && eventDate >= vegDate) {
      return { stage: 'Vegetativo', startDate: plant.inicioVegetativo };
    } else if (birthDate && eventDate >= birthDate) {
      return { stage: 'Germinación', startDate: plant.birthDate };
    }
    
    return { stage: 'Sin determinar', startDate: null };
  };

  // Función para calcular días totales de vida hasta una fecha específica
  const calculateTotalLifeDays = (dateStr) => {
    if (!plant.birthDate) return null;
    return calculateDaysBetween(plant.birthDate, dateStr);
  };

  // Función para generar datos de la línea de tiempo
  const generateTimelineData = () => {
    if (!plant) return [];
    
    const timelineEvents = [];
    
    // Agregar eventos de etapas de crecimiento
    if (plant.birthDate) {
      timelineEvents.push({
        date: plant.birthDate,
        type: 'Etapa',
        title: 'Inicio de Germinación',
        description: `La planta "${plant.name}" comenzó su ciclo de vida`,
        icon: <SpaIcon />,
        color: '#8e24aa',
        stage: 'Germinacion',
        timestamp: new Date(plant.birthDate.split('/').reverse().join('-')).getTime(),
        sortOrder: 0 // Las etapas tienen prioridad
      });
    }
    
    if (plant.inicioVegetativo) {
      timelineEvents.push({
        date: plant.inicioVegetativo,
        type: 'Etapa',
        title: 'Inicio de Vegetativo',
        description: `La planta entró en etapa vegetativa`,
        icon: <GrassIcon />,
        color: '#8e24aa',
        stage: 'Vegetativo',
        timestamp: new Date(plant.inicioVegetativo.split('/').reverse().join('-')).getTime(),
        sortOrder: 0
      });
    }
    
    if (plant.inicioFloracion) {
      timelineEvents.push({
        date: plant.inicioFloracion,
        type: 'Etapa',
        title: 'Inicio de Floración',
        description: `La planta entró en etapa de floración`,
        icon: <LocalFloristIcon />,
        color: '#8e24aa',
        stage: 'Floracion',
        timestamp: new Date(plant.inicioFloracion.split('/').reverse().join('-')).getTime(),
        sortOrder: 0
      });
    }
    
    if (plant.finishDate) {
      timelineEvents.push({
        date: plant.finishDate,
        type: 'Etapa',
        title: 'Cosecha',
        description: `La planta fue cosechada`,
        icon: <LocalFloristIcon />,
        color: '#e65100',
        stage: 'Cosecha',
        timestamp: new Date(plant.finishDate.split('/').reverse().join('-')).getTime(),
        sortOrder: 0
      });
    }
    
    if (plant.finalSecado) {
      timelineEvents.push({
        date: plant.finalSecado,
        type: 'Etapa',
        title: 'Finalización del Secado',
        description: `La planta completó el proceso de secado`,
        icon: <ParkIcon />,
        color: '#8e24aa',
        stage: 'Enfrascado',
        timestamp: new Date(plant.finalSecado.split('/').reverse().join('-')).getTime(),
        sortOrder: 0
      });
    }
    
    // Agregar eventos de acciones
    const actions = [
      { type: 'Riego', data: plant.irrigations, color: theme.palette.info.main, icon: <WaterDropIcon /> },
      { type: 'Insecticida', data: plant.insecticides, color: theme.palette.error.main, icon: <BugReportIcon /> },
      { type: 'Poda', data: plant.prunings, color: theme.palette.success.main, icon: <ContentCutIcon /> },
      { type: 'Transplante', data: plant.transplants, color: theme.palette.warning.main, icon: <SwapHorizIcon /> },
      { type: 'Log', data: plant.logs, color: '#9c27b0', icon: <NoteAltIcon /> }
    ];
    
    actions.forEach(action => {
      if (action.data) {
        Object.keys(action.data).forEach(key => {
          const item = action.data[key];
          if (!item.date) return;
          
          let description = '';
          switch(action.type) {
            case 'Riego':
            case 'Insecticida':
            case 'Poda':
            case 'Transplante':
              description = ''; // Sin descripción para acciones
              break;
            case 'Log':
              description = item.description && item.description.length > 100 
                ? item.description.substring(0, 100) + '...' 
                : item.description || 'Registro sin descripción';
              break;
            default:
              description = '';
          }
          
          // Obtener información de la etapa en esta fecha
          const stageInfo = getStageAtDate(item.date);
          const daysInStage = stageInfo.startDate ? calculateDaysBetween(stageInfo.startDate, item.date) : null;
          const totalLifeDays = calculateTotalLifeDays(item.date);
          
          // Crear timestamp basado en la fecha + tiempo de creación si está disponible
          let timestamp = new Date(item.date.split('/').reverse().join('-')).getTime();
          
          // Si hay timestamp en el item, usarlo para el orden dentro del día
          if (item.timestamp) {
            timestamp = item.timestamp;
          } else if (item.createdAt) {
            timestamp = new Date(item.createdAt).getTime();
          } else {
            // Si no hay timestamp, usar la key como aproximación del orden de creación
            // Las keys suelen ser strings que aumentan con el tiempo
            timestamp += parseInt(key.replace(/\D/g, '')) || 0;
          }
          
          timelineEvents.push({
            date: item.date,
            type: action.type,
            title: action.type,
            description: description,
            icon: action.icon,
            color: action.color,
            details: item,
            timestamp: timestamp,
            sortOrder: 1, // Las acciones van después de las etapas en el mismo día
            key: key, // Incluir la key para orden de fallback
            stageInfo: {
              stage: stageInfo.stage,
              daysInStage: daysInStage,
              weeksInStage: daysInStage ? Math.floor(daysInStage / 7) : null,
              totalLifeDays: totalLifeDays,
              totalLifeWeeks: totalLifeDays ? Math.floor(totalLifeDays / 7) : null
            }
          });
        });
      }
    });
    
    // Agregar fotos agrupadas por fecha
    if (plant.images) {
      const photosByDate = {};
      
      Object.keys(plant.images).forEach(key => {
        const photo = plant.images[key];
        if (!photo.date) return;
        
        if (!photosByDate[photo.date]) {
          photosByDate[photo.date] = [];
        }
        
        photosByDate[photo.date].push({
          ...photo,
          key: key
        });
      });
      
      Object.keys(photosByDate).forEach(date => {
        const photos = photosByDate[date];
        
        // Obtener información de la etapa en esta fecha
        const stageInfo = getStageAtDate(date);
        const daysInStage = stageInfo.startDate ? calculateDaysBetween(stageInfo.startDate, date) : null;
        const totalLifeDays = calculateTotalLifeDays(date);
        
        // Para las fotos, usar el timestamp de la primera foto como referencia
        let timestamp = new Date(date.split('/').reverse().join('-')).getTime();
        
        // Buscar el timestamp más reciente de las fotos de ese día
        const photosWithTimestamp = photos.filter(photo => photo.timestamp || photo.createdAt);
        if (photosWithTimestamp.length > 0) {
          const timestamps = photosWithTimestamp.map(photo => 
            photo.timestamp || new Date(photo.createdAt).getTime()
          );
          timestamp = Math.max(...timestamps);
        } else {
          // Si no hay timestamps, usar las keys como aproximación
          const keyNumbers = photos.map(photo => parseInt(photo.key.replace(/\D/g, '')) || 0);
          timestamp += Math.max(...keyNumbers);
        }
        
        timelineEvents.push({
          date: date,
          type: 'Foto',
          title: `Fotografías (${photos.length})`,
          description: `Se registraron ${photos.length} foto${photos.length > 1 ? 's' : ''} de la planta`,
          icon: <PhotoCameraIcon />,
          color: theme.palette.secondary.main,
          photos: photos,
          timestamp: timestamp,
          sortOrder: 2, // Las fotos van al final del día
          stageInfo: {
            stage: stageInfo.stage,
            daysInStage: daysInStage,
            weeksInStage: daysInStage ? Math.floor(daysInStage / 7) : null,
            totalLifeDays: totalLifeDays,
            totalLifeWeeks: totalLifeDays ? Math.floor(totalLifeDays / 7) : null
          }
        });
      });
    }
    
    // Ordenar eventos por fecha (más recientes primero) y luego por timestamp dentro del día
    timelineEvents.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      
      // Primero ordenar por fecha (más recientes primero)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Si es el mismo día, ordenar por sortOrder y luego por timestamp
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      
      // Dentro del mismo sortOrder, ordenar por timestamp (cronológico dentro del día)
      return a.timestamp - b.timestamp;
    });
    
    return timelineEvents;
  };

  // Estilos globales para la línea de tiempo
  const GlobalStyles = () => {
    return (
      <Global
        styles={{
          // Estilos personalizados para la línea de tiempo
          '.vertical-timeline-element-date': {
            color: `${theme.palette.text.secondary} !important`,
            fontSize: '0.9rem !important',
            fontWeight: '500 !important',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif !important'
          },
          '.vertical-timeline-element-content': {
            boxShadow: 'none !important'
          },
          '.vertical-timeline-element-content-arrow': {
            borderRight: 'none !important'
          },
          '.vertical-timeline::before': {
            background: `${alpha(theme.palette.secondary.main, 0.3)} !important`,
            width: '3px !important'
          },
          '.vertical-timeline-element-icon': {
            width: '50px !important',
            height: '50px !important',
            marginLeft: '-25px !important'
          },
          // Responsive adjustments
          '@media only screen and (max-width: 1170px)': {
            '.vertical-timeline-element-date': {
              display: 'block !important',
              float: 'none !important',
              color: `${theme.palette.text.secondary} !important`,
              fontSize: '0.85rem !important',
              marginTop: '10px !important'
            },
            '.vertical-timeline-element-content': {
              marginLeft: '90px !important'
            }
          }
        }}
      />
    );
  };

  const handleImageClick = (imageUrl) => {
    // Abrir imagen en nueva ventana o modal
    window.open(imageUrl, '_blank');
  };

  if (!plant) {
    return (
      <Layout title="Línea de tiempo">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6" color="text.secondary">
              No se pudo cargar la información de la planta
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  const timelineData = generateTimelineData();

  return (
    <Layout title={`Línea de tiempo - ${plant.name}`}>
      <GlobalStyles />
      
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header principal */}
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            mb: 4,
            mt: 3,
            position: 'relative',
            minHeight: '140px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}
        >
          {/* Overlay decorativo */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
            backdropFilter: 'blur(1px)'
          }} />
          
          {/* Botón de regreso */}
          <Tooltip title="Volver a la planta" arrow>
            <IconButton
              onClick={() => window.history.back()}
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                bgcolor: alpha('#ffffff', 0.9),
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 2,
                '&:hover': {
                  bgcolor: '#ffffff',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowBackIcon sx={{ fontSize: '1.4rem' }} />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ p: 4, pl: 10, position: 'relative', zIndex: 1, minHeight: '140px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 2, md: 3 }
              }}>
                {/* Título y descripción */}
                <Box sx={{ ml: { xs: 0, sm: 2 } }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 'bold',
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      lineHeight: 1.1,
                      mb: 1
                    }}
                  >
                    {plant.name}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.9,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      fontWeight: 'normal'
                    }}
                  >
                    Línea de tiempo - Cronología completa
                  </Typography>
                </Box>
                
                {/* Estadísticas */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3,
                  alignItems: 'center'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      {timelineData.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Eventos totales
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    width: '1px', 
                    height: '40px', 
                    bgcolor: alpha('#ffffff', 0.3)
                  }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      {timelineData.filter(event => event.type === 'Etapa').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Etapas
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Línea de tiempo */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden', 
            mb: 4,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
            width: '100%'
          }}
        >
          <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: theme.palette.background.default,
            minHeight: '400px'
          }}>
            {timelineData.length > 0 ? (
              <VerticalTimeline
                lineColor={alpha(theme.palette.secondary.main, 0.3)}
              >
                {timelineData.map((event, index) => (
                  <VerticalTimelineElement
                    key={`${event.type}-${event.date}-${index}`}
                    className="vertical-timeline-element"
                    date={convertToDetailedDate(event.date)}
                    iconStyle={{
                      background: event.color,
                      color: '#fff',
                      boxShadow: `0 0 0 4px ${alpha(event.color, 0.2)}`,
                      border: `3px solid ${alpha('#ffffff', 0.9)}`
                    }}
                    icon={event.icon}
                    contentStyle={{
                      background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
                      border: `1px solid ${alpha(event.color, 0.3)}`,
                      borderRadius: '12px',
                      boxShadow: `0 4px 20px ${alpha(event.color, 0.2)}`,
                      color: theme.palette.text.primary,
                      padding: '20px'
                    }}
                    contentArrowStyle={{
                      borderRight: `7px solid ${alpha(event.color, 0.2)}`
                    }}
                  >
                    <Box>
                      {/* Header principal */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: theme.palette.text.primary,
                              fontSize: '1.25rem',
                              lineHeight: 1.2
                            }}
                          >
                            {event.title}
                          </Typography>
                          <Chip 
                            label={event.type}
                            sx={{
                              bgcolor: event.color,
                              color: '#ffffff',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              height: '28px'
                            }}
                          />
                        </Box>

                        {/* Información contextual */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {/* Para eventos de etapa */}
                          {event.type === 'Etapa' && (
                            <Chip 
                              label={event.stage}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#8e24aa',
                                color: '#8e24aa',
                                fontWeight: 'medium',
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          
                          {/* Para otros eventos - información de etapa actual */}
                          {event.type !== 'Etapa' && event.stageInfo && (
                            <>
                              <Chip 
                                label={event.stageInfo.daysInStage !== null 
                                  ? `${event.stageInfo.stage} - ${event.stageInfo.daysInStage} días (${event.stageInfo.weeksInStage}sem)`
                                  : `${event.stageInfo.stage}`
                                }
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: '#8e24aa',
                                  color: '#8e24aa',
                                  fontWeight: 'medium',
                                  fontSize: '0.75rem'
                                }}
                              />
                              {event.stageInfo.totalLifeDays !== null && (
                                <Chip 
                                  label={`${event.stageInfo.totalLifeDays} días de vida (${event.stageInfo.totalLifeWeeks}sem)`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: theme.palette.success.main,
                                    color: theme.palette.success.main,
                                    fontWeight: 'medium',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </>
                          )}
                        </Box>

                                              {/* Datos principales de la acción */}
                      {event.type !== 'Etapa' && event.type !== 'Foto' && event.type !== 'Log' && (
                        <Box sx={{ mb: 2 }}>
                          {/* Datos específicos según el tipo de acción */}
                          {event.type === 'Riego' && event.details && (
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                color: event.color,
                                fontWeight: 'bold',
                                fontSize: '2rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}
                            >
                              {event.details.quantity}ml
                            </Typography>
                          )}
                          
                          {event.type === 'Poda' && event.details && (
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                color: event.color,
                                fontWeight: 'bold',
                                fontSize: '2rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}
                            >
                              {event.details.type || 'Poda general'}
                            </Typography>
                          )}
                          
                          {event.type === 'Transplante' && event.details && (
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                color: event.color,
                                fontWeight: 'bold',
                                fontSize: '2rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}
                            >
                              {event.details.previousPot || '?'}L → {event.details.newPot || '?'}L
                            </Typography>
                          )}
                          
                          {event.type === 'Insecticida' && event.details && event.details.product && (
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                color: event.color,
                                fontWeight: 'bold',
                                fontSize: '2rem',
                                lineHeight: 1.2,
                                mb: 0.5
                              }}
                            >
                              {event.details.product}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Descripción */}
                      {event.description && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                            fontSize: '0.95rem',
                            fontWeight: 400
                          }}
                        >
                          {event.description}
                        </Typography>
                      )}
                      </Box>
                      
                      {/* Galería de fotos */}
                      {event.photos && event.photos.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: theme.palette.text.primary,
                              mb: 2,
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}
                          >
                            Fotografías ({event.photos.length})
                          </Typography>
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                            gap: 2,
                            maxWidth: '400px'
                          }}>
                            {event.photos.slice(0, 4).map((photo, photoIndex) => (
                              <Box
                                key={photoIndex}
                                sx={{
                                  aspectRatio: '1',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: `2px solid ${alpha(event.color, 0.3)}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${alpha(event.color, 0.4)}`,
                                    borderColor: event.color
                                  }
                                }}
                                onClick={() => handleImageClick(photo.url || photo.dataUrl)}
                              >
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${photo.url || photo.dataUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                                />
                              </Box>
                            ))}
                            {event.photos.length > 4 && (
                              <Box sx={{
                                aspectRatio: '1',
                                borderRadius: 2,
                                border: `2px dashed ${alpha(event.color, 0.4)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(event.color, 0.08),
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha(event.color, 0.15),
                                  borderColor: event.color
                                }
                              }}>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: event.color,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                  }}
                                >
                                  +{event.photos.length - 4}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {/* Detalles específicos del evento */}
                      {event.details && (
                        <Box>
                          {/* Detalles adicionales de Riego */}
                          {event.type === 'Riego' && event.details.aditives && event.details.aditives.length > 0 && (
                            <Box sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.08),
                              borderRadius: 3,
                              p: 3,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: theme.palette.success.main,
                                  fontWeight: 'bold',
                                  mb: 2,
                                  fontSize: '1rem'
                                }}
                              >
                                Aditivos utilizados
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {event.details.aditives.map((aditivo, adIndex) => (
                                  <Chip 
                                    key={adIndex}
                                    label={`${aditivo.name} (${aditivo.dosis}ml)`}
                                    sx={{
                                      bgcolor: theme.palette.success.main,
                                      color: '#ffffff',
                                      fontSize: '0.8rem',
                                      fontWeight: 'medium',
                                      height: '32px'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* Detalles adicionales de Insecticida */}
                          {event.type === 'Insecticida' && event.details.appMethod && (
                            <Box sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.08),
                              borderRadius: 3,
                              p: 3,
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: theme.palette.error.main,
                                  fontWeight: 'bold',
                                  mb: 2,
                                  fontSize: '1rem'
                                }}
                              >
                                Método de aplicación
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                                {event.details.appMethod}
                              </Typography>
                            </Box>
                          )}

                          {/* Detalles adicionales de Transplante */}
                          {event.type === 'Transplante' && (event.details.substrate || event.details.notes) && (
                            <Box sx={{ 
                              bgcolor: alpha(theme.palette.warning.main, 0.08),
                              borderRadius: 3,
                              p: 3,
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                            }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: theme.palette.warning.main,
                                  fontWeight: 'bold',
                                  mb: 2,
                                  fontSize: '1rem'
                                }}
                              >
                                Detalles adicionales
                              </Typography>
                              {event.details.substrate && (
                                <Typography variant="body1" sx={{ fontSize: '0.95rem', mb: 1 }}>
                                  <strong>Sustrato:</strong> {event.details.substrate}
                                </Typography>
                              )}
                              {event.details.notes && (
                                <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                                  <strong>Notas:</strong> {event.details.notes}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                color: 'text.secondary'
              }}>
                <TimelineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  No hay eventos registrados
                </Typography>
                <Typography variant="body2">
                  Los eventos aparecerán aquí a medida que registres actividades en tu planta
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Timeline; 