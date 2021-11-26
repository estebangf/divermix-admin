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
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

import { Add } from '@mui/icons-material';
import { getAllUsers, getMovements } from '../database/firebase-functions';
import useDialogLoading from '../components/useDialogLoading';

import './Movimientos.css'
import useSnackbarAlert from '../components/useSnackbarAlert';
import LinkStyled from '../components/LinkStyled';
import MyAppBar from '../components/MyAppBar';
import Movement, { Movements, MovementType } from '../models/Movement';

import { styled } from '@mui/material/styles';


import priceFormat from '../tools/priceFormat';
import { UsersProfile } from '../models/UserProfile';


const FabStyled = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 16,
  right: 16,
}));


const Movimientos: React.FC = () => {
  const [movements, setMovements] = useState<Movements>([])
  const [balances, setBalances] = useState<number[]>([])

  const [users, setUsers] = useState<UsersProfile>([])

  const Loading = useDialogLoading(true)
  const SnackbarAlert = useSnackbarAlert()


  const getAll = () => {
    getAllUsers().then(us => {
      setUsers(us);
      getMovements().then(e => {
        let bs: number[] = []
        e.forEach((m, i) => {
          let newAmount = m.amount
          if (m.type == 'egress')
            newAmount = -newAmount
          if (i != 0)
            bs.push(bs[i - 1] + newAmount)
          else
            bs.push(newAmount)
        })
        setMovements(e)
        setBalances([...bs])
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


  return (
    <div className="Movimientos">
      <MyAppBar title="Movimientos" />
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
            <TableContainer component={Paper} className="DataGrid">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell width="100" align="left">Fecha</TableCell>
                    <TableCell width="400" align="left">Descripcion</TableCell>
                    <TableCell width="250" align="right">Ingreso</TableCell>
                    <TableCell width="250" align="right">Egreso</TableCell>
                    <TableCell width="250" align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((row: Movement, i: number) => {
                    return (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child let th': { border: 0 } }}
                      >
                        <TableCell>{row.date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell component="th" scope="row">
                          <LinkStyled to={`/movements/${row.id}`}>
                            {row.description}
                          </LinkStyled>
                          <Typography variant="caption" display="block" gutterBottom>{getNameToUser(row.createdBy)}</Typography>
                        </TableCell>
                        <TableCell align="right">{row.type == 'egress' && priceFormat.format(row.amount)}</TableCell>
                        <TableCell align="right">{row.type == 'entry' && priceFormat.format(row.amount)}</TableCell>
                        <TableCell align="right">{priceFormat.format(balances[i])}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </div>
      <LinkStyled to="/movements/new">
        <FabStyled color="primary" aria-label="add">
          <Add />
        </FabStyled>
      </LinkStyled>
      <Loading.component />
      <SnackbarAlert.component />
    </div >
  );
};

export default Movimientos;





/*

import {
  Container,
  Stack,
  TextField,
  Checkbox,
  Button,
  Icon,
  FormGroup,
  FormControlLabel,
  Divider,

  IconButton,
  Toolbar,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';

import { Google, Facebook, Instagram } from '@mui/icons-material';
import { getMovements } from '../database/firebase-functions';
import useDialogLoading from '../components/useDialogLoading';
import { visuallyHidden } from '@mui/utils';

import './Movimientos.css'
import useSnackbarAlert from '../components/useSnackbarAlert';
import LinkStyled from '../components/LinkStyled';
import MyAppBar from '../components/MyAppBar';
import getComparator, { Order } from "../tools/getComparator";
import Movement, { Movements, MovementType } from '../models/Movimiento';


import priceFormat from '../tools/priceFormat';


type propertysCol = keyof Movement | MovementType | "balance"

interface DataCol {
  field: propertysCol,
  headerName: string,
  type: string,
  width: number
}

const Movimientos: React.FC = () => {
  const [movements, setMovements] = useState<Movements>([])
  const [balances, setBalances] = useState<number[]>([])

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<propertysCol>('date');

  const Loading = useDialogLoading(true)
  const SnackbarAlert = useSnackbarAlert()


  const getAll = () => {
    getMovements().then(e => {
      let bs: number[] = []
      e.forEach((m, i) => {
        let newAmount = m.amount
        if (m.type == 'egress')
          newAmount = -newAmount
        if (i != 0)
          bs.push(bs[i - 1] + newAmount)
        else
          bs.push(newAmount)
      })
      setMovements(e)
      setBalances([...bs])
      Loading.close()
    }).catch(e => {
      alert(e)
      Loading.close()
    })
  }

  useEffect(() => {
    getAll()
  }, [])


  const createSortHandler = (property: propertysCol, event: React.MouseEvent<unknown>) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getRows = () => {
    return movements.map((e, i) => {
      let movement: Movement = {
        id: e.id,
        description: e.description,
        amount: e.amount,
        type: e.type,
        date: e.date
      }
      return movement
    })
  }

  const getColumns = () => {
    function createCol(
      field: propertysCol,
      headerName: string,
      type: string,
      width: number
    ) {
      return {
        field,
        headerName,
        type,
        width,
      }
    }
    let columns: DataCol[] = [
      // createCol("id", "id", 'string', 250),
      createCol("date", "Fecha", 'Timestamp', 100),
      createCol("description", "Descripcion", 'string', 400),
      createCol("entry", "Ingreso", 'number', 250),
      createCol("egress", "Egreso", 'number', 250),
      createCol("balance", "Balance", 'number', 250),
      // createCol("type", "type", 'MovementType', 250),
    ]
    return columns
  }

  // const setEstado = (id: string, estado: EstadosMovementType, movement: string) => {
  //   Loading.open()
  //   switch (estado) {
  //     case EstadosMovementValues.PENDIENTE:
  //       changeEstadoMovement(id, EstadosMovementValues.REALIZADA, movement).then(r => {
  //         getAll()
  //       }).catch(e => {
  //         Loading.close()
  //         alert(e)
  //       })
  //       break;
  //     case EstadosMovementValues.REALIZADA:
  //       changeEstadoMovement(id, EstadosMovementValues.CANCELADA, movement).then(r => {
  //         getAll()
  //       }).catch(e => {
  //         Loading.close()
  //         alert(e)
  //       })
  //       break;
  //     case EstadosMovementValues.CANCELADA:
  //       history.push(`/revision-de-movement/${id}/edit`)
  //       break;
  //     default:
  //       break;
  //   }
  // }




  return (
    <div className="Movimientos">
      <MyAppBar title="Movimientos" />
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
            <TableContainer component={Paper} className="DataGrid">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {getColumns().map(col => {
                      return (
                        <TableCell
                          key={col.field}
                          align={!col ? 'right' : 'left'}
                          padding={!col ? 'none' : 'normal'}
                          sortDirection={orderBy === col.field ? order : false}
                        >
                          <TableSortLabel
                            active={orderBy === col.field}
                            direction={orderBy === col.field ? order : 'asc'}
                            onClick={(e) => { createSortHandler(col.field, e) }}
                          >
                            {col.headerName}
                            {orderBy === col.field ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getRows().slice().sort(getComparator(order, orderBy)).map((row: Movement, i: number) => {
                    return (
                      <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child let th': { border: 0 } }}
                      >
                        <TableCell>{row.date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell component="th" scope="row">
                          <LinkStyled to={`/movement/${row.id}`}>
                            {row.description}
                          </LinkStyled>
                        </TableCell>
                        <TableCell>{row.type == 'egress' && priceFormat.format(row.amount)}</TableCell>
                        <TableCell>{row.type == 'entry' && priceFormat.format(row.amount)}</TableCell>
                        <TableCell>{priceFormat.format(balances[i])}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </div>
      <Loading.component />
      <SnackbarAlert.component />
    </div >
  );
};

export default Movimientos;

*/