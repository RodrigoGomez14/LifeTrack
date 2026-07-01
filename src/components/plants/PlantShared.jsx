import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import WavesIcon from '@mui/icons-material/Waves';
import CircleIcon from '@mui/icons-material/Circle';
import { calculateDaysBetween } from './plantsHelpers';

const CannabisIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 512 512" sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 36, ...props.sx }}>
    <path d="M256 0c5.3 0 10.3 2.7 13.3 7.1c15.8 23.5 36.7 63.7 49.2 109c7.2 26.4 11.8 55.2 10.4 84c11.5-8.8 23.7-16.7 35.8-23.6c41-23.3 84.4-36.9 112.2-42.5c5.2-1 10.7 .6 14.4 4.4s5.4 9.2 4.4 14.5c-5.6 27.7-19.3 70.9-42.7 111.7c-9.1 15.9-19.9 31.7-32.4 46.3c27.8 6.6 52.4 17.3 67.2 25.5c5.1 2.8 8.2 8.2 8.2 14s-3.2 11.2-8.2 14c-15.2 8.4-40.9 19.5-69.8 26.1c-20.2 4.6-42.9 7.2-65.2 4.6l8.3 33.1c1.5 6.1-.6 12.4-5.5 16.4s-11.6 4.6-17.2 1.9L280 417.2l0 70.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-70.8-58.5 29.1c-5.6 2.8-12.3 2.1-17.2-1.9s-7-10.3-5.5-16.4l8.3-33.1c-22.2 2.6-45 0-65.2-4.6c-28.9-6.6-54.6-17.6-69.8-26.1c-5.1-2.8-8.2-8.2-8.2-14s3.2-11.2 8.2-14c14.8-8.2 39.4-18.8 67.2-25.5C78.9 296.3 68.1 280.5 59 264.6c-23.4-40.8-37.1-84-42.7-111.7c-1.1-5.2 .6-10.7 4.4-14.5s9.2-5.4 14.4-4.4c27.9 5.5 71.2 19.2 112.2 42.5c12.1 6.9 24.3 14.7 35.8 23.6c-1.4-28.7 3.1-57.6 10.4-84c12.5-45.3 33.4-85.5 49.2-109c3-4.4 8-7.1 13.3-7.1z" />
  </SvgIcon>
);

export const STAGES = [
  { key: 'Germinacion', label: 'Germinacion', icon: SpaIcon, color: '#8e24aa', order: 0 },
  { key: 'Vegetativo', label: 'Vegetativo', icon: GrassIcon, color: '#43a047', order: 1 },
  { key: 'Floracion', label: 'Floracion', icon: LocalFloristIcon, color: '#e53935', order: 2 },
  { key: 'Lavado de Raices', label: 'Lavado de Raices', icon: WavesIcon, color: '#00acc1', order: 3 },
  { key: 'Secado', label: 'Secado', icon: ParkIcon, color: '#fb8c00', order: 4 },
  { key: 'Curado', label: 'Curado', icon: ForestIcon, color: '#546e7a', order: 5 },
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
  const birthDate = plant.birthDate;
  const daysActive = birthDate ? Math.floor((new Date() - (() => { const [d, m, y] = birthDate.split('/'); return new Date(+y, +m - 1, +d); })()) / (1000 * 60 * 60 * 24)) : null;
  const weeksActive = daysActive !== null ? Math.floor(daysActive / 7) : null;

  const vegDays = plant.inicioVegetativo
    ? calculateDaysBetween(plant.inicioVegetativo, plant.inicioFloracion || null)
    : null;
  const flowerDays = plant.inicioFloracion
    ? calculateDaysBetween(plant.inicioFloracion)
    : null;

  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, transition: '0.1s' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, bgcolor: 'action.hover' }}>
        {plant.profilePhotoUrl ? (
          <Box component="img" src={plant.profilePhotoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stage.color, 0.15) }}>
            <CannabisIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{plant.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
          {vegDays !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <CircleIcon sx={{ fontSize: 8, color: '#43a047' }} />
              <Typography variant="caption" sx={{ color: '#43a047', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1 }}>
                {vegDays} días
              </Typography>
            </Box>
          )}
          {flowerDays !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <CircleIcon sx={{ fontSize: 8, color: '#e91e63' }} />
              <Typography variant="caption" sx={{ color: '#e91e63', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1 }}>
                {flowerDays} días
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 600, color: stage.color, fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
        D{String(daysActive || 0).padStart(2, '0')}{weeksActive !== null ? ` (S${weeksActive})` : ''}
      </Typography>
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
