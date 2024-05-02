import React from 'react';
import {Grid,Typography,Card,CardHeader,CardContent,LinearProgress,Button,Alert,IconButton} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatAmount} from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';

const CardChallengeUber = () => {
    const {userData, dollarRate} = useStore(); // Obtener estados del store

    const completeChallenge = () => {
        const amountValue = parseFloat(userData.uber.challenge.amount);
        const amountUSDValue = amountValue / dollarRate['venta'];
        const pending = parseFloat(userData.uber.pending);

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1);
        const day = currentDate.getDate();

        database.ref(`${auth.currentUser.uid}/uber/data`).push({
            date: `${day}/${month}/${year}`,
            amount: amountValue,
            amountUSD: amountUSDValue,
            challenge:true,
            valorUSD: dollarRate['venta']
        });

        database.ref(`${auth.currentUser.uid}/uber/pending`).set(pending + amountValue);

        resetChallenge()
    };

    const resetChallenge = () => {
    database.ref(`${auth.currentUser.uid}/uber/challenge`).set({
        amount:0,
        goal:0,
        progress:0
    })
    };
    
    const goal = userData.uber.challenge.goal || 0
    const progress = userData.uber.challenge.progress || 0;
    const progressPercentage = progress>goal?100:(progress / goal) * 100;
    
    return(
        userData.uber.challenge.goal>0?
        <Grid item>
            <Card>
                <CardHeader
                action={
                    <IconButton 
                        aria-label="settings"
                        onClick={resetChallenge} 
                    >
                        <RestoreIcon style={{color:'white'}}/>
                    </IconButton>
                  }
                title={
                    <>
                        <Typography variant="caption">
                            Challenge Semanal
                        </Typography>
                        <Typography variant="h4">
                            {userData.uber.challenge.progress}/{userData.uber.challenge.goal}
                        </Typography>
                        <LinearProgress variant="determinate" value={progressPercentage} color='primary'/>  
                        <Typography variant="body2">
                            {formatAmount(userData.uber.challenge.amount)}
                        </Typography>

                        {
                            userData.uber.challenge.progress>=userData.uber.challenge.goal?
                            <IconButton 
                                aria-label="settings"
                                onClick={completeChallenge}
                            >
                                <CheckCircleIcon style={{color:'white'}}/>
                            </IconButton>
                            :
                            null
                        }
                    </>
                }
                />
            </Card>
        </Grid>
        :
        <Grid item>
            <Card>
                <CardHeader
                style={{ backgroundColor: 'grey', color: 'white' }}
                title={
                    <>
                        <Typography variant="caption">
                            Aun no hay un Challenge Activo!
                        </Typography>
                        <Link to="/StartChallenge">
                            <IconButton>
                                <AddIcon style={{color:'white'}}/>
                            </IconButton>
                        </Link>
                    </>
                }
                />
            </Card>
        </Grid>
    )
}
export default CardChallengeUber;
