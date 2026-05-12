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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WorkIcon from '@mui/icons-material/Work';
import LaptopIcon from '@mui/icons-material/Laptop';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CategoryIcon from '@mui/icons-material/Category';
import { formatAmount } from '../../utils';

// Mapping de íconos de categorías de ingresos. Match parcial case-insensitive.
const getIncomeCategoryIcon = (categoryName, color) => {
  const categoryMapping = {
    'Sueldo': <WorkIcon sx={{ fontSize: 18, color }} />,
    'Freelance': <LaptopIcon sx={{ fontSize: 18, color }} />,
    'Camila': <PeopleIcon sx={{ fontSize: 18, color }} />,
    'Extras': <MoreHorizIcon sx={{ fontSize: 18, color }} />,
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

const MonthlyIncomeCard = ({
  incomeTotal,
  incomeChange,
  previousIncome,
  topIncomeCategories,
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
            background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
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
              <TrendingUpIcon />
            </Avatar>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
              Ingresos {currentMonthName} {currentYear}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Monto principal */}
          <Box sx={{ mb: 1.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total de Ingresos
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
              color: theme.palette.success.main,
              letterSpacing: '-0.5px'
            }}>
              {formatAmount(incomeTotal)}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
              USD {formatAmount(incomeTotal / venta)}
            </Typography>
          </Box>

          {/* Información comparativa */}
          <Box sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            mb: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {incomeChange >= 0 ?
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.success.main }} /> :
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
                }
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {Math.abs(incomeChange).toFixed(1)}% {incomeChange >= 0 ? 'más' : 'menos'}
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
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {formatAmount(previousIncome)}
              </Typography>
              <Typography
                variant="body2"
                color={incomeTotal >= previousIncome ? "success.main" : "error.main"}
                sx={{ mt: 0.5, fontWeight: 'medium' }}
              >
                {incomeTotal >= previousIncome ? '+' : '-'}{formatAmount(Math.abs(incomeTotal - previousIncome))}
              </Typography>
            </Box>
          </Box>

          {/* Principales categorías */}
          <Box sx={{ mt: 0.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Principales categorías
            </Typography>

            {topIncomeCategories.slice(0, 2).map((category, index) => (
              <Box key={index} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getIncomeCategoryIcon(category.category, theme.palette.text.secondary)}
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
                      bgcolor: theme.palette.success.main
                    },
                    mb: 1
                  }}
                />
              </Box>
            ))}

            {topIncomeCategories.length > 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Otras categorías
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {formatAmount(
                    topIncomeCategories
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

export default MonthlyIncomeCard;
