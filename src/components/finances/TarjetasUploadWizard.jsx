import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Button, alpha, Fade, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { uploadStatementPdf } from '../../services/storage';
import { setCardStatement, setCardDatesForMonth } from '../../services/finances';
import { parseFlexibleDate } from './creditCardsHelpers';
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

// Wizard de subida del resumen:
//   0 → elegir y subir el PDF del período actual.
//   1 → setear las fechas del período SIGUIENTE (vienen en el resumen). Este paso
//       SOLO existe si esas fechas todavía no están cargadas (si ya lo están, no hay
//       nada que setear y el wizard se resuelve en un paso).
// Todo se persiste al final; el paso de fechas se puede omitir.
const TarjetasUploadWizard = ({
  cardId,
  yearMonth,
  selectedMonth,
  selectedYear,
  nextMonthKey,
  nextPeriodLabel,
  prefillClosingDate,
  prefillDueDate,
  nextDatesLocked,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  const totalSteps = nextDatesLocked ? 1 : 2;

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [closingDate, setClosingDate] = useState(prefillClosingDate || '');
  const [dueDate, setDueDate] = useState(prefillDueDate || '');

  // El popover del calendario se porta a <body> y por defecto queda detrás del overlay
  // de este wizard (zIndex.modal + 1). Lo subimos para que se vea y reciba los clicks.
  const pickerSlotProps = {
    popper: { sx: { zIndex: theme.zIndex.modal + 2 } },
    textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } },
  };

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

  // El vencimiento no puede ser anterior al cierre.
  const shouldDisableDueDate = (d) => {
    if (!closingDate) return false;
    const closing = parseFlexibleDate(closingDate);
    return !!(closing && d.toDate() < closing);
  };

  const handleSubmit = async (skipDates = false) => {
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

      if (!skipDates && closingDate && dueDate && nextMonthKey) {
        await setCardDatesForMonth(cardId, nextMonthKey, { closingDate, dueDate });
      }

      onSuccess('Resumen subido');
      onClose();
    } catch (err) {
      setError(getUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

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

      <WizardProgressDots total={totalSteps} current={step} />

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
              {nextDatesLocked ? (
                <Button fullWidth variant="contained" disabled={!file || uploading} onClick={() => handleSubmit(true)}
                  sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                  {uploading ? 'Subiendo...' : 'Subir resumen'}
                </Button>
              ) : (
                <Button fullWidth variant="contained" disabled={!file} onClick={() => { setError(''); setStep(1); }}
                  sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}>
                  Siguiente →
                </Button>
              )}
            </Box>
          </Box>
        </Fade>
      )}

      {step === 1 && !nextDatesLocked && (
        <Fade in={step === 1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pt: 3, gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Fechas del próximo período</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: -1 }}>
                {nextPeriodLabel
                  ? `El resumen trae las fechas de ${nextPeriodLabel}.`
                  : 'Cargá las fechas del próximo período.'}
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Fecha de cierre</Typography>
                    <DatePicker
                      value={closingDate ? dayjs(closingDate) : null}
                      onChange={(d) => { if (d) { setClosingDate(d.format('YYYY-MM-DD')); setError(''); } }}
                      format="DD/MM/YYYY"
                      slotProps={pickerSlotProps}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Fecha de vencimiento</Typography>
                    <DatePicker
                      value={dueDate ? dayjs(dueDate) : null}
                      onChange={(d) => { if (d) { setDueDate(d.format('YYYY-MM-DD')); setError(''); } }}
                      format="DD/MM/YYYY"
                      shouldDisableDate={shouldDisableDueDate}
                      slotProps={pickerSlotProps}
                    />
                  </Box>
                </Stack>
              </LocalizationProvider>

              {(!closingDate || !dueDate) && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Podés completar ambas fechas o subir el resumen sin fechas.
                </Typography>
              )}

              {error && (
                <Typography variant="caption" color="error">{error}</Typography>
              )}
            </Box>

            <Box sx={{ px: 3, pb: 0.5 }}>
              <Button
                fullWidth
                disabled={uploading}
                onClick={() => handleSubmit(true)}
                sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
              >
                Omitir fechas y subir
              </Button>
            </Box>

            <WizardFooter
              label="Guardar resumen"
              loading={uploading}
              disabled={uploading}
              onClick={() => handleSubmit(false)}
            />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default TarjetasUploadWizard;
