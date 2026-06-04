import React, { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Button,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store';
import { formatAmount } from '../../utils';

const QUICK_ACTIONS = [
  { label: 'Gasto', icon: <TrendingDownIcon fontSize="small" />, path: '/nuevoGasto' },
  { label: 'Ingreso', icon: <TrendingUpIcon fontSize="small" />, path: '/nuevoIngreso' },
  { label: 'Exchange', icon: <CurrencyExchangeIcon fontSize="small" />, path: '/exchange' },
];

const AppBar = ({ toggleDrawer, title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userData } = useStore();
  const [profileAnchor, setProfileAnchor] = useState(null);

  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const savingsARS = userData?.savings?.amountARS || 0;
  const savingsUSD = userData?.savings?.amountUSD || 0;

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: alpha('#0a1929', 0.82),
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}
      >
        {/* Izquierda — hamburguesa */}
        <Box sx={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={toggleDrawer}
            size="small"
            sx={{
              color: theme.palette.primary.light,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Centro — título */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            letterSpacing: 0.3,
            fontSize: { xs: '0.95rem', sm: '1rem' },
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title || ''}
        </Typography>

        {/* Derecha — quick actions + avatar */}
        <Box sx={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {QUICK_ACTIONS.map((a) => (
              <Button
                key={a.path}
                component={Link}
                to={a.path}
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={a.icon}
                sx={{
                  minWidth: 0,
                  height: 32,
                  px: 1,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontSize: 11,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.light',
                  },
                }}
              >
                {a.label}
              </Button>
            ))}
          </Box>

          {/* Savings */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mr: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.light', fontSize: 10, lineHeight: 1 }}>
              $ {formatAmount(savingsARS)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>·</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.light', fontSize: 10, lineHeight: 1 }}>
              US$ {formatAmount(savingsUSD)}
            </Typography>
          </Box>

          <IconButton
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 600,
              }}
            >
              {!user?.photoURL && initial}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                borderRadius: 2.5,
                minWidth: 240,
                overflow: 'visible',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileAnchor(null);
                navigate('/Configuracion');
              }}
              sx={{ py: 1.25 }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <Typography variant="body2">Configuración</Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={async () => {
                setProfileAnchor(null);
                await signOut();
              }}
              sx={{ py: 1.25, color: 'error.main' }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Cerrar sesión
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
