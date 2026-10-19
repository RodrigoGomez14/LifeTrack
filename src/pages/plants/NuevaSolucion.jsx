import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Grid,
  Chip, Snackbar, Alert, alpha, TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getAmbientPlants } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const STAGE_COLORS = { Vegetativo: '#43a047', Floracion: '#e53935' };
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

const parseDateStr = (str) => {
  if (!str) return null;
  const parts = String(str).split('/');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

const getStageStartDate = (plant, etapa) => {
  const map = {
    Germinacion: plant?.inicioGerminacion || plant?.birthDate,
    Vegetativo: plant?.inicioVegetativo,
    Floracion: plant?.inicioFloracion,
    'Lavado de Raices': plant?.inicioLavado,
    Secado: plant?.inicioSecado,
    Curado: plant?.inicioCurado,
  };
  return parseDateStr(map[etapa]);
};

const NuevaSolucion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [nutrientAmounts, setNutrientAmounts] = useState({});
  const [editBuffer, setEditBuffer] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const activePlants = useMemo(() => userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [], [userData]);

  const fertilizantes = useMemo(() => {
    const aditives = userData?.plants?.aditives?.fertilizantes;
    if (!aditives) return [];
    return Object.entries(aditives).map(([id, a]) => ({ id, ...a }));
  }, [userData]);

  const originPlant = useMemo(
    () => activePlants.find((p) => p.id === plantId) || null,
    [activePlants, plantId]
  );

  const primaryPlant = useMemo(() => {
    const ids = [...selectedPlantIds];
    if (!ids.length) return originPlant;
    return activePlants.find((p) => p.id === ids[0]) || originPlant;
  }, [selectedPlantIds, activePlants, originPlant]);

  // Plantas del mismo ambiente que la de origen (independiente de la selección).
  const ambientPlants = useMemo(() => getAmbientPlants(activePlants, plantId), [activePlants, plantId]);

  // Solo son seleccionables las de la misma etapa y maceta que la planta de origen.
  const disabledIds = useMemo(() => {
    if (!originPlant) return new Set();
    return new Set(
      ambientPlants
        .filter((p) => p.etapa !== originPlant.etapa || p.potVolume !== originPlant.potVolume)
        .map((p) => p.id)
    );
  }, [ambientPlants, originPlant]);

  const stageInfo = useMemo(() => {
    if (!primaryPlant) return null;
    const etapa = primaryPlant.etapa || '';
    if (!['Vegetativo', 'Floracion'].includes(etapa)) return { etapa, week: 1, startDate: null, daysIn: 0 };
    const startDate = getStageStartDate(primaryPlant, etapa);
    const daysDiff = startDate ? Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const rawWeek = Math.ceil(daysDiff / 7);
    const maxWeek = etapa === 'Vegetativo' ? 4 : 9;
    return { etapa, week: Math.min(rawWeek, maxWeek), startDate, daysIn: daysDiff };
  }, [primaryPlant]);

  const suggestedNutrients = useMemo(() => {
    if (!stageInfo || !primaryPlant) return [];
    const { etapa, week } = stageInfo;
    const planNutrients = userData?.plants?.plan?.[etapa]?.[week]?.nutrients || {};
    return Object.entries(planNutrients)
      .map(([nutrientId, dose]) => {
        const n = fertilizantes.find((f) => f.id === nutrientId);
        if (!n) return null;
        const mlPerL = Number(dose?.mlPerL) || 0;
        return { ...n, suggestion: mlPerL };
      })
      .filter((n) => n && n.suggestion > 0);
  }, [fertilizantes, stageInfo, primaryPlant, userData]);

  const wizardColor = STAGE_COLORS[stageInfo?.etapa] || '#43a047';
  const numNutrientSteps = suggestedNutrients.length;
  const totalSteps = 1 + numNutrientSteps + 1;
  const nutrientStepIndex = step - 1;
  const currentNutrient = suggestedNutrients[nutrientStepIndex] || null;
  const hasPlants = selectedPlantIds.size > 0;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getDisplayAmount = () => {
    if (editBuffer === null) {
      if (!currentNutrient) return '0';
      const existing = nutrientAmounts[currentNutrient.id];
      const val = existing !== undefined ? existing : currentNutrient.suggestion;
      return String(val).replace('.', ',');
    }
    return editBuffer || '0';
  };

  const handleNumpad = (key) => {
    const currentStr = editBuffer !== null ? editBuffer : getDisplayAmount();
    if (key === 'backspace') { setEditBuffer(currentStr.slice(0, -1) || ''); return; }
    if (key === ',') {
      if (currentStr.includes(',')) return;
      if (!currentStr || currentStr === '0') { setEditBuffer('0,'); return; }
      setEditBuffer(currentStr + ','); return;
    }
    if (currentStr === '0' && key !== ',') { setEditBuffer(key); return; }
    if (currentStr.includes(',')) { const d = currentStr.split(',')[1]; if (d.length >= 2) return; }
    setEditBuffer(currentStr + key);
  };

  const handleAdvanceFromNutrient = () => {
    if (!currentNutrient) return;
    const val = parseFloat(getDisplayAmount().replace(',', '.')) || 0;
    setNutrientAmounts((prev) => ({ ...prev, [currentNutrient.id]: val }));
    setEditBuffer(null);
    goNext();
  };

  useEffect(() => {
    if (step > 0 && step < totalSteps - 1) {
      setEditBuffer(null);
    }
  }, [step, totalSteps, suggestedNutrients]);

  const handleSubmit = async () => {
    if (!hasPlants) return;
    setSubmitting(true);
    try {
      const date = getDate();
      const potVol = primaryPlant?.potVolume || 0;
      const nutrientList = suggestedNutrients.map((n) => {
        const dose = nutrientAmounts[n.id] !== undefined ? nutrientAmounts[n.id] : n.suggestion;
        return {
          name: n.name,
          brand: n.brand || '',
          quantity: Math.round(dose * potVol * 10) / 10,
          suggestedDose: `${dose} Ml/L`,
        };
      });
      const waterMl = potVol * 1000;
      const data = {
        date,
        type: 'solution',
        stage: stageInfo?.etapa || '',
        week: stageInfo?.week || 1,
        potVolume: primaryPlant?.potVolume || 0,
        nutrients: nutrientList.filter((n) => n.quantity > 0),
        waterVolume: waterMl,
        notes: notes.trim() || '',
      };
      for (const id of selectedPlantIds) {
        await addPlantActivity(id, 'irrigations', data);
      }
      setSavedSnapshot({ nutrients: data.nutrients, waterVolume: waterMl, notes, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setNutrientAmounts({});
    setEditBuffer(null);
    setNotes('');
    setSavedSnapshot(null);
  };

  if (savedSnapshot) {
    const n = savedSnapshot;
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
        <AnimatedSuccess color={wizardColor} title="Solucion registrada!">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mb: 1 }}>
            <Chip label={`${n.waterVolume} ml`} size="small" sx={{ fontWeight: 600 }} />
          </Box>
          {n.nutrients?.length > 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ mb: 1 }}>
              {n.nutrients.map((nu) => `${nu.name} ${nu.quantity}ml`).join(' · ')}
            </Typography>
          )}
          {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
          <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
            sx={{ maxWidth: 320, bgcolor: wizardColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { filter: 'brightness(0.85)' } }}>
            Cargar otra
          </Button>
          <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
        </AnimatedSuccess>
      </Box>
    );
  }

  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nueva Solucion</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={totalSteps} current={step} color={wizardColor} />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Step 0: Plants */}
        {step === 0 && (
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, pb: 2 }}>
            <AnimatedGroup>
              <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                SELECCIONA LAS PLANTAS
              </Typography></AnimatedItem>
              <AnimatedItem><PlantMultiSelect plants={ambientPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={wizardColor} disabledIds={disabledIds} /></AnimatedItem>
            </AnimatedGroup>
          </Box>
        )}

        {/* Steps 1..N: Numpad per nutrient */}
        {step > 0 && step < totalSteps - 1 && currentNutrient && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', px: 2 }}>
                    {currentNutrient.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 2 }}>
                    DOSIS (ml/L)
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: wizardColor }}>
                    {getDisplayAmount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">ml</Typography>
                </Box>
              </AnimatedItem>
              <AnimatedItem>
                <Box sx={{ px: 3, pb: 2 }}>
                  <Grid container spacing={1}>
                    {KEYPAD.map((k) => (
                      <Grid item xs={4} key={k}>
                        <Button fullWidth onClick={() => handleNumpad(k)}
                          sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                          {k === 'backspace' ? <BackspaceIcon /> : k}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AnimatedItem>
            </AnimatedGroup>
          </Box>
        )}

        {/* Step N+1: Review */}
        {step === totalSteps - 1 && (
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, pb: 2 }}>
            <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>

              <AnimatedItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {selectedPlants.map((p) => (
                    <Chip key={p.id} label={p.name} size="small"
                      sx={{ bgcolor: wizardColor, color: 'white', fontWeight: 600 }} />
                  ))}
                </Box>
              </AnimatedItem>

              {stageInfo && (
                <AnimatedItem>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 2, gridColumn: 'span 2', border: `1px solid ${alpha(wizardColor, 0.25)}`, bgcolor: alpha(wizardColor, 0.08) }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        SOLUCIÓN
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: wizardColor }}>
                        {primaryPlant?.potVolume || 0} L
                      </Typography>
                    </Box>
                    {suggestedNutrients.filter((n) => {
                      const dose = nutrientAmounts[n.id] !== undefined ? nutrientAmounts[n.id] : n.suggestion;
                      return dose > 0;
                    }).map((n) => {
                      const dose = nutrientAmounts[n.id] !== undefined ? nutrientAmounts[n.id] : n.suggestion;
                      const vol = primaryPlant?.potVolume || 0;
                      const total = Math.round(dose * vol * 10) / 10;
                      return (
                        <Box key={n.id} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(wizardColor, 0.25)}`, bgcolor: alpha(wizardColor, 0.08) }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            {n.name}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: wizardColor }}>
                            {total} ml
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                            {dose} Ml/L × {vol} L = {total} ml
                          </Typography>
                        </Box>
                      );
                    })}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                        fullWidth multiline rows={2}
                        placeholder="Ej: Solucion para etapa vegetativo..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Box>
                  </Box>
                </AnimatedItem>
              )}
            </AnimatedGroup>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {step < totalSteps - 1 ? (
        step === 0 ? (
          <WizardFooter
            label="Siguiente"
            disabled={!hasPlants}
            onClick={goNext}
            color={wizardColor}
          />
        ) : currentNutrient ? (
          <WizardFooter
            label={nutrientStepIndex < numNutrientSteps - 1
              ? `Siguiente (${nutrientStepIndex + 1}/${numNutrientSteps})`
              : 'Revisar'}
            onClick={handleAdvanceFromNutrient}
            color={wizardColor}
          />
        ) : null
      ) : (
        <WizardFooter
          label={`Guardar solucion${selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size})` : ''}`}
          disabled={!hasPlants}
          onClick={handleSubmit}
          loading={submitting}
          color={wizardColor}
        />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NuevaSolucion;
