import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Avatar,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatAmount, getMonthName } from '../../utils';
import { isFutureMonth, isPreviousCalendarMonth } from './creditCardsHelpers';

// Devuelve true si al menos una tarjeta ya pasó su fecha de vencimiento.
function anyCardPastDue(cards, getCardDates) {
  const today = new Date();
  for (const card of cards) {
    const cardDates = getCardDates(card.id);
    if (cardDates && cardDates.dueDate) {
      const dueDate = new Date(cardDates.dueDate);
      if (today > dueDate) return true;
    }
  }
  return false;
}

const CreditCardsTotalBar = ({
  cards,
  selectedMonth,
  selectedYear,
  getAllCardsTotal,
  getCardDates,
  areCardsActuallyPaid,
  onPayClick,
}) => {
  const theme = useTheme();
  if (cards.length === 0) return null;

  const totalAmount = getAllCardsTotal();
  const cardsPaid = areCardsActuallyPaid();

  // Estado consolidado del botón: { disabled, label }.
  // Solo se habilita en el mes calendario anterior si alguna tarjeta venció.
  const buttonState = (() => {
    if (isFutureMonth(selectedYear, selectedMonth)) {
      return { disabled: true, label: 'Mes Futuro' };
    }
    if (cardsPaid) return { disabled: true, label: 'Ya Pagado' };
    if (totalAmount <= 0) return { disabled: true, label: 'Sin Gastos' };
    if (isPreviousCalendarMonth(selectedYear, selectedMonth)) {
      const pastDue = anyCardPastDue(cards, getCardDates);
      return {
        disabled: !pastDue,
        label: pastDue ? 'Pagar Tarjetas' : 'Esperar Vencimiento',
      };
    }
    return { disabled: true, label: 'No Disponible' };
  })();

  return (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
        color: 'white',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  width: 48,
                  height: 48,
                }}
              >
                <PaymentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Total a Pagar
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatAmount(totalAmount)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {cards.length} {cards.length === 1 ? 'tarjeta' : 'tarjetas'} • {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={onPayClick}
                disabled={buttonState.disabled}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: cardsPaid ? theme.palette.grey[800] : theme.palette.common.white,
                  color: cardsPaid ? theme.palette.common.white : theme.palette.success.main,
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: cardsPaid
                      ? theme.palette.grey[900]
                      : alpha(theme.palette.common.white, 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                  '&.Mui-disabled': {
                    bgcolor: cardsPaid
                      ? theme.palette.grey[800]
                      : alpha(theme.palette.common.white, 0.3),
                    color: alpha(theme.palette.common.white, 0.7),
                  },
                }}
              >
                {buttonState.label}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreditCardsTotalBar;
