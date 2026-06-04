import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getMonthName } from '../../utils';

// True si el siguiente mes está más allá del mes calendario actual (no permitir navegar al futuro)
const isFutureMonth = (year, month) => {
  const today = new Date();
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  if (year > ty) return true;
  if (year === ty && month > tm) return true;
  return false;
};

const FinancesHeader = ({
  dataType,
  setDataType,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
}) => {
  const theme = useTheme();

  const goPrev = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goNext = () => {
    const nm = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const ny = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(nm);
    setSelectedYear(ny);
  };

  const nm = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const ny = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const nextDisabled = isFutureMonth(ny, nm);

  return (
    <Box sx={{ bgcolor: 'background.paper', px: 2, py: 2.5 }}>
      {/* Toggle Gastos/Ingresos */}
      <ToggleButtonGroup
        value={dataType}
        exclusive
        onChange={(_e, v) => v && setDataType(v)}
        fullWidth
        sx={{
          mb: 2.5,
          bgcolor: alpha(theme.palette.action.hover, 0.4),
          borderRadius: 999,
          p: 0.4,
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 999,
            py: 0.9,
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              bgcolor:
                dataType === 'expenses'
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: 'white',
              '&:hover': {
                bgcolor:
                  dataType === 'expenses'
                    ? theme.palette.error.dark
                    : theme.palette.success.dark,
              },
            },
          },
        }}
      >
        <ToggleButton value="expenses">Gastos</ToggleButton>
        <ToggleButton value="incomes">Ingresos</ToggleButton>
      </ToggleButtonGroup>

      {/* Navegador < Mes Año > */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <IconButton
          onClick={goPrev}
          sx={{
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: -0.5,
            color: 'text.primary',
            minWidth: { xs: 200, sm: 240 },
            textAlign: 'center',
          }}
        >
          {getMonthName(selectedMonth)} {selectedYear}
        </Typography>
        <IconButton
          onClick={goNext}
          disabled={nextDisabled}
          sx={{
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.8) },
            '&.Mui-disabled': { bgcolor: alpha(theme.palette.action.disabled, 0.1) },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default FinancesHeader;
