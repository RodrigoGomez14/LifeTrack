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
  const [viewMode, setViewMode] = useState('week'); // 'week' o 'day'
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [showHarvestDialog, setShowHarvestDialog] = useState(false);
  const [wetFlowersWeight, setWetFlowersWeight] = useState('');
  const [dryFlowersWeight, setDryFlowersWeight] = useState('');
  const [leavesWeight, setLeavesWeight] = useState('');
  const [isMovingToHistory, setIsMovingToHistory] = useState(false);
  
  const calendarHeight = 700; // Variable para controlar la altura

  // Reemplazar la función handleNavigate para usar correctamente la API de react-big-calendar
  // y permitir navegación adaptativa según el modo de visualización
  const handleNavigate = (action) => {
    const date = new Date(currentDate);
    
    switch(action) {
      case 'PREV':
        if (viewMode === 'week') {
          date.setDate(date.getDate() - 7); // Retroceder una semana
        } else {
          date.setDate(date.getDate() - 1); // Retroceder un día
        }
        break;
      case 'NEXT':
        if (viewMode === 'week') {
          date.setDate(date.getDate() + 7); // Avanzar una semana
        } else {
          date.setDate(date.getDate() + 1); // Avanzar un día
        }
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
    
    // Estilos para el encabezado
    '.rbc-header': {
      padding: 0,
      margin: 0,
      border: 'none',
      height: '150px'
    },
    
    // Eliminar estilos que pueden estar causando conflictos
    '.rbc-header span': {
      display: 'none'
    },
    
    // Filas del calendario
    '.rbc-row': {
      border: 'none'
    },
    
    // Eventos
    '.rbc-event': {
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    },
    
    // Tiempo contenido
    '.rbc-time-header': {
      height: '150px'
    },
    
    '.rbc-time-header-content': {
      height: '150px'
    },
    
    '.rbc-time-header-content > .rbc-row': {
      height: '150px'
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

    actions.forEach(action => {
      if (action.data) {
        Object.keys(action.data).forEach(key => {
          const dateArray = action.data[key].date.split('/');
          const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
          
          // Crear fecha ajustada para asegurar que se muestre en el día correcto
          const eventDate = new Date(formattedDate + 'T12:00:00');
          
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
            case 'Log':
              description = action.data[key].description.length > 30 
                ? action.data[key].description.substring(0, 30) + '...' 
                : action.data[key].description;
              break;
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
            details: action.data[key],
            eventKey: key
          });
        });
      }
    });

    // Agregar eventos para las fechas de etapas de crecimiento
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
    const getEventIcon = () => {
      if (event.resourceType === 'Etapa') {
        if (event.stageType === 'Germinacion') return <SpaIcon fontSize="small" />;
        if (event.stageType === 'Vegetativo') return <GrassIcon fontSize="small" />;
        if (event.stageType === 'Floracion') return <LocalFloristIcon fontSize="small" />;
        return <LocalFloristIcon fontSize="small" />;
      }
      
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
        default:
          return <InfoIcon fontSize="small" />;
      }
    };
    
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
          {event.title}
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

  // Restaurar y mejorar el componente DailyEventComponent
  const DailyEventComponent = ({ event }) => {
    // Estado para controlar el modal de la imagen ampliada
    const [openImageModal, setOpenImageModal] = useState(false);
    
    // Manejadores para el modal
    const handleOpenImage = (e) => {
      if (event.resourceType === 'Foto' && event.thumbnail) {
        e.stopPropagation(); // Evitar que se active el evento del calendario
        setOpenImageModal(true);
      }
    };
    
    const handleCloseImage = () => {
      setOpenImageModal(false);
    };
    
    // Si es un evento de etapa, mostrar un diseño especial
    if (event.resourceType === 'Etapa') {
    return (
        <Card 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: `0 4px 8px ${alpha(event.color, 0.2)}`,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 12px ${alpha(event.color, 0.3)}`
            }
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            background: `linear-gradient(45deg, ${event.color} 0%, ${alpha(event.color, 0.8)} 100%)`,
            color: '#fff'
          }}>
            <Avatar sx={{ bgcolor: alpha('#fff', 0.2), mr: 2 }}>
              {event.stageType === 'Germinacion' && <SpaIcon />}
              {event.stageType === 'Vegetativo' && <GrassIcon />}
              {event.stageType === 'Floracion' && <LocalFloristIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {event.details.type}
            </Typography>
              <Typography variant="caption">
              {convertToDetailedDate(event.details.date)}
            </Typography>
            </Box>
          </Box>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {event.details.description}
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    // Si es un evento de tipo foto, usar el diseño para fotos
    if (event.resourceType === 'Foto' && event.thumbnail) {
      return (
        <>
          <Card 
            variant="outlined"
            sx={{ 
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: alpha(event.color, 0.1),
              borderLeft: `5px solid ${event.color}`,
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              boxShadow: `0 2px 8px ${alpha(event.color, 0.15)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateX(2px)',
                boxShadow: `0 3px 10px ${alpha(event.color, 0.25)}`
              },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box 
              sx={{ 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderBottom: `1px solid ${alpha(event.color, 0.2)}`,
                bgcolor: alpha(event.color, 0.15)
              }}
            >
              <Avatar 
                sx={{ 
                  width: 22, 
                  height: 22, 
                  bgcolor: alpha(event.color, 0.2),
                  color: event.color
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </Avatar>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'bold',
                  color: event.color,
                  fontSize: '0.75rem',
                  flexGrow: 1
                }}
              >
                {event.title}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                p: 2, 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                onClick={handleOpenImage}
                sx={{
                  maxWidth: '90%', 
                  maxHeight: '120px',
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 3px 8px ${alpha(theme.palette.common.black, 0.15)}`
                  }
                }}
              >
              <Box 
                component="img" 
                src={event.imageUrl} 
                  alt={event.title} 
                sx={{ 
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '120px',
                    objectFit: 'contain'
                  }} 
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    backgroundColor: alpha('#ffffff', 0.7),
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                  }}
                >
                  <ZoomInIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
              
              {event.description && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1,
                    color: theme.palette.text.secondary,
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {event.description}
                </Typography>
            )}
          </Box>
          </Card>
          
          {/* Modal para mostrar la imagen ampliada */}
          <Dialog
            open={openImageModal}
            onClose={handleCloseImage}
            maxWidth="lg"
            sx={{
              '.MuiDialog-paper': {
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.background.paper, 0.95)
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
                bgcolor: alpha(event.color, 0.1),
                borderBottom: `1px solid ${alpha(event.color, 0.3)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCameraIcon sx={{ color: event.color }} />
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                  {event.title}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                onClick={handleCloseImage}
                aria-label="cerrar"
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 2, position: 'relative', bgcolor: alpha(theme.palette.background.default, 0.8) }}>
              <Box sx={{ 
                position: 'relative', 
                width: '100%',
                height: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Box 
                  component="img" 
                  src={event.imageUrl} 
                  alt={event.title}
                  sx={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
                  }}
                />
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.95) }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {convertToDetailedDate(event.details.date)}
                </Typography>
                {event.description && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {event.description}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={handleCloseImage}
                sx={{
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.text.primary,
                    color: theme.palette.text.primary,
                    bgcolor: alpha(theme.palette.text.primary, 0.05)
                  }
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      );
    }
    
    // Para otros tipos de eventos, mantener el diseño original
    return (
      <Card
        variant="outlined"
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
          borderRadius: 2,
          backgroundColor: alpha(event.color, 0.1),
          borderLeft: `5px solid ${event.color}`,
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          boxShadow: `0 2px 8px ${alpha(event.color, 0.15)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateX(2px)',
            boxShadow: `0 3px 10px ${alpha(event.color, 0.25)}`
          },
          display: 'flex',
          flexDirection: 'column'
          }}
        >
          <Box
            sx={{
            p: 1, 
            borderBottom: `1px solid ${alpha(event.color, 0.2)}`,
            bgcolor: alpha(event.color, 0.15),
              display: 'flex',
              alignItems: 'center',
            gap: 1
          }}
        >
          <Avatar 
            sx={{ 
              width: 22, 
              height: 22, 
              bgcolor: alpha(event.color, 0.2),
              color: event.color
            }}
          >
            {event.icon === 'water' && <OpacityIcon fontSize="small" />}
            {event.icon === 'bug' && <BugReportIcon fontSize="small" />}
            {event.icon === 'cut' && <ContentCutIcon fontSize="small" />}
            {event.icon === 'swap' && <SwapHorizIcon fontSize="small" />}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: event.color,
              fontSize: '0.75rem',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {event.title}
          </Typography>
        </Box>

        <Box sx={{ p: 1, flexGrow: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.8rem',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {event.description}
          </Typography>
          
          {event.resourceType === 'Riego' && (
            <Chip
              size="small"
              variant="outlined"
              icon={<WaterDropIcon sx={{ fontSize: '0.7rem !important' }} />}
              label={`${event.details.quantity} ml`}
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                borderColor: alpha(event.color, 0.3),
                color: event.color
              }}
            />
          )}
          
          {event.resourceType === 'Insecticida' && (
            <Chip
              size="small"
              variant="outlined"
              icon={<BugReportIcon sx={{ fontSize: '0.7rem !important' }} />}
              label={event.details.product}
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                borderColor: alpha(event.color, 0.3),
                color: event.color
              }}
            />
          )}
          
          {event.resourceType === 'Poda' && (
            <Chip
              size="small"
              variant="outlined"
              icon={<ContentCutIcon sx={{ fontSize: '0.7rem !important' }} />}
              label={event.details.type}
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                borderColor: alpha(event.color, 0.3),
                color: event.color
              }}
            />
          )}
          
          {event.resourceType === 'Transplante' && (
            <Chip
              size="small"
              variant="outlined"
              icon={<SwapHorizIcon sx={{ fontSize: '0.7rem !important' }} />}
              label={`${event.details.previousPot}L → ${event.details.newPot}L`}
              sx={{ 
                height: 20, 
                fontSize: '0.7rem', 
                borderColor: alpha(event.color, 0.3),
                color: event.color
              }}
            />
          )}
        </Box>
      </Card>
    );
  };

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
    } else {
      // Estamos finalizando una planta que ya está en Secado
      moveToHistory();
      return;
    }
    
    // Crear objeto con la nueva etapa y su fecha de inicio
    const updateData = {
      etapa: newStage,
      [newStageDate]: getDate()
    };
    
    // Actualizar la base de datos
    database
      .ref(`${auth.currentUser.uid}/plants/active/${plantId}`)
      .update(updateData)
      .then(() => {
        // Actualizar datos locales
        setPlant(prev => ({
          ...prev,
          etapa: newStage,
          [newStageDate]: updateData[newStageDate]
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
        
        // Si cambiamos a la etapa de secado, mostrar diálogo para mover a historial
        if (newStage === 'Secado') {
          setTimeout(() => {
            Swal.fire({
              title: '¿Deseas mover la planta al archivo?',
              text: 'Las plantas en etapa de secado se suelen mover al archivo para llevar registro de la cosecha',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: theme.palette.secondary.main,
              cancelButtonColor: theme.palette.primary.main,
              confirmButtonText: 'Sí, mover al archivo',
              cancelButtonText: 'No, dejar como activa'
            }).then((result) => {
              if (result.isConfirmed) {
                moveToHistory();
              }
            });
          }, 1500);
        }
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
        
        // Añadir fecha de finalización
        plantData.finishDate = getDate();
        
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
          .then(() => {
            // Eliminar de activas
            return database
              .ref(`${auth.currentUser.uid}/plants/active/${plantId}`)
              .remove();
          });
      })
      .then(() => {
        setIsMovingToHistory(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Planta archivada',
          text: 'La planta se ha movido correctamente al historial',
          confirmButtonColor: theme.palette.primary.main
        }).then(() => {
          // Redirigir a la lista de plantas
          navigate('/Plantas');
        });
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
  const formatWeekDisplay = (date) => {
    // Obtener el primer día de la semana (domingo o lunes según configuración)
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Ajustar para que la semana inicie en lunes
    
    // Obtener el último día de la semana
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    // Formatear ambas fechas
    const startMonth = start.toLocaleString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());
    const endMonth = end.toLocaleString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase());
    
    // Si ambas fechas están en el mismo mes, mostrar una versión simplificada
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth}`;
    }
    
    // Si están en diferentes meses, mostrar ambos meses
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
  };

  // Añadir un componente personalizado para el encabezado de los días en la vista semanal
  const CustomHeader = React.memo(({ date }) => {
    const isToday = isSameDay(date, new Date());
    
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNumber = date.getDate();
    
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 0',
          height: '100%',
          backgroundColor: isToday ? '#e8f5e9' : 'transparent',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#f0f4c3',
          }
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            textTransform: 'uppercase',
            fontWeight: 500,
            fontSize: '0.7rem',
            lineHeight: 1
          }}
        >
          {dayName}
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            fontWeight: isToday ? 700 : 500,
            fontSize: '1.1rem',
            color: isToday ? '#2e7d32' : 'inherit'
          }}
        >
          {dayNumber}
        </Typography>
      </Box>
    );
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
            padding: '0 !important',
            margin: '0 !important',
            border: 'none !important',
            height: 'auto !important',
            minHeight: 'auto !important',
            overflow: 'visible !important'
          },
          '.rbc-header > span': {
            display: 'none !important'
          },
          '.rbc-row': {
            border: 'none !important'
          },
          '.rbc-month-row': {
            minHeight: '110px !important'
          },
          '.rbc-event': {
            borderRadius: '4px !important',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1) !important'
          },
          '.rbc-date-cell': {
            padding: '0 !important'
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
                        {plant.etapa === 'Secado' || plant.isArchived ? 
                          'Días de secado' : 
                          `Semanas de ${plant.etapa || 'vida'}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={calculateDaysSinceStageChange() ? 
                            (plant.etapa === 'Secado' || plant.isArchived ? 
                              `${calculateDaysSinceStageChange()} días` : 
                              `${Math.floor(calculateDaysSinceStageChange() / 7)} semanas`) 
                            : 'No disponible'}
                          sx={{ 
                            fontWeight: 'medium',
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        />
                        
                        {/* Botón para cambiar a Enfrascado cuando hay finishDate pero no finalSecado */}
                        {plant.isArchived && plant.finishDate && !plant.finalSecado && (
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={changeToEnfrascado}
                            startIcon={<LocalFloristIcon />}
                            sx={{ ml: 2 }}
                          >
                            Finalizar secado
                          </Button>
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
                {viewMode === 'week' 
                  ? formatWeekDisplay(currentDate) 
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
                <Tooltip title={viewMode === 'week' ? "Semana anterior" : "Día anterior"}>
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
                
                <Tooltip title={viewMode === 'week' ? "Semana siguiente" : "Día siguiente"}>
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
              
              {/* Botones para cambiar tipo de vista */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                p: 0.5,
                bgcolor: alpha('#ffffff', 0.1),
                borderRadius: 2,
                backdropFilter: 'blur(4px)'
              }}>
                <Tooltip title="Vista semanal" placement="top">
                  <Button
                    variant={viewMode === 'week' ? 'contained' : 'text'}
                    onClick={() => setViewMode('week')}
                    startIcon={<ViewWeekIcon />}
                    sx={{ 
                      color: '#ffffff',
                      bgcolor: viewMode === 'week' ? alpha('#ffffff', 0.25) : 'transparent',
                      px: 2,
                      '&:hover': { 
                        bgcolor: viewMode === 'week' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.15),
                      },
                      minWidth: '120px'
                    }}
                  >
                    Semanal
                  </Button>
                </Tooltip>
                
                <Tooltip title="Vista diaria" placement="top">
                  <Button
                    variant={viewMode === 'day' ? 'contained' : 'text'}
                    onClick={() => setViewMode('day')}
                    startIcon={<CalendarViewDayIcon />}
                    sx={{ 
                      color: '#ffffff',
                      bgcolor: viewMode === 'day' ? alpha('#ffffff', 0.25) : 'transparent',
                      px: 2,
                      '&:hover': { 
                        bgcolor: viewMode === 'day' ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.15),
                      },
                      minWidth: '120px'
                    }}
                  >
                    Diaria
                  </Button>
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
              views={['week', 'day']}
              view={viewMode}
              onView={setViewMode}
              defaultView="week"
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
                event: viewMode === 'week' ? EventComponent : DailyEventComponent,
                toolbar: () => null,
                header: CustomHeader,
                month: {
                  header: CustomHeader
                },
                week: {
                  header: CustomHeader
                },
                day: {
                  header: CustomHeader
                }
              }}
              popup
              messages={{
                today: 'Hoy',
                previous: 'Anterior',
                next: 'Siguiente',
                week: 'Semana',
                day: 'Día',
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
  </Layout>
  );
};

export default Plant;