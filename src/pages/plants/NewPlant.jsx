import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, CardContent,
  Snackbar, Alert, alpha, Paper, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { addPlant } from '../../services/plants';
import { AnimatedSuccess } from '../../design-system';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const STAGE_OPTIONS = [
  { key: 'Germinacion', label: 'Germinación', desc: 'Desde semilla hasta las primeras hojas', icon: SpaIcon, color: '#8e24aa' },
  { key: 'Vegetativo', label: 'Vegetativo', desc: 'Crecimiento de tallos y hojas', icon: GrassIcon, color: '#43a047' },
  { key: 'Floracion', label: 'Floración', desc: 'Desarrollo de flores y frutos', icon: LocalFloristIcon, color: '#e53935' },
];

const STEPS_TOTAL = 5;

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const OptionCardGrid = ({ options, selected, onSelect, accent }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {options.map((opt) => {
      const isSel = selected === opt.key;
      const Icon = opt.icon;
      return (
        <Card
          key={opt.key}
          variant="outlined"
          onClick={() => onSelect(opt.key)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, borderRadius: 2, cursor: 'pointer',
            borderColor: isSel ? accent : 'divider',
            borderWidth: isSel ? 2 : 1,
            bgcolor: isSel ? alpha(accent, 0.04) : 'transparent',
            transition: 'all 0.12s',
            '&:hover': { borderColor: accent },
          }}
        >
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(opt.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', color: opt.color, flexShrink: 0 }}>
            <Icon />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
            <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
          </Box>
        </Card>
      );
    })}
  </Box>
);

const NewPlant = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [genetic, setGenetic] = useState('');
  const [quantity, setQuantity] = useState('');
  const [potVolume, setPotVolume] = useState('');
  const [etapa, setEtapa] = useState('Germinacion');
  const [birthDate, setBirthDate] = useState(null);
  const [inicioVegetativo, setInicioVegetativo] = useState(null);
  const [inicioFloracion, setInicioFloracion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS_TOTAL - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const canAdvanceStep0 = name.trim() && genetic.trim();
  const canAdvanceStep1 = quantity && parseInt(quantity) > 0;
  const canSubmit = canAdvanceStep0 && canAdvanceStep1 && !!birthDate;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const plantData = {
        name: name.trim(),
        quantity: parseInt(quantity),
        potVolume: potVolume ? parseFloat(potVolume) : null,
        etapa,
        genetic: genetic.trim(),
        birthDate: formatDate(birthDate),
        ...(inicioVegetativo ? { inicioVegetativo: formatDate(inicioVegetativo) } : {}),
        ...(inicioFloracion ? { inicioFloracion: formatDate(inicioFloracion) } : {}),
      };
      addPlant(plantData);
      setSavedSnapshot({ name: name.trim(), genetic: genetic.trim(), quantity, potVolume, etapa });
    } catch (err) {
      console.error(err);
      setSnack('Error al crear');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setName('');
    setGenetic('');
    setQuantity('');
    setPotVolume('');
    setEtapa('Germinacion');
    setBirthDate(null);
    setInicioVegetativo(null);
    setInicioFloracion(null);
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const stageLabel = STAGE_OPTIONS.find((s) => s.key === n.etapa)?.label || n.etapa;
    return (
      <AnimatedSuccess color="#43a047" title="¡Planta creada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{n.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{n.genetic}{n.quantity ? ` · ${n.quantity} unidad${n.quantity !== '1' ? 'es' : ''}` : ''}</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 3 }}>{stageLabel}{n.potVolume ? ` · ${n.potVolume}L` : ''}</Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: '#43a047', color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#2e7d32' } }}>
          Crear otra
        </Button>
        <Button onClick={() => navigate('/plantas')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Plantas</Button>
      </AnimatedSuccess>
    );
  };

  const StageIcon = STAGE_OPTIONS.find((s) => s.key === etapa)?.icon || SpaIcon;

  return (
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

        {/* Step 0: Name + Genetic */}
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>DATOS BÁSICOS</Typography>
            <TextField label="Nombre" placeholder="Ej: Albahaca, Tomate..." value={name} onChange={(e) => setName(e.target.value)} fullWidth required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Genética" placeholder="Ej: White Widow, Northern Lights..." value={genetic} onChange={(e) => setGenetic(e.target.value)} fullWidth required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        )}

        {/* Step 1: Quantity + Pot volume */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>CANTIDAD Y MACETA</Typography>
            <TextField label="Cantidad" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth required
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Volumen de maceta (L)" type="number" value={potVolume} onChange={(e) => setPotVolume(e.target.value)} fullWidth
              inputProps={{ min: 0.1, step: 0.1 }}
              helperText="Opcional"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        )}

        {/* Step 2: Stage */}
        {step === 2 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>ETAPA INICIAL</Typography>
            <OptionCardGrid options={STAGE_OPTIONS} selected={etapa} onSelect={setEtapa} accent="#43a047" />
          </Box>
        )}

        {/* Step 3: Dates */}
        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>FECHAS</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de nacimiento"
                value={birthDate}
                onChange={(date) => setBirthDate(date)}
                slotProps={{ textField: { fullWidth: true, required: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
              />
              <DatePicker
                label="Inicio de Vegetativo"
                value={inicioVegetativo}
                onChange={(date) => setInicioVegetativo(date)}
                disabled={etapa === 'Germinacion'}
                slotProps={{ textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
              />
              <DatePicker
                label="Inicio de Floración"
                value={inicioFloracion}
                onChange={(date) => setInicioFloracion(date)}
                disabled={etapa !== 'Floracion'}
                slotProps={{ textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
              />
            </LocalizationProvider>
          </Box>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(STAGE_OPTIONS.find((s) => s.key === etapa)?.color || '#43a047', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', color: STAGE_OPTIONS.find((s) => s.key === etapa)?.color }}>
                <StageIcon sx={{ fontSize: 28 }} />
              </Box>
            </Box>

            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Nombre</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Genética</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{genetic}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{quantity}</Typography>
              </Box>
              {potVolume && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Maceta</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{potVolume}L</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Etapa</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{STAGE_OPTIONS.find((s) => s.key === etapa)?.label}</Typography>
              </Box>
              {birthDate && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Nacimiento</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(birthDate)}</Typography>
                </Box>
              )}
              {inicioVegetativo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Inicio Veg.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(inicioVegetativo)}</Typography>
                </Box>
              )}
              {inicioFloracion && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">Inicio Flor.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(inicioFloracion)}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {step < STEPS_TOTAL - 1 ? (
        <WizardFooter
          label="Siguiente →"
          disabled={step === 0 ? !canAdvanceStep0 : step === 1 ? !canAdvanceStep1 : false}
          onClick={goNext}
          color="#43a047"
        />
      ) : (
        <WizardFooter
          label="Crear planta"
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
  );
};

export default NewPlant;
