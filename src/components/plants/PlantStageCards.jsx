import React from 'react';
import { format } from 'date-fns';
import { Card, Box, Typography, Grid, Avatar, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { getStageInfo, getStageIcon } from './plantsHelpers';

const STAGES = ['Germinacion', 'Vegetativo', 'Floracion', 'Lavado de Raices', 'Secado', 'Curado'];

// Parsea una fecha DD/MM/YYYY a Date para formateo. Lo hace la JSX en dos lugares
// (dd/MM y yyyy), así que lo dejamos como helper inline.
function parseDmy(dmy) {
  return new Date(dmy.split('/').reverse().join('-'));
}

const StageDateBox = ({ label, dateStr, color, isActive }) => (
  <Box
    sx={{
      mb: dateStr ? 0 : 0,
      p: 1.5,
      bgcolor: alpha(color, 0.05),
      borderRadius: 2,
      border: `1px solid ${alpha(color, 0.1)}`,
    }}
  >
    <Typography
      variant="caption"
      sx={{
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color,
        display: 'block',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        fontWeight: dateStr ? 'bold' : 'normal',
        color: dateStr ? 'text.primary' : 'text.secondary',
        fontSize: '0.95rem',
      }}
    >
      {dateStr ? (
        <>
          <Box component="span" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            {format(parseDmy(dateStr), 'dd/MM')}
          </Box>
          <Box component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary', ml: 0.5 }}>
            /{format(parseDmy(dateStr), 'yyyy')}
          </Box>
        </>
      ) : isActive ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
          <Box sx={{ width: 8, height: 8, bgcolor: color, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            En curso
          </Typography>
        </Box>
      ) : (
        'No iniciada'
      )}
    </Typography>
  </Box>
);

const StatusChip = ({ stageInfo, stageColor, theme }) => {
  if (stageInfo.isActive) {
    return (
      <Chip
        label="ETAPA ACTUAL"
        size="medium"
        sx={{
          bgcolor: stageColor,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          px: 1,
          '& .MuiChip-label': { px: 2 },
        }}
      />
    );
  }
  if (stageInfo.isCompleted) {
    return (
      <Chip
        label="COMPLETADA"
        size="medium"
        sx={{
          bgcolor: theme.palette.success.main,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.75rem',
        }}
      />
    );
  }
  return (
    <Chip
      label="PENDIENTE"
      size="medium"
      variant="outlined"
      sx={{
        borderColor: theme.palette.grey[400],
        color: theme.palette.grey[600],
        fontWeight: 'bold',
        fontSize: '0.75rem',
      }}
    />
  );
};

const PlantStageCards = ({ plant }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {STAGES.map((stageName) => {
            const stageInfo = getStageInfo(plant, stageName);

            const stageColor = stageInfo.isActive
              ? theme.palette.primary.main
              : stageInfo.isCompleted
              ? theme.palette.success.main
              : theme.palette.grey[400];

            return (
              <Grid item xs={12} sm={6} md={3} key={stageName}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(stageColor, 0.2)}`,
                    transition: 'all 0.2s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 15px ${alpha(stageColor, 0.15)}`,
                    },
                    ...(stageInfo.isActive && {
                      boxShadow: `0 6px 15px ${alpha(stageColor, 0.3)}`,
                      transform: 'translateY(-2px)',
                      border: `1px solid ${alpha(stageColor, 0.4)}`,
                    }),
                  }}
                >
                  {/* Header con gradiente */}
                  <Box
                    sx={{
                      p: 2,
                      background: `linear-gradient(135deg, ${stageColor} 0%, ${alpha(stageColor, 0.8)} 100%)`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: '80px',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2, mb: 0.5 }}
                      >
                        {stageName}
                      </Typography>

                      {stageInfo.duration && stageInfo.isActive && (
                        <Box sx={{ bgcolor: alpha('#ffffff', 0.2), px: 1.5, py: 0.5, borderRadius: 2, backdropFilter: 'blur(4px)' }}>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            {stageInfo.duration} días activa
                          </Typography>
                        </Box>
                      )}

                      {stageInfo.duration && stageInfo.isCompleted && !stageInfo.isActive && (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium', fontSize: '0.75rem' }}>
                          Duró {stageInfo.duration} días
                        </Typography>
                      )}
                    </Box>

                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha('#ffffff', 0.2),
                        color: '#ffffff',
                        border: `2px solid ${alpha('#ffffff', 0.3)}`,
                      }}
                    >
                      {getStageIcon(stageName, 'medium')}
                    </Avatar>
                  </Box>

                  {/* Contenido */}
                  <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <StatusChip stageInfo={stageInfo} stageColor={stageColor} theme={theme} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        <StageDateBox label="Fecha de inicio" dateStr={stageInfo.startDate} color={stageColor} isActive={false} />
                      </Box>
                      <StageDateBox
                        label="Finalización"
                        dateStr={stageInfo.endDate}
                        color={stageInfo.endDate ? theme.palette.success.main : theme.palette.grey[400]}
                        isActive={stageInfo.isActive}
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PlantStageCards;
