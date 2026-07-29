import React from 'react';
import { Grid, Card, CardContent, Typography, Avatar, alpha } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const ACTIONS = [
  { label: 'Gasto', route: '/nuevoMovimiento', icon: TrendingDownIcon, color: '#e53935', state: { type: 'expense' } },
  { label: 'Ingreso', route: '/nuevoMovimiento', icon: TrendingUpIcon, color: '#43a047', state: { type: 'income' } },
  { label: 'Log', route: '/LogPlanta', icon: LocalFloristIcon, color: '#7c4dff' },
];

const QuickActions = ({ onNavigate }) => (
  <Grid container spacing={1} component={AnimatedGroup}>
    {ACTIONS.map((action) => (
      <Grid item xs={4} sm={4} key={action.label} component={AnimatedItem}>
        <Card
          elevation={0}
          onClick={() => onNavigate(action.route, action.state)}
          sx={{
            cursor: 'pointer',
            borderRadius: 2,
            bgcolor: action.color,
            transition: 'all 0.15s',
            '&:hover': { filter: 'brightness(0.9)' },
          }}
        >
          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
            <Avatar
              sx={{
                bgcolor: alpha('#fff', 0.25),
                color: '#fff',
                width: 40,
                height: 40,
                mx: 'auto',
                mb: 0.75,
              }}
            >
              <action.icon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, color: '#fff' }} noWrap>
              {action.label}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default QuickActions;
