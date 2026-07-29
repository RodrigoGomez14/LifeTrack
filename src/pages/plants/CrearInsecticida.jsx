import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Button,
  Snackbar, Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { addInsecticida } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#FF5722';

const CrearInsecticida = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const canSubmit = name.trim() && brand.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const data = { name: name.trim(), brand: brand.trim(), type: 'Insecticida', dosis: [] };
      await addInsecticida(data);
      setSavedSnapshot({ name: data.name, brand: data.brand });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setName(''); setBrand(''); setSavedSnapshot(null);
  };

  if (savedSnapshot) {
    return (
      <AnimatedSuccess color={COLOR} title="Insecticida creado!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{savedSnapshot.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{savedSnapshot.brand} · Insecticida</Typography>
        <Button fullWidth variant="contained" size="large"
          onClick={resetForm}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.9 } }}>
          Crear otro
        </Button>
        <Button onClick={() => navigate('/nutrientes')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Nutrientes</Button>
      </AnimatedSuccess>
    );
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ width: 36 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nuevo insecticida</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
        <AnimatedGroup>
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>
              NOMBRE
            </Typography>
            <TextField fullWidth multiline rows={2} value={name} autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mamboretá, Jabón potásico..."
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>
              MARCA
            </Typography>
            <TextField fullWidth multiline rows={2} value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ej: Mamboretá, Bioprotección..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </AnimatedItem>
        </AnimatedGroup>
      </Box>

      <WizardFooter label="Guardar insecticida" disabled={!canSubmit} onClick={handleSubmit} loading={submitting} color={COLOR} />

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearInsecticida;
