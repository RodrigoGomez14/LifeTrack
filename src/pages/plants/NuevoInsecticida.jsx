import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, TextField, Card, Checkbox,
  Chip, Snackbar, Alert, alpha, Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';
import { checkSearch } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getAmbientPlants } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#FF5722';
const STEPS = 6;

const TREATMENT_TYPES = [
  { value: 'Preventivo', label: 'Preventivo' },
  { value: 'Curativo', label: 'Curativo' },
];

const METHOD_TYPES = [
  { value: 'Foliar', label: 'Foliar' },
  { value: 'Raices', label: 'Raíces' },
];

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const NuevoInsecticida = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [treatmentType, setTreatmentType] = useState('');
  const [selectedInsecticideId, setSelectedInsecticideId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [appMethod, setAppMethod] = useState('');
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

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const filteredPlants = useMemo(() => getAmbientPlants(activePlants, plantId), [activePlants, plantId]);

  const insectLibrary = useMemo(() => {
    if (!userData?.plants?.aditives?.insecticidas) return [];
    return Object.entries(userData.plants.aditives.insecticidas).map(([id, i]) => ({ id, ...i }));
  }, [userData]);

  const selectedInsecticide = insectLibrary.find((i) => i.id === selectedInsecticideId);

  // Dosis por defecto según tipo seleccionado
  const defaultDose = useMemo(() => {
    if (!selectedInsecticide || !treatmentType) return null;
    const dosis = selectedInsecticide.dosis
      ? (Array.isArray(selectedInsecticide.dosis) ? selectedInsecticide.dosis : Object.values(selectedInsecticide.dosis))
      : [];
    const match = dosis.find((d) => d.aplicacion === treatmentType || (treatmentType === 'Curativo' && d.aplicacion === 'Correctivo'));
    return match || null;
  }, [selectedInsecticide, treatmentType]);

  const parsedAmount = amountStr ? parseFloat(amountStr.replace(',', '.')) || 0 : 0;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleKeyPress = (key) => {
    amountTouchedRef.current = true;
    if (key === 'backspace') { setAmountStr((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amountStr.includes(',')) return;
      if (!amountStr) { setAmountStr('0,'); return; }
      setAmountStr(amountStr + ','); return;
    }
    if (amountStr === '0' && key !== ',') { setAmountStr(key); return; }
    if (amountStr.includes(',')) { const d = amountStr.split(',')[1]; if (d.length >= 2) return; }
    setAmountStr(amountStr + key);
  };

  // Al entrar al step 3 (numpad), setear valor por defecto si el usuario no editó manualmente
  const amountTouchedRef = React.useRef(false);

  React.useEffect(() => {
    if (step === 3 && !amountTouchedRef.current && defaultDose) {
      setAmountStr(String(defaultDose.quantity).replace('.', ','));
    }
  }, [step, defaultDose]);

  // Resetear el numpad si cambia el tipo o el insecticida (el default ya no aplica)
  React.useEffect(() => {
    amountTouchedRef.current = false;
    setAmountStr('');
  }, [treatmentType, selectedInsecticideId]);

  const handleSubmit = async () => {
    if (!selectedPlantIds.size || !treatmentType || !selectedInsecticideId || !appMethod || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      const date = formatDate(fecha);
      const trimmedNotes = notes.trim();
      const promises = [];
      for (const id of selectedPlantIds) {
        promises.push(addPlantActivity(id, 'insecticides', {
          date,
          treatmentType,
          appMethod,
          insecticides: [{ name: selectedInsecticide.name, dosis: `${parsedAmount} Ml/L` }],
          notes: trimmedNotes || null,
        }));
      }
      await Promise.all(promises);
      setSavedSnapshot({
        treatmentType,
        insecticideName: selectedInsecticide.name,
        amount: parsedAmount,
        appMethod,
        notes,
        fecha: date,
        plantCount: selectedPlantIds.size,
      });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedPlantIds(new Set());
    setTreatmentType('');
    setSelectedInsecticideId('');
    setAmountStr('');
    setAppMethod('');
    setNotes('');
    setFecha(new Date());
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    return (
      <AnimatedSuccess color={COLOR} title="¡Insecticida registrado!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Chip label={n.treatmentType} size="small" sx={{ fontWeight: 600, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
          <Chip label={n.appMethod} size="small" sx={{ fontWeight: 600 }} />
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: 'block' }}>
          {n.insecticideName} · {n.amount} Ml/L
        </Typography>
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280, display: 'block' }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#e64a19' }, mt: n.notes ? 0 : 3 }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  const renderSelector = (options, selected, onSelect) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {options.map((opt) => {
        const isSel = selected === opt.value;
        return (
          <Card
            key={opt.value}
            variant="outlined"
            onClick={() => onSelect(opt.value)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              borderColor: isSel ? COLOR : theme.palette.divider,
              borderWidth: isSel ? 2 : 1,
              bgcolor: isSel ? alpha(COLOR, 0.04) : 'transparent',
              transition: '0.12s',
              '&:hover': { borderColor: alpha(COLOR, 0.5) },
            }}
          >
            <Checkbox checked={isSel} sx={{ color: isSel ? COLOR : 'text.disabled' }} />
            <Typography variant="body2" sx={{ fontWeight: isSel ? 700 : 500 }}>
              {opt.label}
            </Typography>
          </Card>
        );
      })}
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Insecticida</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {step === 0 && (
              <AnimatedGroup sx={{ px: 3, pb: 3 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    SELECCIONÁ LAS PLANTAS
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} />
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup sx={{ px: 3, pb: 3 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    INSECTICIDA
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  {insectLibrary.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No hay insecticidas en la biblioteca. Agregalos desde Aditivos.</Typography>
                  ) : (
                    renderSelector(
                      insectLibrary.map((i) => ({ value: i.id, label: i.name })),
                      selectedInsecticideId,
                      setSelectedInsecticideId
                    )
                  )}
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 2 && (
              <AnimatedGroup sx={{ px: 3, pb: 3 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    TIPO DE DOSIS
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  {renderSelector(TREATMENT_TYPES, treatmentType, setTreatmentType)}
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 3 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, height: '100%' }}>
                <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
                      DOSIS
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: COLOR, mt: 1 }}>
                      {amountStr || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Ml/L</Typography>
                  </Box>
                </AnimatedItem>

                <AnimatedItem>
                  <Box sx={{ px: 3, pb: 2 }}>
                    <Grid container spacing={1}>
                      {NUMPAD_KEYS.map((k) => (
                        <Grid item xs={4} key={k}>
                          <Button fullWidth
                            onClick={() => handleKeyPress(k)}
                            sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                            {k === 'backspace' ? <BackspaceIcon /> : k}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 4 && (
              <AnimatedGroup sx={{ px: 3, pb: 3 }}>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    MÉTODO DE APLICACIÓN
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  {renderSelector(METHOD_TYPES, appMethod, setAppMethod)}
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 5 && (
              <AnimatedGroup sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <AnimatedItem>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>
                </AnimatedItem>

                <AnimatedItem>
                  <ReviewCard color={COLOR}>
                    <ReviewRow label="Tipo" color={COLOR}>{treatmentType}</ReviewRow>
                    <ReviewRow label="Insecticida" value={selectedInsecticide?.name} />
                    <ReviewRow label="Dosis" color={COLOR}>{`${parsedAmount} Ml/L`}</ReviewRow>
                    <ReviewRow label="Método" value={appMethod} />
                    <ReviewRow label="Fecha">
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
                    </ReviewRow>
                  </ReviewCard>
                </AnimatedItem>

                <AnimatedItem>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <TextField
                      label="Nota (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Ej: Aplicación foliar preventiva..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Card>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step < STEPS - 1 ? (
            <WizardFooter
              label="Siguiente →"
              disabled={
                step === 0 ? !selectedPlantIds.size :
                step === 1 ? !selectedInsecticideId :
                step === 2 ? !treatmentType :
                step === 3 ? parsedAmount <= 0 :
                step === 4 ? !appMethod : false
              }
              onClick={goNext}
              color={COLOR}
            />
          ) : (
            <WizardFooter
              label="Guardar Insecticida"
              disabled={!selectedPlantIds.size || !treatmentType || !selectedInsecticideId || !appMethod || parsedAmount <= 0}
              onClick={handleSubmit}
              loading={submitting}
              color={COLOR}
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

export default NuevoInsecticida;
