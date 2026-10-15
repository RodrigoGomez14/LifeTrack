import { Paper, Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
  <Button
    fullWidth
    variant="outlined"
    startIcon={<AddIcon />}
    onClick={onClick}
    sx={{
      py: desc ? 2.5 : 3,
      borderRadius: 2,
      borderStyle: 'dashed',
      textTransform: 'none',
      mb: 2,
      justifyContent: 'center',
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {label}
      </Typography>
      {desc && (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
          {desc}
        </Typography>
      )}
    </Box>
  </Button>
);
