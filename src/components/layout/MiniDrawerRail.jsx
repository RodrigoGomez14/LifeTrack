import React from 'react';
import { Box, IconButton, Tooltip, alpha, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { MENU_GROUPS } from './Drawer';
import { isItemActive } from './navUtils';

const RAIL_WIDTH = 56;

const MiniDrawerRail = ({ onQuickAdd }) => {
  const theme = useTheme();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (!isDesktop) return null;

  const allItems = MENU_GROUPS.flatMap((g) => g.items);

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: RAIL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: '72px',
        pb: 1,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: theme.zIndex.appBar - 1,
        gap: 0.25,
      }}
    >
      {onQuickAdd && (
        <>
          <Tooltip title="Nuevo gasto" placement="right" arrow>
            <IconButton
              onClick={onQuickAdd}
              aria-label="Nuevo gasto"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <AddIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ width: 24, height: '1px', bgcolor: 'divider', my: 0.75, flexShrink: 0 }} />
        </>
      )}

      {allItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(location.pathname, item.path);
        return (
          <Tooltip key={item.path} title={item.label} placement="right" arrow>
            <IconButton
              component={Link}
              to={item.path}
              size="small"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                color: active ? 'primary.light' : 'text.secondary',
                bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                '&:hover': {
                  bgcolor: active ? alpha(theme.palette.primary.main, 0.18) : 'action.hover',
                  color: active ? 'primary.light' : 'text.primary',
                },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default MiniDrawerRail;
