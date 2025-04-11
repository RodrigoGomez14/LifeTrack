import React, { useState } from 'react';
import { 
  AppBar as MuiAppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  alpha, 
  Avatar, 
  Badge, 
  Menu,
  MenuItem,
  Stack,
  Chip,
  Button,
  Tooltip,
  Divider,
  useMediaQuery,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { formatAmount } from '../../utils';
import { useStore } from '../../store';
import SwapHorizontalCircleIcon from '@mui/icons-material/SwapHorizontalCircle';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ScienceIcon from '@mui/icons-material/Science';

const AppBar = ({ toggleDrawer, title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Verificar si estamos en la página de plantas
  const isInPlantsPage = location.pathname === '/Plantas' || location.pathname === '/plantas';
  
  // Verificar si estamos en la página de aditivos
  const isInAditivesPage = location.pathname === '/Aditivos' || location.pathname === '/aditivos';
  
  // Obtener el nombre de usuario para personalizar la interfaz
  const displayName = auth.currentUser?.displayName || '';
  const firstName = displayName ? displayName.split(' ')[0] : '';
  
  // Estados para menús
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [quickActionMenuAnchor, setQuickActionMenuAnchor] = useState(null);
  
  // Funciones para manejar apertura/cierre de menús
  const handleOpenProfileMenu = (event) => setProfileMenuAnchor(event.currentTarget);
  const handleCloseProfileMenu = () => setProfileMenuAnchor(null);
  
  const handleOpenNotificationsMenu = (event) => setNotificationsMenuAnchor(event.currentTarget);
  const handleCloseNotificationsMenu = () => setNotificationsMenuAnchor(null);
  
  const handleOpenQuickActionMenu = (event) => setQuickActionMenuAnchor(event.currentTarget);
  const handleCloseQuickActionMenu = () => setQuickActionMenuAnchor(null);
  
  // Obtener datos financieros rápidos
  const getSavingsAmount = () => {
    return userData?.savings?.amountARS || 0;
  };

  const getSavingsUSD = () => {
    return userData?.savings?.amountUSD || 0;
  };
  
  // Función para manejar acciones rápidas
  const handleQuickAction = (action) => {
    handleCloseQuickActionMenu();
    switch (action) {
      case 'new-expense':
        navigate('/NuevoGasto');
        break;
      case 'new-income':
        navigate('/NuevoIngreso');
        break;
      case 'exchange':
        navigate('/exchange');
        break;
      case 'new-plant':
        navigate('/NuevaPlanta');
        break;
      case 'new-aditive':
        navigate('/NuevoAditivo');
        break;
      default:
        break;
    }
  };

  return (
    <MuiAppBar 
      position="fixed" 
      sx={{
        backgroundColor: theme.palette.primary.main,
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
      }}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        minHeight: { xs: 56, sm: 64 },
        px: { xs: 1, sm: 2 }
      }}>
        {/* Zona izquierda: Menú y título */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ 
              mr: { xs: 0.5, sm: 1 },
              '&:hover': { 
                backgroundColor: alpha('#fff', 0.15) 
              } 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Avatar 
                sx={{ 
                  bgcolor: alpha('#fff', 0.2),
                  width: 32,
                  height: 32,
                  mr: 1.5
                }}
              >
                <DashboardOutlinedIcon fontSize="small" />
              </Avatar>
            )}
            <Typography 
              variant={isMobile ? "subtitle1" : "h5"} 
              fontWeight="bold"
              sx={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                letterSpacing: 0.5,
                fontSize: { xs: '0.9rem', sm: '1.25rem' }
              }}
            >
              {title || ''}
            </Typography>
          </Box>
        </Stack>
        
        {/* Zona derecha: Acciones rápidas y perfil */}
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
          {/* Indicador de ahorros solo en desktop */}
          {!isMobile && userData && (
            <Box
              onClick={() => navigate('/Finanzas')}
              sx={{
                bgcolor: alpha('#fff', 0.1),
                borderRadius: 2,
                p: 0.75,
                mr: 1,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                maxWidth: 160,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.2),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachMoneyIcon sx={{ fontSize: 16, color: theme.palette.success.light }} />
                  <Typography variant="body2" fontWeight="medium" color="white" noWrap>
                    {formatAmount(getSavingsUSD()).replace('$', '')} USD
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonetizationOnIcon sx={{ fontSize: 16, color: theme.palette.primary.light }} />
                  <Typography variant="body2" fontWeight="medium" color="white" noWrap>
                    {formatAmount(getSavingsAmount()).replace('$', '')} ARS
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}
          
          {/* Versión mobile del indicador de ahorros */}
          {isMobile && userData && (
            <Tooltip title={`${formatAmount(getSavingsAmount())} ARS`}>
              <IconButton
                color="inherit"
                onClick={() => navigate('/Finanzas')}
                sx={{ 
                  position: 'relative',
                  '&:hover': { bgcolor: alpha('#fff', 0.15) }
                }}
              >
                <Badge 
                  badgeContent={
                    <Typography variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      $
                    </Typography>
                  } 
                  color="success"
                >
                  <AccountBalanceWalletIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          
          {/* Botón de acciones rápidas */}
          <Box sx={{ flexGrow: { xs: 0, sm: 0 } }}>
            <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, sm: 2 } }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SpeedIcon />}
                onClick={handleOpenQuickActionMenu}
                size={isMobile ? "small" : "medium"}
                sx={{
                  borderRadius: 5,
                  boxShadow: theme.shadows[3],
                  textTransform: 'none',
                  px: { xs: 1, sm: 2 },
                  minWidth: { xs: 'auto', sm: 'auto' }
                }}
              >
                {isMobile ? 'Acción' : 'Acción rápida'}
              </Button>
            </Stack>
            
            <Menu
              anchorEl={quickActionMenuAnchor}
              open={Boolean(quickActionMenuAnchor)}
              onClose={handleCloseQuickActionMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  minWidth: 200
                }
              }}
            >
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle1" sx={{ p: 1 }}>
                  {firstName ? `${firstName}, ¿qué quieres hacer?` : '¿Qué quieres hacer?'}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {/* Mostrar opción de agregar planta solo si estamos en la página de plantas */}
                {isInPlantsPage && (
                  <MenuItem onClick={() => handleQuickAction('new-plant')}>
                    <ListItemIcon>
                      <LocalFloristIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Nueva planta" />
                  </MenuItem>
                )}
                
                {/* Mostrar opción de agregar aditivo solo si estamos en la página de aditivos */}
                {isInAditivesPage && (
                  <MenuItem onClick={() => handleQuickAction('new-aditive')}>
                    <ListItemIcon>
                      <ScienceIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Nuevo aditivo" />
                  </MenuItem>
                )}
                
                <MenuItem onClick={() => handleQuickAction('new-expense')}>
                  <ListItemIcon>
                    <RemoveCircleIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Nuevo gasto" />
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('new-income')}>
                  <ListItemIcon>
                    <AddCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Nuevo ingreso" />
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('exchange')}>
                  <ListItemIcon>
                    <CurrencyExchangeIcon color="info" />
                  </ListItemIcon>
                  <ListItemText primary="Conversión de moneda" />
                </MenuItem>
              </Box>
            </Menu>
          </Box>
          
          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              color="inherit" 
              onClick={handleOpenNotificationsMenu}
              sx={{ 
                '&:hover': { bgcolor: alpha('#fff', 0.15) },
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Perfil de usuario */}
          <Box sx={{ flexGrow: 0, ml: { xs: 0.5, sm: 1 } }}>
            <Tooltip title={firstName ? `Perfil de ${firstName}` : "Abrir menú de perfil"}>
              <IconButton 
                onClick={handleOpenProfileMenu} 
                sx={{ 
                  p: 0,
                  '&:hover': { bgcolor: alpha('#fff', 0.15) }
                }}
              >
                <Avatar 
                  alt={auth.currentUser?.displayName || "Usuario"} 
                  src={auth.currentUser?.photoURL}
                  sx={{ 
                    width: { xs: 32, sm: 40 }, 
                    height: { xs: 32, sm: 40 },
                    border: `2px solid ${theme.palette.primary.contrastText}` 
                  }}
                >
                  {!auth.currentUser?.photoURL && auth.currentUser?.displayName 
                    ? auth.currentUser.displayName.charAt(0).toUpperCase() 
                    : "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={profileMenuAnchor}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(profileMenuAnchor)}
              onClose={handleCloseProfileMenu}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  minWidth: 220
                }
              }}
            >
              <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 0.5 }}>
                  {firstName ? `Hola, ${firstName}` : 'Bienvenido'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {auth.currentUser?.email}
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <MenuItem onClick={() => { handleCloseProfileMenu(); navigate('/Perfil'); }}>
                <AccountCircleOutlinedIcon sx={{ mr: 2, fontSize: 20, color: theme.palette.primary.main }} />
                <Typography variant="body2">Mi Perfil</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseProfileMenu(); navigate('/Configuracion'); }}>
                <SettingsOutlinedIcon sx={{ mr: 2, fontSize: 20, color: theme.palette.info.main }} />
                <Typography variant="body2">Configuración</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseProfileMenu(); navigate('/Ayuda'); }}>
                <HelpOutlineIcon sx={{ mr: 2, fontSize: 20, color: theme.palette.success.main }} />
                <Typography variant="body2">Ayuda</Typography>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem 
                onClick={async () => { 
                  handleCloseProfileMenu(); 
                  await auth.signOut(); 
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <Typography variant="body2" fontWeight="medium">Cerrar Sesión</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Stack>
      </Toolbar>
      
      {/* Menú de notificaciones */}
      <Menu
        anchorEl={notificationsMenuAnchor}
        open={Boolean(notificationsMenuAnchor)}
        onClose={handleCloseNotificationsMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: { xs: '90vw', sm: 320 },
            maxWidth: 320,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {firstName ? `Notificaciones de ${firstName}` : 'Notificaciones'}
          </Typography>
        </Box>
        <Divider />
        
        <MenuItem sx={{ borderRadius: 1, mb: 0.5 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Pago de tarjeta pendiente
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tu tarjeta Visa vence en 3 días
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem sx={{ borderRadius: 1, mb: 0.5 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Ahorro mensual completado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Has alcanzado tu meta de ahorro mensual
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem sx={{ borderRadius: 1 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Recordatorio de riego
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tus plantas necesitan agua hoy
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            size="small" 
            sx={{ fontSize: '0.75rem' }}
            onClick={handleCloseNotificationsMenu}
          >
            Ver todas
          </Button>
        </Box>
      </Menu>
    </MuiAppBar>
  );
};

export default AppBar;
