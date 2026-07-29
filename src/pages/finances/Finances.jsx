import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  CircularProgress,
} from '@mui/material';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import MonthNav from '../../components/shared/MonthNav';
import FinancesMonthSummary from '../../components/finances/FinancesMonthSummary';
import FinancesTransactionsList from '../../components/finances/FinancesTransactionsList';

const calcMonthlyData = (financesNode, dataType, year, month, dollarRateVenta) => {
  const monthData = financesNode?.[dataType]?.[year]?.months?.[month];
  if (!monthData) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const categoryData = {};
  if (monthData.data && Array.isArray(monthData.data)) {
    monthData.data.forEach((tx) => {
      const c = tx.category || 'Sin categoria';
      if (!categoryData[c]) categoryData[c] = { total: 0, percentage: 0, subcategories: {} };
      let isFuture = false;
      if (tx.date) {
        let txDate;
        if (typeof tx.date === 'string' && tx.date.includes('/')) { const [d, m, y] = tx.date.split('/').map(Number); txDate = new Date(y, m - 1, d); }
        else { txDate = new Date(tx.date); }
        if (!isNaN(txDate.getTime()) && txDate > today) isFuture = true;
      }
      if (!tx.hiddenFromList && !isFuture && !tx.excludeFromTotal) {
        const eff = (tx.amount || 0) - (tx.refundAmount || 0);
        categoryData[c].total += eff;
        if (tx.subcategory) categoryData[c].subcategories[tx.subcategory] = (categoryData[c].subcategories[tx.subcategory] || 0) + eff;
      }
    });
    const total = Object.values(categoryData).reduce((s, c) => s + c.total, 0);
    Object.keys(categoryData).forEach((c) => { categoryData[c].percentage = total > 0 ? (categoryData[c].total / total) * 100 : 0; });
    return { ...monthData, formattedTotal: formatAmount(total), formattedTotalUSD: formatAmount(total / (dollarRateVenta || 1)), categoryData, sortedCategories: Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total) };
  }
  if (monthData.categories) {
    const total = monthData.total || 0;
    Object.entries(monthData.categories).forEach(([c, d]) => { categoryData[c] = { total: d.total, percentage: total > 0 ? (d.total / total) * 100 : 0, subcategories: { ...d.subcategories } }; });
    return { ...monthData, formattedTotal: formatAmount(total), formattedTotalUSD: formatAmount(total / (dollarRateVenta || 1)), categoryData, sortedCategories: Object.entries(categoryData).sort((a, b) => b[1].total - a[1].total) };
  }
  return null;
};

const Panel = ({ monthlyData, monthlyTrendsData, userData, dataType, selectedYear, selectedMonth, dollarRate }) => (
  <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%' }}>
    <AnimatedGroup>
      <AnimatedItem>
        <FinancesMonthSummary monthlyData={monthlyData} monthlyTrendsData={monthlyTrendsData} dataType={dataType} selectedYear={selectedYear} selectedMonth={selectedMonth} dollarRate={dollarRate} userData={userData} />
      </AnimatedItem>
      <AnimatedItem>
        <Box id="finances-transactions-anchor">
          <FinancesTransactionsList userData={userData} dataType={dataType} selectedYear={selectedYear} selectedMonth={selectedMonth} dollarRate={dollarRate} />
        </Box>
      </AnimatedItem>
    </AnimatedGroup>
  </Box>
);

export const FinancesPage = ({ dataType, title }) => {
  const { userData, dollarRate } = useStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  const [monthlyTrendsData, setMonthlyTrendsData] = useState({ months: [], expenses: [], incomes: [], balance: [] });
  useEffect(() => {
    if (!userData?.finances) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sumV = (entries) => entries
      .filter((t) => {
        if (t.date) { let txD; if (typeof t.date === 'string' && t.date.includes('/')) { const [d, m, y] = t.date.split('/').map(Number); txD = new Date(y, m - 1, d); } else txD = new Date(t.date); if (!isNaN(txD.getTime()) && txD > today) return false; }
        return !t.hiddenFromList && !t.excludeFromTotal;
      })
      .reduce((s, t) => s + ((t.amount || 0) - (t.refundAmount || 0)), 0);
    const exp = Array(12).fill(0), inc = Array(12).fill(0);
    if (userData.finances.expenses?.[selectedYear]?.months) Object.keys(userData.finances.expenses[selectedYear].months).forEach((m) => { const md = userData.finances.expenses[selectedYear].months[m]; exp[parseInt(m, 10) - 1] = md.data && Array.isArray(md.data) ? sumV(md.data) : md.total || 0; });
    if (userData.finances.incomes?.[selectedYear]?.months) Object.keys(userData.finances.incomes[selectedYear].months).forEach((m) => { const md = userData.finances.incomes[selectedYear].months[m]; inc[parseInt(m, 10) - 1] = md.data && Array.isArray(md.data) ? sumV(md.data.filter((t) => !t.hiddenFromList)) : md.total || 0; });
    setMonthlyTrendsData({ months: Array.from({ length: 12 }, (_, i) => getMonthName(i + 1).substring(0, 3)), expenses: exp, incomes: inc, balance: inc.map((v, i) => v - exp[i]) });
  }, [userData, selectedYear]);

  const cur = useMemo(() => userData ? calcMonthlyData(userData.finances, dataType, selectedYear, selectedMonth, dollarRate?.venta) : null, [userData, dataType, selectedYear, selectedMonth, dollarRate]);
  const pM = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const pY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const nM = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const nY = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const prevMD = useMemo(() => userData ? calcMonthlyData(userData.finances, dataType, pY, pM, dollarRate?.venta) : null, [userData, dataType, pY, pM, dollarRate]);
  const nextMD = useMemo(() => userData ? calcMonthlyData(userData.finances, dataType, nY, nM, dollarRate?.venta) : null, [userData, dataType, nY, nM, dollarRate]);

  if (!userData || !userData.finances || !userData.savings) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
  }

  const today = new Date();
  const nxtM = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const nxtY = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const dNext = nxtY > today.getFullYear() || (nxtY === today.getFullYear() && nxtM > today.getMonth() + 1);

  const handleMonthChange = (m) => {
    if (animatingRef.current) { setSelectedMonth(m); return; }
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
    if (dNext) return;
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isDragging.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      isDragging.current = true;
    }
    if (isDragging.current) panX.set(-panelW + dx);
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = panX.get() + panelW;
    const threshold = panelW * 0.3;
    if (offset < -threshold) {
      animatingRef.current = true;
      const target = -panelW * 2;
      animate(panX, target, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
        animatingRef.current = false;
        panX.jump(-panelW);
        doNext();
      });
    } else if (offset > threshold) {
      animatingRef.current = true;
      const target = 0;
      animate(panX, target, { type: 'spring', stiffness: 200, damping: 28 }).then(() => {
        animatingRef.current = false;
        panX.jump(-panelW);
        doPrev();
      });
    } else {
      animate(panX, -panelW, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 12 }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <MonthNav year={selectedYear} month={selectedMonth} onYearChange={handleYearChange} onMonthChange={handleMonthChange} disabledNext={dNext} />

      <Box sx={{ overflow: 'hidden' }}>
        <motion.div style={{ display: 'flex', x: panX, width: panelW * 3 }}>
          <Box sx={{ minWidth: panelW }}>
            <Panel monthlyData={prevMD} monthlyTrendsData={monthlyTrendsData} userData={userData} dataType={dataType} selectedYear={pY} selectedMonth={pM} dollarRate={dollarRate} />
          </Box>
          <Box sx={{ minWidth: panelW }}>
            <Panel monthlyData={cur} monthlyTrendsData={monthlyTrendsData} userData={userData} dataType={dataType} selectedYear={selectedYear} selectedMonth={selectedMonth} dollarRate={dollarRate} />
          </Box>
          <Box sx={{ minWidth: panelW }}>
            <Panel monthlyData={nextMD} monthlyTrendsData={monthlyTrendsData} userData={userData} dataType={dataType} selectedYear={nY} selectedMonth={nM} dollarRate={dollarRate} />
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};
