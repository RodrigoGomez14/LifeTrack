import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card,
  Chip, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import BugReportIcon from '@mui/icons-material/BugReport';
import { addInsecticidaAditivo } from '../../services/plants';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#FF5722';
const STEPS = 3;

const MEASURES = ['Ml/L', 'Grs/L', 'Cm3/L'];

const CrearInsecticida = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [dosisList, setDosisList] = useState([]);
  const [dosisName, setDosisName] = useState('');
  const [dosisQty, setDosisQty] = useState('');
  const [dosisMeasure, setDosisMeasure] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleAddDosis = () => {
    if (!dosisName || !dosisQty || !dosisMeasure) return;
    setDosisList((prev) => [...prev, { name: dosisName, quantity: parseFloat(dosisQty), measure: dosisMeasure }]);
    setDosisName(''); setDosisQty(''); setDosisMeasure('');
  };

  const handleSubmit = async () => {
    if (!name || !brand || !dosisList.length) return;
    setSubmitting(true);
    try {
      await addInsecticidaAditivo({ name, brand, type: 'Insecticida', dosis: dosisList });
      setSnack('Insecticida guardado');
      setTimeout(() => navigate(-1), 400);
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Crear Insecticida</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, pt: 2 }}>
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth
                  placeholder="Ej: Mamboretá, Jabón potásico..."
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} fullWidth
                  placeholder="Ej: Mamboretá, Bioprotección..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Card>
            </AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup>
            <AnimatedItem>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                  AGREGAR DOSIS
                </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                <TextField label="Etapa" value={dosisName} onChange={(e) => setDosisName(e.target.value)} size="small"
                  placeholder="Vegetativo, Floración..."
                  sx={{ flex: 1, minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField label="Cantidad" type="number" value={dosisQty} onChange={(e) => setDosisQty(e.target.value)} size="small"
                  inputProps={{ step: 0.1, inputMode: 'decimal' }}
                  sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <FormControl size="small" sx={{ width: 110 }}>
                  <InputLabel>Medida</InputLabel>
                  <Select value={dosisMeasure} label="Medida" onChange={(e) => setDosisMeasure(e.target.value)}
                    sx={{ borderRadius: 2 }}>
                    {MEASURES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box component="button" onClick={handleAddDosis} disabled={!dosisName || !dosisQty || !dosisMeasure}
                sx={{ width: '100%', py: 1, borderRadius: 2, border: 'none', bgcolor: COLOR, color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: (!dosisName || !dosisQty || !dosisMeasure) ? 0.5 : 1 }}>
                <AddIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Agregar dosis
              </Box>
              </Card>
            </AnimatedItem>

            {dosisList.length > 0 && (
              <AnimatedItem>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                  Dosis ({dosisList.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {dosisList.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: theme.palette.action.hover }}>
                      <BugReportIcon sx={{ fontSize: 16, color: COLOR }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>{d.name}</Typography>
                      <Chip label={`${d.quantity} ${d.measure}`} size="small" sx={{ fontWeight: 600 }} />
                      <IconButton size="small" onClick={() => setDosisList((p) => p.filter((_, j) => j !== i))} sx={{ color: 'error.main' }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Card>
              </AnimatedItem>
            )}
          </AnimatedGroup>
        )}

        {step === 2 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem>
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>
            </AnimatedItem>
            <AnimatedItem>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Nombre</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Marca</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{brand}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">Dosis</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{dosisList.length}</Typography>
                </Box>
              </Box>
            </AnimatedItem>
          </AnimatedGroup>
        )}
      </Box>

      {step < STEPS - 1 ? (
        <WizardFooter label="Siguiente →" disabled={step === 0 ? !name || !brand : step === 1 ? !dosisList.length : false} onClick={goNext} color={COLOR} />
      ) : (
        <WizardFooter label="Guardar Insecticida" disabled={!name || !brand || !dosisList.length} onClick={handleSubmit} loading={submitting} color={COLOR} />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack === 'Error al guardar' ? 'error' : 'success'} variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearInsecticida;
