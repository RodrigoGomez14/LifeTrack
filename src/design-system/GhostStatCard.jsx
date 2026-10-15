import { Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const GhostStatCard = ({ icon: Icon, label, value, sub, color = 'primary', sx }) => {
  const theme = useTheme();
  const c = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(c, 0.25)}`,
        bgcolor: alpha(c, 0.06),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 1.75,
        px: 1,
        height: '100%',
        ...sx,
      }}
    >
      {Icon && <Icon sx={{ fontSize: 20, color: c, mb: 0.5 }} />}
      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, color: c, maxWidth: '100%' }} noWrap>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '100%' }} noWrap>
          {sub}
        </Typography>
      )}
    </Box>
  );
};
