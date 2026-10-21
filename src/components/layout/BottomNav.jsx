import React, { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CannabisIcon from '../icons/CannabisIcon';
import { isItemActive } from './navUtils';

const FINANCE_PATHS = ['/gastos', '/ingresos', '/tarjetas', '/tarjeta', '/exchanges', '/exchange', '/ahorros'];

const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: HomeOutlinedIcon },
  { path: '/gastos', label: 'Finanzas', Icon: AccountBalanceWalletOutlinedIcon, matchPaths: FINANCE_PATHS },
  { path: '/plantas', label: 'Plantas', Icon: CannabisIcon },
  { path: '/Habitos', label: 'Hábitos', Icon: CheckCircleOutlineIcon },
];

/**
 * Barra de navegación inferior (solo mobile). El botón central "+" abre el
 * wizard de nuevo movimiento directamente en modo Gasto (se puede cambiar a
 * Ingreso desde el toggle del paso 1).
 */
const BottomNav = ({ onQuickAdd }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const [navWidth, setNavWidth] = useState(0);

  // El borde se dibuja en coordenadas reales (px), así la curva no se deforma.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return undefined;
    const update = () => setNavWidth(el.getBoundingClientRect().width);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const borderColor = alpha(theme.palette.text.primary, 0.18);
  const notchRadius = 35;
  const centerX = navWidth / 2;

  const renderTab = ({ path, label, Icon, matchPaths }) => {
    const active = (matchPaths || [path]).some((p) => isItemActive(pathname, p));
    return (
      <ButtonBase
        key={path}
        component={Link}
        to={path}
        aria-current={active ? 'page' : undefined}
        sx={{
          flex: 1,
          height: '100%',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          color: active ? 'primary.light' : 'text.secondary',
          '&:hover': { color: active ? 'primary.light' : 'text.primary' },
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
        <Typography
          component="span"
          sx={{
            fontSize: 10,
            fontWeight: active ? 700 : 500,
            letterSpacing: 0.2,
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
      </ButtonBase>
    );
  };

  return (
    <Box
      ref={navRef}
      component="nav"
      aria-label="Navegación inferior"
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.appBar,
        height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Fondo con muesca semicircular para el botón central.
          Va en una capa aparte para que el mask no recorte el botón ni los tabs.
          Notch de 35px: 28 del botón + 6px de separación + 1px del trazo. */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: 'blur(12px)',
          WebkitMaskImage:
            'radial-gradient(circle at 50% 1px, transparent 34px, #000 35px)',
          maskImage:
            'radial-gradient(circle at 50% 1px, transparent 34px, #000 35px)',
        }}
      />

      {/* Borde recto + curva en un único path, para que la unión no se pise.
          El trazo de 2px se centra en y=1px: cubre y=0..2 y queda dentro de la barra. */}
      {navWidth > 0 && (
        <Box
          component="svg"
          aria-hidden="true"
          width={navWidth}
          height={38}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          <path
            d={`M 0 1 H ${centerX - notchRadius} A ${notchRadius} ${notchRadius} 0 0 0 ${centerX + notchRadius} 1 H ${navWidth}`}
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
          />
        </Box>
      )}

      {renderTab(NAV_ITEMS[0])}
      {renderTab(NAV_ITEMS[1])}

      {/* Botón central apoyado en la muesca */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
        <ButtonBase
          onClick={onQuickAdd}
          aria-label="Nuevo gasto"
          sx={{
            position: 'absolute',
            top: -27,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'transform 0.12s, background-color 0.15s',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:active': { transform: 'scale(0.94)' },
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </ButtonBase>
      </Box>

      {renderTab(NAV_ITEMS[2])}
      {renderTab(NAV_ITEMS[3])}
    </Box>
  );
};

export default BottomNav;
