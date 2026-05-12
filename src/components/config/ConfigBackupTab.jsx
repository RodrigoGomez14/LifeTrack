import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Stack,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { auth, storage } from '../../firebase';
import {
  getUserBackup,
  setPrivacyConfig,
  deleteAllUserData,
} from '../../services/config';

const ConfigBackupTab = ({
  email,
  showSavingsOnDashboard,
  setShowSavingsOnDashboard,
  showFinancesInProfile,
  setShowFinancesInProfile,
  dataBackupEnabled,
  setDataBackupEnabled,
  backupFrequency,
  setBackupFrequency,
  lastBackupDate,
  setLastBackupDate,
  signOut,
  deleteAccount,
  onSnack,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const autoBackupChecked = useRef(false);

  const createBackup = async (isAutomatic = false) => {
    if (isCreatingBackup) return;

    setIsCreatingBackup(true);

    try {
      const backupData = await getUserBackup();

      if (!backupData) {
        onSnack('No hay datos para crear una copia de seguridad', 'warning');
        setIsCreatingBackup(false);
        return;
      }

      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `backup_${dateString}_${timeString}.json`;

      const storageRef = storage.ref(`backups/${auth.currentUser.uid}/${fileName}`);
      await storageRef.put(blob);

      if (isAutomatic) {
        await setPrivacyConfig({ lastBackupDate: now.toISOString() });
        setLastBackupDate(now.toISOString());
        onSnack('Copia de seguridad automática creada con éxito', 'success');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onSnack('Copia de seguridad creada y descargada con éxito', 'success');
      }
    } catch (error) {
      console.error('Error al crear la copia de seguridad:', error);
      onSnack('Error al crear la copia de seguridad', 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Auto-backup según frecuencia: corre una sola vez al abrir esta pestaña
  useEffect(() => {
    if (autoBackupChecked.current || !dataBackupEnabled) return;
    autoBackupChecked.current = true;

    if (!lastBackupDate) {
      createBackup(true);
      return;
    }

    const lastBackup = new Date(lastBackupDate);
    const now = new Date();
    let needsNewBackup = false;

    switch (backupFrequency) {
      case 'daily':
        needsNewBackup =
          lastBackup.getDate() !== now.getDate() ||
          lastBackup.getMonth() !== now.getMonth() ||
          lastBackup.getFullYear() !== now.getFullYear();
        break;
      case 'weekly': {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        needsNewBackup = lastBackup < oneWeekAgo;
        break;
      }
      case 'monthly':
        needsNewBackup =
          lastBackup.getMonth() !== now.getMonth() ||
          lastBackup.getFullYear() !== now.getFullYear();
        break;
      default:
        break;
    }

    if (needsNewBackup) createBackup(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataBackupEnabled, lastBackupDate, backupFrequency]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== email) {
      onSnack('Por favor, escribe tu correo electrónico correctamente para confirmar', 'error');
      return;
    }

    if (
      !window.confirm(
        '¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.'
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deleteAllUserData();
      await deleteAccount();

      onSnack('Tu cuenta ha sido eliminada correctamente', 'success');

      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);

      if (error.code === 'auth/requires-recent-login') {
        onSnack('Por seguridad, debes volver a iniciar sesión antes de eliminar tu cuenta', 'error');
        setTimeout(() => {
          signOut().then(() => navigate('/'));
        }, 2000);
      } else {
        onSnack('Error al eliminar la cuenta: ' + error.message, 'error');
      }

      setDeleting(false);
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Privacidad y datos
        </Typography>

        <Stack spacing={4}>
          {/* Visibilidad de datos */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Visibilidad de datos
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showSavingsOnDashboard}
                    onChange={(e) => setShowSavingsOnDashboard(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mostrar ahorros en el panel de inicio"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showFinancesInProfile}
                    onChange={(e) => setShowFinancesInProfile(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mostrar información financiera en el perfil"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Copias de seguridad */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Copias de seguridad
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dataBackupEnabled}
                    onChange={(e) => setDataBackupEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Habilitar copia de seguridad automática"
              />

              {dataBackupEnabled && (
                <Box sx={{ ml: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Frecuencia de copias de seguridad
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="daily">Diaria</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {lastBackupDate && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Última copia de seguridad: {new Date(lastBackupDate).toLocaleString()}
                </Typography>
              )}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={() => createBackup(false)}
                disabled={isCreatingBackup}
                sx={{ borderRadius: 2 }}
              >
                {isCreatingBackup ? 'Creando copia...' : 'Exportar mis datos'}
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Zona peligrosa — eliminar cuenta */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 2,
                fontWeight: 500,
                color: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <WarningIcon sx={{ mr: 1 }} />
              Zona peligrosa
            </Typography>

            <Alert
              severity="error"
              variant="outlined"
              sx={{
                borderRadius: 2,
                mb: 2,
                bgcolor: alpha(theme.palette.error.main, 0.04),
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Eliminar cuenta
              </Typography>
              <Typography variant="body2">
                Esta acción es permanente. Se borrarán todos tus datos: plantas, finanzas, hábitos, ahorros y
                configuración.
              </Typography>
            </Alert>

            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Para confirmar, escribí tu correo electrónico (<strong>{email}</strong>) en el campo de abajo:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={email}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== email}
                  sx={{ borderRadius: 2 }}
                >
                  Eliminar cuenta permanentemente
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConfigBackupTab;
