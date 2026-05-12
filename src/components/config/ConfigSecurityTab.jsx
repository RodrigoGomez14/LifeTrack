import React from 'react';
import {
  Box,
  Typography,
  Button,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';

const ConfigSecurityTab = ({ userEmail, sendPasswordReset }) => {
  const theme = useTheme();

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Seguridad de la cuenta
        </Typography>

        <Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}
          >
            <KeyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Autenticación
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary">
            Te enviaremos un correo electrónico con instrucciones para cambiar tu contraseña.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LockIcon />}
            onClick={() => sendPasswordReset(userEmail)}
            sx={{ borderRadius: 2 }}
          >
            Cambiar contraseña
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfigSecurityTab;
