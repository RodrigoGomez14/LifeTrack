import React from 'react';
import { Box, Typography, Button, Chip, Divider, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatNumber, getMonthName } from '../../utils';
import {
  getCardType, getCardGradient, getCardLabel,
} from './creditCardsHelpers';
import { DashedAddCard, AnimatedGroup, AnimatedItem } from '../../design-system';

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TarjetasListView = ({
  cards,
  selectedYear,
  selectedMonth,
  cardDates,
  getCardTotal,
  getCardTotalNativeUSD,
  isCardPaid,
  displayTotal,
  areCardsActuallyPaid,
  onCardClick,
  onAddCard,
  onOpenPayment,
}) => {
  const theme = useTheme();

  const today = new Date();
  const todayDay = today.getDate();

  const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const isCurrentOrPrevMonth =
    (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) ||
    (selectedYear === prevYear && selectedMonth === prevMonth);

  const isPastClosing = cards.some((card) => {
    const total = getCardTotal(card.id);
    const dates = cardDates[card.id];
    if (total <= 0 || !dates) return false;
    const isBeforeCurrent = selectedYear < today.getFullYear() || (selectedYear === today.getFullYear() && selectedMonth - 1 < today.getMonth());
    if (isBeforeCurrent) return true;
    return todayDay >= dates.closingDay;
  });

  const totalPendiente = displayTotal;
  const showPaymentButton = isPastClosing && !areCardsActuallyPaid() && totalPendiente > 0;

  return (
    <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Total global card — ghost style */}
      {cards.length > 0 && (
        <AnimatedItem>
        <Box sx={{
          textAlign: 'center',
          py: 3,
          px: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
          bgcolor: alpha(theme.palette.warning.main, 0.06),
          transition: '0.12s',
          '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.12) },
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>
            TOTAL DEL PERÍODO
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.warning.main, letterSpacing: -1 }}>
            $ {formatNumber(totalPendiente)}
          </Typography>
          {showPaymentButton && (
            <Button
              onClick={onOpenPayment}
              sx={{
                mt: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                color: theme.palette.warning.main,
                '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.12) },
              }}
            >
              Pagar
            </Button>
          )}
        </Box>
        </AnimatedItem>
      )}

      {/* Cards */}
      {cards.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No tenés tarjetas de crédito
          </Typography>
          <DashedAddCard label="Agregar tarjeta" desc="Registrá tu primera tarjeta" onClick={onAddCard} />
        </Box>
      ) : (
        <>
          {cards.map((card) => {
            const cardTypeKey = getCardType(card.cardType || card.name);
            const gradient = getCardGradient(cardTypeKey);
            const label = getCardLabel(cardTypeKey);
            const total = getCardTotal(card.id);
            const nativeUSD = getCardTotalNativeUSD ? getCardTotalNativeUSD(card.id) : 0;
            const paid = isCardPaid(card.id);
            const dates = cardDates[card.id];

            const isPending = total > 0 && !paid && dates && todayDay >= dates.closingDay && isCurrentOrPrevMonth;
            const isInactive = total === 0 && !paid;

            const shortClosing = (() => {
              if (!dates) return null;
              const d = new Date(selectedYear, selectedMonth - 1, dates.closingDay);
              return `${DAYS_SHORT[d.getDay()]} ${dates.closingDay} ${getMonthName(selectedMonth).substring(0, 3)}`;
            })();

            const shortDue = (() => {
              if (!dates) return null;
              const dueYear = (selectedMonth === 12 && dates.dueMonth === 1) ? selectedYear + 1 : selectedYear;
              const d = new Date(dueYear, dates.dueMonth - 1, dates.dueDay);
              return `${DAYS_SHORT[d.getDay()]} ${dates.dueDay} ${getMonthName(dates.dueMonth).substring(0, 3)}`;
            })();

            return (
              <AnimatedItem key={card.id}>
              <Box
                key={card.id}
                onClick={() => onCardClick(card.id)}
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  background: gradient,
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
                  },
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                {/* Top: amount + status + card type */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                        $ {formatNumber(total)}
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, mt: 0.5, mb: 0.5 }}>
                        USD {formatNumber(nativeUSD, { abbreviate: false })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                      {isPending && (
                        <Chip label="PENDIENTE" size="small"
                          sx={{ bgcolor: 'warning.main', color: '#fff', fontWeight: 700, fontSize: 10, height: 22, letterSpacing: 0.3 }} />
                      )}
                      {paid && (
                        <Chip label="PAGADA" size="small"
                          sx={{ bgcolor: 'success.main', color: '#fff', fontWeight: 700, fontSize: 10, height: 22, letterSpacing: 0.3 }} />
                      )}
                      {isInactive && (
                        <Chip label="SIN GASTOS" size="small"
                          sx={{ bgcolor: alpha('#fff', 0.15), color: alpha('#fff', 0.7), fontWeight: 600, fontSize: 10, height: 22, letterSpacing: 0.3 }} />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 700, letterSpacing: 3 }}>
                    {label}
                  </Typography>
                </Box>

                {/* Bottom: dates — siempre visible para altura uniforme */}
                <>
                  <Divider sx={{ borderColor: alpha('#fff', 0.1), my: 1.5 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600, letterSpacing: 0.5 }}>
                        CIERRE
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mt: 0.25 }}>
                        {dates.isConfigured ? shortClosing : '−'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', borderLeft: `1px solid ${alpha('#fff', 0.1)}` }}>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600, letterSpacing: 0.5 }}>
                        VENCE
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mt: 0.25 }}>
                        {dates.isConfigured ? shortDue : '−'}
                      </Typography>
                    </Box>
                  </Box>
                </>
              </Box>
              </AnimatedItem>
            );
          })}

          {/* Add card ghost — al final del listado */}
          <AnimatedItem>
          <Box sx={{ mt: 1.5 }}>
            <DashedAddCard label="Agregar tarjeta" onClick={onAddCard} />
          </Box>
          </AnimatedItem>
        </>
      )}
    </AnimatedGroup>
  );
};

export default TarjetasListView;
