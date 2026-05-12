import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoIcon from '@mui/icons-material/Info';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';

// Las cinco etapas y su icono para la cronología visual.
const STAGE_CHRONOLOGY = [
  { name: 'Germinacion', label: 'Germinación', icon: <SpaIcon />, paletteKey: 'info' },
  { name: 'Vegetativo', label: 'Vegetativo', icon: <GrassIcon />, paletteKey: 'success' },
  { name: 'Floracion', label: 'Floración', icon: <LocalFloristIcon />, paletteKey: 'warning' },
  { name: 'Secado', label: 'Secado', icon: <ParkIcon />, paletteKey: 'error' },
  { name: 'Enfrascado', label: 'Enfrascado', icon: <ForestIcon />, paletteKey: 'secondary' },
];

// Mapeo de etapa actual → título y descripción del diálogo.
function getDialogCopy(etapa) {
  if (etapa === 'Floracion') {
    return {
      title: 'Cosechar planta',
      infoTitle: 'Información sobre la cosecha',
      infoBody:
        'Estás a punto de cosechar tu planta. El sistema guardará la fecha actual como inicio del secado y fin del ciclo de floración.',
      transitionNote: 'La planta pasará a Secado. Se guardará la fecha de inicio del secado.',
      cta: 'Cosechar Planta',
      ctaLoading: 'Cosechando...',
      buttonIcon: <LocalFloristIcon />,
    };
  }
  if (etapa === 'Germinacion') {
    return {
      title: 'Cambiar a Vegetativo',
      infoTitle: 'Información sobre el cambio de etapa',
      infoBody:
        'Estás a punto de cambiar la etapa de crecimiento de tu planta. El sistema guardará la fecha actual como inicio de la nueva etapa.',
      transitionNote: 'La planta pasará a Vegetativo. Se guardará la fecha de inicio del período vegetativo.',
      cta: 'Cambiar a Vegetativo',
      ctaLoading: 'Cambiando...',
      buttonIcon: <ArrowForwardIcon />,
    };
  }
  if (etapa === 'Vegetativo') {
    return {
      title: 'Cambiar a Floración',
      infoTitle: 'Información sobre el cambio de etapa',
      infoBody:
        'Estás a punto de cambiar la etapa de crecimiento de tu planta. El sistema guardará la fecha actual como inicio de la nueva etapa.',
      transitionNote: 'La planta pasará a Floración. Se guardará la fecha de inicio de la floración.',
      cta: 'Cambiar a Floración',
      ctaLoading: 'Cambiando...',
      buttonIcon: <ArrowForwardIcon />,
    };
  }
  if (etapa === 'Secado') {
    return {
      title: 'Cambiar a Enfrascado',
      infoTitle: 'Información sobre el secado',
      infoBody:
        'Estás a punto de finalizar el secado y pasar a enfrascado. La planta será movida automáticamente al archivo histórico.',
      transitionNote: 'La planta pasará a Enfrascado y será movida automáticamente al archivo histórico.',
      cta: 'Cambiar a Enfrascado',
      ctaLoading: 'Cambiando...',
      buttonIcon: <ArrowForwardIcon />,
    };
  }
  return {
    title: 'Cambiar etapa de crecimiento',
    infoTitle: 'Información sobre el cambio de etapa',
    infoBody:
      'La planta ya ha completado todo su ciclo de vida y se encuentra en la etapa final de conservación.',
    transitionNote: '',
    cta: 'Confirmar cambio',
    ctaLoading: 'Cambiando...',
    buttonIcon: <ArrowForwardIcon />,
  };
}

const PlantStageDialog = ({ open, onClose, plant, isChangingStage, onConfirm }) => {
  const theme = useTheme();
  const isFloracion = plant.etapa === 'Floracion';
  const copy = getDialogCopy(plant.etapa);
  const accentColor = isFloracion ? '#e65100' : theme.palette.secondary.main;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          background: isFloracion
            ? 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)'
            : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocalFloristIcon />
          <Typography variant="h6" component="div">
            {copy.title}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="cerrar"
          size="small"
          sx={{
            bgcolor: alpha('#ffffff', 0.15),
            '&:hover': { bgcolor: alpha('#ffffff', 0.25) },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box
          sx={{
            p: 2.5,
            bgcolor: alpha(accentColor, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="medium"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <InfoIcon fontSize="small" color={isFloracion ? 'warning' : 'secondary'} />
            {copy.infoTitle}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            {copy.infoBody}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main, mb: 1 }}>
              Etapa actual: {plant.etapa}
            </Typography>
            {copy.transitionNote && (
              <Typography variant="body2" color="text.secondary">
                {copy.transitionNote}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Cronología visual de etapas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1 }}>
          {STAGE_CHRONOLOGY.map((stage) => {
            const isActive = plant.etapa === stage.name;
            return (
              <Box
                key={stage.name}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isActive ? 1 : 0.6 }}
              >
                <Avatar
                  sx={{
                    bgcolor: isActive ? theme.palette[stage.paletteKey].main : alpha(theme.palette.text.secondary, 0.1),
                    color: isActive ? 'white' : theme.palette.text.secondary,
                    mb: 1,
                  }}
                >
                  {stage.icon}
                </Avatar>
                <Typography variant="caption" fontWeight="medium">
                  {stage.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {plant.etapa === 'Secado' && (
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              El <strong>Enfrascado</strong> es la etapa final de conservación donde la planta, ya seca, se guarda en recipientes herméticos para su curado final y conservación.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ borderColor: theme.palette.text.secondary, color: theme.palette.text.secondary }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={isFloracion ? 'warning' : 'secondary'}
          onClick={onConfirm}
          startIcon={copy.buttonIcon}
          disabled={isChangingStage}
          sx={{
            ml: 2,
            bgcolor: isFloracion ? '#e65100' : null,
            boxShadow: isFloracion
              ? '0 4px 12px rgba(230, 81, 0, 0.3)'
              : `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
            '&:hover': {
              bgcolor: isFloracion ? '#bf360c' : null,
              boxShadow: isFloracion
                ? '0 6px 16px rgba(230, 81, 0, 0.4)'
                : `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s',
            fontWeight: isFloracion ? 'bold' : 'medium',
          }}
        >
          {isChangingStage ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              {copy.ctaLoading}
            </>
          ) : (
            copy.cta
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlantStageDialog;
