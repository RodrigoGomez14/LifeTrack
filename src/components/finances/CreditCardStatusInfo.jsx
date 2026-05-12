import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Stack,
  Avatar,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { formatAmount } from '../../utils';

// Devuelve el chip apropiado para la fecha de vencimiento.
function getDueDateChip(dueDate) {
  const today = new Date();
  const dueDateObj = new Date(dueDate);
  const isOverdue = today > dueDateObj;
  const daysUntilDue = (dueDateObj - today) / (1000 * 60 * 60 * 24);
  const isNearDue = !isOverdue && daysUntilDue <= 7;

  if (isOverdue) {
    return <Chip label="Vencida" size="small" color="error" variant="filled" icon={<WarningIcon />} />;
  }
  if (isNearDue) {
    return <Chip label="Próximo a vencer" size="small" color="warning" variant="outlined" icon={<AccessTimeIcon />} />;
  }
  return <Chip label="En plazo" size="small" color="success" variant="outlined" icon={<CheckCircleOutlineIcon />} />;
}

const CreditCardStatusInfo = ({ closingDate, dueDate, cardTotal, isPaid }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const periodActive = closingDate && new Date() <= new Date(closingDate);

  // Estado del chip del total
  const totalChip = (() => {
    if (cardTotal <= 0) {
      return { label: 'Sin gastos', color: 'default', variant: 'outlined', icon: <InfoIcon /> };
    }
    if (isPaid) {
      return { label: 'Pagado', color: 'success', variant: 'filled', icon: <CheckCircleIcon /> };
    }
    return { label: 'Pendiente', color: 'warning', variant: 'outlined', icon: <ScheduleIcon /> };
  })();

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
          background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
            <InfoIcon />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" color="white">
              Estado de la Tarjeta
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Información de fechas y montos
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Fecha de cierre */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 40, height: 40 }}>
                    <CalendarTodayIcon color="primary" fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="primary">
                      Fecha de Cierre
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fin del período
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {closingDate ? dayjs(closingDate).locale('es').format('DD [de] MMMM') : 'No configurado'}
                </Typography>

                {closingDate && (
                  <Chip
                    label={periodActive ? 'Período activo' : 'Período cerrado'}
                    size="small"
                    color={periodActive ? 'success' : 'default'}
                    variant="outlined"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Fecha de vencimiento */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 40, height: 40 }}>
                    <PaymentIcon color="error" fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="error">
                      Fecha de Vencimiento
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Límite de pago
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {dueDate ? dayjs(dueDate).locale('es').format('DD [de] MMMM') : 'No configurado'}
                </Typography>

                {dueDate && !isPaid && getDueDateChip(dueDate)}
              </CardContent>
            </Card>
          </Grid>

          {/* Total del período */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={1}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), width: 40, height: 40 }}>
                    <AccountBalanceIcon color="warning" fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600" color="warning.main">
                      Total del Período
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Monto a pagar
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {formatAmount(cardTotal)}
                </Typography>

                <Chip
                  label={totalChip.label}
                  size="small"
                  color={totalChip.color}
                  variant={totalChip.variant}
                  icon={totalChip.icon}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreditCardStatusInfo;
