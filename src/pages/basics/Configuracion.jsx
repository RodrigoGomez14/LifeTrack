import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Switch, Select, MenuItem,
  FormControl, Alert, CircularProgress, Snackbar, Avatar, alpha, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Card, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BackupIcon from '@mui/icons-material/Backup';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { uploadProfilePhoto, uploadBackup } from '../../services/storage';
import Layout from '../../components/layout/Layout';
import { SectionCard, LoadingOverlay, AnimatedGroup, AnimatedItem } from '../../design-system';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import {
  setDisplayName as setDisplayNameInDb,
  getUserBackup,
  setConfig,
} from '../../services/config';
import {
  requestPermission,
  saveFcmToken as saveDeviceToken,
  removeFcmToken,
  getReminders,
  removeReminder,
} from '../../services/notifications';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MODULES = {
  '/': 'Home',
  '/gastos': 'Gastos',
  '/ingresos': 'Ingresos',
  '/tarjetas': 'Tarjetas',
  '/ahorros': 'Ahorros',
  '/Habitos': 'Hábitos',
  '/plantas': 'Plantas',
  '/Configuracion': 'Configuración',
};

const Configuracion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, setUserData } = useStore();
  const { user, updateDisplayName, updatePhotoURL } = useAuth();
  const autoBackupChecked = useRef(false);

  const displayName = user?.displayName || '';
  const photoURL = user?.photoURL || '';
  const email = user?.email || '';

  const [nameValue, setNameValue] = useState(displayName);
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [birthday, setBirthday] = useState('');
  const [dataBackupEnabled, setDataBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const [deleteNotifDialog, setDeleteNotifDialog] = useState(null);
  const [deletingNotif, setDeletingNotif] = useState(false);

  const [snack, setSnack] = useState('');
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [linkingDevice, setLinkingDevice] = useState(false);
  const [unlinkingDevice, setUnlinkingDevice] = useState(false);
  const [notifList, setNotifList] = useState({});

  // Cargar reminders desde el nodo notifications/ (fuera del arbol del user)
  useEffect(() => {
    if (!user?.uid) return;
    getReminders(user.uid).then(setNotifList);
  }, [user?.uid]);

  useEffect(() => {
    if (userData?.config) {
      const c = userData.config;
      setBirthday(c.birthday || '');
      setDataBackupEnabled(c.dataBackupEnabled || false);
      setBackupFrequency(c.backupFrequency || 'daily');
      setLastBackupDate(c.lastBackupDate || null);
    }
  }, [userData]);

  const handleLinkDevice = async () => {
    setLinkingDevice(true);
    const result = await requestPermission();
    if (result?.token && user?.uid) {
      await saveDeviceToken(user.uid, result.token);
      setDeviceLinked(true);
      showSnack('Dispositivo vinculado');
    } else {
      showSnack(result?.error || 'No se pudo vincular', 'error');
    }
    setLinkingDevice(false);
  };

  const handleUnlinkDevice = async () => {
    setUnlinkingDevice(true);
    try {
      await removeFcmToken(user?.uid);
      setDeviceLinked(false);
      showSnack('Dispositivo desvinculado');
    } catch {
      showSnack('Error al desvincular', 'error');
    }
    setUnlinkingDevice(false);
  };

  useEffect(() => {
    if (autoBackupChecked.current || !dataBackupEnabled) return;
    autoBackupChecked.current = true;
    const doAutoBackup = async () => {
      if (!lastBackupDate) { await createBackup(true); return; }
      const lastBackup = new Date(lastBackupDate);
      const now = new Date();
      let needs = false;
      switch (backupFrequency) {
        case 'daily':
          needs = lastBackup.getDate() !== now.getDate() || lastBackup.getMonth() !== now.getMonth() || lastBackup.getFullYear() !== now.getFullYear();
          break;
        case 'weekly': {
          const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
          needs = lastBackup < weekAgo;
          break;
        }
        case 'monthly':
          needs = lastBackup.getMonth() !== now.getMonth() || lastBackup.getFullYear() !== now.getFullYear();
          break;
        default:
          break;
      }
      if (needs) await createBackup(true);
    };
    doAutoBackup();
  }, [dataBackupEnabled, lastBackupDate, backupFrequency]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await updateDisplayName(nameValue.trim());
      await setDisplayNameInDb(nameValue.trim());
      setUserData({ ...(userData || {}), displayName: nameValue.trim() });
      showSnack('Nombre actualizado');
    } catch { showSnack('Error al guardar', 'error'); }
    setSavingName(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showSnack('Solo se aceptan imágenes', 'error'); return; }
    setUploadingPhoto(true);
    try {
      const downloadURL = await uploadProfilePhoto(file);
      await updatePhotoURL(downloadURL);
      setUserData({ ...(userData || {}), photoURL: downloadURL });
      showSnack('Foto actualizada');
    } catch { showSnack('Error al subir foto', 'error'); }
    setUploadingPhoto(false);
  };

  const handleDeleteNotif = async () => {
    if (!deleteNotifDialog || !user?.uid) return;
    setDeletingNotif(true);
    try {
      await removeReminder(user.uid, deleteNotifDialog);
      setNotifList((prev) => { const next = { ...prev }; delete next[deleteNotifDialog]; return next; });
      showSnack('Notificacion eliminada');
      setDeleteNotifDialog(null);
    } catch { showSnack('Error al eliminar', 'error'); }
    setDeletingNotif(false);
  };

  const createBackup = async (isAutomatic = false) => {
    if (isCreatingBackup) return;
    setIsCreatingBackup(true);
    try {
      const backupData = await getUserBackup();
      if (!backupData) { showSnack('No hay datos para backup', 'warning'); setIsCreatingBackup(false); return; }
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `backup_${dateString}_${timeString}.json`;
      const url = await uploadBackup(blob, fileName);
      const newLastBackup = now.toISOString();
      if (isAutomatic) {
        const configToSave = { ...userData?.config, lastBackupDate: newLastBackup };
        await setConfig(configToSave);
        setLastBackupDate(newLastBackup);
        showSnack('Backup automático creado');
      } else {
        const link = document.createElement('a');
        link.href = url; link.download = fileName;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        const configToSave = { ...userData?.config, lastBackupDate: newLastBackup };
        await setConfig(configToSave);
        setLastBackupDate(newLastBackup);
        showSnack('Backup descargado');
      }
    } catch { showSnack('Error al crear backup', 'error'); }
    setIsCreatingBackup(false);
  };

  const handleToggleBackup = async (val) => {
    setDataBackupEnabled(val);
    const configToSave = { ...userData?.config, dataBackupEnabled: val };
    await setConfig(configToSave);
  };

  const handleFrequencyChange = async (val) => {
    setBackupFrequency(val);
    const configToSave = { ...userData?.config, backupFrequency: val };
    await setConfig(configToSave);
  };

  const showSnack = (msg, severity = 'success') => setSnack(`${severity}:${msg}`);

  const notifEntries = Object.entries(notifList);

  return (
    <Layout title="Configuración">
      <AnimatedGroup sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* ── PERFIL ── */}
        <AnimatedItem>
        <SectionCard title="Perfil" icon={<PhotoCameraIcon sx={{ color: '#fff' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={photoURL || undefined} sx={{ width: 72, height: 72, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontSize: 28, fontWeight: 700 }}>
                {!photoURL && displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Box component="label" sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: 'primary.main', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}>
                {uploadingPhoto ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PhotoCameraIcon sx={{ fontSize: 14 }} />}
                <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              {displayName ? (
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }}>{displayName}</Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">{email}</Typography>
            </Box>
          </Box>
          {!displayName && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" value={nameValue} onChange={(e) => setNameValue(e.target.value)} fullWidth placeholder="Tu nombre" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Button variant="contained" onClick={handleSaveName} disabled={savingName || !nameValue.trim()}
              sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap', minWidth: 90 }}>
              {savingName ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Guardar'}
            </Button>
          </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              CUMPLEAÑOS
            </Typography>
            <TextField
              type="date"
              size="small"
              value={birthday ? `2000-${birthday.split('/')[1]}-${birthday.split('/')[0]}` : ''}
              onChange={(e) => {
                if (!e.target.value) return;
                const [, m, d] = e.target.value.split('-');
                const val = `${d}/${m}`;
                setBirthday(val);
                setConfig({ ...userData?.config, birthday: val });
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, maxWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </SectionCard>
        </AnimatedItem>

        {/* ── NOTIFICACIONES ── */}
        <AnimatedItem>
        <SectionCard title="Notificaciones" icon={<NotificationsActiveIcon sx={{ color: '#fff' }} />}>
          {deviceLinked ? (
            <Button fullWidth variant="contained" color="error" onClick={handleUnlinkDevice} disabled={unlinkingDevice}
              sx={{ borderRadius: 2, textTransform: 'none', py: 1.25, mb: 2 }}>
              Desincronizar
            </Button>
          ) : (
            <Button fullWidth variant="contained" onClick={handleLinkDevice} disabled={linkingDevice}
              startIcon={<NotificationsActiveIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', py: 1.25, mb: 2 }}>
              Vincular este dispositivo
            </Button>
          )}
          {notifEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              No hay notificaciones configuradas
            </Typography>
          ) : (
            notifEntries.map(([id, n]) => (
              <Card key={id} variant="outlined" sx={{ borderRadius: 2, p: 1.5, mb: 1, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{n.name}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                    {(n.days || []).sort().map((d) => (
                      <Chip key={d} label={DAYS_SHORT[d]} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600 }} />
                    ))}
                    <Chip label={
                      n.slot === 'morning' ? '09:00' : n.slot === 'midday' ? '12:00' : n.slot === 'evening' ? '18:00' : n.slot === 'night' ? '22:00' : n.slot
                    } size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                    "{n.title}"
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    → {MODULES[n.redirectTo] || n.redirectTo}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setDeleteNotifDialog(id)} sx={{ color: 'error.main', mt: -0.5, mr: -0.5 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Card>
            ))
          )}
          <Card variant="outlined" onClick={() => navigate('/nuevaNotificacion')}
            sx={{ borderRadius: 2, borderStyle: 'dashed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2, mt: notifEntries.length > 0 ? 0 : 0, color: 'text.secondary', '&:hover': { borderColor: 'primary.light', color: 'primary.light' } }}>
            <AddIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Nueva notificacion</Typography>
          </Card>
        </SectionCard>
        </AnimatedItem>

        {/* ── DATOS ── */}
        <AnimatedItem>
        <SectionCard title="Datos" icon={<BackupIcon sx={{ color: '#fff' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-backup</Typography>
              <Typography variant="caption" color="text.secondary">Copia automática de tus datos</Typography>
            </Box>
            <Switch checked={dataBackupEnabled} onChange={(e) => handleToggleBackup(e.target.checked)} />
          </Box>
          {dataBackupEnabled && (
            <FormControl size="small" sx={{ minWidth: 140, mb: 1.5 }}>
              <Select value={backupFrequency} onChange={(e) => handleFrequencyChange(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="daily">Diario</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button fullWidth variant="outlined" onClick={() => createBackup(false)} disabled={isCreatingBackup}
            startIcon={isCreatingBackup ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', mb: 2 }}>
            {isCreatingBackup ? 'Creando backup...' : 'Exportar backup ahora'}
          </Button>
        </SectionCard>
        </AnimatedItem>

        <Button
          fullWidth variant="outlined" size="large"
          onClick={() => navigate('/test-animacion')}
          startIcon={<PlayCircleIcon />}
          sx={{
            borderRadius: 3, py: 2,
            borderStyle: 'dashed', borderColor: 'divider',
            color: 'text.secondary', fontWeight: 700, textTransform: 'none',
            '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          }}
        >
          Probar animación de éxito
        </Button>

      </AnimatedGroup>

      <Dialog open={!!deleteNotifDialog} onClose={() => setDeleteNotifDialog(null)}>
        <DialogTitle>¿Eliminar notificación?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se eliminará "{notifList[deleteNotifDialog]?.name}". Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteNotifDialog(null)}>Cancelar</Button>
          <Button onClick={handleDeleteNotif} color="error" disabled={deletingNotif}>
            {deletingNotif ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.startsWith('error:') ? 'error' : snack.startsWith('warning:') ? 'warning' : 'success'}
          variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>
          {snack.replace(/^(error|warning|success):/, '')}
        </Alert>
      </Snackbar>

      <LoadingOverlay
        open={linkingDevice || unlinkingDevice}
        message={linkingDevice ? 'Sincronizando...' : 'Desvinculando...'}
      />
    </Layout>
  );
};

export default Configuracion;
