import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Card,
  Avatar,
  Checkbox,
  Chip,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import * as db from '../../services/database';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';

const STAGE_ICONS = {
  Germinacion: SpaIcon, Vegetativo: GrassIcon, Floracion: LocalFloristIcon,
  Secado: ParkIcon, Enfrascado: ForestIcon,
};
const STAGE_COLORS = {
  Germinacion: '#8e24aa', Vegetativo: '#43a047', Floracion: '#e53935',
  Secado: '#fb8c00', Enfrascado: '#546e7a',
};

const STEPS = [
  { key: 'ph', label: 'pH', unit: '', hint: 'Medí el pH de la solución' },
  { key: 'ec', label: 'EC', unit: 'mS/cm', hint: 'Medí la conductividad eléctrica' },
  { key: 'ppm', label: 'PPM', unit: '', hint: 'Medí las partes por millón' },
  { key: 'waterTemp', label: 'Temp. agua', unit: '°C', hint: 'Medí la temperatura del agua' },
];

const TOTAL_STEPS = 5;

const now = () => new Date();
const formatTime = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const LogPlantaWizard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';
  const logDate = dateParam || getDate();
  const irrKey = new URLSearchParams(location.search).get('irrKey') || '';
  const prePh = new URLSearchParams(location.search).get('ph') || '';
  const preEc = new URLSearchParams(location.search).get('ec') || '';
  const prePpm = new URLSearchParams(location.search).get('ppm') || '';
  const preWaterTemp = new URLSearchParams(location.search).get('waterTemp') || '';
  const preNotes = new URLSearchParams(location.search).get('notes') || '';

  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ ph: prePh, ec: preEc, ppm: prePpm, waterTemp: preWaterTemp });
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [notes, setNotes] = useState(preNotes);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const timestamp = useMemo(() => now(), []);

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const isPlantStep = step === 0;
  const isConfirmStep = step === 5;
  const currentStep = !isPlantStep && !isConfirmStep ? STEPS[step - 1] : null;

  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleKeyPress = (key) => {
    const field = currentStep?.key;
    if (!field) return;
    const current = values[field];
    if (key === 'backspace') { setValues((v) => ({ ...v, [field]: current.slice(0, -1) })); return; }
    if (key === ',') {
      if (current.includes(',')) return;
      if (!current) { setValues((v) => ({ ...v, [field]: '0,' })); return; }
      setValues((v) => ({ ...v, [field]: current + ',' })); return;
    }
    if (current === '0' && key !== ',') { setValues((v) => ({ ...v, [field]: key })); return; }
    if (current.includes(',')) { const decimals = current.split(',')[1]; if (decimals.length >= 2) return; }
    setValues((v) => ({ ...v, [field]: current + key }));
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const allFieldsFilled = STEPS.every((s) => values[s.key] !== '');
  const hasPlants = selectedPlantIds.size > 0;

  const handleSubmit = async () => {
    if (!hasPlants || !allFieldsFilled) return;
    setSubmitting(true);
    try {
      const data = {
        date: logDate,
        time: formatTime(timestamp),
        ...(values.ph ? { ph: parseFloat(values.ph.replace(',', '.')) } : {}),
        ...(values.ec ? { ec: parseFloat(values.ec.replace(',', '.')) } : {}),
        ...(values.ppm ? { ppm: parseInt(values.ppm.replace(',', '.')) } : {}),
        ...(values.waterTemp ? { waterTemp: parseInt(values.waterTemp.replace(',', '.')) } : {}),
        notes: notes.trim() || '',
      };
      for (const id of selectedPlantIds) {
        if (irrKey) {
          await db.update(`plants/active/${id}/logs/${irrKey}`, data);
        } else {
          await addPlantActivity(id, 'logs', data);
        }
      }
      const count = selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size} plantas)` : '';
      setSnack(`Log guardado${count}`);
      setTimeout(() => navigate(-1), 400);
    } catch (err) {
      console.error(err);
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const formatDisplay = (raw) => {
    if (!raw) return '';
    if (raw === '0') return '0';
    const parts = raw.split(',');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts[1] !== undefined ? `${int},${parts[1]}` : int;
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
        ) : (
          <IconButton onClick={() => navigate(-1)} size="small"><CloseIcon /></IconButton>
        )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>
          Log de planta
        </Typography>
        <Box sx={{ width: 36 }} />
      </Box>

      <WizardProgressDots total={TOTAL_STEPS + 1} current={step} />

      {/* Step 0: Plant multi-select */}
      {isPlantStep && (
        <>
          <Box sx={{ flex: 1, overflow: 'auto', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography>
            <PlantMultiSelect plants={activePlants} selectedIds={selectedPlantIds} onToggle={togglePlant} />
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            <Button fullWidth variant="contained" disabled={!hasPlants} onClick={goNext}
              sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
              Siguiente →
            </Button>
          </Box>
        </>
      )}

      {/* Steps 1-4: Measurement inputs with numpad */}
      {!isPlantStep && !isConfirmStep && currentStep && (
        <>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
              {currentStep.label}
            </Typography>
            <Typography variant="h2" sx={{
              fontWeight: 700, color: theme.palette.primary.main, mt: 1, mb: 0.5,
              fontSize: { xs: '3rem', sm: '4rem' }, textAlign: 'center',
            }}>
              {values[currentStep.key] ? formatDisplay(values[currentStep.key]) : '-'}
            </Typography>
            {currentStep.unit && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {currentStep.unit}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              {currentStep.hint}
            </Typography>
          </Box>

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

          <Box sx={{ px: 3, pb: 3 }}>
            <Button fullWidth variant="contained" onClick={goNext}
              sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
              Siguiente →
            </Button>
          </Box>
        </>
      )}

      {/* Step 5: Confirm */}
      {isConfirmStep && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>

          {/* Selected plants */}
          {selectedPlants.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {selectedPlants.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  icon={React.createElement(STAGE_ICONS[p.etapa] || SpaIcon)}
                  size="small"
                  sx={{
                    bgcolor: alpha(STAGE_COLORS[p.etapa] || theme.palette.primary.main, 0.1),
                    color: STAGE_COLORS[p.etapa] || theme.palette.primary.main,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: STAGE_COLORS[p.etapa] || theme.palette.primary.main },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <Typography variant="caption">{logDate} · {formatTime(timestamp)}</Typography>
          </Box>

          <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
            {STEPS.map((s) => {
              const raw = values[s.key];
              if (!raw) return null;
              return (
                <Box key={s.key} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDisplay(raw)}{s.unit ? ` ${s.unit}` : ''}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <TextField
            label="Nota (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: Cambié la solución, agregué Bio Grow..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      )}

      {/* Submit / back for confirm step */}
      {isConfirmStep && (
        <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button fullWidth variant="contained" disabled={!hasPlants || !allFieldsFilled || submitting} onClick={handleSubmit}
            sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
            {submitting ? 'Guardando...' : `Guardar log${selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size})` : ''}`}
          </Button>
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.startsWith('Log guardado') ? 'success' : 'error'} variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LogPlantaWizard;
