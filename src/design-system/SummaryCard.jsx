import { Paper, Typography } from '@mui/material';

export const SummaryCard = ({ icon, value, label, color, borderColor }) => (
  <Paper
    variant="outlined"
    sx={{
      py: 2,
      px: 1,
      borderRadius: 2,
      textAlign: 'center',
      borderColor: borderColor || 'divider',
      borderWidth: borderColor ? 2 : 1,
    }}
  >
    <Typography variant="h4" sx={{ mb: 0.2 }}>
      {icon}
    </Typography>
    <Typography variant="h4" fontWeight={borderColor ? 900 : 800} color={color || 'inherit'}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);
