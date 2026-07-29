import React from 'react';
import { Box, Typography, Card, Avatar, Stack, Divider, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ICONS = {
  irrigation: <WaterDropIcon sx={{ fontSize: 18 }} />,
  pruning: <ContentCutIcon sx={{ fontSize: 18 }} />,
  insecticide: <BugReportIcon sx={{ fontSize: 18 }} />,
  transplant: <SwapHorizIcon sx={{ fontSize: 18 }} />,
  image: <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />,
  default: <ArrowForwardIcon sx={{ fontSize: 18 }} />,
};

const chipSx = { height: 20, fontSize: '0.65rem', fontWeight: 600, borderRadius: 1, px: 1, display: 'inline-flex', alignItems: 'center' };

const buildSubtitle = (event) => {
  const d = event.data;
  if (event.type === 'irrigation') {
    const parts = [];
    if (d.quantity != null && d.quantity > 0) parts.push(`${d.quantity}ml`);
    if (d.ph != null) parts.push(`pH ${d.ph}`);
    if (d.ec != null) parts.push(`EC ${d.ec}`);
    if (d.ppm != null) parts.push(`PPM ${d.ppm}`);
    return parts.join(' · ');
  }
  if (event.type === 'pruning') return d.type || '';
  if (event.type === 'insecticide') return `${d.treatmentType} · ${d.appMethod}`;
  if (event.type === 'transplant') return `${d.previousPot || '?'}L → ${d.newPot || '?'}L`;
  if (event.type === 'image') return d.description || '';
  if (event.type === 'stageChange') return d.stage || '';
  return '';
};

const PlantDayActivityCard = ({ activities }) => {
  const theme = useTheme();
  if (!activities || activities.length === 0) return null;

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
      <Stack divider={<Divider />}>
        {activities.map((event, idx) => {
          const d = event.data;
          const isIrrigation = event.type === 'irrigation';
          const isInsecticide = event.type === 'insecticide';
          const isImage = event.type === 'image';
          const subtitle = buildSubtitle(event);

          return (
            <Box key={idx} sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(event.color, 0.15), color: event.color, flexShrink: 0 }}>
                {ICONS[event.type] || ICONS.default}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {event.label}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.2 }}>
                    {subtitle}
                  </Typography>
                )}

                {isIrrigation && d.aditives && d.aditives.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {d.aditives.map((ad, ai) => (
                      <Box key={ai} sx={{ ...chipSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}>
                        {ad.name} {ad.dosis}
                      </Box>
                    ))}
                  </Box>
                )}

                {isIrrigation && d.nutrients && d.nutrients.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {d.nutrients.map((n, ni) => (
                      <Box key={ni} sx={{ ...chipSx, bgcolor: alpha('#00BCD4', 0.1), color: '#00BCD4' }}>
                        {n.name} {n.quantity}ml
                      </Box>
                    ))}
                  </Box>
                )}

                {isInsecticide && d.insecticides && d.insecticides.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {d.insecticides.map((ins, ii) => (
                      <Box key={ii} sx={{ ...chipSx, bgcolor: alpha('#FF5722', 0.1), color: '#FF5722' }}>
                        {ins.name} {ins.dosis}
                      </Box>
                    ))}
                  </Box>
                )}

                {isImage && d.url && (
                  <Box component="img" src={d.url} sx={{ width: '100%', maxWidth: 160, maxHeight: 120, borderRadius: 2, objectFit: 'cover', mt: 0.5 }} />
                )}

                {d.notes && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                    {d.notes}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
};

export default PlantDayActivityCard;
