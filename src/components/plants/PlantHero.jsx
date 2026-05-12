import React from 'react';
import { Card, CardContent, Box, Typography, Button, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getStageIcon } from './plantsHelpers';

// Etiqueta del botón de avance de etapa según la etapa actual.
function getStageButtonLabel(etapa) {
  if (etapa === 'Floracion') return 'Cosechar';
  if (etapa === 'Germinacion') return 'Cambiar a Vegetativo';
  if (etapa === 'Vegetativo') return 'Cambiar a Floración';
  if (etapa === 'Secado') return 'Enfrascar';
  return 'Cambiar etapa';
}

// Dato inline (caption + valor grande) que aparece dentro del bloque con fondo oscuro.
const InlineStat = ({ label, value }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 0.3,
    }}
  >
    <Typography
      variant="caption"
      sx={{
        opacity: 0.9,
        fontWeight: 'medium',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#ffffff',
      }}
    >
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      {typeof value === 'string' ? (
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2, color: '#ffffff' }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  </Box>
);

const Separator = () => (
  <Box
    sx={{
      width: { xs: '100%', sm: '2px' },
      height: { xs: '1px', sm: '40px' },
      bgcolor: alpha('#ffffff', 0.3),
      borderRadius: 1,
    }}
  />
);

const PlantHero = ({ plant, onChangeProfilePhoto, onChangeStage }) => {
  const theme = useTheme();
  const isFloracion = plant.etapa === 'Floracion';
  const canChangeStage = !plant.isArchived && plant.etapa !== 'Enfrascado';

  return (
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
        color: '#ffffff',
      }}
    >
      {/* Overlay para legibilidad */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`,
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Botón cambiar foto de perfil */}
      <IconButton
        onClick={onChangeProfilePhoto}
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
          '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.1)' },
          transition: 'all 0.2s ease',
        }}
      >
        <PhotoCameraIcon sx={{ fontSize: '1.4rem' }} />
      </IconButton>

      <CardContent
        sx={{ p: 3, position: 'relative', zIndex: 1, minHeight: '180px', display: 'flex', alignItems: 'center' }}
      >
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* Nombre + botón etapa */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  fontSize: { xs: '2.2rem', md: '2.8rem' },
                  lineHeight: 1.1,
                }}
              >
                {plant.name}
              </Typography>

              {canChangeStage && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={onChangeStage}
                  startIcon={isFloracion ? <LocalFloristIcon /> : <ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: isFloracion
                      ? 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)'
                      : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#ffffff', 0.8)} 100%)`,
                    color: isFloracion ? '#ffffff' : theme.palette.primary.main,
                    border: 'none',
                    '&:hover': {
                      background: isFloracion
                        ? 'linear-gradient(135deg, #e55a2b 0%, #cc4d24 100%)'
                        : `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.9)} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: isFloracion
                        ? '0 6px 16px rgba(255, 107, 53, 0.4)'
                        : `0 6px 16px ${alpha('#ffffff', 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    boxShadow: isFloracion
                      ? '0 4px 12px rgba(255, 107, 53, 0.3)'
                      : `0 4px 12px ${alpha('#ffffff', 0.2)}`,
                    ...(isFloracion && {
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0.4)' },
                        '70%': { boxShadow: '0 0 0 15px rgba(255, 107, 53, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(255, 107, 53, 0)' },
                      },
                      animation: 'pulse 2s infinite',
                    }),
                  }}
                >
                  {getStageButtonLabel(plant.etapa)}
                </Button>
              )}
            </Box>

            {/* Datos inline compactos */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 4 },
                alignItems: { xs: 'flex-start', sm: 'center' },
                bgcolor: alpha('#000000', 0.4),
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                p: { xs: 2, sm: 3 },
                border: `1px solid ${alpha('#ffffff', 0.2)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <InlineStat label="Cantidad" value={plant.quantity ? `${plant.quantity} plantas` : 'No especificada'} />
              <Separator />
              <InlineStat label="Genética" value={plant.genetic || 'No especificada'} />
              <Separator />
              <InlineStat label="Maceta" value={plant.potVolume ? `${plant.potVolume}L` : 'No especificado'} />
              <Separator />
              {plant.inicioSecado && (
                <>
                  <InlineStat label="Cosecha" value={plant.inicioSecado} />
                  <Separator />
                </>
              )}
              <InlineStat
                label="Etapa"
                value={
                  <>
                    {getStageIcon(plant?.etapa)}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2, color: '#ffffff' }}>
                      {plant.etapa || 'No especificada'}
                    </Typography>
                  </>
                }
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlantHero;
