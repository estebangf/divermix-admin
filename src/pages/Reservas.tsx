import {
  Container,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  InputLabel,
  Checkbox,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@mui/material';
import { useEffect, useState } from 'react';

import { Add } from '@mui/icons-material';
import { getAllUsers, getReservations } from '../database/firebase-functions';
import useDialogLoading from '../components/useDialogLoading';

import './Reservas.css'
import useSnackbarAlert from '../components/useSnackbarAlert';
import LinkStyled from '../components/LinkStyled';
import MyAppBar from '../components/MyAppBar';
import Reservation, { Reservations } from '../models/Reservation';

import { styled } from '@mui/material/styles';


import priceFormat from '../tools/priceFormat';
import { UsersProfile } from '../models/UserProfile';


const FabStyled = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 16,
  right: 16,
}));


const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

interface Dia {
  n?: number,
  r: Reservations
}

const Reservas: React.FC = () => {
  const [reservations, setReservations] = useState<Reservations>([])
  const [reservationSelected, setReservationSelected] = useState<Reservation>()
  const [mostrarDomingo, setMostrarDomingo] = useState<boolean>(false)
  const [mes, setMes] = useState<number>((new Date()).getMonth())

  const [users, setUsers] = useState<UsersProfile>([])

  const Loading = useDialogLoading(true)
  const SnackbarAlert = useSnackbarAlert()


  const getAll = () => {
    getAllUsers().then(us => {
      setUsers(us);
      getReservations().then(e => {
        setReservations(e)
        Loading.close()
      }).catch(e => {
        alert(e)
        Loading.close()
      })
    }).catch(e => {
      alert(e)
      Loading.close()
    })
  }


  useEffect(() => {
    getAll()
  }, [])


  const getNameToUser = (idUser: string) => {
    let user = users.find(e => e.id == idUser)
    return user ? user.displayName : "Sin nombre"
  }

  function semanas() {
    let ss: Dia[][] = []
    let ds: Dia[] = []
    let diaSemana = 0;
    let dateOfMonth = new Date();
    dateOfMonth.setFullYear(2021, mes, 1)
    let lastDateOfMonth = new Date();
    lastDateOfMonth.setFullYear(2021, mes + 1, 0)
    let monthFinished = true
    do {
      monthFinished = dateOfMonth.getDate() != lastDateOfMonth.getDate()
      if (diaSemana == dateOfMonth.getDay()) {
        // if (diaSemana != 0 || mostrarDomingo)
        ds.push({
          n: dateOfMonth.getDate(),
          r: reservations.filter(res => {
            let d = res.date.toDate()
            return d.getMonth() == dateOfMonth.getMonth() && d.getDate() == dateOfMonth.getDate()
          })
        })
        // else
        //   ds.push(0)
        dateOfMonth.setFullYear(2021, mes, dateOfMonth.getDate() + 1)
      } else {
        // if (diaSemana != 0 || mostrarDomingo)
        ds.push({ r: [] })
        // else
        //   ds.push(0)
      }
      if (++diaSemana == 7) {
        diaSemana = 0
        ss.push(ds)
        ds = []
      }
    } while (monthFinished)
    for (let i = diaSemana; i < 7; i++) {
      ds.push({ r: [] })
    }
    ss.push(ds)
    ds = []
    return ss;
  }
  return (
    <div className="Reservas">
      <MyAppBar title="Reservas" />
      <div className="Content">
        <Container
          className="login-grid"
          maxWidth="md"
        >
          <Stack
            className="Stack"
            direction="column"
            justifyContent="center"
            spacing={1}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Mes</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={mes}
                label="Age"
                onChange={e => setMes(parseInt(e.target.value as string))}
              >
                {MESES.map((m, i) => {
                  return <MenuItem value={i}>{m}</MenuItem>
                })}
              </Select>
            </FormControl>

            <FormControlLabel
              label="Mostrar Domingo"
              control={
                <Checkbox
                  checked={mostrarDomingo}
                  onChange={e => setMostrarDomingo(!mostrarDomingo)}
                />
              }
            />
            <TableContainer component={Paper} className="DataGrid">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {DIAS.map((dia, indexDia) => {
                      if (indexDia == 0 && mostrarDomingo || indexDia != 0)
                        return <TableCell align="center">{dia}</TableCell>
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {semanas().map((semana, indexSemana) => {
                    return (
                      <TableRow
                        key={"s_" + indexSemana}
                        sx={{ '&:last-child td, &:last-child let th': { borderBottom: 0 } }}
                      >
                        {semana.map((dia, indexDia) => {
                          if (indexDia == 0 && mostrarDomingo || indexDia != 0)
                            return <TableCell align="right">
                              {dia.n}
                              {dia.r.length ? dia.r.map(rs => {
                                return <p onClick={e => setReservationSelected(rs)}>{rs.description} {rs.date.toDate().toLocaleTimeString().slice(0, 5)}hs</p>
                              }) : ""}
                            </TableCell>
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </div>
      <LinkStyled to="/reservations/new">
        <FabStyled color="primary" aria-label="add">
          <Add />
        </FabStyled>
      </LinkStyled>
      <Loading.component />
      <SnackbarAlert.component />

      {reservationSelected &&
        <Dialog onClose={e => setReservationSelected(undefined)} open={!!reservationSelected}>
          <DialogTitle>{reservationSelected.description}</DialogTitle>
          <DialogContent>
            <DialogContentText>{reservationSelected.date.toDate().toLocaleString().slice(0, 16)}hs</DialogContentText>
            <DialogContentText>{reservationSelected.phone}</DialogContentText>
            <DialogContentText>{reservationSelected.phone2}</DialogContentText>
            <DialogContentText>{reservationSelected.address}</DialogContentText>
            <DialogContentText>{priceFormat.format(reservationSelected.budget)}</DialogContentText>
            <DialogContentText>{getNameToUser(reservationSelected?.createdBy)}</DialogContentText>
          </DialogContent>
        </Dialog>
      }
    </div >
  );
};

export default Reservas;


/*

import {
  Container,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useEffect, useState } from 'react';

import { Add } from '@mui/icons-material';
import { getAllUsers, getReservations } from '../database/firebase-functions';
import useDialogLoading from '../components/useDialogLoading';

import './Reservas.css'
import useSnackbarAlert from '../components/useSnackbarAlert';
import LinkStyled from '../components/LinkStyled';
import MyAppBar from '../components/MyAppBar';
import Reservation, { Reservations } from '../models/Reservation';

import { styled } from '@mui/material/styles';


import priceFormat from '../tools/priceFormat';
import { UsersProfile } from '../models/UserProfile';


const FabStyled = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 16,
  right: 16,
}));


const DIAS = [
  // "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sábado"
]

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

interface Dia {
  n?: number,
  r: Reservations
}

const Reservas: React.FC = () => {
  const [reservations, setReservations] = useState<Reservations>([])
  const [mes, setMes] = useState<number>((new Date()).getMonth())

  const [users, setUsers] = useState<UsersProfile>([])

  const Loading = useDialogLoading(true)
  const SnackbarAlert = useSnackbarAlert()


  const getAll = () => {
    getAllUsers().then(us => {
      setUsers(us);
      getReservations().then(e => {
        setReservations(e)
        Loading.close()
      }).catch(e => {
        alert(e)
        Loading.close()
      })
    }).catch(e => {
      alert(e)
      Loading.close()
    })
  }


  useEffect(() => {
    getAll()
  }, [])


  const getNameToUser = (idUser: string) => {
    let user = users.find(e => e.id == idUser)
    return user ? user.displayName : "Sin nombre"
  }

  const dias = () => {
    let ds: Dia[] = []
    let diaSemana = 0;
    let dateOfMonth = new Date();
    dateOfMonth.setFullYear(2021, mes, 1)
    let lastDateOfMonth = new Date();
    lastDateOfMonth.setFullYear(2021, mes + 1, 0)
    let monthFinished = true
    do {
      monthFinished = dateOfMonth.getDate() != lastDateOfMonth.getDate()
      if (diaSemana == dateOfMonth.getDay()) {
        if (diaSemana != 0)
          ds.push({
            n: dateOfMonth.getDate(),
            r: reservations.filter(res => {
              let d = res.date.toDate()
              return d.getMonth() == dateOfMonth.getMonth() && d.getDate() == dateOfMonth.getDate()
            })
          })
        // else
        //   ds.push(0)
        dateOfMonth.setFullYear(2021, mes, dateOfMonth.getDate() + 1)
      } else {
        if (diaSemana != 0)
          ds.push({ r: [] })
        // else
        //   ds.push(0)
      }
      if (++diaSemana == 7)
        diaSemana = 0
    } while (monthFinished)
    for (let i = diaSemana; i < 7; i++) {
      ds.push({ r: [] })
    }
    return ds;
  }
  return (
    <div className="Reservas">
      <MyAppBar title="Reservas" />
      <div className="Content">
        <Container
          className="login-grid"
          maxWidth="md"
        >
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={mes}
              label="Age"
              onChange={e => setMes(parseInt(e.target.value as string))}
            >
              {MESES.map((m, i) => {
                return <MenuItem value={i}>{m}</MenuItem>
              })}
            </Select>
          </FormControl>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={2}
          >
            {DIAS.map(d => {
              return <Grid item xs={2}>
                {d}
              </Grid>
            })}
            {dias().map((d, i) => {
              return <>
                <Grid item xs={2}>
                  <Paper sx={{ minHeight: "100%", width: "100%" }} className="Dia" >
                    {d.n ? <>
                      {d.n}<br />
                      {d.r.length ? d.r.map(rs => {
                        return <p>{rs.description} {rs.date.toDate().toLocaleTimeString().slice(0, 5)}hs</p>
                      })
                        :
                        <div className="Vacio" />
                      }
                    </>
                      :
                      <div className="Vacio" />
                    }
                  </Paper>
                </Grid>
              </>
            })}
          </Grid>
        </Container>
      </div>
      <LinkStyled to="/reservations/new">
        <FabStyled color="primary" aria-label="add">
          <Add />
        </FabStyled>
      </LinkStyled>
      <Loading.component />
      <SnackbarAlert.component />
    </div >
  );
};

export default Reservas;

*/