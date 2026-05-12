import React from 'react';
import {
  Card,
  Box,
  Avatar,
  Typography,
  Stack,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TodayIcon from '@mui/icons-material/Today';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { getMonthName } from '../../utils';

const months = Array.from(
  { length: 12 },
  (_, i) => ({ value: i + 1, label: getMonthName(i + 1) })
);

const FinancesTimeNavigator = ({
  dataType,
  setDataType,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  handlePreviousMonth,
  monthlyData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Calcular si el botón "mes siguiente" llegó al límite (mes actual)
  const isAtCurrentLimit = (() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

    if (selectedYear < currentYear && nextYear < currentYear) {
      return false;
    }
    if (nextYear === currentYear && nextMonth <= currentMonth) {
      return false;
    }
    return true;
  })();

  // Avanza al siguiente mes respetando el límite del mes actual
  const handleNextMonthWithLimit = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

    const isFutureLimitExceeded =
      (nextYear > currentYear) ||
      (nextYear === currentYear && nextMonth > currentMonth);

    if (isFutureLimitExceeded && selectedYear < currentYear) {
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
    } else if (!isFutureLimitExceeded) {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: { xs: '0 0 16px 16px', sm: '0 0 20px 20px' },
        overflow: 'hidden',
        position: 'sticky',
        top: {
          xs: 56,
          sm: 64
        },
        zIndex: 10,
        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`
        }
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          py: 1.5,
          px: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Fila 1: Información contextual y tipo de datos */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: { xs: 2, md: 0 },
            width: '100%'
          }}
        >
          {/* Indicador contextual del período seleccionado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.2),
                color: theme.palette.common.white,
                width: 40,
                height: 40
              }}
            >
              <CalendarTodayIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="white"
                sx={{
                  lineHeight: 1.2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px'
                }}
              >
                {getMonthName(selectedMonth)} {selectedYear}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(theme.palette.common.white, 0.85),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 500
                }}
              >
                {dataType === 'expenses'
                  ? <TrendingDownIcon fontSize="inherit" />
                  : <TrendingUpIcon fontSize="inherit" />
                }
                {dataType === 'expenses' ? 'Gastos' : 'Ingresos'} •
                {monthlyData ? ` Total: ${monthlyData.formattedTotal}` : ' Sin datos'}
              </Typography>
            </Box>
          </Box>

          {/* Controles - Tipo de datos (Gastos/Ingresos) y botón de Mes actual */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <ButtonGroup
              variant="contained"
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.12),
                borderRadius: 2,
                padding: 0.5,
                '& .MuiButton-root': {
                  bgcolor: 'transparent',
                  color: 'white',
                  borderColor: alpha(theme.palette.common.white, 0.2),
                  textTransform: 'none',
                  fontWeight: 'medium',
                  px: { xs: 1.5, sm: 2 },
                  py: 0.75,
                  '&.Mui-disabled': {
                    bgcolor: 'transparent',
                    color: 'white',
                    opacity: 1
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.15)
                  },
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Button
                startIcon={
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: dataType === 'expenses' ? theme.palette.error.main : alpha(theme.palette.common.white, 0.2),
                      color: 'white'
                    }}
                  >
                    <TrendingDownIcon fontSize="small" />
                  </Avatar>
                }
                onClick={() => setDataType('expenses')}
                disabled={dataType === 'expenses'}
                aria-label="Ver gastos"
                aria-pressed={dataType === 'expenses'}
                sx={{
                  boxShadow: dataType === 'expenses' ? `0 0 0 1px ${alpha(theme.palette.common.white, 0.5)}` : 'none',
                  '&.Mui-disabled': {
                    fontWeight: 'bold',
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                  }
                }}
              >
                Gastos
              </Button>
              <Button
                startIcon={
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: dataType === 'incomes' ? theme.palette.success.main : alpha(theme.palette.common.white, 0.2),
                      color: 'white'
                    }}
                  >
                    <TrendingUpIcon fontSize="small" />
                  </Avatar>
                }
                onClick={() => setDataType('incomes')}
                disabled={dataType === 'incomes'}
                aria-label="Ver ingresos"
                aria-pressed={dataType === 'incomes'}
                sx={{
                  boxShadow: dataType === 'incomes' ? `0 0 0 1px ${alpha(theme.palette.common.white, 0.5)}` : 'none',
                  '&.Mui-disabled': {
                    fontWeight: 'bold',
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                  }
                }}
              >
                Ingresos
              </Button>
            </ButtonGroup>

            {/* Botón de mes actual */}
            <Button
              variant="contained"
              size="small"
              startIcon={<TodayIcon />}
              onClick={() => {
                const now = new Date();
                setSelectedMonth(now.getMonth() + 1);
                setSelectedYear(now.getFullYear());
              }}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.25),
                color: theme.palette.common.white,
                backdropFilter: 'blur(4px)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'medium',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.35),
                }
              }}
            >
              Mes actual
            </Button>
          </Box>
        </Box>

        {/* Fila 2: Selección detallada de mes y año */}
        <Box
          sx={{
            mt: { xs: 1, md: 2 },
            bgcolor: alpha(theme.palette.background.paper, 0.12),
            borderRadius: 3,
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(5px)'
          }}
        >
          {/* Selector de mes táctil y accesible */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            position: 'relative'
          }}>
            <Tooltip title="Mes anterior" arrow placement="top">
              <IconButton
                onClick={handlePreviousMonth}
                color="inherit"
                size="small"
                aria-label="Mes anterior"
                sx={{
                  color: theme.palette.common.white,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.25),
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                flex: 1,
                overflow: 'hidden',
                mx: 1,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  px: 1,
                  transition: 'transform 0.3s ease-in-out',
                  '& > *': {
                    minWidth: { xs: 'auto', sm: 40 }
                  }
                }}
              >
                {months.map((month) => {
                  const isActive = selectedMonth === month.value;
                  const isVisible =
                    Math.abs(month.value - selectedMonth) <= 2 ||
                    (!isMobile && !isTablet);

                  const isFutureMonth =
                    (month.value > new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()) ||
                    (selectedYear > new Date().getFullYear());

                  return (
                    <Button
                      key={month.value}
                      onClick={() => setSelectedMonth(month.value)}
                      aria-label={`Mes de ${month.label}`}
                      aria-current={isActive ? 'date' : undefined}
                      disabled={isFutureMonth}
                      sx={{
                        py: 0.75,
                        px: { xs: 1, sm: 1.5 },
                        minWidth: { xs: 32, sm: 36 },
                        color: isActive ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.85),
                        bgcolor: isActive ? alpha(theme.palette.common.white, 0.9) : 'transparent',
                        fontWeight: isActive ? 'bold' : 'medium',
                        borderRadius: 1.5,
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        transition: 'all 0.2s ease',
                        opacity: isVisible ? (isFutureMonth ? 0.5 : 1) : { xs: 0, sm: 0.5 },
                        display: { xs: isVisible ? 'flex' : 'none', sm: 'flex' },
                        '&:hover': {
                          bgcolor: isActive
                            ? alpha(theme.palette.common.white, 0.9)
                            : alpha(theme.palette.common.white, 0.15),
                          transform: isFutureMonth ? 'none' : 'translateY(-2px)'
                        },
                        pointerEvents: isVisible && !isFutureMonth ? 'auto' : { xs: 'none', sm: 'auto' },
                        textTransform: 'none',
                        '&.Mui-disabled': {
                          color: alpha(theme.palette.common.white, 0.4),
                          pointerEvents: 'none'
                        }
                      }}
                    >
                      {month.label.substring(0, 3)}
                      {isActive && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.dark,
                            mt: 0.5
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Stack>
            </Box>

            <Tooltip title={isAtCurrentLimit ? "No se puede avanzar a meses futuros" : "Mes siguiente"} arrow placement="top">
              <span>
                <IconButton
                  onClick={handleNextMonthWithLimit}
                  color="inherit"
                  size="small"
                  aria-label="Mes siguiente"
                  disabled={isAtCurrentLimit}
                  sx={{
                    color: theme.palette.common.white,
                    opacity: isAtCurrentLimit ? 0.5 : 1,
                    '&:hover': {
                      bgcolor: isAtCurrentLimit ? 'transparent' : alpha(theme.palette.background.paper, 0.25),
                      transform: isAtCurrentLimit ? 'none' : 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease',
                    '&.Mui-disabled': {
                      color: alpha(theme.palette.common.white, 0.4)
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Selector de año intuitivo con flechas */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                ml: 1.5,
                pl: 1.5
              }}
            >
              <IconButton
                size="small"
                onClick={() => setSelectedYear(selectedYear - 1)}
                aria-label="Año anterior"
                sx={{
                  color: theme.palette.common.white,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.25)
                  }
                }}
              >
                <KeyboardArrowLeftIcon fontSize="small" />
              </IconButton>

              <Tooltip title="Seleccionar año" arrow>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={`Año ${selectedYear}`}
                  onClick={() => {
                    const currentYear = new Date().getFullYear();
                    setSelectedYear(currentYear);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const currentYear = new Date().getFullYear();
                      setSelectedYear(currentYear);
                    }
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 2,
                    minWidth: 60,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    mx: 0.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.25),
                      transform: 'translateY(-2px)'
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                      outlineOffset: 2
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={theme.palette.common.white}
                  >
                    {selectedYear}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title={selectedYear >= new Date().getFullYear() ? "No se puede avanzar a años futuros" : "Año siguiente"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const nextYear = selectedYear + 1;
                      const today = new Date();
                      const currentMonth = today.getMonth() + 1;
                      const currentYear = today.getFullYear();

                      if (nextYear === currentYear && selectedMonth > currentMonth) {
                        setSelectedMonth(currentMonth);
                      }

                      if (selectedYear < currentYear) {
                        setSelectedYear(nextYear);
                      }
                    }}
                    aria-label="Año siguiente"
                    disabled={selectedYear >= new Date().getFullYear()}
                    sx={{
                      color: theme.palette.common.white,
                      opacity: selectedYear >= new Date().getFullYear() ? 0.5 : 1,
                      '&:hover': {
                        bgcolor: selectedYear >= new Date().getFullYear() ? 'transparent' : alpha(theme.palette.background.paper, 0.25)
                      },
                      '&.Mui-disabled': {
                        color: alpha(theme.palette.common.white, 0.4)
                      }
                    }}
                  >
                    <KeyboardArrowRightIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default FinancesTimeNavigator;
