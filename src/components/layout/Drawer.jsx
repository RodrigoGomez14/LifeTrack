import React from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  Avatar,
  Button,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchange';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store';
import { isItemActive } from './navUtils';

import CannabisIcon from '../icons/CannabisIcon';

export const MENU_GROUPS = [
  {
    items: [{ path: '/', icon: HomeOutlinedIcon, label: 'Home' }],
  },
  {
    label: 'FINANZAS',
    items: [
      { path: '/gastos', icon: TrendingDownOutlinedIcon, label: 'Gastos' },
      { path: '/ingresos', icon: TrendingUpOutlinedIcon, label: 'Ingresos' },
      { path: '/tarjetas', icon: CreditCardOutlinedIcon, label: 'Tarjetas' },
      { path: '/exchanges', icon: CurrencyExchangeOutlinedIcon, label: 'Exchange' },
      { path: '/ahorros', icon: SavingsOutlinedIcon, label: 'Ahorros' },
    ],
  },
  {
    label: 'PLANTAS',
    items: [
      { path: '/plantas', icon: CannabisIcon, label: 'Plantas' },
      { path: '/nutrientes', icon: ScienceOutlinedIcon, label: 'Nutrientes & Insecticidas' },
      { path: '/ambientes', icon: MeetingRoomOutlinedIcon, label: 'Ambientes' },
    ],
  },
  {
    items: [{ path: '/Habitos', icon: CheckCircleOutlineIcon, label: 'Hábitos' }],
  },
];

const Drawer = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { userData } = useStore();

  const displayName = userData?.displayName || user?.displayName || 'Usuario';
  const email = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    toggleDrawer();
    try {
      await signOut();
    } catch {}
  };

  const renderGroup = (group) => (
    <Box key={group.label || group.items[0].path} sx={{ mb: 0.5 }}>
      {group.label && (
        <Box
          sx={{
            px: 2,
            py: 0.75,
            mx: 1,
            mb: 0.75,
            borderRadius: 1.5,
            bgcolor: 'primary.dark',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: 10,
            }}
          >
            {group.label}
          </Typography>
        </Box>
      )}
      {group.items.map(renderItem)}
    </Box>
  );

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = isItemActive(location.pathname, item.path);
    return (
      <Box
        key={item.path}
        component={Link}
        to={item.path}
        onClick={toggleDrawer}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.1,
          mx: 1.5,
          mb: 0.25,
          borderRadius: 2,
          textDecoration: 'none',
          color: active ? '#fff' : 'text.secondary',
          bgcolor: active ? 'primary.dark' : 'transparent',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            bgcolor: active ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08),
            color: active ? '#fff' : theme.palette.text.primary,
          },
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: active ? 600 : 400,
            fontSize: '0.9rem',
          }}
        >
          {item.label}
        </Typography>
      </Box>
    );
  };

  return (
    <MuiDrawer
      open={open}
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          width: 280,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          pt: 3,
          pb: 2.5,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          bgcolor: 'primary.dark',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          src={user?.photoURL || undefined}
          sx={{
            width: 56,
            height: 56,
            bgcolor: alpha('#fff', 0.15),
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 700,
            mb: 1,
          }}
        >
          {!user?.photoURL && initial}
        </Avatar>
        <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff', maxWidth: '100%' }} noWrap>
          {displayName}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            maxWidth: '100%',
            color: alpha('#fff', 0.7),
          }}
        >
          {email}
        </Typography>
      </Box>

      {/* Menú principal */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {MENU_GROUPS.map(renderGroup)}
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            sx={{
              color: 'error.main',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.25,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
