import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { checkSearch } from '../../utils';

const PlantProfilePhotoDialog = ({ open, onClose, plant, onSelectPhoto, locationSearch }) => {
  const theme = useTheme();
  const hasImages = plant.images && Object.keys(plant.images).length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Seleccionar Foto de Perfil
        <IconButton aria-label="cerrar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {hasImages ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(plant.images).map(([key, image]) => {
              const isCurrentProfile = plant.profilePhotoKey === key;
              const imageUrl = image.url || image.dataUrl;
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
                        boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => onSelectPhoto(imageUrl, key)}
                    />

                    {isCurrentProfile && (
                      <Chip
                        label="Actual"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }}
                      />
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1, textAlign: 'center' }}
                    >
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
              to={`/NuevaFoto/?${checkSearch(locationSearch)}`}
              startIcon={<AddAPhotoIcon />}
              sx={{ mt: 2 }}
            >
              Añadir Nueva Foto
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlantProfilePhotoDialog;
