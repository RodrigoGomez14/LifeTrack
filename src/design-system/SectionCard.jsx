import { Paper, Typography, Box } from '@mui/material';

export const SectionCard = ({ title, icon, action, children, sx }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...sx,
    }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        bgcolor: 'primary.dark',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
    <Box sx={{ p: 2, flex: 1 }}>{children}</Box>
  </Paper>
);

export const DashedAddCard = ({ label, desc, onClick }) => (
  <Paper
    variant="outlined"
    onClick={onClick}
    sx={{
      py: 2.5,
      px: 1,
      borderRadius: 2,
      textAlign: 'center',
      cursor: 'pointer',
      mb: 2,
      borderStyle: 'dashed',
      transition: '0.15s',
      '&:hover': {
        borderColor: 'primary.light',
        bgcolor: 'action.hover',
      },
    }}
  >
    <Typography variant="h4" sx={{ mb: 0.3 }}>
      +
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {label}
    </Typography>
    <Typography variant="caption" color="text.secondary" display="block">
      {desc}
    </Typography>
  </Paper>
);
