import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { getMonthName } from '../../utils';
import {
  getCardClosingDates,
  filterAndSortBillingPeriodTransactions,
  parseFlexibleDate,
  isBeyondFutureLimit,
} from '../../components/finances/creditCardsHelpers';
import MonthNav from '../../components/shared/MonthNav';
import TarjetasListView from '../../components/finances/TarjetasListView';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const computeMonth = (userData, cards, year, month, rate) => {
  if (!userData?.creditCards || cards.length === 0) return null;

  const allCardTransactions = {};
  cards.forEach((card) => {
    const cardTransactions = userData.creditCards.transactions?.[card.id];
    if (!cardTransactions) { allCardTransactions[card.id] = []; return; }
    const cardData = userData.creditCards[card.id];
    const { prevClosingDate, currentClosingDate } = getCardClosingDates(cardData, year, month);
    allCardTransactions[card.id] = filterAndSortBillingPeriodTransactions(cardTransactions, prevClosingDate, currentClosingDate);
  });

  const cardSummaryDates = {};
  cards.forEach((card) => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const configured = card.dates?.[monthKey];
    const closingDay = configured?.closingDate ? parseFlexibleDate(configured.closingDate).getDate() : (card.defaultClosingDay || 10);
    const dueDay = configured?.dueDate ? parseFlexibleDate(configured.dueDate).getDate() : (card.defaultDueDay || 25);
    let dueMonth = month; let dueYear = year;
    if (dueDay <= closingDay) { dueMonth = month === 12 ? 1 : month + 1; if (month === 12) dueYear = year + 1; }
    const closingDate = new Date(year, month - 1, closingDay);
    const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
    const today = new Date();
    const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1);
    cardSummaryDates[card.id] = {
      closingDay, dueDay, dueMonth, isFutureMonth,
      closingLabel: `${DAYS_ES[closingDate.getDay()]} ${closingDay} de ${getMonthName(month)} de ${year}`,
      dueLabel: `${DAYS_ES[dueDate.getDay()]} ${dueDay} de ${getMonthName(dueMonth)} de ${dueYear}`,
      isConfigured: !!(configured?.closingDate && configured?.dueDate),
    };
  });

  const getCardTotal = (cardId) => { if (!allCardTransactions[cardId]) return 0; return allCardTransactions[cardId].reduce((s, t) => s + t.amount, 0); };
  const getCardTotalNativeUSD = (cardId) => { if (!allCardTransactions[cardId]) return 0; return allCardTransactions[cardId].reduce((s, t) => t.currency === 'USD' ? s + (t.amountUSD || 0) : s, 0); };
  const getAllCardsTotal = () => cards.reduce((s, c) => s + getCardTotal(c.id), 0);
  const getAllCardsTotalNativeUSD = () => cards.reduce((s, c) => s + getCardTotalNativeUSD(c.id), 0);
  const today = new Date();
  const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const paymentTotal = userData?.creditCardPayments?.[monthKey]?.amount || 0;
  const combinedTotal = getAllCardsTotal() + getAllCardsTotalNativeUSD() * rate;
  const displayTotal = isPastMonth && paymentTotal > 0 ? paymentTotal : combinedTotal;
  const isCardPaid = (cardId) => { if (!cardId) return false; return !!userData?.creditCards?.[cardId]?.payments?.[monthKey]; };
  const areCardsActuallyPaid = () => { if (userData?.creditCardPayments?.[monthKey]) return true; if (cards.length === 0) return true; const w = cards.filter((c) => getCardTotal(c.id) > 0); if (w.length === 0) return true; return w.every((c) => isCardPaid(c.id)); };

  return { cards, cardSummaryDates, getCardTotal, getCardTotalNativeUSD, displayTotal, isCardPaid, areCardsActuallyPaid };
};

const CreditCards = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const cards = useMemo(() => {
    if (!userData?.creditCards) return [];
    return Object.keys(userData.creditCards).filter((k) => k !== 'transactions').map((id) => ({ id, ...userData.creditCards[id] }));
  }, [userData]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const animatingRef = useRef(false);

  const [panelW, setPanelW] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);
  useEffect(() => { const cb = () => setPanelW(window.innerWidth); window.addEventListener('resize', cb); return () => window.removeEventListener('resize', cb); }, []);

  const panelWRef = useRef(panelW);
  useEffect(() => { panelWRef.current = panelW; }, [panelW]);

  const panX = useMotionValue(-panelW);
  useEffect(() => { panX.set(-panelW); }, [panelW, panX]);

  const pM = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const pY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const nM = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const nY = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

  const rate = dollarRate?.venta || 1;
  const curData = useMemo(() => computeMonth(userData, cards, selectedYear, selectedMonth, rate), [userData, cards, selectedYear, selectedMonth, rate]);
  const prevData = useMemo(() => computeMonth(userData, cards, pY, pM, rate), [userData, cards, pY, pM, rate]);
  const nextData = useMemo(() => computeMonth(userData, cards, nY, nM, rate), [userData, cards, nY, nM, rate]);

  const openDetail = (cardId) => navigate(`/tarjeta?id=${cardId}`);
  const openMultiPayment = (m, y) => navigate(`/PagarTarjeta?mes=${m}&anio=${y}`);
  const openAdd = () => navigate('/nuevaTarjeta');

  const isNextDisabled = isBeyondFutureLimit(
    selectedMonth === 12 ? selectedYear + 1 : selectedYear,
    selectedMonth === 12 ? 1 : selectedMonth + 1, 3
  );

  const handleMonthChange = (m) => {
    if (animatingRef.current) return;
    const dir = m > selectedMonth ? 1 : -1;
    const target = dir > 0 ? -panelWRef.current * 2 : 0;
    animatingRef.current = true;
    animate(panX, target, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
      panX.jump(-panelWRef.current);
      animatingRef.current = false;
      setSelectedMonth(m);
    });
  };

  const handleYearChange = (y) => {
    if (animatingRef.current) { setSelectedYear(y); return; }
    const dir = y > selectedYear ? 1 : -1;
    const target = dir > 0 ? -panelWRef.current * 2 : 0;
    animatingRef.current = true;
    animate(panX, target, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
      panX.jump(-panelWRef.current);
      animatingRef.current = false;
      setSelectedYear(y);
    });
  };

  const doPrev = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };
  const doNext = () => {
    if (isNextDisabled) return;
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    const margin = panelW * 0.05;
    if (x < margin || x > panelW - margin) return;
    touchStartX.current = x;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isDragging.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) isDragging.current = true;
    if (isDragging.current) panX.set(-panelW + dx);
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = panX.get() + panelW;
    const threshold = panelW * 0.3;
    if (offset < -threshold) {
      animatingRef.current = true;
      animate(panX, -panelW * 2, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
        animatingRef.current = false;
        panX.jump(-panelW);
        doNext();
      });
    } else if (offset > threshold) {
      animatingRef.current = true;
      animate(panX, 0, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
        animatingRef.current = false;
        panX.jump(-panelW);
        doPrev();
      });
    } else {
      animate(panX, -panelW, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  const renderList = (data, year, month) => {
    if (!data) return null;
    return (
      <TarjetasListView
        cards={data.cards}
        selectedYear={year}
        selectedMonth={month}
        cardDates={data.cardSummaryDates}
        getCardTotal={data.getCardTotal}
        getCardTotalNativeUSD={data.getCardTotalNativeUSD}
        isCardPaid={data.isCardPaid}
        displayTotal={data.displayTotal}
        areCardsActuallyPaid={data.areCardsActuallyPaid}
        onCardClick={openDetail}
        onAddCard={openAdd}
        onOpenPayment={() => openMultiPayment(month, year)}
      />
    );
  };

  return (
    <Layout title="Tarjetas">
      <MonthNav year={selectedYear} month={selectedMonth} onYearChange={handleYearChange} onMonthChange={handleMonthChange} disabledNext={isNextDisabled} />

      <Box onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <Box sx={{ overflow: 'hidden' }}>
          <motion.div style={{ display: 'flex', x: panX, width: panelW * 3 }}>
            <Box sx={{ minWidth: panelW, py: 2 }}>
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>{renderList(prevData, pY, pM)}</Box>
            </Box>
            <Box sx={{ minWidth: panelW, py: 2 }}>
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>{renderList(curData, selectedYear, selectedMonth)}</Box>
            </Box>
            <Box sx={{ minWidth: panelW, py: 2 }}>
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>{renderList(nextData, nY, nM)}</Box>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Layout>
  );
};

export default CreditCards;
