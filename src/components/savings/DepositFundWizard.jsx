import React, { useState } from 'react';
import {
  Box, Typography, IconButton, TextField, Card, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useStore } from '../../store';
import { formatAmount, formatAmountStr, getDate } from '../../utils';
import { transferToFund } from '../../services/savings';
import WizardProgressDots from '../plants/WizardProgressDots';
import WizardFooter from '../plants/WizardFooter';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const TOTAL_STEPS = 3;
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

const DepositFundWizard = ({ fund, onClose, onSuccess }) => {
  const theme = useTheme();
  const { userData } = useStore();
  const [step, setStep] = useState(0);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customDate, setCustomDate] = useState(null);
  const [dateEditing, setDateEditing] = useState(false);

  const savingsARS = userData?.savings?.amountARS || 0;
  const parsedAmount = amountStr ? parseFloat(amountStr.replace(',', '.')) || 0 : 0;

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setAmountStr((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amountStr.includes(',')) return;
      if (!amountStr) { setAmountStr('0,'); return; }
      setAmountStr(amountStr + ','); return;
    }
    if (amountStr === '0' && key !== ',') { setAmountStr(key); return; }
    if (amountStr.includes(',')) { const d = amountStr.split(',')[1]; if (d.length >= 2) return; }
    setAmountStr(amountStr + key);
  };

  const handleSubmit = async () => {
    if (parsedAmount <= 0 || parsedAmount > savingsARS) return;
    setSubmitting(true);
    try {
      await transferToFund({
        fundId: fund.id,
        amount: parsedAmount,
        currentFundBalance: fund.balance || 0,
        currentSavings: savingsARS,
        transactionData: {
          type: 'deposit',
          amount: parsedAmount,
          description: description.trim() || `Depósito a ${fund.name}`,
          date: customDate || getDate(),
          timestamp: Date.now(),
          newTotal: (fund.balance || 0) + parsedAmount,
        },
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Agregar a {fund.name}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={TOTAL_STEPS} current={step} />

      {/* Step 0: Amount */}
      {step === 0 && (
        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
              MONTO A AGREGAR
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main, mt: 1 }}>
              {formatAmountStr(amountStr)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Disponible en ahorros: {formatAmount(savingsARS)}
            </Typography>
          </Box>
          </AnimatedItem>

          <AnimatedItem>
          <Box sx={{ px: 3, pb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {keypadKeys.map((key) => (
                <Box
                  key={key}
                  component="button"
                  onClick={() => handleKeyPress(key)}
                  sx={{
                    py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500,
                    border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                    borderRadius: 2,
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                    '&:active': { bgcolor: alpha(theme.palette.action.hover, 0.6) },
                  }}
                >
                  {key === 'backspace' ? <BackspaceIcon /> : key}
                </Box>
              ))}
            </Box>
          </Box>
          </AnimatedItem>

          <AnimatedItem>
          <Box sx={{ px: 3, pb: 3 }}>
            <WizardFooter label="Siguiente" disabled={parsedAmount <= 0 || parsedAmount > savingsARS} onClick={goNext} />
          </Box>
          </AnimatedItem>
        </AnimatedGroup>
      )}

      {/* Step 1: Description */}
      {step === 1 && (
        <AnimatedGroup sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatedItem sx={{ flex: 1, px: 3, pt: 2 }}>
            <TextField
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              autoFocus
              InputProps={{ sx: { borderRadius: 2 } }}
              inputProps={{ maxLength: 60 }}
            />
          </AnimatedItem>
          <AnimatedItem>
          <Box sx={{ px: 3, pb: 3 }}>
            <WizardFooter label="Siguiente" onClick={goNext} />
          </Box>
          </AnimatedItem>
        </AnimatedGroup>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatedGroup sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Datos */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: description.trim() ? `1px solid ${theme.palette.divider}` : 'none' }}>
                  <Typography variant="body2" color="text.secondary">Fecha</Typography>
                  {dateEditing ? (
                    <TextField type="date" size="small"
                      value={(() => {
                        const d = customDate || getDate();
                        const parts = d.split('/');
                        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                      })()}
                      onChange={(e) => {
                        if (e.target.value) {
                          const parts = e.target.value.split('-');
                          setCustomDate(`${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`);
                        }
                        setDateEditing(false);
                      }}
                      onBlur={() => setDateEditing(false)}
                      autoFocus
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  ) : (
                    <Box onClick={() => setDateEditing(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customDate || (() => { const n = new Date(); return `Hoy, ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; })()}
                      </Typography>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Box>
                  )}
                </Box>
                {description.trim() && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">Descripción</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{description}</Typography>
                  </Box>
                )}
              </Box>
            </Card></AnimatedItem>

            {/* Fondo */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(theme.palette.success.main, 0.04) }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">{fund.name}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{formatAmount(fund.balance || 0)}</Typography>
                <Box sx={{ display: 'inline-block', bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                    + {formatAmount(parsedAmount)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.success.main, 0.1)}`, mx: 2.5 }} />
              <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Nuevo saldo</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', mt: 0.25 }}>
                  {formatAmount((fund.balance || 0) + parsedAmount)}
                </Typography>
              </Box>
            </Card></AnimatedItem>

            {/* Ahorros */}
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(theme.palette.error.main, 0.04) }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{formatAmount(savingsARS)}</Typography>
                <Box sx={{ display: 'inline-block', bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                    − {formatAmount(parsedAmount)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.error.main, 0.1)}`, mx: 2.5 }} />
              <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Nuevos ahorros</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mt: 0.25 }}>
                  {formatAmount(savingsARS - parsedAmount)}
                </Typography>
              </Box>
            </Card></AnimatedItem>
          </AnimatedGroup>

          <WizardFooter label="Confirmar depósito" loading={submitting} onClick={handleSubmit} color={theme.palette.success.main} />
        </Box>
      )}
    </Box>
  );
};

export default DepositFundWizard;
