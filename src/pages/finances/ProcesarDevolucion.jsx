import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Grid, Card, Button, Chip,
  Snackbar, Alert, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import { useStore } from '../../store';
import { bulkUpdate, generateKey } from '../../services/database';
import { formatAmount, getDate } from '../../utils';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#4CAF50';
const STEPS = 3;


const ProcesarDevolucion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const tx = location.state?.tx;
  const currentSavings = userData?.savings?.amountARS || 0;

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(tx ? `Devolución de ${tx.description || ''}` : '');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const handleKeyPress = useCallback((key) => {
    if (key === 'backspace') { setAmount((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amount.includes(',')) return;
      if (!amount) { setAmount('0,'); return; }
      setAmount(amount + ','); return;
    }
    if (amount === '0' && key !== ',') { setAmount(key); return; }
    if (amount.includes(',')) { const decimals = amount.split(',')[1]; if (decimals.length >= 2) return; }
    setAmount(amount + key);
  }, [amount]);

  if (!tx) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
        <Typography variant="h6" color="text.secondary">Transacción no encontrada</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, mb: 2 }}>Volvé a intentar desde la lista de gastos</Typography>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>
    );
  }

  const refundAmount = parseFloat(amount.replace(',', '.')) || 0;
  const originalAmount = tx.amount || 0;
  const isValid = refundAmount > 0 && refundAmount <= originalAmount;
  const newSavings = currentSavings + refundAmount;
  const deltaText = `+ ${formatAmount(refundAmount)}`;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleAmountPaste = (raw) => {
    const cleaned = raw.replace(/[^\d,.]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (isNaN(num)) return;
    const [int, dec] = num.toFixed(2).split('.');
    const intClean = int.replace(/^0+/, '') || '0';
    setAmount(dec ? `${intClean},${dec}` : intClean);
  };

  const amountDisplay = amount
    ? `$ ${amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    : '$ 0';

  const handleSubmit = async () => {
    if (!isValid || !tx._key) return;
    setSubmitting(true);
    try {
      const updates = {};
      updates[`expenses/${tx._key}/refundAmount`] = refundAmount;
      updates[`expenses/${tx._key}/refundDescription`] = description.trim();
      updates[`expenses/${tx._key}/refundDate`] = getDate();
      updates[`expenses/${tx._key}/hasRefund`] = true;
      updates['savings/amountARS'] = newSavings;

      const historyKey = generateKey('savings/amountARSHistory');
      updates[`savings/amountARSHistory/${historyKey}`] = {
        date: getDate(),
        amount: refundAmount,
        newTotal: newSavings,
        description: `Devolución: ${description.trim()}`,
      };

      await bulkUpdate(updates);
      setSavedSnapshot({ refundAmount, originalAmount, description: description.trim(), newSavings });
    } catch {
      setSnack('Error al procesar');
    }
    setSubmitting(false);
  };

  if (savedSnapshot) {
    const snap = savedSnapshot;
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', zIndex: theme.zIndex.modal }}>
        <AnimatedSuccess color={COLOR} title="¡Devolución procesada!">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {formatAmount(snap.refundAmount)} de {formatAmount(snap.originalAmount)}
          </Typography>
          {snap.description && (
            <Typography variant="caption" color="text.disabled" sx={{ mb: 3, display: 'block' }}>"{snap.description}"</Typography>
          )}
          <Chip label={`Ahorros  ${formatAmount(snap.newSavings)}`}
            sx={{ bgcolor: alpha(COLOR, 0.08), color: COLOR, fontWeight: 600, px: 1, mb: 4 }} />
          <Button fullWidth variant="contained" size="large" onClick={() => navigate(-1)}
            sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#388E3C' } }}>
            Volver
          </Button>
        </AnimatedSuccess>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Devolución</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* ── STEP 1: Monto ────────────────────────────────────────────── */}
        {step === 0 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <AnimatedItem sx={{ flex: 1 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>MONTO A DEVOLVER</Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, color: COLOR, mt: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' }, textAlign: 'center', wordBreak: 'break-all' }}>
                  {amountDisplay}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Máximo: {formatAmount(originalAmount)}
                </Typography>
              </Box>
            </AnimatedItem>

            <AnimatedItem>
              <Box sx={{ px: 3, pb: 2 }}>
                <Grid container spacing={1}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
                    <Grid item xs={4} key={key}>
                      <Button fullWidth onClick={() => handleKeyPress(key)}
                        sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                        {key === 'backspace' ? <BackspaceIcon /> : key}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <TextField
                  value={amount}
                  onChange={(e) => handleAmountPaste(e.target.value)}
                  placeholder="O pegá el monto acá"
                  size="small"
                  fullWidth
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  inputProps={{ inputMode: 'decimal', autoComplete: 'off' }}
                />
              </Box>
            </AnimatedItem>
          </AnimatedGroup>
        )}

        {/* ── STEP 2: Descripción ───────────────────────────────────────── */}
        {step === 1 && (
          <AnimatedGroup sx={{ px: 3, pt: 2 }}>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {/* ── STEP 3: Confirmación ──────────────────────────────────────── */}
        {step === 2 && (
          <AnimatedGroup sx={{ px: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem>
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar devolución</Typography>
            </AnimatedItem>

            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Gasto original</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>{formatAmount(originalAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Devolución</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: COLOR }}>+ {formatAmount(refundAmount)}</Typography>
                </Box>
                {description.trim() && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">Nota</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{description}</Typography>
                  </Box>
                )}
            </Card></AnimatedItem>

            {/* Ahorros */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(COLOR, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(COLOR, 0.04) }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{formatAmount(currentSavings)}</Typography>
                <Box sx={{ display: 'inline-block', bgcolor: alpha(COLOR, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: COLOR, fontWeight: 600 }}>{deltaText}</Typography>
                </Box>
              </Box>
              <Box sx={{ borderTop: `1px solid ${alpha(COLOR, 0.1)}`, mx: 2.5 }} />
              <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Nuevos ahorros</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLOR, mt: 0.25 }}>{formatAmount(newSavings)}</Typography>
              </Box>
            </Card></AnimatedItem>
          </AnimatedGroup>
        )}      </Box>

      {step < STEPS - 1 ? (
        <WizardFooter label="Siguiente →" disabled={step === 0 ? !isValid : false} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Procesar devolución" disabled={!isValid} onClick={handleSubmit} loading={submitting} color={COLOR} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack === 'Error al procesar' ? 'error' : 'success'} variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcesarDevolucion;
