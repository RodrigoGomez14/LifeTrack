import React from 'react';
import {
  Grid,
  Card,
  Box,
  Stack,
  Avatar,
  Typography,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { formatAmount } from '../../utils';

const OverviewCardsRow = ({ userData, dollarRate, balance }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const ars = userData?.savings?.amountARS || 0;
  const usd = userData?.savings?.amountUSD || 0;
  const venta = dollarRate?.venta || 1;

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
      {/* Ahorros en ARS */}
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
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                Ahorros en ARS
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Total en ARS
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                color: theme.palette.primary.main,
                letterSpacing: '-0.5px'
              }}>
                $ {formatAmount(ars)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                USD {formatAmount(ars / venta)}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Ahorros en USD */}
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
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 }
                  }}
                >
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                  Ahorros en USD
                </Typography>
              </Stack>
              <Chip
                size="small"
                icon={<CurrencyExchangeIcon fontSize="small" />}
                label={`$${dollarRate?.venta || '-'}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'medium',
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Total en USD
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                color: theme.palette.info.main,
                letterSpacing: '-0.5px'
              }}>
                {formatAmount(usd, true)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                ARS {formatAmount(usd * venta)}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Balance Mensual */}
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
              background: balance >= 0
                ? `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                : `linear-gradient(to right, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
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
                <ShowChartIcon />
              </Avatar>
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                Balance Mensual
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Balance Total
              </Typography>
              <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{
                color: balance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                letterSpacing: '-0.5px'
              }}>
                $ {formatAmount(balance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                USD {formatAmount(balance / venta)}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OverviewCardsRow;
