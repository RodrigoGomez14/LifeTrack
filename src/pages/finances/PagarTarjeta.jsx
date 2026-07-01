import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import TarjetasPaymentWizard from '../../components/finances/TarjetasPaymentWizard';

const PagarTarjeta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const params = new URLSearchParams(location.search);
  const cardId = params.get('tarjeta') || '';
  const selectedYear = parseInt(params.get('anio')) || new Date().getFullYear();
  const selectedMonth = parseInt(params.get('mes')) || new Date().getMonth() + 1;

  const cards = useMemo(() => {
    if (!userData?.creditCards) return [];
    const all = Object.keys(userData.creditCards)
      .filter((k) => k !== 'transactions')
      .map((id) => ({ id, ...userData.creditCards[id] }));
    if (cardId) return all.filter((c) => c.id === cardId);
    return all;
  }, [userData, cardId]);

  return (
    <TarjetasPaymentWizard
      cards={cards}
      cardId={cardId}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onClose={() => navigate('/tarjetas')}
    />
  );
};

export default PagarTarjeta;
