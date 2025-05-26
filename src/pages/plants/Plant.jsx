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
import SaveIcon from '@mui/icons-material/Save';
import ScienceIcon from '@mui/icons-material/Science';
import ShieldIcon from '@mui/icons-material/Shield';
import TimelineIcon from '@mui/icons-material/Timeline';

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

  
  // Estados para los inputs de peso
  const [pesoHumedoInput, setPesoHumedoInput] = useState('');
  const [pesoSecoInput, setPesoSecoInput] = useState('');
  const [savingPesoHumedo, setSavingPesoHumedo] = useState(false);
  const [savingPesoSeco, setSavingPesoSeco] = useState(false);
  
  // Añadir referencia al calendario para controlar la navegación
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [openDayEventsModal, setOpenDayEventsModal] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month' o 'day' (eliminamos 'week')
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
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
  }, [plant, theme.palette]);

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
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Resto de funciones de manejo de eventos...

  // Función para obtener los conteos de cada tipo de acción
  const getActionCounts = () => {
    const baseStats = [
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

    // Agregar estadísticas de peso según la etapa de la planta
    const weightStats = [];
    
    // Peso húmedo - mostrar si la planta ha sido cosechada
    if (plant.finishDate) {
      weightStats.push({
        label: 'Peso húmedo',
        value: plant.pesoHumedo ? `${plant.pesoHumedo}g` : 'No registrado',
        icon: <OpacityIcon />,
        color: '#ff6f00', // Orange
        isWeight: true,
        weightType: 'humedo',
        hasInput: !plant.pesoHumedo, // Permitir input si no hay peso registrado, sin importar si está archivada
        inputValue: pesoHumedoInput,
        setInputValue: setPesoHumedoInput,
        onSave: handleSavePesoHumedo,
        saving: savingPesoHumedo
      });
    }
    
    // Peso seco - mostrar si la planta ha sido enfrascada
    if (plant.etapa === 'Enfrascado') {
      weightStats.push({
        label: 'Peso seco',
        value: plant.pesoSeco ? `${plant.pesoSeco}g` : 'No registrado',
        icon: <LocalOfferIcon />,
        color: '#2e7d32', // Dark green
        isWeight: true,
        weightType: 'seco',
        hasInput: !plant.pesoSeco, // Permitir input si no hay peso registrado, sin importar si está archivada
        inputValue: pesoSecoInput,
        setInputValue: setPesoSecoInput,
        onSave: handleSavePesoSeco,
        saving: savingPesoSeco
      });
    }

    return [...baseStats, ...weightStats];
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
    
    const getEventIcon = () => {
      switch (event.resourceType) {
        case 'Riego':
          return <WaterDropIcon sx={{ fontSize: 28 }} />;
        case 'Insecticida':
          return <BugReportIcon sx={{ fontSize: 28 }} />;
        case 'Poda':
          return <ContentCutIcon sx={{ fontSize: 28 }} />;
        case 'Transplante':
          return <SwapHorizIcon sx={{ fontSize: 28 }} />;
        case 'Foto':
          return <PhotoCameraIcon sx={{ fontSize: 28 }} />;
        case 'Log':
          return <NoteAltIcon sx={{ fontSize: 28 }} />;
        case 'Etapa':
          if (event.stageType === 'Germinacion') return <SpaIcon sx={{ fontSize: 28 }} />;
          if (event.stageType === 'Vegetativo') return <GrassIcon sx={{ fontSize: 28 }} />;
          if (event.stageType === 'Floracion') return <LocalFloristIcon sx={{ fontSize: 28 }} />;
          return <LocalFloristIcon sx={{ fontSize: 28 }} />;
        default:
          return <InfoIcon sx={{ fontSize: 28 }} />;
      }
    };

    const getEventDetails = () => {
      if (event.resourceType === 'Etapa') {
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Cambio de etapa de crecimiento registrado
            </Typography>
          </Box>
        );
      }

      switch (event.resourceType) {
        case 'Riego':
          return (
            <Box>
              {/* Información principal */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                p: 3,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                mb: 3
              }}>
                <OpacityIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
                <Typography variant="h4" fontWeight="bold" color={theme.palette.info.main}>
                  {event.details.quantity} ml
                </Typography>
              </Box>
              
              {/* Aditivos si existen */}
              {event.details.aditives && event.details.aditives.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ color: theme.palette.success.main }} />
                    Aditivos utilizados
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    {event.details.aditives.map((aditivo, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                        }}
                      >
                        <Typography variant="body1" fontWeight="medium">
                          {aditivo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dosis: {aditivo.dosis} ml
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          );
          
        case 'Insecticida':
          return (
            <Box>
              {/* Información principal destacada - similar al riego */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,
                p: 3,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                mb: 3
              }}>
                <BugReportIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color={theme.palette.error.main}>
                    {event.details.treatmentType || 'Tratamiento'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    Método: {event.details.appMethod || 'No especificado'}
                  </Typography>
                </Box>
              </Box>
              
              {/* Insecticidas utilizados - similar a los aditivos del riego */}
              {event.details.insecticides && event.details.insecticides.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ color: theme.palette.error.main }} />
                    Insecticidas utilizados
                  </Typography>
                  
                  <Stack spacing={1.5}>
                    {event.details.insecticides.map((insecticide, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                        }}
                      >
                        <Typography variant="body1" fontWeight="medium">
                          {insecticide.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dosis: {insecticide.dosis}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Compatibilidad hacia atrás para formato antiguo */}
              {event.details.product && !event.details.insecticides && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon sx={{ color: theme.palette.error.main }} />
                    Producto utilizado
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                  }}>
                    <Typography variant="body1" fontWeight="medium">
                      {event.details.product}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Notas adicionales si existen */}
              {event.details.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NoteAltIcon sx={{ color: theme.palette.info.main }} />
                    Notas adicionales
                  </Typography>
                  <Box sx={{ 
                    p: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                  }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {event.details.notes}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );
          
        case 'Poda':
          return (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              p: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <ContentCutIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold" color={theme.palette.success.main}>
                {event.details.type}
              </Typography>
            </Box>
          );
          
        case 'Transplante':
          return (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 3,
              p: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Maceta anterior</Typography>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.warning.main}>
                  {event.details.previousPot}L
                </Typography>
              </Box>
              
              <ArrowForwardIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Nueva maceta</Typography>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.warning.main}>
                  {event.details.newPot}L
                </Typography>
              </Box>
            </Box>
          );
        
        case 'Foto':
          return (
            <Box>
              {event.details.description && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.primary">
                    {event.details.description}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                borderRadius: 3,
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}>
                <img 
                  src={event.imageUrl} 
                  alt="Foto de la planta" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    objectFit: 'cover'
                  }} 
                />
              </Box>
            </Box>
          );
          
        case 'Log':
          return (
            <Box sx={{ 
              p: 3,
              bgcolor: alpha('#9c27b0', 0.05),
              borderRadius: 3,
              border: `2px solid ${alpha('#9c27b0', 0.2)}`
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '1.1rem' }}>
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
      if (plant.finishDate) {
        // Si ya fue cosechada, calcular días que estuvo en floración
        return calculateDaysBetween(plant.inicioFloracion, plant.finishDate);
      } else {
        // Si sigue en floración, calcular días desde el inicio hasta hoy
        return calculateDaysBetween(plant.inicioFloracion);
      }
    }
    return null;
  };

  // Función para obtener la fecha de finalización de cada etapa
  const getStageEndDate = (stageName) => {
    switch (stageName) {
      case 'Germinacion':
        return plant.inicioVegetativo || null;
      case 'Vegetativo':
        return plant.inicioFloracion || null;
      case 'Floracion':
        return plant.finishDate || null;
      case 'Secado':
        return plant.finalSecado || null;
      default:
        return null;
    }
  };

  // Función para obtener información completa de cada etapa
  const getStageInfo = (stageName) => {
    let startDate = null;
    let endDate = null;
    let duration = null;
    let isActive = false;
    let isCompleted = false;

    switch (stageName) {
      case 'Germinacion':
        startDate = plant.birthDate;
        endDate = plant.inicioVegetativo;
        isActive = plant.etapa === 'Germinacion';
        isCompleted = !!plant.inicioVegetativo;
        break;
      case 'Vegetativo':
        startDate = plant.inicioVegetativo;
        endDate = plant.inicioFloracion;
        isActive = plant.etapa === 'Vegetativo';
        isCompleted = !!plant.inicioFloracion;
        break;
      case 'Floracion':
        startDate = plant.inicioFloracion;
        endDate = plant.finishDate;
        isActive = plant.etapa === 'Floracion';
        isCompleted = !!plant.finishDate;
        break;
      case 'Secado':
        startDate = plant.finishDate;
        endDate = plant.finalSecado;
        isActive = plant.etapa === 'Secado';
        isCompleted = !!plant.finalSecado;
        break;
      case 'Enfrascado':
        startDate = plant.finalSecado || plant.inicioEnfrascado;
        endDate = null; // Etapa final
        isActive = plant.etapa === 'Enfrascado';
        isCompleted = plant.etapa === 'Enfrascado';
        break;
    }

    if (startDate) {
      duration = calculateDaysInStage(stageName);
    }

    return {
      startDate,
      endDate,
      duration,
      isActive,
      isCompleted,
      hasStarted: !!startDate
    };
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
    } else {
      // Si ya está en Enfrascado o cualquier otra etapa, no hacer nada
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
        
        // Si la nueva etapa es Enfrascado, mover automáticamente al archivo
        if (newStage === 'Enfrascado') {
          // Mostrar mensaje de éxito primero
          Swal.fire({
            icon: 'success',
            title: `Planta enfrascada`,
            text: `La planta ha completado su ciclo y será movida al archivo`,
            confirmButtonColor: theme.palette.primary.main,
            timer: 2000,
            timerProgressBar: true
          }).then(() => {
            // Después del mensaje, mover al archivo
            moveToHistory();
          });
        } else {
          // Para otras etapas, mostrar mensaje normal
          Swal.fire({
            icon: 'success',
            title: `Etapa actualizada a ${newStage}`,
            text: `La planta ha avanzado a la etapa de ${newStage}`,
            confirmButtonColor: theme.palette.primary.main,
            timer: 2000,
            timerProgressBar: true
          });
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

  // Estilos globales para las animaciones y línea de tiempo
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
          },

        }}
      />
    );
  };



  // Early return if plant is not loaded yet
  if (!plant) {
    return (
      <Layout title="Cargando...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="text.secondary">
            Cargando datos de la planta...
          </Typography>
        </Box>
      </Layout>
    );
  }

  // Función para guardar peso húmedo
  const handleSavePesoHumedo = async () => {
    if (!pesoHumedoInput || parseFloat(pesoHumedoInput) <= 0) return;
    
    setSavingPesoHumedo(true);
    try {
      const plantId = checkSearch(location.search);
      const dbPath = plant.isArchived 
        ? `${auth.currentUser.uid}/plants/history/${plantId}`
        : `${auth.currentUser.uid}/plants/active/${plantId}`;
      
      await database.ref(dbPath).update({
        pesoHumedo: parseFloat(pesoHumedoInput)
      });
      
      setPlant(prev => ({
        ...prev,
        pesoHumedo: parseFloat(pesoHumedoInput)
      }));
      
      setPesoHumedoInput('');
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Peso húmedo guardado',
        text: `Se ha registrado ${pesoHumedoInput}g como peso húmedo`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error al guardar peso húmedo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el peso húmedo. Inténtalo nuevamente.',
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setSavingPesoHumedo(false);
    }
  };

  // Función para guardar peso seco
  const handleSavePesoSeco = async () => {
    if (!pesoSecoInput || parseFloat(pesoSecoInput) <= 0) return;
    
    setSavingPesoSeco(true);
    try {
      const plantId = checkSearch(location.search);
      const dbPath = plant.isArchived 
        ? `${auth.currentUser.uid}/plants/history/${plantId}`
        : `${auth.currentUser.uid}/plants/active/${plantId}`;
      
      await database.ref(dbPath).update({
        pesoSeco: parseFloat(pesoSecoInput)
      });
      
      setPlant(prev => ({
        ...prev,
        pesoSeco: parseFloat(pesoSecoInput)
      }));
      
      setPesoSecoInput('');
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Peso seco guardado',
        text: `Se ha registrado ${pesoSecoInput}g como peso seco final`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error al guardar peso seco:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el peso seco. Inténtalo nuevamente.',
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setSavingPesoSeco(false);
    }
  };

  return (
    <Layout title={plant?.name || "Planta"}>
      <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Estilos globales para animaciones */}
        <GlobalStyles />
        
        {/* Alerta para plantas archivadas */}
        {plant.isArchived && (
          <Alert 
            severity="info" 
            icon={<HistoryIcon />}
            sx={{ 
              mt: 3,
              mb: 3, 
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="body1">
                Esta planta se encuentra archivada. Solo se pueden registrar los pesos húmedo y seco.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Header principal con foto de perfil como fondo */}
        <Card 
          elevation={4} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            mb: 4,
            mt: plant.isArchived ? 0 : 3,
            position: 'relative',
            minHeight: '180px',
            background: plant.profilePhotoUrl 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.85)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%), url(${plant.profilePhotoUrl})`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            color: '#ffffff'
          }}
        >
          {/* Overlay adicional para mejor legibilidad */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`,
            backdropFilter: 'blur(1px)'
          }} />
          
          {/* Botón para cambiar foto de perfil */}
          <IconButton
            onClick={() => setShowProfilePhotoSelector(true)}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
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
            <PhotoCameraIcon sx={{ fontSize: '1.4rem' }} />
          </IconButton>
          
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, minHeight: '180px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
              {/* Información principal en una sola línea */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 1, md: 2 }
              }}>
                                 {/* Nombre y etapa */}
                 <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 2.5 } }}>
                   <Typography 
                     variant="h3" 
                     sx={{ 
                       fontWeight: 'bold',
                       textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                       fontSize: { xs: '2.2rem', md: '2.8rem' },
                       lineHeight: 1.1
                     }}
                   >
                     {plant.name}
                   </Typography>
                   
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center',
                     bgcolor: alpha('#ffffff', 0.2),
                     px: 2,
                     py: 0.8,
                     borderRadius: 3,
                     backdropFilter: 'blur(8px)',
                     border: `1px solid ${alpha('#ffffff', 0.3)}`
                   }}>
                     {etapaIcon}
                     <Typography 
                       variant="h6" 
                       sx={{ 
                         ml: 0.8, 
                         fontWeight: 'medium',
                         textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                         fontSize: '1.1rem'
                       }}
                     >
                       {plant.etapa || 'No especificada'}
                     </Typography>
                   </Box>
                 </Box>
                
                                 {/* Datos principales compactos */}
                 <Box sx={{ 
                   display: 'flex', 
                   flexDirection: { xs: 'column', sm: 'row' },
                   gap: { xs: 1, sm: 3 },
                   alignItems: { xs: 'flex-start', sm: 'center' }
                 }}>
                   {/* Genética */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                     <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                       Genética:
                     </Typography>
                     <Typography variant="body1" sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                       {plant.genetic || 'No especificada'}
                     </Typography>
                   </Box>
                   
                   {/* Separador */}
                   <Box sx={{ 
                     width: '1px', 
                     height: '20px', 
                     bgcolor: alpha('#ffffff', 0.4),
                     display: { xs: 'none', sm: 'block' }
                   }} />
                   
                   {/* Maceta */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                     <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                       Maceta:
                     </Typography>
                     <Typography variant="body1" sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                       {plant.potVolume ? `${plant.potVolume}L` : 'No especificado'}
                     </Typography>
                   </Box>
                   
                   {!plant.isArchived && (
                     <>
                       {/* Separador */}
                       <Box sx={{ 
                         width: '1px', 
                         height: '20px', 
                         bgcolor: alpha('#ffffff', 0.4),
                         display: { xs: 'none', sm: 'block' }
                       }} />
                       
                       {/* Días de vida */}
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                         <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                           Días:
                         </Typography>
                         <Typography variant="body1" sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                           {calculateLifeDays() || 'N/A'}
                         </Typography>
                       </Box>
                     </>
                   )}
                   
                   {/* Separador */}
                   <Box sx={{ 
                     width: '1px', 
                     height: '20px', 
                     bgcolor: alpha('#ffffff', 0.4),
                     display: { xs: 'none', sm: 'block' }
                   }} />
                   
                   {/* Fecha de nacimiento */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                     <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                       Nacimiento:
                     </Typography>
                     <Typography variant="body1" sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                       {plant.birthDate ? format(new Date(plant.birthDate.split('/').reverse().join('-')), 'dd/MM/yy') : 'N/A'}
                     </Typography>
                   </Box>
                 </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sección de estadísticas y datos detallados */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Panel de etapa de crecimiento - ahora ocupa todo el ancho */}
          <Grid item xs={12}>
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
                  
                  
                  
                  {/* Sección detallada de etapas */}
                  <Box sx={{ px: 2, py: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    {/* Etapas principales en grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {['Germinacion', 'Vegetativo', 'Floracion'].map((stageName) => {
                        const stageInfo = getStageInfo(stageName);
                        const stageColor = stageInfo.isActive 
                          ? theme.palette.secondary.main 
                          : stageInfo.isCompleted 
                            ? theme.palette.success.main 
                            : theme.palette.grey[400];
                        
                        return (
                          <Grid item xs={12} sm={4} key={stageName}>
                            <Paper 
                              elevation={stageInfo.isActive ? 3 : 1}
                              sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: alpha(stageColor, stageInfo.isActive ? 0.1 : 0.03),
                                borderLeft: stageInfo.isActive ? `4px solid ${stageColor}` : 'none',
                                border: stageInfo.isCompleted && !stageInfo.isActive ? `1px solid ${alpha(theme.palette.success.main, 0.3)}` : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  mb: 1.5, 
                                  color: stageColor,
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 0.5
                                }}
                              >
                                {stageName === 'Germinacion' && <SpaIcon fontSize="small" />}
                                {stageName === 'Vegetativo' && <GrassIcon fontSize="small" />}
                                {stageName === 'Floracion' && <LocalFloristIcon fontSize="small" />}
                                {stageName}
                              </Typography>
                              
                              {/* Fecha de inicio */}
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                  Inicio
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.primary" 
                                  fontWeight={stageInfo.hasStarted ? 'medium' : 'normal'}
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {stageInfo.startDate ? format(new Date(stageInfo.startDate.split('/').reverse().join('-')), 'dd/MM/yyyy') : 'No iniciada'}
                                </Typography>
                              </Box>

                              {/* Duración */}
                              {stageInfo.duration && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                    Duración
                                  </Typography>
                                  <Typography variant="body2" color={stageColor} fontWeight="bold">
                                    {stageInfo.duration} días
                                  </Typography>
                                </Box>
                              )}

                              {/* Fecha de finalización */}
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                  Finalización
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color={stageInfo.endDate ? "text.primary" : "text.secondary"}
                                  fontWeight={stageInfo.endDate ? 'medium' : 'normal'}
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {stageInfo.endDate 
                                    ? format(new Date(stageInfo.endDate.split('/').reverse().join('-')), 'dd/MM/yyyy')
                                    : stageInfo.isActive 
                                      ? 'En curso' 
                                      : 'Pendiente'
                                  }
                                </Typography>
                              </Box>

                              {/* Indicador de estado */}
                              {stageInfo.isActive && (
                                <Chip 
                                  label="Activa" 
                                  size="small" 
                                  sx={{ 
                                    mt: 1, 
                                    bgcolor: stageColor, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }} 
                                />
                              )}
                              {stageInfo.isCompleted && !stageInfo.isActive && (
                                <Chip 
                                  label="Completada" 
                                  size="small" 
                                  sx={{ 
                                    mt: 1, 
                                    bgcolor: theme.palette.success.main, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }} 
                                />
                              )}
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                  
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
                  
                  {!plant.isArchived && plant.etapa !== 'Enfrascado' ? (
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
                        
                        {/* Botón para cambiar etapa - Solo mostrar si no está en Enfrascado */}
                        {plant.etapa !== 'Enfrascado' && (
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
                            {plant.etapa === 'Floracion' ? 'Cosechar' : 
                             plant.etapa === 'Germinacion' ? 'Cambiar a Vegetativo' :
                             plant.etapa === 'Vegetativo' ? 'Cambiar a Floración' :
                             plant.etapa === 'Secado' ? 'Cambiar a Enfrascado' :
                             'Cambiar etapa'}
                          </Button>
                        )}
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
        {!plant.isArchived && plant.etapa !== 'Secado' && plant.etapa !== 'Enfrascado' && (
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

        {/* Estadísticas de acciones - Tarjetas individuales */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {getActionCounts().map((stat, index) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Card 
                elevation={3}
                onClick={stat.isWeight ? undefined : () => setTabValue(stat.tabIndex)}
                sx={{ 
                  borderRadius: 3,
                  cursor: stat.isWeight ? 'default' : 'pointer',
                  overflow: 'hidden',
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: stat.isWeight ? 'none' : 'translateY(-4px)',
                    boxShadow: `0 6px 15px ${alpha(stat.color, 0.15)}`,
                  },
                  ...(highlightedTab === stat.tabIndex && !stat.isWeight && {
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
                  {stat.isWeight ? (
                    stat.hasInput ? (
                      // Mostrar input y botón cuando no se ha registrado el peso
                      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          placeholder="Peso en gramos"
                          value={stat.inputValue}
                          onChange={(e) => stat.setInputValue(e.target.value)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">g</InputAdornment>,
                            inputProps: { min: 0, step: 0.1 }
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderColor: alpha(stat.color, 0.3),
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(stat.color, 0.5)
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: stat.color
                              }
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={stat.onSave}
                          disabled={!stat.inputValue || parseFloat(stat.inputValue) <= 0 || stat.saving}
                          startIcon={stat.saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                          sx={{
                            bgcolor: stat.color,
                            '&:hover': {
                              bgcolor: alpha(stat.color, 0.8)
                            },
                            '&:disabled': {
                              bgcolor: alpha(stat.color, 0.3)
                            }
                          }}
                        >
                          {stat.saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </Box>
                    ) : (
                      // Mostrar valor guardado
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.weightType === 'humedo' ? 'cosecha' : 'final'}
                        </Typography>
                      </>
                    )
                  ) : (
                    <>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        registros
                      </Typography>
                    </>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sección de Calendario */}
        <Paper 
          id="plant-calendar"
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
            position: 'relative',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            overflow: 'hidden'
          }}>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', lg: 'center' },
              p: 3,
              position: 'relative',
              zIndex: 1,
              gap: { xs: 2, lg: 3 }
            }}>
              {/* Información del calendario */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 3 },
                width: { xs: '100%', lg: 'auto' }
              }}>
                {/* Título e ícono */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: alpha('#ffffff', 0.2), 
                    color: '#ffffff',
                    width: 48,
                    height: 48
                  }}>
                    <CalendarMonthIcon sx={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        lineHeight: 1.2
                      }}
                    >
                      Historial de actividades
                    </Typography>
                  </Box>
                </Box>
                
                {/* Fecha actual */}
                <Box sx={{ 
                  bgcolor: alpha('#ffffff', 0.15),
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  minWidth: { sm: '200px' }
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      textAlign: { xs: 'left', sm: 'center' }
                    }}
                  >
                    {formatMonthDisplay(currentDate)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Controles de navegación */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', lg: 'flex-end' },
                alignItems: 'center',
                gap: 2
              }}>
                {/* Botón para ir a línea de tiempo */}
                <Button
                  variant="contained"
                  component={Link}
                  to={`/LineaTiempo/?${checkSearch(location.search)}`}
                  startIcon={<TimelineIcon />}
                  sx={{
                    bgcolor: alpha('#ffffff', 0.9),
                    color: theme.palette.primary.main,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    '&:hover': {
                      bgcolor: '#ffffff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Ir a línea de tiempo
                </Button>
                
                {/* Botones de navegación */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5,
                  bgcolor: alpha('#ffffff', 0.15),
                  borderRadius: 3,
                  p: 0.5,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`
                }}>
                  <Tooltip title="Mes anterior" arrow>
                    <IconButton 
                      size="medium" 
                      onClick={() => handleNavigate('PREV')}
                      sx={{ 
                        color: '#ffffff', 
                        bgcolor: 'transparent',
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        '&:hover': { 
                          bgcolor: alpha('#ffffff', 0.2),
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Ir a hoy" arrow>
                    <IconButton 
                      size="medium"
                      onClick={() => handleNavigate('TODAY')}
                      sx={{ 
                        color: '#ffffff', 
                        bgcolor: alpha('#ffffff', 0.1),
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        '&:hover': { 
                          bgcolor: alpha('#ffffff', 0.25),
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <TodayIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Mes siguiente" arrow>
                    <IconButton 
                      size="medium"
                      onClick={() => handleNavigate('NEXT')}
                      sx={{ 
                        color: '#ffffff', 
                        bgcolor: 'transparent',
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        '&:hover': { 
                          bgcolor: alpha('#ffffff', 0.2),
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
          

          
          <Box sx={{ p: 0, position: 'relative', height: calendarHeight }}>
            <Calendar
              localizer={localizer}
              events={events}
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
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedEvent && (
          <>
            {/* Header del modal */}
            <Box sx={{ 
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${selectedEvent.color} 0%, ${alpha(selectedEvent.color, 0.8)} 100%)`,
                color: '#ffffff',
                boxShadow: `0 8px 32px ${alpha(selectedEvent.color, 0.4)}`,
                position: 'relative'
              }}>
                {/* Patrón de fondo decorativo */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), 
                                   radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }} />
                
                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha('#ffffff', 0.25), 
                      color: '#ffffff',
                      width: 64,
                      height: 64,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      border: `3px solid ${alpha('#ffffff', 0.3)}`
                    }}
                  >
                    {selectedEvent.icon === 'water' && <WaterDropIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.icon === 'bug' && <BugReportIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.icon === 'cut' && <ContentCutIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.icon === 'swap' && <SwapHorizIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.icon === 'photo' && <PhotoCameraIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.icon === 'note' && <NoteAltIcon sx={{ fontSize: 32 }} />}
                    {selectedEvent.resourceType === 'Etapa' && (
                      <>
                        {selectedEvent.stageType === 'Germinacion' && <SpaIcon sx={{ fontSize: 32 }} />}
                        {selectedEvent.stageType === 'Vegetativo' && <GrassIcon sx={{ fontSize: 32 }} />}
                        {selectedEvent.stageType === 'Floracion' && <LocalFloristIcon sx={{ fontSize: 32 }} />}
                      </>
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold', 
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      mb: 0.5
                    }}>
                      {selectedEvent.resourceType}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: alpha('#ffffff', 0.95),
                      fontWeight: 'medium',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      {convertToDetailedDate(selectedEvent.details.date)}
                    </Typography>
                  </Box>
                </Stack>
                
                <IconButton
                  onClick={() => setOpenCalendarModal(false)}
                  size="large"
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#ffffff', 0.15),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.25),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Línea decorativa */}
              <Box sx={{
                height: 4,
                background: `linear-gradient(90deg, 
                  ${alpha(selectedEvent.color, 0.8)} 0%, 
                  ${selectedEvent.color} 50%, 
                  ${alpha(selectedEvent.color, 0.8)} 100%)`
              }} />
            </Box>
            
            {/* Contenido del modal */}
            <DialogContent 
              sx={{ 
                p: 0,
                bgcolor: theme.palette.background.default,
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(selectedEvent.color, 0.3),
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha(selectedEvent.color, 0.5)
                  }
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(selectedEvent.color, 0.05)
                }
              }}
            >
              <Box sx={{ p: 4 }}>
                <EventDetails event={selectedEvent} />
              </Box>
            </DialogContent>
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
              : plant.etapa === 'Germinacion' 
                ? 'Cambiar a Vegetativo'
                : plant.etapa === 'Vegetativo'
                  ? 'Cambiar a Floración'
                  : plant.etapa === 'Secado'
                    ? 'Cambiar a Enfrascado'
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
              : plant.etapa === 'Secado'
                ? 'Información sobre el secado'
                : 'Información sobre el cambio de etapa'}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {plant.etapa === 'Floracion' 
              ? 'Estás a punto de cosechar tu planta. El sistema guardará la fecha actual como inicio del secado y fin del ciclo de floración.' 
              : plant.etapa === 'Secado'
                ? 'Estás a punto de finalizar el secado y pasar a enfrascado. La planta será movida automáticamente al archivo histórico.'
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
                La planta pasará a <strong>Enfrascado</strong> y será movida automáticamente al archivo histórico.
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
            <>{plant.etapa === 'Floracion' ? 'Cosechar Planta' : 
              plant.etapa === 'Germinacion' ? 'Cambiar a Vegetativo' :
              plant.etapa === 'Vegetativo' ? 'Cambiar a Floración' :
              plant.etapa === 'Secado' ? 'Cambiar a Enfrascado' :
              'Confirmar cambio'}</>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  </Layout>
  );
};

export default Plant;