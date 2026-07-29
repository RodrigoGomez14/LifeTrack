import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { uploadStatementPdf, getFileUrl } from '../../services/storage';
import { setCardStatement } from '../../services/finances';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getUploadErrorMessage(error) {
  if (error.code === 'storage/unauthorized') return 'No tenés permisos para subir el archivo.';
  if (error.code === 'storage/canceled') return 'La subida fue cancelada.';
  if (error.code === 'storage/quota-exceeded') return 'Se excedió la cuota de almacenamiento.';
  if (error.code === 'storage/unknown') return 'Error desconocido. Verificá tu conexión.';
  return error.message || 'Error al subir el archivo.';
}

const CreditCardStatementUpload = ({
  userData,
  cardId,
  selectedMonth,
  selectedYear,
  onSnack,
}) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  // key para forzar reset del <input type="file"> después de cada upload exitoso
  const [inputKey, setInputKey] = useState(0);

  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const statement = userData?.creditCards?.[cardId]?.statements?.[yearMonth];

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      onSnack('Solo se aceptan archivos PDF', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onSnack('El archivo supera el límite de 10MB', 'error');
      return;
    }

    if (!cardId) {
      onSnack('Tarjeta no seleccionada', 'warning');
      return;
    }

    setUploading(true);
    try {
      const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const { downloadURL, storagePath } = await uploadStatementPdf(file, cardId, yearMonth);

      await setCardStatement(cardId, yearMonth, {
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        downloadURL,
        storagePath,
        month: selectedMonth,
        year: selectedYear,
      });

      onSnack(statement ? 'Resumen reemplazado' : 'Resumen subido', 'success');
      setInputKey((k) => k + 1);
    } catch (error) {

      onSnack(getUploadErrorMessage(error), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    if (!statement) return;
    try {
      if (statement.storagePath) {
        const fresh = await getFileUrl(statement.storagePath);
        window.open(fresh, '_blank');
      } else if (statement.downloadURL) {
        window.open(statement.downloadURL, '_blank');
      }
    } catch (error) {
      if (statement.downloadURL) {
        window.open(statement.downloadURL, '_blank');
      } else {
        onSnack('No se pudo abrir el archivo', 'error');
      }
    }
  };

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1.5 }}
      >
        RESUMEN DEL PERÍODO
      </Typography>

      {statement ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main, width: 44, height: 44 }}>
              <PictureAsPdfIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {statement.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Subido el {new Date(statement.uploadDate).toLocaleDateString('es-AR')}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              fullWidth
              size="small"
              startIcon={<OpenInNewIcon fontSize="small" />}
              onClick={handleView}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': { bgcolor: theme.palette.primary.dark },
              }}
            >
              Ver
            </Button>
            <Button
              fullWidth
              size="small"
              component="label"
              disabled={uploading}
              startIcon={
                uploading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />
              }
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {uploading ? 'Subiendo...' : 'Reemplazar'}
              <input
                key={inputKey}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1.5px dashed ${alpha(theme.palette.divider, 0.7)}`,
            p: 3,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <InsertDriveFileIcon />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Subir resumen PDF
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Solo PDF · Máximo 10MB
          </Typography>
          <Button
            component="label"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <UploadFileIcon />}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 999,
              px: 2.5,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3), color: 'white' },
            }}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
            <input
              key={inputKey}
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
        </Card>
      )}
    </Box>
  );
};

export default CreditCardStatementUpload;
