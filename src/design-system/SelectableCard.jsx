import { Paper, Typography } from '@mui/material';

export const SelectableCard = ({
  icon,
  label,
  desc,
  active,
  onClick,
  activeColor,
}) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      py: 2,
      px: 1,
      borderRadius: 2,
      textAlign: 'center',
      cursor: 'pointer',
      borderColor: active ? activeColor || 'primary.main' : 'divider',
      borderWidth: active ? 2 : 1,
      bgcolor: active ? 'action.selected' : 'transparent',
      transition: '0.15s',
      '&:hover': { borderColor: 'primary.light' },
    }}
  >
    {typeof icon === 'string' ? (
      <Typography variant="h5" sx={{ mb: 0.2 }}>
        {icon}
      </Typography>
    ) : (
      icon
    )}
    <Typography variant="caption" fontWeight={600} display="block">
      {label}
    </Typography>
    {desc && (
      <Typography variant="caption" color="text.secondary">
        {desc}
      </Typography>
    )}
  </Paper>
);

export const QuantityCard = ({ value, active, onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      py: 1.5,
      px: 0.5,
      borderRadius: 2,
      textAlign: 'center',
      cursor: 'pointer',
      borderColor: active ? 'primary.main' : 'divider',
      borderWidth: active ? 2 : 1,
      bgcolor: active ? 'action.selected' : 'transparent',
      transition: '0.12s',
      '&:hover': { borderColor: 'primary.light' },
    }}
  >
    <Typography variant="h5" fontWeight={800}>
      {value}
    </Typography>
  </Paper>
);
