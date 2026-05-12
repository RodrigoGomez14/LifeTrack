import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getMonthName } from '../../utils';
import { isBeyondFutureLimit } from './creditCardsHelpers';

const CreditCardsMonthNavigator = ({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}) => {
  const theme = useTheme();

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  };

  // Deshabilitar el botón "siguiente" cuando el mes próximo supera el límite (1 mes futuro).
  const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const nextDisabled = isBeyondFutureLimit(nextYear, nextMonth, 1);

  return (
    <Card
      elevation={2}
      sx={{
        mb: 4,
        mt: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon color="primary" />
            Seleccionar Período
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<TodayIcon />}
            onClick={goToCurrentMonth}
            sx={{ borderRadius: 2 }}
          >
            Mes actual
          </Button>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={goToPreviousMonth}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Box sx={{ flex: 1, mx: 2 }}>
                <Typography variant="h5" fontWeight="600" align="center">
                  {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
              </Box>

              <IconButton
                onClick={goToNextMonth}
                disabled={nextDisabled}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  '&.Mui-disabled': {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    color: alpha(theme.palette.grey[500], 0.5),
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreditCardsMonthNavigator;
