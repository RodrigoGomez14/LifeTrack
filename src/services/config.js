import * as db from './database';

export const setDisplayName = (name) => db.write('displayName', name);

export const setTheme = (themeConfig) => db.update('config/theme', themeConfig);

export const setConfig = (configData) => db.update('config', configData);

export const setPrivacyConfig = (data) => db.update('config/privacy', data);

export const getUserBackup = () => db.read('');
