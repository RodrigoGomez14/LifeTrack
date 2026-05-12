import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Stack,
  CircularProgress,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import { auth, storage } from '../../firebase';
import { setDisplayName as setDisplayNameInDb } from '../../services/config';

const ConfigProfileTab = ({
  user,
  displayName,
  setDisplayName,
  email,
  photoURL,
  setPhotoURL,
  userData,
  setUserData,
  updateDisplayName,
  updatePhotoURL,
  onSnack,
}) => {
  const theme = useTheme();
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileRef = storage.ref().child(`profileImages/${auth.currentUser.uid}/${file.name}`);
      await fileRef.put(file);
      const downloadURL = await fileRef.getDownloadURL();

      await updatePhotoURL(downloadURL);

      setPhotoURL(downloadURL);
      onSnack('Imagen de perfil actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      onSnack('Error al subir la imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) {
      onSnack('El nombre de usuario no puede estar vacío', 'error');
      return;
    }

    setSaving(true);
    try {
      if (user) {
        await updateDisplayName(displayName);
      }
      await setDisplayNameInDb(displayName);

      if (userData) {
        setUserData({ ...userData, displayName });
      }

      setEditingName(false);
      onSnack('Nombre de usuario actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar el nombre de usuario:', error);
      onSnack('Error al actualizar el nombre de usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Información de perfil
        </Typography>

        <Grid container spacing={4}>
          {/* Imagen de perfil */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={photoURL}
                alt={displayName || email}
                sx={{
                  width: 100,
                  height: 100,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                {!photoURL &&
                  (displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase())}
              </Avatar>
              <input
                accept="image/*"
                id="profile-image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                  disabled={uploading}
                >
                  {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
                </IconButton>
              </label>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Haz clic en la cámara para cambiar tu imagen
            </Typography>
          </Grid>

          {/* Información básica */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Nombre de usuario
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    variant="outlined"
                    disabled={!editingName}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant={editingName ? 'contained' : 'outlined'}
                    onClick={editingName ? handleSaveDisplayName : () => setEditingName(true)}
                    disabled={saving}
                    sx={{
                      minWidth: 100,
                      borderRadius: 2,
                    }}
                  >
                    {editingName ? (
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        'Guardar'
                      )
                    ) : (
                      <>
                        <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Editar
                      </>
                    )}
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Correo electrónico
                </Typography>
                <TextField
                  fullWidth
                  value={email}
                  disabled
                  variant="outlined"
                  size="small"
                  helperText="El correo electrónico no se puede cambiar"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ConfigProfileTab;
