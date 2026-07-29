import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, Avatar, Checkbox,
  Button, Chip, Snackbar, Alert, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import WbTwilightOutlinedIcon from '@mui/icons-material/WbTwilightOutlined';
import NightsStayOutlinedIcon from '@mui/icons-material/NightsStayOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../../hooks/useAuth';
import { addReminder } from '../../services/notifications';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#7c4dff';
const STEPS = 5;

const DAYS = [
  { value: 0, label: 'Dom', full: 'Domingo' },
  { value: 1, label: 'Lun', full: 'Lunes' },
  { value: 2, label: 'Mar', full: 'Martes' },
  { value: 3, label: 'Mie', full: 'Miercoles' },
  { value: 4, label: 'Jue', full: 'Jueves' },
  { value: 5, label: 'Vie', full: 'Viernes' },
  { value: 6, label: 'Sab', full: 'Sabado' },
];

const DAY_COLORS = {
  0: '#e53935',
  6: '#43a047',
};

const SLOTS = [
  { key: 'morning', label: 'Manana', time: '09:00', icon: WbSunnyOutlinedIcon },
  { key: 'midday', label: 'Mediodia', time: '12:00', icon: AccessTimeIcon },
  { key: 'evening', label: 'Tarde', time: '18:00', icon: WbTwilightOutlinedIcon },
  { key: 'night', label: 'Noche', time: '22:00', icon: NightsStayOutlinedIcon },
];

const MODULES = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/gastos', label: 'Gastos', icon: '💸' },
  { path: '/ingresos', label: 'Ingresos', icon: '💰' },
  { path: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { path: '/ahorros', label: 'Ahorros', icon: '🏦' },
  { path: '/Habitos', label: 'Habitos', icon: '✅' },
  { path: '/plantas', label: 'Plantas', icon: '🌱' },
  { path: '/Configuracion', label: 'Configuracion', icon: '⚙️' },
];

const NuevaNotificacion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [slot, setSlot] = useState('morning');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [redirectTo, setRedirectTo] = useState('/gastos');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const toggleDay = (v) => {
    setDays((prev) => (prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !days.length || !slot || !title.trim() || !body.trim() || !redirectTo) return;
    if (!user?.uid) return;
    setSubmitting(true);
    try {
      const notif = {
        name: name.trim(),
        days: days.sort(),
        slot,
        title: title.trim(),
        body: body.trim(),
        redirectTo,
      };
      await addReminder(user.uid, notif);
      setSavedSnapshot(notif);
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setName('');
    setDays([]);
    setSlot('morning');
    setTitle('');
    setBody('');
    setRedirectTo('/gastos');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const destLabel = MODULES.find((m) => m.path === n.redirectTo)?.label || n.redirectTo;
    const slotInfo = SLOTS.find((s) => s.key === n.slot);

    return (
      <AnimatedSuccess color={COLOR} title="Notificacion creada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{n.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, justifyContent: 'center' }}>
          {n.days.sort().map((d) => (
            <Chip key={d} label={DAYS.find((x) => x.value === d)?.label} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
          ))}
          <Chip label={slotInfo?.time || n.slot} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>"{n.title}"</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 3 }}>→ {destLabel}</Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#651fff' } }}>
          Crear otra
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Configuracion</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nueva notificacion</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, pt: 2 }}>
            {step === 0 && (
              <AnimatedGroup>
                <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus
                  placeholder="Ej: Recordatorio de gastos"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5, mb: 1, display: 'block' }}>
                  DIAS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {DAYS.map((d) => {
                    const isSelected = days.includes(d.value);
                    const dayColor = DAY_COLORS[d.value] || COLOR;
                    return (
                      <AnimatedItem key={d.value}>
                        <Card variant="outlined"
                          onClick={() => toggleDay(d.value)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.5, borderRadius: 2, cursor: 'pointer',
                            borderColor: isSelected ? dayColor : theme.palette.divider,
                            borderWidth: isSelected ? 2 : 1,
                            bgcolor: isSelected ? alpha(dayColor, 0.04) : 'transparent',
                            transition: '0.12s',
                            '&:hover': { borderColor: dayColor },
                          }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: isSelected ? alpha(dayColor, 0.15) : alpha(theme.palette.action.hover, 0.6), color: isSelected ? dayColor : 'text.secondary', fontWeight: 700, fontSize: '0.95rem' }}>
                            {d.label}
                          </Avatar>
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>{d.full}</Typography>
                          <Checkbox checked={isSelected} sx={{ color: isSelected ? dayColor : 'text.disabled', '&.Mui-checked': { color: dayColor } }} />
                        </Card>
                      </AnimatedItem>
                    );
                  })}
                </Box>
              </AnimatedGroup>
            )}

            {step === 2 && (
              <AnimatedGroup>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5, mb: 2, display: 'block' }}>
                  FRANJA HORARIA
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {SLOTS.map((s) => {
                    const Icon = s.icon;
                    const isSelected = slot === s.key;
                    return (
                      <AnimatedItem key={s.key}>
                        <Card variant="outlined"
                          onClick={() => setSlot(s.key)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 2, borderRadius: 2, cursor: 'pointer',
                            borderColor: isSelected ? COLOR : theme.palette.divider,
                            borderWidth: isSelected ? 2 : 1,
                            bgcolor: isSelected ? alpha(COLOR, 0.04) : 'transparent',
                            transition: '0.12s',
                            '&:hover': { borderColor: COLOR },
                          }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: isSelected ? alpha(COLOR, 0.12) : alpha(theme.palette.action.hover, 0.6), color: isSelected ? COLOR : 'text.secondary' }}>
                            <Icon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.time}</Typography>
                          </Box>
                          <Checkbox checked={isSelected} sx={{ color: isSelected ? COLOR : 'text.disabled', '&.Mui-checked': { color: COLOR } }} />
                        </Card>
                      </AnimatedItem>
                    );
                  })}
                </Box>
              </AnimatedGroup>
            )}

            {step === 3 && (
              <AnimatedGroup>
                <TextField label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth autoFocus
                  placeholder="Anotaste todos los gastos?"
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField label="Subtitulo" value={body} onChange={(e) => setBody(e.target.value)} fullWidth multiline rows={2}
                  placeholder="Revisa tus gastos del dia"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </AnimatedGroup>
            )}

            {step === 4 && (
              <AnimatedGroup>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5, mb: 1.5, display: 'block' }}>
                  AL TOCAR, IR A
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {MODULES.map((m) => (
                    <Box key={m.path} onClick={() => setRedirectTo(m.path)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25, borderRadius: 1.5, cursor: 'pointer',
                        bgcolor: redirectTo === m.path ? alpha(COLOR, 0.08) : 'transparent',
                        border: `1px solid ${redirectTo === m.path ? alpha(COLOR, 0.3) : 'transparent'}`,
                        '&:hover': { bgcolor: alpha(COLOR, 0.04) },
                      }}>
                      <Typography variant="body2">{m.icon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>{m.label}</Typography>
                      {redirectTo === m.path && (
                        <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>✓</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </AnimatedGroup>
            )}
          </Box>

          {step < STEPS - 1 ? (
            <WizardFooter label="Siguiente →" disabled={
              step === 0 ? !name.trim() : step === 1 ? !days.length : step === 2 ? !slot : step === 3 ? !title.trim() || !body.trim() : false
            } onClick={goNext} color={COLOR} />
          ) : (
            <WizardFooter label="Crear notificacion" disabled={!name.trim() || !days.length || !slot || !title.trim() || !body.trim() || !redirectTo}
              onClick={handleSubmit} loading={submitting} color={COLOR} />
          )}
        </>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NuevaNotificacion;
