import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  TextField,
  Radio,
  Chip,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatAmount } from '../../utils';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const TarjetasPaymentSheet = ({
  onBack,
  totalAmount,
  selectedYear,
  selectedMonth,
  savingsARS,
  savingsUSD,
  card,
  submitting,
  onConfirm,
}) => {
  const theme = useTheme();
  const [option, setOption] = useState('total');
  const [customAmount, setCustomAmount] = useState('');
  const [source, setSource] = useState('ars');

  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;

  const selectedAmount =
    option === 'other'
      ? parseFloat(customAmount) || 0
      : totalAmount;

  const afterBalance = source === 'ars' ? savingsARS - selectedAmount : savingsUSD - selectedAmount;
  const sourceLabel = source === 'ars' ? 'Efectivo (ARS)' : 'USD';

  const handleConfirm = () => {
    onConfirm({
      roundedAmount: selectedAmount,
      numberOfPayments: 1,
      paymentDates: [
        `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      ],
      paymentAmounts: [selectedAmount],
      source,
    });
  };

  const options = [
    { key: 'total', label: 'Total', getAmount: () => totalAmount },
    { key: 'other', label: 'Otro', getAmount: () => parseFloat(customAmount) || 0 },
  ];

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 1 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
          Registrar pago
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {card ? `${card.name}` : 'Total del mes'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Amount */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600 }}>
            MONTO A PAGAR
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', my: 1 }}>
            $ {formatAmount(selectedAmount)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center', mt: 2 }}>
            {options.map((o) => (
              <Chip
                key={o.key}
                label={o.key === 'minimo' ? `${o.label} (30%)` : o.label}
                onClick={() => { setOption(o.key); if (o.key === 'other') setCustomAmount(''); }}
                variant={option === o.key ? 'filled' : 'outlined'}
                color={option === o.key ? 'primary' : 'default'}
                sx={{ fontWeight: 600, fontSize: 12, flex: 1, maxWidth: 100 }}
              />
            ))}
          </Box>

          {option === 'other' && (
            <TextField
              type="number"
              placeholder="Ingresá el monto"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              size="small"
              fullWidth
              sx={{ mt: 1.5 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          )}
        </Card>

        {/* Source */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 600, mb: 1.5, display: 'block' }}>
            PAGAR DESDE
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { key: 'ars', icon: <AccountBalanceWalletIcon />, label: 'Efectivo (ARS)', balance: savingsARS },
              { key: 'usd', icon: <AttachMoneyIcon />, label: 'USD', balance: savingsUSD },
            ].map((s) => (
              <Box
                key={s.key}
                onClick={() => setSource(s.key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: source === s.key ? 'primary.main' : 'divider',
                  bgcolor: source === s.key ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                  cursor: 'pointer',
                  transition: '0.12s',
                }}
              >
                {s.icon}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Disponible: ${formatAmount(s.balance)}
                  </Typography>
                </Box>
                <Radio checked={source === s.key} size="small" />
              </Box>
            ))}
          </Box>
        </Card>

        {/* Date */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary">Fecha</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Hoy, {dateLabel}</Typography>
          </Box>
        </Card>

        {/* After payment */}
        <Card
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: afterBalance < 0 ? alpha(theme.palette.error.main, 0.06) : alpha(theme.palette.secondary.main, 0.06),
            borderColor: afterBalance < 0 ? theme.palette.error.dark : theme.palette.secondary.dark,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: afterBalance < 0 ? 'error.main' : 'secondary.light' }}>
            DESPUÉS DEL PAGO
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: afterBalance < 0 ? 'error.main' : 'secondary.light', mt: 0.5 }}>
            $ {formatAmount(Math.max(0, afterBalance))}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sourceLabel}
          </Typography>
        </Card>
      </Box>

      {/* Confirm button */}
      <Box sx={{ px: 1.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          onClick={selectedAmount > 0 && !submitting ? handleConfirm : undefined}
          sx={{
            width: '100%',
            textAlign: 'center',
            py: 1.75,
            borderRadius: 2,
            bgcolor: selectedAmount > 0 && !submitting ? 'primary.main' : 'action.disabledBackground',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: selectedAmount > 0 && !submitting ? 'pointer' : 'default',
            opacity: selectedAmount > 0 && !submitting ? 1 : 0.5,
            transition: '0.15s',
            '&:hover': selectedAmount > 0 ? { bgcolor: 'primary.dark' } : {},
          }}
        >
          {submitting ? 'Procesando...' : 'Confirmar pago'}
        </Box>
      </Box>
    </Box>
  );
};

export default TarjetasPaymentSheet;
