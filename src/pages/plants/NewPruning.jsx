import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  Select,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Typography,
  alpha
} from "@mui/material";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { useTheme } from '@mui/material/styles';

const NewPruning = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState("");
  const theme = useTheme();

  const handleNewPruning = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/prunings`
      )
      .push({
        date: getDate(),
        type: type,
      });

    setType("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nueva Poda">
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        p: { xs: 2, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)'
      }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: '#ffffff'
          }}>
            <ContentCutIcon fontSize="large" sx={{ color: '#ffffff' }} />
            <Typography variant="h5" component="h1" sx={{ color: '#ffffff' }}>
              Registrar Nueva Poda
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Poda</InputLabel>
                  <Select
                    value={type}
                    label="Tipo de Poda"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value='Apical'>Apical</MenuItem>
                    <MenuItem value='FIM'>FIM</MenuItem>
                    <MenuItem value='Bajos'>Bajos</MenuItem>
                    <MenuItem value='Hojas'>Hojas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleNewPruning}
                  disabled={!type}
                  fullWidth
                  size="large"
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    color: '#ffffff',
                    py: 1.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`
                    }
                  }}
                >
                  AGREGAR PODA
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewPruning;
