import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, CardContent,
  Chip, Snackbar, Alert, alpha, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useStore } from '../../store';
import { addPlantActivity, setPlantPotVolume } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

const COLOR = '#9C27B0';
const STEPS = 4;

const POT_SIZES = [0.5, 1, 2, 3, 5, 7, 10, 15, 20];

const NuevoTransplante = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [newPotVolume, setNewPotVolume] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const firstPlant = activePlants.filter((p) => selectedPlantIds.has(p.id))[0];
  const canSubmit = selectedPlantIds.size > 0 && parseFloat(newPotVolume) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const date = dateParam || getDate();
      const vol = parseFloat(newPotVolume);
      const promises = [];
      for (const id of selectedPlantIds) {
        const currentPlant = activePlants.find((p) => p.id === id);
        const previousPot = currentPlant?.potVolume || 0;
        promises.push(addPlantActivity(id, 'transplants', { date, previousPot, newPot: vol, notes: notes.trim() || undefined }));
        promises.push(setPlantPotVolume(id, vol));
      }
      await Promise.all(promises);
      setSavedSnapshot({ newPotVolume: vol, notes, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setNewPotVolume('');
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    return (
      <AnimatedSuccess color={COLOR} title="¡Transplante registrado!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Chip label={`${n.newPotVolume}L`} sx={{ fontWeight: 600, mb: 2, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
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
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Transplante</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography></AnimatedItem>
            <AnimatedItem><PlantMultiSelect plants={activePlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} /></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: `linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)`, px: 2.5, py: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Nueva Maceta</Typography>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), mt: 0.25 }}>
                  {firstPlant ? `Maceta actual: ${firstPlant.potVolume || '?'}L` : 'Seleccioná el nuevo tamaño'}
                </Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <TextField
                  type="number"
                  label="Volumen (litros)"
                  value={newPotVolume}
                  onChange={(e) => setNewPotVolume(e.target.value)}
                  fullWidth
                  inputProps={{ step: 0.5, inputMode: 'decimal' }}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                  Tamaños comunes
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {POT_SIZES.map((s) => (
                    <Chip key={s} label={`${s}L`}
                      onClick={() => setNewPotVolume(String(s))}
                      variant={parseFloat(newPotVolume) === s ? 'filled' : 'outlined'}
                      color={parseFloat(newPotVolume) === s ? 'secondary' : 'default'}
                      sx={{ fontWeight: 600 }} />
                  ))}
                </Box>
                {firstPlant?.potVolume && parseFloat(newPotVolume) > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(COLOR, 0.06), borderRadius: 2, border: `1px solid ${alpha(COLOR, 0.15)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Chip label={`${firstPlant.potVolume}L`} size="small" sx={{ fontWeight: 600 }} />
                    <SwapHorizIcon sx={{ color: COLOR }} />
                    <Chip label={`${newPotVolume}L`} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                    <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                      +{(parseFloat(newPotVolume) - firstPlant.potVolume).toFixed(1)}L
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 2 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3}
              placeholder="Ej: Transplante a maceta definitiva..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 3 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>
            <AnimatedItem><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Nueva maceta</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{newPotVolume}L</Typography>
              </Box>
              {notes && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Nota</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{notes}</Typography>
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

      {step < STEPS - 1 ? (
        <WizardFooter label="Siguiente →" disabled={step === 0 ? !selectedPlantIds.size : step === 1 ? !(parseFloat(newPotVolume) > 0) : false} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Guardar Transplante" disabled={!canSubmit} onClick={handleSubmit} loading={submitting} color={COLOR} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
};

export default NuevoTransplante;
