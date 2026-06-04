import React from 'react';
import { Box, Typography, IconButton, Card, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatAmount, getMonthName } from '../../utils';
import {
  getCardType, getCardGradient, getCardLabel,
  isBeyondFutureLimit, extractActiveInstallments,
} from './creditCardsHelpers';
import { DashedAddCard } from '../../design-system';

const getDueLabel = (card, year, month) => {
  const mKey = `${year}-${String(month).padStart(2, '0')}`;
  const configured = card.dates?.[mKey];
  const day = configured?.dueDate
    ? (() => { const d = new Date(configured.dueDate); return d.getDate(); })()
    : card.defaultDueDay || 25;
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  let m = month;
  if (day <= (configured?.closingDate ? new Date(configured.closingDate).getDate() : card.defaultClosingDay || 10)) {
    m = month === 12 ? 1 : month + 1;
  }
  return `Vence ${day} ${months[m - 1]}`;
};

const TarjetasListView = ({
  cards,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
  getCardTotal,
  isCardPaid,
  getAllCardsTotal,
  areCardsActuallyPaid,
  onCardClick,
  onAddCard,
  onOpenPayment,
  onSwipePay,
  cardTransactions,
}) => {
  const theme = useTheme();
  const monthName = getMonthName(selectedMonth);

  const goPrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  };

  const isNextDisabled = isBeyondFutureLimit(
    selectedMonth === 12 ? selectedYear + 1 : selectedYear,
    selectedMonth === 12 ? 1 : selectedMonth + 1,
    3
  );

  const totalPendiente = getAllCardsTotal();
  const showPaymentBanner = !areCardsActuallyPaid() && totalPendiente > 0;

  const getStatusChip = (cardId) => {
    const paid = isCardPaid(cardId);
    const total = getCardTotal(cardId);
    if (paid) return { label: 'Pagada', color: 'success' };
    if (total === 0) return { label: 'Sin gastos', color: 'default' };
    return { label: 'Pendiente', color: 'warning' };
  };

  const getActiveInstallmentCount = (cardId) => {
    const allTx = cardTransactions?.[cardId];
    if (!allTx) return 0;
    const active = extractActiveInstallments(allTx);
    return active.length;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Month navigator */}
      <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 1, borderRadius: 2 }}>
        <IconButton size="small" onClick={goPrevMonth} sx={{ color: 'text.secondary' }}><ChevronLeftIcon fontSize="small" /></IconButton>
        <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{monthName} {selectedYear}</Typography>
        <IconButton size="small" onClick={goNextMonth} disabled={isNextDisabled} sx={{ color: isNextDisabled ? 'text.disabled' : 'text.secondary' }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Card>

      {/* Pending banner */}
      {showPaymentBanner && (
        <Card variant="outlined" onClick={onOpenPayment} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderRadius: 2,
          bgcolor: alpha(theme.palette.warning.main, 0.08), borderColor: alpha(theme.palette.warning.main, 0.3),
          cursor: 'pointer', transition: '0.15s', '&:hover': { borderColor: theme.palette.warning.main },
        }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.warning.main, letterSpacing: 0.5 }}>PAGO PENDIENTE</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.warning.light }}>$ {formatAmount(totalPendiente)}</Typography>
          </Box>
          <Chip label="Pagar" size="small" sx={{ bgcolor: theme.palette.warning.main, color: '#fff', fontWeight: 700, fontSize: 11, height: 28, px: 1 }} />
        </Card>
      )}

      {/* Cards */}
      {cards.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No tenés tarjetas de crédito</Typography>
          <DashedAddCard label="Agregar tarjeta" desc="Registrá tu primera tarjeta" onClick={onAddCard} />
        </Box>
      ) : (
        cards.map((card) => {
          const cardType = getCardType(card.cardType || card.name);
          const gradient = getCardGradient(cardType);
          const label = getCardLabel(cardType);
          const total = getCardTotal(card.id);
          const status = getStatusChip(card.id);
          const instCount = getActiveInstallmentCount(card.id);
          const dueLabel = getDueLabel(card, selectedYear, selectedMonth);

          return (
            <Card key={card.id} variant="outlined"
              onClick={() => onCardClick(card.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.75, borderRadius: 2,
                cursor: 'pointer', transition: '0.15s', position: 'relative', overflow: 'hidden',
                '&:hover': { borderColor: theme.palette.primary.light },
              }}>
              {/* Left color indicator */}
              <Box sx={{ width: 4, minHeight: 52, borderRadius: 2, background: gradient, flexShrink: 0, alignSelf: 'stretch' }} />

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{card.name || 'Sin nombre'}</Typography>
                <Typography variant="caption" color="text.secondary">{label}{card.lastFourDigits ? ` ····${card.lastFourDigits}` : ''}</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mt: 0.25, flexWrap: 'wrap' }}>
                  {total > 0 && (
                    <Typography variant="caption" sx={{ color: theme.palette.warning.light, fontWeight: 500, fontSize: 10 }}>
                      ⏰ {dueLabel}
                    </Typography>
                  )}
                  {instCount > 0 && (
                    <Chip label={`${instCount} cuota${instCount > 1 ? 's' : ''}`} size="small"
                      sx={{ height: 18, fontSize: 9, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.light', fontWeight: 600 }} />
                  )}
                </Box>
              </Box>

              {/* Amount + status */}
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: total > 0 ? theme.palette.error.light : theme.palette.text.secondary, lineHeight: 1.2 }}>
                  $ {formatAmount(total)}
                </Typography>
                <Chip label={status.label} size="small" color={status.color} sx={{ height: 20, fontSize: 10, fontWeight: 600, mt: 0.25 }} />
              </Box>

              {/* Swipe-to-pay indicator (right edge) */}
              {total > 0 && !status.label.includes('Pagada') && (
                <Box
                  onClick={(e) => { e.stopPropagation(); onSwipePay?.(card.id); }}
                  sx={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(theme.palette.warning.main, 0.12), cursor: 'pointer',
                    opacity: 0, transition: 'opacity 0.15s',
                    '&:hover': { opacity: 1 },
                    '.MuiCard-root:hover &': { opacity: 0.7 },
                  }}>
                  <Box sx={{ color: theme.palette.warning.main, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 18, lineHeight: 1 }}>$</Typography>
                  </Box>
                </Box>
              )}
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default TarjetasListView;
