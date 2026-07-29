import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card,
  Chip, InputAdornment, Snackbar, Alert, alpha, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getBaseName } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const getFertilizantes = (aditives) => {
  if (!aditives?.fertilizantes) return [];
  return Object.entries(aditives.fertilizantes).map(([id, a]) => ({ id, ...a }));
};

const STEPS_TOTAL = 5;

const RegistrarMedicion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [ph, setPh] = useState('');
  const [ec, setEc] = useState('');
  const [ppm, setPpm] = useState('');
  const [quantity, setQuantity] = useState('');
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

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS_TOTAL - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const hasPlants = selectedPlantIds.size > 0;
  const hasMeasurements = ph || ec || ppm;
  const hasWatering = quantity || selectedAditives.length > 0;

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
    setSelectedAditives((prev) => [
      ...prev,
      { id: aditiveId, name: aditive.name, dosis: aditive.dosis?.[0]?.name || '', brand: aditive.brand || '' },
    ]);
  };

  const handleRemoveAditive = (idx) => {
    setSelectedAditives((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!hasPlants) return;
    setSubmitting(true);
    try {
      const data = {
        date: dateParam || getDate(),
        ...(ph ? { ph: parseFloat(ph) } : {}),
        ...(ec ? { ec: parseFloat(ec) } : {}),
        ...(ppm ? { ppm: parseInt(ppm) } : {}),
        ...(quantity ? { quantity: parseInt(quantity) } : {}),
        aditives: selectedAditives.map((a) => ({ name: a.name, dosis: a.dosis })),
        notes: notes.trim() || '',
      };
      for (const id of selectedPlantIds) {
        await addPlantActivity(id, 'irrigations', data);
      }
      setSavedSnapshot({ ph, ec, ppm, quantity, aditives: selectedAditives, notes, plantCount: selectedPlantIds.size });
    } catch (err) {

      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setPh('');
    setEc('');
    setPpm('');
    setQuantity('');
    setSelectedAditives([]);
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    return (
      <AnimatedSuccess color="#00BCD4" title="¡Riego registrado!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mb: 1 }}>
          {n.ph && <Chip label={`pH ${n.ph}`} size="small" sx={{ fontWeight: 600 }} />}
          {n.ec && <Chip label={`EC ${n.ec} mS/cm`} size="small" sx={{ fontWeight: 600 }} />}
          {n.ppm && <Chip label={`PPM ${n.ppm}`} size="small" sx={{ fontWeight: 600 }} />}
          {n.quantity && <Chip label={`${n.quantity} ml`} size="small" sx={{ fontWeight: 600 }} />}
        </Box>
        {n.aditives?.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1 }}>
            + {n.aditives.length} aditivo{n.aditives.length !== 1 ? 's' : ''}
          </Typography>
        )}
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: '#00BCD4', color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#0097a7' }, mt: n.notes ? 0 : 3 }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));

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
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Riego</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS_TOTAL} current={step} color="#00BCD4" />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Step 0: Plant multi-select */}
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography></AnimatedItem>
            <AnimatedItem><PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color="#00BCD4" /></AnimatedItem>
          </AnimatedGroup>
        )}

        {/* Step 1: Measurements */}
        {step === 1 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>MEDICIONES</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField label="pH" type="number" value={ph} onChange={(e) => setPh(e.target.value)} size="small"
                inputProps={{ step: 0.1, inputMode: 'decimal' }}
                sx={{ flex: 1, minWidth: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="EC" type="number" value={ec} onChange={(e) => setEc(e.target.value)} size="small"
                InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled">mS/cm</Typography></InputAdornment> }}
                inputProps={{ step: 0.1, inputMode: 'decimal' }}
                sx={{ flex: 1, minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="PPM" type="number" value={ppm} onChange={(e) => setPpm(e.target.value)} size="small"
                inputProps={{ step: 10, inputMode: 'numeric' }}
                sx={{ flex: 1, minWidth: 80, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {/* Step 2: Watering */}
        {step === 2 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>RIEGO</Typography>
            <TextField label="Agua" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} size="small" fullWidth
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled">ml</Typography></InputAdornment> }}
              inputProps={{ inputMode: 'numeric' }}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>ADITIVOS</Typography>
            {selectedAditives.map((a, idx) => (
              <Chip key={idx} label={`${a.name} · ${a.dosis}`} onDelete={() => handleRemoveAditive(idx)} size="small"
                sx={{ mr: 0.5, mb: 0.5, fontWeight: 500 }} />
            ))}

            {fertilizantes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                {fertilizantes.filter((a) => !selectedAditives.find((s) => s.id === a.id)).map((a) => (
                  <Chip key={a.id} icon={<AddIcon sx={{ fontSize: 14 }} />} label={a.name} onClick={() => handleAddAditive(a.id)} variant="outlined" size="small"
                    sx={{ fontWeight: 500, '&:hover': { borderColor: '#00BCD4' } }} />
                ))}
              </Box>
            )}
            {fertilizantes.length === 0 && (
               <Typography variant="caption" color="text.secondary">No hay aditivos en la biblioteca. Agregalos desde Aditivos.</Typography>
            )}
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {/* Step 3: Note */}
        {step === 3 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3}
              placeholder="Ej: Cambié la solución, ajusté pH..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>

            {selectedPlants.length > 0 && (
              <AnimatedItem><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedPlants.map((p) => (
                  <Chip key={p.id} label={p.name} size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 600 }} />
                ))}
              </Box></AnimatedItem>
            )}

            <AnimatedItem><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              {ph && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">pH</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ph}</Typography>
                </Box>
              )}
              {ec && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">EC</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ec} mS/cm</Typography>
                </Box>
              )}
              {ppm && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">PPM</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ppm}</Typography>
                </Box>
              )}
              {quantity && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Agua</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{quantity} ml</Typography>
                </Box>
              )}
              {selectedAditives.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Aditivos</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedAditives.length}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                <Typography variant="body2" color="text.secondary">Plantas</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlantIds.size}</Typography>
              </Box>
            </Box></AnimatedItem>
          </AnimatedGroup>
        )}
      </Box>

      {/* Footer */}
      {step < STEPS_TOTAL - 1 ? (
        <WizardFooter
          label="Siguiente →"
          disabled={step === 0 ? !hasPlants : false}
          onClick={goNext}
          color="#00BCD4"
        />
      ) : (
        <WizardFooter
          label={`Guardar riego${selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size})` : ''}`}
          disabled={!hasPlants}
          onClick={handleSubmit}
          loading={submitting}
          color="#00BCD4"
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

export default RegistrarMedicion;
