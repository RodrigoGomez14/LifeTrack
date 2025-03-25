import React from 'react';
import { 
  Box, 
  Grid,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  FormControl,
  InputLabel
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import { getMonthName } from '../../utils';
import { useNavigate } from 'react-router-dom';

const MonthNavigator = ({ selectedYear, selectedMonth, handleYearChange, handleMonthChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  
  // Comprobar si es el mes actual
  const isCurrentMonth = selectedMonth === (new Date().getMonth() + 1) && 
                         selectedYear === new Date().getFullYear();
  
  // Generar array de años disponibles (desde el año actual hasta 2 años atrás)
  const availableYears = Array.from(
    { length: 4 }, 
    (_, i) => new Date().getFullYear() - i
  );
  
  // Generar array de meses
  const months = Array.from(
    { length: 12 }, 
    (_, i) => ({ value: i + 1, label: getMonthName(i + 1) })
  );
  
  // Manejadores de navegación
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      handleMonthChange(12);
      handleYearChange(selectedYear - 1);
    } else {
      handleMonthChange(selectedMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      handleMonthChange(1);
      handleYearChange(selectedYear + 1);
    } else {
      handleMonthChange(selectedMonth + 1);
    }
  };
  
  const goToCurrentMonth = () => {
    handleMonthChange(new Date().getMonth() + 1);
    handleYearChange(new Date().getFullYear());
  };

  return (
    <Box 
      sx={{ 
        mb: 3, 
        position: 'relative',
        width: '100%',
        left: 0,
        right: 0,
        zIndex: 5,
      }}
    >
      <Box sx={{
        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        py: 1.5,
        px: 0
      }}>
        <Grid container spacing={1} alignItems="center" sx={{ px: { xs: 2, sm: 2 } }}>
          {/* Botones de Tarjetas */}
          <Grid item xs={12} sm={4} md={3} lg={2}>
            <ButtonGroup 
              variant="contained" 
              fullWidth
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiButton-root': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)'
                  }
                }
              }}
            >
              <Button 
                startIcon={<CreditCardIcon />}
                sx={{ flexGrow: 1 }}
              >
                {isMobile ? 'Tarjetas' : 'Tarjetas de Crédito'}
              </Button>
              <Button
                sx={{ px: 1 }}
                onClick={() => navigate('/NuevaTarjeta')}
              >
                <AddIcon />
              </Button>
            </ButtonGroup>
          </Grid>
          
          {/* Navegación meses */}
          <Grid item xs={12} sm={8} md={9} lg={10}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack 
                  direction="row" 
                  spacing={0.5} 
                  alignItems="center" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    p: 0.5,
                    height: '100%'
                  }}
                >
                  <IconButton 
                    onClick={handlePreviousMonth} 
                    color="inherit"
                    size="small"
                    sx={{ 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <ButtonGroup
                    variant="text"
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      '& .MuiButton-root': {
                        borderRadius: 1.5,
                        color: 'white',
                        px: 1,
                        mx: 0.2,
                        minWidth: 'auto',
                        fontSize: '0.8rem',
                        '&.active': {
                          bgcolor: 'rgba(255,255,255,0.25)',
                          fontWeight: 'bold'
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.15)'
                        }
                      }
                    }}
                  >
                    {months.map((month) => (
                      <Button
                        key={month.value}
                        className={selectedMonth === month.value ? 'active' : ''}
                        onClick={() => handleMonthChange(month.value)}
                        sx={{
                          display: isMobile ? (
                            month.value === selectedMonth - 1 || 
                            month.value === selectedMonth || 
                            month.value === selectedMonth + 1 ? 'block' : 'none'
                          ) : (
                            isTablet ? (
                              Math.abs(month.value - selectedMonth) <= 2 ? 'block' : 'none'
                            ) : 'block'
                          )
                        }}
                      >
                        {month.label.substring(0, 3)}
                      </Button>
                    ))}
                  </ButtonGroup>
                  
                  <IconButton 
                    onClick={handleNextMonth} 
                    color="inherit"
                    size="small"
                    sx={{ 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              </Grid>
              
              <Grid item xs={6} md={2.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.15)'
                    }}
                  >
                    <CalendarTodayIcon sx={{ color: 'white', fontSize: '1rem' }} />
                  </Box>
                  <Select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{
                      width: '100%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white'
                      },
                      '& .MuiSelect-select': {
                        fontWeight: 'bold'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: theme.palette.primary.main,
                          '& .MuiMenuItem-root': {
                            color: 'white',
                            '&.Mui-selected': {
                              bgcolor: 'rgba(255,255,255,0.15)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.25)'
                              }
                            },
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.1)'
                            }
                          }
                        }
                      }
                    }}
                  >
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Grid>
              
              <Grid item xs={6} md={2.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarTodayIcon />}
                  onClick={goToCurrentMonth}
                  sx={{
                    height: '100%',
                    color: 'white',
                    borderColor: isCurrentMonth ? 'white' : 'rgba(255,255,255,0.5)',
                    bgcolor: isCurrentMonth ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Mes Actual
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MonthNavigator; 