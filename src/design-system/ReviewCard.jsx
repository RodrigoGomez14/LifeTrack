import { Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Fila estándar de la pantalla de revisar: label a la izquierda, valor a la derecha.
// `children`/`value` puede ser primitivo (string/number) o un nodo (DatePicker, chips, etc.).
export const ReviewRow = ({ label, value, children, color }) => {
  const content = children !== undefined ? children : value;
  const isPrimitive = typeof content === 'string' || typeof content === 'number';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 1.5, px: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {isPrimitive ? (
          <Typography variant="body2" sx={{ fontWeight: 600, color: color || 'text.primary' }} noWrap>
            {content}
          </Typography>
        ) : (
          content
        )}
      </Box>
    </Box>
  );
};

// Resuelve un color a partir de una clave del palette (ej: 'primary') o un hex.
export const resolveAccent = (theme, color) => {
  if (!color) return theme.palette.primary.main;
  return theme.palette[color]?.main || color;
};

// Contenedor ghost de la pantalla de revisar: borde y fondo translúcido del color del wizard,
// con separadores suaves entre filas.
export const ReviewCard = ({ children, color = 'primary', sx }) => {
  const theme = useTheme();
  const c = resolveAccent(theme, color);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(c, 0.25)}`,
        bgcolor: alpha(c, 0.06),
        overflow: 'hidden',
        '& > *:not(:last-child)': { borderBottom: `1px solid ${alpha(c, 0.14)}` },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
