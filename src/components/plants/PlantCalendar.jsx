import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/es';
import { Global } from '@emotion/react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineIcon from '@mui/icons-material/Timeline';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import InfoIcon from '@mui/icons-material/Info';
import { checkSearch } from '../../utils';
import { formatMonthDisplay } from './plantsHelpers';
import PlantPhotoGalleryDialog from './PlantPhotoGalleryDialog';

moment.locale('es');
const localizer = momentLocalizer(moment);
const CALENDAR_HEIGHT = 700;

// Estilos globales para ocultar la toolbar/headers default de react-big-calendar.
// Convive con `customCalendarStyles` aplicado al style del Calendar para máxima compatibilidad.
const GlobalStyles = () => (
  <Global
    styles={{
      '.rbc-toolbar': { display: 'none !important' },
      '.rbc-header': { display: 'none !important' },
      '.rbc-month-header': { display: 'none !important' },
      '.rbc-header > span': { display: 'none !important' },
      '.rbc-row': { border: 'none !important' },
      '.rbc-month-row': { minHeight: '110px !important', border: 'none !important' },
      '.rbc-event': { borderRadius: '4px !important', boxShadow: '0 1px 3px rgba(0,0,0,0.1) !important' },
      '.rbc-date-cell': { padding: '5px !important', textAlign: 'right !important' },
      '.rbc-off-range-bg': { backgroundColor: '#f5f5f5 !important' },
      '.rbc-off-range': { color: '#999 !important' },
      '.rbc-off-range .rbc-date-cell': { color: '#999 !important' },
      '.rbc-off-range .rbc-date-cell button': { color: '#999 !important' },
      '.rbc-day-bg.rbc-off-range-bg': { backgroundColor: '#f5f5f5 !important', opacity: '0.6 !important' },
      '.rbc-today': { backgroundColor: 'transparent !important' },
      '.rbc-day-bg.rbc-today': { position: 'relative' },
      '.rbc-day-bg.rbc-today:after': {
        content: "''",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(25, 118, 210, 0.05)',
        pointerEvents: 'none',
      },
      '.rbc-month-view > .rbc-row.rbc-month-header': { display: 'none !important' },
    }}
  />
);

const calendarSx = {
  height: '700px',
  width: '100%',
  '.rbc-toolbar': { display: 'none' },
  '.rbc-month-header': { display: 'none' },
  '.rbc-header': { padding: 0, margin: 0, border: 'none', height: '0px', display: 'none' },
  '.rbc-header span': { display: 'none' },
  '.rbc-row': { border: 'none' },
  '.rbc-time-header': { display: 'none' },
  '.rbc-time-header-content': { display: 'none' },
  '.rbc-time-header-content > .rbc-row': { display: 'none' },
  '.rbc-month-row': { border: 'none' },
  '.rbc-day-bg': { border: '1px solid #f0f0f0' },
  '.rbc-date-cell': { padding: '5px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'normal' },
};

const CustomHeader = React.memo(() => null);

// Estilo aplicado a cada evento del calendario (pill base + variantes para Foto/Etapa).
function eventStyleGetter(event) {
  let style = {
    backgroundColor: alpha(event.color, 0.1),
    color: event.color,
    border: `1px solid ${alpha(event.color, 0.3)}`,
    cursor: 'pointer',
  };
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
      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
    };
  }
  if (event.resourceType === 'Etapa') {
    style = {
      ...style,
      backgroundColor: alpha(event.color, 0.2),
      borderLeft: `4px solid ${event.color}`,
      fontWeight: 'bold',
    };
  }
  return { style };
}

// Renderer custom de eventos del calendario.
// Para eventos tipo "Foto" abre la galería; para el resto dibuja una pill con icono+título.
const EventComponent = ({ event }) => {
  const [openPhotos, setOpenPhotos] = useState(false);
  if (!event) return null;

  const getIcon = () => {
    if (event.resourceType === 'Etapa') {
      if (event.stageType === 'Germinacion') return <SpaIcon fontSize="small" />;
      if (event.stageType === 'Vegetativo') return <GrassIcon fontSize="small" />;
      return <LocalFloristIcon fontSize="small" />;
    }
    switch (event.icon) {
      case 'water': return <WaterDropIcon fontSize="small" />;
      case 'bug': return <BugReportIcon fontSize="small" />;
      case 'cut': return <ContentCutIcon fontSize="small" />;
      case 'swap': return <SwapHorizIcon fontSize="small" />;
      case 'note': return <NoteAltIcon fontSize="small" />;
      case 'photo': return <PhotoCameraIcon fontSize="small" />;
      default: return <InfoIcon fontSize="small" />;
    }
  };

  if (event.resourceType === 'Foto') {
    return (
      <>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            setOpenPhotos(true);
          }}
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
            '&:hover': { boxShadow: `0 3px 6px ${alpha(event.color, 0.6)}`, transform: 'translateY(-1px)' },
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, position: 'relative', zIndex: 1, p: 0.5 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'white', color: event.color }}>
              <PhotoCameraIcon sx={{ fontSize: '0.75rem' }} />
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: '#ffffff',
                flexGrow: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Fotos ({event.details?.count || 0})
            </Typography>
          </Box>
        </Box>

        <PlantPhotoGalleryDialog
          open={openPhotos}
          onClose={() => setOpenPhotos(false)}
          photos={event.photos || []}
          accentColor={event.color}
        />
      </>
    );
  }

  return (
    <Box
      sx={{
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
          boxShadow: `0 2px 4px ${alpha(event.color, 0.2)}`,
        },
      }}
    >
      <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(event.color, 0.2), color: event.color }}>
        {getIcon()}
      </Avatar>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 'medium',
          fontSize: '0.8rem',
          color: event.color,
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {event.title || 'Sin título'}
      </Typography>
    </Box>
  );
};

// Componente principal del calendario.
// Maneja la navegación de mes y la apertura del modal de evento via onEventClick.
// Diseñado como reemplazo aislado para Fase 4 (rediseño del calendario).
const PlantCalendar = ({ events, currentDate, onCurrentDateChange, onEventClick, locationSearch }) => {
  const theme = useTheme();

  const handleNavigate = (action) => {
    const date = new Date(currentDate);
    if (action === 'PREV') date.setMonth(date.getMonth() - 1);
    else if (action === 'NEXT') date.setMonth(date.getMonth() + 1);
    else if (action === 'TODAY') {
      const now = new Date();
      date.setMonth(now.getMonth());
      date.setFullYear(now.getFullYear());
      date.setDate(now.getDate());
    }
    onCurrentDateChange(date);
  };

  return (
    <>
      <GlobalStyles />

      <Paper
        id="plant-calendar"
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
          width: '100%',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', lg: 'center' },
              p: 3,
              position: 'relative',
              zIndex: 1,
              gap: { xs: 2, lg: 3 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 3 },
                width: { xs: '100%', lg: 'auto' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: alpha('#ffffff', 0.2), color: '#ffffff', width: 48, height: 48 }}>
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
                      lineHeight: 1.2,
                    }}
                  >
                    Historial de actividades
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: alpha('#ffffff', 0.15),
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  minWidth: { sm: '200px' },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: { xs: '1.3rem', sm: '1.5rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    textAlign: { xs: 'left', sm: 'center' },
                  }}
                >
                  {formatMonthDisplay(currentDate)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', lg: 'flex-end' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                component={Link}
                to={`/LineaTiempo/?${checkSearch(locationSearch)}`}
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
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Ir a línea de tiempo
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  bgcolor: alpha('#ffffff', 0.15),
                  borderRadius: 3,
                  p: 0.5,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                }}
              >
                <Tooltip title="Mes anterior" arrow>
                  <IconButton
                    size="medium"
                    onClick={() => handleNavigate('PREV')}
                    sx={{
                      color: '#ffffff',
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      '&:hover': { bgcolor: alpha('#ffffff', 0.2), transform: 'scale(1.05)' },
                      transition: 'all 0.2s ease',
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
                      '&:hover': { bgcolor: alpha('#ffffff', 0.25), transform: 'scale(1.05)' },
                      transition: 'all 0.2s ease',
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
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      '&:hover': { bgcolor: alpha('#ffffff', 0.2), transform: 'scale(1.05)' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 0, position: 'relative', height: CALENDAR_HEIGHT }}>
          <Calendar
            localizer={localizer}
            events={events}
            views={['month']}
            view="month"
            date={currentDate}
            onNavigate={handleNavigate}
            startAccessor="start"
            endAccessor="end"
            style={calendarSx}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={onEventClick}
            components={{
              event: EventComponent,
              toolbar: () => null,
              header: CustomHeader,
              month: { header: CustomHeader },
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
    </>
  );
};

export default PlantCalendar;
