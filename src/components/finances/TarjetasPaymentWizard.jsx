import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Card, Checkbox, TextField, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import { bulkUpdate, generateKey } from '../../services/database';
import { addExpense } from '../../services/finances';
import {
  getCardType, getCardGradient, getCardLabel,
  getCardClosingDates, filterAndSortBillingPeriodTransactions,
  buildPaymentUpdates,
} from '../finances/creditCardsHelpers';
import WizardProgressDots from '../plants/WizardProgressDots';
import WizardFooter from '../plants/WizardFooter';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const toDateInput = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
};
const fromDateInput = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
};

const TarjetasPaymentWizard = ({
  cards: inputCards,
  cardId,
  selectedYear,
  selectedMonth,
  onClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();

  const [step, setStep] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set(cardId ? [cardId] : []));
  const [customAmount, setCustomAmount] = useState('');
  const [customDate, setCustomDate] = useState(null);
  const [dateEditing, setDateEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');

  const [numberOfPayments, setNumberOfPayments] = useState(0);
  const [paymentAmounts, setPaymentAmounts] = useState(['']);
  const [paymentDates, setPaymentDates] = useState(['']);

  const totalSteps = numberOfPayments > 1 ? 4 + numberOfPayments : 4;

  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()]}`;
  const monthName = getMonthName(selectedMonth);
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const allCardTransactions = useMemo(() => {
    if (!userData?.creditCards || inputCards.length === 0) return {};
    const all = {};
    inputCards.forEach((card) => {
      const tx = userData.creditCards.transactions?.[card.id];
      if (!tx) return;
      const cardData = userData.creditCards[card.id];
      const { prevClosingDate, currentClosingDate } = getCardClosingDates(cardData, selectedYear, selectedMonth);
      all[card.id] = filterAndSortBillingPeriodTransactions(tx, prevClosingDate, currentClosingDate);
    });
    return all;
  }, [userData, inputCards, selectedYear, selectedMonth]);

  const getCardTotal = (id) => {
    if (!allCardTransactions[id]) return 0;
    return allCardTransactions[id].reduce((sum, t) => sum + t.amount, 0);
  };

  const selectedCards = inputCards.filter((c) => selectedCardIds.has(c.id));

  const totalSelected = selectedCards.reduce((sum, c) => sum + getCardTotal(c.id), 0);

  const selectedAmount = customAmount
    ? (parseFloat(customAmount.replace(',', '.')) || 0)
    : totalSelected;

  const savingsARS = userData?.savings?.amountARS || 0;
  const currentSavings = savingsARS;
  const rate = dollarRate?.venta || 1;
  const firstPaymentAmount = numberOfPayments > 1
    ? (parseFloat((paymentAmounts[0] || '').replace(',', '.')) || 0)
    : selectedAmount;
  const afterBalanceARS = savingsARS - firstPaymentAmount;

  const toggleCard = (id) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setCustomAmount((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (customAmount.includes(',')) return;
      if (!customAmount) { setCustomAmount('0,'); return; }
      setCustomAmount(customAmount + ','); return;
    }
    if (customAmount === '0' && key !== ',') { setCustomAmount(key); return; }
    if (customAmount.includes(',')) { const d = customAmount.split(',')[1]; if (d.length >= 2) return; }
    setCustomAmount(customAmount + key);
  };

  const formatDisplay = (raw) => {
    if (!raw) return '-';
    const parts = raw.split(',');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts[1] !== undefined ? `${int},${parts[1]}` : int;
  };

  const handleNumberOfPayments = (n) => {
    setNumberOfPayments(n);
    setPaymentAmounts(Array.from({ length: n }, () => ''));
    const dates = Array.from({ length: n }, (_, i) => {
      const d = new Date(today);
      const day = d.getDay();
      const daysUntilFriday = day <= 5 ? 5 - day : 5 + (7 - day);
      d.setDate(d.getDate() + daysUntilFriday + (i * 7));
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    });
    setPaymentDates(dates);
  };

  const updatePaymentAmount = (index, value) => {
    setPaymentAmounts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updatePaymentDate = (index, raw) => {
    if (!raw) return;
    const parts = raw.split('-');
    const dateStr = `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
    setPaymentDates((prev) => {
      const next = [...prev];
      next[index] = dateStr;
      return next;
    });
  };

  const paymentsTotalSum = paymentAmounts.reduce((sum, a) => sum + (parseFloat(a.replace(',', '.')) || 0), 0);
  const paymentsRemaining = selectedAmount - paymentsTotalSum;
  const isComplete = Math.abs(paymentsRemaining) < 0.01;      
  const handleSubmit = async () => {
    if (selectedCardIds.size === 0 || selectedAmount <= 0) return;
    if (numberOfPayments > 1 && !isComplete) return;
    setSubmitting(true);
    try {
      const cardTotals = {};
      selectedCards.forEach((c) => { cardTotals[c.id] = getCardTotal(c.id); });
      const cardsToPay = selectedCards.filter((c) => cardTotals[c.id] > 0);
      if (cardsToPay.length === 0) { setSubmitting(false); return; }

      const defaultDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      const paymentGroup = Date.now().toString(36);
      const actualPaymentDates = numberOfPayments > 1 ? paymentDates : [customDate || defaultDate];
      const actualPaymentAmounts = numberOfPayments > 1
        ? paymentAmounts.map((a) => parseFloat(a.replace(',', '.')) || 0)
        : [selectedAmount];

      // Primera cuota: impacta ahorros
      const firstDate = customDate || actualPaymentDates[0];
      const expenseKeys = Array.from({ length: 1 }, () => generateKey('expenses'));
      const savingsHistoryKey = generateKey('savings/amountARSHistory');
      const updates = buildPaymentUpdates({
        cards: cardsToPay,
        cardTotals,
        paymentMonthKey: monthKey,
        selectedMonth, selectedYear, monthName,
        roundedAmount: actualPaymentAmounts[0],
        numberOfPayments: 1,
        paymentDates: [firstDate],
        paymentAmounts: [actualPaymentAmounts[0]],
        dollarRateVenta: rate,
        currentSavings,
        expenseKeys,
        savingsHistoryKey,
        source: 'ars',
      });
      await bulkUpdate(updates);

      // Cuotas 2..N: sin impacto en ahorros, marcadas como pendientes
      for (let i = 1; i < actualPaymentAmounts.length; i++) {
        const amount = actualPaymentAmounts[i];
        if (amount <= 0) continue;
        const txDate = actualPaymentDates[i] || defaultDate;
        const description = `Pago tarjeta - Cuota ${i + 1}/${numberOfPayments}`;
        const txData = {
          amount,
          amountUSD: amount / rate,
          category: 'Tarjeta',
          date: txDate,
          description,
          currency: 'ARS',
          valorUSD: rate,
          paymentMethod: 'cash',
          creditCardTransaction: false,
          excludeFromTotal: true,
          hiddenFromList: true,
          pendingImpact: true,
          cardPaymentGroup: paymentGroup,
        };
        addExpense(txData);
      }

      setSnack('Pago registrado');
      setTimeout(() => { onClose(); navigate('/tarjetas'); }, 600);
    } catch (err) {
      console.error(err);
      setSnack(`Error: ${err.message || 'al procesar el pago'}`);
    }
    setSubmitting(false);
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const cardsWithBalance = inputCards.filter((c) => getCardTotal(c.id) > 0);

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
) : (
            <Box sx={{ width: 36 }} />
          )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Registrar pago</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={totalSteps} current={step} />

      {/* Step 0: Select cards */}
      {step === 0 && (
        <>
          <AnimatedGroup sx={{ flex: 1, overflow: 'auto', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block' }}>
              SELECCIONÁ LAS TARJETAS
            </Typography>
            {cardsWithBalance.length === 0 ? (
              <AnimatedItem>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay tarjetas con saldo este mes
              </Typography>
              </AnimatedItem>
            ) : (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {cardsWithBalance.map((card) => {
                  const isSelected = selectedCardIds.has(card.id);
                  const cardType = getCardType(card.cardType || card.name);
                  const gradient = getCardGradient(cardType);
                  const label = getCardLabel(cardType);
                  const total = getCardTotal(card.id);
                  return (
                    <AnimatedItem key={card.id}>
                    <Card
                      key={card.id}
                      variant="outlined"
                      onClick={() => toggleCard(card.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: isSelected ? 'primary.main' : theme.palette.divider,
                        borderWidth: isSelected ? 2 : 1,
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                        transition: '0.12s',
                        '&:hover': { borderColor: theme.palette.primary.light },
                      }}
                    >
                      <Box sx={{ width: 4, minHeight: 44, borderRadius: 2, background: gradient, flexShrink: 0, alignSelf: 'stretch' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{card.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{label}{card.lastFourDigits ? ` ····${card.lastFourDigits}` : ''}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.light', mr: 1 }}>
                                                {formatAmount(total)}
                      </Typography>
                      <Checkbox checked={isSelected} sx={{ color: isSelected ? 'primary.main' : 'text.disabled' }} />
                    </Card>
                    </AnimatedItem>
                  );
                })}
              </AnimatedGroup>
            )}
          </AnimatedGroup>

          <AnimatedItem>
          <Box sx={{ px: 3, pb: 3 }}>
            <Button fullWidth variant="contained" disabled={selectedCardIds.size === 0} onClick={goNext}
              sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
              Siguiente →
            </Button>
          </Box>
          </AnimatedItem>
        </>
      )}

      {/* Step 1: Amount */}
      {step === 1 && (
        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
              MONTO A PAGAR
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>
                            {customAmount ? `$ ${formatDisplay(customAmount)}` : formatAmount(selectedAmount)}
            </Typography>
          </Box>
          </AnimatedItem>

          <AnimatedItem>
          <Box sx={{ px: 3, pb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
                <Button key={key} fullWidth onClick={() => handleKeyPress(key)}
                  sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                  {key === 'backspace' ? <BackspaceIcon /> : key}
                </Button>
              ))}
            </Box>
          </Box>
          </AnimatedItem>

          <AnimatedItem>
          <Box sx={{ px: 3, pb: 3 }}>
            <Button fullWidth variant="contained" disabled={selectedAmount <= 0} onClick={goNext}
              sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
              Siguiente →
            </Button>
          </Box>
          </AnimatedItem>
        </AnimatedGroup>
      )}

      {/* Step 2: Cuotas */}
      {step === 2 && (
        <Box sx={{ flex: 1, overflow: 'auto', px: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
            ¿EN CUÁNTOS PAGOS?
          </Typography>
          <AnimatedGroup>
          {[1, 2, 3, 4].map((n) => (
            <AnimatedItem key={n}>
            <Card
              key={n}
              variant="outlined"
              onClick={() => {
                handleNumberOfPayments(n);
                setStep(3);
              }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, mb: 1,
                borderRadius: 2, cursor: 'pointer',
                borderColor: numberOfPayments === n ? 'error.main' : theme.palette.divider,
                borderWidth: numberOfPayments === n ? 2 : 1,
                bgcolor: numberOfPayments === n ? alpha(theme.palette.error.main, 0.04) : 'transparent',
                transition: '0.12s',
                '&:hover': { borderColor: theme.palette.error.light },
              }}
            >
              <Checkbox checked={numberOfPayments === n} sx={{ color: numberOfPayments === n ? 'error.main' : 'text.disabled' }} />
              <Typography variant="body2" sx={{ fontWeight: numberOfPayments === n ? 700 : 500 }}>
                {n} pago{n > 1 ? 's' : ''}
              </Typography>
            </Card>
            </AnimatedItem>
          ))}
          </AnimatedGroup>
        </Box>
      )}

      {/* Individual payment steps (N>1) */}
      {numberOfPayments > 1 && step >= 3 && step < totalSteps - 1 && (() => {
        const paymentIndex = step - 3;
        const amt = paymentAmounts[paymentIndex] || '';
        const amtNum = parseFloat(amt.replace(',', '.')) || 0;
        const splitSuggestion = selectedAmount / numberOfPayments;
        const displayAmt = amt ? `$ ${formatDisplay(amt)}` : `$ ${splitSuggestion.toFixed(2).replace('.', ',')}`;
        const isPlaceholder = !amt;

        const handlePaymentKeyPress = (key) => {
          if (key === 'backspace') {
            updatePaymentAmount(paymentIndex, amt.slice(0, -1));
            return;
          }
          const current = paymentAmounts[paymentIndex] || '';
          if (key === ',') {
            if (current.includes(',')) return;
            updatePaymentAmount(paymentIndex, current ? current + ',' : '0,');
            return;
          }
          if (current === '0' && key !== ',') { updatePaymentAmount(paymentIndex, key); return; }
          if (current.includes(',')) { const d = current.split(',')[1]; if (d.length >= 2) return; }
          updatePaymentAmount(paymentIndex, current + key);
        };

        return (
          <AnimatedGroup key={step} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
                PAGO {paymentIndex + 1}/{numberOfPayments}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: isPlaceholder ? 'text.disabled' : 'error.main', mt: 1 }}>
                {displayAmt}
              </Typography>
            </Box>
            </AnimatedItem>

            <AnimatedItem>
            <Box sx={{ px: 3, pb: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
                  <Button key={key} fullWidth onClick={() => handlePaymentKeyPress(key)}
                    sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                    {key === 'backspace' ? <BackspaceIcon /> : key}
                  </Button>
                ))}
              </Box>
            </Box>
            </AnimatedItem>

            <AnimatedItem>
            <Box sx={{ px: 3, mb: 2 }}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">Fecha</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(() => {
                        const d = paymentDates[paymentIndex] || `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
                        const parts = d.split('/');
                        const date = new Date(parts[2], parts[1] - 1, parts[0]);
                        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
                      })()}
                    </Typography>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  </Box>
                </Box>
              </Card>
            </Box>
            </AnimatedItem>

            <AnimatedItem>
            <Box sx={{ px: 3, pb: 3 }}>
              <WizardFooter label="Siguiente" disabled={amtNum <= 0} onClick={goNext} />
            </Box>
            </AnimatedItem>
          </AnimatedGroup>
        );
      })()}

      {/* Step N: Review */}
      {step === totalSteps - 1 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatedGroup sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Datos */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box onClick={() => setDateEditing(!dateEditing)}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5, borderBottom: selectedCards.filter((c) => getCardTotal(c.id) > 0).length > 0 ? `1px solid ${theme.palette.divider}` : 'none', cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04) } }}>
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                {dateEditing ? (
                  <TextField type="date" size="small"
                    value={toDateInput(customDate || `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`)}
                    onChange={(e) => {
                      if (e.target.value) setCustomDate(fromDateInput(e.target.value));
                      setDateEditing(false);
                    }}
                    onBlur={() => setDateEditing(false)}
                    autoFocus
                    sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {customDate || `Hoy, ${dateLabel}`}
                    </Typography>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                  </Box>
                )}
              </Box>
              {selectedCards.filter((c) => getCardTotal(c.id) > 0).map((c) => (
                <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography variant="body2" color="text.secondary">{c.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.light' }}>{formatAmount(getCardTotal(c.id))}</Typography>
                </Box>
              ))}
            </Card></AnimatedItem>

            {numberOfPayments > 1 && (
              <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                {paymentAmounts.map((amt, i) => {
                  const amtNum = parseFloat(amt.replace(',', '.')) || 0;
                  return (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cuota {i + 1}/{numberOfPayments}</Typography>
                        <Typography variant="caption" color="text.disabled">{paymentDates[i]}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.light' }}>
                        {formatAmount(amtNum)}
                      </Typography>
                    </Box>
                  );
                })}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, bgcolor: alpha(theme.palette.error.main, 0.04) }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{formatAmount(paymentsTotalSum)}</Typography>
                </Box>
              </Card></AnimatedItem>
            )}

            {/* Monto total */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 3, p: 2.5, bgcolor: alpha(theme.palette.error.main, 0.04), textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Monto a pagar</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                {formatAmount(selectedAmount)}
              </Typography>
            </Card></AnimatedItem>

            {/* Ahorros */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(theme.palette.error.main, 0.04) }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {formatAmount(currentSavings)}
                </Typography>
                <Box sx={{ display: 'inline-block', bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                    − {formatAmount(firstPaymentAmount)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.error.main, 0.1)}`, mx: 2.5 }} />
              <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Nuevos ahorros</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mt: 0.25 }}>
                  {formatAmount(afterBalanceARS)}
                </Typography>
              </Box>
            </Card></AnimatedItem>
          </AnimatedGroup>

          <WizardFooter
            label="Confirmar pago"
            disabled={selectedAmount <= 0 || (numberOfPayments > 1 && !isComplete)}
            loading={submitting}
            onClick={handleSubmit}
          />
        </Box>
      )}

      {/* Snackbar */}
      {snack && (
        <Box sx={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 20, bgcolor: 'success.main', color: '#fff', px: 3, py: 1.5, borderRadius: 3, fontWeight: 600, fontSize: '0.9rem', boxShadow: 3 }}>
          {snack}
        </Box>
      )}
    </Box>
  );
};

export default TarjetasPaymentWizard;
