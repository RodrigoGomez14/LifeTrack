import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Card,
  TextField,
  Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import UndoIcon from '@mui/icons-material/Undo';
import CloseIcon from '@mui/icons-material/Close';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { read, bulkUpdate, generateKey } from '../../services/database';
import { formatAmount, getDate } from '../../utils';

const RefundDialog = ({ open, transaction, dollarRate, currentSavings, onClose }) => {
  const theme = useTheme();
  const [refundForm, setRefundForm] = useState({ amount: '', description: '' });

  // Resetea el form cuando se abre el dialog con una transacción nueva
  useEffect(() => {
    if (open && transaction) {
      setRefundForm({
        amount: '',
        description: `Devolución de ${transaction.description}`,
      });
    }
  }, [open, transaction]);

  const handleClose = () => {
    setRefundForm({ amount: '', description: '' });
    onClose();
  };

  const handleProcessRefund = async () => {
    if (!transaction || !refundForm.amount || parseFloat(refundForm.amount) <= 0) {
      return;
    }

    const refundAmount = parseFloat(refundForm.amount);
    const originalAmount = transaction.amount || 0;

    if (refundAmount > originalAmount) {
      alert('La devolución no puede ser mayor al gasto original');
      return;
    }

    try {
      const updates = {};

      // Encontrar la transacción en la base de datos para actualizarla
      const expenses = await read('expenses');
      let transactionKey = null;

      if (expenses) {
        for (const [key, expense] of Object.entries(expenses)) {
          if (expense.date === transaction.date &&
              expense.description === transaction.description &&
              expense.amount === transaction.amount &&
              expense.category === transaction.category) {
            transactionKey = key;
            break;
          }
        }
      }

      if (transactionKey) {
        updates[`expenses/${transactionKey}/refundAmount`] = refundAmount;
        updates[`expenses/${transactionKey}/refundDescription`] = refundForm.description;
        updates[`expenses/${transactionKey}/refundDate`] = getDate();
        updates[`expenses/${transactionKey}/hasRefund`] = true;
      }

      // Actualizar ahorros (aumentar por el monto devuelto)
      const safeSavings = currentSavings || 0;
      updates['savings/amountARS'] = safeSavings + refundAmount;

      // Registrar en historial de ahorros
      const newHistoryKey = generateKey('savings/amountARSHistory');
      updates[`savings/amountARSHistory/${newHistoryKey}`] = {
        date: getDate(),
        amount: refundAmount,
        newTotal: safeSavings + refundAmount,
        description: `Devolución: ${refundForm.description}`,
      };

      await bulkUpdate(updates);
      handleClose();
      alert('Devolución procesada exitosamente');
    } catch (error) {
      console.error('Error al procesar devolución:', error);
      alert('Error al procesar la devolución');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
          color: 'white',
          position: 'relative'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              width: 56,
              height: 56
            }}
          >
            <UndoIcon fontSize="large" />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
              Procesar Devolución
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {transaction?.description}
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Información del gasto original */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              borderRadius: 2
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.error.main, width: 40, height: 40 }}>
                <TrendingDownIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Gasto original
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatAmount(transaction?.amount || 0)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha
                </Typography>
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {transaction?.date}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Monto a devolver
              </Typography>
              <TextField
                value={refundForm.amount}
                onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                fullWidth
                type="number"
                placeholder="0"
                variant="outlined"
                size="large"
                inputProps={{
                  max: transaction?.amount || 0,
                  min: 0.01,
                  step: 0.01
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        $
                      </Typography>
                    </Box>
                  ),
                  sx: {
                    fontSize: '1.2rem',
                    fontWeight: 'medium',
                    '& input': {
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.08)
                    },
                    '&.Mui-focused': {
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      '& fieldset': {
                        borderColor: theme.palette.success.main,
                        borderWidth: 2
                      }
                    }
                  }
                }}
              />
              {refundForm.amount && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Equivalente: USD {formatAmount(parseFloat(refundForm.amount || 0) / (dollarRate?.venta || 1))}
                </Typography>
              )}
              {refundForm.amount && parseFloat(refundForm.amount) > (transaction?.amount || 0) && (
                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                  La devolución no puede ser mayor al gasto original
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Descripción
              </Typography>
              <TextField
                value={refundForm.description}
                onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
                fullWidth
                placeholder="Describe el motivo de la devolución"
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Opcional - Describe el motivo de esta devolución
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <Box
        sx={{
          p: 3,
          bgcolor: alpha(theme.palette.grey[100], 0.5),
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Button
          onClick={handleProcessRefund}
          variant="contained"
          disabled={
            !refundForm.amount ||
            parseFloat(refundForm.amount) <= 0 ||
            parseFloat(refundForm.amount) > (transaction?.amount || 0)
          }
          startIcon={<UndoIcon />}
          fullWidth
          size="large"
          sx={{
            borderRadius: 2,
            py: 1.5,
            bgcolor: theme.palette.success.main,
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1.1rem',
            boxShadow: theme.shadows[3],
            '&:hover': {
              bgcolor: theme.palette.success.dark,
              boxShadow: theme.shadows[6],
              transform: 'translateY(-1px)'
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.grey[300],
              color: theme.palette.grey[500]
            },
            transition: 'all 0.2s ease'
          }}
        >
          Procesar Devolución
        </Button>
      </Box>
    </Dialog>
  );
};

export default RefundDialog;
