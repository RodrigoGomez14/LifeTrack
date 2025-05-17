import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ref, push, set, remove, update, onValue } from "firebase/database";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format, parseISO, add, isSameDay, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from "../../components/layout/Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useStore } from "../../store";
import { 
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CardMedia,
  Tabs,
  Tab,
  Box,
  Grid,
  CardActions,
  Avatar,
  LinearProgress,
  Chip,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Skeleton,
  CircularProgress,
  Collapse,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Badge,
  Zoom,
  useMediaQuery,
  Menu,
  AvatarGroup,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fade,
  Popper,
  Container,
  CardHeader,
  InputAdornment
} from "@mui/material";
import Alert from '@mui/material/Alert';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { database, auth, storage } from "../../firebase";
import { ref as storageRef } from 'firebase/storage';
import { checkSearch, formatAmount, getDate } from "../../utils";
import { getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpacityIcon from '@mui/icons-material/Opacity';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ForestIcon from '@mui/icons-material/Forest';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import HistoryIcon from '@mui/icons-material/History';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import InfoIcon from '@mui/icons-material/Info';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import StarIcon from '@mui/icons-material/Star';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Global } from '@emotion/react';
import 'moment/locale/es';

moment.locale("es");

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

// Definir el localizador de momentjs para el calendario
const localizer = momentLocalizer(moment);

// Función para calcular días entre dos fechas
const calculateDaysBetween = (startDateStr, endDateStr = null) => {
  if (!startDateStr) return null;
  
  // Parsear la fecha de inicio
  const startParts = startDateStr.split('/');
  if (startParts.length !== 3) return null;
  
  // Crear fecha de inicio correctamente (día/mes/año)
  const startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
  
  // Parsear la fecha de fin si existe
  let endDate;
  if (endDateStr) {
    const endParts = endDateStr.split('/');
    if (endParts.length === 3) {
      // Crear fecha de fin correctamente (día/mes/año)
      endDate = new Date(parseInt(endParts[2]), parseInt(endParts[1]) - 1, parseInt(endParts[0]));
    } else {
      // Si el formato no es válido, usar la fecha actual
      endDate = new Date();
    }
  } else {
    // Si no se proporciona fecha de fin, usar la fecha actual
    endDate = new Date();
  }
  
  // Asegurar que ambas fechas sean instancias válidas de Date
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Fechas inválidas:', { startDateStr, endDateStr, startDate, endDate });
    return null;
  }

  // Calcular diferencia en días
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado para controlar la carga
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
    Foto: true,
    Log: true,
    Etapa: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  
  // Añadir referencia al calendario para controlar la navegación
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [openDayEventsModal, setOpenDayEventsModal] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month' o 'day' (eliminamos 'week')
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [showHarvestDialog, setShowHarvestDialog] = useState(false);
  const [wetFlowersWeight, setWetFlowersWeight] = useState('');
  const [dryFlowersWeight, setDryFlowersWeight] = useState('');
  const [leavesWeight, setLeavesWeight] = useState('');
  const [isMovingToHistory, setIsMovingToHistory] = useState(false);
  
  const calendarHeight = 700; // Variable para controlar la altura

  // Reemplazar la función handleNavigate para manejar correctamente las vistas mensual y diaria
  const handleNavigate = (action) => {
    const date = new Date(currentDate);
    
    switch(action) {
      case 'PREV':
        date.setMonth(date.getMonth() - 1); // Retroceder un mes
        break;
      case 'NEXT':
        date.setMonth(date.getMonth() + 1); // Avanzar un mes
        break;
      case 'TODAY':
        date.setMonth(new Date().getMonth());
        date.setFullYear(new Date().getFullYear());
        date.setDate(new Date().getDate());
        break;
      default:
        break;
    }
    
    setCurrentDate(date);
  };

  // Simplifico los estilos para centrarnos en lo básico y asegurar que funcione
  const customCalendarStyles = {
    // Ocultar toolbar
    '.rbc-toolbar': {
      display: 'none'
    },
    
    // Ocultar la fila de cabecera con los días de la semana
    '.rbc-month-header': {
      display: 'none'
    },
    
    // Estilos para el encabezado
    '.rbc-header': {
      padding: 0,
      margin: 0,
      border: 'none',
      height: '0px',
      display: 'none'
    },
    
    // Eliminar estilos que pueden estar causando conflictos
    '.rbc-header span': {
      display: 'none'
    },
    
    // Filas del calendario
    '.rbc-row': {
      border: 'none'
    },
    
    // Cabecera del tiempo
    '.rbc-time-header': {
      display: 'none'
    },
    
    '.rbc-time-header-content': {
      display: 'none'
    },
    
    '.rbc-time-header-content > .rbc-row': {
      display: 'none'
    },
    
    // Ocultar todo lo relacionado con la vista de días/semana
    '.rbc-month-row': {
      border: 'none'
    },
    
    '.rbc-day-bg': {
      border: '1px solid #f0f0f0'
    },
    
    '.rbc-date-cell': {
      padding: '5px',
      textAlign: 'center',
      fontSize: '0.9rem',
      fontWeight: 'normal'
    }
  };
  
  // Estilo para el componente Calendar
  const enhancedCalendarStyles = {
    height: '700px', // Aumentamos la altura
    width: '100%',
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
    setLoading(true); // Indicar que estamos cargando al cambiar de ubicación
    const id = checkSearch(location.search);
    
    // Primero buscar en plantas activas
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({...userData.plants.active[id], id});
      setLoading(false);
    } 
    // Si no está en activas, buscar en plantas archivadas
    else if (userData?.plants?.history && userData.plants.history[id]) {
      setPlant({...userData.plants.history[id], id, isArchived: true});
      setLoading(false);
    }
    // Si no está en ninguna de las dos ubicaciones pero userData.plants está disponible
    else if (userData?.plants) {
      // Buscar en otras posibles ubicaciones
      let found = false;
      
      // Verificar si existe la propiedad 'archived'
      if (userData.plants.archived && userData.plants.archived[id]) {
        setPlant({...userData.plants.archived[id], id, isArchived: true});
        found = true;
      } else {
        // Buscar en todas las propiedades que no sean 'active'
        for (const key in userData.plants) {
          if (key !== 'active' && typeof userData.plants[key] === 'object') {
            for (const plantId in userData.plants[key]) {
              if (plantId === id) {
                setPlant({...userData.plants[key][plantId], id, isArchived: true});
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
      
      setLoading(false);
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
      { type: 'Transplante', data: plant.transplants, color: theme.palette.warning.main, icon: 'swap' },
      { type: 'Log', data: plant.logs, color: '#9c27b0', icon: 'note' }
    ];

    // Procesar las acciones normales
    actions.forEach(action => {
      if (action.data) {
        Object.keys(action.data).forEach(key => {
          const item = action.data[key];
          if (!item.date) return; // Asegurarse de que existe la fecha
          
          const dateArray = item.date.split('/');
          const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
          
          // Crear fecha ajustada para asegurar que se muestre en el día correcto
          const eventDate = new Date(formattedDate + 'T12:00:00');
          
          let description = '';
          switch(action.type) {
            case 'Riego':
              description = `${item.quantity}ml`;
              break;
            case 'Insecticida':
              description = item.product || 'Sin producto';
              break;
            case 'Poda':
              description = item.type || 'Sin tipo';
              break;
            case 'Transplante':
              description = `${item.previousPot || '?'}L → ${item.newPot || '?'}L`;
              break;
            case 'Log':
              description = item.description && item.description.length > 30 
                ? item.description.substring(0, 30) + '...' 
                : item.description || 'Sin descripción';
              break;
            default:
              description = 'Sin descripción';
          }
          
          newEvents.push({
            id: `${action.type}-${key}`,
            title: `${action.type}: ${description}`,
            start: eventDate,
            end: eventDate,
            allDay: true,
            resourceType: action.type,
            color: action.color,
            icon: action.icon,
            details: item || {},
            eventKey: key,
            description: description
          });
        });
      }
    });

    // Procesar fotos de manera especial (agrupar por fecha)
    if (plant.images) {
      // Agrupar fotos por fecha
      const photosByDate = {};
      
      Object.keys(plant.images).forEach(key => {
        const photo = plant.images[key];
        if (!photo.date) return;
        
        // Usar solo la fecha como clave (sin la hora)
        if (!photosByDate[photo.date]) {
          photosByDate[photo.date] = [];
        }
        
        photosByDate[photo.date].push({
          ...photo,
          key: key
        });
      });
      
      // Crear eventos agrupados de fotos
      Object.keys(photosByDate).forEach(date => {
        const photos = photosByDate[date];
        const dateArray = date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        const eventDate = new Date(formattedDate + 'T12:00:00');
        
        newEvents.push({
          id: `Fotos-${date}`,
          title: `Fotos (${photos.length})`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resourceType: 'Foto',
          color: theme.palette.secondary.main,
          icon: 'photo',
          photos: photos, // Guardar todas las fotos del día
          imageUrl: photos[0].url || photos[0].dataUrl, // Usar la primera foto como miniatura
          details: {
            date: date,
            type: 'Fotografías',
            count: photos.length
          },
          thumbnail: true,
          description: `${photos.length} foto${photos.length > 1 ? 's' : ''}`
        });
      });
    }

    // Añadir eventos para las fechas de etapas de crecimiento
    // Germinación
    if (plant.birthDate) {
      const birthDateArray = plant.birthDate.split('/');
      const formattedBirthDate = `${birthDateArray[2]}-${birthDateArray[1].padStart(2, '0')}-${birthDateArray[0].padStart(2, '0')}`;
      const birthEventDate = new Date(formattedBirthDate + 'T12:00:00');
        
        newEvents.push({
        id: `Etapa-Germinacion`,
        title: `Inicio de Germinación`,
        start: birthEventDate,
        end: birthEventDate,
          allDay: true,
        resourceType: 'Etapa',
        stageType: 'Germinacion',
        color: '#8e24aa', // Color morado para etapas
        icon: 'seedling',
        details: {
          date: plant.birthDate,
          type: 'Inicio de Germinación',
          description: `Fecha de nacimiento de la planta "${plant.name}"`
        }
      });
    }
    
    // Vegetativo
    if (plant.inicioVegetativo) {
      const vegDateArray = plant.inicioVegetativo.split('/');
      const formattedVegDate = `${vegDateArray[2]}-${vegDateArray[1].padStart(2, '0')}-${vegDateArray[0].padStart(2, '0')}`;
      const vegEventDate = new Date(formattedVegDate + 'T12:00:00');
      
      newEvents.push({
        id: `Etapa-Vegetativo`,
        title: `Inicio de Vegetativo`,
        start: vegEventDate,
        end: vegEventDate,
        allDay: true,
        resourceType: 'Etapa',
        stageType: 'Vegetativo',
        color: '#8e24aa', // Color morado para etapas
        icon: 'sprout',
        details: {
          date: plant.inicioVegetativo,
          type: 'Inicio de Vegetativo',
          description: `La planta "${plant.name}" entró en etapa vegetativa`
        }
      });
    }
    
    // Floración
    if (plant.inicioFloracion) {
      const florDateArray = plant.inicioFloracion.split('/');
      const formattedFlorDate = `${florDateArray[2]}-${florDateArray[1].padStart(2, '0')}-${florDateArray[0].padStart(2, '0')}`;
      const florEventDate = new Date(formattedFlorDate + 'T12:00:00');
      
      newEvents.push({
        id: `Etapa-Floracion`,
        title: `Inicio de Floración`,
        start: florEventDate,
        end: florEventDate,
        allDay: true,
        resourceType: 'Etapa',
        stageType: 'Floracion',
        color: '#8e24aa', // Color morado para etapas
        icon: 'flower',
        details: {
          date: plant.inicioFloracion,
          type: 'Inicio de Floración',
          description: `La planta "${plant.name}" entró en etapa de floración`
        }
      });
    }

    // Ordenar los eventos por fecha
    newEvents.sort((a, b) => a.start - b.start);

    setEvents(newEvents);
    
    // Generar eventos filtrados
    const filtered = newEvents.filter(event => filters[event.resourceType]);
    setFilteredEvents(filtered);
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
    if (event.resourceType === 'Foto') {
      // No establecer selectedEvent, simplemente abrir la galería de fotos
      // Esto evitará que se abra el modal simple
      return;
    }
    
    // Para otros tipos de eventos, mantener el comportamiento original
    setSelectedEvent(event);
    setOpenCalendarModal(true);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const eventStyleGetter = (event) => {
    // Estilo base para todos los eventos
    let style = {
      backgroundColor: alpha(event.color, 0.1),
      color: event.color,
      border: `1px solid ${alpha(event.color, 0.3)}`,
      cursor: 'pointer'
    };
    
    // Estilo especial para fotos
    if (event.resourceType === 'Foto' && event.imageUrl) {
      style = {
        ...style,
        backgroundImage: `url(${event.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        backgroundBlendMode: 'overlay',
        backgroundColor: alpha(event.color, 0.4),
        borderColor: event.color,
        borderWidth: '2px',
        borderStyle: 'solid',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
      };
    }
    
    // Estilo especial para etapas
    if (event.resourceType === 'Etapa') {
      style = {
        ...style,
        backgroundColor: alpha(event.color, 0.2),
        borderLeft: `4px solid ${event.color}`,
        fontWeight: 'bold'
      };
    }
    
    return { style };
  };

  // Actualizar el componente EventDetails para mostrar detalles de logs
  const EventDetails = ({ event }) => {
    if (!event) return null;
    
    const getEventDetails = () => {
      if (event.resourceType === 'Etapa') {
        return (
          <Box sx={{ mt: 2 }}>
            <Card variant="outlined" sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(event.color, 0.15)}`,
              bgcolor: alpha(event.color, 0.05),
              borderColor: event.color
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: event.color, mr: 2 }}>
                  {event.stageType === 'Germinacion' && <SpaIcon />}
                  {event.stageType === 'Vegetativo' && <GrassIcon />}
                  {event.stageType === 'Floracion' && <LocalFloristIcon />}
                </Avatar>
                <Typography variant="h6" sx={{ color: event.color, fontWeight: 'bold' }}>
                  {event.details.type}
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph color="text.secondary">
                {event.details.description}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                Fecha:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {convertToDetailedDate(event.details.date)}
              </Typography>
              
              {event.stageType === 'Germinacion' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.light, 0.1), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="info.main">
                    Inicio del ciclo de vida
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durante la germinación, la semilla despierta y comienza a desarrollar sus primeras raíces y hojas cotiledonares.
                  </Typography>
                </Box>
              )}
              
              {event.stageType === 'Vegetativo' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.light, 0.1), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="success.main">
                    Fase de crecimiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En la etapa vegetativa, la planta enfoca su energía en desarrollar hojas, tallos y un sistema de raíces robusto.
                  </Typography>
                </Box>
              )}
              
              {event.stageType === 'Floracion' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.warning.light, 0.1), borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="warning.main">
                    Desarrollo de flores
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durante la floración, la planta deja de crecer en altura y dedica su energía a producir flores, preparándose para completar su ciclo reproductivo.
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        );
      }
      switch (event.resourceType) {
        case 'Riego':
          return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
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
                  <Box sx={{ ml: 2 }}>
                    {event.details.aditives.map((aditivo, index) => (
                      <Box key={index} sx={{ mt: 0.5 }}>
                        • {aditivo.name}: {aditivo.dosis} ml
                      </Box>
                    ))}
                  </Box>
                </>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  El riego regular es esencial para mantener la salud de tus plantas. Asegúrate de usar la cantidad adecuada para cada tipo de planta y etapa de crecimiento.
                </Typography>
              </Box>
            </Box>
          );
        
        case 'Insecticida':
          return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Producto:</strong> {event.details.product}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Método de aplicación:</strong> {event.details.appMethod}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Los tratamientos con insecticidas deben usarse con moderación y solo cuando sea necesario. Siempre sigue las instrucciones del producto y considera alternativas orgánicas cuando sea posible.
              </Typography>
              </Box>
            </Box>
          );
          
        case 'Poda':
          return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tipo de poda:</strong> {event.details.type}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  La poda regular puede mejorar la salud, el crecimiento y la producción de tu planta. Diferentes tipos de poda son beneficiosos en distintas etapas del crecimiento.
              </Typography>
              </Box>
            </Box>
          );
          
        case 'Transplante':
          return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Tamaño anterior:</strong> {event.details.previousPot}L
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Nuevo tamaño:</strong> {event.details.newPot}L
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  El trasplante proporciona más espacio para el crecimiento de las raíces y permite a la planta acceder a más nutrientes. Es importante hacerlo con cuidado para minimizar el estrés.
              </Typography>
              </Box>
            </Box>
          );
        
        case 'Foto':
          return (
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
              </Typography>
              
              {event.details.description && (
                <Typography variant="body1" gutterBottom>
                  <strong>Descripción:</strong> {event.details.description}
                </Typography>
              )}
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img 
                    src={event.imageUrl} 
                  alt="Foto de la planta" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
              </Box>
            </Box>
          );
          
        case 'Log':
          return (
            <Box sx={{ p: 2, bgcolor: alpha('#9c27b0', 0.1), borderRadius: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Fecha:</strong> {convertToDetailedDate(event.details.date)}
                    </Typography>
              
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {event.details.description}
              </Typography>
            </Box>
          );
          
        default:
          return null;
      }
    };
    
    return getEventDetails();
  };

  // Definición de acciones disponibles
  const actions = [
    { id: 'watering', name: 'Riego', color: '#2196f3', icon: 'water_drop' },
    { id: 'insecticide', name: 'Insecticida', color: '#f44336', icon: 'bug_report' },
    { id: 'pruning', name: 'Poda', color: '#4caf50', icon: 'content_cut' },
    { id: 'transplant', name: 'Transplante', color: '#ff9800', icon: 'yard' },
    { id: 'photo', name: 'Foto', color: '#9e9e9e', icon: 'photo_camera' },
    { id: 'log', name: 'Log', color: '#9c27b0', icon: 'note' }
  ];

  // Componente para renderizar el calendario y resto de componentes...

  const refreshPlantData = () => {
    const id = checkSearch(location.search);
    
    // Buscar en plantas activas
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({...userData.plants.active[id], id});
      generateEvents();
      return;
    }
    
    // Buscar en plantas archivadas
    if (userData?.plants?.history && userData.plants.history[id]) {
      setPlant({...userData.plants.history[id], id, isArchived: true});
      generateEvents();
      return;
    }
    
    // Buscar en otras posibles ubicaciones
    if (userData?.plants) {
      // Verificar si existe la propiedad 'archived'
      if (userData.plants.archived && userData.plants.archived[id]) {
        setPlant({...userData.plants.archived[id], id, isArchived: true});
        generateEvents();
        return;
      }
      
      // Buscar en todas las propiedades que no sean 'active'
      for (const key in userData.plants) {
        if (key !== 'active' && typeof userData.plants[key] === 'object') {
          for (const plantId in userData.plants[key]) {
            if (plantId === id) {
              setPlant({...userData.plants[key][plantId], id, isArchived: true});
              generateEvents();
              return;
            }
          }
        }
      }
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

  // Modificar el componente EventComponent para manejar eventos de etapa
  const EventComponent = ({ event }) => {
    // Declarar todos los hooks al inicio del componente (no dentro de condicionales)
    const [openPhotosModal, setOpenPhotosModal] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [galleryView, setGalleryView] = useState('grid');
    
    // Verificar que el evento existe para evitar errores
    if (!event) return null;

    // Function to get the appropriate icon based on event type
    const getEventIcon = () => {
      if (event.resourceType === 'Etapa') {
        if (event.stageType === 'Germinacion') return <SpaIcon fontSize="small" />;
        if (event.stageType === 'Vegetativo') return <GrassIcon fontSize="small" />;
        if (event.stageType === 'Floracion') return <LocalFloristIcon fontSize="small" />;
        return <LocalFloristIcon fontSize="small" />;
      }
      
      if (!event.icon) return <InfoIcon fontSize="small" />;
      
      switch (event.icon) {
        case 'water':
          return <WaterDropIcon fontSize="small" />;
        case 'bug':
          return <BugReportIcon fontSize="small" />;
        case 'cut':
          return <ContentCutIcon fontSize="small" />;
        case 'swap':
          return <SwapHorizIcon fontSize="small" />;
        case 'note':
          return <NoteAltIcon fontSize="small" />;
        case 'photo':
          return <PhotoCameraIcon fontSize="small" />;
        default:
          return <InfoIcon fontSize="small" />;
      }
    };
      
    // Definir todas las funciones manejadoras necesarias
    const handleOpenPhotos = (e) => {
      e.stopPropagation(); // Prevenir la propagación del evento
      setOpenPhotosModal(true);
    };
    
    const handleClosePhotos = () => {
      setOpenPhotosModal(false);
      setSelectedPhotoIndex(0);
      setGalleryView('grid');
    };
    
    const handlePhotoClick = (index) => {
      setSelectedPhotoIndex(index);
      setGalleryView('single');
    };
    
    const handleNextPhoto = () => {
      if (event.photos && event.photos.length > 0) {
        setSelectedPhotoIndex((prevIndex) => 
          prevIndex === event.photos.length - 1 ? 0 : prevIndex + 1
        );
      }
    };
    
    const handlePrevPhoto = () => {
      if (event.photos && event.photos.length > 0) {
        setSelectedPhotoIndex((prevIndex) => 
          prevIndex === 0 ? event.photos.length - 1 : prevIndex - 1
        );
      }
    };
    
    const handleBackToGrid = () => {
      setGalleryView('grid');
    };

    // Vista especial para fotos en vista mensual
    if (event.resourceType === 'Foto') {
      return (
        <>
          <Box 
            onClick={handleOpenPhotos}
            sx={{ 
              p: 0.5,
              height: '100%',
              width: '100%',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `0 2px 4px ${alpha(event.color, 0.4)}`,
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${alpha(event.color, 0.9)}, ${alpha(event.color, 0.7)})`,
              '&:hover': {
                boxShadow: `0 3px 6px ${alpha(event.color, 0.6)}`,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.8,
              position: 'relative',
              zIndex: 1,
              p: 0.5
            }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: 'white',
                  color: event.color,
                  fontSize: '0.75rem'
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: '0.75rem' }} />
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  color: '#ffffff',
                  flexGrow: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Fotos ({event.details && event.details.count ? event.details.count : 0})
              </Typography>
            </Box>
          </Box>

          {/* Modal para galería de fotos */}
          <Dialog
            open={openPhotosModal}
            onClose={handleClosePhotos}
            maxWidth="lg"
            fullWidth
            sx={{
              '.MuiDialog-paper': {
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.background.paper,
                maxHeight: '90vh'
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                px: 2,
                background: `linear-gradient(135deg, ${event.color} 0%, ${alpha(event.color, 0.8)} 100%)`,
                color: '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhotoCameraIcon />
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                  Fotos ({event.photos ? event.photos.length : 0})
                  {galleryView === 'single' && event.photos && (
                    <Typography variant="body2" component="span" sx={{ ml: 2, opacity: 0.9 }}>
                      {selectedPhotoIndex + 1} de {event.photos.length}
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {galleryView === 'single' && (
                  <Button
                    startIcon={<ArrowBackIcon />}
                    size="small"
                    onClick={handleBackToGrid}
                    sx={{
                      color: '#ffffff',
                      borderColor: alpha('#ffffff', 0.3),
                      bgcolor: alpha('#ffffff', 0.1),
                      '&:hover': { bgcolor: alpha('#ffffff', 0.2) }
                    }}
                  >
                    Volver a la galería
                  </Button>
                )}
                <IconButton
                  edge="end"
                  onClick={handleClosePhotos}
                  aria-label="cerrar"
                  size="small"
                  sx={{
                    color: '#ffffff',
                    bgcolor: alpha('#000000', 0.2),
                    '&:hover': {
                      bgcolor: alpha('#000000', 0.3)
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 2, position: 'relative' }}>
              {galleryView === 'grid' ? (
                /* Vista de cuadrícula */
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  {event.photos && event.photos.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        elevation={2} 
                        onClick={() => handlePhotoClick(index)}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                          },
                          position: 'relative'
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={photo.url || photo.dataUrl}
                          alt={`Foto ${index + 1}`}
                          sx={{ 
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhotoClick(index);
                          }}
                          sx={{ 
                            position: 'absolute',
                            right: 8,
                            bottom: 8,
                            color: '#fff',
                            bgcolor: alpha(event.color, 0.7),
                            '&:hover': { bgcolor: alpha(event.color, 0.9) }
                          }}
                        >
                          <ZoomInIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* Vista de foto individual */
                <Box sx={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                  {event.photos && event.photos.length > 0 && (
                    <>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        width: '100%',
                        bgcolor: '#000',
                        borderRadius: 2,
                        overflow: 'hidden',
                        minHeight: '60vh',
                        maxHeight: '70vh'
                      }}>
                        {/* Botón anterior */}
                        <IconButton
                          sx={{
                            position: 'absolute',
                            left: 16,
                            zIndex: 2,
                            color: '#fff',
                            bgcolor: alpha('#000', 0.3),
                            '&:hover': { bgcolor: alpha('#000', 0.5) }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevPhoto();
                          }}
                        >
                          <ArrowBackIcon />
                        </IconButton>
                        
                        {/* Imagen actual */}
                        <Box
                          component="img"
                          src={event.photos[selectedPhotoIndex].url || event.photos[selectedPhotoIndex].dataUrl}
                          alt={`Foto ${selectedPhotoIndex + 1}`}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            objectFit: 'contain'
                          }}
                        />
                        
                        {/* Botón siguiente */}
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: 16,
                            zIndex: 2,
                            color: '#fff',
                            bgcolor: alpha('#000', 0.3),
                            '&:hover': { bgcolor: alpha('#000', 0.5) }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextPhoto();
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      );
    }
      
    // Diseño para otros tipos de eventos
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 0.8,
        p: 0.5,
        bgcolor: alpha(event.color, 0.12),
        borderLeft: `3px solid ${event.color}`,
        borderRadius: '6px',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(event.color, 0.18),
          transform: 'translateY(-1px)',
          boxShadow: `0 2px 4px ${alpha(event.color, 0.2)}`
        }
      }}>
        <Avatar 
          sx={{ 
            width: 24, 
            height: 24, 
            bgcolor: alpha(event.color, 0.2),
            color: event.color,
            fontSize: '0.75rem'
          }}
        >
          {getEventIcon()}
        </Avatar>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'medium',
            fontSize: '0.8rem',
            color: event.color,
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {event.title || 'Sin título'}
        </Typography>
      </Box>
    );
  };

  // Actualizar la función useEffect para cargar los logs
  useEffect(() => {
    if (plant && plant.id) {
      const fetchDataFromDb = (path, type, color) => {
        const dbRef = ref(database, `${path}/${userData.uid}/${plant.id}`);
        
        onValue(dbRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const formattedEvents = Object.keys(data).map(key => {
              const item = data[key];
              
              // Para manejar correctamente las fechas de distintos tipos de eventos
              let eventDate = new Date(item.date.split('/').reverse().join('-') + 'T12:00:00');
              
              // Variables para manejar información específica según el tipo
              let title = type;
              let description = '';
              
              // Configurar información según el tipo de evento
              switch (type) {
                case 'Riego':
                  title = `${item.quantity} ml`;
                  description = item.aditives && item.aditives.length > 0 
                    ? `Con ${item.aditives.length} aditivo${item.aditives.length > 1 ? 's' : ''}` 
                    : 'Sin aditivos';
        break;
                case 'Insecticida':
                  title = item.product;
                  description = `Aplicación: ${item.appMethod}`;
        break;
                case 'Poda':
                  title = item.type;
                  description = 'Poda';
        break;
                case 'Transplante':
                  title = `${item.previousPot}L → ${item.newPot}L`;
                  description = 'Cambio de maceta';
        break;
                case 'Foto':
                  title = 'Nueva foto';
                  description = item.description || 'Sin descripción';
                  break;
                case 'Log':
                  title = 'Registro';
                  // Truncar descripción si es muy larga
                  description = item.description 
                    ? (item.description.length > 60 
                      ? item.description.substring(0, 55) + '...' 
                      : item.description)
                    : 'Sin descripción';
        break;
      default:
                  break;
              }
              
              return {
                id: `${type}-${key}`,
                title,
                description,
                start: eventDate,
                end: eventDate,
                color,
                resourceType: type,
                details: item,
                imageUrl: item.imageUrl || null
              };
            });
            
            setEvents(prev => {
              // Filtrar eventos anteriores del mismo tipo y añadir nuevos
              const filteredPrev = prev.filter(e => e.resourceType !== type);
              return [...filteredPrev, ...formattedEvents];
            });
          }
        });
      };
      
      // Limpiar eventos antes de obtener nuevos datos
      setEvents([]);
      
      // Obtener datos de todos los tipos de eventos
      fetchDataFromDb('riegos', 'Riego', '#2196f3');
      fetchDataFromDb('insecticides', 'Insecticida', '#f44336');
      fetchDataFromDb('podas', 'Poda', '#4caf50');
      fetchDataFromDb('transplantes', 'Transplante', '#ff9800');
      fetchDataFromDb('photos', 'Foto', '#9e9e9e');
      fetchDataFromDb('logs', 'Log', '#9c27b0');
    }
  }, [plant, userData.uid]);

  // Función para manejar cuando se selecciona un día
  const handleSelectSlot = (slotInfo) => {
    // Obtener todos los eventos para la fecha seleccionada
    const selectedDate = new Date(slotInfo.start);
    const eventsOnDay = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });

    if (eventsOnDay.length > 0) {
      setSelectedDay(selectedDate);
      setDayEvents(eventsOnDay);
      setOpenDayEventsModal(true);
    }
  };

  // Formateadores para mostrar fechas en formato legible
  const formatMonthYearDisplay = (date) => {
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };
  
  // Modificar la función formatDayDisplay para incluir el mes
  const formatDayDisplay = (date) => {
    const formattedDay = format(date, 'EEEE d \'de\' MMMM', { locale: es });
    return formattedDay.replace(/^\w/, c => c.toUpperCase());
  };

  // Función para calcular los días de vida de la planta
  const calculateLifeDays = () => {
    // Sumar los días de todas las etapas para obtener el total correcto
    let totalDays = 0;
    
    // Días en etapa de germinación
    const germinacionDays = calculateDaysInStage('Germinacion');
    if (germinacionDays) totalDays += germinacionDays;
    
    // Días en etapa vegetativa
    const vegetativoDays = calculateDaysInStage('Vegetativo');
    if (vegetativoDays) totalDays += vegetativoDays;
    
    // Días en etapa de floración
    const floracionDays = calculateDaysInStage('Floracion');
    if (floracionDays) totalDays += floracionDays;
    
    return totalDays > 0 ? totalDays : null;
  };
  
  // Función para calcular las semanas de vida
  const calculateLifeWeeks = () => {
    const days = calculateLifeDays();
    return days ? Math.floor(days / 7) : null;
  };
  
  // Función para calcular días en cada etapa
  const calculateDaysInStage = (stageName) => {
    if (stageName === 'Germinacion' && plant.birthDate) {
      if (plant.inicioVegetativo) {
        // Si ya pasó a vegetativo, calcular días que estuvo en germinación
        const parts = plant.birthDate.split('/');
        const germinationStart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        
        const vegParts = plant.inicioVegetativo.split('/');
        const vegStart = new Date(parseInt(vegParts[2]), parseInt(vegParts[1]) - 1, parseInt(vegParts[0]));
        
        const diffTime = Math.abs(vegStart - germinationStart);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        // Si sigue en germinación, calcular días desde el inicio hasta hoy
        return calculateDaysBetween(plant.birthDate);
      }
    } else if (stageName === 'Vegetativo' && plant.inicioVegetativo) {
      if (plant.inicioFloracion) {
        // Si ya pasó a floración, calcular días que estuvo en vegetativo
        const parts = plant.inicioVegetativo.split('/');
        const vegStart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        
        const florParts = plant.inicioFloracion.split('/');
        const florStart = new Date(parseInt(florParts[2]), parseInt(florParts[1]) - 1, parseInt(florParts[0]));
        
        const diffTime = Math.abs(florStart - vegStart);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (plant.etapa === 'Vegetativo') {
        // Si sigue en vegetativo, calcular días desde el inicio hasta hoy
        return calculateDaysBetween(plant.inicioVegetativo);
      }
    } else if (stageName === 'Floracion' && plant.inicioFloracion) {
      // Si está en floración, calcular días desde el inicio hasta hoy
      return calculateDaysBetween(plant.inicioFloracion);
    }
    return null;
  };
  
  // Manejador para cambiar la etapa de la planta
  const handleChangeStage = () => {
    setShowStageDialog(true);
  };
  
  // Función para confirmar el cambio de etapa
  const confirmStageChange = () => {
    setIsChangingStage(true);
    
    const plantId = checkSearch(location.search);
    let newStage, newStageDate;
    
    // Determinar la nueva etapa según la etapa actual
    if (plant.etapa === 'Germinacion') {
      newStage = 'Vegetativo';
      newStageDate = 'inicioVegetativo';
    } else if (plant.etapa === 'Vegetativo') {
      newStage = 'Floracion';
      newStageDate = 'inicioFloracion';
    } else if (plant.etapa === 'Floracion') {
      newStage = 'Secado';
      newStageDate = 'inicioSecado';
    } else if (plant.etapa === 'Secado') {
      newStage = 'Enfrascado';
      newStageDate = 'inicioEnfrascado';
    } else if (plant.etapa === 'Enfrascado') {
      // Al terminar Enfrascado, ofrecer mover al archivo
      setIsChangingStage(false);
      setShowStageDialog(false);
      
      Swal.fire({
        title: '¿Mover al archivo?',
        text: 'La planta ha completado su ciclo de vida. ¿Deseas moverla al archivo histórico?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: theme.palette.secondary.main,
        cancelButtonColor: theme.palette.primary.main,
        confirmButtonText: 'Sí, archivar planta',
        cancelButtonText: 'No, mantener activa'
      }).then((result) => {
        if (result.isConfirmed) {
          moveToHistory();
        }
      });
      return;
    } else {
      // Otro caso no esperado
      setIsChangingStage(false);
      setShowStageDialog(false);
      
      Swal.fire({
        icon: 'info',
        title: 'Fin del ciclo',
        text: 'La planta ya ha completado todo su ciclo de vida.',
        confirmButtonColor: theme.palette.primary.main
      });
      return;
    }
    
    // Crear objeto con la nueva etapa y su fecha de inicio
    const updateData = {
      etapa: newStage,
      [newStageDate]: getDate()
    };
    
    // Si cambiamos a Secado, también añadir fecha de finalización
    if (newStage === 'Secado') {
      updateData.finishDate = getDate();
    }
    
    // Si cambiamos de Secado a Enfrascado, añadir fecha de finalización del secado
    if (plant.etapa === 'Secado' && newStage === 'Enfrascado') {
      updateData.finalSecado = getDate();
    }
    
    // Determinar la ruta correcta según si la planta está archivada o activa
    const dbPath = plant.isArchived 
      ? `${auth.currentUser.uid}/plants/history/${plantId}` 
      : `${auth.currentUser.uid}/plants/active/${plantId}`;
    
    // Actualizar la base de datos
    database
      .ref(dbPath)
      .update(updateData)
      .then(() => {
        // Actualizar datos locales
        setPlant(prev => ({
          ...prev,
          etapa: newStage,
          [newStageDate]: updateData[newStageDate],
          ...(newStage === 'Secado' && { finishDate: updateData.finishDate }),
          ...(newStage === 'Enfrascado' && { finalSecado: updateData.finalSecado })
        }));
        
        setIsChangingStage(false);
        setShowStageDialog(false);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: `Etapa actualizada a ${newStage}`,
          text: `La planta ha avanzado a la etapa de ${newStage}`,
          confirmButtonColor: theme.palette.primary.main,
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(error => {
        console.error("Error al cambiar etapa:", error);
        setIsChangingStage(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la etapa. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Variables para íconos de etapas
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
  
  const etapaIcon = getStageIcon(plant?.etapa);

  const handleSetProfilePhoto = (imageUrl, imageKey) => {
    setShowProfilePhotoSelector(false);
    
    // Determinar la ruta correcta según si la planta está archivada o activa
    const plantId = checkSearch(location.search);
    const dbPath = plant.isArchived 
      ? `${auth.currentUser.uid}/plants/history/${plantId}` 
      : `${auth.currentUser.uid}/plants/active/${plantId}`;
    
    // Actualizar la base de datos con la foto de perfil seleccionada
    database
      .ref(dbPath)
      .update({
        profilePhotoUrl: imageUrl,
        profilePhotoKey: imageKey
      })
      .then(() => {
        // Actualizar el estado local
        setPlant(prev => ({
          ...prev,
          profilePhotoUrl: imageUrl,
          profilePhotoKey: imageKey
        }));
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Foto de perfil actualizada',
          text: 'La foto de perfil se ha actualizado correctamente',
          confirmButtonColor: theme.palette.primary.main,
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(error => {
        console.error("Error al actualizar la foto de perfil:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la foto de perfil. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Función para guardar datos de cosecha
  const saveHarvestData = () => {
    // Crear objeto con los datos no vacíos
    const harvestData = {};
    
    if (wetFlowersWeight.trim() !== '') {
      harvestData.wetFlowersWeight = parseFloat(wetFlowersWeight);
    }
    
    if (dryFlowersWeight.trim() !== '') {
      harvestData.dryFlowersWeight = parseFloat(dryFlowersWeight);
    }
    
    if (leavesWeight.trim() !== '') {
      harvestData.leavesWeight = parseFloat(leavesWeight);
    }
    
    // Si no hay datos para guardar, cerrar el diálogo
    if (Object.keys(harvestData).length === 0) {
      setShowHarvestDialog(false);
      return;
    }
    
    // Determinar la ruta correcta para guardar los datos (activa o historial)
    const plantId = checkSearch(location.search);
    const dbPath = plant.isArchived 
      ? `${auth.currentUser.uid}/plants/history/${plantId}` 
      : `${auth.currentUser.uid}/plants/active/${plantId}`;
    
    // Guardar los datos en la base de datos
    database
      .ref(dbPath)
      .update(harvestData)
      .then(() => {
        // Actualizar datos locales
        setPlant(prev => ({
          ...prev,
          ...harvestData
        }));
        
        setShowHarvestDialog(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Datos de cosecha guardados',
          text: 'Los datos de la cosecha se han guardado correctamente',
          confirmButtonColor: theme.palette.primary.main
        });
      })
      .catch(error => {
        console.error("Error al guardar datos de cosecha:", error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los datos de cosecha. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Función para mover la planta al historial
  const moveToHistory = () => {
    setIsMovingToHistory(true);
    
    // Obtener los datos actuales de la planta
    const plantId = checkSearch(location.search);
    
    // Crear una copia de la planta para el historial
    database
      .ref(`${auth.currentUser.uid}/plants/active/${plantId}`)
      .once('value')
      .then((snapshot) => {
        const plantData = snapshot.val();
        
        // Añadir fecha de finalización si no existe
        if (!plantData.finishDate) {
          plantData.finishDate = getDate();
        }
        
        // Si la planta está en etapa de secado y no tiene fecha de finalización del secado,
        // establecer automáticamente la fecha de finalización del secado
        if (plantData.etapa === 'Secado' && !plantData.finalSecado) {
          plantData.finalSecado = getDate();
          // Cambiar automáticamente a Enfrascado
          plantData.etapa = 'Enfrascado';
          plantData.inicioEnfrascado = getDate();
        }
        
        // Verificar si existe la ruta history, y si no, crearla
        return database
          .ref(`${auth.currentUser.uid}/plants/history`)
          .once('value')
          .then((historySnapshot) => {
            // Si history no existe, primero inicializamos la estructura
            if (!historySnapshot.exists()) {
              return database
                .ref(`${auth.currentUser.uid}/plants`)
                .update({ history: {} })
                .then(() => {
                  // Después de crear el nodo history, guardar la planta
                  return database
                    .ref(`${auth.currentUser.uid}/plants/history`)
                    .push(plantData);
                });
            } else {
              // Si history ya existe, simplemente guardamos la planta
              return database
                .ref(`${auth.currentUser.uid}/plants/history`)
                .push(plantData);
            }
          })
          .then((newRef) => {
            // Guardar el ID del nuevo nodo creado en el historial
            const newHistoryId = newRef ? newRef.key : null;
            
            // Eliminar de activas
            return database
              .ref(`${auth.currentUser.uid}/plants/active/${plantId}`)
              .remove()
              .then(() => newHistoryId);
          });
      })
      .then((newHistoryId) => {
        // Redirigir inmediatamente a la planta en el historial si tenemos el ID
        if (newHistoryId) {
          // Navegar primero, antes de mostrar la alerta
          navigate(`/Planta/?${newHistoryId}`);
          
          // Pequeño retraso para que la redirección ocurra antes de mostrar cualquier mensaje
          setTimeout(() => {
            setIsMovingToHistory(false);
            
            // Mostrar mensaje después de la redirección
            Swal.fire({
              icon: 'success',
              title: 'Planta archivada',
              text: 'La planta se ha movido correctamente al historial',
              confirmButtonColor: theme.palette.primary.main,
              timer: 2000,
              timerProgressBar: true
            });
          }, 300);
        } else {
          // Si no hay ID, simplemente ir a la lista (caso raro)
          setIsMovingToHistory(false);
          navigate('/Plantas');
          
          // Mostrar mensaje
          Swal.fire({
            icon: 'success',
            title: 'Planta archivada',
            text: 'La planta se ha movido correctamente al historial',
            confirmButtonColor: theme.palette.primary.main
          });
        }
      })
      .catch(error => {
        console.error("Error al mover la planta al historial:", error);
        setIsMovingToHistory(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo mover la planta al historial. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Función para cambiar el estado de la planta a Enfrascado
  const changeToEnfrascado = () => {
    const plantId = checkSearch(location.search);
    const dbPath = `${auth.currentUser.uid}/plants/history/${plantId}`;
    
    const today = getDate();
    
    // Actualizar la planta con finalSecado y cambiar etapa a Enfrascado
    database
      .ref(dbPath)
      .update({
        finalSecado: today,
        etapa: 'Enfrascado'
      })
      .then(() => {
        // Actualizar el estado local
        setPlant(prev => ({
          ...prev,
          finalSecado: today,
          etapa: 'Enfrascado'
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'Planta enfrascada',
          text: 'Se ha finalizado el secado y la planta ha pasado a estado de enfrascado',
          confirmButtonColor: theme.palette.primary.main
        });
      })
      .catch(error => {
        console.error("Error al actualizar estado:", error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado de la planta. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Añadir función formatWeekDisplay para mostrar el rango de fechas de la semana
  const formatMonthDisplay = (date) => {
    return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
  };

  // Asegurarse de que el componente CustomHeader no muestre nada
  const CustomHeader = React.memo(({ date }) => {
    return null; // Simplemente devolver null para no mostrar nada
  });

  // Modificar la función calculateDaysSinceStageChange para usar birthDate para Germinación
  const calculateDaysSinceStageChange = () => {
    if (plant.isArchived && plant.finishDate) {
      return calculateDryingDays();
    } else if (plant.etapa === 'Secado' && plant.finishDate) {
      return calculateDryingDays();
    } else if (plant.etapa === 'Floracion' && plant.inicioFloracion) {
      return calculateDaysBetween(plant.inicioFloracion);
    } else if (plant.etapa === 'Vegetativo' && plant.inicioVegetativo) {
      return calculateDaysBetween(plant.inicioVegetativo);
    } else if (plant.etapa === 'Germinacion' && plant.birthDate) {
      return calculateDaysBetween(plant.birthDate);
    }
    return null;
  };

  // Función para calcular días de secado
  const calculateDryingDays = () => {
    if (!plant.finishDate) return null;
    
    // Si existe finalSecado, calcular la diferencia entre finishDate y finalSecado
    if (plant.finalSecado) {
      return calculateDaysBetween(plant.finishDate, plant.finalSecado);
    }
    
    // Si no existe finalSecado, calcular la diferencia entre finishDate y la fecha actual
    return calculateDaysBetween(plant.finishDate);
  };

  // Función para manejar el proceso de cosecha
  const handleHarvest = () => {
    Swal.fire({
      title: '¿Estás seguro de cosechar esta planta?',
      text: 'La planta pasará a etapa de secado y se moverá al historial de plantas',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.palette.secondary.main,
      cancelButtonColor: theme.palette.primary.main,
      confirmButtonText: 'Sí, cosechar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Obtener ID de la planta y fecha actual
        const plantId = checkSearch(location.search);
        const today = getDate();
        
        // Actualizar a etapa "Secado" y guardar la fecha de finalización
        const updateData = {
          etapa: 'Secado',
          inicioSecado: today,
          finishDate: today
        };
        
        // Actualizar en la base de datos
        database
          .ref(`${auth.currentUser.uid}/plants/active/${plantId}`)
          .update(updateData)
          .then(() => {
            // Mover la planta al historial después de actualizar
            moveToHistory();
          })
          .catch(error => {
            console.error("Error al cosechar la planta:", error);
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cosechar la planta. Inténtalo nuevamente.',
              confirmButtonColor: theme.palette.primary.main
            });
          });
      }
    });
  };

  if (loading) {
    return (
      <Layout title="Cargando planta...">
        <Container maxWidth="lg">
          <Box sx={{ 
            p: 4,
            mt: 4
          }}>
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={200} 
                animation="wave" 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: '16px 16px 0 0'
                }} 
              />
              <CardContent>
                <Skeleton animation="wave" height={60} width="60%" sx={{ mb: 2 }} />
                <Skeleton animation="wave" height={40} width="80%" />
                <Skeleton animation="wave" height={40} width="70%" />
                <Skeleton animation="wave" height={40} width="90%" />
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Skeleton animation="wave" height={120} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton animation="wave" height={120} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Layout>
    );
  }

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
  let etapaBackgroundColor, etapaColor, etapaProgress;
  
  switch (plant.etapa || 'Vegetativo') {
    case 'Germinacion':
      etapaBackgroundColor = alpha(theme.palette.info.main, 0.1);
      etapaColor = theme.palette.info.main;
      etapaProgress = 30;
      break;
    case 'Vegetativo':
      etapaBackgroundColor = alpha(theme.palette.success.main, 0.1);
      etapaColor = theme.palette.success.main;
      etapaProgress = 60;
      break;
    case 'Floracion':
      etapaBackgroundColor = alpha(theme.palette.secondary.main, 0.1);
      etapaColor = theme.palette.secondary.main;
      etapaProgress = 90;
      break;
    default:
      etapaBackgroundColor = alpha(theme.palette.primary.main, 0.1);
      etapaColor = theme.palette.primary.main;
      etapaProgress = 50;
  }

  // Estilos globales para las animaciones
  const GlobalStyles = () => {
    return (
      <Global
        styles={{
          '.rbc-toolbar': {
            display: 'none !important'
          },
          '.rbc-header': {
            display: 'none !important'
          },
          '.rbc-month-header': {
            display: 'none !important'
          },
          '.rbc-header > span': {
            display: 'none !important'
          },
          '.rbc-row': {
            border: 'none !important'
          },
          '.rbc-month-row': {
            minHeight: '110px !important',
            border: 'none !important'
          },
          '.rbc-event': {
            borderRadius: '4px !important',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1) !important'
          },
          '.rbc-date-cell': {
            padding: '5px !important',
            textAlign: 'right !important'
          },
          '.rbc-off-range-bg': {
            backgroundColor: '#f8f8f8 !important'
          },
          '.rbc-off-range': {
            color: '#bbb !important'
          },
          '.rbc-today': {
            backgroundColor: 'transparent !important'
          },
          '.rbc-day-bg.rbc-today': {
            position: 'relative'
          },
          '.rbc-day-bg.rbc-today:after': {
            content: "''",
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
            pointerEvents: 'none'
          },
          // Ocultar específicamente la cabecera del calendario
          '.rbc-month-view > .rbc-row.rbc-month-header': {
            display: 'none !important'
          }
        }}
      />
    );
  };

  return (
    <Layout title={plant.name}>
      <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Estilos globales para animaciones */}
        <GlobalStyles />
        
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
            background: plant.isArchived 
              ? `linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            position: 'relative'
          }}>
            {/* Botón para volver atrás */}
            <IconButton 
              sx={{ color: '#ffffff', mr: 1 }}
              component={Link}
              to="/Plantas"
            >
              <ArrowBackIcon />
            </IconButton>

            {plant.isArchived ? (
              <HistoryIcon fontSize="large" sx={{ color: '#ffffff' }} />
            ) : (
              <ForestIcon fontSize="large" sx={{ color: '#ffffff' }} />
            )}
            <Box>
              <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
                {plant.name}
              </Typography>
              
              {plant.isArchived && (
                <Chip
                  label="Planta Archivada"
                  size="small"
                  icon={<HistoryIcon fontSize="small" />}
                  sx={{
                    mt: 0.5,
                    bgcolor: alpha('#ffffff', 0.2),
                    color: '#ffffff',
                    fontWeight: 'medium',
                    borderRadius: 1
                  }}
                />
              )}
            </Box>
          </Box>
        </Card>

        {/* Alerta para plantas archivadas */}
        {plant.isArchived && (
          <Alert 
            severity="info" 
            icon={<HistoryIcon />}
            sx={{ 
              mb: 3, 
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="body1">
                Esta planta se encuentra archivada y no puede ser modificada
              </Typography>
            </Box>
          </Alert>
        )}

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
                        {plant.genetic || 'No especificada'}
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
                      <Typography variant="subtitle1" color="text.secondary">Foto de perfil</Typography>
                      <Button
                        variant="outlined"
                      size="small"
                        startIcon={<AddAPhotoIcon />}
                        onClick={() => setShowProfilePhotoSelector(true)}
                      sx={{ 
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: theme.palette.primary.dark
                          }
                        }}
                      >
                        {plant.profilePhotoUrl ? 'Cambiar' : 'Seleccionar'}
                      </Button>
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
                  
                  {!plant.isArchived && (
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
                        <Typography variant="subtitle1" fontWeight="medium">
                          {calculateLifeDays() || 'No disponible'}
                        </Typography>
                      </Box>
                    </ListItem>
                  )}
                  
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
                      <Typography variant="subtitle1" color="text.secondary">Volumen de maceta</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {plant.potVolume ? `${plant.potVolume}L` : 'No especificado'}
                      </Typography>
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {etapaIcon}
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ ml: 1 }}>
                          {plant.etapa || 'No especificada'}
                        </Typography>
                        </Box>
                    </Box>
                  </ListItem>
                  
                  {/* Fecha de la cosecha - Solo visible cuando existe finishDate */}
                  {plant.finishDate && (
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
                        <Typography variant="subtitle1" color="text.secondary">Fecha de la cosecha</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                          <Typography variant="subtitle1" fontWeight="medium" sx={{ ml: 1 }}>
                            {convertToDetailedDate(plant.finishDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  )}
                  
                  {/* Sección con las 3 etapas en una fila */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    {/* Etapa Germinación */}
                    <Box sx={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.secondary.main, plant.etapa === 'Germinacion' ? 0.1 : 0.03),
                      borderLeft: plant.etapa === 'Germinacion' ? `4px solid ${theme.palette.secondary.main}` : 'none'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                        Germinación
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={plant.birthDate ? 'medium' : 'normal'}>
                        {plant.birthDate ? convertToDetailedDate(plant.birthDate) : 'No iniciada'}
                      </Typography>
                      {plant.birthDate && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                          {calculateDaysInStage('Germinacion')} días
                        </Typography>
                    )}
                  </Box>
                  
                    {/* Etapa Vegetativo */}
                    <Box sx={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      p: 2, 
                      borderRadius: 2, 
                      ml: 1,
                      bgcolor: alpha(theme.palette.secondary.main, plant.etapa === 'Vegetativo' ? 0.1 : 0.03),
                      borderLeft: plant.etapa === 'Vegetativo' ? `4px solid ${theme.palette.secondary.main}` : 'none'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                        Vegetativo
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={plant.inicioVegetativo ? 'medium' : 'normal'}>
                        {plant.inicioVegetativo ? convertToDetailedDate(plant.inicioVegetativo) : 'No iniciada'}
                      </Typography>
                      {plant.inicioVegetativo && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                          {calculateDaysInStage('Vegetativo')} días
                        </Typography>
                      )}
                        </Box>
                    
                    {/* Etapa Floración */}
                    <Box sx={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      p: 2, 
                      borderRadius: 2, 
                      ml: 1,
                      bgcolor: alpha(theme.palette.secondary.main, plant.etapa === 'Floracion' ? 0.1 : 0.03),
                      borderLeft: plant.etapa === 'Floracion' ? `4px solid ${theme.palette.secondary.main}` : 'none'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                        Floración
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={plant.inicioFloracion ? 'medium' : 'normal'}>
                        {plant.inicioFloracion ? convertToDetailedDate(plant.inicioFloracion) : 'No iniciada'}
                      </Typography>
                      {plant.inicioFloracion && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                          {calculateDaysInStage('Floracion')} días
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {!plant.isArchived ? (
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
                      <Typography variant="subtitle1" color="text.secondary">
                        {plant.etapa === 'Secado' ? 
                          'Días de secado' : 
                          `Semanas de ${plant.etapa || 'vida'}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={calculateDaysSinceStageChange() ? 
                            (plant.etapa === 'Secado' ? 
                              `${calculateDaysSinceStageChange()} días` : 
                              `${Math.floor(calculateDaysSinceStageChange() / 7)} semanas`) 
                            : 'No disponible'}
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        />
                        
                        {/* Botón para cambiar etapa */}
                        <Button
                          variant="contained"
                          color={plant.etapa === 'Floracion' ? "warning" : "secondary"}
                          size="small"
                          onClick={handleChangeStage}
                          startIcon={plant.etapa === 'Floracion' ? <LocalFloristIcon /> : <ArrowForwardIcon />}
                          sx={{ 
                            ml: 2,
                            bgcolor: plant.etapa === 'Floracion' ? '#e65100' : theme.palette.secondary.main,
                            '&:hover': {
                              bgcolor: plant.etapa === 'Floracion' ? '#bf360c' : theme.palette.secondary.dark,
                              transform: 'translateY(-2px)',
                              boxShadow: plant.etapa === 'Floracion' 
                                ? '0 4px 12px rgba(230, 81, 0, 0.4)'
                                : `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`
                            },
                            transition: 'all 0.2s ease',
                            ...(plant.etapa === 'Floracion' && {
                              fontWeight: 'bold',
                              '@keyframes pulse': {
                                '0%': {
                                  boxShadow: '0 0 0 0 rgba(230, 81, 0, 0.4)'
                                },
                                '70%': {
                                  boxShadow: '0 0 0 10px rgba(230, 81, 0, 0)'
                                },
                                '100%': {
                                  boxShadow: '0 0 0 0 rgba(230, 81, 0, 0)'
                                }
                              },
                              animation: 'pulse 2s infinite'
                            })
                          }}
                        >
                          {plant.etapa === 'Floracion' ? 'Cosechar' : 'Cambiar etapa'}
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                  ) : (
                    plant.etapa === 'Secado' && plant.finishDate && !plant.finalSecado && (
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
                        <Typography variant="subtitle1" color="text.secondary">Completar secado</Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={changeToEnfrascado}
                          startIcon={<LocalFloristIcon />}
                        >
                          Finalizar secado
                        </Button>
                      </Box>
                    </ListItem>
                    )
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Nueva sección de Acciones Rápidas */}
        {!plant.isArchived && (
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
              action={
                !plant.isArchived && plant.etapa === 'Floracion' && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleHarvest}
                    startIcon={<LocalFloristIcon />}
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      py: 1,
                      px: 3,
                      bgcolor: '#e65100', // Color naranja-rojo llamativo
                      '&:hover': {
                        bgcolor: '#bf360c',
                        boxShadow: '0 6px 16px rgba(230, 81, 0, 0.6)',
                        transform: 'translateY(-2px)'
                      },
                      boxShadow: '0 4px 12px rgba(230, 81, 0, 0.4)',
                      transition: 'all 0.3s ease',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(230, 81, 0, 0.4)'
                        },
                        '70%': {
                          boxShadow: '0 0 0 15px rgba(230, 81, 0, 0)'
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(230, 81, 0, 0)'
                        }
                      },
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    COSECHAR
                  </Button>
                )
              }
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
                    to={`/NuevoPoda/?${checkSearch(location.search)}`}
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
                  to={`/NuevoLog/?${checkSearch(location.search)}`}
                  startIcon={<NoteAltIcon />}
                  fullWidth
                  sx={{ 
                    p: 1.5,
                    bgcolor: '#9c27b0',
                    '&:hover': {
                      bgcolor: '#7b1fa2',
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha('#9c27b0', 0.3)}`
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 8px ${alpha('#9c27b0', 0.2)}`,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginBottom: 1
                    }
                  }}
                >
                  <Box sx={{ mt: 0 }}>Nota</Box>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        )}

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
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' },
            p: 2.5, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            gap: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', md: 'flex-start' },
              width: { xs: '100%', md: 'auto' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CalendarMonthIcon sx={{ mr: 1.5, color: '#ffffff', fontSize: 28 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Historial de actividades
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'medium',
                  color: alpha('#ffffff', 0.95),
                  fontSize: { xs: '1.4rem', sm: '1.6rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  mt: 0.5
                }}
              >
                {viewMode === 'month' 
                  ? formatMonthDisplay(currentDate) 
                  : formatDayDisplay(currentDate)
                }
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5,
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'space-between', md: 'flex-end' }
            }}>
              {/* Botones de navegación */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                p: 0.5,
                bgcolor: alpha('#ffffff', 0.1),
                borderRadius: 2,
                backdropFilter: 'blur(4px)'
              }}>
                <Tooltip title="Mes anterior">
                  <IconButton 
                    size="medium" 
                    onClick={() => handleNavigate('PREV')}
                    sx={{ 
                      color: '#ffffff', 
                      bgcolor: alpha('#ffffff', 0.1),
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        bgcolor: alpha('#ffffff', 0.2),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Hoy">
                  <IconButton 
                    size="medium"
                    onClick={() => handleNavigate('TODAY')}
                    sx={{ 
                      color: '#ffffff', 
                      bgcolor: alpha('#ffffff', 0.15),
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        bgcolor: alpha('#ffffff', 0.25),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <TodayIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Mes siguiente">
                  <IconButton 
                    size="medium"
                    onClick={() => handleNavigate('NEXT')}
                    sx={{ 
                      color: '#ffffff', 
                      bgcolor: alpha('#ffffff', 0.1),
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        bgcolor: alpha('#ffffff', 0.2),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* Botón de filtro */}
              <Tooltip title="Filtrar eventos" placement="top">
                <IconButton 
                  onClick={() => setShowFilters(!showFilters)}
                  size="medium"
                  aria-label="Mostrar filtros"
                  sx={{ 
                    color: '#ffffff', 
                    bgcolor: showFilters ? alpha('#ffffff', 0.25) : alpha('#ffffff', 0.1),
                    width: 40,
                    height: 40,
                    '&:hover': { 
                      bgcolor: alpha('#ffffff', 0.2),
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Panel de filtros */}
          <Collapse in={showFilters}>
            <Box sx={{ 
              p: 2.5, 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mr: 1, 
                  alignSelf: 'center',
                  fontWeight: 'bold'
                }}
              >
                Filtrar por tipo:
              </Typography>
              
              <Chip
                label="Riegos"
                icon={<WaterDropIcon />}
                onClick={() => toggleFilter('Riego')}
                variant={filters.Riego ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Riego ? '#fff' : theme.palette.info.main,
                  bgcolor: filters.Riego ? theme.palette.info.main : 'transparent',
                  borderColor: theme.palette.info.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              
              <Chip
                label="Insecticidas"
                icon={<BugReportIcon />}
                onClick={() => toggleFilter('Insecticida')}
                variant={filters.Insecticida ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Insecticida ? '#fff' : theme.palette.error.main,
                  bgcolor: filters.Insecticida ? theme.palette.error.main : 'transparent',
                  borderColor: theme.palette.error.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              
              <Chip
                label="Podas"
                icon={<ContentCutIcon />}
                onClick={() => toggleFilter('Poda')}
                variant={filters.Poda ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Poda ? '#fff' : theme.palette.success.main,
                  bgcolor: filters.Poda ? theme.palette.success.main : 'transparent',
                  borderColor: theme.palette.success.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              
              <Chip
                label="Transplantes"
                icon={<SwapHorizIcon />}
                onClick={() => toggleFilter('Transplante')}
                variant={filters.Transplante ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Transplante ? '#fff' : theme.palette.warning.main,
                  bgcolor: filters.Transplante ? theme.palette.warning.main : 'transparent',
                  borderColor: theme.palette.warning.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              
              <Chip
                label="Fotos"
                icon={<PhotoCameraIcon />}
                onClick={() => toggleFilter('Foto')}
                variant={filters.Foto ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Foto ? '#fff' : theme.palette.secondary.main,
                  bgcolor: filters.Foto ? theme.palette.secondary.main : 'transparent',
                  borderColor: theme.palette.secondary.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              <Chip
                label="Logs"
                icon={<NoteAltIcon />}
                onClick={() => toggleFilter('Log')}
                variant={filters.Log ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Log ? '#fff' : '#9c27b0',
                  bgcolor: filters.Log ? '#9c27b0' : 'transparent',
                  borderColor: '#9c27b0',
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
              <Chip
                label="Etapas"
                icon={<LocalFloristIcon />}
                onClick={() => toggleFilter('Etapa')}
                variant={filters.Etapa ? 'filled' : 'outlined'}
                sx={{ 
                  color: filters.Etapa ? '#fff' : theme.palette.primary.main,
                  bgcolor: filters.Etapa ? theme.palette.primary.main : 'transparent',
                  borderColor: theme.palette.primary.main,
                  '&:hover': { 
                    opacity: 0.85,
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s',
                  fontWeight: 'medium',
                  px: 1
                }}
              />
            </Box>
          </Collapse>
          
          <Box sx={{ p: 0, position: 'relative', height: calendarHeight }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents.length > 0 ? filteredEvents : events}
              views={['month']}
              view="month"
              date={currentDate}
              onNavigate={handleNavigate}
              startAccessor="start"
              endAccessor="end"
              style={enhancedCalendarStyles}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              onSelectSlot={handleSelectSlot}
              selectable={true}
              components={{
                event: EventComponent,
                toolbar: () => null,
                header: CustomHeader,
                month: {
                  header: CustomHeader
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

        {/* Modal para detalles de un evento específico */}
      <Dialog 
        open={openCalendarModal} 
        onClose={() => setOpenCalendarModal(false)}
        maxWidth="sm"
        fullWidth
          TransitionComponent={Fade}
          transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              bgcolor: theme.palette.background.paper
            }
          }}
        >
          {selectedEvent && (
            <>
              <Box sx={{ 
                position: 'relative',
            overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${selectedEvent.color} 0%, ${alpha(selectedEvent.color, 0.8)} 100%)`,
                  color: '#ffffff',
                  boxShadow: `0 4px 20px ${alpha(selectedEvent.color, 0.5)}`
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#ffffff', 0.2), 
                        color: '#ffffff',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {selectedEvent.icon === 'water' && <WaterDropIcon />}
                      {selectedEvent.icon === 'bug' && <BugReportIcon />}
                      {selectedEvent.icon === 'cut' && <ContentCutIcon />}
                      {selectedEvent.icon === 'swap' && <SwapHorizIcon />}
                      {selectedEvent.icon === 'photo' && <PhotoCameraIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                        {selectedEvent.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9) }}>
                        {convertToDetailedDate(selectedEvent.details.date)}
                      </Typography>
                    </Box>
                  </Stack>
          <IconButton
            onClick={() => setOpenCalendarModal(false)}
                    size="small"
            sx={{
                      color: 'white',
                      bgcolor: alpha('#ffffff', 0.15),
              '&:hover': {
                        bgcolor: alpha('#ffffff', 0.25)
                      },
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
                
                <DialogContent 
                  sx={{ 
                    p: 0,
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(selectedEvent.color, 0.2),
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(selectedEvent.color, 0.05)
                    }
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <EventDetails event={selectedEvent} />
              </Box>
                </DialogContent>
            </Box>
            </>
          )}
      </Dialog>
    </Box>

    {/* Diálogo para seleccionar foto de perfil */}
    <Dialog
      open={showProfilePhotoSelector}
      onClose={() => setShowProfilePhotoSelector(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Seleccionar Foto de Perfil
        <IconButton
          aria-label="cerrar"
          onClick={() => setShowProfilePhotoSelector(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {plant.images && Object.keys(plant.images).length > 0 ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(plant.images).map(([key, image]) => {
              const isCurrentProfile = plant.profilePhotoKey === key;
              return (
                <Grid item xs={6} sm={4} md={3} key={key}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 1, 
                      position: 'relative',
                      border: isCurrentProfile ? `2px solid ${theme.palette.primary.main}` : 'none',
                      opacity: isCurrentProfile ? 0.8 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 150, 
                        backgroundImage: `url(${image.url || image.dataUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSetProfilePhoto(image.url || image.dataUrl, key)}
                    />
                    
                    {isCurrentProfile && (
                      <Chip 
                        label="Actual" 
                        color="primary" 
                        size="small"
                        sx={{
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                      {image.date}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay fotos disponibles
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={`/NuevaFoto/?${checkSearch(location.search)}`}
              startIcon={<AddAPhotoIcon />}
              sx={{ mt: 2 }}
            >
              Añadir Nueva Foto
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>

    {/* Diálogo para cambiar etapa de crecimiento */}
    <Dialog
      open={showStageDialog}
      onClose={() => setShowStageDialog(false)}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 2.5, 
        background: plant.etapa === 'Floracion' 
          ? `linear-gradient(135deg, #e65100 0%, #ff9800 100%)`
          : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {plant.etapa === 'Floracion' ? <LocalFloristIcon /> : <LocalFloristIcon />}
          <Typography variant="h6" component="div">
            {plant.etapa === 'Floracion' 
              ? 'Cosechar planta' 
              : 'Cambiar etapa de crecimiento'}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setShowStageDialog(false)}
          aria-label="cerrar"
          size="small"
          sx={{
            bgcolor: alpha('#ffffff', 0.15),
            '&:hover': { bgcolor: alpha('#ffffff', 0.25) }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ 
          p: 2.5, 
          bgcolor: plant.etapa === 'Floracion'
            ? alpha('#e65100', 0.1)
            : alpha(theme.palette.secondary.main, 0.1), 
          borderRadius: 2,
          border: plant.etapa === 'Floracion'
            ? `1px solid ${alpha('#e65100', 0.2)}`
            : `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          mb: 3
        }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon fontSize="small" color={plant.etapa === 'Floracion' ? "warning" : "secondary"} />
            {plant.etapa === 'Floracion' 
              ? 'Información sobre la cosecha' 
              : 'Información sobre el cambio de etapa'}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {plant.etapa === 'Floracion' 
              ? 'Estás a punto de cosechar tu planta. El sistema guardará la fecha actual como inicio del secado y fin del ciclo de floración.' 
              : 'Estás a punto de cambiar la etapa de crecimiento de tu planta. El sistema guardará la fecha actual como inicio de la nueva etapa.'}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main, mb: 1 }}>
              Etapa actual: {plant.etapa}
            </Typography>
            
            {plant.etapa === 'Germinacion' && (
              <Typography variant="body2" color="text.secondary">
                La planta pasará a <strong>Vegetativo</strong>. Se guardará la fecha de inicio del período vegetativo.
              </Typography>
            )}
            
            {plant.etapa === 'Vegetativo' && (
              <Typography variant="body2" color="text.secondary">
                La planta pasará a <strong>Floración</strong>. Se guardará la fecha de inicio de la floración.
              </Typography>
            )}
            
            {plant.etapa === 'Floracion' && (
              <Typography variant="body2" color="text.secondary">
                La planta pasará a <strong>Secado</strong>. Se guardará la fecha de inicio del secado.
              </Typography>
            )}
            
            {plant.etapa === 'Secado' && (
              <Typography variant="body2" color="text.secondary">
                La planta pasará a <strong>Enfrascado</strong>. Se guardará la fecha de inicio del enfrascado.
              </Typography>
            )}
            
            {plant.etapa === 'Enfrascado' && (
              <Typography variant="body2" color="text.secondary">
                La planta ya ha completado todo su ciclo de vida y se encuentra en la etapa final de conservación.
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Cronología visual de etapas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plant.etapa === 'Germinacion' ? 1 : 0.6
          }}>
            <Avatar 
              sx={{ 
                bgcolor: plant.etapa === 'Germinacion' ? theme.palette.info.main : alpha(theme.palette.text.secondary, 0.1),
                color: plant.etapa === 'Germinacion' ? 'white' : theme.palette.text.secondary,
                mb: 1
              }}
            >
              <SpaIcon />
            </Avatar>
            <Typography variant="caption" fontWeight="medium">Germinación</Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plant.etapa === 'Vegetativo' ? 1 : 0.6
          }}>
            <Avatar 
              sx={{ 
                bgcolor: plant.etapa === 'Vegetativo' ? theme.palette.success.main : alpha(theme.palette.text.secondary, 0.1),
                color: plant.etapa === 'Vegetativo' ? 'white' : theme.palette.text.secondary,
                mb: 1
              }}
            >
              <GrassIcon />
            </Avatar>
            <Typography variant="caption" fontWeight="medium">Vegetativo</Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plant.etapa === 'Floracion' ? 1 : 0.6
          }}>
            <Avatar 
              sx={{ 
                bgcolor: plant.etapa === 'Floracion' ? theme.palette.warning.main : alpha(theme.palette.text.secondary, 0.1),
                color: plant.etapa === 'Floracion' ? 'white' : theme.palette.text.secondary,
                mb: 1
              }}
            >
              <LocalFloristIcon />
            </Avatar>
            <Typography variant="caption" fontWeight="medium">Floración</Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plant.etapa === 'Secado' ? 1 : 0.6
          }}>
            <Avatar 
              sx={{ 
                bgcolor: plant.etapa === 'Secado' ? theme.palette.error.main : alpha(theme.palette.text.secondary, 0.1),
                color: plant.etapa === 'Secado' ? 'white' : theme.palette.text.secondary,
                mb: 1
              }}
            >
              <ParkIcon />
            </Avatar>
            <Typography variant="caption" fontWeight="medium">Secado</Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plant.etapa === 'Enfrascado' ? 1 : 0.6
          }}>
            <Avatar 
              sx={{ 
                bgcolor: plant.etapa === 'Enfrascado' ? theme.palette.secondary.main : alpha(theme.palette.text.secondary, 0.1),
                color: plant.etapa === 'Enfrascado' ? 'white' : theme.palette.text.secondary,
                mb: 1
              }}
            >
              <ForestIcon />
            </Avatar>
            <Typography variant="caption" fontWeight="medium">Enfrascado</Typography>
          </Box>
        </Box>

        {/* Información adicional para la etapa de Secado -> Enfrascado */}
        {plant.etapa === 'Secado' && (
          <Box sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.secondary.main, 0.05), 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            mt: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              El <strong>Enfrascado</strong> es la etapa final de conservación donde la planta, ya seca, se guarda en recipientes herméticos para su curado final y conservación.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          variant="outlined" 
          onClick={() => setShowStageDialog(false)}
          startIcon={<CloseIcon />}
          sx={{ 
            borderColor: theme.palette.text.secondary,
            color: theme.palette.text.secondary
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color={plant.etapa === 'Floracion' ? "warning" : "secondary"}
          onClick={confirmStageChange}
          startIcon={plant.etapa === 'Floracion' ? <LocalFloristIcon /> : <ArrowForwardIcon />}
          disabled={isChangingStage}
          sx={{ 
            ml: 2,
            bgcolor: plant.etapa === 'Floracion' ? '#e65100' : null,
            boxShadow: plant.etapa === 'Floracion' 
              ? '0 4px 12px rgba(230, 81, 0, 0.3)'
              : `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
            '&:hover': {
              bgcolor: plant.etapa === 'Floracion' ? '#bf360c' : null,
              boxShadow: plant.etapa === 'Floracion'
                ? '0 6px 16px rgba(230, 81, 0, 0.4)'
                : `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s',
            fontWeight: plant.etapa === 'Floracion' ? 'bold' : 'medium'
          }}
        >
          {isChangingStage ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              {plant.etapa === 'Floracion' ? 'Cosechando...' : 'Cambiando...'}
            </>
          ) : (
            <>{plant.etapa === 'Floracion' ? 'Cosechar Planta' : 'Confirmar cambio'}</>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  </Layout>
  );
};

export default Plant;