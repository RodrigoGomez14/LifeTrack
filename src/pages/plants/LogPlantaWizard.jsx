import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, TextField,
  Card, Avatar, Chip, Snackbar, Alert, alpha,
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
import WavesIcon from '@mui/icons-material/Waves';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';
import * as db from '../../services/database';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getAmbientPlants } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';

const STAGE_ICONS = {
  Germinacion: SpaIcon, Vegetativo: GrassIcon, Floracion: LocalFloristIcon,
  'Lavado de Raices': WavesIcon,
  Secado: ParkIcon, Curado: ForestIcon,
};
const STAGE_COLORS = {
  Germinacion: '#8e24aa', Vegetativo: '#43a047', Floracion: '#e53935',
  'Lavado de Raices': '#00acc1',
  Secado: '#fb8c00', Curado: '#546e7a',
};

const STEPS = [
  { key: 'ph', label: 'pH', unit: '', hint: 'Medí el pH de la solución' },
  { key: 'ec', label: 'EC', unit: 'mS/cm', hint: 'Medí la conductividad eléctrica' },
  { key: 'ppm', label: 'PPM', unit: '', hint: 'Medí las partes por millón' },
  { key: 'waterTemp', label: 'Temp. agua', unit: '°C', hint: 'Medí la temperatura del agua' },
];

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

  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ ph: '', ec: '', ppm: '', waterTemp: '' });
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');
  const [customDate, setCustomDate] = useState(null);

  const submittingRef = useRef(false);

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  // Solo las plantas del ambiente de la planta de origen (independiente de la selección).
  const scopedPlants = useMemo(() => getAmbientPlants(activePlants, plantId), [activePlants, plantId]);

  const { groupA, groupB, groupC } = useMemo(() => {
    const a = [];
    const b = [];
    const c = [];
    scopedPlants.forEach((p) => {
      const logs = p.logs ? Object.values(p.logs) : [];
      const completeLog = logs.find((e) =>
        e.date === logDate && e.ph !== undefined && e.ec !== undefined && e.ppm !== undefined
      );
      if (completeLog) {
        if (completeLog.phReg === undefined) a.push(p);
        else c.push(p);
      } else {
        b.push(p);
      }
    });
    return { groupA: a, groupB: b, groupC: c };
  }, [scopedPlants, logDate]);

  const activeGroup = useMemo(() => {
    if (selectedPlantIds.size === 0) return null;
    const firstId = [...selectedPlantIds][0];
    if (groupA.some((p) => p.id === firstId)) return 'a';
    return 'b';
  }, [selectedPlantIds, groupA]);

  const headingPlant = useMemo(() => {
    if (plantId) return activePlants.find((p) => p.id === plantId);
    return null;
  }, [activePlants, plantId]);

  const mode = activeGroup === 'a' ? 'regulate' : null;
  const TOTAL_STEPS = mode === 'regulate' ? 2 : 6;

  const isPlantStep = step === 0;
  const isLastStep = step === TOTAL_STEPS - 1;
  const currentStep = !isPlantStep && !isLastStep && mode !== 'regulate' ? STEPS[step - 1] : null;

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
    const field = mode === 'regulate' ? 'ph' : currentStep?.key;
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

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const allFieldsFilled = STEPS.every((s) => values[s.key] !== '');
  const hasPlants = selectedPlantIds.size > 0;

  const handleSubmitFull = async () => {
    if (!hasPlants || !allFieldsFilled || submittingRef.current) return;
    setSubmitting(true);
    submittingRef.current = true;
    const snapshot = { values: { ...values }, notes, plantCount: selectedPlantIds.size, mode: 'full' };
    setSavedSnapshot(snapshot);
    try {
      const data = {
        date: customDate || logDate,
        time: formatTime(now()),
        ...(values.ph ? { ph: parseFloat(values.ph.replace(',', '.')) } : {}),
        ...(values.ec ? { ec: parseFloat(values.ec.replace(',', '.')) } : {}),
        ...(values.ppm ? { ppm: parseInt(values.ppm.replace(',', '.')) } : {}),
        ...(values.waterTemp ? { waterTemp: parseInt(values.waterTemp.replace(',', '.')) } : {}),
        notes: notes.trim() || '',
      };
      for (const id of selectedPlantIds) {
        await addPlantActivity(id, 'logs', data);
      }
    } catch (err) {
      setSavedSnapshot(null);
      setSnack('Error al guardar');
    }
    submittingRef.current = false;
    setSubmitting(false);
  };

  const handleSubmitRegulate = async () => {
    if (selectedPlantIds.size === 0 || !values.ph || submittingRef.current) return;
    const snapshot = { values: { ...values }, plantCount: selectedPlantIds.size, mode: 'regulate' };
    setSavedSnapshot(snapshot);
    setSubmitting(true);
    submittingRef.current = true;
    try {
      const t = formatTime(now());
      const phReg = parseFloat(values.ph.replace(',', '.'));
      for (const pid of selectedPlantIds) {
        const plant = activePlants.find((p) => p.id === pid);
        const logEntry = plant?.logs
          ? Object.entries(plant.logs).find(([, e]) => e.date === logDate && e.ph !== undefined && e.ec !== undefined && e.ppm !== undefined)
          : null;
        if (logEntry) {
          const [logKey] = logEntry;
          await db.update(`plants/active/${pid}/logs/${logKey}`, { phReg, time: t });
        }
      }
    } catch (err) {
      setSavedSnapshot(null);
      setSnack('Error al guardar');
    }
    submittingRef.current = false;
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setValues({ ph: '', ec: '', ppm: '', waterTemp: '' });
    setNotes('');
    setSavedSnapshot(null);
  };

  const formatDisplay = (raw) => {
    if (!raw) return '';
    if (raw === '0') return '0';
    const parts = raw.split(',');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts[1] !== undefined ? `${int},${parts[1]}` : int;
  };

  const showGroupA = activeGroup === null || activeGroup === 'a';
  const showGroupB = activeGroup === null || activeGroup === 'b';
  const disabledIds = useMemo(() => new Set(groupC.map((p) => p.id)), [groupC]);

  const currentPhFromLog = useMemo(() => {
    if (mode !== 'regulate') return null;
    const firstPlant = groupA.find((p) => selectedPlantIds.has(p.id));
    if (!firstPlant?.logs) return null;
    const log = Object.values(firstPlant.logs).find(
      (e) => e.date === logDate && e.ph !== undefined && e.ec !== undefined && e.ppm !== undefined
    );
    return log?.ph ?? null;
  }, [mode, groupA, selectedPlantIds, logDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        savedSnapshot.mode === 'regulate' ? (
          <AnimatedSuccess color="#4CAF50" title="¡pH regulado!">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {savedSnapshot.plantCount > 1 ? `${savedSnapshot.plantCount} plantas` : '1 planta'}
            </Typography>
            <Chip label={`pH regulado ${savedSnapshot.values.ph}`} size="small" sx={{ fontWeight: 600 }} />
            <Button variant="contained" size="large" onClick={handleLoadAnother}
              sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, mt: 3 }}>
              Cargar otro
            </Button>
            <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
          </AnimatedSuccess>
        ) : (
          <AnimatedSuccess color={theme.palette.primary.main} title="¡Log guardado!">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {savedSnapshot.plantCount > 1 ? `${savedSnapshot.plantCount} plantas` : '1 planta'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mb: 1 }}>
              {savedSnapshot.values.ph && <Chip label={`pH ${savedSnapshot.values.ph}`} size="small" sx={{ fontWeight: 600 }} />}
              {savedSnapshot.values.ec && <Chip label={`EC ${savedSnapshot.values.ec}`} size="small" sx={{ fontWeight: 600 }} />}
              {savedSnapshot.values.ppm && <Chip label={`PPM ${savedSnapshot.values.ppm}`} size="small" sx={{ fontWeight: 600 }} />}
              {savedSnapshot.values.waterTemp && <Chip label={`${savedSnapshot.values.waterTemp}°C`} size="small" sx={{ fontWeight: 600 }} />}
            </Box>
            {savedSnapshot.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{savedSnapshot.notes}"</Typography>}
            <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
              sx={{ maxWidth: 320, borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', mt: savedSnapshot.notes ? 0 : 3 }}>
              Cargar otro
            </Button>
            <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
          </AnimatedSuccess>
        )
      ) : (
        <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
        ) : (
          <Box sx={{ width: 36 }} />
        )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>
          {headingPlant ? `Log ${headingPlant.name}` : (mode === 'regulate' ? 'Regular pH' : 'Log de planta')}
        </Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={TOTAL_STEPS} current={step} color={mode === 'regulate' ? '#4CAF50' : undefined} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Step 0: Plant multi-select */}
      {isPlantStep && (
        <>
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, px: 3, pb: 1 }}>
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block' }}>
                SELECCIONÁ LAS PLANTAS
              </Typography>
            </AnimatedItem>

            {showGroupA && groupA.length > 0 && (
              <AnimatedItem>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4CAF50', mb: 0.5, display: 'block' }}>
                  {activeGroup === 'a' ? 'CON LOG DEL DÍA' : 'CON LOG — regular pH'}
                </Typography>
                <PlantMultiSelect plants={groupA} selectedIds={selectedPlantIds} onToggle={togglePlant} color="#4CAF50" />
              </AnimatedItem>
            )}

            {showGroupB && groupB.length > 0 && (
              <AnimatedItem>
                <Typography variant="caption" sx={{ fontWeight: 600, color: activeGroup === 'b' ? theme.palette.primary.main : 'text.secondary', mb: 0.5, mt: showGroupA ? 2 : 0, display: 'block' }}>
                  {activeGroup === 'b' ? 'SIN LOG' : 'SIN LOG — cargar nuevo'}
                </Typography>
                <PlantMultiSelect plants={groupB} selectedIds={selectedPlantIds} onToggle={togglePlant} />
              </AnimatedItem>
            )}

            {groupC.length > 0 && (
              <AnimatedItem>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled', mb: 0.5, mt: 2, display: 'block' }}>
                  COMPLETAS · YA REGULADAS
                </Typography>
                <PlantMultiSelect plants={groupC} selectedIds={new Set()} onToggle={() => {}} disabledIds={disabledIds} />
              </AnimatedItem>
            )}

            {(groupA.length === 0 && groupB.length === 0 && groupC.length === 0 && scopedPlants.length > 0) && (
              <AnimatedItem>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No hay plantas activas
                </Typography>
              </AnimatedItem>
            )}
          </AnimatedGroup>
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button fullWidth variant="contained" disabled={!hasPlants} onClick={goNext}
            sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
            Siguiente →
          </Button>
        </Box>
        </>
      )}

      {/* Mode 'regulate': single pH regulation step */}
      {!isPlantStep && mode === 'regulate' && (
        <AnimatedGroup sx={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
              {currentPhFromLog !== null && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1, color: 'text.secondary' }}>
                    PH ACTUAL
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {currentPhFromLog}
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
                pH REGULADO
              </Typography>
              <Typography variant="h2" sx={{
                fontWeight: 700, color: '#4CAF50', mt: 1, mb: 0.5,
                fontSize: { xs: '3.5rem', sm: '4.5rem' }, textAlign: 'center',
              }}>
                {values.ph ? formatDisplay(values.ph) : '-'}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Medí el pH después de regular
              </Typography>
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

          <AnimatedItem>
            <Box sx={{ px: 3, pb: 3 }}>
              <Button fullWidth variant="contained" disabled={!values.ph || submitting} onClick={handleSubmitRegulate}
                sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem', bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}>
                {submitting ? 'Guardando...' : `Guardar pH${selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size})` : ''}`}
              </Button>
            </Box>
          </AnimatedItem>
        </AnimatedGroup>
      )}

      {/* Mode 'full': Steps 1-4 (measurements) */}
      {!isPlantStep && !isLastStep && mode !== 'regulate' && currentStep && (
        <AnimatedGroup sx={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
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

          <AnimatedItem>
            <Box sx={{ px: 3, pb: 3 }}>
              <Button fullWidth variant="contained" onClick={goNext}
                sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                Siguiente →
              </Button>
            </Box>
          </AnimatedItem>
        </AnimatedGroup>
      )}

      {/* Mode 'full': Step 5 (Review) */}
      {isLastStep && mode !== 'regulate' && (
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>

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

          <ReviewCard>
            <ReviewRow label="Fecha">
              <Box sx={{ maxWidth: 160 }}>
                <DatePicker
                  value={customDate ? (() => { const [d, m, y] = customDate.split('/'); return new Date(+y, +m - 1, +d); })() : (() => { const [d, m, y] = logDate.split('/'); return new Date(+y, +m - 1, +d); })()}
                  onChange={(date) => {
                    if (date) {
                      const dd = String(date.getDate()).padStart(2, '0');
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const yy = date.getFullYear();
                      setCustomDate(`${dd}/${mm}/${yy}`);
                    }
                  }}
                  slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                />
              </Box>
            </ReviewRow>
            {STEPS.map((s) => {
              const raw = values[s.key];
              if (!raw) return null;
              return (
                <ReviewRow key={s.key} label={s.label} value={`${formatDisplay(raw)}${s.unit ? ` ${s.unit}` : ''}`} />
              );
            })}
          </ReviewCard>

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

      {isLastStep && mode !== 'regulate' && (
        <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button fullWidth variant="contained" disabled={!hasPlants || !allFieldsFilled || submitting} onClick={handleSubmitFull}
            sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
            {submitting ? 'Guardando...' : `Guardar log${selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size})` : ''}`}
          </Button>
        </Box>
      )}

      </Box>

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

export default LogPlantaWizard;
