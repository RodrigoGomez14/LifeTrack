import { Box, Typography, CircularProgress, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const LoadingOverlay = ({ open, message }) => {
  const theme = useTheme();
  if (!open) return null;
  return (
    <Box sx={{
      position: 'fixed', inset: 0,
      bgcolor: alpha(theme.palette.background.default, 0.85),
      zIndex: theme.zIndex.modal + 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2,
    }}>
      <CircularProgress size={48} />
      {message && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingOverlay;
