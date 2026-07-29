import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card,
  Chip, Checkbox, Snackbar, Alert, Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { checkSearch } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getBaseName } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

const COLOR = '#4CAF50';
const STEPS = 4;

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const PRUNING_TYPES = [
  { value: 'Apical', label: 'Poda Apical' },
  { value: 'FIM', label: 'Técnica FIM' },
  { value: 'Bajos', label: 'Poda de Bajos' },
  { value: 'Hojas', label: 'Defoliación' },
];

const NuevaPoda = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [pruningType, setPruningType] = useState('');
  const [notes, setNotes] = useState('');
  const [fecha, setFecha] = useState(() => {
    if (dateParam) {
      const [d, m, y] = dateParam.split('/');
      return new Date(+y, +m - 1, +d);
    }
    return new Date();
  });
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const accentColor = COLOR;

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

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!selectedPlantIds.size || !pruningType) return;
    setSubmitting(true);
    try {
      const data = {
        date: formatDate(fecha),
        type: pruningType,
        notes: notes.trim() || undefined,
      };
      const promises = [];
      for (const id of selectedPlantIds) {
        promises.push(addPlantActivity(id, 'prunings', data));
      }
      await Promise.all(promises);
      setSavedSnapshot({ pruningType, notes, fecha: formatDate(fecha), accentColor, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedPlantIds(new Set());
    setPruningType('');
    setNotes('');
    setFecha(new Date());
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const typeLabel = PRUNING_TYPES.find((t) => t.value === n.pruningType)?.label || n.pruningType;
    return (
      <AnimatedSuccess color={n.accentColor} title="¡Poda registrada!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Chip label={typeLabel} sx={{ fontWeight: 600, mb: 2, bgcolor: alpha(n.accentColor, 0.1), color: n.accentColor }} />
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280, display: 'block' }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: n.accentColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: `${n.accentColor}DD` }, mt: n.notes ? 0 : 3 }}>
          Cargar otra
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
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Poda</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={accentColor} />

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
            {step === 0 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    SELECCIONÁ LAS PLANTAS
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={accentColor} />
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                    TIPO DE PODA
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {PRUNING_TYPES.map((opt) => {
                      const isSel = pruningType === opt.value;
                      return (
                        <Card
                          key={opt.value}
                          variant="outlined"
                          onClick={() => setPruningType(opt.value)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            borderColor: isSel ? accentColor : theme.palette.divider,
                            borderWidth: isSel ? 2 : 1,
                            bgcolor: isSel ? alpha(accentColor, 0.04) : 'transparent',
                            transition: '0.12s',
                            '&:hover': { borderColor: alpha(accentColor, 0.5) },
                          }}
                        >
                          <Checkbox checked={isSel} sx={{ color: isSel ? accentColor : 'text.disabled' }} />
                          <Typography variant="body2" sx={{ fontWeight: isSel ? 700 : 500 }}>
                            {opt.label}
                          </Typography>
                        </Card>
                      );
                    })}
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 2 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                    NOTA
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                    <TextField
                      label="Nota (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Ej: Poda apical para estimular ramas laterales..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 3 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <AnimatedItem>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>
                </AnimatedItem>

                <AnimatedItem>
                  <Card sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Tipo</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>
                        {PRUNING_TYPES.find((t) => t.value === pruningType)?.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Plantas</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlantIds.size}</Typography>
                    </Box>
                    {notes && (
                      <Box sx={{ py: 2, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Nota</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{notes}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 2.5 }}>
                      <Typography variant="body2" color="text.secondary">Fecha</Typography>
                      <Box sx={{ maxWidth: 160 }}>
                        <DatePicker
                          value={fecha}
                          onChange={(date) => date && setFecha(date)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step < STEPS - 1 ? (
            <WizardFooter
              label="Siguiente →"
              disabled={step === 0 ? !selectedPlantIds.size : step === 1 ? !pruningType : false}
              onClick={goNext}
              color={accentColor}
            />
          ) : (
            <WizardFooter
              label="Guardar Poda"
              disabled={!selectedPlantIds.size || !pruningType}
              onClick={handleSubmit}
              loading={submitting}
              color={accentColor}
            />
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

export default NuevaPoda;
