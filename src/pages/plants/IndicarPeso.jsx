import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Snackbar, Alert, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { updatePlant } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

const COLOR = '#E65100';
const STEPS = 2;

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const IndicarPeso = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const tipo = new URLSearchParams(location.search).get('tipo') || 'humedo';
  const isHumedo = tipo === 'humedo';
  const title = isHumedo ? 'Peso Húmedo' : 'Peso Seco';
  const field = isHumedo ? 'pesoHumedo' : 'pesoSeco';

  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep(1);
  const goBack = () => setStep(0);

  const plant = useMemo(() => {
    if (!userData?.plants) return null;
    const key = plantId;
    if (userData.plants.active?.[key]) return { ...userData.plants.active[key], id: key };
    if (userData.plants.history?.[key]) return { ...userData.plants.history[key], id: key };
    return null;
  }, [userData, plantId]);

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setRaw((v) => v.slice(0, -1)); return; }
    if (raw === '0' && key !== ',') { setRaw(key); return; }
    setRaw((v) => v + key);
  };

  const formatDisplay = (val) => {
    if (!val || val === '0') return '0';
    const parts = val.split(',');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts[1] !== undefined ? `${int},${parts[1]}` : int;
  };

  const pesoGramos = raw ? parseInt(raw.replace(',', '')) : 0;
  const canAdvance = pesoGramos > 0;

  const handleSubmit = async () => {
    if (!canAdvance || !plant) return;
    setSubmitting(true);
    try {
      const date = formatDate(fecha) || getDate();
      await updatePlant(plant.id, { [field]: pesoGramos }, { isArchived: false });
      setSavedSnapshot({ pesoGramos, plantName: plant.name, title });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setRaw('');
    setFecha(new Date());
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    return (
      <AnimatedSuccess color={COLOR} title={`¡${savedSnapshot.title} registrado!`}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {savedSnapshot.plantName}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, color: COLOR, mb: 2 }}>
          {savedSnapshot.pesoGramos}g
        </Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#e65100' } }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? renderSuccess() : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>{title}</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {step === 0 && (
              <AnimatedGroup sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
                      {isHumedo ? 'PESO HÚMEDO' : 'PESO SECO'}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: COLOR, mt: 1, mb: 0.5, fontSize: { xs: '3rem', sm: '4.5rem' }, textAlign: 'center' }}>
                      {raw ? formatDisplay(raw) : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      gramos
                    </Typography>
                    {plant && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                        {plant.name}
                      </Typography>
                    )}
                  </Box>
                </AnimatedItem>

                <AnimatedItem>
                  <Box sx={{ px: 3, pb: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
                        <Button key={key} fullWidth onClick={() => handleKeyPress(key)}
                          sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                          {key === 'backspace' ? <BackspaceIcon /> : key}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 3, pt: 2 }}>
                <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography></AnimatedItem>
                <AnimatedItem><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">Planta</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{plant?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLOR }}>{pesoGramos}g</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">Fecha</Typography>
                    <Box sx={{ maxWidth: 160 }}>
                      <DatePicker
                        value={fecha}
                        onChange={(d) => d && setFecha(d)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box></AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step === 0 ? (
            <WizardFooter label="Siguiente →" disabled={!canAdvance} onClick={goNext} color={COLOR} />
          ) : (
            <WizardFooter label={`Guardar ${title}`} disabled={!canAdvance} onClick={handleSubmit} loading={submitting} color={COLOR} />
          )}

          <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
          </Snackbar>
        </>
      )}
    </Box>
    </LocalizationProvider>
  );
};

export default IndicarPeso;
