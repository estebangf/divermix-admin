import { Timestamp } from "@firebase/firestore";
import { Container, Stack, Typography, TextField, FormGroup, FormControlLabel, Button } from "@mui/material";
import { title } from "process";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import MyAppBar from "../components/MyAppBar";
import useDialogLoading from "../components/useDialogLoading";
import { editReservation, getCurrentUser, newReservation, getReservation } from "../database/firebase-functions";
import Reservation from "../models/Reservation"


interface TextFieldValue {
  value: string,
  error?: string
}
interface Values {
  description: TextFieldValue,
  date: TextFieldValue,
  phone: TextFieldValue,
  phone2: TextFieldValue,
  address: TextFieldValue,
  budget: TextFieldValue,
}


const InitialTextFieldValueValidated: TextFieldValue = {
  value: "",
  error: "Campo obligatorio"
}
const InitialTextFieldValue: TextFieldValue = {
  value: ""
}
const InitialValues: Values = {
  description: InitialTextFieldValueValidated,
  date: InitialTextFieldValueValidated,
  phone: InitialTextFieldValueValidated,
  phone2: InitialTextFieldValue,
  address: InitialTextFieldValueValidated,
  budget: InitialTextFieldValueValidated,
}


const Reserva: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [existReservation, setExistReservation] = useState<boolean>(false);
  const [values, setValues] = useState<Values>(InitialValues)

  const { id } = useParams<{ id: string }>()

  const history = useHistory()
  const Loading = useDialogLoading(true);

  const setValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let v = event.target.value;
    let name = event.target.name;
    if (v) {
      setValues({
        ...values,
        [name]: {
          value: v
        }
      })
    } else {
      setValues({
        ...values,
        [name]: {
          value: "",
          error: "Campo obligatorio"
        }
      })
    }
  }

  const isOk = () => {
    let ok =
      values.description.value &&
      values.date.value &&
      values.phone.value &&
      values.address.value &&
      parseInt(values.budget.value);

    return ok
  }


  const onSubmit = () => {
    Loading.open()
    let user = getCurrentUser()
    if (isOk() && user) {
      let reservation: Reservation = {
        description: values.description.value,
        date: Timestamp.fromDate(new Date(values.date.value)),
        phone: values.phone.value,
        phone2: values.phone2.value,
        address: values.address.value,
        budget: parseInt(values.budget.value),
        createdBy: user.uid
      }
      if (id == "new") {
        newReservation(reservation).then(() => {
          Loading.close()
          history.replace("/reservations")
        }).catch(e => {
          alert(e)
          Loading.close()
        })
      } else if (existReservation) {
        editReservation(id, reservation).then(() => {
          Loading.close()
          history.replace("/reservations")
        }).catch(e => {
          alert(e)
          Loading.close()
        })
      } else {
        alert("NO EXISTE EL MOVIMIENTO")
        Loading.close()
      }
    } else {
      alert("NO ESTÁ TODO LISTO")
      Loading.close()
    }
  }


  const dateToString = (date: Date) => {
    date.setSeconds(0)
    return new Date(date.toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0].replace("Z", "")
  }

  useEffect(() => {
    if (id != "new") {
      getReservation(id).then(r => {
        let _reservation = InitialValues;
        Object.keys(InitialValues).map(k => {
          if (k != "id")
            _reservation[k as keyof Values] = {
              ...InitialTextFieldValue,
              value: k != "date" ?
                r[k as keyof Reservation] as string :
                dateToString(r.date.toDate())
            }
        })
        setTitle("Editar Reserva")
        setExistReservation(true);
        setValues({ ..._reservation });
        Loading.close()
      }).catch(e => {
        alert(e)
        Loading.close()
      })
    } else {
      setTitle("Crear Reserva")
      Loading.close()
    }
  }, [])



  return (
    <div className="Reserva">
      <MyAppBar title={title} />
      <div className="Content">
        <Container maxWidth="sm">
          <Stack
            spacing={4}
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
                label="Fecha de la reserva"
                type="datetime-local"
                value={values.date.value}
                name="date"
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText={!!values.date.error ? values.date.error : "Ingrese una fecha"}
                error={!!values.date.error}
                onChange={setValue}
              />

              <Typography variant="h6" component="h2">
                Descripcion:
              </Typography>
              <TextField
                id="description"
                label="Detalle de la reserva"
                type="text"
                value={values.description.value}
                name="description"
                fullWidth={true}
                helperText={!!values.description.error ? values.description.error : "Ingrese una descripcion"}
                error={!!values.description.error}
                onChange={setValue}
              />

              <Typography variant="h6" component="h2">
                Telefono:
              </Typography>
              <TextField
                id="phone"
                label="Telefono"
                type="text"
                value={values.phone.value}
                name="phone"
                fullWidth={true}
                helperText={!!values.phone.error ? values.phone.error : "Ingrese un telefono"}
                error={!!values.phone.error}
                onChange={setValue}
              />


              <Typography variant="h6" component="h2">
                Telefono Alternativo:
              </Typography>
              <TextField
                id="phone2"
                label="Telefono Alternativo"
                type="text"
                value={values.phone2.value}
                name="phone2"
                fullWidth={true}
                helperText={!!values.phone2.error ? values.phone2.error : "Ingrese un telefono alternativo"}
                error={!!values.phone2.error}
                onChange={setValue}
              />


              <Typography variant="h6" component="h2">
                Direccion:
              </Typography>
              <TextField
                id="address"
                label="Direccion"
                type="text"
                value={values.address.value}
                name="address"
                fullWidth={true}
                helperText={!!values.address.error ? values.address.error : "Ingrese una direccion"}
                error={!!values.address.error}
                onChange={setValue}
              />


              <Typography variant="h6" component="h2">
                Presupuesto:
              </Typography>
              <TextField
                id="budget"
                label="Presupuesto pasado"
                type="number"
                value={values.budget.value}
                name="budget"
                fullWidth={true}
                helperText={!!values.budget.error ? values.budget.error : "Ingrese una monto"}
                error={!!values.budget.error}
                onChange={setValue}
              />

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

export default Reserva;