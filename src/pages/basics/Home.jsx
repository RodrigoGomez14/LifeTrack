import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Button, Card, CardHeader, CardContent,Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getPreviousMonday, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';
import AddIcon from '@mui/icons-material/Add';
import { YAxis } from 'recharts';
import { formatters } from 'date-fns';

const Home = () => {
  const { userData,dollarRate } = useStore(); // Obtener estados del store

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const generateChartAnualSales = () => {
    // Asume que tienes los datos en dos variables: sortedCompras y sortedVentas
    let sales = []
    let purchases = []
    let dif = []
    let labelsUltimoAnio =  []

    if(userData.finances.incomes || userData.finances.expenses){

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth();
        const anioActual = fechaActual.getFullYear();
        
        let auxSales = [0,0,0,0,0,0,0,0,0,0,0,0]
        let auxPurchases = [0,0,0,0,0,0,0,0,0,0,0,0]

        const mesesDesdeUltimoAnio = 12;
        let mesInicio = mesActual - mesesDesdeUltimoAnio;
        let anioInicio = anioActual;
        if (mesInicio < 0) {
            mesInicio += 12;
            anioInicio -= 1;
        }
        const initialDate = new Date()
        initialDate.setFullYear(anioInicio,mesInicio+1,1)

        if(userData.finances.expenses){
          Object.keys(userData.finances.expenses).map(year=>{
            Object.keys(userData.finances.expenses[year].months).map(month=>{
              const auxFecha = new Date();
              auxFecha.setFullYear(year, month - 1, 1);
              if(auxFecha>=initialDate && auxFecha<=fechaActual){
                  auxPurchases[month-1]+=(userData.finances.expenses[year].months[month].totalUSD)
              }
            })
          })
        }

        if(userData.finances.incomes){
          Object.keys(userData.finances.incomes).map(year=>{
            Object.keys(userData.finances.incomes[year].months).map(month=>{
              const auxFecha = new Date();
              auxFecha.setFullYear(year, month - 1, 1);
              if(auxFecha>=initialDate && auxFecha<=fechaActual){
                  auxSales[month-1]+=(userData.finances.incomes[year].months[month].totalUSD)
              }
            })
          })
        }

        const auxMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const arr1Meses = auxMeses.slice(mesInicio+1);
        const arr2Meses = auxMeses.slice(0,mesInicio+1);

        
        const arr1Sales = auxSales.slice(mesInicio+1);
        const arr2Sales = auxSales.slice(0,mesInicio+1);

        const arr1Purchases = auxPurchases.slice(mesInicio+1);
        const arr2Purchases = auxPurchases.slice(0,mesInicio+1);
        
        
        arr1Meses.map(i=>{
            labelsUltimoAnio.push(i)
        })
        arr2Meses.map(i=>{
            labelsUltimoAnio.push(i)
        })
        
        arr1Sales.map(i=>{
            sales.push(i)
        })
        arr2Sales.map(i=>{
            sales.push(i)
        })

        arr1Purchases.map(i=>{
            purchases.push(i)
        })
        arr2Purchases.map(i=>{
            purchases.push(i)
        })

        sales.map(sale=>{
            dif.push(sale)
        })
        purchases.map((purchase,i)=>{
            dif[i]-=purchase
        })

    }
    // Define la configuración del gráfico
    const options = {
        labels:labelsUltimoAnio,
        fill: {
        },
        chart:{
            
        },
        stroke: {
            curve: 'smooth'
        },
        grid: {
            row: {
                colors: ['#c3c3c3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.2
            },
        },
        tooltip:{
            y:{
                formatter: val=> formatAmount(val)
            }
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            labels:{
                formatter: val => formatAmount(val),
            }
        }
    };
    const series=[
    {
        name:'Ingresos',
        type:'line',
        data:sales
    },
    {
        name:'Gastos',
        type:'line',
        data:purchases
    },
    {
        name:'Balance',
        type:'area',
        data:dif
    },
    ]
    // Renderiza el gráfico

    return (
      <Paper elevation={6}>
        <Card>
            <CardHeader
                subheader='Ingresos & Gastos - Ultimos 12 Meses'
            />
            <CardContent>
                <ReactApexChart options={options} series={series}  height={400} width={1200} />
            </CardContent>
        </Card>
      </Paper>
    )
  }
  const generateChart = () => {
    let serie2023 = []
    let labels = []
    if(userData.finances.incomes){

      Object.keys(userData.finances.incomes['2023'].months).map(month=>{
        serie2023.push(userData.finances.incomes['2023'].months[month].totalUSD || 650)
        labels.push(getMonthName(month))
      })
    }
    // Define la configuración del gráfico
    const options = {
      labels,
      fill: {
      },
      chart:{
          
      },
      stroke: {
          curve: 'smooth'
      },
      grid: {
          row: {
              colors: ['#c3c3c3', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.2
          },
      },
      tooltip:{
          y:{
              formatter: val=> formatAmount(val)
          }
      },
      dataLabels:{
          enabled:false
      },
      yaxis:{
          labels:{
              formatter: val => formatAmount(val),
          }
      }
  };
  const series=[
  {
      name:'Ingresos',
      type:'line',
      data:serie2023
  }
  ]
  // Renderiza el gráfico

  return (
    <Paper elevation={6}>
      <Card>
          <CardHeader
              subheader='Ingresos 2023'
          />
          <CardContent>
              <ReactApexChart options={options} series={series}  height={400} width={1200} />
          </CardContent>
      </Card>
    </Paper>
  )
  }
  return (
    <Layout title="Inicio">
      <Grid container item xs={12} spacing={3}>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(dollarRate['venta'])}
              subheader='Valor USD'
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.uber.pending)}
              subheader='Pendiente de Uber'
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.incomes[currentYear].months[currentMonth].total)}
              subheader={`Ganancias de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.expenses[currentYear].months[currentMonth].total)}
              subheader={`Gastos de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(userData.finances.incomes[currentYear].months[currentMonth].total-userData.finances.expenses[currentYear].months[currentMonth].total)}
              subheader={`Balance de ${getMonthName(currentMonth)}`}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item>
          <Link to="/NuevoGasto">
            <Button variant='contained'>AÑADIR GASTO</Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/NuevoIngreso">
            <Button variant='contained'>AÑADIR INGRESO</Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to="/FinalizarJornada">
            <Button variant='contained'>FINALIZAR JORNADA UBER</Button>
          </Link>
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        {generateChartAnualSales()}
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        {generateChart()}
      </Grid>
    </Layout>
  );
};

export default Home;
