import React, { useState, useEffect } from 'react';
import { 
  Drawer as MuiDrawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Typography, 
  Divider, 
  Box, 
  Avatar,
  useTheme,
  alpha,
  Paper,
  Chip,
  Stack,
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store';

const Drawer = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;
  const { userData } = useStore();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <HomeOutlinedIcon />, text: 'Home', color: theme.palette.primary.main },
    { path: '/Finanzas', icon: <AccountBalanceOutlinedIcon />, text: 'Finanzas', color: theme.palette.success.main },
    { path: '/TarjetasCredito', icon: <CreditCardIcon />, text: 'Tarjetas', color: theme.palette.error.main },
    { path: '/Habitos', icon: <EmojiObjectsOutlinedIcon />, text: 'Hábitos', color: theme.palette.info.main },
    { path: '/Plantas', icon: <ForestOutlinedIcon />, text: 'Plantas', color: theme.palette.secondary.main },
    { path: '/ayuda', icon: <HelpOutlineIcon />, text: 'Ayuda', color: theme.palette.warning.main },
  ];

  return (
    <MuiDrawer 
      open={open} 
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          width: 300,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Cabecera mejorada - Nuevo diseño creativo y moderno */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          pt: 4,
          pb: 5,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          color: 'white',
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Elementos decorativos del fondo */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.3,
          zIndex: 0,
        }}>
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#ffffff', 0.3)} 0%, ${alpha('#ffffff', 0)} 70%)`,
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0)} 70%)`,
          }} />
          
          {/* Líneas decorativas */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, ${alpha('#ffffff', 0)} 0%, ${alpha('#ffffff', 0.2)} 50%, ${alpha('#ffffff', 0)} 100%)`,
          }} />
        </Box>
        
        {/* Logo y nombre */}
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            width:  90,
            height: 90  ,
            border: '2px solid rgba(255,255,255,0.5)',
            mb: 1.5,
            zIndex: 1,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            p: 1 // Padding interno para que la imagen no toque los bordes
          }}
        >
          <Box 
            component="img"
            src="/logo192.png"
            alt="Logo LifeTrack"
            sx={{
              width: 70,
              height: 70
            }}
          />
        </Avatar>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="white"
            sx={{
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              letterSpacing: 1
            }}
          >
            LifeTrack
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.85,
              fontWeight: 300,
              letterSpacing: 0.5 
            }}
          >
            Sistema de gestión personal
          </Typography>
        </Box>
        
        {/* Indicador de estado */}
        <Chip
          label="En línea"
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            bgcolor: alpha(theme.palette.success.main, 0.5),
            color: 'white',
            borderRadius: 5,
            '& .MuiChip-label': {
              px: 1.5,
              fontWeight: 500,
              paddingLeft: 2.5,
            },
            border: '1px solid rgba(255,255,255,0.3)',
            '&:before': {
              content: '""',
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: theme.palette.success.light,
              boxShadow: `0 0 10px ${theme.palette.success.light}`
            }
          }}
        />
      </Box>
      
      {/* Menú de navegación mejorado */}
      <List sx={{ flexGrow: 1, px: 2, py: 2, mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.path} 
            component={Link} 
            to={item.path} 
            disablePadding
            sx={{ mb: 1 }}
          >
            <ListItemButton 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.3s',
                py: 1.2,
                '&:hover': {
                  backgroundColor: alpha(item.color, 0.15),
                  transform: 'translateX(5px)'
                },
                ...(currentPath === item.path && {
                  backgroundColor: alpha(item.color, 0.15),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '70%',
                    width: 4,
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: item.color
                  }
                })
              }}
            >
              <ListItemIcon sx={{ 
                color: currentPath === item.path ? item.color : alpha(item.color, 0.7),
                minWidth: 46 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: currentPath === item.path ? 'medium' : 'regular',
                  color: currentPath === item.path ? 'text.primary' : 'text.secondary'
                }}
              />
              {item.path === '/Finanzas' && (
                <Chip 
                  label="3" 
                  size="small" 
                  color="success" 
                  sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }} 
                />
              )}
              {item.path === '/TarjetasCredito' && (
                <Chip 
                  label="2" 
                  size="small" 
                  color="error" 
                  sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Configuración y perfil - Rediseño creativo */}
      <Box sx={{ p: 0, mt: 'auto' }}>
        <Divider sx={{ mb: 0 }} />
        
        {auth.currentUser && (
          <Box
            sx={{ 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Banner de usuario */}
            <Box
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
                pt: 3,
                pb: 1.5,
                px: 2.5,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Fondo estético */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  background: theme.palette.primary.main,
                  zIndex: -1
                }}
              />
              
              {/* Avatar con borde y estado */}
              <Box sx={{ position: 'relative', alignSelf: 'center', mb: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: 24,
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                  src={auth.currentUser.photoURL}
                >
                  {!auth.currentUser.photoURL && (userData?.displayName || auth.currentUser.email).charAt(0).toUpperCase()}
                </Avatar>
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 0 6px ${alpha(theme.palette.success.main, 0.8)}`
                  }}
                />
              </Box>
              
              {/* Información del usuario */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body1" fontWeight="bold" noWrap>
                  {userData.displayName}
                </Typography> 
                <Typography variant="caption" color="text.secondary" noWrap>
                  {auth.currentUser.email}
                </Typography>
              </Box>
              
              {/* Acciones del usuario */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1, 
                  mt: 1,
                  pb: 1
                }}
              >
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <PersonOutlineIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.2),
                    }
                  }}
                >
                  <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { top: -2, right: -2 } }}>
                    <NotificationsOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
                <IconButton 
                  component={Link}
                  to="/Configuracion"
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.2),
                    }
                  }}
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {/* Botón de cierre de sesión mejorado */}
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<ExitToAppOutlinedIcon />}
                onClick={handleLogout}
                sx={{ 
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 1.5,
                  fontWeight: 'medium',
                  '&:hover': {
                    borderWidth: 1.5,
                    bgcolor: alpha(theme.palette.error.main, 0.05)
                  }
                }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
