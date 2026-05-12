import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount } from '../../utils';
import RefundDialog from '../../components/finances/RefundDialog';
import FinancesTimeNavigator from '../../components/finances/FinancesTimeNavigator';
import MonthlySummaryCard from '../../components/finances/MonthlySummaryCard';
import MonthlyTransactionsList from '../../components/finances/MonthlyTransactionsList';
import AnnualTrends from '../../components/finances/AnnualTrends';
import SavingsEvolutionCard from '../../components/finances/SavingsEvolutionCard';
import { getMonthName } from '../../utils';

const Finances = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();

  // Selectores compartidos por todos los hijos del dashboard
  const [dataType, setDataType] = useState('expenses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Datos derivados (recalculados por useEffect cuando cambian los selectores)
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState({
    months: [],
    expenses: [],
    incomes: [],
    balance: [],
  });

  // SpeedDial flotante
  const [openSpeedDial, setOpenSpeedDial] = useState(false);

  // Dialog de devolución (lo abre el listado, lo cierra el dialog)
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleOpenRefund = (transaction) => {
    if (dataType !== 'expenses') return;
    setSelectedTransaction(transaction);
    setOpenRefundDialog(true);
  };

  const handleCloseRefund = () => {
    setOpenRefundDialog(false);
    setSelectedTransaction(null);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  // Recalcula `monthlyData` (resumen + categorías del mes) cuando cambia el período/tipo.
  // Se ejecuta solo si el shape de userData.finances está disponible.
  useEffect(() => {
    if (!userData?.finances) return;

    const monthData = userData.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
    if (!monthData) {
      setMonthlyData(null);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const categoryData = {};

    if (monthData.data && Array.isArray(monthData.data)) {
      monthData.data.forEach((transaction) => {
        const category = transaction.category || 'Sin categoría';
        if (!categoryData[category]) {
          categoryData[category] = { total: 0, percentage: 0, subcategories: {} };
        }

        // Detectar transacciones con fecha futura → no las contamos en totales
        let isFutureTransaction = false;
        if (transaction.date) {
          let transactionDate;
          if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
            const [day, month, year] = transaction.date.split('/').map(Number);
            transactionDate = new Date(year, month - 1, day);
          } else {
            transactionDate = new Date(transaction.date);
          }
          if (!isNaN(transactionDate.getTime()) && transactionDate > today) {
            isFutureTransaction = true;
          }
        }

        if (!transaction.hiddenFromList && !isFutureTransaction && !transaction.excludeFromTotal) {
          const effectiveAmount = (transaction.amount || 0) - (transaction.refundAmount || 0);
          categoryData[category].total += effectiveAmount;
          if (transaction.subcategory) {
            categoryData[category].subcategories[transaction.subcategory] =
              (categoryData[category].subcategories[transaction.subcategory] || 0) + effectiveAmount;
          }
        }
      });

      const total = Object.values(categoryData).reduce((sum, cat) => sum + cat.total, 0);
      Object.keys(categoryData).forEach((category) => {
        categoryData[category].percentage = total > 0 ? (categoryData[category].total / total) * 100 : 0;
      });

      setMonthlyData({
        ...monthData,
        formattedTotal: formatAmount(total),
        formattedTotalUSD: formatAmount(total / (dollarRate?.venta || 1)),
        categoryData,
        sortedCategories: Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total),
      });
    } else if (monthData.categories) {
      // Estructura legacy: categorías ya pre-procesadas
      const total = monthData.total || 0;
      Object.entries(monthData.categories).forEach(([category, data]) => {
        categoryData[category] = {
          total: data.total,
          percentage: total > 0 ? (data.total / total) * 100 : 0,
          subcategories: { ...data.subcategories },
        };
      });
      setMonthlyData({
        ...monthData,
        formattedTotal: formatAmount(total),
        formattedTotalUSD: formatAmount(total / (dollarRate?.venta || 1)),
        categoryData,
        sortedCategories: Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total),
      });
    } else {
      setMonthlyData(null);
    }
  }, [userData, selectedYear, selectedMonth, dataType, dollarRate]);

  // Recalcula `monthlyTrendsData` (gastos/ingresos/balance por mes del año seleccionado).
  useEffect(() => {
    if (!userData?.finances) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sumVisible = (entries) =>
      entries
        .filter((t) => {
          if (t.date) {
            let transactionDate;
            if (typeof t.date === 'string' && t.date.includes('/')) {
              const [day, month, year] = t.date.split('/').map(Number);
              transactionDate = new Date(year, month - 1, day);
            } else {
              transactionDate = new Date(t.date);
            }
            if (!isNaN(transactionDate.getTime()) && transactionDate > today) return false;
          }
          return !t.hiddenFromList && !t.excludeFromTotal;
        })
        .reduce((sum, t) => sum + ((t.amount || 0) - (t.refundAmount || 0)), 0);

    const expenseData = Array(12).fill(0);
    const incomeData = Array(12).fill(0);

    if (userData.finances.expenses?.[selectedYear]?.months) {
      Object.keys(userData.finances.expenses[selectedYear].months).forEach((month) => {
        const monthIndex = parseInt(month) - 1;
        const monthData = userData.finances.expenses[selectedYear].months[month];
        expenseData[monthIndex] = (monthData.data && Array.isArray(monthData.data))
          ? sumVisible(monthData.data)
          : (monthData.total || 0);
      });
    }

    if (userData.finances.incomes?.[selectedYear]?.months) {
      Object.keys(userData.finances.incomes[selectedYear].months).forEach((month) => {
        const monthIndex = parseInt(month) - 1;
        const monthData = userData.finances.incomes[selectedYear].months[month];
        incomeData[monthIndex] = (monthData.data && Array.isArray(monthData.data))
          ? sumVisible(monthData.data.filter((t) => !t.hiddenFromList))
          : (monthData.total || 0);
      });
    }

    setMonthlyTrendsData({
      months: Array.from({ length: 12 }, (_, i) => getMonthName(i + 1).substring(0, 3)),
      expenses: expenseData,
      incomes: incomeData,
      balance: incomeData.map((income, i) => income - expenseData[i]),
    });
  }, [userData, selectedYear]);

  // Loading state mientras llega userData
  if (!userData || !userData.finances || !userData.savings) {
    return (
      <Layout title="Análisis Financiero">
        <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
          <Grid item>
            <Typography variant="h5" color="textSecondary">
              Cargando datos financieros, por favor espere...
            </Typography>
          </Grid>
        </Grid>
      </Layout>
    );
  }

  return (
    <Layout title="Análisis Financiero">
      <Box sx={{ minHeight: '100vh', width: '100%', position: 'relative', pt: 0, pb: 4 }}>
        <FinancesTimeNavigator
          dataType={dataType}
          setDataType={setDataType}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          handlePreviousMonth={handlePreviousMonth}
          monthlyData={monthlyData}
        />

        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 2 }, mt: 0 }}>
          <Grid item xs={12} md={6}>
            <MonthlySummaryCard
              monthlyData={monthlyData}
              dataType={dataType}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MonthlyTransactionsList
              userData={userData}
              dataType={dataType}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              dollarRate={dollarRate}
              onOpenRefund={handleOpenRefund}
            />
          </Grid>

          <AnnualTrends
            monthlyTrendsData={monthlyTrendsData}
            dollarRate={dollarRate}
          />

          <SavingsEvolutionCard
            userData={userData}
            dollarRate={dollarRate}
          />
        </Grid>

        <RefundDialog
          open={openRefundDialog}
          transaction={selectedTransaction}
          dollarRate={dollarRate}
          currentSavings={userData?.savings?.amountARS}
          onClose={handleCloseRefund}
        />

        <SpeedDial
          ariaLabel="Acciones rápidas de finanzas"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
          open={openSpeedDial}
          onOpen={() => setOpenSpeedDial(true)}
          onClose={() => setOpenSpeedDial(false)}
        >
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

export default Finances;
