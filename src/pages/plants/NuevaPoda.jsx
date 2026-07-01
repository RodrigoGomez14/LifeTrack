import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, CardContent,
  Snackbar, Alert, alpha, Paper, Grid, Button, Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

const COLOR = '#4CAF50';
const STEPS = 4;

const PRUNING_TYPES = [
  { value: 'Apical', label: 'Poda Apical', desc: 'Corte del brote principal para estimular el crecimiento lateral', icon: '🌱' },
  { value: 'FIM', label: 'Técnica FIM', desc: 'Corte parcial del brote principal sin eliminarlo completamente', icon: '✂️' },
  { value: 'Bajos', label: 'Poda de Bajos', desc: 'Eliminación de ramas y hojas inferiores para mejorar la ventilación', icon: '🍃' },
  { value: 'Hojas', label: 'Defoliación', desc: 'Eliminación selectiva de hojas grandes para mejorar penetración de luz', icon: '🌿' },
];

const OptionCardGrid = ({ options, selected, onSelect, accent, columns }) => (
  <Grid container spacing={1.5} component={AnimatedGroup}>
    {options.map((opt) => {
      const isSel = selected === opt.value;
      return (
        <Grid item xs={12 / Math.min(columns, options.length <= 2 ? 2 : 3)} sm={12 / columns} key={opt.value}>
          <AnimatedItem><Paper
            elevation={isSel ? 3 : 1}
            onClick={() => onSelect(opt.value)}
            sx={{
              p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
              border: `${isSel ? 2 : 1}px solid ${isSel ? accent : 'divider'}`,
              bgcolor: isSel ? alpha(accent, 0.05) : 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(accent, 0.2)}` },
            }}
          >
            <Typography variant="h4" sx={{ mb: 0.5 }}>{opt.icon}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{opt.desc}</Typography>
          </Paper></AnimatedItem>
        </Grid>
      );
    })}
  </Grid>
);

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

  const handleSubmit = async () => {
    if (!selectedPlantIds.size || !pruningType) return;
    setSubmitting(true);
    try {
      const date = dateParam || getDate();
      const promises = [];
      for (const id of selectedPlantIds) {
        promises.push(addPlantActivity(id, 'prunings', { date, type: pruningType, notes: notes.trim() || undefined }));
      }
      await Promise.all(promises);
      setSavedSnapshot({ pruningType, notes, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setPruningType('');
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const typeLabel = PRUNING_TYPES.find((t) => t.value === n.pruningType)?.label || n.pruningType;
    return (
      <AnimatedSuccess color={COLOR} title="¡Poda registrada!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Chip label={typeLabel} sx={{ fontWeight: 600, mb: 2, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#388e3c' }, mt: n.notes ? 0 : 3 }}>
          Cargar otra
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
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Poda</Typography>
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
          <AnimatedGroup>
            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ background: `linear-gradient(135deg, #43a047 0%, #2e7d32 100%)`, px: 2.5, py: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Tipo de Poda</Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <OptionCardGrid options={PRUNING_TYPES} selected={pruningType} onSelect={setPruningType} accent={COLOR} columns={4} />
                {pruningType && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(COLOR, 0.06), borderRadius: 2, border: `1px solid ${alpha(COLOR, 0.15)}` }}>
                    <Typography variant="body2" sx={{ color: COLOR, fontWeight: 600 }}>
                      {PRUNING_TYPES.find((t) => t.value === pruningType)?.label}: {PRUNING_TYPES.find((t) => t.value === pruningType)?.desc}
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
              placeholder="Ej: Poda apical para estimular ramas laterales..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 3 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>
            <AnimatedItem><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Tipo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{PRUNING_TYPES.find((t) => t.value === pruningType)?.label}</Typography>
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
        <WizardFooter label="Siguiente →" disabled={step === 0 ? !selectedPlantIds.size : step === 1 ? !pruningType : false} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Guardar Poda" disabled={!selectedPlantIds.size || !pruningType} onClick={handleSubmit} loading={submitting} color={COLOR} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
};

export default NuevaPoda;
