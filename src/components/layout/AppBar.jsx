import React, { useState } from 'react';
import {
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AppBar = ({ toggleDrawer, title, showBack, onBack }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profileAnchor, setProfileAnchor] = useState(null);

  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
        ml: { md: '56px' },
        width: { md: 'calc(100% - 56px)' },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Izquierda — back arrow o hamburguesa */}
        <Box sx={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showBack ? (
            <IconButton
              onClick={onBack}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          ) : (
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
          )}
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

        {/* Derecha — avatar */}
        <Box sx={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
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
      </Box>
    </Box>
  );
};

export default AppBar;
