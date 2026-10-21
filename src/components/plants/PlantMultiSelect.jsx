import React from 'react';
import { Box, Typography, Card, Avatar, Checkbox, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import WavesIcon from '@mui/icons-material/Waves';

const STAGE_ICONS = {
  Germinacion: SpaIcon, Vegetativo: GrassIcon, Floracion: LocalFloristIcon,
  Lavado: WavesIcon, 'Lavado de Raices': WavesIcon,
  Secado: ParkIcon, Curado: ForestIcon,
};
const STAGE_COLORS = {
  Germinacion: '#8e24aa', Vegetativo: '#43a047', Floracion: '#e53935',
  'Lavado de Raices': '#00acc1',
  Secado: '#fb8c00', Curado: '#546e7a',
};

// `rdwcGroups` = { [ambienteId]: [plantId] }. Si una planta pertenece a un grupo
// RDWC, tocarla selecciona/deselecciona todo el grupo (los deshabilitados se ignoran).
const PlantMultiSelect = ({ plants, selectedIds, onToggle, color, disabledIds, rdwcGroups, onToggleGroup }) => {
  const theme = useTheme();
  const accent = color || theme.palette.primary.main;
  const disabledSet = disabledIds || new Set();

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
        const isDisabled = disabledSet.has(p.id);
        const rdwcGroup = p.ambienteId ? rdwcGroups?.[p.ambienteId] : null;
        const selectableGroup = rdwcGroup
          ? rdwcGroup.filter((id) => !disabledSet.has(id))
          : null;
        const isBlock = !!selectableGroup && selectableGroup.length > 0;

        const handleToggle = () => {
          if (isDisabled) return;
          if (isBlock && onToggleGroup) {
            const allSelected = selectableGroup.every((id) => selectedIds.has(id));
            onToggleGroup(selectableGroup, !allSelected);
            return;
          }
          onToggle(p.id);
        };

        return (
          <Card
            key={p.id}
            variant="outlined"
            onClick={handleToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              cursor: isDisabled ? 'default' : 'pointer',
              opacity: isDisabled ? 0.35 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
              borderColor: isDisabled ? theme.palette.divider : (isSelected ? accent : theme.palette.divider),
              borderWidth: isSelected && !isDisabled ? 2 : 1,
              bgcolor: isSelected && !isDisabled ? alpha(accent, 0.04) : 'transparent',
              transition: '0.12s',
              '&:hover': isDisabled ? {} : { borderColor: theme.palette.primary.light },
            }}
          >
            <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(stageColor, isDisabled ? 0.05 : 0.12), color: stageColor, opacity: isDisabled ? 0.4 : 1 }}>
              {p.profilePhotoUrl ? (
                <Box component="img" src={p.profilePhotoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <StageIcon />
              )}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
                {rdwcGroup && (
                  <Chip
                    label="RDWC"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      bgcolor: alpha(accent, 0.12),
                      color: accent,
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" color={isDisabled ? 'text.disabled' : 'text.secondary'}>
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
