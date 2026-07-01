import React from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  Avatar,
  Button,
  SvgIcon,
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
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store';

const CannabisIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512" sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 36, ...props.sx }}>
    <path d="M256 0c5.3 0 10.3 2.7 13.3 7.1c15.8 23.5 36.7 63.7 49.2 109c7.2 26.4 11.8 55.2 10.4 84c11.5-8.8 23.7-16.7 35.8-23.6c41-23.3 84.4-36.9 112.2-42.5c5.2-1 10.7 .6 14.4 4.4s5.4 9.2 4.4 14.5c-5.6 27.7-19.3 70.9-42.7 111.7c-9.1 15.9-19.9 31.7-32.4 46.3c27.8 6.6 52.4 17.3 67.2 25.5c5.1 2.8 8.2 8.2 8.2 14s-3.2 11.2-8.2 14c-15.2 8.4-40.9 19.5-69.8 26.1c-20.2 4.6-42.9 7.2-65.2 4.6l8.3 33.1c1.5 6.1-.6 12.4-5.5 16.4s-11.6 4.6-17.2 1.9L280 417.2l0 70.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-70.8-58.5 29.1c-5.6 2.8-12.3 2.1-17.2-1.9s-7-10.3-5.5-16.4l8.3-33.1c-22.2 2.6-45 0-65.2-4.6c-28.9-6.6-54.6-17.6-69.8-26.1c-5.1-2.8-8.2-8.2-8.2-14s3.2-11.2 8.2-14c14.8-8.2 39.4-18.8 67.2-25.5C78.9 296.3 68.1 280.5 59 264.6c-23.4-40.8-37.1-84-42.7-111.7c-1.1-5.2 .6-10.7 4.4-14.5s9.2-5.4 14.4-4.4c27.9 5.5 71.2 19.2 112.2 42.5c12.1 6.9 24.3 14.7 35.8 23.6c-1.4-28.7 3.1-57.6 10.4-84c12.5-45.3 33.4-85.5 49.2-109c3-4.4 8-7.1 13.3-7.1z" />
  </SvgIcon>
);

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
      { path: '/nutrientes', icon: ScienceOutlinedIcon, label: 'Nutrientes & Suplementos' },
    ],
  },
  {
    items: [{ path: '/Habitos', icon: CheckCircleOutlineIcon, label: 'Hábitos' }],
  },
  {
    items: [{ path: '/Configuracion', icon: SettingsOutlinedIcon, label: 'Configuración' }],
  },
  {
    items: [{ path: '/ayuda', icon: HelpOutlineOutlinedIcon, label: 'Ayuda' }],
  },
];

const isItemActive = (currentPath, itemPath) => {
  const curr = currentPath.toLowerCase();
  const target = itemPath.toLowerCase();
  if (curr === target) return true;
  if (target === '/') return false;
  return curr.startsWith(target + '/');
};

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
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
