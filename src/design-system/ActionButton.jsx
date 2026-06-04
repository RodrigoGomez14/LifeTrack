import { Box, Button } from '@mui/material';

const buttonSx = { borderRadius: 0, py: 1.3, fontWeight: 600, fontSize: 12 };

export const ActionButton = ({
  variant = 'contained',
  color = 'primary',
  children,
  sx,
  ...props
}) => (
  <Button variant={variant} color={color} sx={{ ...buttonSx, ...sx }} {...props}>
    {children}
  </Button>
);

export const ActionBar = ({ children, sx, ...props }) => (
  <Box
    sx={{ display: 'flex', gap: 1, mt: 2, mb: 3, ...sx }}
    {...props}
  >
    {children}
  </Box>
);
