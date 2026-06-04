import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export const STAGES = [
  { key: 'Germinacion', label: 'GERME', icon: SpaIcon, color: '#8e24aa', order: 0 },
  { key: 'Vegetativo', label: 'VEGE', icon: GrassIcon, color: '#43a047', order: 1 },
  { key: 'Floracion', label: 'FLORA', icon: LocalFloristIcon, color: '#e53935', order: 2 },
  { key: 'Secado', label: 'SECADO', icon: ParkIcon, color: '#fb8c00', order: 3 },
  { key: 'Enfrascado', label: 'ENFRAS', icon: ForestIcon, color: '#546e7a', order: 4 },
];

export const ToolCircle = ({ icon, label, onClick, color }) => {
  const theme = useTheme();
  return (
    <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer', flex: '1 1 60px', maxWidth: 72 }}>
      <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: alpha(color || theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: color || theme.palette.primary.main, fontSize: 22, transition: '0.12s', '&:active': { transform: 'scale(0.95)' } }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: 10, textAlign: 'center', lineHeight: 1.2, maxWidth: 72 }}>
        {label}
      </Typography>
    </Box>
  );
};

export const PlantRow = ({ plant, onClick }) => {
  const stage = STAGES.find((s) => s.key === plant.etapa) || STAGES[0];
  const StageIcon = stage.icon;
  const birthDate = plant.birthDate;
  const daysActive = birthDate ? Math.floor((new Date() - (() => { const [d, m, y] = birthDate.split('/'); return new Date(+y, +m - 1, +d); })()) / (1000 * 60 * 60 * 24)) : null;
  const weeksActive = daysActive !== null ? Math.floor(daysActive / 7) : null;

  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, transition: '0.1s' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, bgcolor: 'action.hover' }}>
        {plant.profilePhotoUrl ? (
          <Box component="img" src={plant.profilePhotoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stage.color, fontSize: 22 }}>
            <StageIcon />
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{plant.name}</Typography>
        {plant.quantity > 1 && (
          <Typography variant="caption" color="text.secondary">{plant.quantity} plantas{plant.potVolume ? ` · ${plant.potVolume}L` : ''}</Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
        <StageIcon sx={{ fontSize: 18, color: stage.color }} />
        <Typography variant="caption" sx={{ fontWeight: 600, color: stage.color, fontSize: 11, whiteSpace: 'nowrap' }}>
          D{String(daysActive || 0).padStart(2, '0')}{weeksActive !== null ? ` (S${weeksActive})` : ''}
        </Typography>
      </Box>
      <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
    </Box>
  );
};

export const BubbleTooltip = ({ open, onClose, actions }) => {
  if (!open) return null;
  return (
    <Box sx={{ position: 'relative', zIndex: 10 }}>
      {/* Arrow */}
      <Box sx={{ mx: 'auto', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid', borderBottomColor: 'background.paper' }} />
      {/* Bubble */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, bgcolor: 'background.paper', borderRadius: 3, p: 2, mx: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', border: '1px solid', borderColor: 'divider' }}>
        {actions.map((action, i) => (
          <Box key={i} onClick={() => { action.onClick?.(); onClose(); }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: action.color || 'text.secondary', '&:active': { opacity: 0.7 } }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {action.icon}
            </Box>
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 500 }}>{action.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const LogEntry = ({ type, value, time, color }) => {
  const labels = { ph: 'pH', ec: 'EC', ppm: 'PPM', water: 'Riego', note: 'Nota' };
  const units = { ph: '', ec: ' mS/cm', ppm: '', water: 'ml', note: '' };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {labels[type] || type} {value}{units[type] || ''}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
        {time}
      </Typography>
    </Box>
  );
};
