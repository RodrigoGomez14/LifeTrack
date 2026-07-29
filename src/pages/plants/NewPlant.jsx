import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Snackbar, Alert, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { addPlant } from '../../services/plants';
import { AnimatedSuccess } from '../../design-system';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const STEPS_TOTAL = 2;

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const NewPlant = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep(1);
  const goBack = () => setStep(0);

  const qty = parseInt(quantity) || 0;
  const canAdvanceStep0 = name.trim() && qty > 0;
  const canSubmit = canAdvanceStep0 && !!birthDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const baseName = name.trim();
      const dateStr = formatDate(birthDate);
      for (let i = 1; i <= qty; i++) {
        await addPlant({
          name: `${baseName} ${i}`,
          etapa: 'Germinacion',
          birthDate: dateStr,
          potVolume: 10,
        });
      }
      setSavedSnapshot({ name: baseName, quantity: qty, birthDate: dateStr });
    } catch (err) {

      setSnack('Error al crear');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setName('');
    setQuantity('');
    setBirthDate(new Date());
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const { name: snapName, quantity: snapQty, birthDate: snapDate } = savedSnapshot;
    return (
      <AnimatedSuccess color="#43a047" title={`¡${snapQty} planta${snapQty !== 1 ? 's' : ''} creada${snapQty !== 1 ? 's' : ''}!`}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {snapName} x{snapQty}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Germinación · Inicio {snapDate}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 3, display: 'block' }}>
          Dia 1
        </Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: '#43a047', color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#2e7d32' } }}>
          Crear otra
        </Button>
        <Button onClick={() => navigate('/plantas')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Plantas</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
        {savedSnapshot ? (
          renderSuccess()
        ) : (
          <>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              {step > 0 ? (
                <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
              ) : (
                <Box sx={{ width: 36 }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nueva planta</Typography>
              <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
            </Box>

            <WizardProgressDots total={STEPS_TOTAL} current={step} color="#43a047" />

            <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Step 0 — Datos básicos */}
              {step === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>DATOS BÁSICOS</Typography>
                  <TextField label="Nombre" placeholder="Ej: Albahaca, Tomate..." value={name} onChange={(e) => setName(e.target.value)} fullWidth required autoFocus
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  <TextField label="Cantidad" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth required
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>
              )}

              {/* Step 1 — Confirmación */}
              {step === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography>

                  <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, pt: 0.5 }}>
                        Plantas
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', maxWidth: '65%' }}>
                        {name.trim()} x{qty}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Inicio de germinación
                      </Typography>
                      <Box sx={{ maxWidth: 160 }}>
                        <DatePicker
                          value={birthDate}
                          onChange={(date) => setBirthDate(date)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {step === 0 ? (
              <WizardFooter
                label="Siguiente →"
                disabled={!canAdvanceStep0}
                onClick={goNext}
                color="#43a047"
              />
            ) : (
              <WizardFooter
                label={`Crear ${qty} planta${qty !== 1 ? 's' : ''}`}
                disabled={!canSubmit}
                onClick={handleSubmit}
                loading={submitting}
                color="#43a047"
              />
            )}

            <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
              <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>
                {snack}
              </Alert>
            </Snackbar>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default NewPlant;
