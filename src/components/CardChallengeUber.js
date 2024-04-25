import React from 'react';
import {Grid,Typography,Card,CardHeader,CardContent,LinearProgress,Button,Alert} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatAmount} from '../utils';
import { useStore } from '../store'; // Importar el store de Zustand
import { database, auth } from '../firebase'; // Importar el módulo de autenticación de Firebase

const CardChallengeUber = ({data,pend}) => {
    const {dollarRate} = useStore(); // Obtener estados del store
    const completeChallenge = () => {
        const amountValue = parseFloat(data.amount);
        const amountUSDValue = amountValue / dollarRate['venta'];
        const pending = parseFloat(pend);

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
            data.total = (data.total || 0) + amountValue;
            data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
            }
            return data;
        });

        // Actualizar totales anuales en la base de datos para Uber
        const yearlyUberRef = database.ref(`${auth.currentUser.uid}/uber/data/${year}`);
        yearlyUberRef.transaction((data) => {
            if (data) {
            data.total = (data.total || 0) + amountValue;
            data.totalUSD = (data.totalUSD || 0) + amountUSDValue;
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
    const goal = data.goal || 1000; // Por defecto, objetivo es 1000
    const progress = data.progress || 0;
    const progressPercentage = progress>goal?100:(progress / goal) * 100;
    console.log(data.goal)
    return(
        data.goal>0?
        <Grid container justifyContent='center'>
            <Grid item>
                <Card>
                    <CardHeader
                        title={formatAmount(data.amount)}
                        subheader='Challenge Semanal'
                    />
                    <CardContent>
                        <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h2" align="center">{data.progress}/{data.goal}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <LinearProgress variant="determinate" value={progressPercentage} color='primary'/>  
                        </Grid>
                        <Grid container item alignItems='center' direction='column' spacing={1}>
                            <Grid item>
                            <Button variant='contained' onClick={completeChallenge} disabled={data.progress>=data.goal?false:true}>
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
