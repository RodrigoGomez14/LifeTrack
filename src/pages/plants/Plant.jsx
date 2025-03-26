import React, { useEffect, useState } from "react";
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
  alpha
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
import { useTheme } from '@mui/material/styles';
import ImageUploader from "../../components/plants/ImageUploader";

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
  const [calendarView, setCalendarView] = useState(isMobile ? 'day' : 'week');
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

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
          
          newEvents.push({
            id: `${action.type}_${key}`,
            title: action.type,
            start: new Date(formattedDate),
            end: new Date(formattedDate),
            allDay: true,
            color: action.color,
            icon: action.icon,
            details: action.data[key],
            resourceType: action.type
          });
        });
      }
    });

    // Agregar fotos al calendario
    if (plant.images) {
      Object.keys(plant.images).forEach(key => {
        const dateArray = plant.images[key].date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        
        newEvents.push({
          id: `foto_${key}`,
          title: 'Foto',
          start: new Date(formattedDate),
          end: new Date(formattedDate),
          allDay: true,
          color: theme.palette.secondary.main,
          icon: 'photo',
          details: plant.images[key],
          resourceType: 'Foto',
          imageUrl: plant.images[key].url
        });
      });
    }

    setEvents(newEvents);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenCalendarModal(true);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: 0.8,
        color: '#fff',
        border: '0px',
        display: 'block',
        cursor: 'pointer'
      }
    };
  };

  const CustomEvent = ({ event }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5, 
      fontSize: '0.85rem',
      p: 0.5
    }}>
      {event.icon === 'water' && <OpacityIcon fontSize="small" />}
      {event.icon === 'bug' && <BugReportIcon fontSize="small" />}
      {event.icon === 'cut' && <ContentCutIcon fontSize="small" />}
      {event.icon === 'swap' && <SwapHorizIcon fontSize="small" />}
      {event.icon === 'photo' && <PhotoCameraIcon fontSize="small" />}
      <span>{event.title}</span>
    </Box>
  );

  const actions = [
    { icon: <OpacityIcon />, name: 'Nuevo Riego', url: `/NuevoRiego/?${checkSearch(location.search)}`, color: theme.palette.info.main },
    { icon: <BugReportIcon />, name: 'Nuevo Insecticida', url: `/NuevoInsecticida/?${checkSearch(location.search)}`, color: theme.palette.error.main },
    { icon: <ContentCutIcon />, name: 'Nueva Poda', url: `/NuevaPoda/?${checkSearch(location.search)}`, color: theme.palette.success.main },
    { icon: <SwapHorizIcon />, name: 'Nuevo Transplante', url: `/NuevoTransplante/?${checkSearch(location.search)}`, color: theme.palette.warning.main },
  ];

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

  const refreshPlantData = () => {
    const id = checkSearch(location.search);
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({...userData.plants.active[id]});
      generateEvents();
    }
  };

  if (!plant) {
    return (
      <Layout title="Planta no encontrada">
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
    <Layout title={plant.name}>
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" gutterBottom>
              {plant.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                icon={<ForestIcon />}
                label={`${plant.quantity} unidades`} 
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              />
              {plant.potVolume && (
                <Chip 
                  label={`${plant.potVolume}L de sustrato`} 
                  sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                />
              )}
            </Stack>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EventIcon />}
            onClick={() => setCalendarView(calendarView === 'month' ? 'week' : 'month')}
          >
            {calendarView === 'month' ? 'Vista Semanal' : 'Vista Mensual'}
          </Button>
        </Stack>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05)
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 1 }} />
            Calendario de actividades
          </Typography>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
            component={Link}
            to={`/PlantaCalendario/?${checkSearch(location.search)}`}
          >
            Ver completo
          </Button>
        </Box>
        <Box sx={{ p: 0, position: 'relative', height: 400 }}>
          <Calendar
            localizer={localizer}
            events={events}
            views={['month', 'week', 'day']}
            defaultView={calendarView}
            view={calendarView}
            onView={(view) => setCalendarView(view)}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleEventClick}
            components={{
              event: CustomEvent
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
            }}
          />
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="plant actions tabs" variant="scrollable" scrollButtons="auto">
                <Tab label="Riegos" icon={<OpacityIcon />} iconPosition="start" />
                <Tab label="Insecticidas" icon={<BugReportIcon />} iconPosition="start" />
                <Tab label="Podas" icon={<ContentCutIcon />} iconPosition="start" />
                <Tab label="Transplantes" icon={<SwapHorizIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" sx={{ p: 2 }}>
              <ActionsTabsList data={plant.irrigations} type='riegos'/>
            </Box>
            <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" sx={{ p: 2 }}>
              <ActionsTabsList data={plant.insecticides} type='insecticidas'/>
            </Box>
            <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2" sx={{ p: 2 }}>
              <ActionsTabsList data={plant.prunings} type='podas'/>
            </Box>
            <Box role="tabpanel" hidden={tabValue !== 3} id="tabpanel-3" sx={{ p: 2 }}>
              <ActionsTabsList data={plant.transplants} type='transplantes'/>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Fotos
                </Typography>
                <ImageUploader 
                  plantId={checkSearch(location.search)} 
                  onUploadComplete={refreshPlantData}
                />
              </Box>

              {plant.images ? (
                <ImageList variant="masonry" cols={isMobile ? 2 : 1} gap={8}>
                  {Object.keys(plant.images).map(img => (
                    <ImageListItem 
                      key={img} 
                      onClick={() => handleImageClick(plant.images[img])}
                      sx={{ cursor: 'pointer' }}
                    >
                      <img
                        src={plant.images[img].url}
                        alt={`Imagen ${img}`}
                        loading="lazy"
                        style={{ borderRadius: 8 }}
                      />
                      <ImageListItemBar
                        title={convertToDetailedDate(plant.images[img].date).split(' ').slice(0, 3).join(' ')}
                        sx={{ 
                          borderBottomLeftRadius: 8,
                          borderBottomRightRadius: 8,
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 4, 
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`
                }}>
                  <PhotoCameraIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.2), mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay fotos aún
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para detalles del evento del calendario */}
      <Dialog 
        open={openCalendarModal} 
        onClose={() => setOpenCalendarModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconButton
            aria-label="close"
            onClick={() => setOpenCalendarModal(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <EventDetails event={selectedEvent} />
        </DialogContent>
      </Dialog>
      
      {/* Modal para vista ampliada de imagen */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        aria-labelledby="image-modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box sx={{ 
          position: 'relative', 
          maxWidth: '90vw', 
          maxHeight: '90vh',
          outline: 'none',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2
        }}>
          <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
            <IconButton
              aria-label="close"
              onClick={() => setSelectedImage(null)}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedImage && (
            <Box>
              <img
                src={selectedImage.url}
                alt="Imagen ampliada"
                style={{ 
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  margin: '0 auto'
                }}
              />
              <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
                {convertToDetailedDate(selectedImage.date)}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
      
      {/* Speed Dial de acciones */}
      <SpeedDial
        ariaLabel="plant-actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => navigate(action.url)}
            sx={{
              '& .MuiSpeedDialAction-staticTooltipLabel': {
                backgroundColor: action.color,
                color: '#fff'
              }
            }}
          />
        ))}
      </SpeedDial>
    </Layout>
  );
};

export default Plant;