import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Box, Typography, Button, Grid, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import BugReportIcon from '@mui/icons-material/BugReport';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { checkSearch } from '../../utils';

// Lista canónica de acciones rápidas. Cada entrada define ruta, color del botón e icono.
// Agregar una nueva acción (ej. medición pH/EC/PPM en Fase 4) es sumar un objeto al array.
const ACTIONS = [
  { label: 'Riego', route: 'NuevoRiego', icon: <WaterDropIcon />, palette: 'info' },
  { label: 'Poda', route: 'NuevaPoda', icon: <ContentCutIcon />, palette: 'success' },
  { label: 'Insecticida', route: 'NuevoInsecticida', icon: <BugReportIcon />, palette: 'error' },
  { label: 'Transplante', route: 'NuevoTransplante', icon: <SwapHorizIcon />, palette: 'warning' },
  { label: 'Foto', route: 'NuevaFoto', icon: <PhotoCameraIcon />, palette: 'secondary' },
  { label: 'Nota', route: 'NuevoLog', icon: <NoteAltIcon />, paletteHex: '#9c27b0', paletteHexDark: '#7b1fa2' },
];

// Devuelve el color base (main) y hover (dark) según la paleta MUI o colores hex hardcoded.
function resolveColors(theme, action) {
  if (action.paletteHex) {
    return { main: action.paletteHex, dark: action.paletteHexDark };
  }
  return {
    main: theme.palette[action.palette].main,
    dark: theme.palette[action.palette].dark,
  };
}

const PlantQuickActions = ({ plant, locationSearch }) => {
  const theme = useTheme();
  const isAvailable = !plant.isArchived && plant.etapa !== 'Secado' && plant.etapa !== 'Enfrascado';
  if (!isAvailable) return null;

  const query = checkSearch(locationSearch);

  return (
    <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
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
          '& .MuiTypography-root': { color: '#ffffff' },
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {ACTIONS.map((action) => {
            const colors = resolveColors(theme, action);
            return (
              <Grid item xs={6} sm={4} md={2} key={action.label}>
                <Button
                  variant="contained"
                  component={Link}
                  to={`/${action.route}/?${query}`}
                  startIcon={action.icon}
                  fullWidth
                  sx={{
                    p: 1.5,
                    bgcolor: colors.main,
                    height: '100%',
                    borderRadius: 2,
                    flexDirection: 'column',
                    boxShadow: `0 4px 8px ${alpha(colors.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: colors.dark,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 12px ${alpha(colors.main, 0.3)}`,
                    },
                    '& .MuiButton-startIcon': { margin: 0, marginBottom: 1 },
                  }}
                >
                  <Box sx={{ mt: 0 }}>{action.label}</Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PlantQuickActions;
