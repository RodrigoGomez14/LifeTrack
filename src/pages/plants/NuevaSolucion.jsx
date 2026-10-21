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
import CheckIcon from '@mui/icons-material/Check';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import {
  getAmbientPlants,
  getAmbienteSystemVolume,
  getInitialPlantSelection,
  getRdwcGroups,
  isGrowingPlant,
  isHarvestedPlant,
  sortNutrientsByOrder,
} from '../../components/plants/plantsHelpers';
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

// Cantidad con coma decimal y sin ceros de más (1.50 → "1,5").
const formatQty = (value) => {
  const n = Math.round((Number(value) || 0) * 100) / 100;
  return String(n).replace('.', ',');
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

  const activePlants = useMemo(() => userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [], [userData]);
  const ambientes = useMemo(() => userData?.plants?.ambientes || {}, [userData]);

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(() =>
    getInitialPlantSelection(activePlants, ambientes, plantId)
  );
  const [nutrientAmounts, setNutrientAmounts] = useState({});
  const [editBuffer, setEditBuffer] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');
  // Checklist del paso "Revisar": se marca cada nutriente a medida que se agrega.
  // Vive sólo en la sesión del wizard, no se guarda.
  const [addedNutrients, setAddedNutrients] = useState(() => new Set());

  // Ordenados como en /nutrientes: ese orden define los steps del wizard.
  const fertilizantes = useMemo(() => {
    const aditives = userData?.plants?.aditives?.fertilizantes;
    if (!aditives) return [];
    return sortNutrientsByOrder(Object.entries(aditives).map(([id, a]) => ({ id, ...a })));
  }, [userData]);

  const originPlant = useMemo(
    () => activePlants.find((p) => p.id === plantId) || null,
    [activePlants, plantId]
  );

  const originAmbiente = originPlant?.ambienteId ? ambientes[originPlant.ambienteId] : null;
  const originIsHarvested = isHarvestedPlant(originPlant);
  const originIsRdwc = !!originAmbiente?.rdwc && !originIsHarvested;

  // Ambientes de las plantas seleccionadas (sirve para el caso sin ?id=).
  const selectedAmbienteIds = useMemo(() => {
    const ids = new Set();
    selectedPlantIds.forEach((id) => {
      const plant = activePlants.find((p) => p.id === id);
      if (plant?.ambienteId) ids.add(plant.ambienteId);
    });
    return ids;
  }, [selectedPlantIds, activePlants]);

  // El wizard opera en modo RDWC si la planta de origen está en un RDWC o si
  // las plantas seleccionadas son todas de un mismo ambiente RDWC.
  const rdwcAmbienteId = originIsHarvested
    ? null
    : originIsRdwc
      ? originPlant.ambienteId
      : selectedAmbienteIds.size === 1
        ? [...selectedAmbienteIds][0]
        : null;
  const rdwcAmbiente = rdwcAmbienteId && ambientes[rdwcAmbienteId]?.rdwc ? ambientes[rdwcAmbienteId] : null;
  const isRdwc = !!rdwcAmbiente;

  const primaryPlant = useMemo(() => {
    if (isRdwc && originPlant) return originPlant;
    const ids = [...selectedPlantIds];
    if (!ids.length) return originPlant;
    return activePlants.find((p) => p.id === ids[0]) || originPlant;
  }, [selectedPlantIds, activePlants, originPlant, isRdwc]);

  // Plantas del mismo ambiente que la de origen (independiente de la selección).
  const ambientPlants = useMemo(
    () => getAmbientPlants(activePlants, plantId, { excludeHarvested: true }),
    [activePlants, plantId]
  );

  // Plantas en cultivo del sistema RDWC (para calcular el volumen total).
  // Las cosechadas ya no forman parte del sistema de riego.
  const rdwcPlants = useMemo(
    () => (isRdwc
      ? activePlants.filter((p) => p.ambienteId === rdwcAmbienteId && isGrowingPlant(p))
      : []),
    [isRdwc, activePlants, rdwcAmbienteId]
  );

  // Solo son seleccionables las de la misma etapa y maceta que la planta de
  // origen. En RDWC se permite todo el ambiente: la solución es compartida.
  const disabledIds = useMemo(() => {
    if (isRdwc || !originPlant) return new Set();
    return new Set(
      ambientPlants
        .filter((p) => p.etapa !== originPlant.etapa || p.potVolume !== originPlant.potVolume)
        .map((p) => p.id)
    );
  }, [ambientPlants, originPlant, isRdwc]);

  const rdwcGroups = useMemo(() => getRdwcGroups(ambientPlants, ambientes), [ambientPlants, ambientes]);

  // Litros que se usan para calcular agua y nutrientes. En RDWC es el volumen
  // total del sistema; si no está cargado, cae a la suma de macetas.
  const solutionVolume = useMemo(() => {
    if (!isRdwc) return primaryPlant?.potVolume || 0;
    return getAmbienteSystemVolume(rdwcAmbiente, rdwcPlants) || primaryPlant?.potVolume || 0;
  }, [isRdwc, rdwcAmbiente, rdwcPlants, primaryPlant]);

  const mixedStages = isRdwc && new Set(rdwcPlants.map((p) => p.etapa)).size > 1;

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
    // Se recorre la biblioteca (ya ordenada) y no el plan, así el orden de los
    // pasos es el que se eligió arrastrando en /nutrientes.
    return fertilizantes
      .map((n) => {
        const mlPerL = Number(planNutrients[n.id]?.mlPerL) || 0;
        return mlPerL > 0 ? { ...n, suggestion: mlPerL } : null;
      })
      .filter(Boolean);
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

  const toggleAdded = (id) => {
    setAddedNutrients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Selección en bloque para RDWC: agrega o quita todo el ambiente de una vez.
  const handleToggleGroup = (ids, select) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (select ? next.add(id) : next.delete(id)));
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
    if (!hasPlants || (isRdwc && solutionVolume <= 0)) return;
    setSubmitting(true);
    try {
      const date = getDate();
      const nutrientList = suggestedNutrients.map((n) => {
        const dose = nutrientAmounts[n.id] !== undefined ? nutrientAmounts[n.id] : n.suggestion;
        return {
          name: n.name,
          brand: n.brand || '',
          quantity: Math.round(dose * solutionVolume * 10) / 10,
          suggestedDose: `${dose} Ml/L`,
        };
      });
      const waterMl = solutionVolume * 1000;
      const data = {
        date,
        type: 'solution',
        stage: stageInfo?.etapa || '',
        week: stageInfo?.week || 1,
        potVolume: primaryPlant?.potVolume || 0,
        ...(isRdwc ? { rdwc: true, systemVolume: solutionVolume } : {}),
        nutrients: nutrientList.filter((n) => n.quantity > 0),
        waterVolume: waterMl,
        notes: notes.trim() || '',
      };
      for (const id of selectedPlantIds) {
        await addPlantActivity(id, 'irrigations', data);
      }
      setSavedSnapshot({
        nutrients: data.nutrients,
        waterVolume: waterMl,
        notes,
        plantCount: selectedPlantIds.size,
        rdwc: isRdwc,
      });
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
    setAddedNutrients(new Set());
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

  // Receta del paso de revisión: sólo lo que efectivamente se va a preparar.
  const recipeNutrients = suggestedNutrients
    .map((n) => {
      const raw = nutrientAmounts[n.id] !== undefined ? nutrientAmounts[n.id] : n.suggestion;
      return { ...n, dose: Number(raw) || 0 };
    })
    .filter((n) => n.dose > 0);

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

              {isRdwc && rdwcAmbiente && (
                <AnimatedItem>
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(wizardColor, 0.25)}`,
                      bgcolor: alpha(wizardColor, 0.06),
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: wizardColor, display: 'block' }}>
                      RDWC · AMBIENTE {rdwcAmbiente.number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Se registran las {rdwcPlants.length} plantas juntas · {solutionVolume} L de solución.
                      Tocá cualquier planta para seleccionar o destildar todo el sistema.
                    </Typography>
                    {solutionVolume <= 0 && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        Cargá el volumen total del sistema en Ambientes.
                      </Typography>
                    )}
                    {mixedStages && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        Hay plantas en distintas etapas. La dosis se calcula con {primaryPlant?.etapa || 'la planta de origen'}.
                      </Typography>
                    )}
                  </Box>
                </AnimatedItem>
              )}

              <AnimatedItem>
                <PlantMultiSelect
                  plants={ambientPlants}
                  selectedIds={selectedPlantIds}
                  onToggle={togglePlant}
                  color={wizardColor}
                  disabledIds={disabledIds}
                  rdwcGroups={rdwcGroups}
                  onToggleGroup={handleToggleGroup}
                />
              </AnimatedItem>
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

        {/* Step N+1: Review — receta a preparar */}
        {step === totalSteps - 1 && (
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, pb: 3 }}>
            <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Revisar</Typography>
                  </Box>
                </AnimatedItem>

                {/* Plantas */}
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>
                    SE APLICA A
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {selectedPlants.map((p) => (
                      <Chip key={p.id} label={p.name} size="small"
                        sx={{ bgcolor: alpha(wizardColor, 0.14), color: wizardColor, fontWeight: 600 }} />
                    ))}
                  </Box>
                </AnimatedItem>

                {/* Receta */}
                <AnimatedItem>
                  <Box sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', overflow: 'hidden' }}>
                    {/* Base: agua */}
                    <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center', bgcolor: alpha(wizardColor, 0.06) }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        PREPARAR
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: wizardColor, lineHeight: 1.1 }}>
                        {solutionVolume} L
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        de agua
                      </Typography>
                      {isRdwc && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                          Volumen total del sistema · {rdwcPlants.length} plantas
                        </Typography>
                      )}
                    </Box>

                    {/* Ingredientes, en el orden elegido en /nutrientes */}
                    {recipeNutrients.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 2 }}>
                        No hay nutrientes con dosis para esta semana.
                      </Typography>
                    ) : (
                      <Box>
                        {recipeNutrients.map((n, i) => {
                          const total = Math.round(n.dose * solutionVolume * 10) / 10;
                          const isAdded = addedNutrients.has(n.id);
                          return (
                            <Box
                              key={n.id}
                              role="checkbox"
                              aria-checked={isAdded}
                              aria-label={`${n.name}, ${formatQty(total)} ml`}
                              tabIndex={0}
                              onClick={() => toggleAdded(n.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleAdded(n.id);
                                }
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: 2.5,
                                py: 1.5,
                                cursor: 'pointer',
                                borderTop: i > 0 ? '1px solid' : 'none',
                                borderColor: 'divider',
                                transition: 'background-color 0.15s',
                                // Ya agregado: fondo más oscuro (opuesto al hover).
                                bgcolor: isAdded ? alpha(theme.palette.common.black, 0.42) : 'transparent',
                                '&:hover': {
                                  bgcolor: isAdded
                                    ? alpha(theme.palette.common.black, 0.52)
                                    : alpha(theme.palette.action.hover, 0.25),
                                },
                                '&:focus-visible': { outline: `2px solid ${wizardColor}`, outlineOffset: -2 },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: isAdded ? wizardColor : alpha(wizardColor, 0.14),
                                  color: isAdded ? '#fff' : wizardColor,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  transition: 'background-color 0.15s, color 0.15s',
                                }}
                              >
                                {isAdded ? <CheckIcon sx={{ fontSize: 16 }} /> : i + 1}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    color: isAdded ? 'text.secondary' : 'text.primary',
                                    textDecoration: isAdded ? 'line-through' : 'none',
                                  }}
                                  noWrap
                                >
                                  {n.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mt: 0.25 }} noWrap>
                                  {formatQty(n.dose)} ml/L
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 800,
                                    color: isAdded ? 'text.secondary' : wizardColor,
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {formatQty(total)} ml
                                </Typography>
                                {!isRdwc && selectedPlants.length > 1 && (
                                  <Typography
                                    variant="caption"
                                    sx={{ display: 'block', fontWeight: 600, color: 'text.disabled', whiteSpace: 'nowrap', lineHeight: 1.2, mt: 0.25 }}
                                  >
                                    {formatQty(Math.round(total * selectedPlants.length * 10) / 10)} ml
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </AnimatedItem>

                <AnimatedItem>
                  <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                    fullWidth multiline rows={2}
                    placeholder="Ej: Solución para etapa vegetativo..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </AnimatedItem>
              </AnimatedGroup>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {step < totalSteps - 1 ? (
        step === 0 ? (
          <WizardFooter
            label="Siguiente"
            disabled={!hasPlants || (isRdwc && solutionVolume <= 0)}
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
          disabled={!hasPlants || (isRdwc && solutionVolume <= 0)}
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
