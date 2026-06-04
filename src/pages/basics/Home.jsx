import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  LinearProgress,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { getMonthName, formatAmount } from '../../utils';
import { MiniCard, SectionCard } from '../../design-system';
import DollarRatesRow from '../../components/home/DollarRatesRow';
import FinancialEvolutionChart from '../../components/home/FinancialEvolutionChart';
import SavingsEvolutionChart from '../../components/home/SavingsEvolutionChart';
import MonthlyIncomeCard from '../../components/home/MonthlyIncomeCard';
import MonthlyExpenseCard from '../../components/home/MonthlyExpenseCard';
import CreditCardsSummaryCard from '../../components/home/CreditCardsSummaryCard';
import HabitsSection from '../../components/home/HabitsSection';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
];

// Parser tolerante: DD/MM/YYYY o ISO. Devuelve null si no parsea.
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
    console.warn(`Error parsing date: ${dateStr}`, e);
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
const computeTopCategories = (monthData, today, total, excludeHidden) => {
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
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
};

// Calcula totales del mes anterior hasta el día equivalente al actual + el rango "DD/MM - DD/MM".
const computePreviousMonthData = (userData, currentYear, currentMonth) => {
  const today = new Date();
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const lastDayOfPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
  const targetDay = Math.min(today.getDate(), lastDayOfPreviousMonth);
  const lastMonthToday = new Date(previousYear, previousMonth - 1, targetDay);
  const firstDayLastMonth = new Date(previousYear, previousMonth - 1, 1);

  const formatDateShort = (date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  const comparisonDateRange = `${formatDateShort(firstDayLastMonth)} - ${formatDateShort(lastMonthToday)}`;

  const incomeMonth = userData?.finances?.incomes?.[previousYear]?.months?.[previousMonth];
  const expenseMonth = userData?.finances?.expenses?.[previousYear]?.months?.[previousMonth];

  const previousIncome = sumMonthUpToToday(incomeMonth, lastMonthToday, false);
  const previousExpense = sumMonthUpToToday(expenseMonth, lastMonthToday, true);
  const previousBalance = previousIncome - previousExpense;

  return { previousIncome, previousExpense, previousBalance, comparisonDateRange };
};

const getPercentChange = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

const Home = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const [openSpeedDial, setOpenSpeedDial] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);

  // Loading state mientras llega userData
  if (!userData || !userData.finances || !userData.savings) {
    return (
      <Layout title="Dashboard">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="80vh"
          p={3}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              mb: 3,
            }}
          >
            <DashboardIcon color="primary" style={{ fontSize: 50, opacity: 0.7 }} />
          </Box>
          <Typography variant="h5" color="primary" align="center" gutterBottom>
            Preparando tu dashboard financiero...
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
            Estamos cargando y analizando tus datos para brindarte la información financiera más actualizada.
          </Typography>
          <LinearProgress sx={{ width: '60%', maxWidth: 300, borderRadius: 1, mb: 2 }} color="primary" />
          <Typography variant="caption" color="textSecondary">
            Esto solo tomará unos segundos
          </Typography>
        </Box>
      </Layout>
    );
  }

  // Cálculos derivados del mes actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const incomeMonth = userData?.finances?.incomes?.[currentYear]?.months?.[currentMonth];
  const expenseMonth = userData?.finances?.expenses?.[currentYear]?.months?.[currentMonth];

  const incomeTotal = sumMonthUpToToday(incomeMonth, today, false);
  const expenseTotal = sumMonthUpToToday(expenseMonth, today, true);
  const balance = incomeTotal - expenseTotal;

  const topIncomeCategories = computeTopCategories(incomeMonth, today, incomeTotal, false);
  const topExpenseCategories = computeTopCategories(expenseMonth, today, expenseTotal, true);

  const { previousIncome, previousExpense, comparisonDateRange } =
    computePreviousMonthData(userData, currentYear, currentMonth);

  const incomeChange = getPercentChange(incomeTotal, previousIncome);
  const expenseChange = getPercentChange(expenseTotal, previousExpense);

  const savingsARS = userData?.savings?.amountARS || 0;
  const savingsUSD = userData?.savings?.amountUSD || 0;

  const now = new Date();
  const todayLabel = `${DAYS[now.getDay()]} ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`;

  return (
    <Layout title="Home">
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>Panel de control</Typography>
            <Typography variant="caption" color="text.secondary">{todayLabel}</Typography>
          </Box>
        </Box>

        {/* MiniCards — métricas principales */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2, '& > *': { flex: '1 1 150px', minWidth: 150 } }}>
          <MiniCard icon={<TrendingDownIcon />} label="Gastos del mes" value={`$${formatAmount(expenseTotal)}`} color="error" link="/finanzas" />
          <MiniCard icon={<TrendingUpIcon />} label="Ingresos del mes" value={`$${formatAmount(incomeTotal)}`} color="success" link="/finanzas" />
          <MiniCard icon={<AttachMoneyIcon />} label="Balance" value={`$${formatAmount(balance)}`} color={balance >= 0 ? 'success' : 'error'} />
          <MiniCard icon={<SavingsOutlinedIcon />} label="Ahorros ARS" value={`$${formatAmount(savingsARS)}`} color="info" link="/ahorros" />
          <MiniCard icon={<SavingsOutlinedIcon />} label="Ahorros USD" value={`USD ${formatAmount(savingsUSD)}`} color="primary" link="/ahorros" />
        </Box>

        {/* Charts */}
        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={8}>
            <SectionCard title="Evolución financiera" icon={<TrendingUpIcon sx={{ fontSize: 18, color: '#fff' }} />}>
              <FinancialEvolutionChart userData={userData} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <SectionCard title="Evolución de ahorros" icon={<SavingsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />}>
              <SavingsEvolutionChart userData={userData} />
            </SectionCard>
          </Grid>
        </Grid>

        {/* Ingresos, Gastos, Tarjetas */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 0.5 }}>
          <MonthlyIncomeCard
            incomeTotal={incomeTotal}
            incomeChange={incomeChange}
            previousIncome={previousIncome}
            topIncomeCategories={topIncomeCategories}
            comparisonDateRange={comparisonDateRange}
            dollarRate={dollarRate}
            currentMonthName={currentMonthName}
            currentYear={currentYear}
          />
          <MonthlyExpenseCard
            expenseTotal={expenseTotal}
            expenseChange={expenseChange}
            previousExpense={previousExpense}
            topExpenseCategories={topExpenseCategories}
            comparisonDateRange={comparisonDateRange}
            dollarRate={dollarRate}
            currentMonthName={currentMonthName}
            currentYear={currentYear}
          />
          <CreditCardsSummaryCard
            userData={userData}
            dollarRate={dollarRate}
            currentYear={currentYear}
            currentMonth={currentMonth}
            currentMonthName={currentMonthName}
          />
        </Grid>

        <HabitsSection userData={userData} />

        <DollarRatesRow />

        <SpeedDial
          ariaLabel="Acciones rápidas"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
          open={openSpeedDial}
          onOpen={() => setOpenSpeedDial(true)}
          onClose={() => setOpenSpeedDial(false)}
        >
          <SpeedDialAction
            key="nuevoHabito"
            icon={<PlaylistAddCheckIcon />}
            tooltipTitle="Nuevo Hábito"
            onClick={() => navigate('/NuevoHabito')}
          />
          <SpeedDialAction
            key="nuevoGasto"
            icon={<TrendingDownIcon />}
            tooltipTitle="Nuevo Gasto"
            onClick={() => navigate('/NuevoGasto')}
          />
          <SpeedDialAction
            key="nuevoIngreso"
            icon={<TrendingUpIcon />}
            tooltipTitle="Nuevo Ingreso"
            onClick={() => navigate('/NuevoIngreso')}
          />
        </SpeedDial>
      </Box>
    </Layout>
  );
};

export default Home;
