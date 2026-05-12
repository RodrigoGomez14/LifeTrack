import React from 'react';
import {
  Grid,
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CommuteIcon from '@mui/icons-material/Commute';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkIcon from '@mui/icons-material/Work';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SavingsIcon from '@mui/icons-material/Savings';
import CategoryIcon from '@mui/icons-material/Category';
import { formatAmount } from '../../utils';

// Mapping de íconos de categorías de gastos. Match parcial case-insensitive.
const getExpenseCategoryIcon = (categoryName, color) => {
  const categoryMapping = {
    'Supermercado': <ShoppingCartIcon sx={{ fontSize: 18, color }} />,
    'Alimentos': <RestaurantIcon sx={{ fontSize: 18, color }} />,
    'Restaurante': <RestaurantIcon sx={{ fontSize: 18, color }} />,
    'Comida': <FastfoodIcon sx={{ fontSize: 18, color }} />,
    'Transporte': <CommuteIcon sx={{ fontSize: 18, color }} />,
    'Auto': <DirectionsCarIcon sx={{ fontSize: 18, color }} />,
    'Nafta': <LocalGasStationIcon sx={{ fontSize: 18, color }} />,
    'Viajes': <FlightIcon sx={{ fontSize: 18, color }} />,
    'Educación': <SchoolIcon sx={{ fontSize: 18, color }} />,
    'Entretenimiento': <SportsEsportsIcon sx={{ fontSize: 18, color }} />,
    'Hogar': <HomeIcon sx={{ fontSize: 18, color }} />,
    'Casa': <HomeIcon sx={{ fontSize: 18, color }} />,
    'Servicios': <ElectricalServicesIcon sx={{ fontSize: 18, color }} />,
    'Salud': <HealthAndSafetyIcon sx={{ fontSize: 18, color }} />,
    'Ropa': <CheckroomIcon sx={{ fontSize: 18, color }} />,
    'Tecnología': <DevicesIcon sx={{ fontSize: 18, color }} />,
    'Trabajo': <WorkIcon sx={{ fontSize: 18, color }} />,
    'Extras': <MoreHorizIcon sx={{ fontSize: 18, color }} />,
    'Ahorro': <SavingsIcon sx={{ fontSize: 18, color }} />,
    'Inversiones': <TrendingUpIcon sx={{ fontSize: 18, color }} />,
  };

  if (categoryMapping[categoryName]) return categoryMapping[categoryName];

  const lower = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryMapping)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return icon;
    }
  }
  return <CategoryIcon sx={{ fontSize: 18, color }} />;
};

const MonthlyExpenseCard = ({
  expenseTotal,
  expenseChange,
  previousExpense,
  topExpenseCategories,
  comparisonDateRange,
  dollarRate,
  currentMonthName,
  currentYear,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const venta = dollarRate?.venta || 1;

  return (
    <Grid item xs={12} md={4}>
      <Card
        elevation={3}
        sx={{
          height: '100%',
          position: 'relative',
          transition: 'all 0.3s ease',
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-5px)' },
            boxShadow: { xs: theme.shadows[3], sm: theme.shadows[10] },
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(to right, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
            >
              <TrendingDownIcon />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                Gastos Mensuales
              </Typography>
              <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                {currentMonthName} {currentYear}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Monto principal */}
          <Box sx={{ mb: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total de Gastos
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
              color: theme.palette.error.main,
              letterSpacing: '-0.5px'
            }}>
              $ {formatAmount(expenseTotal)}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
              USD {formatAmount(expenseTotal / venta)}
            </Typography>
          </Box>

          {/* Información comparativa */}
          <Box sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            mb: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {expenseChange <= 0 ?
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.success.main }} /> :
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
                }
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {Math.abs(expenseChange).toFixed(1)}% {expenseChange <= 0 ? 'menos' : 'más'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                vs. período {comparisonDateRange}
              </Typography>
            </Stack>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="caption" color="text.secondary">
                Mes anterior
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="error.main">
                {formatAmount(previousExpense)}
              </Typography>
              <Typography
                variant="body2"
                color={expenseTotal <= previousExpense ? "success.main" : "error.main"}
                sx={{ mt: 0.5, fontWeight: 'medium' }}
              >
                {expenseTotal <= previousExpense ? '-' : '+'}{formatAmount(Math.abs(expenseTotal - previousExpense))}
              </Typography>
            </Box>
          </Box>

          {/* Principales categorías */}
          <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Principales categorías
            </Typography>

            {topExpenseCategories.slice(0, 2).map((category, index) => (
              <Box key={index} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getExpenseCategoryIcon(category.category, theme.palette.text.secondary)}
                    <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: '70%' }}>
                      {category.category}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" color="text.primary">
                    {formatAmount(category.amount)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(category.percentage, 100)}
                  sx={{
                    height: 5,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.error.main
                    },
                    mb: 1
                  }}
                />
              </Box>
            ))}

            {topExpenseCategories.length > 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Otras categorías
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {formatAmount(
                    topExpenseCategories
                      .slice(2)
                      .reduce((acc, cat) => acc + cat.amount, 0)
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default MonthlyExpenseCard;
