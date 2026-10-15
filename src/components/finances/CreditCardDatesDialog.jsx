import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useTheme } from '@mui/material/styles';
import { parseFlexibleDate } from './creditCardsHelpers';

// Diálogo para editar las fechas de cierre/vencimiento de un período puntual.
// Se usa tocando el bloque CIERRE/VENCE en el detalle de la tarjeta, y permite
// corregir cualquier mes (inclusive meses pasados) sin depender del wizard de subida.
const CreditCardDatesDialog = ({
  open,
  periodLabel,
  initialClosingDate,
  initialDueDate,
  saving,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [closingDate, setClosingDate] = useState(initialClosingDate || '');
  const [dueDate, setDueDate] = useState(initialDueDate || '');
  const [error, setError] = useState('');

  // El popover del calendario debe quedar por encima del Dialog.
  const pickerSlotProps = {
    popper: { sx: { zIndex: theme.zIndex.modal + 1 } },
    textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } },
  };

  useEffect(() => {
    if (open) {
      setClosingDate(initialClosingDate || '');
      setDueDate(initialDueDate || '');
      setError('');
    }
  }, [open, initialClosingDate, initialDueDate]);

  const shouldDisableDueDate = (d) => {
    if (!closingDate) return false;
    const closing = parseFlexibleDate(closingDate);
    return !!(closing && d.toDate() < closing);
  };

  const handleSave = () => {
    if (!closingDate || !dueDate) {
      setError('Completá la fecha de cierre y la de vencimiento');
      return;
    }
    onSave({ closingDate, dueDate });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>Fechas del período</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {periodLabel}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Fecha de cierre</Typography>
              <DatePicker
                value={closingDate ? dayjs(closingDate) : null}
                onChange={(d) => { if (d) { setClosingDate(d.format('YYYY-MM-DD')); setError(''); } }}
                format="DD/MM/YYYY"
                slotProps={pickerSlotProps}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Fecha de vencimiento</Typography>
              <DatePicker
                value={dueDate ? dayjs(dueDate) : null}
                onChange={(d) => { if (d) { setDueDate(d.format('YYYY-MM-DD')); setError(''); } }}
                format="DD/MM/YYYY"
                shouldDisableDate={shouldDisableDueDate}
                slotProps={pickerSlotProps}
              />
            </Box>
          </Stack>
        </LocalizationProvider>
        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.5 }}>{error}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !closingDate || !dueDate}
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999, px: 3 }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreditCardDatesDialog;
