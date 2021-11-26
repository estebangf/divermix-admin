import MyAppBar from "../components/MyAppBar";
import { styled } from '@mui/material/styles';
import {
  FormControlLabel,
  Container,
  FormGroup,
  Typography,
  Stack,
  TextField,
  Button,
  Switch,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import "./Movimiento.css"
import { useEffect, useState } from 'react';
import { teal } from '@mui/material/colors';

import useDialogLoading from '../components/useDialogLoading';
import Movement, { MovementInitial } from "../models/Movement";

import { Timestamp } from "firebase/firestore";
import { editMovement, getCurrentUser, getMovement, newMovement } from "../database/firebase-functions";
import { useHistory, useParams } from "react-router";




const TypeAmountSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    color: theme.palette.error.main,
    '&.Mui-checked': {
      color: theme.palette.success.main,
      '& + .MuiSwitch-track': {
        opacity: 0.75,
        backgroundColor: theme.palette.success.light
      },
    },
  },
  '& .MuiSwitch-track': {
    opacity: 0.75,
    backgroundColor: theme.palette.error.light,
  },
}));




interface TextFieldValue {
  value: string,
  error: string | undefined
}
const initialValue: TextFieldValue = {
  value: '',
  error: undefined
}

const Movimiento: React.FC = () => {
  const [movement, setMovement] = useState<Movement>(MovementInitial)
  const [title, setTitle] = useState<string>("");

  const { id } = useParams<{ id: string }>()

  const history = useHistory()
  const Loading = useDialogLoading(true);

  const isOk = () => {
    return movement.amount > 0 && movement.description.trim() != ''
  }

  const onSubmit = () => {
    let user = getCurrentUser()
    if (isOk() && user) {
      let mov: Movement = {
        description: movement.description,
        amount: movement.amount,
        type: movement.type,
        date: movement.date,
        createdBy: user.uid
      }
      Loading.open()
      if (id == "new") {
        newMovement(movement).then(() => {
          Loading.close()
          history.replace("/movements")
        }).catch(e => {
          Loading.close()
        })
      } else if (movement.id) {
        editMovement(id, mov).then(() => {
          Loading.close()
          history.replace("/movements")
        }).catch(e => {
          Loading.close()
        })
      } else {
        alert("NO EXISTE EL MOVIMIENTO")
        Loading.close()
      }
    } else {
      alert("COMPLETAR TODO")
      Loading.close()
    }
  }

  const setFecha = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    let value = e.target.value;
    console.log("FECHA => ", value);

    if (value)
      setMovement({
        ...movement,
        date: Timestamp.fromDate(new Date(value))
      })
    else
      setMovement({
        ...movement,
        date: Timestamp.now()
      })
  }

  const dateToString = (date: Date) => {
    date.setSeconds(0)
    return new Date(date.toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0].replace("Z", "")
  }


  useEffect(() => {
    if (id != "new")
      getMovement(id).then(r => {
        setMovement({ ...r })
        setTitle("Editar Movimiento")
        Loading.close()
      }).catch(e => {
        alert(e)
        Loading.close()
      })
    else {
      setTitle("Crear Movimiento")
      Loading.close()
    }
  }, [])
  return (
    <div className="NewMovimiento">
      <MyAppBar title={title} />
      <div className="Content">
        <Container maxWidth="sm">
          <Stack
            component="form"
            noValidate
            spacing={4}
            autoComplete="off"
          >
            <Stack
              component="form"
              noValidate
              spacing={2}
              autoComplete="off"
            >
              <Typography variant="h6" component="h2">
                Fecha:
              </Typography>
              <TextField
                id="date"
                label="Fecha del movimiento"
                type="datetime-local"
                value={dateToString(movement.date.toDate())}
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={!movement.date && "Ingrese una fecha"}
                error={!movement.date}
                onChange={e => setFecha(e)}
              />

              <Typography variant="h6" component="h2">
                Descripcion:
              </Typography>
              <TextField
                id="text"
                label="Detalle del movimiento"
                type="text"
                value={movement.description}
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={!movement.description && "Ingrese una descripcion"}
                error={!movement.description}
                onChange={e => setMovement({ ...movement, description: e.target.value as string })}
              />

              <Typography variant="h6" component="h2">
                Monto:
              </Typography>
              <TextField
                id="number"
                label="Monto del movimiento"
                type="number"
                value={movement.amount}
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={!movement.amount && "Ingrese una monto"}
                error={!movement.amount}
                onChange={e => setMovement({ ...movement, amount: parseFloat(e.target.value) })}
              />

              <Typography variant="h6" component="h2">
                Tipo:
              </Typography>
              <FormGroup>
                <FormControlLabel
                  color="success"
                  control={<TypeAmountSwitch
                    checked={movement.type == "entry"}
                    onChange={e => setMovement({
                      ...movement,
                      type: movement.type == "egress" ? "entry" : "egress"
                    })} />}
                  label={movement.type == "egress" ? "Egreso" : "Ingreso"}
                />
              </FormGroup>

            </Stack>
            <Button
              disabled={!isOk()}
              color="primary"
              onClick={onSubmit}
              variant="contained"
            >Guardar</Button>
          </Stack>
        </Container>
      </div>
      <Loading.component />
    </div >
  )
}

export default Movimiento;