import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Avatar,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Fade,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../hooks/useAuth';
import { auth, storage } from '../../firebase';

// ── Helpers a nivel módulo ──────────────────────────────────────────────────

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', requirements: { length: false, upper: false, number: false, symbol: false } };
  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(requirements).filter(Boolean).length;
  const label = score <= 1 ? 'Débil' : score === 2 ? 'Media' : score === 3 ? 'Fuerte' : 'Muy fuerte';
  return { score, label, requirements };
};

// Mapeo de códigos de error de Firebase a mensajes en español
const mapFirebaseError = (code) => {
  switch (code) {
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este email';
    case 'auth/invalid-email':
      return 'Email no válido';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Inténtalo más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verificá tu internet';
    case 'auth/popup-closed-by-user':
      return 'Ventana cerrada antes de completar el inicio de sesión';
    default:
      return 'Algo salió mal. Inténtalo de nuevo';
  }
};

const uploadProfilePhoto = async (file) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuario no autenticado');
  const fileRef = storage.ref().child(`profileImages/${uid}/${file.name}`);
  await fileRef.put(file);
  return fileRef.getDownloadURL();
};

// ── Componente ──────────────────────────────────────────────────────────────

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, sendPasswordReset, updatePhotoURL } = useAuth();

  // Pantalla activa: welcome | register | login
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [step, setStep] = useState(1); // 1-4 — solo para 'register'

  // Datos del wizard
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Login (separados para no perder estado entre pantallas)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const passwordCheck = useMemo(() => calculatePasswordStrength(password), [password]);

  // Reset error/info al cambiar de paso o pantalla
  const goToStep = (n) => {
    setError('');
    setInfo('');
    setStep(n);
  };
  const goToScreen = (s) => {
    setError('');
    setInfo('');
    setCurrentScreen(s);
    if (s === 'register') setStep(1);
  };

  // ── Handlers de Firebase ──────────────────────────────────────────────────

  const handleGoogle = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/Home');
    } catch (e) {
      console.error('Google sign-in error:', e);
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (loading) return;
    setError('');

    if (!loginEmail || !validateEmail(loginEmail)) {
      setError('Email no válido');
      return;
    }
    if (!loginPassword) {
      setError('Ingresá tu contraseña');
      return;
    }

    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate('/Home');
    } catch (e) {
      console.error('Login error:', e);
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (loading) return;
    setError('');
    setInfo('');

    if (!loginEmail || !validateEmail(loginEmail)) {
      setError('Ingresá tu email para recuperar la contraseña');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(loginEmail);
      setInfo('Te enviamos un correo para restablecer la contraseña');
    } catch (e) {
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (loading) return;
    setError('');

    if (!name.trim()) {
      setError('Ingresá tu nombre');
      return;
    }

    const displayName = lastName.trim() ? `${name.trim()} ${lastName.trim()}` : name.trim();

    setLoading(true);
    try {
      await signUp({ email, password, displayName });

      if (photoFile) {
        try {
          const url = await uploadProfilePhoto(photoFile);
          await updatePhotoURL(url);
        } catch (uploadError) {
          // El usuario ya fue creado; subida de foto falló — no bloqueo el flujo
          console.warn('Foto no subida:', uploadError);
        }
      }

      goToStep(4);
    } catch (e) {
      console.error('Signup error:', e);
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Validaciones por paso ─────────────────────────────────────────────────

  const canAdvanceStep1 = email.trim() && validateEmail(email);
  const canAdvanceStep2 =
    passwordCheck.requirements.length &&
    passwordCheck.requirements.upper &&
    passwordCheck.requirements.number;
  const canAdvanceStep3 = name.trim().length > 0;

  // ── UI compartida ─────────────────────────────────────────────────────────

  const renderProgressDots = (current, total = 4) => (
    <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: i + 1 === current ? 24 : 8,
            height: 8,
            borderRadius: 999,
            bgcolor: i + 1 <= current ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2),
            transition: 'width 0.2s ease',
          }}
        />
      ))}
    </Box>
  );

  const renderRegisterHeader = (currentStep) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
      <IconButton
        onClick={() => (currentStep === 1 ? goToScreen('welcome') : goToStep(currentStep - 1))}
        sx={{
          bgcolor: alpha(theme.palette.action.hover, 0.4),
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.7) },
        }}
        size="small"
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{renderProgressDots(currentStep)}</Box>
      <Box sx={{ width: 32 }} />
    </Box>
  );

  const renderErrorBanner = () =>
    error ? (
      <Box
        sx={{
          mx: 3,
          mb: 2,
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.08),
          color: theme.palette.error.main,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {error}
        </Typography>
      </Box>
    ) : null;

  const renderInfoBanner = () =>
    info ? (
      <Box
        sx={{
          mx: 3,
          mb: 2,
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.success.main, 0.08),
          color: theme.palette.success.dark,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {info}
        </Typography>
      </Box>
    ) : null;

  const primaryButtonSx = {
    bgcolor: theme.palette.primary.main,
    color: 'white',
    borderRadius: 999,
    py: 1.5,
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': { bgcolor: theme.palette.primary.dark },
    '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3), color: 'white' },
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
    },
  };

  // ── PANTALLA 0 — Welcome ─────────────────────────────────────────────────

  const renderWelcome = () => (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(160deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Cards apiladas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          px: 3,
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 320, height: 280 }}>
          {/* Card 3 (atrás) — Plantas */}
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              left: 0,
              right: 0,
              bgcolor: 'white',
              borderRadius: 4,
              p: 2.5,
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              transform: 'rotate(-4deg)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalFloristIcon sx={{ color: theme.palette.success.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Plantas
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Riego en 2 días
              </Typography>
            </Box>
          </Box>

          {/* Card 2 (medio) — Hábitos */}
          <Box
            sx={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              bgcolor: 'white',
              borderRadius: 4,
              p: 2.5,
              boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
              transform: 'rotate(2deg)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Hábitos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                6 de 8 hoy
              </Typography>
            </Box>
          </Box>

          {/* Card 1 (frente) — Finanzas */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bgcolor: 'white',
              borderRadius: 4,
              p: 2.5,
              boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
              transform: 'rotate(-2deg)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AttachMoneyIcon sx={{ color: theme.palette.success.main }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Finanzas
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                $1.840
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
              label="+12%"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                fontWeight: 700,
                '& .MuiChip-icon': { color: theme.palette.success.main },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Brand */}
      <Box sx={{ px: 4, textAlign: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          LifeTrack
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85, mt: 0.5 }}>
          Tu vida, en un solo lugar.
        </Typography>
      </Box>

      {/* Botones */}
      <Box sx={{ px: 3, pb: 4 }}>
        <Stack spacing={1.5}>
          <Button
            fullWidth
            onClick={() => goToScreen('register')}
            sx={{
              bgcolor: 'white',
              color: theme.palette.text.primary,
              borderRadius: 999,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
            }}
          >
            Crear cuenta
          </Button>
          <Button
            fullWidth
            onClick={() => goToScreen('login')}
            sx={{
              bgcolor: 'transparent',
              color: 'white',
              border: `1px solid ${alpha('#ffffff', 0.4)}`,
              borderRadius: 999,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { bgcolor: alpha('#ffffff', 0.08), borderColor: alpha('#ffffff', 0.6) },
            }}
          >
            Ya tengo cuenta
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  // ── PASO 1 — Email ───────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {renderRegisterHeader(1)}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
          Creá tu cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Te lleva menos de un minuto.
        </Typography>

        {/* Apple (decorativo) */}
        <Button
          fullWidth
          startIcon={<AppleIcon />}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            borderRadius: 999,
            py: 1.4,
            fontWeight: 600,
            textTransform: 'none',
            mb: 1.5,
            '&:hover': { bgcolor: alpha('#000', 0.85) },
          }}
        >
          Continuar con Apple
        </Button>

        {/* Google */}
        <Button
          fullWidth
          onClick={handleGoogle}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            bgcolor: 'white',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 999,
            py: 1.4,
            fontWeight: 600,
            textTransform: 'none',
            mb: 2.5,
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Continuar con Google'}
        </Button>

        {/* Divisor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary">
            o continúa con email
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={inputSx}
        />

        {renderErrorBanner()}
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button fullWidth disabled={!canAdvanceStep1 || loading} onClick={() => goToStep(2)} sx={primaryButtonSx}>
          Continuar
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Al continuar aceptás los Términos y la Política de Privacidad.
        </Typography>
      </Box>
    </Box>
  );

  // ── PASO 2 — Contraseña ──────────────────────────────────────────────────

  const renderStep2 = () => {
    const req = passwordCheck.requirements;
    const strengthColor =
      passwordCheck.score <= 1
        ? theme.palette.error.main
        : passwordCheck.score === 2
        ? theme.palette.warning.main
        : theme.palette.success.main;

    const renderRequirement = (met, label, optional = false) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
        <CheckCircleIcon
          sx={{
            fontSize: 18,
            color: met
              ? theme.palette.success.main
              : optional
              ? theme.palette.text.disabled
              : alpha(theme.palette.text.disabled, 0.5),
          }}
        />
        <Typography
          variant="body2"
          sx={{ color: met ? 'text.primary' : 'text.secondary', fontWeight: met ? 500 : 400 }}
        >
          {label}
        </Typography>
      </Box>
    );

    return (
      <Box sx={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
        {renderRegisterHeader(2)}

        <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
            Creá una contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Será tu llave para entrar a LifeTrack.
          </Typography>

          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={inputSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Barra de fuerza */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Fuerza
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: strengthColor }}>
                {passwordCheck.label || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    bgcolor:
                      i < passwordCheck.score ? strengthColor : alpha(theme.palette.text.disabled, 0.2),
                    transition: 'background-color 0.2s ease',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Checklist */}
          <Box sx={{ mt: 2 }}>
            {renderRequirement(req.length, 'Mínimo 8 caracteres')}
            {renderRequirement(req.upper, 'Una letra mayúscula')}
            {renderRequirement(req.number, 'Un número')}
            {renderRequirement(req.symbol, 'Un símbolo (opcional)', true)}
          </Box>

          {renderErrorBanner()}
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button fullWidth disabled={!canAdvanceStep2 || loading} onClick={() => goToStep(3)} sx={primaryButtonSx}>
            Continuar
          </Button>
        </Box>
      </Box>
    );
  };

  // ── PASO 3 — Nombre y foto ───────────────────────────────────────────────

  const renderStep3 = () => (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {renderRegisterHeader(3)}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
          ¿Cómo te llamás?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Así te llamaremos en la app.
        </Typography>

        {/* Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={photoPreview}
              sx={{
                width: 112,
                height: 112,
                bgcolor: alpha(theme.palette.secondary.main, 0.18),
                color: theme.palette.secondary.dark,
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {!photoPreview && (name ? name.charAt(0).toUpperCase() : '?')}
            </Avatar>
            <input
              accept="image/*"
              id="photo-input"
              type="file"
              hidden
              onChange={handlePhotoSelect}
            />
            <label htmlFor="photo-input">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: theme.palette.success.dark },
                }}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </label>
          </Box>
        </Box>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={inputSx}
          />
          <TextField
            fullWidth
            label="Apellido (opcional)"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={inputSx}
          />
        </Stack>

        {renderErrorBanner()}
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          fullWidth
          disabled={!canAdvanceStep3 || loading}
          onClick={handleStep3Submit}
          sx={primaryButtonSx}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Continuar'}
        </Button>
      </Box>
    </Box>
  );

  // ── PASO 4 — Done ────────────────────────────────────────────────────────

  const renderStep4 = () => (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.secondary.main, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 0 12px ${alpha(theme.palette.secondary.main, 0.06)}`,
          mb: 3,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: theme.palette.secondary.main }} />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        ¡Todo listo, {name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 320 }}>
        Tu cuenta está creada. Vamos a configurar tu primer registro.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <Chip
          label="Finanzas"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}
        />
        <Chip
          label="Hábitos"
          sx={{
            bgcolor: alpha(theme.palette.secondary.main, 0.15),
            color: theme.palette.secondary.dark,
            fontWeight: 600,
          }}
        />
      </Stack>

      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <Button fullWidth onClick={() => navigate('/Home')} sx={primaryButtonSx}>
          Empezar a usar LifeTrack
        </Button>
      </Box>
    </Box>
  );

  // ── PANTALLA LOGIN ───────────────────────────────────────────────────────

  const renderLogin = () => (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <IconButton
          onClick={() => goToScreen('welcome')}
          sx={{
            bgcolor: alpha(theme.palette.action.hover, 0.4),
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.7) },
          }}
          size="small"
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
          Bienvenido de vuelta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresá a tu cuenta.
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            sx={inputSx}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type={showLoginPassword ? 'text' : 'password'}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            sx={inputSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowLoginPassword(!showLoginPassword)} edge="end" size="small">
                    {showLoginPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            onClick={handleForgotPassword}
            disabled={loading}
            sx={{ textTransform: 'none', color: theme.palette.primary.main, fontWeight: 500 }}
            size="small"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>

        {renderErrorBanner()}
        {renderInfoBanner()}

        <Button
          fullWidth
          onClick={handleLoginSubmit}
          disabled={loading}
          sx={{ ...primaryButtonSx, mt: 2 }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Iniciar sesión'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary">
            o
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Button
          fullWidth
          onClick={handleGoogle}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            bgcolor: 'white',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 999,
            py: 1.4,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
          }}
        >
          Continuar con Google
        </Button>
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿No tenés cuenta?{' '}
          <Box
            component="span"
            onClick={() => goToScreen('welcome')}
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Crear una
          </Box>
        </Typography>
      </Box>
    </Box>
  );

  // ── Render principal ─────────────────────────────────────────────────────

  const renderActive = () => {
    if (currentScreen === 'welcome') return renderWelcome();
    if (currentScreen === 'login') return renderLogin();
    // register
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return null;
  };

  return (
    <Fade in key={`${currentScreen}-${step}`} timeout={250}>
      <Box sx={{ position: 'fixed', inset: 0 }}>{renderActive()}</Box>
    </Fade>
  );
};

export default Login;
