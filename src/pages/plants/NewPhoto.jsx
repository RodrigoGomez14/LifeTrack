import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, TextField, Card, CardContent,
  Snackbar, Alert, alpha, Chip, CircularProgress, LinearProgress, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { uploadPlantImage } from '../../services/storage';
import { addPlantActivity } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import { useStore } from '../../store';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getBaseName } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedSuccess } from '../../design-system';

const MAX_IMAGES = 10;
const STEPS_TOTAL = 4;

let heic2any;
try { heic2any = require('heic2any'); } catch (e) {}

const formatDate = (date) => {
  if (!date) return getDate();
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const compressImage = async (file, preview) => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  await new Promise((resolve) => { img.onload = resolve; img.src = preview; });
  let width = img.width;
  let height = img.height;
  const maxDimension = 1200;
  if (width > height && width > maxDimension) {
    height = Math.round((height * maxDimension) / width);
    width = maxDimension;
  } else if (height > maxDimension) {
    width = Math.round((width * maxDimension) / height);
    height = maxDimension;
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  const newName = ['heic', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)
    ? file.name.replace(new RegExp(`\\.${ext}$`, 'i'), '.webp')
    : `${file.name}.webp`;
  return new File([blob], newName, { type: 'image/webp' });
};

const convertHeicToJpeg = async (file) => {
  if (!file.name.toLowerCase().endsWith('.heic') && !file.type.toLowerCase().includes('heic')) return file;
  try {
    if (!heic2any) heic2any = (await import('heic2any')).default;
    const webpBlob = await heic2any({ blob: file, toType: 'image/webp', quality: 0.9 });
    return new File([webpBlob], file.name.replace(/\.heic$/i, '.webp'), { type: 'image/webp' });
  } catch { return file; }
};

const NewPhoto = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();
  const fileInputRef = useRef(null);

  const plantId = checkSearch(location.search);

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [photoDate, setPhotoDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const filteredPlants = useMemo(() => {
    if (selectedPlantIds.size === 0) return activePlants;
    const firstId = [...selectedPlantIds][0];
    const base = getBaseName(activePlants.find((p) => p.id === firstId)?.name);
    if (!base) return activePlants;
    return activePlants.filter((p) => getBaseName(p.name) === base);
  }, [selectedPlantIds, activePlants]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS_TOTAL - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImageChange = async (files) => {
    if (isProcessingFile) return;
    setIsProcessingFile(true);
    setError(null);

    const fileArray = Array.from(files).slice(0, MAX_IMAGES - selectedImages.length);
    const newImages = [];
    const newPreviews = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) continue;
      if (file.size > 10 * 1024 * 1024) { setError('Una imagen supera los 10MB'); continue; }
      try {
        let processedFile = file;
        if (file.name.toLowerCase().endsWith('.heic') || file.type.toLowerCase().includes('heic')) {
          processedFile = await convertHeicToJpeg(file);
        }
        const previewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(processedFile);
        });
        newImages.push(processedFile);
        newPreviews.push(previewUrl);
      } catch {}
    }

    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    setTimeout(() => setIsProcessingFile(false), 300);
  };

  const handleRemoveImage = (idx) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) handleImageChange(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0 || selectedPlantIds.size === 0) return;
    setUploading(true);
    setUploadProgress({ current: 0, total: selectedImages.length, percent: 0 });

    try {
      const dateStr = formatDate(photoDate);
      const formattedDate = dateStr.replace(/\//g, '-');
      let successCount = 0;

      for (let i = 0; i < selectedImages.length; i++) {
        try {
          const compressed = await compressImage(selectedImages[i], imagePreviews[i]);
          for (const currentPlantId of selectedPlantIds) {
            const filename = `${formattedDate}_${Date.now()}_${Math.floor(Math.random() * 10000)}_${i}_${currentPlantId}`.replace(/[^\w.-]/g, '_');
            const { downloadURL, storagePath } = await uploadPlantImage(compressed, currentPlantId, filename);
            await addPlantActivity(currentPlantId, 'images', {
              date: dateStr,
              url: downloadURL,
              description: description || null,
              timestamp: Date.now() + i,
              storagePath,
            });
          }
          successCount++;
        } catch {}
        setUploadProgress({ current: i + 1, total: selectedImages.length, percent: Math.round(((i + 1) / selectedImages.length) * 100) });
      }

      setSavedSnapshot({ count: successCount, photoDate, description, plantCount: selectedPlantIds.size, singlePlantId: selectedPlantIds.size === 1 ? Array.from(selectedPlantIds)[0] : null });
    } catch (e) {

      setSnack('Error al subir');
    }
    setUploading(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedImages([]);
    setImagePreviews([]);
    setPhotoDate(new Date());
    setDescription('');
    setSavedSnapshot(null);
  };

  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));
  const canSubmit = selectedImages.length > 0 && selectedPlantIds.size > 0;

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const COLOR = '#FF9800';
    return (
      <AnimatedSuccess color={COLOR} title="¡Fotos subidas!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'} · {n.count} foto{n.count !== 1 ? 's' : ''}
        </Typography>
        {n.description && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.description}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#f57c00' }, mt: n.description ? 0 : 3 }}>
          Subir más
        </Button>
        <Button onClick={() => { if (n.singlePlantId) navigate(`/Planta/?${n.singlePlantId}`); else navigate('/plantas'); }} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? renderSuccess() : (
        <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton>
) : (
            <Box sx={{ width: 36 }} />
          )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Nueva foto</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS_TOTAL} current={step} color="#FF9800" />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Step 0: Plant multi-select */}
        {step === 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography>
            <PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color="#FF9800" />
          </Box>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
              FOTOS ({selectedImages.length}/{MAX_IMAGES})
            </Typography>

            {selectedImages.length < MAX_IMAGES && (
              <Box
                onClick={() => { if (!isProcessingFile) fileInputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                sx={{
                  border: `2px dashed ${isDragActive ? '#FF9800' : theme.palette.divider}`,
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? alpha('#FF9800', 0.04) : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#FF9800', bgcolor: alpha('#FF9800', 0.04) },
                }}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 48, color: isDragActive ? '#FF9800' : 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Arrastrá y soltá imágenes o tocá para seleccionar
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Máx. 10MB · JPG, PNG, HEIC
                </Typography>
              </Box>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.HEIC"
              multiple
              onChange={(e) => { if (e.target.files?.length) handleImageChange(e.target.files); e.target.value = ''; }}
              style={{ display: 'none' }}
            />

            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            {imagePreviews.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {imagePreviews.map((preview, idx) => (
                  <Box key={idx} sx={{ position: 'relative', aspectRatio: '1', borderRadius: 2, overflow: 'hidden' }}>
                    <Box component="img" src={preview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(idx)}
                      sx={{ position: 'absolute', top: 4, right: 4, bgcolor: alpha('#fff', 0.85), width: 24, height: 24,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15), color: 'error.main' } }}>
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>FECHA</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de las fotos"
                value={photoDate}
                onChange={(date) => setPhotoDate(date)}
                slotProps={{ textField: { fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
              />
            </LocalizationProvider>
            <TextField label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3}
              placeholder="Ej: Primeras hojas, Crecimiento, Floración..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        )}

        {/* Step 3: Review + Upload */}
        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>

            {selectedPlants.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedPlants.map((p) => (
                  <Chip key={p.id} label={p.name} size="small"
                    sx={{ bgcolor: alpha('#FF9800', 0.1), color: '#FF9800', fontWeight: 600 }} />
                ))}
              </Box>
            )}

            {/* Preview thumbnails */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {imagePreviews.slice(0, 8).map((preview, idx) => (
                <Box key={idx} sx={{ aspectRatio: '1', borderRadius: 2, overflow: 'hidden' }}>
                  <Box component="img" src={preview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
            {imagePreviews.length > 8 && (
              <Typography variant="caption" color="text.secondary" textAlign="center">
                +{imagePreviews.length - 8} fotos más
              </Typography>
            )}

            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Fotos</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedImages.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                <Box sx={{ maxWidth: 160 }}>
                  <DatePicker
                    value={photoDate}
                    onChange={(date) => setPhotoDate(date)}
                    slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                <Typography variant="body2" color="text.secondary">Plantas</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlantIds.size}</Typography>
              </Box>
            </Box>

            {uploading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <LinearProgress variant="determinate" value={uploadProgress.percent}
                  sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#FF9800', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#FF9800' } }} />
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {uploadProgress.current} de {uploadProgress.total} fotos
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {step < STEPS_TOTAL - 1 ? (
        <WizardFooter
          label="Siguiente →"
          disabled={step === 0 ? selectedPlantIds.size === 0 : step === 1 ? selectedImages.length === 0 : false}
          onClick={goNext}
          color="#FF9800"
        />
      ) : (
        <WizardFooter
          label={`Subir ${selectedImages.length} foto${selectedImages.length !== 1 ? 's' : ''}`}
          disabled={!canSubmit}
          onClick={handleSubmit}
          loading={uploading}
          color="#FF9800"
        />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
          </>
        )}
    </Box>
  );
};

export default NewPhoto;
