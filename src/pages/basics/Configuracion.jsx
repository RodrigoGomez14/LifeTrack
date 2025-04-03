import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Avatar, 
  IconButton, 
  Tabs, 
  Tab, 
  Stack, 
  Chip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AlertTitle,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStore } from '../../store';
import { database, auth, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';

// Iconos
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import PaletteIcon from '@mui/icons-material/Palette';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import { red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, grey, blueGrey } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

function Configuracion() {
  const theme = useTheme();
  const { userData, setUserData } = useStore();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para las diferentes secciones de configuración
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados para configuración de perfil
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  
  // Estados para configuración de tema
  const [primaryColor, setPrimaryColor] = useState(indigo[500]);
  const [secondaryColor, setSecondaryColor] = useState(teal[500]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('indigoTeal');
  
  // Estados para configuración de finanzas
  const [defaultCurrency, setDefaultCurrency] = useState('ARS');
  const [showCents, setShowCents] = useState(true);
  const [savingsGoal, setSavingsGoal] = useState(0);
  
  // Estados para configuración de notificaciones
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('weekly');
  
  // Estados para configuración de privacidad
  const [showSavingsOnDashboard, setShowSavingsOnDashboard] = useState(true);
  const [showFinancesInProfile, setShowFinancesInProfile] = useState(false);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupsList, setBackupsList] = useState([]);
  
  // Estados para seguridad
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Definición de temas predefinidos (mismos que en App.js)
  const predefinedThemes = {
    indigoTeal: {
      primary: indigo,
      secondary: teal,
      name: 'Índigo y Verde azulado'
    },
    purpleGreen: {
      primary: deepPurple,
      secondary: green,
      name: 'Púrpura y Verde'
    },
    blueAmber: {
      primary: blue,
      secondary: amber,
      name: 'Azul y Ámbar'
    },
    cyanOrange: {
      primary: cyan,
      secondary: orange,
      name: 'Cian y Naranja'
    },
    redLightBlue: {
      primary: red,
      secondary: lightBlue,
      name: 'Rojo y Azul claro'
    },
    brownTeal: {
      primary: brown,
      secondary: teal,
      name: 'Marrón y Verde azulado'
    },
    greenPink: {
      primary: green,
      secondary: pink,
      name: 'Verde y Rosa'
    },
    orangeBlue: {
      primary: deepOrange,
      secondary: blue,
      name: 'Naranja y Azul'
    }
  };
  
  // Cargar datos del usuario al inicio
  useEffect(() => {
    if (auth.currentUser) {
      setEmail(auth.currentUser.email || '');
      setDisplayName(auth.currentUser.displayName || '');
      setPhotoURL(auth.currentUser.photoURL || '');
      
      // Cargar información de las copias de seguridad
      loadBackupsInfo();
    }
    
    // Cargar configuraciones guardadas si existen
    if (userData && userData.config) {
      const config = userData.config;
      
      // Configuración de tema
      if (config.theme) {
        setPrimaryColor(config.theme.primaryColor || indigo[500]);
        setSecondaryColor(config.theme.secondaryColor || teal[500]);
        setDarkMode(config.theme.darkMode || false);
        setSelectedTheme(config.theme.selectedTheme || 'indigoTeal');
      }
      
      // Configuración de finanzas
      if (config.finances) {
        setDefaultCurrency(config.finances.defaultCurrency || 'ARS');
        setShowCents(config.finances.showCents !== undefined ? config.finances.showCents : true);
        setSavingsGoal(config.finances.savingsGoal || 0);
      }
      
      // Configuración de notificaciones
      if (config.notifications) {
        setEmailNotifications(config.notifications.email || false);
        setPushNotifications(config.notifications.push || false);
        setReminderFrequency(config.notifications.reminderFrequency || 'weekly');
      }
      
      // Configuración de privacidad
      if (config.privacy) {
        setShowSavingsOnDashboard(config.privacy.showSavingsOnDashboard !== undefined ? config.privacy.showSavingsOnDashboard : true);
        setShowFinancesInProfile(config.privacy.showFinancesInProfile || false);
        setDataBackupEnabled(config.privacy.dataBackupEnabled || false);
        setBackupFrequency(config.privacy.backupFrequency || 'daily');
        setLastBackupDate(config.privacy.lastBackupDate || null);
      }
      
      // Si las copias de seguridad automáticas están habilitadas, verificar si es necesario crear una nueva
      if (config.privacy && config.privacy.dataBackupEnabled) {
        checkAutoBackupNeeded();
      }
    }
  }, [userData]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Función para cambiar imagen de perfil
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      
      try {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`profileImages/${auth.currentUser.uid}/${file.name}`);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        
        // Actualizar URL de la foto en Firebase Auth
        await auth.currentUser.updateProfile({
          photoURL: downloadURL
        });
        
        setPhotoURL(downloadURL);
        setUploading(false);
        
        showSnackbar('Imagen de perfil actualizada correctamente', 'success');
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setUploading(false);
        showSnackbar('Error al subir la imagen', 'error');
      }
    }
  };
  
  // Función para aplicar el tema seleccionado
  const handleThemeSelect = async (themeKey) => {
    setSelectedTheme(themeKey);
    const theme = predefinedThemes[themeKey];
    setPrimaryColor(theme.primary[500]);
    setSecondaryColor(theme.secondary[500]);
    
    // Guardar cambios de tema inmediatamente
    try {
      // Configuración a guardar en la base de datos
      const themeConfig = {
        primaryColor: theme.primary[500],
        secondaryColor: theme.secondary[500],
        selectedTheme: themeKey,
        darkMode
      };
      
      // Guardar en Firebase Database
      await database.ref(`${auth.currentUser.uid}/config/theme`).update(themeConfig);
      
      // Actualizar estado local
      if (userData && userData.config) {
        setUserData({
          ...userData,
          config: {
            ...userData.config,
            theme: themeConfig
          }
        });
      }
      
      // Mostrar mensaje de éxito
      showSnackbar('Tema actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar el tema:', error);
      showSnackbar('Error al actualizar el tema', 'error');
    }
  };
  
  // Función para guardar solo el nombre de usuario
  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      showSnackbar('El nombre de usuario no puede estar vacío', 'error');
      return;
    }
    
    setSaving(true);
    
    try {
      // Actualizar perfil en Firebase Auth
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: displayName
        });
      }
      
      // Guardar displayName en Firebase Database para asegurar consistencia
      await database.ref(`${auth.currentUser.uid}/displayName`).set(displayName);
      
      // Actualizar estado local
      if (userData) {
        setUserData({
          ...userData,
          displayName: displayName
        });
      }
      
      setEditingName(false); // Desactivar modo edición
      setSaving(false);
      showSnackbar('Nombre de usuario actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar el nombre de usuario:', error);
      setSaving(false);
      showSnackbar('Error al actualizar el nombre de usuario', 'error');
    }
  };
  
  // Guardar configuraciones generales
  const handleSaveConfig = async () => {
    setSaving(true);
    
    try {
      // Actualizar perfil en Firebase Auth
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: displayName
        });
      }
      
      // Configuración a guardar en la base de datos
      const configToSave = {
        theme: {
          primaryColor,
          secondaryColor,
          darkMode,
          selectedTheme
        },
        finances: {
          defaultCurrency,
          showCents,
          savingsGoal
        },
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          reminderFrequency
        },
        privacy: {
          showSavingsOnDashboard,
          showFinancesInProfile,
          dataBackupEnabled,
          backupFrequency,
          lastBackupDate
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Guardar en Firebase Database
      await database.ref(`${auth.currentUser.uid}/config`).update(configToSave);
      
      // Guardar displayName en Firebase Database para asegurar consistencia
      await database.ref(`${auth.currentUser.uid}/displayName`).set(displayName);
      
      // Actualizar estado local (si ya hay configuración, solo actualizamos, sino, la creamos)
      if (userData) {
        setUserData({
          ...userData,
          config: userData.config ? { ...userData.config, ...configToSave } : configToSave,
          displayName: displayName // Actualizar también el displayName en el userData
        });
      } else {
        setUserData({
          config: configToSave,
          displayName: displayName
        });
      }
      
      setSaving(false);
      showSnackbar('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      setSaving(false);
      showSnackbar('Error al guardar la configuración', 'error');
    }
  };
  
  // Función para mostrar mensajes emergentes
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Componente de colores para selección de temas
  const ColorSelector = ({ title, value, onChange, colors }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" gutterBottom>{title}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {colors.map((color, index) => (
          <Box
            key={index}
            onClick={() => onChange(color)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: color,
              cursor: 'pointer',
              border: `2px solid ${value === color ? theme.palette.primary.main : 'transparent'}`,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
  
  // Componente para renderizar cada sección
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Perfil
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información de perfil
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={photoURL}
                      alt={displayName || email}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      {!photoURL && (displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase())}
                    </Avatar>
                    <input
                      accept="image/*"
                      id="profile-image-upload"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-image-upload">
                      <IconButton
                        aria-label="upload picture"
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 5,
                          right: 5,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark
                          }
                        }}
                        disabled={uploading}
                      >
                        {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
                      </IconButton>
                    </label>
                  </Box>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Haz clic en la cámara para cambiar tu imagen
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={9}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <TextField
                          fullWidth
                          label="Nombre de usuario"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          variant="outlined"
                          helperText="Tu nombre aparecerá en toda la aplicación"
                          disabled={!editingName}
                        />
                        <Button
                          variant="contained"
                          color={editingName ? "success" : "primary"}
                          onClick={editingName ? handleSaveDisplayName : () => setEditingName(true)}
                          disabled={saving}
                          sx={{ 
                            minWidth: '120px',
                            mt:-2.5,
                            height: '56px',
                            alignSelf: 'center'
                          }}
                        >
                          {editingName ? (
                            saving ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "Guardar"
                            )
                          ) : (
                            "Editar"
                          )}
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Correo electrónico"
                        value={email}
                        disabled
                        variant="outlined"
                        helperText="El correo electrónico no se puede cambiar"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/Perfil')}
                      >
                        Ver perfil completo
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
        
      case 1: // Tema
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personalización de tema
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              {/* Mensaje de bienvenida personalizado */}
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 'medium',
                  color: alpha(theme.palette.text.primary, 0.9),
                  mb: 3
                }}
              >
                {displayName ? `¡Hola ${displayName}! ` : ''}Personaliza la apariencia de tu aplicación seleccionando un tema que refleje tu estilo.
              </Typography>
              
              {/* Toggle para modo claro/oscuro */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  mb: 4, 
                  background: darkMode 
                    ? `linear-gradient(145deg, ${alpha('#121212', 0.8)} 0%, ${alpha('#272727', 0.9)} 100%)` 
                    : `linear-gradient(145deg, ${alpha('#f5f5f5', 0.8)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
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
                      <DarkModeIcon fontSize="large" sx={{ mr: 2, color: alpha('#fff', 0.7) }} />
                    ) : (
                      <LightModeIcon fontSize="large" sx={{ mr: 2, color: alpha('#000', 0.7) }} />
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ color: darkMode ? '#fff' : theme.palette.text.primary }}>
                        {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: darkMode ? alpha('#fff', 0.7) : theme.palette.text.secondary }}>
                        {darkMode ? 'Ideal para uso nocturno y menor fatiga visual' : 'Máxima legibilidad en entornos brillantes'}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    color="primary"
                    sx={{ 
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#fff',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: darkMode ? '#90caf9' : '#4dabf5',
                      },
                      transform: 'scale(1.2)'
                    }}
                  />
                </Stack>
              </Paper>
              
              {/* Selector de temas mejorado */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  mt: 4, 
                  display: 'flex', 
                  alignItems: 'center'
                }}
              >
                <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Selecciona un tema
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                  gap: 2.5,
                  mb: 4
                }}
              >
                {Object.keys(predefinedThemes).map((themeKey) => (
                  <Paper
                    key={themeKey}
                    elevation={selectedTheme === themeKey ? 8 : 1}
                    sx={{
                      overflow: 'hidden',
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: selectedTheme === themeKey ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      transition: 'all 0.2s ease-in-out',
                      transform: selectedTheme === themeKey ? 'scale(1.03)' : 'scale(1)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                    onClick={() => handleThemeSelect(themeKey)}
                  >
                    {/* Cabecera del tema con color primario */}
                    <Box sx={{
                      height: 80,
                      bgcolor: predefinedThemes[themeKey].primary[darkMode ? 800 : 500],
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      p: 1.5,
                      position: 'relative'
                    }}>
                      {/* Círculo con color secundario */}
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        bgcolor: predefinedThemes[themeKey].secondary[darkMode ? 700 : 400],
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        border: '2px solid rgba(255,255,255,0.4)'
                      }} />
                      
                      {/* Indicador de seleccionado */}
                      {selectedTheme === themeKey && (
                        <Chip 
                          label="Activo" 
                          size="small" 
                          color="secondary"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: 'rgba(255,255,255,0.85)',
                            color: predefinedThemes[themeKey].primary[700],
                            '& .MuiChip-label': { px: 1 },
                            position: 'absolute',
                            top: 10,
                            right: 10
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Información del tema */}
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={selectedTheme === themeKey ? 'bold' : 'medium'}>
                        {predefinedThemes[themeKey].name}
                      </Typography>
                      
                      {/* Vista previa del tema */}
                      <Box sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: darkMode ? alpha('#000', 0.15) : alpha('#f5f5f5', 0.7),
                        border: `1px solid ${darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`
                      }}>
                        <Box sx={{
                          height: 8,
                          width: '70%',
                          mb: 1,
                          bgcolor: predefinedThemes[themeKey].primary[darkMode ? 400 : 500],
                          borderRadius: 5
                        }} />
                        <Box sx={{
                          height: 6,
                          width: '100%',
                          mb: 1,
                          bgcolor: predefinedThemes[themeKey].secondary[darkMode ? 500 : 300],
                          borderRadius: 3
                        }} />
                        <Box sx={{
                          height: 6,
                          width: '40%',
                          bgcolor: predefinedThemes[themeKey].primary[darkMode ? 300 : 300],
                          borderRadius: 3
                        }} />
                      </Box>
                    </Box>
                    
                    {/* Botón de selección en la parte inferior */}
                    <Box sx={{
                      p: 1,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      bgcolor: darkMode ? alpha('#000', 0.1) : alpha('#f5f5f5', 0.3),
                      textAlign: 'center'
                    }}>
                      <Button 
                        variant={selectedTheme === themeKey ? 'contained' : 'text'}
                        size="small"
                        color={selectedTheme === themeKey ? 'primary' : 'inherit'}
                        sx={{ 
                          px: 2,
                          minWidth: 120,
                          ...(selectedTheme === themeKey ? {
                            bgcolor: predefinedThemes[themeKey].primary[darkMode ? 700 : 500]
                          } : {})
                        }}
                        onClick={() => handleThemeSelect(themeKey)}
                      >
                        {selectedTheme === themeKey ? 'Seleccionado' : 'Seleccionar'}
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
              
              <Box mt={4}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Typography variant="body2">
                    Los cambios de tema se aplican inmediatamente al seleccionar un tema. 
                    Los demás ajustes de configuración requieren guardar usando el botón al final de la página.
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Box>
        );
        
      case 2: // Finanzas
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de finanzas
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Moneda predeterminada</InputLabel>
                    <Select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      label="Moneda predeterminada"
                    >
                      <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                      <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showCents}
                        onChange={(e) => setShowCents(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Mostrar centavos en los montos"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Meta de ahorro mensual
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Slider
                      value={savingsGoal}
                      onChange={(e, newValue) => setSavingsGoal(newValue)}
                      min={0}
                      max={100000}
                      step={1000}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(Number(e.target.value))}
                      variant="outlined"
                      size="small"
                      type="number"
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: defaultCurrency === 'ARS' ? '$' : defaultCurrency === 'USD' ? 'US$' : '€'
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Categorías personalizadas
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Próximamente: Podrás crear tus propias categorías para tus finanzas.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
        
      case 3: // Notificaciones
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de notificaciones
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Canales de notificación</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Notificaciones por correo electrónico"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Notificaciones push"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>Frecuencia de recordatorios</Typography>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  label="Frecuencia"
                >
                  <MenuItem value="daily">Diaria</MenuItem>
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="never">Nunca</MenuItem>
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>Tipos de notificaciones</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Recordatorios de pagos de tarjetas"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Alertas de gastos excesivos"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Recordatorios de metas de ahorro"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
        
      case 4: // Privacidad
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de privacidad
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Visibilidad</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom>Copias de Seguridad</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                </Grid>
                
                {dataBackupEnabled && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Frecuencia de copias de seguridad</InputLabel>
                      <Select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        label="Frecuencia de copias de seguridad"
                      >
                        <MenuItem value="daily">Diaria</MenuItem>
                        <MenuItem value="weekly">Semanal</MenuItem>
                        <MenuItem value="monthly">Mensual</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {lastBackupDate && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Última copia de seguridad: {new Date(lastBackupDate).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Box mt={3}>
                <Button
                  variant="outlined"
                  startIcon={<BackupIcon />}
                  sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                  onClick={() => createBackup(false)}
                  disabled={isCreatingBackup}
                >
                  {isCreatingBackup ? 'Creando copia...' : 'Exportar mis datos'}
                </Button>
              </Box>
              
              {backupsList.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Historial de copias de seguridad
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                    <List dense>
                      {backupsList.map((backup, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <Box>
                              <IconButton 
                                edge="end" 
                                aria-label="restore" 
                                onClick={() => restoreFromBackup(backup.downloadUrl)}
                                title="Restaurar esta copia"
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                <RestoreIcon />
                              </IconButton>
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => deleteBackup(backup.path)}
                                title="Eliminar esta copia" 
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemIcon>
                            <SaveIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={backup.name.replace('backup_', '').replace('.json', '')}
                            secondary={`${new Date(backup.created).toLocaleString()} - ${(backup.size / 1024).toFixed(2)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Box>
        );
        
      case 5: // Seguridad (Nueva sección)
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Seguridad de la cuenta
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <KeyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Cambio de contraseña
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Te enviaremos un correo electrónico con instrucciones para cambiar tu contraseña.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<LockIcon />}
                  onClick={() => auth.sendPasswordResetEmail(auth.currentUser.email)}
                >
                  Cambiar contraseña
                </Button>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', display: 'flex', alignItems: 'center', color: theme.palette.error.main }}>
                  <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                  Zona de peligro
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Advertencia</AlertTitle>
                  Eliminar tu cuenta es una acción permanente. Todos tus datos, configuraciones y registros se eliminarán de forma definitiva.
                </Alert>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmDeleteAccount}
                      onChange={(e) => setConfirmDeleteAccount(e.target.checked)}
                      color="error"
                    />
                  }
                  label="Confirmo que quiero eliminar mi cuenta permanentemente"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                {confirmDeleteAccount && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Escribe tu correo electrónico para confirmar"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      variant="outlined"
                      color="error"
                      helperText={`Escribe "${email}" para confirmar`}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== email || saving}
                      fullWidth
                    >
                      {saving ? <CircularProgress size={24} color="inherit" /> : "Eliminar mi cuenta permanentemente"}
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Función para cargar la información de backups existentes
  const loadBackupsInfo = async () => {
    try {
      // Referencia a la carpeta de backups del usuario en Firebase Storage
      const backupsRef = storage.ref(`backups/${auth.currentUser.uid}`);
      
      // Obtener lista de archivos
      const result = await backupsRef.listAll();
      
      // Obtener metadatos de cada archivo
      const backups = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await item.getMetadata();
          return {
            name: item.name,
            path: item.fullPath,
            created: metadata.timeCreated,
            size: metadata.size,
            contentType: metadata.contentType,
            // Crear URL para descargar (temporal)
            downloadUrl: await item.getDownloadURL()
          };
        })
      );
      
      // Ordenar por fecha de creación (más reciente primero)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      setBackupsList(backups);
    } catch (error) {
      console.error('Error al cargar la lista de copias de seguridad:', error);
    }
  };
  
  // Función para verificar si es necesario crear una nueva copia de seguridad automática
  const checkAutoBackupNeeded = () => {
    if (!lastBackupDate) {
      // No hay copia de seguridad previa, crear una
      createBackup(true);
      return;
    }
    
    const lastBackup = new Date(lastBackupDate);
    const now = new Date();
    
    // Verificar si es necesario crear una nueva copia según la frecuencia
    let needsNewBackup = false;
    
    switch (backupFrequency) {
      case 'daily':
        // Si es un día diferente
        needsNewBackup = lastBackup.getDate() !== now.getDate() || 
                        lastBackup.getMonth() !== now.getMonth() ||
                        lastBackup.getFullYear() !== now.getFullYear();
        break;
      case 'weekly':
        // Si ha pasado al menos una semana
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        needsNewBackup = lastBackup < oneWeekAgo;
        break;
      case 'monthly':
        // Si es un mes diferente
        needsNewBackup = lastBackup.getMonth() !== now.getMonth() ||
                        lastBackup.getFullYear() !== now.getFullYear();
        break;
      default:
        break;
    }
    
    if (needsNewBackup) {
      createBackup(true);
    }
  };
  
  // Función para crear y guardar una copia de seguridad
  const createBackup = async (isAutomatic = false) => {
    if (isCreatingBackup) return;
    
    setIsCreatingBackup(true);
    
    try {
      // Obtener toda la base de datos del usuario
      const snapshot = await database.ref(auth.currentUser.uid).once('value');
      const userData = snapshot.val();
      
      if (!userData) {
        showSnackbar('No hay datos para crear una copia de seguridad', 'warning');
        setIsCreatingBackup(false);
        return;
      }
      
      // Convertir a formato JSON
      const jsonData = JSON.stringify(userData, null, 2);
      
      // Crear un blob con los datos
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Crear nombre para el archivo
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const fileName = `backup_${dateString}_${timeString}.json`;
      
      if (isAutomatic) {
        // Guardar en Firebase Storage
        const storageRef = storage.ref(`backups/${auth.currentUser.uid}/${fileName}`);
        await storageRef.put(blob);
        
        // Actualizar la fecha de la última copia de seguridad
        await database.ref(`${auth.currentUser.uid}/config/privacy`).update({
          lastBackupDate: now.toISOString()
        });
        
        setLastBackupDate(now.toISOString());
        
        // Actualizar listado de copias de seguridad
        loadBackupsInfo();
        
        showSnackbar('Copia de seguridad automática creada con éxito', 'success');
      } else {
        // Para backups manuales, también guardar en Storage pero además descargar
        const storageRef = storage.ref(`backups/${auth.currentUser.uid}/${fileName}`);
        await storageRef.put(blob);
        
        // Actualizar listado de copias de seguridad
        loadBackupsInfo();
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSnackbar('Copia de seguridad creada y descargada con éxito', 'success');
      }
    } catch (error) {
      console.error('Error al crear la copia de seguridad:', error);
      showSnackbar('Error al crear la copia de seguridad', 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };
  
  // Función para restaurar desde una copia de seguridad
  const restoreFromBackup = async (fileUrl) => {
    try {
      // Mostrar confirmación antes de restaurar
      if (!window.confirm('¿Estás seguro de que deseas restaurar desde esta copia de seguridad? Se sobrescribirán todos tus datos actuales.')) {
        return;
      }
      
      setSaving(true);
      
      // Descargar el archivo de la copia de seguridad
      const response = await fetch(fileUrl);
      const backupData = await response.json();
      
      // Restaurar los datos en Firebase
      await database.ref(auth.currentUser.uid).set(backupData);
      
      setSaving(false);
      showSnackbar('Datos restaurados con éxito. Actualizando...', 'success');
      
      // Recargar la página después de un breve retraso
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error al restaurar desde la copia de seguridad:', error);
      showSnackbar('Error al restaurar desde la copia de seguridad', 'error');
      setSaving(false);
    }
  };
  
  // Función para eliminar una copia de seguridad
  const deleteBackup = async (backupPath) => {
    try {
      if (!window.confirm('¿Estás seguro de que deseas eliminar esta copia de seguridad?')) {
        return;
      }
      
      // Eliminar el archivo de Firebase Storage
      const fileRef = storage.ref(backupPath);
      await fileRef.delete();
      
      // Actualizar la lista de copias de seguridad
      loadBackupsInfo();
      
      showSnackbar('Copia de seguridad eliminada con éxito', 'success');
    } catch (error) {
      console.error('Error al eliminar la copia de seguridad:', error);
      showSnackbar('Error al eliminar la copia de seguridad', 'error');
    }
  };
  
  // Función para eliminar la cuenta de usuario
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== email) {
      showSnackbar('Por favor, escribe tu correo electrónico correctamente para confirmar', 'error');
      return;
    }
    
    try {
      if (window.confirm('¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.')) {
        setSaving(true);
        
        // Eliminamos los datos del usuario en la base de datos
        await database.ref(auth.currentUser.uid).remove();
        
        // Eliminamos la cuenta de Firebase Auth
        await auth.currentUser.delete();
        
        showSnackbar('Tu cuenta ha sido eliminada correctamente', 'success');
        
        // Redirigir al login después de un breve retraso
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        showSnackbar('Por seguridad, debes volver a iniciar sesión antes de eliminar tu cuenta', 'error');
        setTimeout(() => {
          auth.signOut().then(() => navigate('/'));
        }, 2000);
      } else {
        showSnackbar('Error al eliminar la cuenta: ' + error.message, 'error');
      }
      
      setSaving(false);
    }
  };
  
  return (
    <Layout title="Configuración">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3, 
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <SettingsIcon fontSize="large" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Configuración de la aplicación
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Personaliza tu experiencia y gestiona tus preferencias
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Grid container spacing={3}>
          {/* Barra lateral con pestañas */}
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Tabs
                orientation={isMobile ? "horizontal" : "vertical"}
                variant={isMobile ? "scrollable" : "standard"}
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderRight: isMobile ? 0 : 1,
                  borderBottom: isMobile ? 1 : 0,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 60,
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    pl: 3,
                    pr: isMobile ? 3 : 10
                  }
                }}
              >
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2 }} />
                      <Typography>Perfil</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PaletteIcon sx={{ mr: 2 }} />
                      <Typography>Tema</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceWalletIcon sx={{ mr: 2 }} />
                      <Typography>Finanzas</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotificationsIcon sx={{ mr: 2 }} />
                      <Typography>Notificaciones</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ mr: 2 }} />
                      <Typography>Privacidad</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
                <Tab 
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShieldIcon sx={{ mr: 2 }} />
                      <Typography>Seguridad</Typography>
                    </Box>
                  }
                  sx={{ justifyContent: 'flex-start' }}
                />
              </Tabs>
            </Paper>
          </Grid>
          
          {/* Contenido principal */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              {renderTabContent()}
            </Box>
            
            {/* Botón de guardar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                onClick={handleSaveConfig}
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default Configuracion; 