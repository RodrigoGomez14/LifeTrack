import * as db from './database';

// Guarda el nombre en RTDB. La copia que va al perfil de Firebase Auth la maneja
// `useAuth.updateDisplayName`.
export const setDisplayName = (name) => db.write('displayName', name);

export const setTheme = (themeConfig) => db.update('config/theme', themeConfig);

export const setConfig = (configData) => db.update('config', configData);

export const setPrivacyConfig = (data) => db.update('config/privacy', data);

// Devuelve todo el árbol del user. Para crear backups.
export const getUserBackup = () => db.read('');

// Borra todo el árbol del user. Solo para delete account — el nombre es explícito
// porque la operación es destructiva total.
export const deleteAllUserData = () => db.remove('');
