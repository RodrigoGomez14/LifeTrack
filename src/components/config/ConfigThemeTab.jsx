import React from 'react';
import {
  Box,
  Typography,
  Switch,
  Stack,
  Alert,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { setTheme } from '../../services/config';

const ConfigThemeTab = ({
  displayName,
  darkMode,
  setDarkMode,
  userData,
  setUserData,
  onSnack,
}) => {
  const theme = useTheme();

  const handleToggleDarkMode = async (event) => {
    const next = event.target.checked;
    setDarkMode(next);

    try {
      await setTheme({ darkMode: next });

      if (userData) {
        setUserData({
          ...userData,
          config: {
            ...(userData.config || {}),
            theme: { ...(userData.config?.theme || {}), darkMode: next },
          },
        });
      }
    } catch (error) {
      console.error('Error al guardar el modo:', error);
      onSnack('Error al actualizar el modo', 'error');
    }
  };

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
          {displayName ? `¡Hola ${displayName}! ` : ''}Elegí entre modo claro u oscuro según tu preferencia.
        </Typography>

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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {darkMode ? (
                <DarkModeIcon sx={{ mr: 2, color: theme.palette.text.primary, fontSize: 28 }} />
              ) : (
                <LightModeIcon sx={{ mr: 2, color: theme.palette.text.primary, fontSize: 28 }} />
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {darkMode ? 'Ideal para uso nocturno' : 'Máxima legibilidad diurna'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={darkMode}
              onChange={handleToggleDarkMode}
              color="primary"
              size="medium"
            />
          </Stack>
        </Card>

        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}
        >
          El cambio se aplica al instante.
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ConfigThemeTab;
