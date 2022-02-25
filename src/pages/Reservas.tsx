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
  DialogContentText,
  DialogActions,
  Button,
  Divider,
  Chip
} from '@mui/material';
import { useEffect, useState } from 'react';

import { Add, LockClock, Timer, Person, WhatsApp, Phone, Room, AttachMoney } from '@mui/icons-material';
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

const AÑOS = [
  2021,
  2022
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
  const [año, setAño] = useState<number>((new Date()).getFullYear())
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
    dateOfMonth.setFullYear(año, mes, 1)
    let lastDateOfMonth = new Date();
    lastDateOfMonth.setFullYear(año, mes + 1, 0)
    let monthFinished = true
    do {
      monthFinished = dateOfMonth.getDate() != lastDateOfMonth.getDate()
      if (diaSemana == dateOfMonth.getDay()) {
        // if (diaSemana != 0 || mostrarDomingo)
        ds.push({
          n: dateOfMonth.getDate(),
          r: reservations.filter(res => {
            let d = res.date.toDate()
            return d.getMonth() == dateOfMonth.getMonth() &&
              d.getDate() == dateOfMonth.getDate() &&
              d.getFullYear() == dateOfMonth.getFullYear()
          })
        })
        // else
        //   ds.push(0)
        dateOfMonth.setFullYear(año, mes, dateOfMonth.getDate() + 1)
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
            spacing={2}
          >

            <FormControl fullWidth>
              <InputLabel id="select-label-año">Año</InputLabel>
              <Select
                labelId="select-label-año"
                id="select-año"
                value={año}
                label="Año"
                onChange={e => setAño(parseInt(e.target.value as string))}
              >
                {AÑOS.map((a, i) => {
                  return <MenuItem value={a}>{a}</MenuItem>
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="select-label-mes">Mes</InputLabel>
              <Select
                labelId="select-label-mes"
                id="select-mes"
                value={mes}
                label="Mes"
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
                              {dia.r.length ? dia.r.map((rs, indexR) => {
                                return <>
                                  {indexR > 0 && dia.r.length > 1 && <Divider />}
                                  <p onClick={e => setReservationSelected(rs)}>
                                    {rs.description}<br />
                                    <Chip label={rs.date.toDate().toLocaleTimeString().slice(0, 5) + "hs"} />
                                  </p>
                                </>
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

      {
        (reservationSelected && reservationSelected.id) &&
        <Dialog onClose={e => setReservationSelected(undefined)} open={!!reservationSelected}>
          <DialogTitle>{reservationSelected.description}</DialogTitle>
          <DialogContent>
            <DialogContentText className="PropieritiView">
              <Timer className="PropieritiIcon" />
              {reservationSelected.date.toDate().toLocaleString().slice(0, 16)}hs
            </DialogContentText>
            {(reservationSelected.phone.trim() != "" && reservationSelected.phone != "0") &&
              <DialogContentText className="PropieritiView">
                <Phone className="PropieritiIcon" />
                {reservationSelected.phone}
                <a className="LinkWhatsapp" target="_blank" href={`https://api.whatsapp.com/send?phone=${reservationSelected.phone}`}>
                  <Button color='success'>Enviar<span className="blanc">__</span><WhatsApp /></Button>
                </a>
              </DialogContentText>
            }
            {(reservationSelected.phone2.trim() != "" && reservationSelected.phone2 != "0") &&
              <DialogContentText className="PropieritiView">
                <Phone className="PropieritiIcon" />
                {reservationSelected.phone2}
                <a className="LinkWhatsapp" target="_blank" href={`https://api.whatsapp.com/send?phone=${reservationSelected.phone2}`}>
                  <Button color='success'>Enviar<span className="blanc">__</span><WhatsApp /></Button>
                </a>
              </DialogContentText>
            }
            <DialogContentText className="PropieritiView">
              <Room className="PropieritiIcon" />
              {reservationSelected.address}
            </DialogContentText>
            <DialogContentText className="PropieritiView">
              <AttachMoney className="PropieritiIcon" />
              {priceFormat.format(reservationSelected.budget)}
            </DialogContentText>
            <DialogContentText className="PropieritiView">
              <Person className="PropieritiIcon" />
              {getNameToUser(reservationSelected.createdBy)}
            </DialogContentText>
            <DialogActions>
              <LinkStyled to={`/reservations/${reservationSelected.id}`}>
                <Button>Revisar</Button>
              </LinkStyled>
            </DialogActions>
          </DialogContent>
        </Dialog>
      }
    </div >
  );
};

export default Reservas;