import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Card,
  CardMedia,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

// Modal con galería de fotos del día. Soporta dos vistas: grid y single (con prev/next).
// Diseñado para ser reemplazado en Fase 4 por la vista de comparación de fotos.
const PlantPhotoGalleryDialog = ({ open, onClose, photos = [], accentColor }) => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      setView('grid');
    }
  }, [open]);

  const handlePhotoClick = (index) => {
    setSelectedIndex(index);
    setView('single');
  };

  const handleNext = () => {
    if (photos.length === 0) return;
    setSelectedIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  };

  const handlePrev = () => {
    if (photos.length === 0) return;
    setSelectedIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  };

  const currentPhoto = photos[selectedIndex];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '.MuiDialog-paper': {
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper,
          maxHeight: '90vh',
        },
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
          background: `linear-gradient(135deg, ${accentColor} 0%, ${alpha(accentColor, 0.8)} 100%)`,
          color: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PhotoCameraIcon />
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
            Fotos ({photos.length})
            {view === 'single' && photos.length > 0 && (
              <Typography variant="body2" component="span" sx={{ ml: 2, opacity: 0.9 }}>
                {selectedIndex + 1} de {photos.length}
              </Typography>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {view === 'single' && (
            <Button
              startIcon={<ArrowBackIcon />}
              size="small"
              onClick={() => setView('grid')}
              sx={{
                color: '#ffffff',
                borderColor: alpha('#ffffff', 0.3),
                bgcolor: alpha('#ffffff', 0.1),
                '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
              }}
            >
              Volver a la galería
            </Button>
          )}
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="cerrar"
            size="small"
            sx={{
              color: '#ffffff',
              bgcolor: alpha('#000000', 0.2),
              '&:hover': { bgcolor: alpha('#000000', 0.3) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, position: 'relative' }}>
        {view === 'grid' ? (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {photos.map((photo, index) => (
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
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    },
                    position: 'relative',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url || photo.dataUrl}
                    alt={`Foto ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
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
                      bgcolor: alpha(accentColor, 0.7),
                      '&:hover': { bgcolor: alpha(accentColor, 0.9) },
                    }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', textAlign: 'center' }}>
            {currentPhoto && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  bgcolor: '#000',
                  borderRadius: 2,
                  overflow: 'hidden',
                  minHeight: '60vh',
                  maxHeight: '70vh',
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: 16,
                    zIndex: 2,
                    color: '#fff',
                    bgcolor: alpha('#000', 0.3),
                    '&:hover': { bgcolor: alpha('#000', 0.5) },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>

                <Box
                  component="img"
                  src={currentPhoto.url || currentPhoto.dataUrl}
                  alt={`Foto ${selectedIndex + 1}`}
                  sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />

                <IconButton
                  sx={{
                    position: 'absolute',
                    right: 16,
                    zIndex: 2,
                    color: '#fff',
                    bgcolor: alpha('#000', 0.3),
                    '&:hover': { bgcolor: alpha('#000', 0.5) },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlantPhotoGalleryDialog;
