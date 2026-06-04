import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Snackbar, Alert, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';

const RegularPh = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || getDate();

  const [ph, setPh] = useState('');
  const selectedPlantId = plantId || '';
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setPh((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (ph.includes(',')) return;
      if (!ph) { setPh('0,'); return; }
      setPh(ph + ','); return;
    }
    if (ph === '0' && key !== ',') { setPh(key); return; }
    if (ph.includes(',')) { const d = ph.split(',')[1]; if (d.length >= 2) return; }
    setPh(ph + key);
  };

  const handleSubmit = async () => {
    if (!selectedPlantId || !ph) return;
    setSubmitting(true);
    try {
      const now = new Date();
      const data = {
        date: dateParam,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        ph: parseFloat(ph.replace(',', '.')),
      };
      await addPlantActivity(selectedPlantId, 'logs', data);
      setSnack('pH guardado');
      setTimeout(() => navigate(-1), 400);
    } catch (err) {
      console.error(err);
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const formatDisplay = (raw) => {
    if (!raw) return '-';
    const parts = raw.split(',');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts[1] !== undefined ? `${int},${parts[1]}` : int;
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <IconButton onClick={() => navigate(-1)} size="small"><CloseIcon /></IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Regular pH</Typography>
        <Box sx={{ width: 36 }} />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
        {/* Plant info */}
        {selectedPlantId && (
          <Typography variant="caption" sx={{ fontWeight: 500, color: 'primary.light', mb: 2 }}>
            {activePlants.find((p) => p.id === selectedPlantId)?.name || ''}
          </Typography>
        )}

        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>pH</Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, color: '#4CAF50', mt: 1, mb: 0.5, fontSize: { xs: '3.5rem', sm: '4.5rem' }, textAlign: 'center' }}>
          {ph ? formatDisplay(ph) : '-'}
        </Typography>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
            <Button key={key} fullWidth onClick={() => handleKeyPress(key)}
              sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
              {key === 'backspace' ? <BackspaceIcon /> : key}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 3, pb: 3 }}>
        <Button fullWidth variant="contained" disabled={!selectedPlantId || !ph || submitting} onClick={handleSubmit}
          sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem', bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}>
          {submitting ? 'Guardando...' : 'Guardar pH'}
        </Button>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RegularPh;
