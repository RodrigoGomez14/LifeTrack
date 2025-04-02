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
          background: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Cabecera mejorada - Ahora con color verde */}
      <Box 
        sx={{ 
          p: 2.5, 
          pb: 2,
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.dark, 0.9)} 0%, ${alpha(theme.palette.success.main, 0.9)} 100%)`,
          color: 'white',
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            width: 44,
            height: 44,
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        >
          <DashboardIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white">
            LifeTrack
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Sistema de gestión personal
          </Typography>
        </Box>
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
      
      {/* Configuración y perfil */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        
        {auth.currentUser && (
          <Paper
            elevation={0}
            sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.08)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <Avatar 
              sx={{ 
                width: 42, 
                height: 42, 
                bgcolor: theme.palette.success.main,
                boxShadow: `0 2px 10px ${alpha(theme.palette.success.main, 0.4)}`,
                fontSize: 16
              }}
            >
              {auth.currentUser.email.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="body1" fontWeight="medium" noWrap>
                {auth.currentUser.email.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {auth.currentUser.email}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Perfil">
                <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                  <PersonOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notificaciones">
                <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                  <Badge badgeContent={2} color="error">
                    <NotificationsOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Ajustes">
                <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        )}
        
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<ExitToAppOutlinedIcon />}
          onClick={handleLogout}
          sx={{ 
            py: 1.2,
            borderRadius: 2,
            boxShadow: 2,
            textTransform: 'none',
            fontWeight: 'medium'
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
