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
  useMediaQuery
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
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { formatAmount } from '../../utils';
import { useStore } from '../../store';

const AppBar = ({ toggleDrawer, title }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      case 'new-card':
        navigate('/NuevaTarjeta');
        break;
      case 'new-habit':
        navigate('/NuevoHabito');
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
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Zona izquierda: Menú y título */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ 
              mr: 1,
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
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="bold"
              sx={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                letterSpacing: 0.5
              }}
            >
              {title}
            </Typography>
          </Box>
        </Stack>
        
        {/* Zona derecha: Acciones rápidas y perfil */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Indicador de ahorros solo en desktop */}
          {!isMobile && userData && (
            <Chip
              label={`Ahorros: ${formatAmount(getSavingsAmount())}`}
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: '#fff',
                fontWeight: 'medium',
                mr: 1,
                '&:hover': { 
                  bgcolor: alpha('#fff', 0.25)
                }
              }}
              onClick={() => navigate('/Finanzas')}
            />
          )}
          
          {/* Botón de acciones rápidas */}
          <Tooltip title="Acciones rápidas">
            <Button
              color="inherit"
              onClick={handleOpenQuickActionMenu}
              endIcon={<KeyboardArrowDownIcon />}
              startIcon={<AddCircleOutlineIcon />}
              sx={{ 
                bgcolor: alpha('#fff', 0.1),
                '&:hover': { 
                  bgcolor: alpha('#fff', 0.2) 
                },
                borderRadius: 2,
                px: 1.5,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Crear
            </Button>
          </Tooltip>
          
          {/* Botón de acciones rápidas (versión móvil) */}
          <IconButton 
            color="inherit" 
            onClick={handleOpenQuickActionMenu}
            sx={{ 
              display: { xs: 'flex', sm: 'none' },
              '&:hover': { 
                bgcolor: alpha('#fff', 0.15) 
              }
            }}
          >
            <AddCircleOutlineIcon />
          </IconButton>
          
          {/* Notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              color="inherit" 
              onClick={handleOpenNotificationsMenu}
              sx={{ '&:hover': { bgcolor: alpha('#fff', 0.15) } }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Perfil de usuario */}
          <Tooltip title="Mi perfil">
            <IconButton 
              onClick={handleOpenProfileMenu} 
              sx={{ 
                ml: { xs: 0, sm: 1 },
                '&:hover': { 
                  bgcolor: alpha('#fff', 0.15) 
                } 
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: alpha('#fff', 0.25),
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 'bold'
                }}
              >
                {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
      
      {/* Menú de perfil */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleCloseProfileMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            mt: 1.5, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: 220,
            borderRadius: 2,
            px: 0.5,
            py: 1
          }
        }}
      >
        {auth.currentUser && (
          <Box sx={{ px: 2, py: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {auth.currentUser.email.split('@')[0]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {auth.currentUser.email}
            </Typography>
          </Box>
        )}
        
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
      
      {/* Menú de notificaciones */}
      <Menu
        anchorEl={notificationsMenuAnchor}
        open={Boolean(notificationsMenuAnchor)}
        onClose={handleCloseNotificationsMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            mt: 1.5, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: 280,
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <Box sx={{ px: 1, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Notificaciones
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
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
      
      {/* Menú de acciones rápidas */}
      <Menu
        anchorEl={quickActionMenuAnchor}
        open={Boolean(quickActionMenuAnchor)}
        onClose={handleCloseQuickActionMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { 
            mt: 1.5, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: 220,
            borderRadius: 2,
            p: 1.5
          }
        }}
      >
        <MenuItem 
          onClick={() => handleQuickAction('new-expense')}
          sx={{ 
            borderRadius: 2, 
            mb: 1.5,
            p: 1.5,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.2)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} width="100%">
            <Box 
              sx={{
                bgcolor: theme.palette.error.main,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'white',
                boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.6)}`
              }}
            >
              <AddCircleOutlineIcon />
            </Box>
            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.error.main }}>
              Nuevo Gasto
            </Typography>
          </Stack>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleQuickAction('new-income')}
          sx={{ 
            borderRadius: 2, 
            p: 1.5,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.success.main, 0.2)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} width="100%">
            <Box 
              sx={{
                bgcolor: theme.palette.success.main,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: 'white',
                boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.6)}`
              }}
            >
              <AddCircleOutlineIcon />
            </Box>
            <Typography variant="body1" fontWeight="medium" sx={{ color: theme.palette.success.main }}>
              Nuevo Ingreso
            </Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </MuiAppBar>
  );
};

export default AppBar;
