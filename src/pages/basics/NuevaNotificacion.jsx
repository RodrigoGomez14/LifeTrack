import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card,
  Button, Chip, Snackbar, Alert, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as db from '../../services/database';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#7c4dff';
const STEPS = 5;

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];

const MODULES = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/gastos', label: 'Gastos', icon: '💸' },
  { path: '/ingresos', label: 'Ingresos', icon: '💰' },
  { path: '/tarjetas', label: 'Tarjetas', icon: '💳' },
  { path: '/ahorros', label: 'Ahorros', icon: '🏦' },
  { path: '/Habitos', label: 'Hábitos', icon: '✅' },
  { path: '/plantas', label: 'Plantas', icon: '🌱' },
  { path: '/Configuracion', label: 'Configuración', icon: '⚙️' },
];

const NuevaNotificacion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('21:00');
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
    if (!name.trim() || !days.length || !time || !title.trim() || !body.trim() || !redirectTo) return;
    setSubmitting(true);
    try {
      const notif = {
        name: name.trim(),
        days: days.sort(),
        time,
        title: title.trim(),
        body: body.trim(),
        redirectTo,
      };
      await db.push('config/notifications/list', notif);
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
    setTime('21:00');
    setTitle('');
    setBody('');
    setRedirectTo('/gastos');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const destLabel = MODULES.find((m) => m.path === n.redirectTo)?.label || n.redirectTo;

    return (
      <AnimatedSuccess color={COLOR} title="¡Notificación creada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{n.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, justifyContent: 'center' }}>
          {n.days.sort().map((d) => (
            <Chip key={d} label={DAYS.find((x) => x.value === d)?.label} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
          ))}
          <Chip label={n.time} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>"{n.title}"</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 3 }}>→ {destLabel}</Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#651fff' } }}>
          Crear otra
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Configuración</Button>
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
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nueva notificación</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, pt: 2 }}>
            {step === 0 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth
                      placeholder="Ej: Recordatorio de gastos"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                      DÍAS
                    </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {DAYS.map((d) => (
                      <Box key={d.value} onClick={() => toggleDay(d.value)}
                        sx={{
                          px: 1.5, py: 0.75, borderRadius: 1.5, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          bgcolor: days.includes(d.value) ? alpha(COLOR, 0.12) : 'action.hover',
                          color: days.includes(d.value) ? COLOR : 'text.secondary',
                          border: `1px solid ${days.includes(d.value) ? alpha(COLOR, 0.4) : 'transparent'}`,
                          transition: '0.15s',
                        }}>
                        {d.label}
                      </Box>
                    ))}
                  </Box>
                </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 2 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                      HORARIO
                    </Typography>
                  <Box component="input" type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid ${theme.palette.divider}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }} />
                </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 3 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth
                      placeholder="¿Anotaste todos los gastos?"
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    <TextField label="Subtítulo" value={body} onChange={(e) => setBody(e.target.value)} fullWidth multiline rows={2}
                      placeholder="Revisá tus gastos del día"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 4 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
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
                </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step < STEPS - 1 ? (
            <WizardFooter label="Siguiente →" disabled={
              step === 0 ? !name.trim() : step === 1 ? !days.length : step === 2 ? !time : step === 3 ? !title.trim() || !body.trim() : false
            } onClick={goNext} color={COLOR} />
          ) : (
            <WizardFooter label="Crear notificación" disabled={!name.trim() || !days.length || !time || !title.trim() || !body.trim() || !redirectTo}
              onClick={handleSubmit} loading={submitting} color={COLOR} />
          )}
        </>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack === 'Error al guardar' ? 'error' : 'success'} variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NuevaNotificacion;
