import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@mui/material/styles';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const DollarRatesRow = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dolarOficial, setDolarOficial] = useState(null);
  const [dolarBlue, setDolarBlue] = useState(null);

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
        const data = await response.json();
        setDolarOficial(data.oficial);
        setDolarBlue(data.blue);
      } catch (error) {
        console.error('Error al obtener el valor del dólar oficial:', error);
      }
    };
    fetchDolar();
  }, []);

  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2 }}
      sx={{
        mb: { xs: 2, sm: 3 },
        mt: { xs: 2, sm: 3 },
        justifyContent: 'center'
      }}
    >
      {dolarOficial && dolarBlue ? (
        <>
          {/* Dólar Oficial */}
          <Grid item xs={12} sm={6} md={4}>
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
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
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
                    <CurrencyExchangeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Dólar Oficial
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Banco Central
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Compra
                      </Typography>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{
                        color: theme.palette.primary.main,
                        letterSpacing: '-0.5px'
                      }}>
                        ${dolarOficial.value_buy.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Venta
                      </Typography>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{
                        color: theme.palette.primary.main,
                        letterSpacing: '-0.5px'
                      }}>
                        ${dolarOficial.value_sell.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          {/* Dólar Blue */}
          <Grid item xs={12} sm={6} md={4}>
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
                  background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
                    <CurrencyExchangeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Dólar Blue
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Mercado paralelo
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Compra
                      </Typography>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{
                        color: theme.palette.info.main,
                        letterSpacing: '-0.5px'
                      }}>
                        ${dolarBlue.value_buy.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Venta
                      </Typography>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{
                        color: theme.palette.info.main,
                        letterSpacing: '-0.5px'
                      }}>
                        ${dolarBlue.value_sell.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          {/* Brecha Cambiaria */}
          <Grid item xs={12} sm={12} md={4}>
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
                  background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                    <CompareArrowsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                      Brecha Cambiaria
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      Diferencia Blue vs Oficial
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" sx={{
                    color: theme.palette.warning.main,
                    letterSpacing: '-0.5px'
                  }}>
                    {Math.round(((dolarBlue.value_sell / dolarOficial.value_sell) - 1) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CurrencyExchangeIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cargando cotizaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Consultando la última información disponible del mercado cambiario...
              </Typography>
              <LinearProgress sx={{ width: '60%', maxWidth: 300, mx: 'auto', borderRadius: 1 }} />
            </Box>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default DollarRatesRow;
