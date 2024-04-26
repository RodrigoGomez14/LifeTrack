import React from 'react';
import {Grid,Typography,Card,CardHeader,CardContent,LinearProgress,Button,Alert} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatAmount} from '../utils';
import { useStore } from '../store'; // Importar el store de Zustand
import { database, auth } from '../firebase'; // Importar el módulo de autenticación de Firebase

const CardChallengeUber = () => {
    const {userData, dollarRate} = useStore(); // Obtener estados del store

    const completeChallenge = () => {
        const amountValue = parseFloat(userData.uber.challenge.amount);
        const amountUSDValue = amountValue / dollarRate['venta'];
        const pending = parseFloat(userData.uber.pending);

        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');

        database.ref(`${auth.currentUser.uid}/uber/data/${year}/data/${month}/data`).push({
            date: `${day}/${month}/${year}`,
            amount: amountValue,
            amountUSD: amountUSDValue,
            challenge:true,
            valorUSD: dollarRate['venta']
        });

        // Actualizar totales mensuales en la base de datos para Uber
        const monthlyUberRef = database.ref(`${auth.currentUser.uid}/uber/data/${year}/data/${month}`);
        monthlyUberRef.transaction((data) => {
            if (data) {
            userData.uber.challenge.total = (userData.uber.challenge.total || 0) + amountValue;
            userData.uber.challenge.totalUSD = (userData.uber.challenge.totalUSD || 0) + amountUSDValue;
            }
            return data;
        });

        // Actualizar totales anuales en la base de datos para Uber
        const yearlyUberRef = database.ref(`${auth.currentUser.uid}/uber/data/${year}`);
        yearlyUberRef.transaction((data) => {
            if (data) {
            userData.uber.challenge.total = (userData.uber.challenge.total || 0) + amountValue;
            userData.uber.challenge.totalUSD = (userData.uber.challenge.totalUSD || 0) + amountUSDValue;
            }
            return data;
        });


        database.ref(`${auth.currentUser.uid}/uber/pending`).set(pending + amountValue);

        database.ref(`${auth.currentUser.uid}/uber/challenge`).set({
            amount:0,
            goal:0,
            progress:0
        })
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
        <Grid container justifyContent='center'>
            <Grid item>
                <Card>
                    <CardHeader
                        title={formatAmount(userData.uber.challenge.amount)}
                        subheader='Challenge Semanal'
                    />
                    <CardContent>
                        <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h2" align="center">{userData.uber.challenge.progress}/{userData.uber.challenge.goal}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <LinearProgress variant="determinate" value={progressPercentage} color='primary'/>  
                        </Grid>
                        <Grid container item alignItems='center' direction='column' spacing={1}>
                            <Grid item>
                            <Button variant='contained' onClick={completeChallenge} disabled={userData.uber.challenge.progress>=userData.uber.challenge.goal?false:true}>
                                COMPLETAR CHALLENGE
                            </Button>
                            </Grid>
                            <Grid item>
                            <Button variant='text' onClick={resetChallenge}>
                                RESETEAR
                            </Button>
                            </Grid>
                        </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        :
        <Grid container justifyContent='center'>
            <Grid item>
                <Card>
                    <CardHeader
                        title='Challenge Semanal'
                    />
                    <CardContent>
                        <Grid container justifyContent='center'>
                        <Grid item xs={12}>
                            <Alert severity='warning'>Aun no hay un Challenge Activo!</Alert>
                        </Grid>
                        <Grid item xs={12}>
                            <Link to="/StartChallenge">
                            <Button variant='contained'>
                                INICIAR CHALLENGE SEMANAL
                            </Button>
                            </Link>
                        </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
export default CardChallengeUber;
