import React from 'react';
import {
  Grid,
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  ButtonBase,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatAmount } from '../../utils';

// Formatea "lunes 14 de enero" a partir de YYYY-MM-DD o ISO.
const formatFullDate = (dateString) => {
  if (!dateString) return '-';

  let date;
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(dateString);
  }
  if (isNaN(date.getTime())) return '-';

  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
};

// Devuelve la fecha de cierre del período de facturación que corresponde al mes/año actual,
// según la configuración de la tarjeta. Acepta override por mes en `card.dates[YYYY-MM]`.
const resolveClosingDate = (card, year, month) => {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  if (card.dates && card.dates[monthKey] && card.dates[monthKey].closingDate) {
    const closingDateStr = card.dates[monthKey].closingDate;
    if (typeof closingDateStr === 'string' && closingDateStr.includes('-')) {
      const [y, m, d] = closingDateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(closingDateStr);
  }
  if (card.defaultClosingDay) {
    return new Date(year, month - 1, card.defaultClosingDay);
  }
  return new Date(year, month, 0);
};

// Total facturado de una tarjeta en el período de cierre actual.
// Suma transacciones cuya fecha cae en (cierre anterior, cierre actual].
const getCardTotal = (userData, cardId, currentYear, currentMonth) => {
  if (!userData?.creditCards?.transactions?.[cardId]) return 0;
  const card = userData.creditCards[cardId];
  if (!card) return 0;

  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }

  const prevClosingDate = resolveClosingDate(card, prevYear, prevMonth);
  const currClosingDate = resolveClosingDate(card, currentYear, currentMonth);

  let total = 0;
  Object.values(userData.creditCards.transactions[cardId]).forEach((tx) => {
    let txDate = null;
    if (typeof tx.date === 'string') {
      if (tx.date.includes('/')) {
        const [d, m, y] = tx.date.split('/').map(Number);
        txDate = new Date(y, m - 1, d);
      } else if (tx.date.includes('-')) {
        const [y, m, d] = tx.date.split('-').map(Number);
        txDate = new Date(y, m - 1, d);
      }
    } else if (tx.date instanceof Date) {
      txDate = new Date(tx.date);
    }
    if (!txDate || isNaN(txDate.getTime())) return;

    const txTime = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
    const prevTime = new Date(prevClosingDate.getFullYear(), prevClosingDate.getMonth(), prevClosingDate.getDate()).getTime();
    const currTime = new Date(currClosingDate.getFullYear(), currClosingDate.getMonth(), currClosingDate.getDate()).getTime();

    if (txTime > prevTime && txTime <= currTime) {
      total += tx.amount || 0;
    }
  });
  return total;
};

// Lee fechas del mes actual de la tarjeta (override por mes o defaults configurados).
const getCardDates = (card, currentYear, currentMonth) => {
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  if (card.dates && card.dates[monthKey]) return card.dates[monthKey];

  const closingDay = card.defaultClosingDay || 15;
  const dueDay = card.defaultDueDay || 10;
  const closingDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(closingDay).padStart(2, '0')}`;

  let dueYear = currentYear;
  let dueMonth = currentMonth + 1;
  if (dueMonth > 12) { dueMonth = 1; dueYear += 1; }
  const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;
  return { closingDate, dueDate };
};

// Construye el resumen consolidado de tarjetas del mes actual.
const buildCreditCardsData = (userData, currentYear, currentMonth) => {
  if (!userData?.creditCards) {
    return { totalAmount: 0, cards: [], closingDates: [], dueDates: [], hasStatements: false, statements: {} };
  }

  const cards = Object.keys(userData.creditCards)
    .filter((key) => key !== 'transactions')
    .map((id) => ({ id, ...userData.creditCards[id] }));

  let totalAmount = 0;
  const closingDates = new Set();
  const dueDates = new Set();
  let hasStatements = false;
  const statements = {};
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  cards.forEach((card) => {
    const cardTotal = getCardTotal(userData, card.id, currentYear, currentMonth);
    totalAmount += cardTotal;

    const dates = getCardDates(card, currentYear, currentMonth);
    if (dates.closingDate) closingDates.add(formatFullDate(dates.closingDate));
    if (dates.dueDate) dueDates.add(formatFullDate(dates.dueDate));

    if (card.statements && card.statements[monthKey]) {
      hasStatements = true;
      statements[card.id] = {
        name: card.name,
        statement: card.statements[monthKey],
        total: cardTotal,
      };
    }
  });

  return {
    totalAmount,
    cards,
    closingDates: Array.from(closingDates).filter((d) => d !== '-'),
    dueDates: Array.from(dueDates).filter((d) => d !== '-'),
    hasStatements,
    statements,
  };
};

// Abre el PDF del resumen en una nueva pestaña si existe `downloadURL`.
const handleViewStatement = (statement) => {
  try {
    if (statement.downloadURL) {
      window.open(statement.downloadURL, '_blank');
    }
  } catch (error) {
    console.error('Error al ver el resumen:', error);
  }
};

const CreditCardsSummaryCard = ({ userData, dollarRate, currentYear, currentMonth, currentMonthName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const venta = dollarRate?.venta || 1;

  const data = buildCreditCardsData(userData, currentYear, currentMonth);

  return (
    <Grid item xs={12} md={4}>
      <Card
        elevation={3}
        sx={{
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s ease',
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-5px)' },
            boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
            >
              <CreditCardIcon />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                Tarjetas de Crédito
              </Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                {currentMonthName} {currentYear}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Monto principal */}
          <Box sx={{ mb: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total a Pagar
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
              color: theme.palette.warning.main,
              letterSpacing: '-0.5px'
            }}>
              $ {formatAmount(data.totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
              USD {formatAmount(data.totalAmount / venta)}
            </Typography>
          </Box>

          {/* Información de fechas */}
          <Box sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            mb: 1.5
          }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Cierre:
              </Typography>
              {data.closingDates.length > 0 ? (
                data.closingDates.map((date, index) => (
                  <Typography key={index} variant="body2" fontWeight="bold" color="text.primary" sx={{ mt: 0.5 }}>
                    {date}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No configurado
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Vencimiento:
              </Typography>
              {data.dueDates.length > 0 ? (
                data.dueDates.map((date, index) => (
                  <Typography key={index} variant="body2" fontWeight="bold" color="text.primary" sx={{ mt: 0.5 }}>
                    {date}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No configurado
                </Typography>
              )}
            </Box>
          </Box>

          {/* Resúmenes disponibles como subtarjetas */}
          <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {data.hasStatements ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Resúmenes disponibles:
                </Typography>
                {Object.entries(data.statements).map(([cardId, statementData]) => (
                  <ButtonBase
                    key={cardId}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStatement(statementData.statement);
                    }}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      width: '100%',
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.success.main, 0.15),
                        borderColor: alpha(theme.palette.success.main, 0.4),
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.success.main, 0.2),
                        flexShrink: 0
                      }}>
                        <CreditCardIcon sx={{ fontSize: 14, color: theme.palette.success.main }} />
                      </Box>
                      <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                          {statementData.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Resumen {currentMonthName} {currentYear}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 'auto' }}>
                        <Typography variant="body2" color="text.primary" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                          {formatAmount(statementData.total)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          USD {formatAmount(statementData.total / venta)}
                        </Typography>
                      </Box>
                    </Box>
                  </ButtonBase>
                ))}
              </Box>
            ) : data.totalAmount === 0 && data.cards.length > 0 ? (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 1,
                p: 1,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  Sin saldo pendiente
                </Typography>
              </Box>
            ) : data.cards.length === 0 ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
                textAlign: 'center'
              }}>
                <CreditCardIcon sx={{ fontSize: 32, color: theme.palette.grey[400], mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay tarjetas registradas
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default CreditCardsSummaryCard;
