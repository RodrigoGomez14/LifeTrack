import React from 'react';
import {Grid,Typography,Card,CardHeader,LinearProgress,Paper,IconButton} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatAmount} from '../../utils';
import { useStore } from '../../store'; // Importar el store de Zustand
import { database, auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

const CardChallengeUber = () => {
    const {userData, dollarRate} = useStore(); // Obtener estados del store
    const theme = useTheme();

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

        if(userData.uber.challenge.secondGoal>0){
            activeSecondChallenge()
        }
        else{
            resetChallenge()
        }
    };

    const activeSecondChallenge = () => {
        let newProgress = 0
        if(userData.uber.challenge.progress-userData.uber.challenge.goal>0){
            newProgress = userData.uber.challenge.progress-userData.uber.challenge.goal
        }

        database.ref(`${auth.currentUser.uid}/uber/challenge`).set({
            amount:userData.uber.challenge.secondAmount,
            secondAmount:0,
            goal:userData.uber.challenge.secondGoal,
            secondGoal:0,
            progress:newProgress
        })
    };

    const resetChallenge = () => {
        database.ref(`${auth.currentUser.uid}/uber/challenge`).set({
            amount:0,
            secondAmount:0,
            goal:0,
            secondGoal:0,
            progress:0
        })
    };
    
    const goal = userData.uber.challenge.goal || 0
    const progress = userData.uber.challenge.progress || 0;
    const progressPercentage = progress>goal?100:(progress / goal) * 100;
    
    return(
        userData.uber.challenge.goal>0?
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                    action={
                        <IconButton 
                            aria-label="settings"
                            onClick={userData.uber.challenge.progress>=userData.uber.challenge.goal?completeChallenge:resetChallenge} 
                        >
                            {
                            userData.uber.challenge.progress>=userData.uber.challenge.goal?
                                <CheckCircleIcon style={{color:theme.palette.secondary.main}}/>
                                :
                                <RestoreIcon style={{color:theme.palette.secondary.main}}/>
                            }
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
                        </>
                    }
                    />
                </Card>
            </Paper>
        </Grid>
        :
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                    style={{ backgroundColor: 'grey', color: 'white' }}
                    title={
                        <>
                            <Typography variant="caption">
                                Aun no hay un Challenge Activo!
                            </Typography>
                            <Link to="/EmpezarChallenge">
                                <IconButton>
                                    <AddIcon style={{color:'white'}}/>
                                </IconButton>
                            </Link>
                        </>
                    }
                    />
                </Card>
            </Paper>
        </Grid>
    )
}
export default CardChallengeUber;
