import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { addCreditCard, updateCreditCard } from '../../services/finances';
import { getCardGradient, getCardLabel } from './creditCardsHelpers';

const CARD_TYPES = [
  { key: 'visa', label: 'Visa' },
  { key: 'master', label: 'Mastercard' },
  { key: 'amex', label: 'American Express' },
  { key: 'other', label: 'Otra' },
];

const TarjetasAddEditSheet = ({
  onBack,
  editCard,
  onSuccess,
  onError,
}) => {
  const theme = useTheme();
  const isEdit = !!editCard;

  const [name, setName] = useState(editCard?.name || '');
  const [cardType, setCardType] = useState(editCard?.cardType || 'visa');
  const [lastFourDigits, setLastFourDigits] = useState(editCard?.lastFourDigits || '');
  const [defaultClosingDay, setDefaultClosingDay] = useState(editCard?.defaultClosingDay || '');
  const [defaultDueDay, setDefaultDueDay] = useState(editCard?.defaultDueDay || '');
  const [submitting, setSubmitting] = useState(false);

  const gradient = getCardGradient(cardType);
  const label = getCardLabel(cardType);

  const maskDigits = lastFourDigits.length === 4 ? lastFourDigits : '----';

  const handleSubmit = async () => {
    if (!name.trim() || lastFourDigits.length !== 4) return;
    setSubmitting(true);
      try {
      if (isEdit) {
        await updateCreditCard(editCard.id, {
          name: name.trim(),
          cardType,
          lastFourDigits,
          ...(defaultClosingDay !== '' ? { defaultClosingDay: parseInt(defaultClosingDay) } : {}),
          ...(defaultDueDay !== '' ? { defaultDueDay: parseInt(defaultDueDay) } : {}),
        });
      } else {
        await addCreditCard({
          name: name.trim(),
          cardType,
          lastFourDigits,
          ...(defaultClosingDay !== '' ? { defaultClosingDay: parseInt(defaultClosingDay) } : {}),
          ...(defaultDueDay !== '' ? { defaultDueDay: parseInt(defaultDueDay) } : {}),
        });
      }
      onSuccess(isEdit ? 'Tarjeta actualizada' : 'Tarjeta agregada');
      onBack();
    } catch (err) {
      console.error(err);
      onError('Error al guardar la tarjeta');
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Card preview */}
      <Box
          sx={{
            width: '100%',
            maxWidth: 340,
            mx: 'auto',
            height: 190,
            borderRadius: 3,
            background: gradient,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), fontWeight: 500, letterSpacing: 0.5 }}>
              {name.trim() || 'Nombre del banco'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 2, fontFamily: 'monospace', mb: 1 }}>
              .... .... .... {maskDigits}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 700, letterSpacing: 3 }}>
              {label}
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <TextField
          label="Nombre del banco"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          placeholder="Ej: Galicia"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* Type selector */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
            Tipo de tarjeta
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {CARD_TYPES.map((t) => (
              <Box
                key={t.key}
                onClick={() => setCardType(t.key)}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: cardType === t.key ? 'primary.main' : 'divider',
                  bgcolor: cardType === t.key ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                  cursor: 'pointer',
                  transition: '0.12s',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: cardType === t.key ? 700 : 500, fontSize: 11 }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <TextField
          label="Últimos 4 dígitos"
          value={lastFourDigits}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
            setLastFourDigits(v);
          }}
          fullWidth
          size="small"
          inputProps={{ maxLength: 4, inputMode: 'numeric' }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="Día de cierre"
            value={defaultClosingDay}
            onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setDefaultClosingDay(v); }}
            fullWidth size="small" type="number" inputProps={{ min: 1, max: 28 }}
            placeholder="10"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="Día de vencimiento"
            value={defaultDueDay}
            onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setDefaultDueDay(v); }}
            fullWidth size="small" type="number" inputProps={{ min: 1, max: 28 }}
            placeholder="25"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>

      {/* Submit */}
      <Box sx={{ px: 1.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          onClick={name.trim() && lastFourDigits.length === 4 && !submitting ? handleSubmit : undefined}
          sx={{
            width: '100%',
            textAlign: 'center',
            py: 1.75,
            borderRadius: 2,
            bgcolor: name.trim() && lastFourDigits.length === 4 && !submitting ? 'primary.main' : 'action.disabledBackground',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: name.trim() && lastFourDigits.length === 4 && !submitting ? 'pointer' : 'default',
            opacity: name.trim() && lastFourDigits.length === 4 && !submitting ? 1 : 0.5,
            transition: '0.15s',
          }}
        >
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar tarjeta'}
        </Box>
      </Box>
    </Box>
  );
};

export default TarjetasAddEditSheet;
