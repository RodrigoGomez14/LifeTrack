import React, { useMemo } from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import BugReportIcon from '@mui/icons-material/BugReport';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import ImageIcon from '@mui/icons-material/Image';
import NoteIcon from '@mui/icons-material/Note';

const ACTIVITY_META = {
  irrigations: { icon: <OpacityIcon fontSize="small" />, label: 'Riego', color: '#2196F3' },
  prunings: { icon: <ContentCutIcon fontSize="small" />, label: 'Poda', color: '#4CAF50' },
  insecticides: { icon: <BugReportIcon fontSize="small" />, label: 'Insecticida', color: '#FF5722' },
  transplants: { icon: <MoveDownIcon fontSize="small" />, label: 'Transplante', color: '#9C27B0' },
  images: { icon: <ImageIcon fontSize="small" />, label: 'Foto', color: '#FF9800' },
  logs: { icon: <NoteIcon fontSize="small" />, label: 'Nota', color: '#607D8B' },
};

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const [d, m, y] = dateStr.split('/').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem`;
  return `${d}/${m}`;
};

const PlantTimelineInline = ({ plant, limit = 5 }) => {
  const activities = useMemo(() => {
    if (!plant) return [];
    const all = [];
    const activityKeys = ['irrigations', 'prunings', 'insecticides', 'transplants', 'images', 'logs'];
    activityKeys.forEach((key) => {
      if (plant[key]) {
        Object.entries(plant[key]).forEach(([id, data]) => {
          if (data.date) all.push({ ...data, _type: key, _id: id });
        });
      }
    });
    all.sort((a, b) => {
      const parse = (d) => { const [dd, mm, yy] = (d || '0/0/0').split('/'); return new Date(+yy, +mm - 1, +dd); };
      return parse(b.date) - parse(a.date);
    });
    return all.slice(0, limit);
  }, [plant]);

  if (activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">Sin actividades registradas</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {activities.map((act, i) => {
        const meta = ACTIVITY_META[act._type] || { icon: <NoteIcon fontSize="small" />, label: 'Actividad', color: '#9E9E9E' };
        const desc = act._type === 'irrigations'
          ? `${act.quantity || 0}ml${act.ph ? ` · pH ${act.ph}` : ''}${act.ec ? ` · EC ${act.ec}` : ''}`
          : act._type === 'prunings' ? act.type || ''
          : act._type === 'insecticides' ? act.treatmentType || ''
          : act._type === 'transplants' ? `${act.previousPot || '?'}L → ${act.newPot || '?'}L`
          : act._type === 'images' ? (act.description || 'Foto')
          : act.description || act.notes || '';

        return (
          <Box key={act._id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(meta.color, 0.12), color: meta.color, fontSize: 16 }}>
              {meta.icon}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                {meta.label}{desc ? ` · ${desc}` : ''}
              </Typography>
              {act.notes && act._type !== 'logs' && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} noWrap>{act.notes}</Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
              {relativeTime(act.date)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default PlantTimelineInline;
