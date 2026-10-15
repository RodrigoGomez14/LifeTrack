import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Layout from '../../components/layout/Layout';
import TarjetasUploadWizard from '../../components/finances/TarjetasUploadWizard';
import { useStore } from '../../store';
import { getMonthName } from '../../utils';
import {
  defaultClosingDateString,
  defaultDueDateString,
} from '../../components/finances/creditCardsHelpers';

const SubirResumenTC = () => {
  const navigate = useNavigate();
  const { cardId } = useParams();
  const [searchParams] = useSearchParams();
  const { userData } = useStore();

  const now = new Date();
  const mes = parseInt(searchParams.get('mes') || '', 10) || now.getMonth() + 1;
  const anio = parseInt(searchParams.get('anio') || '', 10) || now.getFullYear();
  const yearMonth = `${anio}-${String(mes).padStart(2, '0')}`;

  // Período siguiente: el resumen que se sube para `mes` trae las fechas del período
  // que cierra el mes siguiente.
  const nextMonth = mes === 12 ? 1 : mes + 1;
  const nextYear = mes === 12 ? anio + 1 : anio;
  const nextMonthKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;

  const card = cardId ? userData?.creditCards?.[cardId] : null;
  const configuredNext = card?.dates?.[nextMonthKey];
  const nextDatesLocked = !!(configuredNext?.closingDate && configuredNext?.dueDate);
  const prefillClosingDate =
    configuredNext?.closingDate || (card ? defaultClosingDateString(card, nextYear, nextMonth) : '');
  const prefillDueDate =
    configuredNext?.dueDate || (card ? defaultDueDateString(card, nextYear, nextMonth) : '');
  const nextPeriodLabel = `${getMonthName(nextMonth)} ${nextYear}`;

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const backUrl = `/tarjeta?id=${cardId}&mes=${mes}&anio=${anio}`;
  const handleClose = () => navigate(backUrl);
  const handleSuccess = (msg) => {
    showAlert(msg, 'success');
    setTimeout(() => navigate(backUrl), 800);
  };

  return (
    <Layout title="Subir resumen" showBack onBack={handleClose}>
      <TarjetasUploadWizard
        cardId={cardId}
        yearMonth={yearMonth}
        selectedMonth={mes}
        selectedYear={anio}
        nextMonthKey={nextMonthKey}
        nextPeriodLabel={nextPeriodLabel}
        prefillClosingDate={prefillClosingDate}
        prefillDueDate={prefillDueDate}
        nextDatesLocked={nextDatesLocked}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}
          variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default SubirResumenTC;
