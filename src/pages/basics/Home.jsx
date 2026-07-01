import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { getMonthName, formatAmount } from '../../utils';
import { getCardClosingDates, filterAndSortBillingPeriodTransactions } from '../../components/finances/creditCardsHelpers';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import QuickActions from '../../components/home/QuickActions';
import FinancesSnapshot from '../../components/home/FinancesSnapshot';
import CreditCardsGlance from '../../components/home/CreditCardsGlance';
import FundsGlance from '../../components/home/FundsGlance';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
];
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Parser tolerante: DD/MM/YYYY o ISO.
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        if (!isNaN(date.getTime())) return date;
      }
    }
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    if (!isNaN(date.getTime())) return date;
  } catch (e) {
    // ignore
  }
  return null;
};

// Filtro común: transacciones del mes hasta hoy, opcionalmente excluye ocultas/tarjeta.
const sumMonthUpToToday = (monthData, today, excludeHidden) => {
  if (!monthData?.data || !Array.isArray(monthData.data)) return 0;
  return monthData.data
    .filter((tx) => {
      if (excludeHidden && (tx.hiddenFromList || tx.excludeFromTotal)) return false;
      const txDate = parseDate(tx.date);
      return txDate && txDate <= today;
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
};

// Top categorías agrupando transacciones del mes hasta hoy.
const computeTopCategories = (monthData, today, excludeHidden) => {
  if (!monthData?.data || !Array.isArray(monthData.data)) return [];
  const categoryTotals = {};
  monthData.data
    .filter((tx) => {
      if (excludeHidden && (tx.hiddenFromList || tx.excludeFromTotal)) return false;
      const txDate = parseDate(tx.date);
      return txDate && txDate <= today;
    })
    .forEach((tx) => {
      const category = tx.category || 'Sin categoría';
      categoryTotals[category] = (categoryTotals[category] || 0) + (tx.amount || 0);
    });
  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount]) => ({ category, amount }));
};

const Home = () => {
  const { userData, dollarRate } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const displayName = user?.displayName || '';

  const currentDate = useMemo(() => new Date(), []);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // ── Snapshot: toda la data derivada, computada UNA sola vez ──────────
  const snapshot = useMemo(() => {
    if (!userData?.finances || !userData?.savings) return null;

    const incomeMonth = userData.finances.incomes?.[currentYear]?.months?.[currentMonth];
    const expenseMonth = userData.finances.expenses?.[currentYear]?.months?.[currentMonth];

    const incomeTotal = sumMonthUpToToday(incomeMonth, today, false);
    const expenseTotal = sumMonthUpToToday(expenseMonth, today, true);

    const incomeCategories = computeTopCategories(incomeMonth, today, false);
    const expenseCategories = computeTopCategories(expenseMonth, today, true);

    const savingsARS = userData.savings.amountARS || 0;
    const savingsUSD = userData.savings.amountUSD || 0;

    const savingsFunds = userData.savingsFunds || {};
    const fundsList = Object.values(savingsFunds).filter((f) => f.name);
    const totalFunds = fundsList.reduce((s, f) => s + (f.balance || 0), 0);
    const fundCount = fundsList.length;

    // Credit cards snapshot
    const cardsObj = userData.creditCards || {};
    const cardIds = Object.keys(cardsObj).filter((k) => k !== 'transactions');
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const cards = cardIds.map((cardId) => {
      const card = cardsObj[cardId];
      const { prevClosingDate, currentClosingDate } = getCardClosingDates(card, currentYear, currentMonth);
      const transactions = filterAndSortBillingPeriodTransactions(
        cardsObj.transactions?.[cardId] || {},
        prevClosingDate,
        currentClosingDate
      );
      const totalARS = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalNativeUSD = transactions.reduce((sum, t) =>
        t.currency === 'USD' ? sum + (t.amountUSD || 0) : sum, 0
      );
      const rate = dollarRate?.venta || 1;
      const total = totalARS + totalNativeUSD * rate;
      const paid = !!card.payments?.[monthKey];

      // Fechas configuradas o defaults
      const configured = card.dates?.[monthKey];
      const closingDay = configured?.closingDate
        ? (() => { const [y, m, d] = configured.closingDate.split('-').map(Number); return d; })()
        : (card.defaultClosingDay || 10);
      const dueDay = configured?.dueDate
        ? (() => { const [y, m, d] = configured.dueDate.split('-').map(Number); return d; })()
        : (card.defaultDueDay || 25);

      let dueMonth = currentMonth;
      let dueYear = currentYear;
      if (dueDay <= closingDay) {
        dueMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        if (currentMonth === 12) dueYear = currentYear + 1;
      }

      const closingDate = new Date(currentYear, currentMonth - 1, closingDay);
      const dueDate = new Date(dueYear, dueMonth - 1, dueDay);

      return {
        id: cardId,
        name: card.name || 'Sin nombre',
        cardType: card.cardType,
        lastFourDigits: card.lastFourDigits,
        total,
        totalNativeUSD,
        paid,
        closingDay,
        closingMonth: currentMonth,
        dueDay,
        dueMonth,
        dates: {
          closingLabel: `${DAYS_SHORT[closingDate.getDay()]} ${closingDay} ${getMonthName(currentMonth).substring(0, 3)}`,
          dueLabel: `${DAYS_SHORT[dueDate.getDay()]} ${dueDay} ${getMonthName(dueMonth).substring(0, 3)}`,
        },
      };
    });

    const totalPendiente = cards.reduce((sum, c) => sum + (c.paid ? 0 : c.total), 0);

    const todayDay = new Date().getDate();
    const isPastClosing = cards.some((c) => c.total > 0 && todayDay >= c.closingDay);
    const showPayButton = totalPendiente > 0 && isPastClosing;

    return {
      incomeTotal,
      expenseTotal,
      incomeCategories,
      expenseCategories,
      savingsARS,
      savingsUSD,
      totalFunds,
      fundCount,
      cards,
      totalPendiente,
      showPayButton,
    };
  }, [userData, currentYear, currentMonth, today]);

  const now = new Date();
  const todayLabel = `${DAYS[now.getDay()]} ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`;

  // ── Loading state ────────────────────────────────────────────────────
  if (!snapshot) {
    return (
      <Layout title="Home">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="80vh" p={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), mb: 3 }}>
            <DashboardIcon color="primary" style={{ fontSize: 50, opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" color="primary" align="center" gutterBottom>
            Cargando dashboard...
          </Typography>
          <LinearProgress sx={{ width: '60%', maxWidth: 300, borderRadius: 1, mb: 2 }} color="primary" />
          <Typography variant="caption" color="textSecondary">
            Esto solo tomará unos segundos
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Home">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800}>{displayName ? `Hola, ${displayName}!` : 'Panel de control'}</Typography>
          <Typography variant="caption" color="text.secondary">{todayLabel}</Typography>
        </Box>

        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Acciones rápidas */}
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', px: 0.5 }}>
              ACCIONES RÁPIDAS
            </Typography>
          </AnimatedItem>
          <AnimatedItem><QuickActions onNavigate={(route) => navigate(route)} /></AnimatedItem>

          {/* Finanzas */}
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', px: 0.5 }}>
              FINANZAS
            </Typography>
          </AnimatedItem>
          <AnimatedItem>
            <FinancesSnapshot
              incomeTotal={snapshot.incomeTotal}
              expenseTotal={snapshot.expenseTotal}
              savingsARS={snapshot.savingsARS}
              savingsUSD={snapshot.savingsUSD}
              incomeCategories={snapshot.incomeCategories}
              expenseCategories={snapshot.expenseCategories}
            />
          </AnimatedItem>

          {/* Tarjetas */}
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', px: 0.5 }}>
              TARJETAS
            </Typography>
          </AnimatedItem>
          <AnimatedItem>
            <CreditCardsGlance
              cards={snapshot.cards}
              totalPendiente={snapshot.totalPendiente}
              showPayButton={snapshot.showPayButton}
              onPayCards={() => navigate(`/PagarTarjeta?mes=${currentMonth}&anio=${currentYear}`)}
            />
          </AnimatedItem>

          {/* Fondos de ahorro */}
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', px: 0.5 }}>
              FONDOS DE AHORRO
            </Typography>
          </AnimatedItem>
          <AnimatedItem>
            <FundsGlance
              totalFunds={snapshot.totalFunds}
              fundCount={snapshot.fundCount}
            />
          </AnimatedItem>
        </AnimatedGroup>
      </Box>
    </Layout>
  );
};

export default Home;
