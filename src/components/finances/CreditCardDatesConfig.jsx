import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import SaveIcon from '@mui/icons-material/Save';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { isDateBeyondLimit } from './creditCardsHelpers';

const CreditCardDatesConfig = ({
  closingDate,
  dueDate,
  onClosingChange,
  onDueChange,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // El cierre acepta cualquier fecha hasta el límite de 1 mes futuro.
  const shouldDisableClosingDate = (date) => isDateBeyondLimit(date.toDate());

  // El vencimiento debe ser posterior al cierre y caer en el mismo mes o el siguiente.
  const shouldDisableDueDate = (date) => {
    const jsDate = date.toDate();
    if (!closingDate) return isDateBeyondLimit(jsDate);

    try {
      const closingDateObj = new Date(closingDate);
      if (jsDate < closingDateObj) return true;

      const closingYear = closingDateObj.getFullYear();
      const closingMonth = closingDateObj.getMonth();
      const nextMonth = (closingMonth + 1) % 12;
      const nextMonthYear = closingMonth === 11 ? closingYear + 1 : closingYear;
      const jsDateYear = jsDate.getFullYear();
      const jsDateMonth = jsDate.getMonth();

      const sameOrNextMonth =
        (jsDateYear === closingYear && jsDateMonth === closingMonth) ||
        (jsDateYear === nextMonthYear && jsDateMonth === nextMonth);
      if (sameOrNextMonth) return false;

      return isDateBeyondLimit(jsDate);
    } catch (error) {
      console.error('Error al procesar fecha de cierre:', error);
      return isDateBeyondLimit(jsDate);
    }
  };

  const handleClosingDateChange = (date) => {
    if (date) onClosingChange(date.format('YYYY-MM-DD'));
  };

  const handleDueDateChange = (date) => {
    if (date) onDueChange(date.format('YYYY-MM-DD'));
  };

  const handleSubmit = async () => {
    if (!closingDate || !dueDate) {
      setUpdateError(
        !closingDate
          ? 'Por favor selecciona una fecha de cierre válida'
          : 'Por favor selecciona una fecha de vencimiento válida'
      );
      return;
    }
    setSaving(true);
    setUpdateError('');
    try {
      await onSubmit({ closingDate, dueDate });
    } catch (error) {
      console.error('Error al actualizar las fechas:', error);
      setUpdateError('Error al actualizar las fechas. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-2px)' },
          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
            }}
          >
            <CalendarTodayIcon />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" color="white">
              Configuración de Fechas
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Configura las fechas de cierre y vencimiento
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {updateError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {updateError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Fecha de cierre */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <CalendarTodayIcon color="primary" fontSize="small" />
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Fecha de Cierre
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  La fecha de cierre es cuando finaliza el período de facturación.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    label="Seleccionar fecha de cierre"
                    value={closingDate ? dayjs(closingDate) : null}
                    onChange={handleClosingDateChange}
                    views={['year', 'month', 'day']}
                    format="DD/MM/YYYY"
                    shouldDisableDate={shouldDisableClosingDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !closingDate,
                        helperText: !closingDate ? 'Fecha requerida' : '',
                        sx: { mt: 1 },
                      },
                    }}
                  />
                </LocalizationProvider>

                {closingDate && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Fecha de vencimiento */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <PaymentIcon color="error" fontSize="small" />
                  <Typography variant="h6" color="error" fontWeight="bold">
                    Fecha de Vencimiento
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Es el día límite para realizar el pago sin intereses.
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    label="Seleccionar fecha de vencimiento"
                    value={dueDate ? dayjs(dueDate) : null}
                    onChange={handleDueDateChange}
                    views={['year', 'month', 'day']}
                    format="DD/MM/YYYY"
                    shouldDisableDate={shouldDisableDueDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !dueDate,
                        helperText: !dueDate ? 'Fecha requerida' : 'Debe ser posterior al cierre',
                        sx: { mt: 1 },
                      },
                    }}
                  />
                </LocalizationProvider>

                {dueDate && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      {dayjs(dueDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Alert severity="info" sx={{ flex: 1, mr: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  Solo puedes configurar fechas hasta un máximo de 1 mes en el futuro.
                </Typography>
              </Alert>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || !closingDate || !dueDate}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: 2, px: 4, py: 1.2, minWidth: 160 }}
              >
                {saving ? 'Guardando...' : 'Guardar Fechas'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreditCardDatesConfig;
