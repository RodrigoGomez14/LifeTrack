import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Chip, 
  Stack, 
  Divider, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Avatar,
  Tab,
  Tabs,
  useMediaQuery,
  Fab,
  Hidden,
  alpha,
  FormControlLabel
} from '@mui/material';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '../../store';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { checkSearch, convertToDetailedDate } from '../../utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TodayIcon from '@mui/icons-material/Today';
import CloseIcon from '@mui/icons-material/Close';
import OpacityIcon from '@mui/icons-material/Opacity';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ForestIcon from '@mui/icons-material/Forest';
import EventIcon from '@mui/icons-material/Event';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useTheme } from '@mui/material/styles';

moment.locale('es');
const localizer = momentLocalizer(moment);

const PlantCalendar = () => {
  const { userData } = useStore();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const plantId = checkSearch(location.search);
  const [plant, setPlant] = useState(null);
  const [events, setEvents] = useState([]);
  const [calendarView, setCalendarView] = useState(isMobile ? 'day' : 'month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [openDayDialog, setOpenDayDialog] = useState(false);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [filters, setFilters] = useState({
    riegos: true,
    insecticidas: true,
    podas: true,
    transplantes: true,
    fotos: true
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateHasEvents, setDateHasEvents] = useState({});
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  useEffect(() => {
    if (userData?.plants?.active && userData.plants.active[plantId]) {
      setPlant(userData.plants.active[plantId]);
    }
  }, [userData, plantId]);

  useEffect(() => {
    if (plant) {
      generateEvents();
    }
  }, [plant, filters]);

  useEffect(() => {
    // Genera un mapa de fechas que tienen eventos
    if (events.length > 0) {
      const eventDates = {};
      events.forEach(event => {
        const dateStr = moment(event.start).format('YYYY-MM-DD');
        if (!eventDates[dateStr]) {
          eventDates[dateStr] = [];
        }
        eventDates[dateStr].push(event);
      });
      setDateHasEvents(eventDates);
    }
  }, [events]);

  const generateEvents = () => {
    if (!plant) return;
    
    const newEvents = [];
    
    // Agregar riegos
    if (filters.riegos && plant.irrigations) {
      Object.keys(plant.irrigations).forEach(key => {
        const irrigation = plant.irrigations[key];
        const dateArray = irrigation.date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `riego_${key}`,
          title: 'Riego',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.info.main,
          icon: 'water',
          details: irrigation,
          resourceType: 'Riego'
        });
      });
    }
    
    // Agregar insecticidas
    if (filters.insecticidas && plant.insecticides) {
      Object.keys(plant.insecticides).forEach(key => {
        const insecticide = plant.insecticides[key];
        const dateArray = insecticide.date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `insecticida_${key}`,
          title: 'Insecticida',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.error.main,
          icon: 'bug',
          details: insecticide,
          resourceType: 'Insecticida'
        });
      });
    }
    
    // Agregar podas
    if (filters.podas && plant.prunings) {
      Object.keys(plant.prunings).forEach(key => {
        const pruning = plant.prunings[key];
        const dateArray = pruning.date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `poda_${key}`,
          title: 'Poda',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.success.main,
          icon: 'cut',
          details: pruning,
          resourceType: 'Poda'
        });
      });
    }
    
    // Agregar transplantes
    if (filters.transplantes && plant.transplants) {
      Object.keys(plant.transplants).forEach(key => {
        const transplant = plant.transplants[key];
        const dateArray = transplant.date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `transplante_${key}`,
          title: 'Transplante',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.warning.main,
          icon: 'swap',
          details: transplant,
          resourceType: 'Transplante'
        });
      });
    }
    
    // Agregar fotos
    if (filters.fotos && plant.images) {
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
          imageUrl: image.url,
          specificDate: formattedDate
        });
      });
    }
    
    setEvents(newEvents);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpenEventDialog(true);
  };

  const handleSelectSlot = ({ start }) => {
    // Verificar si el día seleccionado tiene eventos
    const dateStr = moment(start).format('YYYY-MM-DD');
    
    // Filtrar eventos para este día específico
    const dayEvents = events.filter(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      return eventDate === dateStr;
    });
    
    if (dayEvents.length > 0) {
      setSelectedDate(start);
      setSelectedDayEvents(dayEvents);
      setOpenDayDialog(true);
    }
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const handleNavigate = (action) => {
    const date = new Date(currentDate);
    
    switch (action) {
      case 'PREV':
        if (calendarView === 'month') {
          date.setMonth(date.getMonth() - 1);
        } else if (calendarView === 'week') {
          date.setDate(date.getDate() - 7);
        } else {
          date.setDate(date.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (calendarView === 'month') {
          date.setMonth(date.getMonth() + 1);
        } else if (calendarView === 'week') {
          date.setDate(date.getDate() + 7);
        } else {
          date.setDate(date.getDate() + 1);
        }
        break;
      case 'TODAY':
        setCurrentDate(new Date());
        return;
      default:
        break;
    }
    
    setCurrentDate(date);
  };

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '8px',
        opacity: 0.9,
        color: '#fff',
        border: '0px',
        display: 'block',
        padding: '3px',
        fontWeight: 'bold',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
        cursor: 'pointer'
      }
    };
  };

  const CustomEvent = ({ event }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 0.5, 
      fontSize: '0.85rem',
      p: 0.5,
      width: '100%',
      height: '100%'
    }}>
      {event.icon === 'water' && <OpacityIcon fontSize="small" />}
      {event.icon === 'bug' && <BugReportIcon fontSize="small" />}
      {event.icon === 'cut' && <ContentCutIcon fontSize="small" />}
      {event.icon === 'swap' && <SwapHorizIcon fontSize="small" />}
      {event.icon === 'photo' && <PhotoCameraIcon fontSize="small" />}
      <span>{event.title}</span>
    </Box>
  );
  
  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() - 1);
      toolbar.onNavigate('prev');
    };

    const goToNext = () => {
      toolbar.date.setMonth(toolbar.date.getMonth() + 1);
      toolbar.onNavigate('next');
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.date.setMonth(now.getMonth());
      toolbar.date.setYear(now.getFullYear());
      toolbar.onNavigate('current');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          {date.format('MMMM YYYY')}
        </Typography>
      );
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={goToBack}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ mx: 2 }}>
            {label()}
          </Box>
          <IconButton onClick={goToNext}>
            <ChevronRightIcon />
          </IconButton>
          <IconButton onClick={goToCurrent} sx={{ ml: 1 }}>
            <TodayIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={calendarView === 'day' ? 'contained' : 'outlined'}
            onClick={() => toolbar.onView('day')}
            startIcon={<ViewDayIcon />}
          >
            Día
          </Button>
          <Button
            size="small"
            variant={calendarView === 'week' ? 'contained' : 'outlined'}
            onClick={() => toolbar.onView('week')}
            startIcon={<ViewWeekIcon />}
          >
            Semana
          </Button>
          <Button
            size="small"
            variant={calendarView === 'month' ? 'contained' : 'outlined'}
            onClick={() => toolbar.onView('month')}
            startIcon={<CalendarMonthIcon />}
          >
            Mes
          </Button>
        </Box>
      </Box>
    );
  };

  const CustomDayPropGetter = (date) => {
    // Verificar si la fecha tiene eventos
    const dateStr = moment(date).format('YYYY-MM-DD');
    const hasEvents = dateHasEvents[dateStr] && dateHasEvents[dateStr].length > 0;
    
    const isToday = moment(date).isSame(moment(), 'day');
    
    return {
      style: {
        backgroundColor: isToday ? alpha(theme.palette.primary.main, 0.1) : 'inherit',
        border: hasEvents ? `2px solid ${theme.palette.secondary.main}` : 'none',
        borderRadius: hasEvents ? '8px' : '0px',
        cursor: hasEvents ? 'pointer' : 'default'
      }
    };
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
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
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
              <Box sx={{ mt: 2, mb: 2 }}>
                <img 
                  src={event.imageUrl} 
                  alt="Imagen de planta" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px'
                  }} 
                />
              </Box>
            </Box>
          );
        default:
          return null;
      }
    };
    
    return (
      <Card elevation={0} sx={{ overflow: 'visible' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: event.color }}>
            {event.icon === 'water' && <OpacityIcon />}
            {event.icon === 'bug' && <BugReportIcon />}
            {event.icon === 'cut' && <ContentCutIcon />}
            {event.icon === 'swap' && <SwapHorizIcon />}
            {event.icon === 'photo' && <PhotoCameraIcon />}
          </Avatar>
          <Typography variant="h6">{event.title}</Typography>
        </Box>
        <Divider />
        <CardContent>
          {getEventDetails()}
        </CardContent>
      </Card>
    );
  };
  
  const EventCard = ({ event, onClick }) => (
    <Card 
      elevation={1} 
      sx={{ 
        mb: 1,
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        }
      }}
      onClick={() => onClick(event)}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: event.color,
              fontSize: '0.9rem'
            }}
          >
            {event.icon === 'water' && <OpacityIcon fontSize="small" />}
            {event.icon === 'bug' && <BugReportIcon fontSize="small" />}
            {event.icon === 'cut' && <ContentCutIcon fontSize="small" />}
            {event.icon === 'swap' && <SwapHorizIcon fontSize="small" />}
            {event.icon === 'photo' && <PhotoCameraIcon fontSize="small" />}
          </Avatar>
          <Typography variant="body1">
            {event.title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (!plant) {
    return (
      <Layout title="Calendario de Planta">
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <ForestIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Planta no encontrada
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/Plantas"
          >
            Volver a la lista
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={plant ? `Calendario: ${plant.name}` : "Calendario de Plantas"}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05)
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {plant && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={Link}
                to={`/Planta/?${plantId}`}
                sx={{ mr: 2 }}
                size="small"
              >
                Volver a la planta
              </Button>
            )}
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthIcon sx={{ mr: 1 }} />
              {plant ? `Calendario: ${plant.name}` : "Calendario de Plantas"}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterAltIcon />}
              onClick={() => setOpenFilterDialog(true)}
              size="small"
            >
              Filtros
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ height: 'calc(100vh - 200px)', p: 0 }}>
          <Calendar
            localizer={localizer}
            events={events}
            views={['month', 'week', 'day']}
            view={calendarView}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            dayPropGetter={CustomDayPropGetter}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar
            }}
            popup
            messages={{
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              month: 'Mes',
              week: 'Semana', 
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              allDay: 'Todo el día',
              noEventsInRange: 'No hay eventos en este período',
              showMore: (total) => `+ Ver ${total} más`,
            }}
          />
        </Box>
      </Paper>
      
      {/* Diálogo para mostrar eventos de un día específico */}
      <Dialog
        open={openDayDialog}
        onClose={() => setOpenDayDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {selectedDate && convertToDetailedDate(moment(selectedDate).format('DD/MM/YYYY'))}
            </Typography>
            <IconButton onClick={() => setOpenDayDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {selectedDayEvents.map((event, index) => (
              <Card 
                key={event.id} 
                sx={{ 
                  overflow: 'visible', 
                  borderLeft: `4px solid ${event.color}`,
                  boxShadow: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                onClick={() => {
                  setSelectedEvent(event);
                  setOpenDayDialog(false);
                  setOpenEventDialog(true);
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: event.color, mr: 2 }}>
                      {event.icon === 'water' && <OpacityIcon />}
                      {event.icon === 'bug' && <BugReportIcon />}
                      {event.icon === 'cut' && <ContentCutIcon />}
                      {event.icon === 'swap' && <SwapHorizIcon />}
                      {event.icon === 'photo' && <PhotoCameraIcon />}
                    </Avatar>
                    <Typography variant="h6">{event.title}</Typography>
                  </Box>
                  
                  {event.resourceType === 'Riego' && (
                    <Typography variant="body2">
                      Cantidad: {event.details.quantity} ml
                    </Typography>
                  )}
                  
                  {event.resourceType === 'Insecticida' && (
                    <Typography variant="body2">
                      Producto: {event.details.product}
                    </Typography>
                  )}
                  
                  {event.resourceType === 'Poda' && (
                    <Typography variant="body2">
                      Tipo: {event.details.type}
                    </Typography>
                  )}
                  
                  {event.resourceType === 'Transplante' && (
                    <Typography variant="body2">
                      Nueva maceta: {event.details.newPot}L
                    </Typography>
                  )}
                  
                  {event.resourceType === 'Foto' && (
                    <Box sx={{ mt: 1, position: 'relative', height: 100, borderRadius: 1, overflow: 'hidden' }}>
                      <img 
                        src={event.imageUrl} 
                        alt="Imagen de planta"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: 4
                        }} 
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para mostrar detalles de un evento */}
      <Dialog
        open={openEventDialog}
        onClose={() => setOpenEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
          <IconButton
            aria-label="close"
            onClick={() => setOpenEventDialog(false)}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, mt: 3 }}>
          <EventDetails event={selectedEvent} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PlantCalendar; 