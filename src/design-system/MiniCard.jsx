import { Paper, Typography, Avatar } from '@mui/material';

export const MiniCard = ({ icon, label, value, color = 'primary', link }) => {
  const content = (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        textAlign: 'center',
        cursor: link ? 'pointer' : 'default',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: '0.15s',
        '&:hover': link ? { borderColor: 'primary.light' } : {},
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          mx: 'auto',
          mb: 0.5,
          bgcolor: `${color}.dark`,
          fontSize: 18,
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="h5" fontWeight={900} color={`${color}.main`}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );

  return content;
};
