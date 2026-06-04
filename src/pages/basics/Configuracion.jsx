import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PaletteIcon from '@mui/icons-material/Palette';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShieldIcon from '@mui/icons-material/Shield';
import SaveIcon from '@mui/icons-material/Save';

import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import {
  setDisplayName as setDisplayNameInDb,
  setConfig,
} from '../../services/config';

import ConfigTabsLayout from '../../components/config/ConfigTabsLayout';
import ConfigProfileTab from '../../components/config/ConfigProfileTab';
import ConfigThemeTab from '../../components/config/ConfigThemeTab';
import ConfigFinancesTab from '../../components/config/ConfigFinancesTab';
import ConfigBackupTab from '../../components/config/ConfigBackupTab';
import ConfigSecurityTab from '../../components/config/ConfigSecurityTab';

const TABS = [
  { icon: PersonIcon, label: 'Perfil' },
  { icon: PaletteIcon, label: 'Tema' },
  { icon: AccountBalanceWalletIcon, label: 'Finanzas' },
  { icon: VisibilityIcon, label: 'Privacidad' },
  { icon: ShieldIcon, label: 'Seguridad' },
];

function Configuracion() {
  const {
    user,
    signOut,
    sendPasswordReset,
    updateDisplayName,
    updatePhotoURL,
    deleteAccount,
  } = useAuth();
  const { userData, setUserData } = useStore();

  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Perfil
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Tema (dark-only — sin toggle)

  // Finanzas
  const [defaultCurrency, setDefaultCurrency] = useState('ARS');
  const [showCents, setShowCents] = useState(true);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  const [roundingEnabled, setRoundingEnabled] = useState(false);

  // Privacidad / Backup
  const [showSavingsOnDashboard, setShowSavingsOnDashboard] = useState(true);
  const [showFinancesInProfile, setShowFinancesInProfile] = useState(false);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [lastBackupDate, setLastBackupDate] = useState(null);

  // Cargar datos del usuario al inicio
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }

    if (userData && userData.config) {
      const config = userData.config;

      if (config.finances) {
        setDefaultCurrency(config.finances.defaultCurrency || 'ARS');
        setShowCents(config.finances.showCents !== undefined ? config.finances.showCents : true);
        setSavingsGoal(config.finances.savingsGoal || 0);
        setBudgetPeriod(config.finances.budgetPeriod || 'monthly');
        setRoundingEnabled(config.finances.roundingEnabled || false);
      }

      if (config.privacy) {
        setShowSavingsOnDashboard(
          config.privacy.showSavingsOnDashboard !== undefined ? config.privacy.showSavingsOnDashboard : true
        );
        setShowFinancesInProfile(config.privacy.showFinancesInProfile || false);
        setDataBackupEnabled(config.privacy.dataBackupEnabled || false);
        setBackupFrequency(config.privacy.backupFrequency || 'daily');
        setLastBackupDate(config.privacy.lastBackupDate || null);
      }
    }
  }, [userData, user]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveConfig = async () => {
    setSaving(true);

    try {
      if (user) {
        await updateDisplayName(displayName);
      }

      const configToSave = {
        finances: { defaultCurrency, showCents, savingsGoal, budgetPeriod, roundingEnabled },
        privacy: {
          showSavingsOnDashboard,
          showFinancesInProfile,
          dataBackupEnabled,
          backupFrequency,
          lastBackupDate,
        },
        lastUpdated: new Date().toISOString(),
      };

      await setConfig(configToSave);
      await setDisplayNameInDb(displayName);

      setUserData({
        ...(userData || {}),
        config: userData?.config ? { ...userData.config, ...configToSave } : configToSave,
        displayName,
      });

      showSnackbar('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      showSnackbar('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <ConfigProfileTab
            user={user}
            displayName={displayName}
            setDisplayName={setDisplayName}
            email={email}
            photoURL={photoURL}
            setPhotoURL={setPhotoURL}
            userData={userData}
            setUserData={setUserData}
            updateDisplayName={updateDisplayName}
            updatePhotoURL={updatePhotoURL}
            onSnack={showSnackbar}
          />
        );
      case 1:
        return (
          <ConfigThemeTab
            displayName={displayName}
            userData={userData}
            onSnack={showSnackbar}
          />
        );
      case 2:
        return (
          <ConfigFinancesTab
            defaultCurrency={defaultCurrency}
            setDefaultCurrency={setDefaultCurrency}
            budgetPeriod={budgetPeriod}
            setBudgetPeriod={setBudgetPeriod}
            showCents={showCents}
            setShowCents={setShowCents}
            roundingEnabled={roundingEnabled}
            setRoundingEnabled={setRoundingEnabled}
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
          />
        );
      case 3:
        return (
          <ConfigBackupTab
            email={email}
            showSavingsOnDashboard={showSavingsOnDashboard}
            setShowSavingsOnDashboard={setShowSavingsOnDashboard}
            showFinancesInProfile={showFinancesInProfile}
            setShowFinancesInProfile={setShowFinancesInProfile}
            dataBackupEnabled={dataBackupEnabled}
            setDataBackupEnabled={setDataBackupEnabled}
            backupFrequency={backupFrequency}
            setBackupFrequency={setBackupFrequency}
            lastBackupDate={lastBackupDate}
            setLastBackupDate={setLastBackupDate}
            signOut={signOut}
            deleteAccount={deleteAccount}
            onSnack={showSnackbar}
          />
        );
      case 4:
        return <ConfigSecurityTab userEmail={user?.email} sendPasswordReset={sendPasswordReset} />;
      default:
        return null;
    }
  };

  return (
    <Layout title="Configuración">
      <ConfigTabsLayout
        tabsData={TABS}
        activeTab={activeTab}
        onTabChange={(_e, v) => setActiveTab(v)}
        actions={
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
            onClick={handleSaveConfig}
            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 500 }}
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        }
      >
        {renderTabContent()}
      </ConfigTabsLayout>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default Configuracion;
