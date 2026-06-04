import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Card, Chip, alpha, Avatar,
  Snackbar, Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount, getMonthName, checkSearch } from '../../utils';
import { bulkUpdate, generateKey, remove } from '../../services/database';
import { setCardDatesForMonth } from '../../services/finances';
import {
  getCardType, getCardGradient, getCardLabel,
  getCardClosingDates, filterAndSortBillingPeriodTransactions,
  defaultClosingDateString, defaultDueDateString,
  buildPaymentUpdates, parseFlexibleDate,
} from '../../components/finances/creditCardsHelpers';
import CreditCardDatesConfig from '../../components/finances/CreditCardDatesConfig';
import CreditCardStatementUpload from '../../components/finances/CreditCardStatementUpload';
import TarjetasPaymentSheet from '../../components/finances/TarjetasPaymentSheet';
import TarjetasAddEditSheet from '../../components/finances/TarjetasAddEditSheet';

const CATEGORY_META = {
  Supermercado: { icon: '🛒', color: '#4CAF50' }, Hogar: { icon: '🏠', color: '#FF9800' },
  Transporte: { icon: '🚌', color: '#2196F3' }, Auto: { icon: '🚗', color: '#607D8B' },
  Salud: { icon: '🏥', color: '#E91E63' }, Restaurante: { icon: '🍽️', color: '#FF5722' },
  Entretenimiento: { icon: '🎬', color: '#9C27B0' }, Educación: { icon: '📚', color: '#3F51B5' },
  Servicios: { icon: '🔧', color: '#795548' }, Ropa: { icon: '👕', color: '#00BCD4' },
};
const getCategoryMeta = (cat) => CATEGORY_META[cat] || { icon: '💰', color: '#9E9E9E' };

const formatTxDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) { const [d, m] = dateStr.split('/'); return `${d}/${m}`; }
    const d = new Date(dateStr); return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch { return ''; }
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '-';
  const d = parseFlexibleDate(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const CreditCardDetail = () => {
  const theme = useTheme();
  const { userData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const cardId = checkSearch(location.search);
  const showPayment = new URLSearchParams(location.search).get('pago') !== null;

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sheet, setSheet] = useState(showPayment ? 'payment' : null);

  const card = useMemo(() => {
    if (!cardId || !userData?.creditCards?.[cardId]) return null;
    const c = userData.creditCards[cardId];
    if (c.name === undefined) return null;
    return { id: cardId, ...c };
  }, [userData, cardId]);

  const transactions = useMemo(() => {
    if (!card || !userData?.creditCards?.transactions?.[cardId]) return [];
    const { prevClosingDate, currentClosingDate } = getCardClosingDates(card, selectedYear, selectedMonth);
    return filterAndSortBillingPeriodTransactions(userData.creditCards.transactions[cardId], prevClosingDate, currentClosingDate);
  }, [userData, card, cardId, selectedYear, selectedMonth]);

  const cardTotal = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const getCardDates = () => {
    if (!card) return null;
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const configured = card.dates?.[monthKey];
    return {
      closingDate: configured?.closingDate || defaultClosingDateString(card, selectedYear, selectedMonth),
      dueDate: configured?.dueDate || defaultDueDateString(card, selectedYear, selectedMonth),
    };
  };

  const currentDates = getCardDates();

  const isCardPaid = () => {
    if (!card) return false;
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return !!userData?.creditCards?.[cardId]?.payments?.[monthKey];
  };

  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSaveDates = async ({ closingDate, dueDate }) => {
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    await setCardDatesForMonth(cardId, monthKey, { closingDate, dueDate });
    showAlert('Fechas actualizadas', 'success');
  };

  const handleProcessPayment = ({ roundedAmount, numberOfPayments, paymentDates, paymentAmounts, source = 'ars' }) => {
    const totalPayments = paymentAmounts.reduce((sum, a) => sum + a, 0);
    if (Math.abs(totalPayments - roundedAmount) > 0.01) { showAlert('La suma no coincide con el monto', 'error'); return; }
    setSubmitting(true);
    const cardTotals = { [cardId]: cardTotal };
    const expenseKeys = Array.from({ length: numberOfPayments }, () => generateKey('expenses'));
    const monthName = getMonthName(selectedMonth);
    const isUSD = source === 'usd';
    const currentSavings = isUSD ? (userData?.savings?.amountUSD || 0) : (userData?.savings?.amountARS || 0);
    const savingsHistoryKey = generateKey(isUSD ? 'savings/amountUSDHistory' : 'savings/amountARSHistory');
    const updates = buildPaymentUpdates({
      cards: [card],
      cardTotals,
      paymentMonthKey: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
      selectedMonth, selectedYear, monthName, roundedAmount, numberOfPayments,
      paymentDates, paymentAmounts,
      dollarRateVenta: userData?.dollarRate?.venta || 1,
      currentSavings, expenseKeys, savingsHistoryKey,
      source: isUSD ? 'usd' : 'ars',
    });
    bulkUpdate(updates)
      .then(() => { showAlert(`Pago de $${formatAmount(roundedAmount)} registrado`, 'success'); setSheet(null); })
      .catch(() => showAlert('Error al procesar el pago', 'error'))
      .finally(() => setSubmitting(false));
  };

  const handleDeleteCard = () => {
    if (!window.confirm('¿Eliminar esta tarjeta? Se borrará definitivamente.')) return;
    remove(`creditCards/${cardId}`).then(() => {
      navigate('/tarjetas'); showAlert('Tarjeta eliminada', 'success');
    }).catch(() => showAlert('Error al eliminar', 'error'));
  };

  if (!card) {
    const loading = cardId && !userData?.creditCards?.[cardId];
    return <Layout title="Tarjeta"><Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><Typography color="text.secondary">{loading ? 'Cargando...' : 'Tarjeta no encontrada'}</Typography></Box></Layout>;
  }

  const paid = isCardPaid();
  const cardType = getCardType(card.cardType || card.name);
  const gradient = getCardGradient(cardType);
  const label = getCardLabel(cardType);
  const monthName = getMonthName(selectedMonth);

  const goPrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  };

  return (
    <Layout title={card.name || 'Tarjeta'}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>

        {/* Card header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 6, height: 32, borderRadius: 1.5, background: gradient, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{label}{card.lastFourDigits ? ` ····${card.lastFourDigits}` : ''}</Typography>
          </Box>
          <IconButton size="small" onClick={() => setSheet('edit')} sx={{ color: 'text.secondary' }}><EditOutlinedIcon fontSize="small" /></IconButton>
        </Box>

        {/* Month nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton size="small" onClick={goPrevMonth} sx={{ color: 'text.secondary' }}><ChevronLeftIcon fontSize="small" /></IconButton>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>{monthName} {selectedYear}</Typography>
          <IconButton size="small" onClick={goNextMonth} sx={{ color: 'text.secondary' }}><ChevronRightIcon fontSize="small" /></IconButton>
        </Box>

        {/* Summary */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">TOTAL</Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>$ {formatAmount(cardTotal)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">CIERRE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{formatDateLabel(currentDates?.closingDate)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">VENCE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{formatDateLabel(currentDates?.dueDate)}</Typography>
            </Box>
          </Box>
        </Card>

        {/* Action button */}
        <Box
          onClick={paid || cardTotal === 0 ? undefined : () => setSheet('payment')}
          sx={{
            textAlign: 'center', py: 1.25, borderRadius: 2,
            bgcolor: paid || cardTotal === 0 ? 'action.disabledBackground' : 'primary.main',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem',
            cursor: paid || cardTotal === 0 ? 'default' : 'pointer',
            opacity: paid || cardTotal === 0 ? 0.5 : 1,
          }}
        >
          {paid ? 'Pagada' : 'Registrar pago'}
        </Box>

        {/* Movimientos */}
        {transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">Sin movimientos en este período</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map((tx, i) => {
              const meta = getCategoryMeta(tx.category);
              return (
                <Box key={tx.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Avatar sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(meta.color, 0.15), fontSize: 16 }}>{meta.icon}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{tx.description || 'Sin descripción'}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{tx.category || 'Sin categoría'}</Typography>
                      <Typography variant="caption" color="text.disabled">·</Typography>
                      <Typography variant="caption" color="text.disabled">{formatTxDate(tx.date)}</Typography>
                      {tx.installments > 1 && (
                        <Chip label={`${tx.currentInstallment}/${tx.installments}`} size="small" sx={{ height: 18, fontSize: 9, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.light' }} />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.light' }}>-$ {formatAmount(tx.amount || 0)}</Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Dates + PDF + Delete */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <CreditCardDatesConfig initialClosingDate={currentDates?.closingDate} initialDueDate={currentDates?.dueDate} onSave={handleSaveDates} onCancel={() => {}} />
          <CreditCardStatementUpload userData={userData} cardId={cardId} selectedYear={selectedYear} selectedMonth={selectedMonth} onSnack={showAlert} />
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: alpha(theme.palette.error.main, 0.2) }}>
            <Box onClick={handleDeleteCard} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', color: theme.palette.error.main }}>
              <DeleteOutlineIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Eliminar tarjeta</Typography>
            </Box>
          </Card>
        </Box>

        {/* Payment overlay */}
        {sheet === 'payment' && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default' }}>
            <TarjetasPaymentSheet
              onBack={() => setSheet(null)}
              totalAmount={cardTotal}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              savingsARS={userData?.savings?.amountARS || 0}
              savingsUSD={userData?.savings?.amountUSD || 0}
              card={card}
              submitting={submitting}
              onConfirm={handleProcessPayment}
            />
          </Box>
        )}

        {/* Edit overlay */}
        {sheet === 'edit' && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default' }}>
            <TarjetasAddEditSheet
              onBack={() => setSheet(null)}
              editCard={card}
              onSuccess={(msg) => { showAlert(msg, 'success'); setSheet(null); }}
              onError={(msg) => showAlert(msg, 'error')}
            />
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default CreditCardDetail;
