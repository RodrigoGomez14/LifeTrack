import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Button, CircularProgress, alpha, Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { uploadStatementPdf } from '../../services/storage';
import { setCardStatement } from '../../services/finances';
import WizardProgressDots from '../plants/WizardProgressDots';
import WizardFooter from '../plants/WizardFooter';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getUploadErrorMessage(error) {
  if (error.code === 'storage/unauthorized') return 'No tenés permisos para subir el archivo.';
  if (error.code === 'storage/canceled') return 'La subida fue cancelada.';
  if (error.code === 'storage/quota-exceeded') return 'Se excedió la cuota de almacenamiento.';
  if (error.code === 'storage/unknown') return 'Error desconocido. Verificá tu conexión.';
  return error.message || 'Error al subir el archivo.';
}

const TOTAL_STEPS = 2;

const TarjetasUploadWizard = ({
  cardId,
  yearMonth,
  selectedMonth,
  selectedYear,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('El archivo supera el límite de 10MB');
      return;
    }
    setError('');
    setFile(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { downloadURL, storagePath } = await uploadStatementPdf(file, cardId, yearMonth);

      await setCardStatement(cardId, yearMonth, {
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        downloadURL,
        storagePath,
        month: selectedMonth,
        year: selectedYear,
      });

      onSuccess('Resumen subido');
      onClose();
    } catch (err) {

      setError(getUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const periodLabel = `${MONTHS[selectedMonth - 1]} ${selectedYear}`;

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: theme.zIndex.modal + 1, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? (
          <IconButton onClick={() => setStep(0)} size="small"><ArrowBackIcon /></IconButton>
        ) : (
          <Box sx={{ width: 36 }} />
        )}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Subir resumen</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={TOTAL_STEPS} current={step} />

      {step === 0 && (
        <Fade in={step === 0}>
          <Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 4, gap: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                SUBIR RESUMEN PDF
              </Typography>
              <Box
                component="label"
                sx={{
                  width: '100%', maxWidth: 320, minHeight: 180,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 1.5, borderRadius: 3, cursor: 'pointer',
                  border: `2px dashed ${file ? theme.palette.success.main : theme.palette.divider}`,
                  bgcolor: file ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.primary.main, 0.02),
                  transition: '0.15s',
                  '&:hover': { borderColor: theme.palette.primary.main },
                }}
              >
                {file ? (
                  <>
                    <InsertDriveFileIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatSize(file.size)}</Typography>
                  </>
                ) : (
                  <>
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">Tocá para seleccionar un archivo</Typography>
                    <Typography variant="caption" color="text.disabled">Solo PDF · Máximo 10MB</Typography>
                  </>
                )}
                <input type="file" accept="application/pdf" hidden onChange={handleFileSelect} />
              </Box>
              {error && (
                <Typography variant="caption" color="error">{error}</Typography>
              )}
            </Box>
            <Box sx={{ px: 3, pt: 4 }}>
              <Button fullWidth variant="contained" disabled={!file} onClick={() => setStep(1)}
                sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                Siguiente →
              </Button>
            </Box>
          </Box>
        </Fade>
      )}

      {step === 1 && (
        <Fade in={step === 1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, gap: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Confirmar subida</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 280 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Archivo</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', maxWidth: 180 }} noWrap>{file?.name}</Typography>
                </Box>
                <Box sx={{ height: 1, bgcolor: theme.palette.divider }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Tamaño</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatSize(file?.size || 0)}</Typography>
                </Box>
                <Box sx={{ height: 1, bgcolor: theme.palette.divider }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Período</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{periodLabel}</Typography>
                </Box>
              </Box>
              {error && (
                <Typography variant="caption" color="error">{error}</Typography>
              )}
            </Box>
            <WizardFooter
              label="Subir resumen"
              icon={uploading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CheckIcon />}
              loading={uploading}
              disabled={uploading}
              onClick={handleSubmit}
            />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default TarjetasUploadWizard;
