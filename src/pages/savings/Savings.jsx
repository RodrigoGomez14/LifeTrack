import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Avatar, IconButton,
  LinearProgress, Menu, MenuItem, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount } from '../../utils';
import { removeFund } from '../../services/savings';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const SUMMARY = [
  { label: 'ARS', value: (s) => formatAmount(s.savingsARS), icon: AttachMoneyIcon, color: (t) => t.palette.info.main },
  { label: 'USD', value: (s) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.savingsUSD), icon: MonetizationOnIcon, color: (t) => t.palette.primary.main },
  { label: 'Fondos', value: (s) => formatAmount(s.totalFunds), icon: AccountBalanceIcon, color: (t) => t.palette.secondary.main },
];

const Savings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuFundId, setMenuFundId] = useState(null);

  const savingsARS = userData?.savings?.amountARS || 0;
  const savingsUSD = userData?.savings?.amountUSD || 0;

  const funds = useMemo(() =>
    Object.entries(userData?.savingsFunds || {}).map(([id, f]) => ({ id, ...f }))
  , [userData]);

  const totalFunds = funds.reduce((sum, f) => sum + (f.balance || 0), 0);
  const snapshot = { savingsARS, savingsUSD, totalFunds };

  const openMenu = (e, fundId) => { setMenuAnchor(e.currentTarget); setMenuFundId(fundId); };
  const openEdit = () => { setMenuAnchor(null); if (menuFundId) navigate(`/editarFondo/${menuFundId}`); };
  const handleDelete = () => {
    setMenuAnchor(null);
    if (!window.confirm('¿Eliminar este fondo permanentemente?')) return;
    removeFund(menuFundId);
  };

  const fundColor = theme.palette.secondary.main;

  return (
    <Layout title="Ahorros">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Summary cards */}
        <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          {SUMMARY.map((item) => {
            const c = item.color(theme);
            return (
              <AnimatedItem key={item.label}>
                <Box sx={{
                  borderRadius: 2, border: `1px solid ${alpha(c, 0.25)}`,
                  bgcolor: alpha(c, 0.06), display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2,
                }}>
                  <item.icon sx={{ fontSize: 20, color: c, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>{item.label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: c }}>{item.value(snapshot)}</Typography>
                </Box>
              </AnimatedItem>
            );
          })}
        </AnimatedGroup>

        {/* Funds list */}
        {funds.length > 0 ? (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {funds.map((fund) => {
              const pct = fund.target ? Math.min(100, ((fund.balance || 0) / fund.target) * 100) : 0;
              return (
                <AnimatedItem key={fund.id}>
                  <Card elevation={0}
                    onClick={() => navigate(`/HistorialFondo/${fund.id}`)}
                    sx={{ borderRadius: 3, border: `1px solid ${alpha(fundColor, 0.15)}`, bgcolor: alpha(fundColor, 0.04), overflow: 'hidden', cursor: 'pointer', '&:hover': { bgcolor: alpha(fundColor, 0.08) } }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>{fund.name}</Typography>
                          {fund.description ? (
                            <Typography variant="caption" color="text.secondary">{fund.description}</Typography>
                          ) : null}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); openMenu(e, fund.id); }} sx={{ color: 'text.secondary' }}>
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, my: 0.5, color: fundColor }}>
                        {formatAmount(fund.balance || 0)}
                      </Typography>

                      {fund.target > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">{Math.round(pct)}%</Typography>
                            <Typography variant="caption" color="text.secondary">{formatAmount(fund.target)}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 999, bgcolor: alpha(fundColor, 0.12), '& .MuiLinearProgress-bar': { bgcolor: fundColor } }} />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: fund.target > 0 ? 0 : 1.5 }}>
                        <Button size="small" variant="contained" startIcon={<TrendingUpIcon />}
                          onClick={(e) => { e.stopPropagation(); navigate(`/agregarFondos/${fund.id}`); }}
                          sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: theme.palette.success.main, '&:hover': { bgcolor: theme.palette.success.dark } }}>
                          Agregar
                        </Button>
                        <Button size="small" variant="contained" startIcon={<TrendingDownIcon />}
                          disabled={(fund.balance || 0) <= 0}
                          onClick={(e) => { e.stopPropagation(); navigate(`/retirarFondos/${fund.id}`); }}
                          sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}>
                          Retirar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </AnimatedItem>
              );
            })}
          </AnimatedGroup>
        ) : (
          <AnimatedItem>
            <Card elevation={0} sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}` }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                <SavingsIcon fontSize="medium" />
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No tenés fondos de ahorro
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/nuevoFondo')}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600 }}>
                Crear primer fondo
              </Button>
            </Card>
          </AnimatedItem>
        )}

        {funds.length > 0 && (
          <AnimatedItem>
            <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/nuevoFondo')}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'none', fontWeight: 600, borderStyle: 'dashed' }}>
              Crear fondo
            </Button>
          </AnimatedItem>
        )}

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={openEdit}>Editar fondo</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>Eliminar fondo</MenuItem>
        </Menu>
      </Box>
    </Layout>
  );
};

export default Savings;
