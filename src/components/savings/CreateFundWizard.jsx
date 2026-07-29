import React, { useState } from 'react';
import {
  Box, Typography, IconButton, TextField, Card, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { addSavingsFund } from '../../services/savings';
import { formatAmountStr } from '../../utils';

const TOTAL_STEPS = 4;
const COLOR = '#1976d2';
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

const CreateFundWizard = ({ onClose, onSuccess }) => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsedTarget = targetStr ? parseFloat(targetStr.replace(',', '.')) || 0 : 0;

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setTargetStr((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (targetStr.includes(',')) return;
      if (!targetStr) { setTargetStr('0,'); return; }
      setTargetStr(targetStr + ','); return;
    }
    if (targetStr === '0' && key !== ',') { setTargetStr(key); return; }
    if (targetStr.includes(',')) { const d = targetStr.split(',')[1]; if (d.length >= 2) return; }
    setTargetStr(targetStr + key);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await addSavingsFund({
        name: name.trim(),
        description: description.trim(),
        target: parsedTarget || null,
        balance: 0,
        createdAt: new Date().toISOString(),
        history: {},
      });
      onSuccess?.();
    } catch {}
    setSubmitting(false);
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const canStep0 = name.trim().length > 0;

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {/* Step 0: Nombre */}
      {step === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ width: 36 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Crear fondo</Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((n) => (
              <Box key={n} sx={{ width: n === 0 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? COLOR : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
            ))}
          </Box>

          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, px: 3, pt: 2 }}>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>NOMBRE</Typography>
              <TextField value={name} onChange={(e) => setName(e.target.value)} fullWidth autoFocus placeholder="Ej: Fondo vacaciones" inputProps={{ maxLength: 40 }} InputProps={{ sx: { borderRadius: 2 } }} />
            </AnimatedItem>
          </AnimatedGroup>

          <Box sx={{ px: 3, pb: 3 }}>
            <Box onClick={canStep0 ? goNext : undefined} sx={{ bgcolor: canStep0 ? COLOR : alpha(COLOR, 0.3), color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '1rem', cursor: canStep0 ? 'pointer' : 'default', userSelect: 'none' }}>Siguiente →</Box>
          </Box>
        </Box>
      )}

      {/* Step 1: Descripción */}
      {step === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <IconButton onClick={goBack} size="small"><ArrowBackIcon fontSize="small" /></IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Crear fondo</Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((n) => (
              <Box key={n} sx={{ width: n === 1 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? COLOR : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
            ))}
          </Box>

          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, px: 3, pt: 2 }}>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary', display: 'block', mb: 1 }}>DESCRIPCIÓN</Typography>
              <TextField value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} autoFocus placeholder="Opcional" inputProps={{ maxLength: 100 }} InputProps={{ sx: { borderRadius: 2 } }} />
            </AnimatedItem>
          </AnimatedGroup>

          <Box sx={{ px: 3, pb: 3 }}>
            <Box onClick={goNext} sx={{ bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>Siguiente →</Box>
          </Box>
        </Box>
      )}

      {/* Step 2: Monto objetivo (keypad) */}
      {step === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <IconButton onClick={goBack} size="small"><ArrowBackIcon fontSize="small" /></IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Crear fondo</Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((n) => (
              <Box key={n} sx={{ width: n === 2 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? COLOR : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
            ))}
          </Box>

          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>MONTO OBJETIVO</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>Opcional · Dejá en 0 si no tenés meta</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: COLOR, mt: 2 }}>{formatAmountStr(targetStr)}</Typography>
              </Box>
            </AnimatedItem>

            <AnimatedItem>
              <Box sx={{ px: 3, pb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {keypadKeys.map((key) => (
                    <Box key={key} component="button" onClick={() => handleKeyPress(key)}
                      sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, border: 'none', bgcolor: 'transparent', cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) }, '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.6) } }}>
                      {key === 'backspace' ? <BackspaceIcon /> : key}
                    </Box>
                  ))}
                </Box>
              </Box>
            </AnimatedItem>
          </AnimatedGroup>

          <Box sx={{ px: 3, pb: 3 }}>
            <Box onClick={goNext} sx={{ bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>Revisar</Box>
          </Box>
        </Box>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <IconButton onClick={goBack} size="small"><ArrowBackIcon fontSize="small" /></IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Crear fondo</Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i).map((n) => (
              <Box key={n} sx={{ width: n === 3 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? COLOR : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
            ))}
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
            <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatedItem>
                <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>
              </AnimatedItem>

              <AnimatedItem>
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary">Nombre</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                  </Box>
                  {description ? (
                    <Box sx={{ py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">Descripción</Typography>
                      <Typography variant="body2">{description}</Typography>
                    </Box>
                  ) : null}
                  <Box sx={{ py: 1.5, px: 2.5 }}>
                    <Typography variant="caption" color="text.secondary">Objetivo</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {parsedTarget > 0 ? `$ ${parsedTarget.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : 'Sin objetivo'}
                    </Typography>
                  </Box>
                </Card>
              </AnimatedItem>
            </AnimatedGroup>
          </Box>

          <Box sx={{ px: 3, pb: 3, pt: 2 }}>
            <Box onClick={handleSubmit}
              sx={{ bgcolor: submitting ? alpha(COLOR, 0.5) : COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textAlign: 'center', fontSize: '1rem', cursor: submitting ? 'default' : 'pointer', userSelect: 'none' }}>
              {submitting ? 'Guardando...' : 'Crear fondo'}
            </Box>
          </Box>
        </Box>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', px: 4 }}>
          <Box sx={{ width: 96, height: 96, borderRadius: '50%', bgcolor: alpha(COLOR, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: COLOR }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>¡Fondo creado!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, textAlign: 'center' }}>{name}</Typography>
          {parsedTarget > 0 && (
            <Typography variant="caption" color="text.secondary">Objetivo: $ {parsedTarget.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CreateFundWizard;
