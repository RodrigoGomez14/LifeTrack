import React from 'react';
import { Box, Typography, Card, Avatar, Checkbox, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';

const STAGE_ICONS = {
  Germinacion: SpaIcon, Vegetativo: GrassIcon, Floracion: LocalFloristIcon,
  Secado: ParkIcon, Enfrascado: ForestIcon,
};
const STAGE_COLORS = {
  Germinacion: '#8e24aa', Vegetativo: '#43a047', Floracion: '#e53935',
  Secado: '#fb8c00', Enfrascado: '#546e7a',
};

const PlantMultiSelect = ({ plants, selectedIds, onToggle, color }) => {
  const theme = useTheme();
  const accent = color || theme.palette.primary.main;

  if (plants.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        No hay plantas activas
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {plants.map((p) => {
        const StageIcon = STAGE_ICONS[p.etapa] || SpaIcon;
        const stageColor = STAGE_COLORS[p.etapa] || theme.palette.primary.main;
        const isSelected = selectedIds.has(p.id);
        return (
          <Card
            key={p.id}
            variant="outlined"
            onClick={() => onToggle(p.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              borderColor: isSelected ? accent : theme.palette.divider,
              borderWidth: isSelected ? 2 : 1,
              bgcolor: isSelected ? alpha(accent, 0.04) : 'transparent',
              transition: '0.12s',
              '&:hover': { borderColor: theme.palette.primary.light },
            }}
          >
            <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(stageColor, 0.12), color: stageColor }}>
              {p.profilePhotoUrl ? (
                <Box component="img" src={p.profilePhotoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <StageIcon />
              )}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {p.etapa || '?'}{p.potVolume ? ` · ${p.potVolume}L` : ''}{p.quantity > 1 ? ` · x${p.quantity}` : ''}
              </Typography>
            </Box>
            <Checkbox checked={isSelected} sx={{ color: isSelected ? accent : 'text.disabled' }} />
          </Card>
        );
      })}
    </Box>
  );
};

export default PlantMultiSelect;
