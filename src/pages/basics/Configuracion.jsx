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
  Checkbox,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip
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
import SecurityIcon from '@mui/icons-material/Security';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudIcon from '@mui/icons-material/Cloud';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HelpIcon from '@mui/icons-material/Help';
import UpdateIcon from '@mui/icons-material/Update';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import { red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, grey, blueGrey } from '@mui/material/colors';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [website, setWebsite] = useState('');
  
  // Estados para configuración de tema
  const [primaryColor, setPrimaryColor] = useState(indigo[500]);
  const [secondaryColor, setSecondaryColor] = useState(teal[500]);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('indigoTeal');
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  
  // Estados para configuración de finanzas
  const [defaultCurrency, setDefaultCurrency] = useState('ARS');
  const [showCents, setShowCents] = useState(true);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [autoCategorizationEnabled, setAutoCategorizationEnabled] = useState(true);
  const [roundingEnabled, setRoundingEnabled] = useState(false);
  const [multiCurrencyEnabled, setMultiCurrencyEnabled] = useState(false);
  const [taxCalculationEnabled, setTaxCalculationEnabled] = useState(false);
  
  // Estados para configuración de notificaciones
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('weekly');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [weekendNotifications, setWeekendNotifications] = useState(true);
  const [notificationSound, setNotificationSound] = useState('default');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Estados para configuración de privacidad
  const [showSavingsOnDashboard, setShowSavingsOnDashboard] = useState(true);
  const [showFinancesInProfile, setShowFinancesInProfile] = useState(false);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupsList, setBackupsList] = useState([]);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReportingEnabled, setCrashReportingEnabled] = useState(true);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(false);
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState('forever');
  const [shareDataForImprovements, setShareDataForImprovements] = useState(false);
  
  // Estados para configuración de seguridad
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [deviceManagement, setDeviceManagement] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('medium');
  
  // Estados para configuración de accesibilidad
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabled] = useState(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);
  const [colorBlindnessSupport, setColorBlindnessSupport] = useState('none');
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  
  // Estados para configuración de rendimiento
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState('realtime');
  const [imageQuality, setImageQuality] = useState('high');
  const [preloadData, setPreloadData] = useState(true);
  
  // Estados para configuración de idioma
  const [language, setLanguage] = useState('es');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [numberFormat, setNumberFormat] = useState('1.234,56');
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires');
  
  // Definición de temas predefinidos
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
      
      loadBackupsInfo();
    }
    
    if (userData && userData.config) {
      const config = userData.config;
      
      // Cargar configuración de perfil
      if (config.profile) {
        setPhoneNumber(config.profile.phoneNumber || '');
        setLocation(config.profile.location || '');
        setBirthDate(config.profile.birthDate || '');
        setBio(config.profile.bio || '');
        setProfession(config.profile.profession || '');
        setWebsite(config.profile.website || '');
      }
      
      // Cargar configuración de tema
      if (config.theme) {
        setPrimaryColor(config.theme.primaryColor || indigo[500]);
        setSecondaryColor(config.theme.secondaryColor || teal[500]);
        setDarkMode(config.theme.darkMode || false);
        setSelectedTheme(config.theme.selectedTheme || 'indigoTeal');
        setFontSize(config.theme.fontSize || 'medium');
        setCompactMode(config.theme.compactMode || false);
        setAnimationsEnabled(config.theme.animationsEnabled !== undefined ? config.theme.animationsEnabled : true);
        setHighContrast(config.theme.highContrast || false);
      }
      
      // Cargar configuración de finanzas
      if (config.finances) {
        setDefaultCurrency(config.finances.defaultCurrency || 'ARS');
        setShowCents(config.finances.showCents !== undefined ? config.finances.showCents : true);
        setSavingsGoal(config.finances.savingsGoal || 0);
        setBudgetPeriod(config.finances.budgetPeriod || 'monthly');
        setExpenseCategories(config.finances.expenseCategories || []);
        setIncomeCategories(config.finances.incomeCategories || []);
        setAutoCategorizationEnabled(config.finances.autoCategorizationEnabled !== undefined ? config.finances.autoCategorizationEnabled : true);
        setRoundingEnabled(config.finances.roundingEnabled || false);
        setMultiCurrencyEnabled(config.finances.multiCurrencyEnabled || false);
        setTaxCalculationEnabled(config.finances.taxCalculationEnabled || false);
      }
      
      // Cargar configuración de notificaciones
      if (config.notifications) {
        setEmailNotifications(config.notifications.email || false);
        setPushNotifications(config.notifications.push || false);
        setSmsNotifications(config.notifications.sms || false);
        setReminderFrequency(config.notifications.reminderFrequency || 'weekly');
        setQuietHoursEnabled(config.notifications.quietHoursEnabled || false);
        setQuietHoursStart(config.notifications.quietHoursStart || '22:00');
        setQuietHoursEnd(config.notifications.quietHoursEnd || '08:00');
        setWeekendNotifications(config.notifications.weekendNotifications !== undefined ? config.notifications.weekendNotifications : true);
        setNotificationSound(config.notifications.notificationSound || 'default');
        setVibrationEnabled(config.notifications.vibrationEnabled !== undefined ? config.notifications.vibrationEnabled : true);
      }
      
      // Cargar configuración de privacidad
      if (config.privacy) {
        setShowSavingsOnDashboard(config.privacy.showSavingsOnDashboard !== undefined ? config.privacy.showSavingsOnDashboard : true);
        setShowFinancesInProfile(config.privacy.showFinancesInProfile || false);
        setDataBackupEnabled(config.privacy.dataBackupEnabled || false);
        setBackupFrequency(config.privacy.backupFrequency || 'daily');
        setLastBackupDate(config.privacy.lastBackupDate || null);
        setAnalyticsEnabled(config.privacy.analyticsEnabled !== undefined ? config.privacy.analyticsEnabled : true);
        setCrashReportingEnabled(config.privacy.crashReportingEnabled !== undefined ? config.privacy.crashReportingEnabled : true);
        setLocationTrackingEnabled(config.privacy.locationTrackingEnabled || false);
        setDataRetentionPeriod(config.privacy.dataRetentionPeriod || 'forever');
        setShareDataForImprovements(config.privacy.shareDataForImprovements || false);
      }
      
      // Cargar configuración de seguridad
      if (config.security) {
        setTwoFactorEnabled(config.security.twoFactorEnabled || false);
        setBiometricEnabled(config.security.biometricEnabled || false);
        setSessionTimeout(config.security.sessionTimeout || '30');
        setLoginNotifications(config.security.loginNotifications !== undefined ? config.security.loginNotifications : true);
        setPasswordStrength(config.security.passwordStrength || 'medium');
      }
      
      // Cargar configuración de accesibilidad
      if (config.accessibility) {
        setScreenReaderEnabled(config.accessibility.screenReaderEnabled || false);
        setKeyboardNavigationEnabled(config.accessibility.keyboardNavigationEnabled || false);
        setReducedMotionEnabled(config.accessibility.reducedMotionEnabled || false);
        setColorBlindnessSupport(config.accessibility.colorBlindnessSupport || 'none');
        setVoiceControlEnabled(config.accessibility.voiceControlEnabled || false);
      }
      
      // Cargar configuración de rendimiento
      if (config.performance) {
        setCacheEnabled(config.performance.cacheEnabled !== undefined ? config.performance.cacheEnabled : true);
        setOfflineModeEnabled(config.performance.offlineModeEnabled || false);
        setSyncFrequency(config.performance.syncFrequency || 'realtime');
        setImageQuality(config.performance.imageQuality || 'high');
        setPreloadData(config.performance.preloadData !== undefined ? config.performance.preloadData : true);
      }
      
      // Cargar configuración de idioma
      if (config.language) {
        setLanguage(config.language.language || 'es');
        setDateFormat(config.language.dateFormat || 'DD/MM/YYYY');
        setTimeFormat(config.language.timeFormat || '24h');
        setNumberFormat(config.language.numberFormat || '1.234,56');
        setTimezone(config.language.timezone || 'America/Argentina/Buenos_Aires');
      }
      
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
    
    try {
      const themeConfig = {
        primaryColor: theme.primary[500],
        secondaryColor: theme.secondary[500],
        selectedTheme: themeKey,
        darkMode,
        fontSize,
        compactMode,
        animationsEnabled,
        highContrast
      };
      
      await database.ref(`${auth.currentUser.uid}/config/theme`).update(themeConfig);
      
      if (userData && userData.config) {
        setUserData({
          ...userData,
          config: {
            ...userData.config,
            theme: themeConfig
          }
        });
      }
      
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
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: displayName
        });
      }
      
      await database.ref(`${auth.currentUser.uid}/displayName`).set(displayName);
      
      if (userData) {
        setUserData({
          ...userData,
          displayName: displayName
        });
      }
      
      setEditingName(false);
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
      if (auth.currentUser) {
        await auth.currentUser.updateProfile({
          displayName: displayName
        });
      }
      
      const configToSave = {
        profile: {
          phoneNumber,
          location,
          birthDate,
          bio,
          profession,
          website
        },
        theme: {
          primaryColor,
          secondaryColor,
          darkMode,
          selectedTheme,
          fontSize,
          compactMode,
          animationsEnabled,
          highContrast
        },
        finances: {
          defaultCurrency,
          showCents,
          savingsGoal,
          budgetPeriod,
          expenseCategories,
          incomeCategories,
          autoCategorizationEnabled,
          roundingEnabled,
          multiCurrencyEnabled,
          taxCalculationEnabled
        },
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          sms: smsNotifications,
          reminderFrequency,
          quietHoursEnabled,
          quietHoursStart,
          quietHoursEnd,
          weekendNotifications,
          notificationSound,
          vibrationEnabled
        },
        privacy: {
          showSavingsOnDashboard,
          showFinancesInProfile,
          dataBackupEnabled,
          backupFrequency,
          lastBackupDate,
          analyticsEnabled,
          crashReportingEnabled,
          locationTrackingEnabled,
          dataRetentionPeriod,
          shareDataForImprovements
        },
        security: {
          twoFactorEnabled,
          biometricEnabled,
          sessionTimeout,
          loginNotifications,
          passwordStrength
        },
        accessibility: {
          screenReaderEnabled,
          keyboardNavigationEnabled,
          reducedMotionEnabled,
          colorBlindnessSupport,
          voiceControlEnabled
        },
        performance: {
          cacheEnabled,
          offlineModeEnabled,
          syncFrequency,
          imageQuality,
          preloadData
        },
        language: {
          language,
          dateFormat,
          timeFormat,
          numberFormat,
          timezone
        },
        lastUpdated: new Date().toISOString()
      };
      
      await database.ref(`${auth.currentUser.uid}/config`).update(configToSave);
      await database.ref(`${auth.currentUser.uid}/displayName`).set(displayName);
      
      if (userData) {
        setUserData({
          ...userData,
          config: userData.config ? { ...userData.config, ...configToSave } : configToSave,
          displayName: displayName
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
  
  // Componente para renderizar cada sección
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Perfil
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Información de perfil
              </Typography>
              
              <Grid container spacing={4}>
                {/* Sección de imagen de perfil */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={photoURL}
                      alt={displayName || email}
                      sx={{
                        width: 100,
                        height: 100,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`
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
                          bottom: -5,
                          right: -5,
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark
                          }
                        }}
                        disabled={uploading}
                      >
                        {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
                      </IconButton>
                    </label>
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Haz clic en la cámara para cambiar tu imagen
                  </Typography>
                </Grid>
                
                {/* Información básica */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Nombre de usuario
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          variant="outlined"
                          disabled={!editingName}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                        <Button
                          variant={editingName ? "contained" : "outlined"}
                          onClick={editingName ? handleSaveDisplayName : () => setEditingName(true)}
                          disabled={saving}
                          sx={{ 
                            minWidth: 100,
                            borderRadius: 2
                          }}
                        >
                          {editingName ? (
                            saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"
                          ) : (
                            <>
                              <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Editar
                            </>
                          )}
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Correo electrónico
                      </Typography>
                      <TextField
                        fullWidth
                        value={email}
                        disabled
                        variant="outlined"
                        size="small"
                        helperText="El correo electrónico no se puede cambiar"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>
                
                {/* Información adicional */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                    Información adicional
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Número de teléfono"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ubicación"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Fecha de nacimiento"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Profesión"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sitio web"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        variant="outlined"
                        size="small"
                        placeholder="https://..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Biografía"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={3}
                        placeholder="Cuéntanos un poco sobre ti..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
        
      case 1: // Tema y Apariencia
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Tema y apariencia
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  color: alpha(theme.palette.text.primary, 0.8),
                  mb: 4
                }}
              >
                {displayName ? `¡Hola ${displayName}! ` : ''}Personaliza la apariencia de tu aplicación seleccionando un tema que refleje tu estilo.
              </Typography>
              
              {/* Modo claro/oscuro */}
              <Card 
                elevation={0}
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 3
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
                    onChange={(e) => setDarkMode(e.target.checked)}
                    color="primary"
                    size="medium"
                  />
                </Stack>
              </Card>
              
              {/* Selector de temas */}
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Selecciona un tema
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                  gap: 2,
                  mb: 4
                }}
              >
                {Object.keys(predefinedThemes).map((themeKey) => (
                  <Card
                    key={themeKey}
                    elevation={selectedTheme === themeKey ? 4 : 1}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: selectedTheme === themeKey ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      transition: 'all 0.2s ease-in-out',
                      transform: selectedTheme === themeKey ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: theme.shadows[6],
                      }
                    }}
                    onClick={() => handleThemeSelect(themeKey)}
                  >
                    <Box sx={{
                      height: 60,
                      bgcolor: predefinedThemes[themeKey].primary[500],
                      borderRadius: '12px 12px 0 0',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: predefinedThemes[themeKey].secondary[400],
                        border: '2px solid rgba(255,255,255,0.3)'
                      }} />
                      
                      {selectedTheme === themeKey && (
                        <CheckCircleIcon 
                          sx={{ 
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                            fontSize: 20
                          }}
                        />
                      )}
                    </Box>
                    
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight={selectedTheme === themeKey ? 600 : 400}>
                        {predefinedThemes[themeKey].name}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              {/* Configuraciones adicionales de apariencia */}
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
                Configuraciones adicionales
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Tamaño de fuente
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="small">Pequeña</MenuItem>
                      <MenuItem value="medium">Mediana</MenuItem>
                      <MenuItem value="large">Grande</MenuItem>
                      <MenuItem value="extra-large">Extra grande</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={compactMode}
                          onChange={(e) => setCompactMode(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Modo compacto"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={animationsEnabled}
                          onChange={(e) => setAnimationsEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Animaciones habilitadas"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Alto contraste"
                    />
                  </Stack>
                </Grid>
              </Grid>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                Los cambios de tema se aplican inmediatamente al seleccionar un tema.
              </Alert>
            </CardContent>
          </Card>
        );
        
      case 2: // Finanzas
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Configuración de finanzas
              </Typography>
              
              {/* Configuración básica */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Configuración básica
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Moneda predeterminada
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                      <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR)</MenuItem>
                      <MenuItem value="GBP">Libra Esterlina (GBP)</MenuItem>
                      <MenuItem value="JPY">Yen Japonés (JPY)</MenuItem>
                      <MenuItem value="CAD">Dólar Canadiense (CAD)</MenuItem>
                      <MenuItem value="AUD">Dólar Australiano (AUD)</MenuItem>
                      <MenuItem value="CHF">Franco Suizo (CHF)</MenuItem>
                      <MenuItem value="CNY">Yuan Chino (CNY)</MenuItem>
                      <MenuItem value="BRL">Real Brasileño (BRL)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Período de presupuesto
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={budgetPeriod}
                      onChange={(e) => setBudgetPeriod(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                      <MenuItem value="quarterly">Trimestral</MenuItem>
                      <MenuItem value="yearly">Anual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* Opciones de visualización */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Opciones de visualización
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
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
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roundingEnabled}
                        onChange={(e) => setRoundingEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Redondear montos automáticamente"
                  />
                </Grid>
              </Grid>
              
              {/* Meta de ahorro */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Meta de ahorro mensual
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Slider
                  value={savingsGoal}
                  onChange={(e, newValue) => setSavingsGoal(newValue)}
                  min={0}
                  max={100000}
                  step={1000}
                  sx={{ flex: 1 }}
                  color="primary"
                />
                <TextField
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Number(e.target.value))}
                  variant="outlined"
                  size="small"
                  type="number"
                  sx={{ 
                    width: 140,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  InputProps={{
                    startAdornment: defaultCurrency === 'ARS' ? '$' : defaultCurrency === 'USD' ? 'US$' : '€'
                  }}
                />
              </Box>
              
              {/* Funciones avanzadas */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Funciones avanzadas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoCategorizationEnabled}
                        onChange={(e) => setAutoCategorizationEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Categorización automática de gastos"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={multiCurrencyEnabled}
                        onChange={(e) => setMultiCurrencyEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Soporte para múltiples monedas"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={taxCalculationEnabled}
                        onChange={(e) => setTaxCalculationEnabled(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Cálculo automático de impuestos"
                  />
                </Grid>
              </Grid>
              
              {/* Categorías personalizadas */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Categorías personalizadas
              </Typography>
              
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  Próximamente: Podrás crear y gestionar tus propias categorías de ingresos y gastos.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        );
        
      case 3: // Notificaciones
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Configuración de notificaciones
              </Typography>
              
              {/* Canales de notificación */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Canales de notificación
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Email</Typography>
                      </Box>
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">Push</Typography>
                      </Box>
                      <Switch
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">SMS</Typography>
                      </Box>
                      <Switch
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Configuración de recordatorios */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Recordatorios
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Frecuencia de recordatorios
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="daily">Diaria</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                      <MenuItem value="never">Nunca</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                    Sonido de notificación
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={notificationSound}
                      onChange={(e) => setNotificationSound(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="default">Predeterminado</MenuItem>
                      <MenuItem value="chime">Campanilla</MenuItem>
                      <MenuItem value="bell">Campana</MenuItem>
                      <MenuItem value="notification">Notificación</MenuItem>
                      <MenuItem value="none">Silencioso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* Horarios silenciosos */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Horarios silenciosos
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Habilitar horarios silenciosos"
                sx={{ mb: 2 }}
              />
              
              {quietHoursEnabled && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hora de inicio"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hora de fin"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
              
              {/* Configuraciones adicionales */}
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Configuraciones adicionales
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={weekendNotifications}
                      onChange={(e) => setWeekendNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Recibir notificaciones los fines de semana"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={vibrationEnabled}
                      onChange={(e) => setVibrationEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Vibración en dispositivos móviles"
                />
              </Stack>
              
              {/* Tipos de notificaciones */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Tipos de notificaciones
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Recordatorios de pagos de tarjetas"
                />
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Alertas de gastos excesivos"
                />
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Recordatorios de metas de ahorro"
                />
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Notificaciones de nuevos ingresos"
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Resúmenes financieros semanales"
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Consejos y recomendaciones"
                />
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 4: // Privacidad y Datos
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
                
                {/* Recopilación de datos */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Recopilación de datos
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={analyticsEnabled}
                          onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Permitir análisis de uso para mejorar la aplicación"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={crashReportingEnabled}
                          onChange={(e) => setCrashReportingEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enviar informes de errores automáticamente"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={locationTrackingEnabled}
                          onChange={(e) => setLocationTrackingEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Permitir seguimiento de ubicación para gastos"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={shareDataForImprovements}
                          onChange={(e) => setShareDataForImprovements(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Compartir datos anónimos para mejoras del producto"
                    />
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Retención de datos */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Retención de datos
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Período de retención</InputLabel>
                    <Select
                      value={dataRetentionPeriod}
                      onChange={(e) => setDataRetentionPeriod(e.target.value)}
                      label="Período de retención"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="1year">1 año</MenuItem>
                      <MenuItem value="2years">2 años</MenuItem>
                      <MenuItem value="5years">5 años</MenuItem>
                      <MenuItem value="forever">Para siempre</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Los datos se eliminarán automáticamente después del período seleccionado
                  </Typography>
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
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 5: // Seguridad
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Seguridad de la cuenta
              </Typography>
              
              <Stack spacing={4}>
                {/* Autenticación */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    <KeyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Autenticación
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" paragraph color="text.secondary">
                        Te enviaremos un correo electrónico con instrucciones para cambiar tu contraseña.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LockIcon />}
                        onClick={() => auth.sendPasswordResetEmail(auth.currentUser.email)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cambiar contraseña
                      </Button>
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Autenticación de dos factores (2FA)"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={biometricEnabled}
                          onChange={(e) => setBiometricEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Autenticación biométrica (huella/rostro)"
                    />
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Sesiones */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Gestión de sesiones
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Tiempo de espera de sesión
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="15">15 minutos</MenuItem>
                          <MenuItem value="30">30 minutos</MenuItem>
                          <MenuItem value="60">1 hora</MenuItem>
                          <MenuItem value="240">4 horas</MenuItem>
                          <MenuItem value="never">Nunca</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={loginNotifications}
                            onChange={(e) => setLoginNotifications(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notificar inicios de sesión"
                        sx={{ mt: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Fortaleza de contraseña */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Requisitos de contraseña
                  </Typography>
                  
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Nivel de seguridad requerido</FormLabel>
                    <RadioGroup
                      value={passwordStrength}
                      onChange={(e) => setPasswordStrength(e.target.value)}
                      sx={{ mt: 1 }}
                    >
                      <FormControlLabel value="low" control={<Radio />} label="Básico (mínimo 6 caracteres)" />
                      <FormControlLabel value="medium" control={<Radio />} label="Medio (8+ caracteres, números y letras)" />
                      <FormControlLabel value="high" control={<Radio />} label="Alto (12+ caracteres, números, letras y símbolos)" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 6: // Accesibilidad
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Accesibilidad
              </Typography>
              
              <Typography variant="body1" paragraph color="text.secondary">
                Configuraciones para hacer la aplicación más accesible para todos los usuarios.
              </Typography>
              
              <Stack spacing={4}>
                {/* Asistencia visual */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Asistencia visual
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={screenReaderEnabled}
                          onChange={(e) => setScreenReaderEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Optimización para lectores de pantalla"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reducedMotionEnabled}
                          onChange={(e) => setReducedMotionEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Reducir animaciones y movimiento"
                    />
                  </Stack>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Soporte para daltonismo
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value={colorBlindnessSupport}
                        onChange={(e) => setColorBlindnessSupport(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="none">Ninguno</MenuItem>
                        <MenuItem value="protanopia">Protanopia (rojo-verde)</MenuItem>
                        <MenuItem value="deuteranopia">Deuteranopia (rojo-verde)</MenuItem>
                        <MenuItem value="tritanopia">Tritanopia (azul-amarillo)</MenuItem>
                        <MenuItem value="monochromacy">Monocromatismo</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <Divider />
                
                {/* Navegación */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Navegación
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={keyboardNavigationEnabled}
                          onChange={(e) => setKeyboardNavigationEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Navegación mejorada por teclado"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={voiceControlEnabled}
                          onChange={(e) => setVoiceControlEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Control por voz (experimental)"
                    />
                  </Stack>
                </Box>
                
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    Estas configuraciones pueden requerir reiniciar la aplicación para aplicarse completamente.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 7: // Rendimiento
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Rendimiento y sincronización
              </Typography>
              
              <Stack spacing={4}>
                {/* Caché y almacenamiento */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Caché y almacenamiento
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={cacheEnabled}
                          onChange={(e) => setCacheEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Habilitar caché para mejor rendimiento"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={offlineModeEnabled}
                          onChange={(e) => setOfflineModeEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Modo sin conexión"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preloadData}
                          onChange={(e) => setPreloadData(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Precargar datos para acceso rápido"
                    />
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Sincronización */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Sincronización
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Frecuencia de sincronización
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={syncFrequency}
                          onChange={(e) => setSyncFrequency(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="realtime">Tiempo real</MenuItem>
                          <MenuItem value="5min">Cada 5 minutos</MenuItem>
                          <MenuItem value="15min">Cada 15 minutos</MenuItem>
                          <MenuItem value="30min">Cada 30 minutos</MenuItem>
                          <MenuItem value="1hour">Cada hora</MenuItem>
                          <MenuItem value="manual">Manual</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Calidad de imagen
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={imageQuality}
                          onChange={(e) => setImageQuality(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="low">Baja (menor uso de datos)</MenuItem>
                          <MenuItem value="medium">Media</MenuItem>
                          <MenuItem value="high">Alta</MenuItem>
                          <MenuItem value="original">Original</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Acciones de limpieza */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Mantenimiento
                  </Typography>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Limpiar caché
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SyncIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Forzar sincronización
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<StorageIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Ver uso de almacenamiento
                    </Button>
                  </Stack>
                </Box>
                
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    Cambiar estas configuraciones puede afectar el rendimiento y el uso de datos de la aplicación.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 8: // Idioma y Región
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Idioma y región
              </Typography>
              
              <Stack spacing={4}>
                {/* Idioma */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Idioma de la aplicación
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      sx={{ borderRadius: 2 }}
                      startAdornment={<LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="pt">Português</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="de">Deutsch</MenuItem>
                      <MenuItem value="it">Italiano</MenuItem>
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="ko">한국어</MenuItem>
                      <MenuItem value="zh">中文</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Divider />
                
                {/* Formatos */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Formatos regionales
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Formato de fecha
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                          <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                          <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Formato de hora
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={timeFormat}
                          onChange={(e) => setTimeFormat(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="24h">24 horas (14:30)</MenuItem>
                          <MenuItem value="12h">12 horas (2:30 PM)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Formato de números
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={numberFormat}
                          onChange={(e) => setNumberFormat(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="1.234,56">1.234,56 (Europeo)</MenuItem>
                          <MenuItem value="1,234.56">1,234.56 (Americano)</MenuItem>
                          <MenuItem value="1 234,56">1 234,56 (Francés)</MenuItem>
                          <MenuItem value="1'234.56">1'234.56 (Suizo)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                        Zona horaria
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</MenuItem>
                          <MenuItem value="America/New_York">Nueva York (GMT-5)</MenuItem>
                          <MenuItem value="America/Los_Angeles">Los Ángeles (GMT-8)</MenuItem>
                          <MenuItem value="Europe/Madrid">Madrid (GMT+1)</MenuItem>
                          <MenuItem value="Europe/London">Londres (GMT+0)</MenuItem>
                          <MenuItem value="Asia/Tokyo">Tokio (GMT+9)</MenuItem>
                          <MenuItem value="Australia/Sydney">Sídney (GMT+10)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    Los cambios de idioma requieren recargar la aplicación para aplicarse completamente.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        );
        
      case 9: // Ayuda y Soporte
        return (
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Ayuda y soporte
              </Typography>
              
              <Stack spacing={4}>
                {/* Recursos de ayuda */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Recursos de ayuda
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <HelpIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={500}>
                              Centro de ayuda
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Guías y tutoriales
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <FeedbackIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={500}>
                              Enviar comentarios
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Comparte tu opinión
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={4}>
                      <Card elevation={0} sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <BugReportIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={500}>
                              Reportar error
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Informa problemas
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider />
                
                {/* Información de la aplicación */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Información de la aplicación
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Versión</Typography>
                      <Typography variant="body2">1.0.0</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Última actualización</Typography>
                      <Typography variant="body2">15 de Enero, 2024</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  // Funciones auxiliares (mantengo las existentes pero simplificadas)
  const loadBackupsInfo = async () => {
    try {
      const backupsRef = storage.ref(`backups/${auth.currentUser.uid}`);
      const result = await backupsRef.listAll();
      
      const backups = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await item.getMetadata();
          return {
            name: item.name,
            path: item.fullPath,
            created: metadata.timeCreated,
            size: metadata.size,
            contentType: metadata.contentType,
            downloadUrl: await item.getDownloadURL()
          };
        })
      );
      
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      setBackupsList(backups);
    } catch (error) {
      console.error('Error al cargar la lista de copias de seguridad:', error);
    }
  };
  
  const checkAutoBackupNeeded = () => {
    if (!lastBackupDate) {
      createBackup(true);
      return;
    }
    
    const lastBackup = new Date(lastBackupDate);
    const now = new Date();
    let needsNewBackup = false;
    
    switch (backupFrequency) {
      case 'daily':
        needsNewBackup = lastBackup.getDate() !== now.getDate() || 
                        lastBackup.getMonth() !== now.getMonth() ||
                        lastBackup.getFullYear() !== now.getFullYear();
        break;
      case 'weekly':
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        needsNewBackup = lastBackup < oneWeekAgo;
        break;
      case 'monthly':
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
  
  const createBackup = async (isAutomatic = false) => {
    if (isCreatingBackup) return;
    
    setIsCreatingBackup(true);
    
    try {
      const snapshot = await database.ref(auth.currentUser.uid).once('value');
      const userData = snapshot.val();
      
      if (!userData) {
        showSnackbar('No hay datos para crear una copia de seguridad', 'warning');
        setIsCreatingBackup(false);
        return;
      }
      
      const jsonData = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `backup_${dateString}_${timeString}.json`;
      
      if (isAutomatic) {
        const storageRef = storage.ref(`backups/${auth.currentUser.uid}/${fileName}`);
        await storageRef.put(blob);
        
        await database.ref(`${auth.currentUser.uid}/config/privacy`).update({
          lastBackupDate: now.toISOString()
        });
        
        setLastBackupDate(now.toISOString());
        loadBackupsInfo();
        
        showSnackbar('Copia de seguridad automática creada con éxito', 'success');
      } else {
        const storageRef = storage.ref(`backups/${auth.currentUser.uid}/${fileName}`);
        await storageRef.put(blob);
        
        loadBackupsInfo();
        
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
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== email) {
      showSnackbar('Por favor, escribe tu correo electrónico correctamente para confirmar', 'error');
      return;
    }
    
    try {
      if (window.confirm('¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.')) {
        setSaving(true);
        
        await database.ref(auth.currentUser.uid).remove();
        await auth.currentUser.delete();
        
        showSnackbar('Tu cuenta ha sido eliminada correctamente', 'success');
        
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
  
  const tabsData = [
    { icon: PersonIcon, label: 'Perfil' },
    { icon: PaletteIcon, label: 'Tema' },
    { icon: AccountBalanceWalletIcon, label: 'Finanzas' },
    { icon: NotificationsIcon, label: 'Notificaciones' },
    { icon: VisibilityIcon, label: 'Privacidad' },
    { icon: ShieldIcon, label: 'Seguridad' },
    { icon: AccessibilityIcon, label: 'Accesibilidad' },
    { icon: SpeedIcon, label: 'Rendimiento' },
    { icon: LanguageIcon, label: 'Idioma' },
    { icon: HelpIcon, label: 'Ayuda' }
  ];
  
  return (
    <Layout title="Configuración">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Card 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <SettingsIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="600">
                Configuración
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Personaliza tu experiencia y gestiona tus preferencias
              </Typography>
            </Box>
          </Stack>
        </Card>
        
        <Grid container spacing={3}>
          {/* Navegación lateral */}
          <Grid item xs={12} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <Tabs
                orientation={isMobile ? "horizontal" : "vertical"}
                variant={isMobile ? "scrollable" : "standard"}
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 64,
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    px: 3,
                    py: 2,
                    borderRadius: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 500
                    }
                  }
                }}
              >
                {tabsData.map((tab, index) => (
                  <Tab 
                    key={index}
                    icon={
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <tab.icon sx={{ mr: 2, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                          {tab.label}
                        </Typography>
                      </Box>
                    }
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))}
              </Tabs>
            </Card>
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
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 500
                }}
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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default Configuracion; 