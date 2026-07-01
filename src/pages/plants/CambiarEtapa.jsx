import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, Avatar,
  Snackbar, Alert, alpha, Button, Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import WavesIcon from '@mui/icons-material/Waves';
import { useStore } from '../../store';
import { updatePlant } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import { getNextStage } from '../../components/plants/plantsHelpers';
import { STAGES } from '../../components/plants/PlantShared';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedSuccess } from '../../design-system';

const STEPS = 3;

const STAGE_CHRONOLOGY = [
  { name: 'Germinacion', label: 'Germinacion', icon: <SpaIcon />, paletteKey: 'info' },
  { name: 'Vegetativo', label: 'Vegetativo', icon: <GrassIcon />, paletteKey: 'success' },
  { name: 'Floracion', label: 'Floracion', icon: <LocalFloristIcon />, paletteKey: 'warning' },
  { name: 'Lavado de Raices', label: 'Lavado de Raices', icon: <WavesIcon />, paletteKey: 'info' },
  { name: 'Secado', label: 'Secado', icon: <ParkIcon />, paletteKey: 'error' },
  { name: 'Curado', label: 'Curado', icon: <ForestIcon />, paletteKey: 'secondary' },
];

function getTransitionCopy(etapa) {
  if (etapa === 'Floracion') {
    return {
      title: 'Lavar raíces',
      infoBody: 'Estás a punto de iniciar el lavado de raíces. Se guardará la fecha de inicio de la etapa.',
      nextLabel: 'Lavado de Raices',
    };
  }
  if (etapa === 'Lavado de Raices') {
    return {
      title: 'Cosechar planta',
      infoBody: 'Estás a punto de cosechar tu planta. Se guardará la fecha actual como inicio del secado y fin del lavado.',
      nextLabel: 'Secado',
    };
  }
  if (etapa === 'Germinacion') {
    return { title: 'Cambiar a Vegetativo', infoBody: 'La planta pasará a la etapa vegetativa. Se guardará la fecha de inicio.', nextLabel: 'Vegetativo' };
  }
  if (etapa === 'Vegetativo') {
    return { title: 'Cambiar a Floracion', infoBody: 'La planta pasará a la etapa de floración. Se guardará la fecha de inicio.', nextLabel: 'Floracion' };
  }
  if (etapa === 'Secado') {
    return { title: 'Cambiar a Curado', infoBody: 'La planta pasará a la etapa de curado para su conservación final.', nextLabel: 'Curado' };
  }
  return { title: 'Cambiar etapa', infoBody: 'La planta ya completó su ciclo.', nextLabel: '' };
}

const CambiarEtapa = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);

  const plant = (() => {
    if (!userData?.plants) return null;
    const key = plantId;
    if (userData.plants.active?.[key]) return { ...userData.plants.active[key], id: key, isArchived: false };
    if (userData.plants.history?.[key]) return { ...userData.plants.history[key], id: key, isArchived: true };
    if (userData.plants.archived?.[key]) return { ...userData.plants.archived[key], id: key, isArchived: true };
    for (const folder in userData.plants) {
      if (folder !== 'active' && typeof userData.plants[folder] === 'object' && userData.plants[folder]?.[key]) {
        return { ...userData.plants[folder][key], id: key, isArchived: true };
      }
    }
    return null;
  })();

  const etapaRaw = plant?.etapa || 'Germinacion';
  const etapa = etapaRaw === 'Enfrascado' ? 'Curado' : etapaRaw;
  const next = getNextStage(etapaRaw);
  const copy = getTransitionCopy(etapa);

  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const currentStage = STAGES.find((s) => s.key === etapa) || STAGES[0];
  const nextStage = next ? STAGES.find((s) => s.key === next.newStage) : null;

  const handleConfirm = async () => {
    if (!next || !plant) { setSnack('No se puede cambiar de etapa'); return; }
    setSubmitting(true);
    try {
      const { newStage, dateField } = next;
      const today = getDate();
      const updateData = { etapa: newStage, [dateField]: today };
      if (etapa === 'Secado' && newStage === 'Curado') updateData.finalSecado = today;
      if (notes.trim()) updateData._etapaNota = notes.trim();
      await updatePlant(plant.id, updateData, { isArchived: plant.isArchived });
      setSavedSnapshot({ newStage, etapa, plantName: plant?.name, notes });
    } catch {
      setSnack('Error al cambiar etapa');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const fromStage = STAGES.find((s) => s.key === n.etapa);
    const toStage = STAGES.find((s) => s.key === n.newStage);
    const successColor = toStage?.color || theme.palette.success.main;
    return (
      <AnimatedSuccess color={successColor} title="¡Etapa cambiada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{n.plantName}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">{fromStage?.label || n.etapa}</Typography>
          <Typography variant="caption">→</Typography>
          <Chip label={toStage?.label || n.newStage} size="small" sx={{ fontWeight: 600, bgcolor: alpha(successColor, 0.1), color: successColor }} />
        </Box>
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: successColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(successColor, 0.8) }, mt: n.notes ? 0 : 3 }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  return (
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
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: `linear-gradient(135deg, ${currentStage.color} 0%, ${alpha(currentStage.color, 0.7)} 100%)`, px: 2.5, py: 2.5, textAlign: 'center' }}>
                <currentStage.icon sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{plant?.name}</Typography>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>Etapa actual: {etapa}</Typography>
              </Box>
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{copy.title}</Typography>
                <Typography variant="body2" color="text.secondary">{copy.infoBody}</Typography>
                {nextStage && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <ChipStage s={currentStage} active />
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                    <ChipStage s={nextStage} active={false} />
                  </Box>
                )}
              </Box>
            </Card></AnimatedItem>

            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', textAlign: 'center' }}>
              CRONOLOGÍA
            </Typography></AnimatedItem>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
              {STAGE_CHRONOLOGY.map((s) => {
                const isActive = etapa === s.name;
                return (
                  <AnimatedItem key={s.name}><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isActive ? 1 : 0.5 }}>
                    <Avatar sx={{ bgcolor: isActive ? theme.palette[s.paletteKey].main : alpha(theme.palette.text.secondary, 0.1), color: isActive ? 'white' : theme.palette.text.secondary, mb: 0.5, width: 36, height: 36 }}>
                      {s.icon}
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>{s.label}</Typography>
                  </Box></AnimatedItem>
                );
              })}
            </Box>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={4}
              placeholder="¿Algo para anotar sobre este cambio de etapa?"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 2 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', pt: 4 }}>
            <AnimatedItem><Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(currentStage.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <currentStage.icon sx={{ fontSize: 40, color: currentStage.color }} />
            </Box></AnimatedItem>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>{copy.title}</Typography></AnimatedItem>
            {nextStage && (
              <AnimatedItem><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {plant?.name} pasará de <strong>{etapa}</strong> a <strong>{nextStage.label}</strong>
              </Typography></AnimatedItem>
            )}
            {notes && (
              <AnimatedItem><Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', maxWidth: 280 }}>"{notes}"</Typography></AnimatedItem>
            )}
          </AnimatedGroup>
        )}
      </Box>

      {step < STEPS - 1 ? (
        <WizardFooter label="Siguiente →" onClick={goNext} color={currentStage.color} />
      ) : (
        <WizardFooter label={copy.title} onClick={handleConfirm} loading={submitting} disabled={!next} color={currentStage.color} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
          </>
        )}
    </Box>
  );
};

const ChipStage = ({ s, active }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, opacity: active ? 1 : 0.7 }}>
    <Avatar sx={{ bgcolor: s.color, color: '#fff', width: 40, height: 40 }}>{s.icon && <s.icon sx={{ fontSize: 22 }} />}</Avatar>
    <Typography variant="caption" sx={{ fontWeight: 600, color: s.color, fontSize: '0.65rem' }}>{s.label}</Typography>
  </Box>
);

export default CambiarEtapa;
