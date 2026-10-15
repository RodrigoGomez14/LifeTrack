import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Snackbar, Alert,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useStore } from '../../store';
import { archivePlant } from '../../services/plants';
import { checkSearch } from '../../utils';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';

const COLOR = '#c62828';
const STEPS = 1;

const formatDate = (date) => {
  if (!date) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const ArchivarPlanta = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);

  const [fecha, setFecha] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const plant = useMemo(() => {
    if (!userData?.plants) return null;
    const key = plantId;
    if (userData.plants.active?.[key]) return { ...userData.plants.active[key], id: key };
    return null;
  }, [userData, plantId]);

  const handleSubmit = async () => {
    if (!plant) return;
    setSubmitting(true);
    try {
      const date = formatDate(fecha);
      const dataToArchive = { ...plant, fechaArchivado: date };
      await archivePlant(plant.id, dataToArchive);
      setSavedSnapshot({ plantName: plant.name });
      navigate('/plantas');
    } catch {
      setSnack('Error al archivar');
      setSubmitting(false);
    }
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    return (
      <AnimatedSuccess color={COLOR} title="¡Planta archivada!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {savedSnapshot.plantName}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Podés encontrarla en tu archivo histórico
        </Typography>
        <Button onClick={() => navigate('/plantas')} sx={{ mt: 3, textTransform: 'none', color: 'text.secondary' }}>
          Volver a Plantas
        </Button>
      </AnimatedSuccess>
    );
  };

  if (savedSnapshot) return renderSuccess();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ width: 36 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Archivar Planta</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={0} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography></AnimatedItem>

          <AnimatedItem><ReviewCard color={COLOR}>
            <ReviewRow label="Planta" value={plant?.name} />
            <ReviewRow label="Etapa actual" color={COLOR}>{plant?.etapa || '—'}</ReviewRow>
            <ReviewRow label="Fecha">
              <Box sx={{ maxWidth: 160 }}>
                <DatePicker
                  value={fecha}
                  onChange={(d) => d && setFecha(d)}
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

          <AnimatedItem>
            <Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${alpha(COLOR, 0.2)}`, bgcolor: alpha(COLOR, 0.06), textAlign: 'center' }}>
              <ArchiveOutlinedIcon sx={{ fontSize: 36, color: COLOR, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                La planta pasará a tu archivo histórico. No se borrará ningún dato.
              </Typography>
            </Box>
          </AnimatedItem>
        </AnimatedGroup>
      </Box>

      <WizardFooter label="Archivar Planta" disabled={!plant} onClick={handleSubmit} loading={submitting} color={COLOR} />

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
    </LocalizationProvider>
  );
};

export default ArchivarPlanta;
