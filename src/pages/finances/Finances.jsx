import React, { useState, useEffect } from 'react';
import {
  Box,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  CircularProgress,
} from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import RefundDialog from '../../components/finances/RefundDialog';
import FinancesHeader from '../../components/finances/FinancesHeader';
import FinancesMonthSummary from '../../components/finances/FinancesMonthSummary';
import FinancesCharts from '../../components/finances/FinancesCharts';
import FinancesTransactionsList from '../../components/finances/FinancesTransactionsList';

const Finances = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();

  // Selectores principales
  const [dataType, setDataType] = useState('expenses');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Derivados (recalculados por los 2 useEffect)
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState({
    months: [],
    expenses: [],
    incomes: [],
    balance: [],
  });

  // SpeedDial flotante
  const [openSpeedDial, setOpenSpeedDial] = useState(false);

  // Dialog de devolución
  const [openRefundDialog, setOpenRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleOpenRefund = (transaction) => {
    if (dataType !== 'expenses') return;
    setSelectedTransaction(transaction);
    setOpenRefundDialog(true);
  };

  // ── Cálculo de monthlyData (categorías + total efectivo del mes) ──
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

        // Descartar futuras
        let isFutureTransaction = false;
        if (transaction.date) {
          let txDate;
          if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
            const [day, month, year] = transaction.date.split('/').map(Number);
            txDate = new Date(year, month - 1, day);
          } else {
            txDate = new Date(transaction.date);
          }
          if (!isNaN(txDate.getTime()) && txDate > today) isFutureTransaction = true;
        }

        if (!transaction.hiddenFromList && !isFutureTransaction && !transaction.excludeFromTotal) {
          const effective = (transaction.amount || 0) - (transaction.refundAmount || 0);
          categoryData[category].total += effective;
          if (transaction.subcategory) {
            categoryData[category].subcategories[transaction.subcategory] =
              (categoryData[category].subcategories[transaction.subcategory] || 0) + effective;
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
      // Legacy: categorías ya pre-procesadas
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

  // ── Cálculo de monthlyTrendsData (gastos/ingresos/balance por mes del año) ──
  useEffect(() => {
    if (!userData?.finances) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sumVisible = (entries) =>
      entries
        .filter((t) => {
          if (t.date) {
            let txDate;
            if (typeof t.date === 'string' && t.date.includes('/')) {
              const [d, m, y] = t.date.split('/').map(Number);
              txDate = new Date(y, m - 1, d);
            } else {
              txDate = new Date(t.date);
            }
            if (!isNaN(txDate.getTime()) && txDate > today) return false;
          }
          return !t.hiddenFromList && !t.excludeFromTotal;
        })
        .reduce((sum, t) => sum + ((t.amount || 0) - (t.refundAmount || 0)), 0);

    const expenseData = Array(12).fill(0);
    const incomeData = Array(12).fill(0);

    if (userData.finances.expenses?.[selectedYear]?.months) {
      Object.keys(userData.finances.expenses[selectedYear].months).forEach((month) => {
        const i = parseInt(month, 10) - 1;
        const md = userData.finances.expenses[selectedYear].months[month];
        expenseData[i] = md.data && Array.isArray(md.data) ? sumVisible(md.data) : md.total || 0;
      });
    }

    if (userData.finances.incomes?.[selectedYear]?.months) {
      Object.keys(userData.finances.incomes[selectedYear].months).forEach((month) => {
        const i = parseInt(month, 10) - 1;
        const md = userData.finances.incomes[selectedYear].months[month];
        incomeData[i] = md.data && Array.isArray(md.data)
          ? sumVisible(md.data.filter((t) => !t.hiddenFromList))
          : md.total || 0;
      });
    }

    setMonthlyTrendsData({
      months: Array.from({ length: 12 }, (_, i) => getMonthName(i + 1).substring(0, 3)),
      expenses: expenseData,
      incomes: incomeData,
      balance: incomeData.map((income, i) => income - expenseData[i]),
    });
  }, [userData, selectedYear]);

  // Loading state
  if (!userData || !userData.finances || !userData.savings) {
    return (
      <Layout title="Finanzas">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Finanzas">
      <Box sx={{ minHeight: '100vh', pb: 12 }}>
        {/* 1. Header con toggle y navegador */}
        <FinancesHeader
          dataType={dataType}
          setDataType={setDataType}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
        />

        {/* 2. Resumen del mes */}
        <FinancesMonthSummary
          monthlyData={monthlyData}
          monthlyTrendsData={monthlyTrendsData}
          dataType={dataType}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          dollarRate={dollarRate}
          onSeeAllCategories={() => {
            // Scroll a la lista de transacciones — placeholder hasta tener una vista dedicada
            const el = document.getElementById('finances-transactions-anchor');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />

        {/* 3. Gráficos */}
        <FinancesCharts
          dataType={dataType}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          monthlyData={monthlyData}
          monthlyTrendsData={monthlyTrendsData}
        />

        {/* 4. Movimientos */}
        <Box id="finances-transactions-anchor">
          <FinancesTransactionsList
            userData={userData}
            dataType={dataType}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            dollarRate={dollarRate}
            onOpenRefund={handleOpenRefund}
          />
        </Box>

        {/* Dialog de devolución (sin cambios) */}
        <RefundDialog
          open={openRefundDialog}
          transaction={selectedTransaction}
          dollarRate={dollarRate}
          currentSavings={userData?.savings?.amountARS}
          onClose={() => {
            setOpenRefundDialog(false);
            setSelectedTransaction(null);
          }}
        />

        {/* SpeedDial flotante */}
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
            tooltipTitle="Nuevo gasto"
            onClick={() => navigate('/NuevoGasto')}
          />
          <SpeedDialAction
            key="nuevoIngreso"
            icon={<TrendingUpIcon />}
            tooltipTitle="Nuevo ingreso"
            onClick={() => navigate('/NuevoIngreso')}
          />
          <SpeedDialAction
            key="exchange"
            icon={<CurrencyExchangeIcon />}
            tooltipTitle="Exchange"
            onClick={() => navigate('/exchange')}
          />
        </SpeedDial>
      </Box>
    </Layout>
  );
};

export default Finances;
