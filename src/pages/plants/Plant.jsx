import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import { 
  Grid, 
  Button, 
  Typography, 
  Box, 
  Tab, 
  Tabs, 
  ImageList, 
  ImageListItem, 
  ImageListItemBar,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Avatar,
  Chip,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  useMediaQuery,
  Modal,
  Paper,
  alpha,
  Container,
  Badge,
  LinearProgress,
  Fade,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  CardHeader,
  List,
  ListItem
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { checkSearch, convertToDetailedDate, getDate } from "../../utils";
import { database, auth } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ActionsTabsList from "../../components/plants/ActionsTabsList";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import "moment/locale/es"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import OpacityIcon from '@mui/icons-material/Opacity';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import ForestIcon from '@mui/icons-material/Forest';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import { useTheme } from '@mui/material/styles';
import ImageUploader from "../../components/plants/ImageUploader";
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import Zoom from '@mui/material/Zoom';

moment.locale("es")
const localizer = momentLocalizer(moment);

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [plant, setPlant] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [calendarView, setCalendarView] = useState('month');
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [highlightedTab, setHighlightedTab] = useState(null);
  const [filters, setFilters] = useState({
    Riego: true,
    Insecticida: true,
    Poda: true,
    Transplante: true,
    Foto: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Añadir referencia al calendario para controlar la navegación
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarHeight = 600; // Variable para controlar la altura

  // Reemplazar la función handleNavigate para usar correctamente la API de react-big-calendar
  const handleNavigate = (action) => {
    const date = new Date(currentDate);
    
    switch(action) {
      case 'PREV':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'NEXT':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'TODAY':
        date.setMonth(new Date().getMonth());
        date.setFullYear(new Date().getFullYear());
        break;
      default:
        break;
    }
    
    setCurrentDate(date);
  };

  // Actualizar los estilos personalizados para eliminar completamente cualquier control nativo
  const customCalendarStyles = {
    // Ocultar completamente la toolbar y todos sus elementos
    '.rbc-toolbar': {
      display: 'none !important'
    },
    '.rbc-toolbar-label': {
      display: 'none !important'
    },
    '.rbc-btn-group': {
      display: 'none !important'
    },
    // Ocultar cualquier texto que muestre el mes/año en la vista de mes
    '.rbc-month-header': {
      visibility: 'visible' // Mantener visible los días de la semana
    },
    // Ocultar cualquier elemento adicional que pueda mostrar fecha
    '.rbc-calendar .rbc-toolbar .rbc-toolbar-label': {
      display: 'none !important'
    },
    // Ocultar el header del mes actual
    '.rbc-month-view .rbc-header': {
      textTransform: 'capitalize',
      borderBottomWidth: '1px'
    },
    // Eliminar cualquier indicador de mes o año
    '.rbc-month-view .rbc-row-bg': {
      borderLeft: 'none'
    },
    '.rbc-month-view .rbc-date-cell': {
      textAlign: 'left',
      padding: '5px 8px'
    },
    // Asegurarse que cualquier otro indicador de fecha esté oculto
    '.rbc-month-view .rbc-month-row': {
      overflow: 'hidden'
    },
    '.rbc-month-view .rbc-month-row .rbc-row-content': {
      margin: 0,
      padding: 0
    },
    // Mantener todos los demás estilos que mejoran la visualización
    '.rbc-header': {
      padding: '10px 5px',
      fontWeight: '500',
      fontSize: '0.9rem',
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      '&:first-of-type': {
        borderTopLeftRadius: '8px'
      },
      '&:last-child': {
        borderTopRightRadius: '8px'
      }
    },
    '.rbc-month-view': {
      border: 'none',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`
    },
    '.rbc-month-row': {
      overflow: 'visible'
    },
    '.rbc-row-content': {
      zIndex: 1
    },
    '.rbc-day-bg': {
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.03)
      }
    },
    '.rbc-off-range-bg': {
      backgroundColor: alpha(theme.palette.background.default, 0.6)
    },
    '.rbc-off-range': {
      color: alpha(theme.palette.text.secondary, 0.5)
    },
    '.rbc-today': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '.rbc-event': {
      borderRadius: '6px',
      padding: '2px',
      margin: '1px 1px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      '&:hover': {
        transform: 'translateY(-1px) scale(1.01)',
        boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
      }
    },
    '.rbc-day-slot .rbc-event': {
      borderLeft: '4px solid'
    },
    '.rbc-show-more': {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      borderRadius: '4px',
      padding: '2px 4px',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12)
      }
    },
    '.rbc-date-cell': {
      padding: '5px 8px',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: 'bold'
    },
    '.rbc-row-bg': {
      zIndex: 0
    },
    '.rbc-month-row:last-child .rbc-day-bg': {
      '&:first-of-type': {
        borderBottomLeftRadius: '8px'
      },
      '&:last-child': {
        borderBottomRightRadius: '8px'
      }
    }
  };
  
  // Estilos adicionales para aumentar el tamaño de las celdas
  const enhancedCalendarStyles = {
    height: calendarHeight,
    width: '100%',
    '.rbc-month-row': {
      minHeight: '120px',
    },
    '.rbc-month-view': {
      height: calendarHeight,
    },
    '.rbc-date-cell': {
      fontSize: '1rem',
      padding: '10px',
    },
    '.rbc-header': {
      padding: '12px 8px',
      fontSize: '1rem',
      fontWeight: '600',
    },
    '.rbc-event': {
      padding: '4px 8px',
      margin: '2px',
      borderRadius: '8px',
    },
    '.rbc-show-more': {
      fontSize: '0.9rem',
      padding: '4px 8px',
    },
    ...customCalendarStyles
  };

  // Efecto de highlight para pestaña - usarlo al añadir nuevas acciones
  useEffect(() => {
    if (highlightedTab !== null) {
      const timer = setTimeout(() => {
        setHighlightedTab(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedTab]);

  useEffect(() => {
    const id = checkSearch(location.search);
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant(userData.plants.active[id]);
    }
  }, [location.search, userData.plants]);

  useEffect(() => {
    if (plant) {
      generateEvents();
    }
  }, [plant]);

  const generateEvents = () => {
    const newEvents = [];
    
    const actions = [
      { type: 'Riego', data: plant.irrigations, color: theme.palette.info.main, icon: 'water' },
      { type: 'Insecticida', data: plant.insecticides, color: theme.palette.error.main, icon: 'bug' },
      { type: 'Poda', data: plant.prunings, color: theme.palette.success.main, icon: 'cut' },
      { type: 'Transplante', data: plant.transplants, color: theme.palette.warning.main, icon: 'swap' }
    ];

    actions.forEach(action => {
      if (action.data) {
        Object.keys(action.data).forEach(key => {
          const dateArray = action.data[key].date.split('/');
          const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
          
          let description = '';
          switch(action.type) {
            case 'Riego':
              description = `${action.data[key].quantity}ml`;
              break;
            case 'Insecticida':
              description = action.data[key].product;
              break;
            case 'Poda':
              description = action.data[key].type;
              break;
            case 'Transplante':
              description = `${action.data[key].previousPot}L → ${action.data[key].newPot}L`;
              break;
          }
          
          newEvents.push({
            id: `${action.type}_${key}`,
            title: action.type,
            start: new Date(formattedDate),
            end: new Date(formattedDate),
            allDay: true,
            color: action.color,
            icon: action.icon,
            details: action.data[key],
            resourceType: action.type,
            description: description
          });
        });
      }
    });

    // Agregar fotos al calendario con más información
    if (plant.images) {
      Object.keys(plant.images).forEach(key => {
        const image = plant.images[key];
        const dateArray = image.date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `foto_${key}`,
          title: 'Foto',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.secondary.main,
          icon: 'photo',
          details: image,
          resourceType: 'Foto',
          imageUrl: image.dataUrl || image.url,
          description: image.description || 'Foto',
          thumbnail: true
        });
      });
    }

    setEvents(newEvents);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Resto de funciones de manejo de eventos...

  // Función para obtener los conteos de cada tipo de acción
  const getActionCounts = () => {
    return [
      { 
        label: 'Riegos', 
        value: plant.irrigations ? Object.keys(plant.irrigations).length : 0,
        icon: <WaterDropIcon />,
        color: theme.palette.info.main,
        tabIndex: 0
      },
      { 
        label: 'Insecticidas', 
        value: plant.insecticides ? Object.keys(plant.insecticides).length : 0,
        icon: <BugReportIcon />,
        color: theme.palette.error.main,
        tabIndex: 1
      },
      { 
        label: 'Podas', 
        value: plant.prunings ? Object.keys(plant.prunings).length : 0,
        icon: <ContentCutIcon />,
        color: theme.palette.success.main,
        tabIndex: 2
      },
      { 
        label: 'Transplantes', 
        value: plant.transplants ? Object.keys(plant.transplants).length : 0,
        icon: <SwapHorizIcon />,
        color: theme.palette.warning.main,
        tabIndex: 3
      }
    ];
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenCalendarModal(true);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: alpha(event.color, 0.1),
      color: event.color,
      borderLeft: `3px solid ${event.color}`,
      cursor: 'pointer'
    };
    
    // Estilo especial para fotos
    if (event.resourceType === 'Foto' && event.thumbnail) {
      style = {
        ...style,
        backgroundImage: `url(${event.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff', // Texto en blanco para fotos
        backgroundBlendMode: 'overlay',
        borderColor: event.color,
        borderWidth: '2px',
        borderStyle: 'solid',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)' // Sombra para legibilidad
      };
    }
    
    return { style };
  };

  const EventDetails = ({ event }) => {
    if (!event) return null;
    
    const getEventDetails = () => {
      switch (event.resourceType) {
        case 'Riego':
          return (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Cantidad:</strong> {event.details.quantity} ml
              </Typography>
              {event.details.aditives && event.details.aditives.length > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Aditivos:</strong>
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {event.details.aditives.map((aditivo, index) => (
                      <Chip 
                        key={index}
                        label={`${aditivo.name} - ${aditivo.dosis}`}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          );
        case 'Insecticida':
          return (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Producto:</strong> {event.details.product}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Método de aplicación:</strong> {event.details.appMethod}
              </Typography>
            </Box>
          );
        case 'Poda':
          return (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tipo de poda:</strong> {event.details.type}
              </Typography>
            </Box>
          );
        case 'Transplante':
          return (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Maceta anterior:</strong> {event.details.previousPot}L
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Nueva maceta:</strong> {event.details.newPot}L
              </Typography>
            </Box>
          );
        case 'Foto':
          return (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              
              <Card 
                elevation={3} 
                sx={{ 
                  mt: 2, 
                  mb: 2, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <CardActionArea onClick={() => setSelectedImage(event.details)}>
                  <CardMedia 
                    component="img" 
                    src={event.imageUrl} 
                    alt="Imagen de planta" 
                    sx={{ 
                      height: 250,
                      objectFit: 'cover',
                    }} 
                  />
                </CardActionArea>
                {event.description && (
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  </CardContent>
                )}
              </Card>
              
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<PhotoCameraIcon />}
                onClick={() => setSelectedImage(event.details)}
                sx={{ mt: 1 }}
              >
                Ver ampliado
              </Button>
            </Box>
          );
        default:
          return null;
      }
    };
    
    return (
      <Card elevation={0} sx={{ overflow: 'visible' }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          background: `linear-gradient(135deg, ${alpha(event.color, 0.1)} 0%, ${alpha(event.color, 0.02)} 100%)`,
          borderRadius: '12px 12px 0 0'
        }}>
          <Avatar sx={{ 
            bgcolor: alpha(event.color, 0.2), 
            color: event.color,
            boxShadow: `0 2px 8px ${alpha(event.color, 0.3)}`
          }}>
            {event.icon === 'water' && <OpacityIcon />}
            {event.icon === 'bug' && <BugReportIcon />}
            {event.icon === 'cut' && <ContentCutIcon />}
            {event.icon === 'swap' && <SwapHorizIcon />}
            {event.icon === 'photo' && <PhotoCameraIcon />}
          </Avatar>
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'medium' }}>
            {event.title}
          </Typography>
        </Box>
        <Divider />
        <CardContent sx={{ p: 3 }}>
          {getEventDetails()}
        </CardContent>
      </Card>
    );
  };

  const actions = [
    { icon: <OpacityIcon />, name: 'Nuevo Riego', url: `/NuevoRiego/?${checkSearch(location.search)}`, color: theme.palette.info.main },
    { icon: <BugReportIcon />, name: 'Nuevo Insecticida', url: `/NuevoInsecticida/?${checkSearch(location.search)}`, color: theme.palette.error.main },
    { icon: <ContentCutIcon />, name: 'Nueva Poda', url: `/NuevaPoda/?${checkSearch(location.search)}`, color: theme.palette.success.main },
    { icon: <SwapHorizIcon />, name: 'Nuevo Transplante', url: `/NuevoTransplante/?${checkSearch(location.search)}`, color: theme.palette.warning.main },
    { icon: <PhotoCameraIcon />, name: 'Nueva Foto', url: `/NuevaFoto/?${checkSearch(location.search)}`, color: theme.palette.secondary.main },
  ];

  // Componente para renderizar el calendario y resto de componentes...

  const refreshPlantData = () => {
    const id = checkSearch(location.search);
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({...userData.plants.active[id]});
      generateEvents();
    }
  };

  // Añadir efecto para filtrar eventos cuando cambien los filtros
  useEffect(() => {
    if (events.length > 0) {
      const filtered = events.filter(event => filters[event.resourceType]);
      setFilteredEvents(filtered);
    }
  }, [filters, events]);

  // Función para alternar los filtros
  const toggleFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Personalizar el evento en el calendario con mejor visualización
  const EventComponent = ({ event }) => {
    // Determinar el icono y estilo según el tipo de evento
    let icon = null;
    let iconColor = event.color;
    let iconBackground = alpha(event.color, 0.2);
    let border = `2px solid ${event.color}`;
    let bgColor = alpha(event.color, 0.1);
    
    // Personalización según el tipo de evento
    switch(event.icon) {
      case 'water':
        icon = <OpacityIcon style={{ fontSize: '14px' }} />;
        break;
      case 'bug':
        icon = <BugReportIcon style={{ fontSize: '14px' }} />;
        break;
      case 'cut':
        icon = <ContentCutIcon style={{ fontSize: '14px' }} />;
        break;
      case 'swap':
        icon = <SwapHorizIcon style={{ fontSize: '14px' }} />;
        break;
      case 'photo':
        icon = <PhotoCameraIcon style={{ fontSize: '14px' }} />;
        // Para fotos, configuración especial
        if (event.thumbnail) {
          bgColor = 'transparent';
          border = `2px solid ${event.color}`;
        }
        break;
      default:
        icon = <EventIcon style={{ fontSize: '14px' }} />;
    }

    return (
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {event.title}
            </Typography>
            <Typography variant="body2">
              {event.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {convertToDetailedDate(event.details.date)}
            </Typography>
            {event.resourceType === 'Foto' && event.thumbnail && (
              <Box 
                component="img" 
                src={event.imageUrl} 
                alt="Miniatura" 
                sx={{ 
                  width: 150, 
                  height: 100, 
                  objectFit: 'cover', 
                  borderRadius: 1, 
                  mt: 1,
                  border: `1px solid ${alpha(event.color, 0.5)}`
                }} 
              />
            )}
          </Box>
        }
        arrow
        placement="top"
        TransitionComponent={Zoom}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontSize: '0.85rem',
            padding: '2px',
            borderRadius: '8px',
            position: 'relative',
            background: event.resourceType === 'Foto' && event.thumbnail 
              ? `url(${event.imageUrl}) center/cover no-repeat`
              : bgColor,
            border,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }
          }}
        >
          {/* Overlay para fotos */}
          {event.resourceType === 'Foto' && event.thumbnail && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to bottom, ${alpha(event.color, 0.1)} 0%, ${alpha(event.color, 0.7)} 100%)`,
                backdropFilter: 'blur(1px)'
              }}
            />
          )}
          
          {/* Icono y Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: event.resourceType === 'Foto' ? alpha('#ffffff', 0.8) : iconBackground,
              color: iconColor,
              borderRadius: '50%',
              width: 24,
              height: 24,
              my: 0.5,
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {icon}
          </Box>
          
          {/* Texto descriptivo */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              px: 0.5,
              color: event.resourceType === 'Foto' ? '#ffffff' : 'inherit',
              textShadow: event.resourceType === 'Foto' ? '0 1px 2px rgba(0,0,0,0.7)' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              position: 'relative',
              zIndex: 2,
              maxWidth: '100%'
            }}
          >
            {event.description}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  if (!plant) {
    return (
      <Layout title="Planta no encontrada">
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            p: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.03)}`,
            mt: 4
          }}>
            <ForestIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              Planta no encontrada
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              La planta que buscas no existe o ha sido eliminada
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/Plantas"
              sx={{ 
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            >
              Volver a la lista
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Variables para destacar visualmente la etapa de crecimiento
  let etapaBackgroundColor, etapaColor, etapaIcon, etapaProgress;
  
  switch (plant.etapa || 'Vegetativo') {
    case 'Germinacion':
      etapaBackgroundColor = alpha(theme.palette.info.main, 0.1);
      etapaColor = theme.palette.info.main;
      etapaIcon = <LocalFloristIcon fontSize="small" />;
      etapaProgress = 30;
      break;
    case 'Vegetativo':
      etapaBackgroundColor = alpha(theme.palette.success.main, 0.1);
      etapaColor = theme.palette.success.main;
      etapaIcon = <ParkIcon fontSize="small" />;
      etapaProgress = 60;
      break;
    case 'Floracion':
      etapaBackgroundColor = alpha(theme.palette.secondary.main, 0.1);
      etapaColor = theme.palette.secondary.main;
      etapaIcon = <ForestIcon fontSize="small" />;
      etapaProgress = 90;
      break;
    default:
      etapaBackgroundColor = alpha(theme.palette.primary.main, 0.1);
      etapaColor = theme.palette.primary.main;
      etapaIcon = <ParkIcon fontSize="small" />;
      etapaProgress = 50;
  }

  return (
    <Layout title={plant.name}>
      <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Encabezado mejorado */}
        <Card 
          elevation={3} 
          sx={{ 
            mt: 3,
            mb: 4, 
            borderRadius: 3, 
            overflow: 'hidden',
            bgcolor: 'white',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
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
              {plant.name}
            </Typography>
          </Box>
        </Card>

        {/* Sección de estadísticas y datos detallados */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Panel de información principal */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
                      sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <CardHeader
                title={
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalFloristIcon sx={{ color: '#ffffff' }} />
                    <Typography variant="h6" fontWeight="medium">
                      Datos de la planta
                    </Typography>
                  </Stack>
                }
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  color: '#ffffff',
                  '& .MuiTypography-root': {
                    color: '#ffffff'
                  }
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  <ListItem 
                    divider
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.03)
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Genética</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {plant.genetics || 'No especificada'}
                      </Typography>
                    </Box>
                  </ListItem>
                  
                  <ListItem 
                    divider
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Fecha de nacimiento</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {plant.birthDate ? convertToDetailedDate(plant.birthDate) : 'No especificada'}
                      </Typography>
                    </Box>
                  </ListItem>
                  
                  <ListItem 
                    divider
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Días de vida</Typography>
                      <Chip 
                        label={plant.birthDate ? 
                          Math.floor((new Date() - new Date(plant.birthDate.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24)) + ' días' 
                          : 'No disponible'}
                        sx={{ 
                          fontWeight: 'medium',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                  </ListItem>
                  
                  <ListItem 
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Volumen de maceta</Typography>
                        <Chip 
                        label={plant.potVolume ? `${plant.potVolume}L` : 'No especificado'}
                          sx={{ 
                          fontWeight: 'medium',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Panel de etapa de crecimiento */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <CardHeader
                title={
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ParkIcon sx={{ color: '#ffffff' }} />
                    <Typography variant="h6" fontWeight="medium">
                      Etapa de crecimiento
                    </Typography>
                  </Stack>
                }
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  color: '#ffffff',
                  '& .MuiTypography-root': {
                    color: '#ffffff'
                  }
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  <ListItem 
                    divider
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid ${theme.palette.secondary.main}`,
                      bgcolor: alpha(theme.palette.secondary.main, 0.03)
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Etapa actual</Typography>
                        <Chip 
                          icon={etapaIcon}
                        label={plant.etapa || 'No especificada'}
                          sx={{ 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                          '& .MuiChip-icon': { color: theme.palette.secondary.main },
                            fontWeight: 'medium'
                          }}
                        />
                    </Box>
                  </ListItem>
                  
                  <ListItem 
                    divider
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.secondary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Cambio de etapa</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {plant.stageChangeDate ? convertToDetailedDate(plant.stageChangeDate) : 'No especificado'}
                      </Typography>
                        </Box>
                  </ListItem>
                  
                  <ListItem 
                    divider
                          sx={{
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.secondary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Días desde cambio</Typography>
                      <Chip
                        label={plant.stageChangeDate ? 
                          Math.floor((new Date() - new Date(plant.stageChangeDate.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24)) + ' días' 
                          : 'No disponible'}
                        sx={{ 
                          fontWeight: 'medium',
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                          }}
                        />
                      </Box>
                  </ListItem>
                  
                  <ListItem 
                    sx={{ 
                      py: 1.8, 
                      px: 3,
                      borderLeft: `4px solid transparent`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        borderLeft: `4px solid ${theme.palette.secondary.main}`
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" color="text.secondary">Semanas de vida</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={plant.birthDate ? 
                            Math.floor((new Date() - new Date(plant.birthDate.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24 * 7)) + ' semanas' 
                            : 'No disponible'}
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        />
                        {plant.stageChangeDate && (
                          <Tooltip title="Semanas en etapa actual">
                            <Chip 
                              size="small"
                              label={Math.floor((new Date() - new Date(plant.stageChangeDate.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24 * 7)) + 'w'}
                              sx={{ ml: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}
                            />
                          </Tooltip>
                    )}
                  </Box>
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Nueva sección de Acciones Rápidas */}
        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            mb: 4
          }}
        >
          <CardHeader
            title={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LocalFloristIcon sx={{ color: '#ffffff' }} />
                <Typography variant="h6" fontWeight="medium">
                  Acciones Rápidas
                </Typography>
              </Stack>
            }
            sx={{
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: '#ffffff',
              '& .MuiTypography-root': {
                color: '#ffffff'
              }
            }}
          />
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/NuevoRiego/?${checkSearch(location.search)}`}
                  startIcon={<WaterDropIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: theme.palette.info.main,
                    '&:hover': {
                      bgcolor: theme.palette.info.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.info.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Riego</Box>
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/NuevaPoda/?${checkSearch(location.search)}`}
                  startIcon={<ContentCutIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: theme.palette.success.main,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.success.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Poda</Box>
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/NuevoInsecticida/?${checkSearch(location.search)}`}
                  startIcon={<BugReportIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: theme.palette.error.main,
                    '&:hover': {
                      bgcolor: theme.palette.error.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.error.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Insecticida</Box>
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/NuevoTransplante/?${checkSearch(location.search)}`}
                  startIcon={<SwapHorizIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: theme.palette.warning.main,
                    '&:hover': {
                      bgcolor: theme.palette.warning.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.warning.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.warning.main, 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Transplante</Box>
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/NuevaFoto/?${checkSearch(location.search)}`}
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Foto</Box>
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/EditarPlanta/?${checkSearch(location.search)}`}
                  startIcon={<EditIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: alpha(theme.palette.grey[700], 0.9),
                    '&:hover': {
                      bgcolor: theme.palette.grey[800],
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.grey[800], 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.grey[700], 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Editar</Box>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Estadísticas de acciones */}
        <Card 
          elevation={3} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CardHeader
            title={
              <Stack direction="row" spacing={1.5} alignItems="center">
                <HistoryIcon sx={{ color: '#ffffff' }} />
                <Typography variant="h6" fontWeight="medium">
                  Historial de cuidados
                </Typography>
              </Stack>
            }
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: '#ffffff',
              '& .MuiTypography-root': {
                color: '#ffffff'
              }
            }}
          />
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {getActionCounts().map((stat) => (
                <Grid item xs={6} sm={3} key={stat.label}>
                      <Card 
                        elevation={0}
                        onClick={() => setTabValue(stat.tabIndex)}
                        sx={{ 
                      p: 0,
                      borderRadius: 3,
                          cursor: 'pointer',
                      overflow: 'hidden',
                      border: `1px solid ${alpha(stat.color, 0.2)}`,
                      transition: 'all 0.2s ease',
                          '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 6px 15px ${alpha(stat.color, 0.15)}`,
                      },
                      ...(highlightedTab === stat.tabIndex && {
                        boxShadow: `0 6px 15px ${alpha(stat.color, 0.3)}`,
                        transform: 'translateY(-4px)',
                        border: `1px solid ${alpha(stat.color, 0.4)}`
                      })
                    }}
                  >
                    <Box sx={{ 
                      p: 1.5,
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.8)} 100%)`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                        {stat.label}
                      </Typography>
                          <Avatar 
                            sx={{ 
                          width: 32,
                          height: 32,
                          bgcolor: alpha('#ffffff', 0.2),
                          color: '#ffffff'
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                    </Box>
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                        registros
                            </Typography>
                          </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
          </CardContent>
        </Card>

        {/* Sección de Calendario */}
        <Paper 
          id="plant-calendar"
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden', 
            mb: 4,
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.06)}`,
            width: '100%'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon sx={{ mr: 1, color: '#ffffff' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'medium',
                  color: '#ffffff'
                }}
              >
                Historial de actividades
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Botones de navegación */}
              <Box sx={{ display: 'flex', mr: 2 }}>
                <Tooltip title="Mes anterior">
                  <IconButton 
                    size="small" 
                    onClick={() => handleNavigate('PREV')}
                    sx={{ 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  onClick={() => handleNavigate('TODAY')}
                  sx={{ 
                    mx: 1, 
                    textTransform: 'none',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2
                  }}
                >
                  Hoy
                </Button>
                <Tooltip title="Mes siguiente">
                  <IconButton 
                    size="small" 
                    onClick={() => handleNavigate('NEXT')}
                    sx={{ 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Filtros */}
              <Tooltip title="Filtrar eventos">
                <IconButton 
                  size="small" 
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Panel de filtros */}
          <Collapse in={showFilters}>
            <Box sx={{ 
              p: 2,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              bgcolor: alpha(theme.palette.background.default, 0.5),
              backdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>
                Filtrar por tipo de actividad:
              </Typography>
              <Chip
                icon={<OpacityIcon />}
                label="Riegos"
                clickable
                color={filters.Riego ? "primary" : "default"}
                onClick={() => toggleFilter('Riego')}
                deleteIcon={filters.Riego ? <CheckCircleIcon /> : undefined}
                onDelete={filters.Riego ? () => toggleFilter('Riego') : undefined}
                sx={{ 
                  opacity: filters.Riego ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  boxShadow: filters.Riego ? `0 2px 5px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                }}
              />
              <Chip
                icon={<BugReportIcon />}
                label="Insecticidas"
                clickable
                color={filters.Insecticida ? "error" : "default"}
                onClick={() => toggleFilter('Insecticida')}
                deleteIcon={filters.Insecticida ? <CheckCircleIcon /> : undefined}
                onDelete={filters.Insecticida ? () => toggleFilter('Insecticida') : undefined}
                sx={{ 
                  opacity: filters.Insecticida ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  boxShadow: filters.Insecticida ? `0 2px 5px ${alpha(theme.palette.error.main, 0.3)}` : 'none'
                }}
              />
              <Chip
                icon={<ContentCutIcon />}
                label="Podas"
                clickable
                color={filters.Poda ? "success" : "default"}
                onClick={() => toggleFilter('Poda')}
                deleteIcon={filters.Poda ? <CheckCircleIcon /> : undefined}
                onDelete={filters.Poda ? () => toggleFilter('Poda') : undefined}
                sx={{ 
                  opacity: filters.Poda ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  boxShadow: filters.Poda ? `0 2px 5px ${alpha(theme.palette.success.main, 0.3)}` : 'none'
                }}
              />
              <Chip
                icon={<SwapHorizIcon />}
                label="Transplantes"
                clickable
                color={filters.Transplante ? "warning" : "default"}
                onClick={() => toggleFilter('Transplante')}
                deleteIcon={filters.Transplante ? <CheckCircleIcon /> : undefined}
                onDelete={filters.Transplante ? () => toggleFilter('Transplante') : undefined}
                sx={{ 
                  opacity: filters.Transplante ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  boxShadow: filters.Transplante ? `0 2px 5px ${alpha(theme.palette.warning.main, 0.3)}` : 'none'
                }}
              />
              <Chip
                icon={<PhotoCameraIcon />}
                label="Fotos"
                clickable
                color={filters.Foto ? "secondary" : "default"}
                onClick={() => toggleFilter('Foto')}
                deleteIcon={filters.Foto ? <CheckCircleIcon /> : undefined}
                onDelete={filters.Foto ? () => toggleFilter('Foto') : undefined}
                sx={{ 
                  opacity: filters.Foto ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  boxShadow: filters.Foto ? `0 2px 5px ${alpha(theme.palette.secondary.main, 0.3)}` : 'none'
                }}
              />
            </Box>
          </Collapse>
          
          <Box sx={{ p: 0, position: 'relative', height: calendarHeight }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents.length > 0 ? filteredEvents : events}
              views={['month']}
              defaultView="month"
              date={currentDate}
              onNavigate={handleNavigate}
              startAccessor="start"
              endAccessor="end"
              style={enhancedCalendarStyles}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              components={{
                event: EventComponent,
                toolbar: () => null, // Eliminar toolbar completamente
                month: {
                  header: () => null // Eliminar header de mes
                }
              }}
              popup
              messages={{
                today: 'Hoy',
                previous: 'Anterior',
                next: 'Siguiente',
                month: 'Mes',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                allDay: 'Todo el día',
                noEventsInRange: 'No hay eventos en este período',
              }}
            />
          </Box>
        </Paper>
        </Box>
    </Layout>
  );
};

export default Plant;