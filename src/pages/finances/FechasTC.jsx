import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { setCardDatesForMonth } from '../../services/finances';
import {
  defaultClosingDateString,
  defaultDueDateString,
} from '../../components/finances/creditCardsHelpers';
import TarjetasDatesWizard from '../../components/finances/TarjetasDatesWizard';

const FechasTC = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [searchParams] = useSearchParams();
  const { userData } = useStore();

  const mes = parseInt(searchParams.get('mes') || '') || new Date().getMonth() + 1;
  const anio = parseInt(searchParams.get('anio') || '') || new Date().getFullYear();
  const monthKey = `${anio}-${String(mes).padStart(2, '0')}`;

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const card = useMemo(() => {
    if (!cardId || !userData?.creditCards?.[cardId]) return null;
    const c = userData.creditCards[cardId];
    if (c.name === undefined) return null;
    return { id: cardId, ...c };
  }, [userData, cardId]);

  const initialClosingDate = useMemo(() => {
    if (!card) return '';
    const configured = card.dates?.[monthKey];
    return configured?.closingDate || defaultClosingDateString(card, anio, mes);
  }, [card, monthKey, anio, mes]);

  const initialDueDate = useMemo(() => {
    if (!card) return '';
    const configured = card.dates?.[monthKey];
    return configured?.dueDate || defaultDueDateString(card, anio, mes);
  }, [card, monthKey, anio, mes]);

  const handleSave = async ({ closingDate, dueDate }) => {
    try {
      await setCardDatesForMonth(cardId, monthKey, { closingDate, dueDate });
      showAlert('Fechas actualizadas', 'success');
      setTimeout(() => navigate(`/tarjeta?id=${cardId}`), 600);
    } catch {
      showAlert('Error al guardar las fechas', 'error');
    }
  };

  if (!card) {
    return (
      <Layout title="Fechas" showBack onBack={() => navigate('/tarjetas')}>
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity="error"
            variant="filled" sx={{ width: '100%', borderRadius: 2 }}>Tarjeta no encontrada</Alert>
        </Snackbar>
      </Layout>
    );
  }

  return (
    <Layout title="Configurar fechas" showBack onBack={() => navigate(`/tarjeta?id=${cardId}`)}>
      <TarjetasDatesWizard
        initialClosingDate={initialClosingDate}
        initialDueDate={initialDueDate}
        onSave={handleSave}
        onClose={() => navigate(`/tarjeta?id=${cardId}`)}
      />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}
          variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default FechasTC;
