import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Card,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import CheckIcon from '@mui/icons-material/Check';
import { isDateBeyondLimit } from './creditCardsHelpers';

// Sub-componente expandible para configurar/editar las fechas de cierre y vencimiento
// del período seleccionado. Las validaciones se preservan del componente viejo.
const CreditCardDatesConfig = ({
  initialClosingDate,
  initialDueDate,
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const [closingDate, setClosingDate] = useState(initialClosingDate || '');
  const [dueDate, setDueDate] = useState(initialDueDate || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setClosingDate(initialClosingDate || '');
    setDueDate(initialDueDate || '');
  }, [initialClosingDate, initialDueDate]);

  // No permitir fechas a más de 1 mes en el futuro
  const shouldDisableClosingDate = (date) => isDateBeyondLimit(date.toDate());

  // Vencimiento: debe ser >= cierre y caer en el mismo mes o el siguiente, dentro del límite
  const shouldDisableDueDate = (date) => {
    const js = date.toDate();
    if (!closingDate) return isDateBeyondLimit(js);

    const closingObj = new Date(closingDate);
    if (js < closingObj) return true;

    const cYear = closingObj.getFullYear();
    const cMonth = closingObj.getMonth();
    const nextMonth = (cMonth + 1) % 12;
    const nextYear = cMonth === 11 ? cYear + 1 : cYear;
    const jYear = js.getFullYear();
    const jMonth = js.getMonth();
    const sameOrNext =
      (jYear === cYear && jMonth === cMonth) || (jYear === nextYear && jMonth === nextMonth);
    if (sameOrNext) return false;
    return isDateBeyondLimit(js);
  };

  const handleSubmit = async () => {
    if (!closingDate) {
      setError('Seleccioná la fecha de cierre');
      return;
    }
    if (!dueDate) {
      setError('Seleccioná la fecha de vencimiento');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({ closingDate, dueDate });
    } catch (e) {
      console.error('Error al guardar fechas:', e);
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const datePickerSlotProps = {
    textField: {
      fullWidth: true,
      size: 'small',
      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        p: 2.5,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
        FECHAS DEL PERÍODO
      </Typography>

      <Stack spacing={2} sx={{ mt: 1.5 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
            Fecha de cierre
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              value={closingDate ? dayjs(closingDate) : null}
              onChange={(d) => d && setClosingDate(d.format('YYYY-MM-DD'))}
              format="DD/MM/YYYY"
              shouldDisableDate={shouldDisableClosingDate}
              slotProps={datePickerSlotProps}
            />
          </LocalizationProvider>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
            Fecha de vencimiento
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              value={dueDate ? dayjs(dueDate) : null}
              onChange={(d) => d && setDueDate(d.format('YYYY-MM-DD'))}
              format="DD/MM/YYYY"
              shouldDisableDate={shouldDisableDueDate}
              slotProps={datePickerSlotProps}
            />
          </LocalizationProvider>
        </Box>

        {error && (
          <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 500 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5}>
          {onCancel && (
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancel}
              disabled={saving}
              sx={{
                borderRadius: 999,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
              }}
            >
              Cancelar
            </Button>
          )}
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={saving || !closingDate || !dueDate}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CheckIcon />}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 999,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3), color: 'white' },
            }}
          >
            {saving ? 'Guardando...' : 'Guardar fechas'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default CreditCardDatesConfig;
