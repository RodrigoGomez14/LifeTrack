import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase.js';
import firebase from 'firebase/compat/app';
import { 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Grid, 
  Box, 
  Paper, 
  Tab, 
  Tabs, 
  InputAdornment, 
  IconButton, 
  Divider, 
  Checkbox,
  FormControlLabel,
  Link,
  Fade,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useLocation } from 'react-router-dom';

// Componente de elementos decorativos para el fondo
const BackgroundDecorator = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      overflow: 'hidden',
      zIndex: -1,
      opacity: 0.6
    }}>
      {/* Círculo grande en la esquina superior derecha */}
      <Box sx={{ 
        position: 'absolute',
        top: '-15vh',
        right: '-15vh',
        width: '50vh',
        height: '50vh',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(primaryColor, 0.4)} 0%, ${alpha(primaryColor, 0.1)} 70%)`,
      }} />
      
      {/* Círculo mediano en la esquina inferior izquierda */}
      <Box sx={{ 
        position: 'absolute',
        bottom: '-10vh',
        left: '-10vh',
        width: '40vh',
        height: '40vh',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(secondaryColor, 0.3)} 0%, ${alpha(secondaryColor, 0.05)} 70%)`,
      }} />
      
      {/* Pequeños puntos decorativos */}
      {Array.from({ length: 20 }).map((_, index) => (
        <Box 
          key={index}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            borderRadius: '50%',
            backgroundColor: Math.random() > 0.5 ? alpha(primaryColor, 0.2) : alpha(secondaryColor, 0.2),
          }}
        />
      ))}
      
      {/* Líneas curvas decorativas */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <path
          d="M0,50 Q250,180 500,80 T1000,100"
          fill="none"
          stroke={alpha(primaryColor, 0.1)}
          strokeWidth="3"
        />
        <path
          d="M0,150 Q250,50 500,120 T1000,50"
          fill="none"
          stroke={alpha(secondaryColor, 0.1)}
          strokeWidth="2"
        />
      </svg>
    </Box>
  );
};

const Auth = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para controlar la pestaña activa (login o registro)
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados del formulario de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Estados del formulario de Registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Estados para la UI
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Validaciones
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [registerNameError, setRegisterNameError] = useState('');
  const [registerEmailError, setRegisterEmailError] = useState('');
  const [registerPasswordError, setRegisterPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Cambiar a la pestaña apropiada basado en la URL
  useEffect(() => {
    if (location.pathname.includes('registro')) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [location]);

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };
  
  // Función para validar email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Calcular fuerza de la contraseña
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    return strength;
  };
  
  // Manejar cambio en la contraseña de registro
  const handleRegisterPasswordChange = (e) => {
    const password = e.target.value;
    setRegisterPassword(password);
    calculatePasswordStrength(password);
    
    if (password.length < 8) {
      setRegisterPasswordError('La contraseña debe tener al menos 8 caracteres');
    } else if (password.length > 30) {
      setRegisterPasswordError('La contraseña no debe exceder 30 caracteres');
    } else {
      setRegisterPasswordError('');
    }
    
    // Validar confirmación de contraseña si ya hay algo escrito
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError('Las contraseñas no coinciden');
      } else {
        setConfirmPasswordError('');
      }
    }
  };
  
  // Validar formulario de login
  const validateLoginForm = () => {
    let isValid = true;
    
    if (!loginEmail) {
      setLoginEmailError('El email es requerido');
      isValid = false;
    } else if (!validateEmail(loginEmail)) {
      setLoginEmailError('Email inválido');
      isValid = false;
    } else {
      setLoginEmailError('');
    }
    
    if (!loginPassword) {
      setLoginPasswordError('La contraseña es requerida');
      isValid = false;
    } else {
      setLoginPasswordError('');
    }
    
    return isValid;
  };
  
  // Validar formulario de registro
  const validateRegisterForm = () => {
    let isValid = true;
    
    if (!registerName) {
      setRegisterNameError('El nombre es requerido');
      isValid = false;
    } else if (registerName.length < 3) {
      setRegisterNameError('El nombre debe tener al menos 3 caracteres');
      isValid = false;
    } else {
      setRegisterNameError('');
    }
    
    if (!registerEmail) {
      setRegisterEmailError('El email es requerido');
      isValid = false;
    } else if (!validateEmail(registerEmail)) {
      setRegisterEmailError('Email inválido');
      isValid = false;
    } else {
      setRegisterEmailError('');
    }
    
    if (!registerPassword) {
      setRegisterPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (registerPassword.length < 8) {
      setRegisterPasswordError('La contraseña debe tener al menos 8 caracteres');
      isValid = false;
    } else {
      setRegisterPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Confirma tu contraseña');
      isValid = false;
    } else if (registerPassword !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      isValid = false;
    }
    
    return isValid;
  };

  // Manejar inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.signInWithEmailAndPassword(loginEmail, loginPassword);
      // Guardar preferencia "recordarme" si está seleccionada
      if (rememberMe) {
        localStorage.setItem('rememberEmail', loginEmail);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      navigate('/Home');
    } catch (error) {
      let errorMessage = '';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde';
          break;
        default:
          errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar registro
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Crear usuario con email y contraseña
      const userCredential = await auth.createUserWithEmailAndPassword(registerEmail, registerPassword);
      
      // Actualizar el perfil con el nombre
      await userCredential.user.updateProfile({
        displayName: registerName
      });
      
      setSuccess('Registro exitoso. ¡Bienvenido a LifeTrack!');
      // Cambiar a la pestaña de login después de un registro exitoso
      setTimeout(() => {
        setActiveTab(0);
        setLoginEmail(registerEmail);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      let errorMessage = '';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El email no es válido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        default:
          errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      navigate('/Home');
    } catch (error) {
      console.error("Error de autenticación con Google:", error);
      setError('Error al iniciar sesión con Google. Inténtalo de nuevo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Olvidé mi contraseña
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setLoginEmailError('Ingresa tu email para restablecer la contraseña');
      return;
    }
    
    if (!validateEmail(loginEmail)) {
      setLoginEmailError('Email inválido');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.sendPasswordResetEmail(loginEmail);
      setSuccess('Se ha enviado un correo para restablecer tu contraseña');
    } catch (error) {
      setError('No se pudo enviar el correo de restablecimiento');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obtener color para indicador de fuerza de contraseña
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return theme.palette.error.main;
      case 1:
        return theme.palette.error.main;
      case 2:
        return theme.palette.warning.main;
      case 3:
        return theme.palette.success.light;
      case 4:
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Obtener mensaje de fuerza de contraseña
  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return 'Débil';
      case 1:
        return 'Débil';
      case 2:
        return 'Media';
      case 3:
        return 'Fuerte';
      case 4:
        return 'Muy fuerte';
      default:
        return '';
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(145deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
        : `linear-gradient(145deg, ${alpha('#f5f7fa', 0.97)} 0%, ${alpha('#c3cfe2', 0.95)} 100%)`,
      pt: { xs: 2, sm: 4 },
      pb: { xs: 4, sm: 8 }
    }}>
      {/* Elementos decorativos de fondo */}
      <BackgroundDecorator />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          px: { xs: isSmallMobile ? 1 : 2, sm: 3 } // Reducir padding horizontal en móvil
        }}
      >
        <Box
          sx={{ width: '100%', opacity: 1 }}
        >
          <Grid container spacing={0} justifyContent="center" alignItems="stretch" sx={{ minHeight: { md: '600px' } }}>
            {/* Panel izquierdo - Solo visible en pantallas medianas y grandes */}
            {!isMobile && (
              <Grid item xs={12} md={5} lg={6}>
                <Paper
                  elevation={24}
                  sx={{
                    height: '100%',
                    borderRadius: { xs: 3, md: '16px 0 0 16px' },
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 4,
                    color: 'white',
                    position: 'relative',
                    boxShadow: `0 10px 40px ${alpha(theme.palette.primary.dark, 0.4)}`
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0.075,
                      backgroundImage: 'url(/assets/auth-bg-pattern.svg)',
                      backgroundSize: 'cover',
                      zIndex: 0
                    }}
                  />
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="h3" 
                      fontWeight="bold"
                      gutterBottom
                    >
                      {activeTab === 0 ? '¡Bienvenido de nuevo!' : 'Únete a LifeTrack'}
                    </Typography>
                    
                    <Typography 
                      variant="h6"
                      sx={{ mb: 4, maxWidth: '80%', fontWeight: 'normal' }}
                    >
                      {activeTab === 0 
                        ? 'Inicia sesión para continuar tu viaje hacia un mejor control de tus finanzas y hábitos personales.' 
                        : 'Crea una cuenta para comenzar a organizar tu vida financiera, hábitos y más en un solo lugar.'}
                    </Typography>
                    
                    <Box>
                      <Typography variant="body1" paragraph>
                        Con LifeTrack podrás:
                      </Typography>
                      
                      <Box sx={{ ml: 2, mb: 4 }}>
                        {[
                          'Organizar tus finanzas personales',
                          'Hacer seguimiento de tus hábitos',
                          'Administrar tus tarjetas de crédito',
                          'Visualizar tus gastos e ingresos',
                          'Y mucho más...'
                        ].map((item, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5, 
                              mb: 1.5,
                              opacity: 0.9
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: '50%', 
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <ArrowForwardIcon sx={{ color: theme.palette.primary.main, fontSize: 14 }} />
                            </Box>
                            <Typography variant="body1">{item}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {/* Panel derecho - Formularios */}
            <Grid item xs={12} md={7} lg={6}>
              <Paper
                elevation={24}
                sx={{
                  borderRadius: { 
                    xs: 3, 
                    md: isMobile ? 3 : '0 16px 16px 0' 
                  },
                  p: { 
                    xs: isSmallMobile ? 2 : 3, 
                    sm: 4 
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isMobile ? `0 10px 40px ${alpha(theme.palette.primary.dark, 0.25)}` : 'none',
                  backgroundColor: alpha(theme.palette.background.paper, 0.95)
                }}
              >
                {/* Logo y título */}
                <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  <Typography 
                    variant={isSmallMobile ? "h5" : isMobile ? "h4" : "h4"} 
                    component="h1" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{ mb: 1 }}
                  >
                    LifeTrack
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                    {activeTab === 0 ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </Typography>
                </Box>
                
                {/* Pestañas para alternar entre login y registro */}
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  centered
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    '& .MuiTab-root': {
                      minWidth: { xs: 100, sm: 120 },
                      fontWeight: 'bold',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      p: { xs: 1, sm: 2 }
                    }
                  }}
                >
                  <Tab 
                    label="Iniciar Sesión" 
                    icon={<LockOutlinedIcon fontSize={isMobile ? "small" : "medium"} />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="Registrarse" 
                    icon={<PersonAddOutlinedIcon fontSize={isMobile ? "small" : "medium"} />} 
                    iconPosition="start" 
                  />
                </Tabs>
                
                {/* Alertas de error y éxito */}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert 
                    severity="success" 
                    sx={{ mb: 2 }}
                    onClose={() => setSuccess(null)}
                  >
                    {success}
                  </Alert>
                )}
                
                {/* Loader */}
                {isLoading && (
                  <LinearProgress sx={{ mb: 2 }} />
                )}
                
                {/* Contenido de la pestaña de login */}
                <Box 
                  sx={{ 
                    display: activeTab === 0 ? 'block' : 'none',
                    flex: 1,
                    overflowY: 'auto'
                  }}
                >
                  <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      error={!!loginEmailError}
                      helperText={loginEmailError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      label="Contraseña"
                      type={showLoginPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      error={!!loginPasswordError}
                      helperText={loginPasswordError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {showLoginPassword ? (
                                <VisibilityOffOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              ) : (
                                <VisibilityOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Box sx={{ 
                      mt: 1, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      flexDirection: { xs: isSmallMobile ? 'column' : 'row', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={<Typography variant={isMobile ? "caption" : "body2"}>Recordarme</Typography>}
                        sx={{ 
                          mr: 0,
                          alignSelf: isSmallMobile ? 'flex-start' : 'center' 
                        }}
                      />
                      
                      <Link
                        component="button"
                        variant={isMobile ? "caption" : "body2"}
                        onClick={handleForgotPassword}
                        underline="hover"
                        color="primary"
                        type="button"
                        disabled={isLoading}
                        sx={{ 
                          alignSelf: isSmallMobile ? 'flex-start' : 'center',
                          mt: isSmallMobile ? -1 : 0 
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </Box>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size={isMobile ? "medium" : "large"}
                      disabled={isLoading}
                      sx={{ 
                        mt: { xs: 2, sm: 3 }, 
                        mb: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontWeight: 'bold',
                        borderRadius: 2
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                    
                    <Divider sx={{ my: { xs: 2, sm: 3 } }}>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        O continuar con
                      </Typography>
                    </Divider>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon fontSize={isMobile ? "small" : "medium"} />}
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      size={isMobile ? "medium" : "large"}
                      sx={{ mb: 2 }}
                    >
                      Iniciar sesión con Google
                    </Button>
                  </form>
                </Box>
                
                {/* Contenido de la pestaña de registro */}
                <Box 
                  sx={{ 
                    display: activeTab === 1 ? 'block' : 'none',
                    flex: 1,
                    overflowY: 'auto'
                  }}
                >
                  <form onSubmit={handleRegister}>
                    <TextField
                      label="Nombre completo"
                      fullWidth
                      margin="normal"
              variant="outlined"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      error={!!registerNameError}
                      helperText={registerNameError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      label="Email"
                      type="email"
              fullWidth
                      margin="normal"
                      variant="outlined"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      error={!!registerEmailError}
                      helperText={registerEmailError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
            <TextField
                      label="Contraseña"
                      type={showRegisterPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
              variant="outlined"
                      value={registerPassword}
                      onChange={handleRegisterPasswordChange}
                      error={!!registerPasswordError}
                      helperText={registerPasswordError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {showRegisterPassword ? (
                                <VisibilityOffOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              ) : (
                                <VisibilityOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    {/* Indicador de fuerza de contraseña */}
                    {registerPassword && (
                      <Box sx={{ mt: 1, mb: { xs: 1, sm: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                            Fuerza de la contraseña
                          </Typography>
                          <Typography variant={isMobile ? "caption" : "body2"} sx={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthLabel()}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(passwordStrength / 4) * 100}
                          sx={{
                            height: isMobile ? 4 : 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.grey[500], 0.2),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getPasswordStrengthColor(),
                            },
                          }}
                        />
                      </Box>
                    )}
                    
                    <TextField
                      label="Confirmar contraseña"
                      type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
                      margin="normal"
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (e.target.value && e.target.value !== registerPassword) {
                          setConfirmPasswordError('Las contraseñas no coinciden');
                        } else {
                          setConfirmPasswordError('');
                        }
                      }}
                      error={!!confirmPasswordError}
                      helperText={confirmPasswordError}
                      disabled={isLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon fontSize={isMobile ? "small" : "medium"} color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size={isMobile ? "small" : "medium"}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOffOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              ) : (
                                <VisibilityOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant={isMobile ? "caption" : "body2"}>
                          Acepto los{' '}
                          <Link href="#" underline="hover" color="primary">
                            términos y condiciones
                          </Link>{' '}
                          y la{' '}
                          <Link href="#" underline="hover" color="primary">
                            política de privacidad
                          </Link>
                        </Typography>
                      }
                      sx={{ mt: 1 }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size={isMobile ? "medium" : "large"}
                      disabled={isLoading}
                      sx={{ 
                        mt: { xs: 2, sm: 3 }, 
                        mb: { xs: 1, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontWeight: 'bold',
                        borderRadius: 2
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                    
                    <Divider sx={{ my: { xs: 2, sm: 3 } }}>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        O regístrate con
                      </Typography>
                    </Divider>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GoogleIcon fontSize={isMobile ? "small" : "medium"} />}
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      size={isMobile ? "medium" : "large"}
                      sx={{ mb: 2 }}
                    >
                      Registrarse con Google
            </Button>
          </form>
                </Box>
                
                {/* Pie de página */}
                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    {activeTab === 0 ? (
                      <>
                        ¿No tienes una cuenta?{' '}
                        <Link
                          component="button"
                          variant={isMobile ? "caption" : "body2"}
                          onClick={() => setActiveTab(1)}
                          underline="hover"
                          color="primary"
                          type="button"
                        >
                          Regístrate ahora
                        </Link>
                      </>
                    ) : (
                      <>
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                          component="button"
                          variant={isMobile ? "caption" : "body2"}
                          onClick={() => setActiveTab(0)}
                          underline="hover"
                          color="primary"
                          type="button"
                        >
                          Inicia sesión
                        </Link>
                      </>
                    )}
                  </Typography>
                </Box>
              </Paper>
        </Grid>
      </Grid>
        </Box>
    </Container>
    </Box>
  );
};

export default Auth;
