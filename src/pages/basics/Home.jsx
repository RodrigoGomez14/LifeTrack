import React from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Button, Card, CardHeader, CardContent,Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import ReactApexChart from 'react-apexcharts';

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
          Object.keys(userData.finances.expenses).forEach(year=>{
            Object.keys(userData.finances.expenses[year].months).forEach(month=>{
              const auxFecha = new Date();
              auxFecha.setFullYear(year, month - 1, 1);
              if(auxFecha>=initialDate && auxFecha<=fechaActual){
                  auxPurchases[month-1]+=(userData.finances.expenses[year].months[month].totalUSD)
              }
            })
          })
        }

        if(userData.finances.incomes){
          Object.keys(userData.finances.incomes).forEach(year=>{
            Object.keys(userData.finances.incomes[year].months).forEach(month=>{
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
        
        
        arr1Meses.forEach(i=>{
            labelsUltimoAnio.push(i)
        })
        arr2Meses.forEach(i=>{
            labelsUltimoAnio.push(i)
        })
        
        arr1Sales.forEach(i=>{
            sales.push(i)
        })
        arr2Sales.forEach(i=>{
            sales.push(i)
        })

        arr1Purchases.forEach(i=>{
            purchases.push(i)
        })
        arr2Purchases.forEach(i=>{
            purchases.push(i)
        })

        sales.forEach(sale=>{
            dif.push(sale)
        })
        purchases.forEach((purchase,i)=>{
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
  return (
    <Layout title="Inicio">
      <Grid container item xs={12} spacing={3} justifyContent='center'>
        <Grid item>
          <Card>
            <CardHeader
              title={formatAmount(dollarRate['venta'])}
              subheader='Valor USD'
            />
          </Card>
        </Grid>
        <Grid item>
            <Paper elevation={6}>
                <Card>
                    <CardHeader
                        title={formatAmount(userData.savings.amountARS)}
                        subheader='Ahorros en ARS'
                    />
                </Card>
            </Paper>
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
        <Grid item>
          <Link to="/Exchange">
            <Button variant='contained'>Exchange</Button>
          </Link>
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        {generateChartAnualSales()}
      </Grid>
    </Layout>
  );
};

export default Home;
