import React from 'react';
import {Card,Grid,CardHeader} from '@mui/material';

const CardHeaderFinances = ({subheader,title,cond}) => {
  return (
    <Grid item>
        <Card style={{width:'350px',backgroundColor:cond===true?'green':"red" , color:'white'}}>
            <CardHeader
            title={title}
            subheader={subheader}/>
        </Card>
    </Grid>
  );
};

export default CardHeaderFinances;
