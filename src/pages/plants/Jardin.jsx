import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Fab,
  Card,
  alpha,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LightModeIcon from "@mui/icons-material/LightMode";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import { PlantRow, STAGES } from "../../components/plants/PlantShared";
import AmbienteForm from "../../components/plants/AmbienteForm";
import * as db from "../../services/database";

const STAGE_LABELS = {
  Vegetativo: "VEGE", Floracion: "FLORA", Germinacion: "GERME",
  Secado: "SECADO", Enfrascado: "ENFRAS",
};

const Jardin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [showAmbienteForm, setShowAmbienteForm] = useState(false);
  const [editingAmbiente, setEditingAmbiente] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const { allPlants, environments } = useMemo(() => {
    const active = userData?.plants?.active
      ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
      : [];
    const envs = userData?.plants?.environments
      ? Object.entries(userData.plants.environments).map(([id, e]) => ({ id, ...e }))
      : [];
    return { allPlants: active, environments: envs };
  }, [userData]);

  const filtered = allPlants.filter(
    (p) => !search || (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const groupedPlants = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      const stage = p.etapa || "Germinacion";
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(p);
    });
    return STAGES.filter((s) => groups[s.key]).map((s) => ({
      ...s,
      plants: groups[s.key],
    }));
  }, [filtered]);

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAmbiente = async (data) => {
    if (data.id) {
      await db.update(`plants/environments/${data.id}`, { name: data.name, type: data.type, lightSchedule: data.lightSchedule });
    } else {
      await db.push("plants/environments", { name: data.name, type: data.type, lightSchedule: data.lightSchedule, createdAt: new Date().toISOString() });
    }
  };

  return (
    <Layout title="Jardín">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8 }}>
        {/* Search */}
        <TextField
          fullWidth size="small" placeholder="Buscar..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
            sx: { borderRadius: 2 },
          }}
          sx={{ mb: 2 }}
        />

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Plantas" />
          <Tab label="Ambientes" />
        </Tabs>

        {/* Tab Plantas */}
        {tab === 0 && (
          groupedPlants.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">No hay plantas activas</Typography>
            </Box>
          ) : (
            groupedPlants.map((group) => (
              <Box key={group.key} sx={{ mb: 1.5 }}>
                {/* Group header */}
                <Box
                  onClick={() => toggleGroup(group.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: alpha(group.color, 0.06),
                    '&:hover': { bgcolor: alpha(group.color, 0.1) },
                    mb: 0.5,
                  }}
                >
                  <group.icon sx={{ fontSize: 18, color: group.color }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: group.color, flex: 1 }}>
                    {STAGE_LABELS[group.key] || group.key.toUpperCase()} ({group.plants.length})
                  </Typography>
                  {collapsedGroups[group.key] ? <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                </Box>

                {/* Plants */}
                <Collapse in={!collapsedGroups[group.key]}>
                  {group.plants.map((plant) => (
                    <PlantRow key={plant.id} plant={plant} onClick={() => navigate(`/Planta/?${plant.id}`)} />
                  ))}
                </Collapse>
              </Box>
            ))
          )
        )}

        {/* Tab Ambientes */}
        {tab === 1 && (
          <Box>
            {environments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No hay ambientes creados</Typography>
              </Box>
            ) : (
              environments.map((env) => (
                <Card key={env.id} variant="outlined" sx={{ mb: 1, p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: env.type === 'indoor' ? alpha(theme.palette.primary.main, 0.1) : alpha('#4CAF50', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: env.type === 'indoor' ? 'primary.main' : '#4CAF50', fontSize: 20 }}>
                    <LightModeIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{env.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {env.type === 'indoor' ? 'Indoor' : env.type === 'outdoor' ? 'Outdoor' : 'Invernadero'} · {env.lightSchedule}
                    </Typography>
                  </Box>
                  <Box onClick={() => { setEditingAmbiente(env); setShowAmbienteForm(true); }} sx={{ cursor: 'pointer', color: 'text.secondary', p: 0.5 }}>
                    <EditOutlinedIcon fontSize="small" />
                  </Box>
                </Card>
              ))
            )}

            <Card
              variant="outlined"
              onClick={() => { setEditingAmbiente(null); setShowAmbienteForm(true); }}
              sx={{ p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>+ Agregar ambiente</Typography>
              <Typography variant="caption" color="text.secondary">Indoor, outdoor o invernadero</Typography>
            </Card>
          </Box>
        )}
      </Box>

      {/* FAB */}
      {tab === 0 && (
        <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => navigate('/NuevaPlanta')}>
          <AddIcon />
        </Fab>
      )}

      <AmbienteForm
        open={showAmbienteForm}
        onClose={() => setShowAmbienteForm(false)}
        editData={editingAmbiente}
        onSave={handleSaveAmbiente}
      />
    </Layout>
  );
};

export default Jardin;
