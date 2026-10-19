import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Snackbar, Alert, Button, Chip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { updatePlant } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import { getNextStage, getAmbientPlants } from '../../components/plants/plantsHelpers';
import { STAGES } from '../../components/plants/PlantShared';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';

const STEPS = 2;

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const CambiarEtapa = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const currentPlant = activePlants.find((p) => p.id === plantId);
  const currentStageKey = (currentPlant?.etapa === 'Enfrascado' ? 'Curado' : currentPlant?.etapa) || 'Germinacion';
  const next = getNextStage(currentPlant?.etapa || 'Germinacion');
  const currentStage = STAGES.find((s) => s.key === currentStageKey) || STAGES[0];
  const nextStage = next ? STAGES.find((s) => s.key === next.newStage) : null;

  const ambientPlants = useMemo(() => getAmbientPlants(activePlants, plantId), [activePlants, plantId]);

  const eligibleIds = useMemo(() => {
    return new Set(
      ambientPlants
        .filter((p) => {
          const pEtapa = p.etapa === 'Enfrascado' ? 'Curado' : p.etapa;
          return pEtapa === currentStageKey;
        })
        .map((p) => p.id)
    );
  }, [ambientPlants, currentStageKey]);

  const disabledIds = useMemo(
    () => new Set(ambientPlants.filter((p) => !eligibleIds.has(p.id)).map((p) => p.id)),
    [ambientPlants, eligibleIds]
  );

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [changeDate, setChangeDate] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep(1);
  const goBack = () => setStep(0);

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canSubmit = selectedPlantIds.size > 0 && !!next;

  const handleConfirm = async () => {
    if (!canSubmit || !next) { setSnack('No se puede cambiar de etapa'); return; }
    setSubmitting(true);
    try {
      const date = formatDate(changeDate) || getDate();
      const { newStage, dateField } = next;
      const promises = [];
      for (const id of selectedPlantIds) {
        const updateData = { etapa: newStage, [dateField]: date };
        if (currentStageKey === 'Secado' && newStage === 'Curado') updateData.finalSecado = date;
        const plant = activePlants.find((p) => p.id === id);
        promises.push(updatePlant(id, updateData, { isArchived: plant?.isArchived || false }));
      }
      await Promise.all(promises);
      setSavedSnapshot({ plantCount: selectedPlantIds.size, newStage, etapa: currentStageKey });
    } catch {
      setSnack('Error al cambiar etapa');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedPlantIds(new Set());
    setChangeDate(new Date());
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const toStage = STAGES.find((s) => s.key === n.newStage);
    const successColor = toStage?.color || theme.palette.success.main;
    return (
      <AnimatedSuccess color={successColor} title="¡Etapa cambiada!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip label={currentStage.label} size="small" sx={{ fontWeight: 600 }} />
          <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Chip label={toStage?.label || n.newStage} size="small" sx={{ fontWeight: 600, bgcolor: alpha(successColor, 0.1), color: successColor }} />
        </Box>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: successColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(successColor, 0.8) } }}>
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
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Cambiar Etapa</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={currentStage.color} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography></AnimatedItem>
            {ambientPlants.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay plantas activas en este ambiente
              </Typography>
            ) : (
              <AnimatedItem><PlantMultiSelect plants={ambientPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={currentStage.color} disabledIds={disabledIds} /></AnimatedItem>
            )}
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography></AnimatedItem>
            <AnimatedItem><ReviewCard color={currentStage.color}>
              <ReviewRow label="Plantas" value={selectedPlantIds.size} />
              <ReviewRow label="Etapa actual" color={currentStage.color}>{currentStage.label}</ReviewRow>
              {nextStage && (
                <ReviewRow label="Nueva etapa" color={nextStage.color}>{nextStage.label}</ReviewRow>
              )}
              <ReviewRow label="Fecha">
                <Box sx={{ maxWidth: 160 }}>
                  <DatePicker
                    value={changeDate}
                    onChange={(date) => date && setChangeDate(date)}
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
        <WizardFooter label="Siguiente →" disabled={!selectedPlantIds.size} onClick={goNext} color={currentStage.color} />
      ) : (
        <WizardFooter label="Confirmar Cambio" disabled={!canSubmit} onClick={handleConfirm} loading={submitting} color={currentStage.color} />
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

export default CambiarEtapa;
