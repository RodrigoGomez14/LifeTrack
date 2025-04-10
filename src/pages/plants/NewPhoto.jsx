import React, { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Divider,
  IconButton,
  Paper,
  Fade,
  Collapse,
  LinearProgress,
  Alert,
  styled
} from "@mui/material";
import { database, auth, storage } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DropZone = styled(Box)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.default, 0.5),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main
  }
}));

const NewPhoto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [photoDate, setPhotoDate] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  
  const plantId = checkSearch(location.search);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    handleSelectedFile(file);
  };
  
  const handleSelectedFile = (file) => {
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida.');
      return;
    }
    
    // Validar tamaño (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }
    
    setError(null);
    setSelectedImage(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Comprimir la imagen antes de subir si es necesario
      let imageToUpload = selectedImage;
      let imageDataUrl = null;
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB max
      
      if (selectedImage.size > maxSizeInBytes) {
        // Crear un canvas para comprimir la imagen
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Cargar la imagen en el objeto Image
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imagePreview;
        });
        
        // Calcular dimensiones manteniendo proporción
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
        
        // Dibujar la imagen redimensionada en el canvas
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Guardar el dataURL para método alternativo
        imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Convertir a Blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.85);
        });
        
        // Crear un nuevo File desde el Blob
        imageToUpload = new File([blob], selectedImage.name, {
          type: 'image/jpeg',
        });
        
        console.log(`Imagen comprimida de ${selectedImage.size} a ${imageToUpload.size} bytes`);
      } else {
        // Si no se comprime, obtener dataURL de la original
        const reader = new FileReader();
        imageDataUrl = await new Promise(resolve => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(selectedImage);
        });
      }
      
      try {
        // MÉTODO 1: Intentar subir a Firebase Storage
        // Crear nombre único para la imagen (sin carpetas)
        const filename = `plant_${Date.now()}_${Math.floor(Math.random() * 10000)}`.replace(/[^\w.-]/g, '_');
        const storageRef = storage.ref(filename); // Subir directamente a la raíz
        
        console.log('Intentando subir a raíz del Storage:', filename);
        console.log('Usuario autenticado:', auth.currentUser ? 'Sí' : 'No');
        console.log('UID de usuario:', auth.currentUser?.uid);
        
        // Imprimir la configuración de Firebase para depuración
        console.log('Firebase configurado con bucket:', storage._delegate._app.options.storageBucket);
        
        // Subir la imagen
        const uploadTask = storageRef.put(imageToUpload);
        
        console.log('Iniciando subida a:', storageRef.fullPath);
        
        // Añadir listener para seguir el progreso real
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progreso de subida: ' + progress.toFixed(2) + '%');
            // Actualizar el progreso entre 10% y 90%
            setUploadProgress(10 + (progress * 0.8)); 
          },
          (error) => {
            console.error('Error durante la subida:', error);
            throw error;
          }
        );
        
        const snapshot = await uploadTask;
        
        // Obtener URL de descarga
        const downloadUrl = await snapshot.ref.getDownloadURL();
        
        // Guardar referencia en la base de datos
        const photoData = {
          date: formatDate(photoDate),
          url: downloadUrl,
          description: description || null,
          timestamp: Date.now()
        };
        
        await database
          .ref(`${auth.currentUser.uid}/plants/active/${plantId}/images`)
          .push(photoData);
        
        // Finalizar con éxito
        setUploadProgress(100);
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          navigate(`/Planta/?${plantId}`);
        }, 800);
        
      } catch (storageError) {
        console.error("Error en Firebase Storage:", storageError);
        console.error("Código de error:", storageError.code);
        console.error("Mensaje completo:", storageError.message);
        
        // Información de diagnóstico
        let errorInfo = "";
        
        if (storageError.code === 'storage/unauthorized') {
          errorInfo = "Problema de permisos. Intenta una de estas soluciones:\n" +
            "1. Usar otra cuenta\n" +
            "2. Verificar reglas de seguridad\n" +
            "3. Contactar al administrador";
          console.error("POSIBLE SOLUCIÓN: Necesitas acceso de escritura al bucket de Firebase Storage.");
        } else if (storageError.code === 'storage/canceled') {
          errorInfo = "La subida fue cancelada.";
        } else if (storageError.code === 'storage/quota-exceeded') {
          errorInfo = "Se ha excedido la cuota de almacenamiento.";
        }
        
        console.log("Intentando método alternativo usando dataURL...");
        
        // MÉTODO 2 (ALTERNATIVO): Guardar directamente el dataURL en la base de datos
        // Nota: Esto puede ser menos eficiente para imágenes grandes
        if (imageDataUrl) {
          console.log("Guardando imagen como dataURL en la base de datos");
          setUploadProgress(60);
          
          const photoData = {
            date: formatDate(photoDate),
            dataUrl: imageDataUrl, // Guardar la imagen como dataURL
            description: description || null,
            timestamp: Date.now(),
            storageFailed: true // Para identificar que no está en Storage
          };
          
          await database
            .ref(`${auth.currentUser.uid}/plants/active/${plantId}/images`)
            .push(photoData);
          
          setUploadProgress(100);
          
          // Redirigir después de un breve retraso
          setTimeout(() => {
            navigate(`/Planta/?${plantId}`);
          }, 800);
          
          return; // Terminar la función si este método fue exitoso
        }
        
        // Si el método alternativo no funciona, lanzar el error original
        throw new Error(`Error al almacenar la imagen: ${storageError.message}\n${errorInfo}`);
      }
      
    } catch (error) {
      console.error("Error completo:", error);
      setError(`Error al subir la imagen: ${error.message || 'Intenta de nuevo'}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout title="Nueva Foto">
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff'
          }}>
            <PhotoCameraIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Añadir Nueva Foto
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {!imagePreview ? (
                <Grid item xs={12}>
                  <DropZone
                    isDragActive={isDragActive}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <AddPhotoAlternateIcon 
                      sx={{ 
                        fontSize: 60, 
                        color: isDragActive ? theme.palette.success.main : alpha(theme.palette.text.secondary, 0.4),
                        mb: 2 
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Arrastra y suelta una imagen
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      o haz clic para seleccionar
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Tamaño máximo: 5MB - Formatos: JPG, PNG, GIF
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        borderColor: theme.palette.success.main,
                        color: theme.palette.success.main,
                        '&:hover': { 
                          borderColor: theme.palette.success.dark,
                          bgcolor: alpha(theme.palette.success.main, 0.05)
                        }
                      }}
                    >
                      Seleccionar Imagen
                      <VisuallyHiddenInput 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </Button>
                  </DropZone>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ 
                    position: 'relative',
                    textAlign: 'center'
                  }}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          display: 'block',
                          margin: '0 auto'
                        }} 
                      />
                      
                      <IconButton
                        aria-label="eliminar imagen"
                        size="small"
                        onClick={handleClearImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: alpha(theme.palette.background.paper, 0.7),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.main
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    INFORMACIÓN
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Fecha de la foto"
                    value={photoDate}
                    onChange={(date) => setPhotoDate(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Descripción (opcional)"
                  placeholder="Ej: Primeras hojas, Crecimiento, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Collapse in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }} 
                    onClose={() => setError(null)}
                    action={
                      <Button 
                        color="error" 
                        size="small" 
                        onClick={() => setError(null)}
                      >
                        Reintentar
                      </Button>
                    }
                  >
                    {error}
                  </Alert>
                </Collapse>
              </Grid>
              
              {uploading && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.success.main,
                          transition: 'transform 0.3s ease'
                        }
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      align="right" 
                      display="block" 
                      sx={{ mt: 0.5 }}
                    >
                      {uploadProgress}%
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/Planta/?${plantId}`)}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleUploadPhoto}
                    disabled={!selectedImage || uploading}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      color: '#ffffff',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                      '&:hover': {
                        bgcolor: theme.palette.secondary.dark,
                        boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`
                      }
                    }}
                  >
                    {uploading ? 'Subiendo...' : 'Subir Foto'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewPhoto; 