import React from 'react';
import { CircularProgress,Grid,Typography } from '@mui/material';

const Loading = ({open}) => {
  return (
    <Grid container alignItems='center' style={{height:'100vh'}}>
        <Grid container item xs={12} justifyContent='center'>
          <Typography variant='h1' color='secondary' fontWeight='bold'>
            LifeTrack
          </Typography>
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
          <Typography variant='caption' color='secondary' fontWeight='bold'>
            Loading...
          </Typography>
        </Grid>
        <Grid container item xs={12} justifyContent='center'>
            <CircularProgress color='secondary' size={128}/>
        </Grid>
  </Grid>
  );
};

export default Loading;
