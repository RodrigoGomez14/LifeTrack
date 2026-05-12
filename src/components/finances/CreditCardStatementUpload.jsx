import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Link,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { auth, storage } from '../../firebase';
import { setCardStatement } from '../../services/finances';
import { getMonthName } from '../../utils';

// Mapea código de error de Firebase Storage a un mensaje en español.
function getUploadErrorMessage(error) {
  if (error.code === 'storage/unauthorized') {
    return 'Esta función requiere configuración adicional. Por favor, contacta al administrador.';
  }
  let msg = 'Error al subir el archivo. ';
  if (error.code === 'storage/canceled') msg += 'La subida fue cancelada.';
  else if (error.code === 'storage/unknown') msg += 'Ocurrió un error desconocido. Verifica tu conexión a internet.';
  else if (error.code === 'storage/quota-exceeded') msg += 'Se ha excedido la cuota de almacenamiento permitida.';
  else msg += error.message || 'Inténtalo de nuevo.';
  return msg;
}

const CreditCardStatementUpload = ({
  userData,
  selectedCard,
  selectedMonth,
  selectedYear,
  cards,
  showAlert,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const statement = userData?.creditCards?.[selectedCard]?.statements?.[yearMonth];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showAlert('Por favor selecciona un archivo PDF', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const ensureCardSelected = () => {
    if (!selectedCard || !cards.find((c) => c.id === selectedCard)) {
      showAlert('Por favor, selecciona una tarjeta primero', 'warning');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCard) return;
    setUploading(true);
    try {
      if (!auth.currentUser) throw new Error('Usuario no autenticado');

      const fileName = `${yearMonth}_${selectedCard}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const storagePath = `statements/${auth.currentUser.uid}/${selectedCard}/${yearMonth}/${fileName}`;
      const storageRef = storage.ref(storagePath);

      await storageRef.put(selectedFile, {
        contentType: 'application/pdf',
        customMetadata: {
          userId: auth.currentUser.uid,
          cardId: selectedCard,
          yearMonth,
          month: String(selectedMonth),
          year: String(selectedYear),
        },
      });

      const downloadURL = await storageRef.getDownloadURL();
      const statementData = {
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        downloadURL,
        storagePath,
        month: selectedMonth,
        year: selectedYear,
      };

      await setCardStatement(selectedCard, yearMonth, statementData);
      showAlert('Resumen subido correctamente', 'success');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir el resumen:', error);
      showAlert(getUploadErrorMessage(error), error.code === 'storage/unauthorized' ? 'warning' : 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (stmt) => {
    if (!stmt || !stmt.downloadURL) {
      showAlert('No se encuentra el archivo para descargar', 'error');
      return;
    }
    try {
      // Si guardamos el storagePath, pedimos URL fresca con token actualizado.
      // Si no, caemos al downloadURL antiguo guardado en la base.
      if (stmt.storagePath) {
        const freshURL = await storage.ref(stmt.storagePath).getDownloadURL();
        window.open(freshURL, '_blank');
      } else {
        window.open(stmt.downloadURL, '_blank');
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      const isAuthOrMissing =
        error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found';
      if (isAuthOrMissing && stmt.downloadURL) {
        window.open(stmt.downloadURL, '_blank');
      } else {
        showAlert('Error al descargar el archivo. Intenta nuevamente más tarde.', 'error');
      }
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-2px)' },
          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
            }}
          >
            <ReceiptIcon />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" color="white">
              Resumen del Mes
            </Typography>
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Estado de cuenta y documentos
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {statement ? (
          <Card elevation={1} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 48, height: 48 }}>
                    <PictureAsPdfIcon color="error" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {statement.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subido el {new Date(statement.uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(statement)}
                    sx={{ borderRadius: 2 }}
                  >
                    Descargar
                  </Button>

                  <Button
                    variant="outlined"
                    endIcon={<ArrowRightAltIcon />}
                    component={Link}
                    href={statement.downloadURL}
                    target="_blank"
                    sx={{ borderRadius: 2 }}
                  >
                    Ver
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card
            elevation={1}
            sx={{
              borderRadius: 2,
              border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {uploading ? (
                <Box>
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Subiendo archivo...
                  </Typography>
                </Box>
              ) : selectedFile ? (
                <Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    <PictureAsPdfIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" onClick={() => setSelectedFile(null)}>
                      Cambiar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      Subir Resumen
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="pdf-file-input"
                    onChange={(e) => {
                      if (ensureCardSelected()) handleFileChange(e);
                    }}
                  />

                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    <InsertDriveFileIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                  </Avatar>

                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No hay resumen disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sube el resumen de tu tarjeta para {getMonthName(selectedMonth)} {selectedYear}
                  </Typography>

                  <label htmlFor="pdf-file-input">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadFileIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Seleccionar PDF
                    </Button>
                  </label>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Solo archivos PDF • Máximo 10MB
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditCardStatementUpload;
