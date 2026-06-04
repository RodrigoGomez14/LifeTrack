import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CompareIcon from '@mui/icons-material/Compare';

const PlantPhotoCompare = ({ open, onClose, plant, accentColor }) => {
  const theme = useTheme();
  const [selectedIdx, setSelectedIdx] = useState(null); // current single view
  const [compareIdx, setCompareIdx] = useState(null); // second photo for compare
  const [mode, setMode] = useState('grid'); // 'grid' | 'single' | 'compare'

  const photos = useMemo(() => {
    if (!plant?.images) return [];
    return Object.entries(plant.images)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {
        const p = (d) => { const [dd, mm, yy] = (d || '0/0/0').split('/'); return new Date(+yy, +mm - 1, +dd); };
        return p(b.date) - p(a.date);
      });
  }, [plant]);

  if (!open) return null;

  const handleSelect = (idx) => {
    if (mode === 'compare') {
      if (compareIdx === idx) setCompareIdx(null);
      else if (selectedIdx === idx) setSelectedIdx(null);
      else if (selectedIdx === null) setSelectedIdx(idx);
      else if (compareIdx === null) setCompareIdx(idx);
      return;
    }
    setSelectedIdx(idx);
    setMode('single');
  };

  const handleCompare = () => {
    if (selectedIdx !== null) {
      setCompareIdx(selectedIdx === 0 ? Math.min(1, photos.length - 1) : 0);
      setMode('compare');
    }
  };

  const handlePrev = () => {
    if (mode === 'single') setSelectedIdx(Math.max(0, selectedIdx - 1));
  };

  const handleNext = () => {
    if (mode === 'single') setSelectedIdx(Math.min(photos.length - 1, selectedIdx + 1));
  };

  const handleClose = () => {
    setMode('grid');
    setSelectedIdx(null);
    setCompareIdx(null);
    onClose();
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, bgcolor: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1 }}>
        <IconButton onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
          {mode === 'compare' ? 'Comparar' : mode === 'single' ? `${(selectedIdx || 0) + 1} de ${photos.length}` : `${photos.length} fotos`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {mode !== 'grid' && (
            <Chip label="Grilla" onClick={() => { setMode('grid'); setSelectedIdx(null); setCompareIdx(null); }}
              size="small" sx={{ color: '#fff', borderColor: alpha('#fff', 0.3) }} variant="outlined" />
          )}
          <Chip icon={<CompareIcon />} label="Comparar" onClick={handleCompare}
            size="small" sx={{ color: '#fff', borderColor: alpha('#fff', 0.3) }}
            variant="outlined" />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {mode === 'grid' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, p: 1, width: '100%', maxHeight: '100%', overflow: 'auto' }}>
            {photos.map((photo, idx) => (
              <Box key={photo.id} onClick={() => handleSelect(idx)}
                sx={{ aspectRatio: '1', bgcolor: '#1a1a1a', borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer', position: 'relative', border: idx === selectedIdx ? `2px solid ${accentColor || theme.palette.primary.main}` : '2px solid transparent' }}>
                <Box component="img" src={photo.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {photo.description && (
                  <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 4, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 0.75, py: 0.25, borderRadius: 1, fontSize: 10, maxWidth: '90%' }} noWrap>
                    {photo.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {mode === 'single' && selectedIdx !== null && photos[selectedIdx] && (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box component="img" src={photos[selectedIdx].url} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {photos.length > 1 && (
              <>
                <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
                  <NavigateNextIcon />
                </IconButton>
              </>
            )}
          </Box>
        )}

        {mode === 'compare' && (
          <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
            {selectedIdx !== null && photos[selectedIdx] ? (
              <Box sx={{ flex: 1, position: 'relative', borderRight: '2px solid rgba(255,255,255,0.2)' }}>
                <Box component="img" src={photos[selectedIdx].url} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 1, py: 0.25, borderRadius: 1 }}>
                  {photos[selectedIdx].date || 'Sin fecha'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="grey.500">Seleccioná una foto</Typography>
              </Box>
            )}
            {compareIdx !== null && photos[compareIdx] ? (
              <Box sx={{ flex: 1, position: 'relative' }}>
                <Box component="img" src={photos[compareIdx].url} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', px: 1, py: 0.25, borderRadius: 1 }}>
                  {photos[compareIdx].date || 'Sin fecha'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="grey.500">Seleccioná otra foto</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PlantPhotoCompare;
