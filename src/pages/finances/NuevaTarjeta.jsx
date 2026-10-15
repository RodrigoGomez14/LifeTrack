import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Fade,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { addCreditCard } from '../../services/finances';
import { getCardLabel } from '../../components/finances/creditCardsHelpers';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

const CARD_TYPES = [
  { key: 'visa', label: 'Visa' },
  { key: 'master', label: 'Mastercard' },
  { key: 'other', label: 'Otra' },
];

const TOTAL_STEPS = 3;
const COLOR = '#1976d2';

const NuevaTarjeta = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [cardType, setCardType] = useState(null);
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);
  const handleClose = () => navigate(-1);

  const isValidDay = (v) => {
    const n = parseInt(v, 10);
    return Number.isInteger(n) && n >= 1 && n <= 31;
  };

  const canStep0 = name.trim().length > 0;
  const canStep1 = cardType !== null;
  const canStep2 = isValidDay(closingDay) && isValidDay(dueDay);

  const handleSubmit = async () => {
    if (!name.trim() || !cardType || !canStep2 || submitting) return;
    setSubmitting(true);
    try {
      await addCreditCard({
        name: name.trim(),
        cardType,
        defaultClosingDay: parseInt(closingDay, 10),
        defaultDueDay: parseInt(dueDay, 10),
      });
      setStep(TOTAL_STEPS);
    } catch {}
    setSubmitting(false);
  };

  const header = (title, onBack) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
      {onBack ? <IconButton onClick={onBack} size="small"><ArrowBackIcon fontSize="small" /></IconButton> : <Box sx={{ width: 36 }} />}
      <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>{title}</Typography>
      <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
    </Box>
  );

  const dots = (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((n) => (
        <Box key={n} sx={{
          width: n === step ? 20 : 8, height: 4, borderRadius: 2,
          bgcolor: n <= step ? COLOR : alpha(theme.palette.text.primary, 0.15),
          transition: 'all 0.2s',
        }} />
      ))}
    </Box>
  );

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Fade in key={step} timeout={250}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Step 0: Nombre */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {header('Nueva tarjeta', null)}
              {dots}

              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, px: 3, pt: 2 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                    NOMBRE
                  </Typography>
                  <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    autoFocus
                    placeholder="Ej: Galicia"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </AnimatedItem>
              </AnimatedGroup>

              <Box sx={{ px: 3, pb: 3 }}>
                <Button fullWidth variant="contained" size="large" disabled={!canStep0} onClick={goNext}
                  sx={{ bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                    '&:hover': { bgcolor: '#1565c0' }, '&.Mui-disabled': { bgcolor: alpha(COLOR, 0.3), color: 'white' } }}>
                  Siguiente →
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 1: Tipo */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {header('Tipo de tarjeta', goBack)}
              {dots}

              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, px: 3, pt: 2 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                    TIPO DE TARJETA
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {CARD_TYPES.map((t) => (
                      <Box
                        key={t.key}
                        onClick={() => setCardType(t.key)}
                        sx={{
                          px: 2, py: 2, borderRadius: 2,
                          border: '1.5px solid', borderColor: cardType === t.key ? COLOR : 'divider',
                          bgcolor: cardType === t.key ? alpha(COLOR, 0.06) : 'transparent',
                          cursor: 'pointer', transition: '0.12s',
                          '&:hover': { borderColor: COLOR },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: cardType === t.key ? 700 : 500 }}>
                          {t.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>

              <Box sx={{ px: 3, pb: 3 }}>
                <Button fullWidth variant="contained" size="large" disabled={!canStep1} onClick={goNext}
                  sx={{ bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                    '&:hover': { bgcolor: '#1565c0' }, '&.Mui-disabled': { bgcolor: alpha(COLOR, 0.3), color: 'white' } }}>
                  Siguiente →
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Fechas por defecto */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {header('Fechas de la tarjeta', goBack)}
              {dots}

              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, px: 3, pt: 2 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                    DÍA DE CIERRE
                  </Typography>
                  <TextField
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    fullWidth
                    inputMode="numeric"
                    placeholder="Ej: 25"
                    error={closingDay !== '' && !isValidDay(closingDay)}
                    helperText="Día del mes en que cierra el resumen (1-31)"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                    DÍA DE VENCIMIENTO
                  </Typography>
                  <TextField
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                    fullWidth
                    inputMode="numeric"
                    placeholder="Ej: 5"
                    error={dueDay !== '' && !isValidDay(dueDay)}
                    helperText="Día del mes en que vence el pago (1-31)"
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <Typography variant="caption" color="text.secondary">
                    Podés ajustar estas fechas más adelante al subir el resumen de cada período.
                  </Typography>
                </AnimatedItem>
              </AnimatedGroup>

              <Box sx={{ px: 3, pb: 3 }}>
                <Button fullWidth variant="contained" size="large" disabled={!canStep2 || submitting} onClick={handleSubmit}
                  sx={{ bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                    '&:hover': { bgcolor: '#1565c0' }, '&.Mui-disabled': { bgcolor: alpha(COLOR, 0.3), color: 'white' } }}>
                  {submitting ? 'Guardando...' : 'Agregar tarjeta'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Success */}
          {step === TOTAL_STEPS && (
            <AnimatedSuccess color={COLOR} title="¡Tarjeta agregada!">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, textAlign: 'center' }}>
                {name} · {getCardLabel(cardType)}
              </Typography>
              <Button fullWidth variant="contained" size="large" onClick={() => navigate('/tarjetas')}
                sx={{ maxWidth: 320, mt: 4, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#1565c0' } }}>
                Volver a Tarjetas
              </Button>
            </AnimatedSuccess>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default NuevaTarjeta;
