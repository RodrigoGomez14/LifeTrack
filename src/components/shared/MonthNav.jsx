import React from 'react';
import { Box, Typography, IconButton, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getMonthName } from '../../utils';

const MonthNav = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  disabledNext = false,
}) => {
  const theme = useTheme();

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  const goPrev = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  const goCurrent = () => {
    onMonthChange(today.getMonth() + 1);
    onYearChange(today.getFullYear());
  };

  return (
    <Box sx={{
      px: 2, py: 3,
      background: `linear-gradient(180deg, ${theme.palette.background.paper} 70%, ${theme.palette.background.default} 100%)`
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          onClick={isCurrentMonth ? undefined : goCurrent}
          sx={{
            fontWeight: 800,
            letterSpacing: -0.5,
            color: 'text.primary',
            textAlign: 'center',
            cursor: isCurrentMonth ? 'default' : 'pointer',
            userSelect: 'none',
            '&:hover': isCurrentMonth ? {} : { textDecoration: 'underline', textDecorationColor: alpha(theme.palette.text.primary, 0.3), textUnderlineOffset: 6 },
          }}
        >
          {getMonthName(month)} {year}
        </Typography>
        <IconButton
          onClick={goNext}
          disabled={disabledNext}
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

export default MonthNav;
