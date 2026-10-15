import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card,
  Chip, Snackbar, Alert, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getBaseName } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';

const COLOR = '#9C27B0';
const STEPS = 4;

const getFertilizantes = (aditives) => {
  if (!aditives?.fertilizantes) return [];
  return Object.entries(aditives.fertilizantes).map(([id, a]) => ({ id, ...a }));
};

const NuevoSuplemento = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [selectedAditives, setSelectedAditives] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const filteredPlants = useMemo(() => {
    if (selectedPlantIds.size === 0) return activePlants;
    const firstId = [...selectedPlantIds][0];
    const base = getBaseName(activePlants.find((p) => p.id === firstId)?.name);
    if (!base) return activePlants;
    return activePlants.filter((p) => getBaseName(p.name) === base);
  }, [selectedPlantIds, activePlants]);

  const fertilizantes = getFertilizantes(userData?.plants?.aditives);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddAditive = (aditiveId) => {
    const aditive = fertilizantes.find((a) => a.id === aditiveId);
    if (!aditive) return;
    const dose = aditive.dosis?.[0];
    const doseLabel = dose
      ? (dose.aplicacion ? `${dose.aplicacion} · ${dose.forma} · ${dose.quantity} Ml/L` : (dose.name || ''))
      : '';
    setSelectedAditives((prev) => [
      ...prev,
      { id: aditiveId, name: aditive.name, dosis: doseLabel, brand: aditive.brand || '' },
    ]);
  };

  const handleRemoveAditive = (idx) => {
    setSelectedAditives((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedPlantIds.size || !selectedAditives.length) return;
    setSubmitting(true);
    try {
      const date = dateParam || getDate();
      const data = {
        date,
        aditives: selectedAditives.map((a) => ({ name: a.name, dosis: a.dosis })),
        notes: notes.trim() || '',
      };
      const promises = [];
      for (const id of selectedPlantIds) {
        promises.push(addPlantActivity(id, 'irrigations', data));
      }
      await Promise.all(promises);
      setSavedSnapshot({ aditives: selectedAditives, notes, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedAditives([]);
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    return (
      <AnimatedSuccess color={COLOR} title="¡Suplemento registrado!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        {n.aditives?.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1 }}>
            {n.aditives.map((a) => `${a.name} · ${a.dosis}`).join(', ')}
          </Typography>
        )}
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#7b1fa2' }, mt: n.notes ? 0 : 3 }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Suplemento</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography></AnimatedItem>
            <AnimatedItem><PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} /></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
              SUPLEMENTOS
            </Typography>
            {selectedAditives.map((a, idx) => (
              <Chip key={idx} label={`${a.name} · ${a.dosis}`} onDelete={() => handleRemoveAditive(idx)} size="small"
                sx={{ mr: 0.5, mb: 0.5, fontWeight: 500 }} />
            ))}

            {fertilizantes.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {fertilizantes.filter((a) => !selectedAditives.find((s) => s.id === a.id)).map((a) => (
                  <Chip key={a.id} icon={<AddIcon sx={{ fontSize: 14 }} />} label={a.name} onClick={() => handleAddAditive(a.id)} variant="outlined" size="small"
                    sx={{ fontWeight: 500, '&:hover': { borderColor: COLOR } }} />
                ))}
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">No hay suplementos en la biblioteca. Agregalos desde Aditivos.</Typography>
            )}
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 2 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3}
              placeholder="Ej: Apliqué 2ml de BioBloom..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 3 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>
            <AnimatedItem><ReviewCard color={COLOR}>
              <ReviewRow label="Suplementos" value={selectedAditives.length} />
              {selectedAditives.map((a, i) => (
                <ReviewRow key={i} label={a.name} value={a.dosis} color="text.secondary" />
              ))}
              {notes && (
                <ReviewRow label="Nota">
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{notes}</Typography>
                </ReviewRow>
              )}
              <ReviewRow label="Plantas" value={selectedPlantIds.size} />
            </ReviewCard></AnimatedItem>
          </AnimatedGroup>
        )}
      </Box>

      {step < STEPS - 1 ? (
        <WizardFooter label="Siguiente →" disabled={step === 0 ? !selectedPlantIds.size : step === 1 ? !selectedAditives.length : false} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Guardar Suplemento" disabled={!selectedPlantIds.size || !selectedAditives.length} onClick={handleSubmit} loading={submitting} color={COLOR} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
};

export default NuevoSuplemento;
