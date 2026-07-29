import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Button, CircularProgress, Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import { isDateBeyondLimit, parseFlexibleDate } from './creditCardsHelpers';
import MonthCalendar from './MonthCalendar';
import WizardProgressDots from '../plants/WizardProgressDots';
import WizardFooter from '../plants/WizardFooter';

const TOTAL_STEPS = 3;

const TarjetasDatesWizard = ({
  initialClosingDate,
  initialDueDate,
  onSave,
  onClose,
}) => {
  const theme = useTheme();

  const [step, setStep] = useState(0);
  const [closingDate, setClosingDate] = useState(initialClosingDate || '');
  const [dueDate, setDueDate] = useState(initialDueDate || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const shouldDisableClosingDate = (date) => isDateBeyondLimit(date.toDate(), 3);

  const shouldDisableDueDate = (date) => {
    const js = date.toDate();
    if (!closingDate) return isDateBeyondLimit(js, 3);
    const closingObj = parseFlexibleDate(closingDate);
    if (js < closingObj) return true;
    const cYear = closingObj.getFullYear();
    const cMonth = closingObj.getMonth();
    const nextMonth = (cMonth + 1) % 12;
    const nextYear = cMonth === 11 ? cYear + 1 : cYear;
    const jYear = js.getFullYear();
    const jMonth = js.getMonth();
    if ((jYear === cYear && jMonth === cMonth) || (jYear === nextYear && jMonth === nextMonth)) return false;
    return isDateBeyondLimit(js, 3);
  };

  const handleSubmit = async () => {
    if (!closingDate) { setError('Seleccioná la fecha de cierre'); return; }
    if (!dueDate) { setError('Seleccioná la fecha de vencimiento'); return; }
    setError('');
    setSaving(true);
    try {
      await onSave({ closingDate, dueDate });
      onClose();
    } catch (e) {

      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const dateParts = (dateStr) => {
    if (!dateStr) return null;
    const d = dayjs(dateStr);
    return { day: d.date(), month: d.month(), year: d.year() };
  };

  const daysBetween = (a, b) => {
    if (!a || !b) return null;
    return dayjs(b).diff(dayjs(a), 'day');
  };

  const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const closing = dateParts(closingDate);
  const due = dateParts(dueDate);
  const gap = daysBetween(closingDate, dueDate);

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: theme.zIndex.modal + 1, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
        ) : (
          <Box sx={{ width: 36 }} />
        )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Configurar período</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={TOTAL_STEPS} current={step} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {step === 0 && (
          <Fade in={step === 0} key="s0">
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 1, gap: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                  FECHA DE CIERRE
                </Typography>
                <MonthCalendar
                      value={closingDate}
                      onChange={(iso) => { setClosingDate(iso); setError(''); }}
                      shouldDisableDate={shouldDisableClosingDate}
                    />
              </Box>
              <Box sx={{ px: 3, py: 2 }}>
                <Button fullWidth variant="contained" disabled={!closingDate} onClick={goNext}
                  sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                  Siguiente →
                </Button>
              </Box>
            </Box>
          </Fade>
        )}

        {step === 1 && (
          <Fade in={step === 1} key="s1">
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 1, gap: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                  FECHA DE VENCIMIENTO
                </Typography>
                <MonthCalendar
                      value={dueDate}
                      onChange={(iso) => { setDueDate(iso); setError(''); }}
                      shouldDisableDate={shouldDisableDueDate}
                    />
              </Box>
              <Box sx={{ px: 3, py: 2 }}>
                <Button fullWidth variant="contained" disabled={!dueDate} onClick={goNext}
                  sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                  Siguiente →
                </Button>
              </Box>
            </Box>
          </Fade>
        )}

        {step === 2 && (
          <Fade in={step === 2} key="s2">
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 3, gap: 2 }}>
                {/* Cierre card */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                    CIERRE
                  </Typography>
                </Box>
                <Box sx={{
                  width: '100%', maxWidth: 200, borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center', py: 2.5, px: 2,
                }}>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                    {closing?.day ?? '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
                    {closing ? `${MONTH_NAMES[closing.month]} ${closing.year}` : '-'}
                  </Typography>
                </Box>

                {/* Connector */}
                {gap != null && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                    <Box sx={{ width: 2, height: 16, bgcolor: theme.palette.divider }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {gap} día{gap !== 1 ? 's' : ''}
                    </Typography>
                    <Box sx={{ width: 2, height: 16, bgcolor: theme.palette.divider }} />
                  </Box>
                )}

                {/* Vencimiento card */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                    VENCE
                  </Typography>
                </Box>
                <Box sx={{
                  width: '100%', maxWidth: 200, borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center', py: 2.5, px: 2,
                }}>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
                    {due?.day ?? '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
                    {due ? `${MONTH_NAMES[due.month]} ${due.year}` : '-'}
                  </Typography>
                </Box>

                {error && (
                  <Typography variant="caption" color="error">{error}</Typography>
                )}
              </Box>
              <WizardFooter
                label="Guardar fechas"
                icon={saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CheckIcon />}
                loading={saving}
                disabled={saving}
                onClick={handleSubmit}
              />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default TarjetasDatesWizard;
