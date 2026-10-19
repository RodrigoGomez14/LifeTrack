import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Snackbar, Alert, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { addPlantActivity, setPlantPotVolume } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getAmbientPlants } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';

const COLOR = '#9C27B0';
const STEPS = 2;

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const NuevoTransplante = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [transplantDate, setTransplantDate] = useState(() => {
    if (dateParam) {
      const [d, m, y] = dateParam.split('/');
      return new Date(+y, +m - 1, +d);
    }
    return new Date();
  });
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const filteredPlants = useMemo(() => getAmbientPlants(activePlants, plantId), [activePlants, plantId]);

  const goNext = () => setStep(1);
  const goBack = () => setStep(0);

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const disabledIds = useMemo(() => {
    return new Set(filteredPlants.filter((p) => p.potVolume === 3).map((p) => p.id));
  }, [filteredPlants]);

  const canSubmit = selectedPlantIds.size > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const date = formatDate(transplantDate) || getDate();
      const vol = 3;
      const promises = [];
      for (const id of selectedPlantIds) {
        const currentPlant = activePlants.find((p) => p.id === id);
        const previousPot = currentPlant?.potVolume || 0;
        promises.push(addPlantActivity(id, 'transplants', { date, previousPot, newPot: vol }));
        promises.push(setPlantPotVolume(id, vol));
      }
      await Promise.all(promises);
      setSavedSnapshot({ plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedPlantIds(new Set());
    setTransplantDate(new Date());
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
        <Typography variant="h3" sx={{ fontWeight: 800, color: COLOR, mb: 2 }}>3L</Typography>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#7b1fa2' } }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
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
            <AnimatedItem><PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} disabledIds={disabledIds} /></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography></AnimatedItem>
            <AnimatedItem><ReviewCard color={COLOR}>
              <ReviewRow label="Plantas" value={selectedPlantIds.size} />
              <ReviewRow label="Nueva maceta" value="3L" />
              <ReviewRow label="Fecha">
                <Box sx={{ maxWidth: 160 }}>
                  <DatePicker
                    value={transplantDate}
                    onChange={(date) => date && setTransplantDate(date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                      },
                    }}
                  />
                </Box>
              </ReviewRow>
            </ReviewCard></AnimatedItem>
          </AnimatedGroup>
        )}
      </Box>

      {step === 0 ? (
        <WizardFooter label="Siguiente →" disabled={!selectedPlantIds.size} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Confirmar Transplante" disabled={!canSubmit} onClick={handleSubmit} loading={submitting} color={COLOR} />
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

export default NuevoTransplante;
