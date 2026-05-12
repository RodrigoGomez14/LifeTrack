import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  Stack,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  OutlinedInput,
  Paper,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import UndoIcon from '@mui/icons-material/Undo';
import { useNavigate } from 'react-router-dom';
import { formatAmount, getMonthName } from '../../utils';
import { getCategoryIcon, getCategoryColor } from './financesHelpers';

// Parsea una fecha en varios formatos posibles. Devuelve `new Date(0)` si falla.
function parseFechaFlexible(dateStr) {
  if (!dateStr || dateStr === 'Invalid Date') return new Date(0);

  const cleanDateStr = dateStr.trim();

  try {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDateStr)) {
      const [day, month, year] = cleanDateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(cleanDateStr)) {
      const datePart = cleanDateStr.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) {
      const [year, month, day] = cleanDateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDateStr)) {
      const [day, month, year] = cleanDateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const timestamp = Date.parse(cleanDateStr);
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    return new Date(0);
  } catch (error) {
    console.error('Error al parsear fecha:', cleanDateStr, error);
    return new Date(0);
  }
}

// Devuelve "Lunes 14 de enero de 2025" a partir de una fecha en formato variable.
function obtenerFechaFormateada(dateStr) {
  if (!dateStr || dateStr === 'Invalid Date') return '(Sin fecha)';

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return `${diasSemana[date.getDay()]} ${day} de ${meses[month - 1]} de ${year}`;
    }

    const parsedDate = parseFechaFlexible(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      const day = parsedDate.getDate();
      const month = parsedDate.getMonth();
      const year = parsedDate.getFullYear();
      const dayOfWeek = parsedDate.getDay();
      return `${diasSemana[dayOfWeek]} ${day} de ${meses[month]} de ${year}`;
    }
    return dateStr;
  } catch (e) {
    console.error('Error al formatear fecha:', dateStr, e);
    return dateStr;
  }
}

const MonthlyTransactionsList = ({
  userData,
  dataType,
  selectedYear,
  selectedMonth,
  dollarRate,
  onOpenRefund,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  const handleToggleDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  // Recupera todas las transacciones del mes (incluye ocultas y de tarjeta).
  // Marca como ocultas las fechas futuras para no contarlas en totales.
  const getAllTransactions = () => {
    const allTransactions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const monthData = userData?.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
      if (!monthData) return [];

      if (monthData.data && Array.isArray(monthData.data)) {
        const rawData = userData.finances[dataType][selectedYear].months[selectedMonth].data;

        rawData.forEach((transaction) => {
          if (transaction.paymentMethod === 'creditCard' && transaction.creditCardTransaction !== true) {
            transaction.creditCardTransaction = true;
          }

          let transactionDate;
          if (transaction.date) {
            if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
              const [day, month, year] = transaction.date.split('/').map(Number);
              transactionDate = new Date(year, month - 1, day);
            } else {
              transactionDate = new Date(transaction.date);
            }
            if (isNaN(transactionDate.getTime())) {
              transactionDate = today;
            }
          } else {
            transactionDate = today;
          }

          if (transactionDate <= today || transaction.hiddenFromList) {
            allTransactions.push({ ...transaction });
          } else {
            allTransactions.push({ ...transaction, hiddenFromList: true, isFutureTransaction: true });
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }

    return allTransactions;
  };

  const allTransactions = getAllTransactions();

  // Inicializar fechas expandidas (cerradas por defecto) cuando cambia el período
  useEffect(() => {
    if (allTransactions.length > 0) {
      const dateGroups = {};
      allTransactions.forEach((transaction) => {
        const dateStr = transaction.date || 'Invalid Date';
        dateGroups[dateStr] = false;
      });
      setExpandedDates(dateGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, dataType]);

  // Estado vacío
  if (!allTransactions || allTransactions.length === 0) {
    return (
      <Card elevation={1} sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6">
            Detalles de {dataType === 'expenses' ? 'Gastos' : 'Ingresos'}
          </Typography>
        </Box>
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}>
          <Stack
            spacing={2}
            alignItems="center"
            sx={{ maxWidth: 400, textAlign: 'center', p: 3, borderRadius: 2 }}
          >
            {dataType === 'expenses'
              ? <TrendingDownIcon sx={{ fontSize: 48, color: theme.palette.error.light }} />
              : <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.success.light }} />
            }
            <Typography variant="h6" color="textSecondary">
              No hay datos disponibles
            </Typography>
            <Typography variant="body2" color="textSecondary">
              No se encontraron {dataType === 'expenses' ? 'gastos' : 'ingresos'} para {getMonthName(selectedMonth)} de {selectedYear}.
            </Typography>
            <Button
              variant="contained"
              startIcon={dataType === 'expenses' ? <TrendingDownIcon /> : <TrendingUpIcon />}
              color={dataType === 'expenses' ? 'error' : 'success'}
              onClick={() => navigate(dataType === 'expenses' ? '/NuevoGasto' : '/NuevoIngreso')}
            >
              Añadir {dataType === 'expenses' ? 'Gasto' : 'Ingreso'}
            </Button>
          </Stack>
        </Box>
      </Card>
    );
  }

  // Filtrar por search + descartar futuras + descartar ocultas (excepto tarjetas ocultas)
  const getFilteredTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allTransactions.filter((transaction) => {
      const isCreditCard = transaction.paymentMethod === 'creditCard' ||
                            transaction.creditCardTransaction === true ||
                            transaction.excludeFromTotal === true;

      if (transaction.isFutureTransaction) return false;
      if (transaction.hiddenFromList && !isCreditCard) return false;

      if (transaction.date) {
        let transactionDate;
        if (typeof transaction.date === 'string' && transaction.date.includes('/')) {
          const [day, month, year] = transaction.date.split('/').map(Number);
          transactionDate = new Date(year, month - 1, day);
        } else {
          transactionDate = new Date(transaction.date);
        }
        if (!isNaN(transactionDate.getTime()) && transactionDate > today) return false;
      }

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower);
        const categoryMatch = transaction.category?.toLowerCase().includes(searchLower);
        const subcategoryMatch = transaction.subcategory?.toLowerCase().includes(searchLower);
        const amountMatch = transaction.amount?.toString().includes(searchLower);
        const paymentMethodMatch =
          (transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction || transaction.excludeFromTotal)
            ? 'tarjeta'.includes(searchLower)
            : 'efectivo'.includes(searchLower);

        if (!(descriptionMatch || categoryMatch || subcategoryMatch || amountMatch || paymentMethodMatch)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Agrupar transacciones por fecha (clave canónica YYYY-MM-DD cuando se puede parsear)
  const transactionsByDate = filteredTransactions.reduce((groups, transaction) => {
    let dateKey;
    if (!transaction.date) {
      dateKey = 'Invalid Date';
    } else {
      try {
        const date = parseFechaFlexible(transaction.date);
        dateKey = isNaN(date.getTime()) ? transaction.date : date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error al procesar fecha de transacción:', transaction.date, error);
        dateKey = transaction.date;
      }
    }

    if (!groups[dateKey]) {
      groups[dateKey] = {
        transactions: [],
        total: 0,
        visibleTotal: 0,
        hiddenTotal: 0,
        cashTotal: 0,
        date: dateKey
      };
    }

    const originalAmount = transaction.amount || 0;
    const refundAmount = transaction.refundAmount || 0;
    const effectiveAmount = originalAmount - refundAmount;
    const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;

    groups[dateKey].transactions.push(transaction);
    groups[dateKey].total += effectiveAmount;
    if (!isCreditCard) groups[dateKey].cashTotal += effectiveAmount;
    if (transaction.hiddenFromList) {
      groups[dateKey].hiddenTotal += effectiveAmount;
    } else {
      groups[dateKey].visibleTotal += effectiveAmount;
    }

    return groups;
  }, {});

  // Ordenar fechas de más reciente a más antigua
  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
    if (a === 'Invalid Date') return 1;
    if (b === 'Invalid Date') return -1;
    return parseFechaFlexible(b) - parseFechaFlexible(a);
  });

  // Visual del método de pago (tarjeta vs efectivo)
  const getPaymentMethodInfo = (transaction) => {
    const isCreditCard = transaction.paymentMethod === 'creditCard' || transaction.creditCardTransaction === true;
    if (isCreditCard) {
      return {
        icon: <CreditCardIcon />,
        label: 'Tarjeta de crédito',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        borderColor: alpha(theme.palette.info.light, 0.5)
      };
    }
    return {
      icon: <PaymentsIcon />,
      label: 'Efectivo',
      color: theme.palette.success.dark,
      bgColor: alpha(theme.palette.success.main, 0.1),
      borderColor: alpha(theme.palette.success.light, 0.5)
    };
  };

  // Sub-componente: una fila por transacción
  const TransactionItem = ({ transaction }) => {
    const paymentInfo = getPaymentMethodInfo(transaction);
    const isExcludedFromTotal = transaction.excludeFromTotal;
    const originalAmount = transaction.amount || 0;
    const refundAmount = transaction.refundAmount || 0;
    const effectiveAmount = originalAmount - refundAmount;
    const hasRefund = transaction.hasRefund || false;

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 1,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          ...(isExcludedFromTotal && {
            borderStyle: 'dashed',
            borderColor: theme.palette.info.light,
            bgcolor: alpha(theme.palette.info.main, 0.04)
          }),
          ...(hasRefund && {
            borderLeftWidth: 4,
            borderLeftColor: theme.palette.success.main,
            bgcolor: alpha(theme.palette.success.main, 0.02)
          })
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2} sm={1}>
            <Box
              sx={{
                bgcolor: getCategoryColor(transaction.category || 'default', theme, dataType),
                color: 'white',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {getCategoryIcon(transaction.category || 'default')}
              {hasRefund && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    bgcolor: theme.palette.success.main,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${theme.palette.background.paper}`
                  }}
                >
                  <UndoIcon sx={{ fontSize: 10, color: 'white' }} />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={dataType === 'expenses' ? 6 : 7} sm={dataType === 'expenses' ? 7 : 8}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {transaction.description}
              {isExcludedFromTotal && (
                <Chip
                  label="Tarjeta"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    borderRadius: 1
                  }}
                />
              )}
              {hasRefund && (
                <Chip
                  label={`Devolución: ${formatAmount(refundAmount)}`}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    borderRadius: 1
                  }}
                />
              )}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                label={transaction.category}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  bgcolor: alpha(getCategoryColor(transaction.category || 'default', theme, dataType), 0.1),
                  color: getCategoryColor(transaction.category || 'default', theme, dataType)
                }}
              />
              {transaction.subcategory && (
                <Chip
                  label={transaction.subcategory}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(getCategoryColor(transaction.category || 'default', theme, dataType), 0.2)}`,
                    color: 'text.secondary'
                  }}
                />
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: 1,
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                  bgcolor: paymentInfo.bgColor,
                  border: `1px solid ${paymentInfo.borderColor}`
                }}
              >
                <Box component="span" sx={{ color: paymentInfo.color, display: 'flex', mr: 0.5, fontSize: 14 }}>
                  {paymentInfo.icon}
                </Box>
                <Typography variant="caption" sx={{ color: paymentInfo.color, fontWeight: 'medium' }}>
                  {paymentInfo.label}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={1} sm={1} sx={{ textAlign: 'right' }}>
            {dataType === 'expenses' && !hasRefund && (
              <Tooltip title="Procesar devolución" arrow>
                <IconButton
                  size="small"
                  onClick={() => onOpenRefund(transaction)}
                  sx={{
                    color: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <UndoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Grid>

          <Grid item xs={3} sm={3} sx={{ textAlign: 'right' }}>
            {hasRefund ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: 'line-through',
                    color: 'text.secondary',
                    fontSize: '0.9rem'
                  }}
                >
                  ${formatAmount(originalAmount)}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={effectiveAmount < 0 ? 'success.main' : 'error.main'}
                >
                  {formatAmount(effectiveAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  USD {formatAmount(effectiveAmount / (transaction.valorUSD || dollarRate?.venta || 1))}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={originalAmount < 0 ? 'success.main' : 'error.main'}
                >
                  ${formatAmount(originalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  USD {formatAmount(transaction.amountUSD || (originalAmount / (transaction.valorUSD || dollarRate?.venta || 1)))}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Sub-componente: cabecera + transacciones de un día
  const DateGroupCard = ({ dateData, date }) => {
    const formattedDate = obtenerFechaFormateada(date);
    const isExpanded = expandedDates[date] === true;

    const cashTotal = dateData.transactions
      .filter((t) => !t.excludeFromTotal)
      .reduce((sum, t) => sum + ((t.amount || 0) - (t.refundAmount || 0)), 0);

    return (
      <Card
        elevation={5}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'transform 0.2s',
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.08)}`
          }
        }}
      >
        <Box
          onClick={() => handleToggleDate(date)}
          sx={{
            p: 2,
            borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
              }}
            >
              <CalendarTodayIcon />
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight="medium">
                {formattedDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dateData.transactions.length} {dateData.transactions.length === 1 ? 'transacción' : 'transacciones'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Stack alignItems="flex-end">
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color={dataType === 'expenses' ? theme.palette.error.main : theme.palette.success.main}
              >
                ${formatAmount(cashTotal)}
              </Typography>
            </Stack>

            <IconButton
              size="small"
              edge="end"
              sx={{
                transition: 'transform 0.2s',
                transform: isExpanded ? 'rotate(180deg)' : 'none'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        {isExpanded && (
          <Box sx={{ p: 2 }}>
            {dateData.transactions.map((transaction, idx) => (
              <TransactionItem key={idx} transaction={transaction} />
            ))}
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Card
      elevation={1}
      sx={{
        height: '625px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Panel de búsqueda */}
      <Box sx={{
        p: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.8),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <FormControl variant="outlined" size="small" fullWidth>
              <OutlinedInput
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por descripción, categoría, subcategoría, monto o método de pago..."
                startAdornment={<FilterListIcon color="action" sx={{ mr: 1 }} />}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    boxShadow: `0 0 5px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              />
              {searchText && (
                <Typography variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                  Mostrando {filteredTransactions.length} resultados para "{searchText}"
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Lista de transacciones agrupadas por fecha */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {sortedDates.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              bgcolor: theme.palette.background.paper,
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <FilterListIcon color="disabled" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No hay resultados
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Prueba a cambiar tu búsqueda para ver más transacciones
            </Typography>
          </Paper>
        ) : (
          sortedDates.map((date) => (
            <DateGroupCard
              key={date}
              date={date}
              dateData={transactionsByDate[date]}
            />
          ))
        )}
      </Box>
    </Card>
  );
};

export default MonthlyTransactionsList;
