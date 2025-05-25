import React, { useState, useRef, useEffect } from "react";
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
  IconButton,
  Paper,
  Fade,
  Collapse,
  Alert,
  styled,
  Stack,
  CircularProgress,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Container,
  CardHeader
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
import CollectionsIcon from '@mui/icons-material/Collections';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';

// Variables globales para estado y progreso
let IS_UPLOADING = false;
let UPLOAD_PROGRESS = {
  current: 0,
  total: 0,
  percentComplete: 0,
  isComplete: false
};

// Librería para convertir HEIC a JPEG (importación condicional)
let heic2any;
try {
  heic2any = require('heic2any');
} catch (e) {
}

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
  },
  position: 'relative'
}));

// Componente de diálogo global creado con document.createElement para evitar re-renderizados
let uploadDialogContainer = null;
let dialogMountedPromise = null;
let dialogMountedResolver = null;

const createGlobalDialog = (theme) => {
  // Crear promesa para seguimiento de montaje
  dialogMountedPromise = new Promise(resolve => {
    dialogMountedResolver = resolve;
  });

  if (!uploadDialogContainer) {
    uploadDialogContainer = document.createElement('div');
    uploadDialogContainer.className = 'upload-dialog-container';
    uploadDialogContainer.setAttribute('role', 'dialog');
    uploadDialogContainer.setAttribute('aria-modal', 'true');
    uploadDialogContainer.setAttribute('aria-labelledby', 'upload-dialog-title');
    document.body.appendChild(uploadDialogContainer);
    
    // Crear un requestAnimationFrame separado para actualizar el diálogo
    // esto evita que las actualizaciones del diálogo afecten al rendering de React
    let rafId = null;
    let lastProgress = {};
    
    // Función para actualizar el diálogo
    window.updateUploadDialog = (isOpen, progress = UPLOAD_PROGRESS) => {
      if (!uploadDialogContainer) return;
      
      // Cancelar cualquier raf anterior para evitar actualizaciones duplicadas
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      // Solo actualizar el DOM cuando realmente hay cambios
      if (isOpen) {
        if (uploadDialogContainer.style.display !== 'block') {
          uploadDialogContainer.style.display = 'block';
        }
        
        // Solo actualizar el contenido si hay cambios en el progreso
        if (
          progress.current !== lastProgress.current ||
          progress.total !== lastProgress.total ||
          progress.percentComplete !== lastProgress.percentComplete ||
          progress.isComplete !== lastProgress.isComplete
        ) {
          // Programar la actualización del DOM para el próximo frame
          rafId = requestAnimationFrame(() => {
            lastProgress = { ...progress };
            
            // Usar innerHTML solo para la primera renderización, luego actualizar solo partes específicas
            if (!uploadDialogContainer.firstChild) {
              createDialogContent(progress);
              // Notificar que el diálogo está listo
              dialogMountedResolver();
            } else {
              // Actualizar solo lo necesario
              updateDialogProgress(progress);
            }
          });
        }
      } else {
        uploadDialogContainer.style.display = 'none';
      }
    };
    
    // Crear el contenido completo del diálogo
    const createDialogContent = (progress) => {
      uploadDialogContainer.innerHTML = `
        <div class="upload-dialog" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;">
          <div class="dialog-content" style="
            width: 100%;
            max-width: 480px;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;">
            <div class="dialog-header" style="
              padding: 24px;
              background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
              color: white;
              text-align: center;">
              <h3 id="upload-dialog-title" style="
                margin: 0; 
                font-weight: 600; 
                font-size: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Subiendo Imágenes
              </h3>
            </div>
            <div class="dialog-body" style="
              padding: 32px 24px; 
              text-align: center;
              background: white;">
              <div class="spinner-container" style="
                margin-bottom: 24px;
                display: flex;
                justify-content: center;">
                <div class="spinner" style="
                  height: 60px;
                  width: 60px;
                  border: 4px solid #e3f2fd;
                  border-top: 4px solid #1976d2;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;">
                </div>
              </div>
              <h4 id="upload-status" style="
                margin: 0 0 16px 0; 
                font-size: 18px; 
                color: #1a1a1a;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${progress.isComplete ? 'Subida Completada' : 'Subiendo imágenes...'}
              </h4>
              <div id="progress-count" style="
                font-size: 14px; 
                color: #666; 
                margin-bottom: 20px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Progreso: ${progress.current} de ${progress.total} imágenes
              </div>
              
              <div class="progress-bar-container" style="
                width: 100%;
                height: 8px;
                background-color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 16px;">
                <div id="progress-bar" style="
                  width: ${progress.percentComplete}%;
                  height: 100%;
                  background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
                  border-radius: 4px;
                  transition: width 0.3s ease-in-out;">
                </div>
              </div>
              
              <div id="progress-percent" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
                color: #666;
                font-size: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <span>0%</span>
                <span style="font-weight: 600; color: #1976d2;">${progress.percentComplete}%</span>
                <span>100%</span>
              </div>
              
              <div class="warning-box" style="
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border: 1px solid #ffb74d;
                border-radius: 8px;
                padding: 16px;
                text-align: left;
                margin-bottom: 16px;">
                <div style="
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;">
                  <span style="
                    color: #f57c00;
                    font-size: 18px;
                    margin-right: 8px;">⚠️</span>
                  <span style="
                    font-weight: 600;
                    color: #e65100;
                    font-size: 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Importante
                  </span>
                </div>
                <p style="
                  margin: 0; 
                  font-size: 13px; 
                  color: #bf360c;
                  line-height: 1.4;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Por favor espera mientras se suben las imágenes.<br>
                  <strong>No cierres ni recargues esta página.</strong>
                </p>
              </div>
              
              ${progress.isComplete ? `
                <div class="success-message" style="
                  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
                  border: 1px solid #4caf50;
                  border-radius: 8px;
                  padding: 16px;
                  text-align: center;">
                  <span style="color: #2e7d32; font-size: 18px; margin-right: 8px;">✅</span>
                  <span style="
                    color: #1b5e20;
                    font-weight: 600;
                    font-size: 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ¡Todas las imágenes se subieron correctamente!
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .upload-dialog * {
            box-sizing: border-box;
          }
        </style>
      `;
    };
    
    // Actualizar sólo partes específicas del diálogo
    const updateDialogProgress = (progress) => {
      // Solo actualizar lo que cambia
      const statusEl = uploadDialogContainer.querySelector('#upload-status');
      const countEl = uploadDialogContainer.querySelector('#progress-count');
      const barEl = uploadDialogContainer.querySelector('#progress-bar');
      const percentEl = uploadDialogContainer.querySelector('#progress-percent');
      const dialogBodyEl = uploadDialogContainer.querySelector('.dialog-body');
      
      if (statusEl) {
        statusEl.textContent = progress.isComplete ? 'Subida Completada' : 'Subiendo imágenes...';
      }
      
      if (countEl) {
        countEl.textContent = `Progreso: ${progress.current} de ${progress.total} imágenes`;
      }
      
      if (barEl) {
        barEl.style.width = `${progress.percentComplete}%`;
      }
      
      if (percentEl) {
        const percentValueEl = percentEl.querySelector('span:nth-child(2)');
        if (percentValueEl) {
          percentValueEl.textContent = `${progress.percentComplete}%`;
        }
      }
      
      // Agregar mensaje de éxito cuando se complete
      if (progress.isComplete && dialogBodyEl) {
        let successMessage = dialogBodyEl.querySelector('.success-message');
        if (!successMessage) {
          const successHTML = `
            <div class="success-message" style="
              background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
              border: 1px solid #4caf50;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              margin-top: 16px;
              animation: slideIn 0.3s ease-out;">
              <span style="color: #2e7d32; font-size: 18px; margin-right: 8px;">✅</span>
              <span style="
                color: #1b5e20;
                font-weight: 600;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ¡Todas las imágenes se subieron correctamente!
              </span>
            </div>
          `;
          dialogBodyEl.insertAdjacentHTML('beforeend', successHTML);
        }
      }
    };
  }
  
  // Actualizar estado inicial
  window.updateUploadDialog(IS_UPLOADING, UPLOAD_PROGRESS);
};

const NewPhoto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fileInputRef = useRef(null);
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [description, setDescription] = useState("");
  const [photoDate, setPhotoDate] = useState(new Date());
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [heic2anyLoaded, setHeic2anyLoaded] = useState(false);
  
  const plantId = checkSearch(location.search);
  const MAX_IMAGES = 10;
  
  // Crear el diálogo global una vez cuando el componente se monta
  useEffect(() => {
    createGlobalDialog(theme);
    
    // Limpiar cuando el componente se desmonta
    return () => {
      if (uploadDialogContainer && !IS_UPLOADING) {
        document.body.removeChild(uploadDialogContainer);
        uploadDialogContainer = null;
      }
    };
  }, []);

  // Cargar heic2any dinámicamente si es necesario
  useEffect(() => {
    if (!heic2any) {
      import('heic2any')
        .then(module => {
          heic2any = module.default;
          setHeic2anyLoaded(true);
        })
        .catch(err => {
          console.error("No se pudo cargar heic2any:", err);
        });
    } else {
      setHeic2anyLoaded(true);
    }
  }, []);

  // Función para convertir archivo HEIC a JPEG
  const convertHeicToJpeg = async (file) => {
    if (!file.name.toLowerCase().endsWith('.heic') && 
        !file.type.toLowerCase().includes('heic')) {
      return file; // No es un archivo HEIC, devolver sin cambios
    }

    try {
      // Asegurarse de que el conversor esté disponible
      if (!heic2any) {
        if (!heic2anyLoaded) {
          heic2any = (await import('heic2any')).default;
          setHeic2anyLoaded(true);
        }
      }

      if (!heic2any) {
        throw new Error("No se pudo cargar el conversor HEIC");
      }

      const jpegBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      });

      // Crear un nuevo archivo con extensión jpeg
      return new File([jpegBlob], 
        file.name.replace(/\.heic$/i, '.jpg'), 
        { type: 'image/jpeg' }
      );
    } catch (error) {
      console.error("Error al convertir HEIC a JPEG:", error);
      throw new Error("No se pudo convertir la imagen HEIC. " + error.message);
    }
  };

  const handleImageChange = async (event) => {
    // Prevenir procesamiento múltiple
    if (isProcessingFile) {
      event.preventDefault();
      return;
    }
    
    try {
      // Detener procesamiento si no hay archivos (el usuario canceló)
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (files.length === 0) {
        // No mostrar error en cancelación
        return;
      }
      
      // Establecer procesamiento ANTES de comenzar
      setIsProcessingFile(true);
      
      // Resetear el input inmediatamente para evitar problemas de re-selección
      if (fileInputRef.current) {
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 100); // Pequeño delay para evitar problemas
      }
      
      setError(null); // Limpiar errores previos
      
      const totalFilesToProcess = Math.min(files.length, MAX_IMAGES - selectedImages.length);
      let processedFiles = 0;
      const newImages = [];
      const newPreviews = [];
      
      for (let i = 0; i < totalFilesToProcess; i++) {
        const file = files[i];
        try {
          // Comprobar si es un tipo de imagen válido (incluyendo HEIC)
          const isValidType = file.type.startsWith('image/') || 
                             file.name.toLowerCase().endsWith('.heic');
          
          if (!isValidType) {
            processedFiles++;
            continue;
          }
          
          // Comprobar tamaño
          if (file.size > 10 * 1024 * 1024) { // 10MB max
            setError('Una o más imágenes son demasiado grandes. El tamaño máximo es 10MB.');
            processedFiles++;
            continue;
          }
          
          // Convertir HEIC si es necesario
          let processedFile = file;
          if (file.name.toLowerCase().endsWith('.heic') || 
              file.type.toLowerCase().includes('heic')) {
            try {
              processedFile = await convertHeicToJpeg(file);
            } catch (convError) {
              console.error("Error convertir HEIC:", convError);
              // Continuar con el archivo original si falla la conversión
            }
          }
          
          // Leer el archivo como URL de datos
          const reader = new FileReader();
          const previewUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(processedFile);
          });
          
          newImages.push(processedFile);
          newPreviews.push(previewUrl);
        } catch (err) {
          console.error("Error al procesar archivo:", err);
        }
        
        processedFiles++;
      }
      
      if (newImages.length > 0) {
        setSelectedImages(prev => [...prev, ...newImages]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
    } catch (error) {
      console.error("Error al procesar imágenes:", error);
    } finally {
      // Asegurarse de que siempre se desactiva el estado de procesamiento
      setTimeout(() => {
        setIsProcessingFile(false);
      }, 300); // Pequeño delay para evitar aperturas repetidas
    }
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
    e.stopPropagation();
    setIsDragActive(false);
    
    if (isProcessingFile) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const event = { target: { files: e.dataTransfer.files } };
      handleImageChange(event);
    }
  };
  
  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const formatDate = (date) => {
    if (!date) return getDate();
    
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const compressImage = async (file, preview) => {
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB max
    
    if (file.size <= maxSizeInBytes) {
      const reader = new FileReader();
      const imageDataUrl = await new Promise(resolve => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      return { file, imageDataUrl };
    }
    
    // Compress the image
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = preview;
    });
    
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
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85);
    });
    
    const compressedFile = new File([blob], file.name, {
      type: 'image/jpeg',
    });
    
    return { file: compressedFile, imageDataUrl };
  };

  // Función optimizada para no causar refrescos
  const uploadSingleImage = async (file, preview, index, totalImages) => {
    try {
      // First compress the image
      const { file: imageToUpload, imageDataUrl } = await compressImage(file, preview);
      
      try {
        // Create a structured path for the image
        const userId = auth.currentUser.uid;
        const formattedDate = formatDate(photoDate).replace(/\//g, '-');
        const filename = `${formattedDate}_${Date.now()}_${Math.floor(Math.random() * 10000) + index}`.replace(/[^\w.-]/g, '_');
        
        // Create a structured storage path: users/{userId}/plants/{plantId}/images/{filename}
        const storagePath = `users/${userId}/plants/${plantId}/images/${filename}`;
        const storageRef = storage.ref(storagePath);
        
        const uploadTask = storageRef.put(imageToUpload);
        
        // Upload without progress tracking
        await uploadTask;
        
        const snapshot = await uploadTask;
        const downloadUrl = await snapshot.ref.getDownloadURL();
        
        const photoData = {
          date: formatDate(photoDate),
          url: downloadUrl,
          description: description || null,
          timestamp: Date.now() + index,
          storagePath: storagePath // Store the storage path for future reference
        };
        
        await database
          .ref(`${auth.currentUser.uid}/plants/active/${plantId}/images`)
          .push(photoData);
        
        // Actualizar el progreso después de cada imagen exitosa
        UPLOAD_PROGRESS.current = index + 1;
        UPLOAD_PROGRESS.percentComplete = Math.round((UPLOAD_PROGRESS.current / totalImages) * 100);
        // Actualizar el diálogo sin causar refrescos en React
        window.updateUploadDialog(true, UPLOAD_PROGRESS);
        
        return true;
      } catch (storageError) {
        console.error(`Error en imagen ${index+1}:`, storageError);
        return false;
      }
    } catch (error) {
      console.error(`Error en proceso completo de imagen ${index+1}:`, error);
      return false;
    }
  };

  const handleUploadPhotos = async () => {
    if (selectedImages.length === 0) return;
    
    // Inicializar progreso
    UPLOAD_PROGRESS = {
      current: 0,
      total: selectedImages.length,
      percentComplete: 0,
      isComplete: false
    };
    
    // Set global flag to true and show dialog
    IS_UPLOADING = true;
    window.updateUploadDialog(true, UPLOAD_PROGRESS);
    
    // Asegurar que el diálogo esté montado antes de continuar
    if (dialogMountedPromise) {
      await dialogMountedPromise;
    }
    
    try {
      const totalImages = selectedImages.length;
      let successCount = 0;
      
      // Proceso optimizado para evitar refrescos
      for (let i = 0; i < totalImages; i++) {
        const success = await uploadSingleImage(selectedImages[i], imagePreviews[i], i, totalImages);
        if (success) successCount++;
      }
      
      // Marcar como completo y actualizar diálogo
      UPLOAD_PROGRESS.isComplete = true;
      UPLOAD_PROGRESS.percentComplete = 100;
      window.updateUploadDialog(true, UPLOAD_PROGRESS);
      
      // Wait a moment and then redirect
      setTimeout(() => {
        // Reset global flag before navigation
        IS_UPLOADING = false;
        window.updateUploadDialog(false);
        navigate(`/Planta/?${plantId}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error durante la subida:", error);
      setError("Error al subir las imágenes. Por favor inténtalo de nuevo.");
      IS_UPLOADING = false;
      window.updateUploadDialog(false);
    }
  };

  const handleAreaClick = (e) => {
    e.preventDefault();
    
    if (isProcessingFile || IS_UPLOADING) {
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectButtonClick = (e) => {
    if (isProcessingFile || IS_UPLOADING) {
      return;
    }
    
    e.stopPropagation();
  };

  const isFormValid = selectedImages.length > 0;

  return (
    <Layout title="Nueva Foto">
      <Container maxWidth="lg">
        <Box sx={{ py: 3, mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información de las fotos */}
            <Grid item xs={12}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  height: 'fit-content'
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PhotoCameraIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Información de las Fotos
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    color: '#ffffff',
                    py: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                          label="Fecha de las fotos"
                          value={photoDate}
                          onChange={(newValue) => setPhotoDate(newValue)}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          height: 'fit-content'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <InfoIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                            Estado actual
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={`${selectedImages.length}/${MAX_IMAGES} fotos`} 
                            color={selectedImages.length > 0 ? "primary" : "default"}
                            variant={selectedImages.length > 0 ? "filled" : "outlined"}
                            size="small"
                          />
                          {selectedImages.length >= MAX_IMAGES && (
                            <Chip 
                              label="Máximo alcanzado" 
                              color="warning"
                              size="small"
                            />
                          )}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Descripción (opcional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Ej: Primeras hojas, Crecimiento, Floración, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Selección de imágenes */}
            <Grid item xs={12}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: 'hidden'
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CollectionsIcon sx={{ color: '#ffffff' }} />
                      <Typography variant="h6" fontWeight="medium">
                        Seleccionar Imágenes
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.9), mt: 0.5 }}>
                      Sube hasta 10 fotos a la vez (incluye soporte para HEIC)
                    </Typography>
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    color: '#ffffff',
                    py: 2,
                    '& .MuiCardHeader-subheader': {
                      color: alpha('#ffffff', 0.9)
                    }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  {selectedImages.length < MAX_IMAGES && (
                    <Box sx={{ mb: 3 }}>
                      <DropZone
                        isDragActive={isDragActive}
                        onClick={handleAreaClick}
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
                          Arrastra y suelta imágenes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          o haz clic para seleccionar
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          Tamaño máximo: 10MB por imagen - Formatos: JPG, PNG, GIF, HEIC
                        </Typography>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          disabled={isProcessingFile || IS_UPLOADING}
                          onClick={handleSelectButtonClick}
                          sx={{ 
                            borderColor: theme.palette.success.main,
                            color: theme.palette.success.main,
                            '&:hover': { 
                              borderColor: theme.palette.success.dark,
                              bgcolor: alpha(theme.palette.success.main, 0.05)
                            },
                            ...(isProcessingFile && {
                              opacity: 0.7,
                              cursor: 'not-allowed'
                            })
                          }}
                        >
                          {isProcessingFile ? 'Procesando...' : 'Seleccionar Imágenes'}
                          <VisuallyHiddenInput 
                            type="file" 
                            accept="image/*,.heic,.HEIC" 
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            multiple 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Button>
                      </DropZone>
                    </Box>
                  )}
                  
                  {imagePreviews.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                        Imágenes seleccionadas ({selectedImages.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {imagePreviews.map((preview, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Paper 
                              elevation={2} 
                              sx={{ 
                                p: 1, 
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                              }}
                            >
                              <Box sx={{ position: 'relative' }}>
                                <img 
                                  src={preview} 
                                  alt={`Vista previa ${index + 1}`} 
                                  style={{ 
                                    width: '100%', 
                                    height: '150px', 
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    display: 'block'
                                  }} 
                                />
                                
                                <IconButton
                                  aria-label="eliminar imagen"
                                  size="small"
                                  onClick={() => handleRemoveImage(index)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      color: theme.palette.error.main
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  mt: 1, 
                                  display: 'block', 
                                  textAlign: 'center',
                                  color: theme.palette.text.secondary 
                                }}
                              >
                                Foto {index + 1}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {error && (
                    <Box sx={{ mt: 3 }}>
                      <Collapse in={!!error}>
                        <Alert 
                          severity="error" 
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
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/Planta/?${plantId}`)}
                  disabled={IS_UPLOADING}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2
                  }}
                >
                  Cancelar
                </Button>
                
                <Button 
                  variant="contained"
                  color="secondary"
                  startIcon={IS_UPLOADING ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleUploadPhotos}
                  disabled={!isFormValid || IS_UPLOADING}
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {IS_UPLOADING 
                    ? `Subiendo...` 
                    : `Subir ${selectedImages.length > 1 ? selectedImages.length + ' Fotos' : 'Foto'}`}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewPhoto; 
