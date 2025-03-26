import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  IconButton,
  Alert,
  alpha,
  Stack,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, auth } from "../../firebase";
import { getDate } from "../../utils";

const ImageUploader = ({ plantId, onUploadComplete }) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const currentDate = getDate();
      
      const storage = getStorage();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(
        storage,
        `${auth.currentUser.uid}/plants/${plantId}/images/${fileName}`
      );
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      await database
        .ref(
          `${auth.currentUser.uid}/plants/active/${plantId}/images`
        )
        .push({
          date: currentDate,
          url: downloadURL,
          fileName: fileName,
          timestamp: Date.now()
        });
      
      setSuccessMessage('Imagen subida correctamente');
      setOpenSnackbar(true);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      setError(`Error al subir la imagen: ${error.message}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    noClick: uploading
  });

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: `2px dashed ${isDragActive ? theme.palette.secondary.main : theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: isDragActive 
            ? alpha(theme.palette.secondary.main, 0.08)
            : alpha(theme.palette.background.paper, 0.6),
          p: 3,
          transition: 'all 0.2s ease-in-out'
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120
          }}
        >
          {uploading ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress 
                variant="determinate" 
                value={uploadProgress} 
                color="secondary" 
                size={50}
                thickness={4}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Subiendo imagen... {uploadProgress}%
              </Typography>
            </Box>
          ) : (
            <>
              <PhotoCameraIcon 
                sx={{ 
                  fontSize: 40, 
                  color: isDragActive ? theme.palette.secondary.main : alpha(theme.palette.text.secondary, 0.5),
                  mb: 1
                }} 
              />
              
              <Typography variant="body1" align="center" sx={{ mb: 1 }}>
                {isDragActive ? (
                  <strong>Suelta la imagen aquí</strong>
                ) : (
                  "Arrastra una imagen o haz clic para seleccionar"
                )}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" align="center">
                JPG, PNG o GIF
              </Typography>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<CloudUploadIcon />}
                onClick={open}
                disabled={uploading}
                sx={{ mt: 2 }}
                size="small"
              >
                Seleccionar archivo
              </Button>
            </>
          )}
        </Box>
      </Paper>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={successMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setOpenSnackbar(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default ImageUploader; 