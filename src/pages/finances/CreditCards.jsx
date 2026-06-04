import React, { useState, useMemo } from 'react';
import { Container, Snackbar, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import {
  getCardClosingDates,
  filterAndSortBillingPeriodTransactions,
} from '../../components/finances/creditCardsHelpers';
import TarjetasListView from '../../components/finances/TarjetasListView';
import TarjetasAddEditSheet from '../../components/finances/TarjetasAddEditSheet';

const CreditCards = () => {
  const { userData } = useStore();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const cards = useMemo(() => {
    if (!userData?.creditCards) return [];
    return Object.keys(userData.creditCards)
      .filter((k) => k !== 'transactions')
      .map((id) => ({ id, ...userData.creditCards[id] }));
  }, [userData]);

  const allCardTransactions = useMemo(() => {
    if (!userData?.creditCards || cards.length === 0) return {};
    const all = {};
    cards.forEach((card) => {
      const cardTransactions = userData.creditCards.transactions?.[card.id];
      if (!cardTransactions) return;
      const cardData = userData.creditCards[card.id];
      const { prevClosingDate, currentClosingDate } = getCardClosingDates(cardData, selectedYear, selectedMonth);
      all[card.id] = filterAndSortBillingPeriodTransactions(cardTransactions, prevClosingDate, currentClosingDate);
    });
    return all;
  }, [userData, cards, selectedYear, selectedMonth]);

  const getCardTotal = (cardId) => {
    if (!allCardTransactions[cardId]) return 0;
    return allCardTransactions[cardId].reduce((sum, t) => sum + t.amount, 0);
  };

  const getAllCardsTotal = () => cards.reduce((sum, c) => sum + getCardTotal(c.id), 0);

  const isCardPaid = (cardId) => {
    if (!cardId) return false;
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return !!userData?.creditCards?.[cardId]?.payments?.[monthKey];
  };

  const areCardsActuallyPaid = () => {
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (userData?.creditCardPayments?.[monthKey]) return true;
    if (cards.length === 0) return true;
    const withBalance = cards.filter((c) => getCardTotal(c.id) > 0);
    if (withBalance.length === 0) return true;
    return withBalance.every((c) => isCardPaid(c.id));
  };

  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const openDetail = (cardId) => navigate(`/tarjeta?id=${cardId}`);
  const openPayment = (cardId) => navigate(`/tarjeta?id=${cardId}&pago=1`);
  const openAdd = () => { setEditingCard(null); setShowAddEdit(true); };

  return (
    <Layout title="Tarjetas">
      <Container maxWidth="sm" sx={{ py: 2, position: 'relative' }}>
        <TarjetasListView
          cards={cards}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          getCardTotal={getCardTotal}
          isCardPaid={isCardPaid}
          getAllCardsTotal={getAllCardsTotal}
          areCardsActuallyPaid={areCardsActuallyPaid}
          onCardClick={openDetail}
          onAddCard={openAdd}
          onSwipePay={openPayment}
          onOpenPayment={() => navigate(`/tarjeta?pago=1`)}
          cardTransactions={userData?.creditCards?.transactions}
        />

        {showAddEdit && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default' }}>
            <TarjetasAddEditSheet
              onBack={() => setShowAddEdit(false)}
              editCard={editingCard}
              onSuccess={(msg) => { showAlert(msg, 'success'); setShowAddEdit(false); }}
              onError={(msg) => showAlert(msg, 'error')}
            />
          </Box>
        )}
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default CreditCards;
