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
  IconButton,
  Collapse
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store';
import GrassIcon from '@mui/icons-material/Grass';
import ScienceIcon from '@mui/icons-material/Science';

const Drawer = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;
  const { userData } = useStore();
  const [expandedItems, setExpandedItems] = useState({});

  // Auto-expand parent if current path is a sub-item
  useEffect(() => {
    if (currentPath === '/Habitos' || currentPath === '/HabitosList') {
      setExpandedItems(prev => ({ ...prev, 'habitos': true }));
    }
    if (currentPath === '/Plantas' || currentPath === '/Aditivos') {
      setExpandedItems(prev => ({ ...prev, 'plantas': true }));
    }
    if (currentPath === '/finanzas' || currentPath === '/ahorros') {
      setExpandedItems(prev => ({ ...prev, 'finanzas': true }));
    }
  }, [currentPath]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleExpandClick = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const menuItems = [
    { path: '/', icon: <HomeOutlinedIcon />, text: 'Home', color: theme.palette.primary.main },
    { 
      key: 'finanzas',
      icon: <AccountBalanceOutlinedIcon />, 
      text: 'Finanzas', 
      color: theme.palette.success.main,
      subItems: [
        { path: '/finanzas', icon: <TrendingDownIcon />, text: 'Ingresos - Gastos', color: theme.palette.success.main },
        { path: '/ahorros', icon: <SavingsIcon />, text: 'Ahorros', color: theme.palette.success.dark }
      ]
    },
    { path: '/TarjetasCredito', icon: <CreditCardIcon />, text: 'Tarjetas', color: theme.palette.error.main },
    { 
      key: 'habitos',
      icon: <TrackChangesIcon />, 
      text: 'Hábitos', 
      color: theme.palette.info.main,
      subItems: [
        { path: '/Habitos', icon: <EmojiObjectsOutlinedIcon />, text: 'Seguimiento', color: theme.palette.info.main },
        { path: '/HabitosList', icon: <ListAltIcon />, text: 'Lista de Hábitos', color: theme.palette.info.dark }
      ]
    },
    { 
      key: 'plantas',
      icon: <ForestOutlinedIcon />, 
      text: 'Plantas', 
      color: theme.palette.secondary.main,
      subItems: [
        { path: '/Plantas', icon: <GrassIcon />, text: 'Listado de Plantas', color: theme.palette.secondary.main },
        { path: '/Aditivos', icon: <ScienceIcon />, text: 'Aditivos', color: theme.palette.secondary.dark }
      ]
    },
    { path: '/ayuda', icon: <HelpOutlineIcon />, text: 'Ayuda', color: theme.palette.warning.main },
  ];

  const renderMenuItem = (item) => {
    // If item has subItems, render as expandable parent
    if (item.subItems) {
      const isExpanded = expandedItems[item.key];
      const hasActiveSubItem = item.subItems.some(subItem => currentPath === subItem.path);
      
      return (
        <React.Fragment key={item.key}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => handleExpandClick(item.key)}
              sx={{ 
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: alpha(item.color, 0.08),
                  transform: 'translateX(4px)'
                },
                ...(hasActiveSubItem && {
                  backgroundColor: alpha(item.color, 0.06),
                })
              }}
            >
              <ListItemIcon sx={{ 
                color: hasActiveSubItem ? item.color : alpha(item.color, 0.7),
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: hasActiveSubItem ? '500' : '400',
                  color: hasActiveSubItem ? 'text.primary' : 'text.secondary',
                  fontSize: '0.95rem'
                }}
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {item.subItems.map((subItem) => (
                <ListItem 
                  key={subItem.path} 
                  component={Link} 
                  to={subItem.path} 
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton 
                    sx={{ 
                      borderRadius: 3,
                      transition: 'all 0.2s ease-in-out',
                      py: 1.2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: alpha(subItem.color, 0.08),
                        transform: 'translateX(4px)'
                      },
                      ...(currentPath === subItem.path && {
                        backgroundColor: alpha(subItem.color, 0.12),
                        boxShadow: `0 2px 8px ${alpha(subItem.color, 0.2)}`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: '60%',
                          width: 3,
                          borderRadius: '0 3px 3px 0',
                          backgroundColor: subItem.color
                        }
                      })
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: currentPath === subItem.path ? subItem.color : alpha(subItem.color, 0.7),
                      minWidth: 36
                    }}>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{ 
                        fontWeight: currentPath === subItem.path ? '500' : '400',
                        color: currentPath === subItem.path ? 'text.primary' : 'text.secondary',
                        fontSize: '0.9rem'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    // Regular menu item
    return (
      <ListItem 
        key={item.path} 
        component={Link} 
        to={item.path} 
        disablePadding
        sx={{ mb: 0.5 }}
      >
        <ListItemButton 
          sx={{ 
            borderRadius: 3,
            transition: 'all 0.2s ease-in-out',
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: alpha(item.color, 0.08),
              transform: 'translateX(4px)'
            },
            ...(currentPath === item.path && {
              backgroundColor: alpha(item.color, 0.12),
              boxShadow: `0 2px 8px ${alpha(item.color, 0.2)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '60%',
                width: 3,
                borderRadius: '0 3px 3px 0',
                backgroundColor: item.color
              }
            })
          }}
        >
          <ListItemIcon sx={{ 
            color: currentPath === item.path ? item.color : alpha(item.color, 0.7),
            minWidth: 40
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontWeight: currentPath === item.path ? '500' : '400',
              color: currentPath === item.path ? 'text.primary' : 'text.secondary',
              fontSize: '0.95rem'
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <MuiDrawer 
      open={open} 
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          width: 280,
          borderRight: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          bgcolor: theme.palette.background.paper
        }
      }}
    >
      {/* Header simplificado y elegante */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          pt: 3,
          pb: 3,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        {/* Logo */}
        <Avatar 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            width: 64,
            height: 64,
            mb: 2,
            border: '2px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box 
            component="img"
            src="/logo192.png"
            alt="Logo LifeTrack"
            sx={{
              width: 48,
              height: 48
            }}
          />
        </Avatar>
        
        {/* Título */}
        <Typography 
          variant="h5" 
          fontWeight="600" 
          color="white"
          sx={{
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            mb: 0.5
          }}
        >
          LifeTrack
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.8,
            fontWeight: 300
          }}
        >
          Gestión personal inteligente
        </Typography>
      </Box>
      
      {/* Menú de navegación limpio */}
      <List sx={{ flexGrow: 1, px: 2, py: 3 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
      
      {/* Sección de usuario simplificada */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ mx: 2, mb: 2 }} />
        
        {auth.currentUser && (
          <Box sx={{ px: 2, pb: 2 }}>
            {/* Información del usuario */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: 2
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: theme.palette.primary.main,
                  mr: 1.5
                }}
                src={auth.currentUser.photoURL}
              >
                {!auth.currentUser.photoURL && (userData?.displayName || auth.currentUser.email).charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="500" noWrap>
                  {userData?.displayName || 'Usuario'}
                </Typography> 
                <Typography variant="caption" color="text.secondary" noWrap>
                  {auth.currentUser.email}
                </Typography>
              </Box>
              
              <IconButton 
                component={Link}
                to="/Configuracion"
                size="small" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Botón de cierre de sesión */}
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ExitToAppOutlinedIcon />}
              onClick={handleLogout}
              sx={{ 
                py: 1.2,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: '500',
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5,
                  bgcolor: alpha(theme.palette.error.main, 0.05)
                }
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        )}
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
