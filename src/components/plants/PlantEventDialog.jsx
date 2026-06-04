import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Fade,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import InfoIcon from '@mui/icons-material/Info';
import { convertToDetailedDate } from './plantsHelpers';

// Icono grande del header del modal según el icon/resourceType del evento.
function getHeaderIcon(event) {
  if (event.resourceType === 'Etapa') {
    if (event.stageType === 'Germinacion') return <SpaIcon sx={{ fontSize: 32 }} />;
    if (event.stageType === 'Vegetativo') return <GrassIcon sx={{ fontSize: 32 }} />;
    if (event.stageType === 'Floracion') return <LocalFloristIcon sx={{ fontSize: 32 }} />;
    return <LocalFloristIcon sx={{ fontSize: 32 }} />;
  }
  switch (event.icon) {
    case 'water': return <WaterDropIcon sx={{ fontSize: 32 }} />;
    case 'bug': return <BugReportIcon sx={{ fontSize: 32 }} />;
    case 'cut': return <ContentCutIcon sx={{ fontSize: 32 }} />;
    case 'swap': return <SwapHorizIcon sx={{ fontSize: 32 }} />;
    case 'photo': return <PhotoCameraIcon sx={{ fontSize: 32 }} />;
    case 'note': return <NoteAltIcon sx={{ fontSize: 32 }} />;
    default: return <InfoIcon sx={{ fontSize: 32 }} />;
  }
}

// Bloque "Notas adicionales" — se reutiliza en Riego/Insecticida/Poda/Transplante.
const NotesBlock = ({ notes, theme }) => {
  if (!notes) return null;
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <NoteAltIcon sx={{ color: theme.palette.info.main }} />
        Notas adicionales
      </Typography>
      <Box
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {notes}
        </Typography>
      </Box>
    </Box>
  );
};

// Tarjeta de "elemento usado" (aditivo o insecticida).
const UsageCard = ({ item, color, dosisLabel = 'Dosis' }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: alpha(color, 0.05),
      borderRadius: 2,
      border: `1px solid ${alpha(color, 0.1)}`,
    }}
  >
    <Typography variant="body1" fontWeight="medium">
      {item.name}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {dosisLabel}: {item.dosis}
    </Typography>
  </Box>
);

// Wrapper destacado de "información principal" — usado en Riego/Insecticida/Poda/Transplante.
const HighlightBox = ({ color, children, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      p: 3,
      bgcolor: alpha(color, 0.05),
      borderRadius: 3,
      border: `2px solid ${alpha(color, 0.2)}`,
      mb: 3,
      ...sx,
    }}
  >
    {children}
  </Box>
);

// Renderiza el cuerpo del modal según el tipo de evento.
function EventDetailsBody({ event, theme }) {
  if (!event) return null;

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
          <HighlightBox color={theme.palette.info.main}>
            <OpacityIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold" color={theme.palette.info.main}>
              {event.details.quantity} ml
            </Typography>
          </HighlightBox>

          {(event.details.ph !== undefined || event.details.ec !== undefined || event.details.ppm !== undefined) && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, justifyContent: 'center' }}>
              {event.details.ph !== undefined && (
                <Box sx={{ textAlign: 'center', bgcolor: alpha('#4CAF50', 0.08), borderRadius: 2, p: 1.5, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">pH</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>{event.details.ph}</Typography>
                </Box>
              )}
              {event.details.ec !== undefined && (
                <Box sx={{ textAlign: 'center', bgcolor: alpha('#2196F3', 0.08), borderRadius: 2, p: 1.5, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">EC</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>{event.details.ec} mS/cm</Typography>
                </Box>
              )}
              {event.details.ppm !== undefined && (
                <Box sx={{ textAlign: 'center', bgcolor: alpha('#FF9800', 0.08), borderRadius: 2, p: 1.5, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">PPM</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF9800' }}>{event.details.ppm}</Typography>
                </Box>
              )}
            </Box>
          )}

          {event.details.aditives?.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ color: theme.palette.success.main }} />
                Aditivos utilizados
              </Typography>
              <Stack spacing={1.5}>
                {event.details.aditives.map((a, i) => (
                  <UsageCard key={i} item={{ ...a, dosis: `${a.dosis} ml` }} color={theme.palette.success.main} />
                ))}
              </Stack>
            </Box>
          )}

          <NotesBlock notes={event.details.notes} theme={theme} />
        </Box>
      );

    case 'Insecticida':
      return (
        <Box>
          <HighlightBox color={theme.palette.error.main}>
            <BugReportIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.error.main}>
                {event.details.treatmentType || 'Tratamiento'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Método: {event.details.appMethod || 'No especificado'}
              </Typography>
            </Box>
          </HighlightBox>

          {event.details.insecticides?.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ color: theme.palette.error.main }} />
                Insecticidas utilizados
              </Typography>
              <Stack spacing={1.5}>
                {event.details.insecticides.map((i, idx) => (
                  <UsageCard key={idx} item={i} color={theme.palette.error.main} />
                ))}
              </Stack>
            </Box>
          )}

          {/* Compatibilidad con formato antiguo (product en vez de insecticides[]) */}
          {event.details.product && !event.details.insecticides && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ color: theme.palette.error.main }} />
                Producto utilizado
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  {event.details.product}
                </Typography>
              </Box>
            </Box>
          )}

          <NotesBlock notes={event.details.notes} theme={theme} />
        </Box>
      );

    case 'Poda':
      return (
        <Box>
          <HighlightBox color={theme.palette.success.main} sx={{ mb: event.details.notes ? 3 : 0 }}>
            <ContentCutIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold" color={theme.palette.success.main}>
              {event.details.type}
            </Typography>
          </HighlightBox>
          <NotesBlock notes={event.details.notes} theme={theme} />
        </Box>
      );

    case 'Transplante':
      return (
        <Box>
          <HighlightBox color={theme.palette.warning.main} sx={{ gap: 3, mb: event.details.notes ? 3 : 0 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Maceta anterior
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.warning.main}>
                {event.details.previousPot}L
              </Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nueva maceta
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.warning.main}>
                {event.details.newPot}L
              </Typography>
            </Box>
          </HighlightBox>
          <NotesBlock notes={event.details.notes} theme={theme} />
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
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 3,
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <img
              src={event.imageUrl}
              alt="Foto de la planta"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Box>
      );

    case 'Log':
      return (
        <Box
          sx={{
            p: 3,
            bgcolor: alpha('#9c27b0', 0.05),
            borderRadius: 3,
            border: `2px solid ${alpha('#9c27b0', 0.2)}`,
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '1.1rem' }}>
            {event.details.description}
          </Typography>
        </Box>
      );

    default:
      return null;
  }
}

const PlantEventDialog = ({ open, onClose, event }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          maxHeight: '90vh',
        },
      }}
    >
      {event && (
        <>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${event.color} 0%, ${alpha(event.color, 0.8)} 100%)`,
                color: '#ffffff',
                boxShadow: `0 8px 32px ${alpha(event.color, 0.4)}`,
                position: 'relative',
              }}
            >
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha('#ffffff', 0.25),
                    color: '#ffffff',
                    width: 64,
                    height: 64,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    border: `3px solid ${alpha('#ffffff', 0.3)}`,
                  }}
                >
                  {getHeaderIcon(event)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)', mb: 0.5 }}>
                    {event.resourceType}
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha('#ffffff', 0.95), fontWeight: 'medium', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                    {convertToDetailedDate(event.details.date)}
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                onClick={onClose}
                size="large"
                sx={{
                  color: 'white',
                  bgcolor: alpha('#ffffff', 0.15),
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  '&:hover': { bgcolor: alpha('#ffffff', 0.25), transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${alpha(event.color, 0.8)} 0%, ${event.color} 50%, ${alpha(event.color, 0.8)} 100%)`,
              }}
            />
          </Box>

          <DialogContent
            sx={{
              p: 0,
              bgcolor: theme.palette.background.default,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(event.color, 0.3),
                borderRadius: '4px',
                '&:hover': { backgroundColor: alpha(event.color, 0.5) },
              },
              '&::-webkit-scrollbar-track': { backgroundColor: alpha(event.color, 0.05) },
            }}
          >
            <Box sx={{ p: 4 }}>
              <EventDetailsBody event={event} theme={theme} />
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default PlantEventDialog;
