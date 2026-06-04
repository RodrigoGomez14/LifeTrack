import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CircleIcon from '@mui/icons-material/Circle';

const ConfigThemeTab = ({ displayName }) => {
  const theme = useTheme();

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Tema y apariencia
        </Typography>

        <Typography
          variant="body1"
          paragraph
          sx={{ color: alpha(theme.palette.text.primary, 0.8), mb: 4 }}
        >
          {displayName ? `${displayName}, ` : ''}LifeTrack usa un tema oscuro uniforme con una paleta de colores fija.
        </Typography>

        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DarkModeIcon sx={{ color: theme.palette.text.primary, fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Modo Oscuro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tema fijo — optimizado para reducir la fatiga visual
              </Typography>
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Paleta de colores
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: 'Primario', color: theme.palette.primary.main },
              { label: 'Secundario', color: theme.palette.secondary.main },
              { label: 'Éxito', color: theme.palette.success.main },
              { label: 'Advertencia', color: theme.palette.warning.main },
              { label: 'Error', color: theme.palette.error.main },
            ].map((c) => (
              <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 14, color: c.color }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {c.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Tipografía: Inter`} variant="outlined" size="small" sx={{ borderColor: alpha(theme.palette.text.primary, 0.2) }} />
            <Chip label={`Borde redondeado: 12px`} variant="outlined" size="small" sx={{ borderColor: alpha(theme.palette.text.primary, 0.2) }} />
          </Box>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ConfigThemeTab;
