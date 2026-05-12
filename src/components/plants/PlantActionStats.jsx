import React from 'react';
import {
  Card,
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  TextField,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SaveIcon from '@mui/icons-material/Save';

// Card de stat estándar (cantidad de riegos/podas/etc).
const CountCard = ({ stat, isHighlighted, onClick, theme }) => (
  <Card
    elevation={3}
    onClick={onClick}
    sx={{
      borderRadius: 3,
      cursor: 'pointer',
      overflow: 'hidden',
      border: `1px solid ${alpha(stat.color, 0.2)}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 6px 15px ${alpha(stat.color, 0.15)}`,
      },
      ...(isHighlighted && {
        boxShadow: `0 6px 15px ${alpha(stat.color, 0.3)}`,
        transform: 'translateY(-4px)',
        border: `1px solid ${alpha(stat.color, 0.4)}`,
      }),
    }}
  >
    <Box
      sx={{
        p: 1.5,
        background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.8)} 100%)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
        {stat.label}
      </Typography>
      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#ffffff', 0.2), color: '#ffffff' }}>
        {stat.icon}
      </Avatar>
    </Box>
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}>
        {stat.value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        registros
      </Typography>
    </Box>
  </Card>
);

// Card de peso (con input + botón guardar, o valor ya registrado).
const WeightCard = ({ stat }) => (
  <Card
    elevation={3}
    sx={{
      borderRadius: 3,
      cursor: 'default',
      overflow: 'hidden',
      border: `1px solid ${alpha(stat.color, 0.2)}`,
      transition: 'all 0.2s ease',
      '&:hover': { boxShadow: `0 6px 15px ${alpha(stat.color, 0.15)}` },
    }}
  >
    <Box
      sx={{
        p: 1.5,
        background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.8)} 100%)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
        {stat.label}
      </Typography>
      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#ffffff', 0.2), color: '#ffffff' }}>
        {stat.icon}
      </Avatar>
    </Box>
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {stat.hasInput ? (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            type="number"
            placeholder="Peso en gramos"
            value={stat.inputValue}
            onChange={(e) => stat.setInputValue(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">g</InputAdornment>,
              inputProps: { min: 0, step: 0.1 },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderColor: alpha(stat.color, 0.3),
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(stat.color, 0.5) },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: stat.color },
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={stat.onSave}
            disabled={!stat.inputValue || parseFloat(stat.inputValue) <= 0 || stat.saving}
            startIcon={stat.saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: stat.color,
              '&:hover': { bgcolor: alpha(stat.color, 0.8) },
              '&:disabled': { bgcolor: alpha(stat.color, 0.3) },
            }}
          >
            {stat.saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}>
            {stat.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stat.weightType === 'humedo' ? 'cosecha' : 'final'}
          </Typography>
        </>
      )}
    </Box>
  </Card>
);

// Combina counts de acciones + cards de peso cuando aplican.
function buildStats(plant, weights) {
  const base = [
    { label: 'Riegos', count: plant.irrigations, icon: <WaterDropIcon /> },
    { label: 'Insecticidas', count: plant.insecticides, icon: <BugReportIcon /> },
    { label: 'Podas', count: plant.prunings, icon: <ContentCutIcon /> },
    { label: 'Transplantes', count: plant.transplants, icon: <SwapHorizIcon /> },
  ];

  return base.map((b, index) => ({
    label: b.label,
    value: b.count ? Object.keys(b.count).length : 0,
    icon: b.icon,
    color: ['info', 'error', 'success', 'warning'].map((p) => weights.theme.palette[p].main)[index],
    tabIndex: index,
  }));
}

const PlantActionStats = ({
  plant,
  highlightedTab,
  onHighlightChange,
  pesoHumedoInput,
  setPesoHumedoInput,
  pesoSecoInput,
  setPesoSecoInput,
  savingPesoHumedo,
  savingPesoSeco,
  onSavePesoHumedo,
  onSavePesoSeco,
}) => {
  const theme = useTheme();

  const baseStats = buildStats(plant, { theme });

  // Peso húmedo aparece desde inicioSecado; peso seco aparece en etapa Enfrascado.
  const weightStats = [];
  if (plant.inicioSecado) {
    weightStats.push({
      label: 'Peso húmedo',
      value: plant.pesoHumedo ? `${plant.pesoHumedo}g` : 'No registrado',
      icon: <OpacityIcon />,
      color: '#ff6f00',
      weightType: 'humedo',
      hasInput: !plant.pesoHumedo,
      inputValue: pesoHumedoInput,
      setInputValue: setPesoHumedoInput,
      onSave: onSavePesoHumedo,
      saving: savingPesoHumedo,
    });
  }
  if (plant.etapa === 'Enfrascado') {
    weightStats.push({
      label: 'Peso seco',
      value: plant.pesoSeco ? `${plant.pesoSeco}g` : 'No registrado',
      icon: <LocalOfferIcon />,
      color: '#2e7d32',
      weightType: 'seco',
      hasInput: !plant.pesoSeco,
      inputValue: pesoSecoInput,
      setInputValue: setPesoSecoInput,
      onSave: onSavePesoSeco,
      saving: savingPesoSeco,
    });
  }

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {baseStats.map((stat) => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <CountCard
            stat={stat}
            isHighlighted={highlightedTab === stat.tabIndex}
            onClick={() => onHighlightChange(stat.tabIndex)}
            theme={theme}
          />
        </Grid>
      ))}
      {weightStats.map((stat) => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <WeightCard stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PlantActionStats;
