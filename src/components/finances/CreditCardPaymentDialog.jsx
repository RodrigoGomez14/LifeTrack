import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  InputLabel,
  Alert,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatAmount, getMonthName } from '../../utils';
import { calculateNextFridays } from './creditCardsHelpers';

const CreditCardPaymentDialog = ({
  open,
  onClose,
  totalAmount,
  selectedMonth,
  selectedYear,
  onConfirm,
}) => {
  const theme = useTheme();
  const [roundedAmount, setRoundedAmount] = useState(0);
  const [numberOfPayments, setNumberOfPayments] = useState(1);
  const [paymentDates, setPaymentDates] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState([]);

  // Reinicia el form cuando se abre el diálogo. Redondeo a múltiplo de 100 hacia arriba.
  useEffect(() => {
    if (!open) return;
    const initial = Math.ceil(totalAmount / 100) * 100;
    setRoundedAmount(initial);
    setNumberOfPayments(1);
    setPaymentDates(calculateNextFridays(1));
    setPaymentAmounts([initial]);
  }, [open, totalAmount]);

  const handlePaymentCountChange = (event) => {
    const count = parseInt(event.target.value, 10);
    setNumberOfPayments(count);
    setPaymentDates(calculateNextFridays(count));
    const equal = roundedAmount / count;
    setPaymentAmounts(Array(count).fill(equal));
  };

  const handleRoundedAmountChange = (e) => {
    const newValue = Number(e.target.value);
    setRoundedAmount(newValue);
    if (paymentAmounts.length > 0) {
      const equal = newValue / paymentAmounts.length;
      setPaymentAmounts(Array(paymentAmounts.length).fill(equal));
    }
  };

  // Al cambiar un monto individual: si es el último, ajusta el total; si no, el último absorbe la diferencia.
  const handlePaymentAmountChange = (index, value) => {
    const newValue = parseFloat(value) || 0;
    const newAmounts = [...paymentAmounts];
    newAmounts[index] = newValue;

    if (index === newAmounts.length - 1) {
      const newTotal = newAmounts.reduce((sum, a) => sum + a, 0);
      setRoundedAmount(newTotal);
    } else {
      const totalWithoutLast = newAmounts.slice(0, -1).reduce((sum, a) => sum + a, 0);
      newAmounts[newAmounts.length - 1] = roundedAmount - totalWithoutLast;
    }

    setPaymentAmounts(newAmounts);
  };

  const handleConfirm = () => {
    onConfirm({ roundedAmount, numberOfPayments, paymentDates, paymentAmounts });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          Configurar Pago de Tarjetas
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Card
          elevation={1}
          sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
        >
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
            Total de tarjetas: {formatAmount(totalAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getMonthName(selectedMonth)} {selectedYear}
          </Typography>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Monto redondeado"
              type="number"
              value={roundedAmount}
              onChange={handleRoundedAmountChange}
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Número de pagos</InputLabel>
              <Select
                value={numberOfPayments}
                onChange={handlePaymentCountChange}
                label="Número de pagos"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={1}>1 pago</MenuItem>
                <MenuItem value={2}>2 pagos</MenuItem>
                <MenuItem value={3}>3 pagos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            Detalle de pagos:
          </Typography>

          <Stack spacing={2}>
            {paymentDates.map((date, index) => (
              <Card key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle2" fontWeight="600">
                      Pago {index + 1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Viernes, {date.getDate()} de {getMonthName(date.getMonth() + 1).toLowerCase()} de {date.getFullYear()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Monto"
                      type="number"
                      value={paymentAmounts[index] || 0}
                      onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                      fullWidth
                      size="small"
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Stack>

          {numberOfPayments > 1 && (
            <Card
              elevation={1}
              sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="600">
                  Total de pagos:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatAmount(paymentAmounts.reduce((sum, a) => sum + a, 0))}
                </Typography>
              </Box>
            </Card>
          )}
        </Box>

        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            Los pagos se realizarán en los viernes indicados, y las tarjetas se marcarán como pagadas después de completar todos los pagos.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<PaymentIcon />}
          sx={{ borderRadius: 2 }}
        >
          Procesar Pagos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreditCardPaymentDialog;
