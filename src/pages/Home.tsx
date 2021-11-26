import MyAppBar from "../components/MyAppBar";
import { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';
import { Grid, Card, CardHeader, CardContent, AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import OptionCard from '../components/OptionCard';
import "./Home.css"
import { useHistory } from 'react-router';

const tarjetas = [
  {
    title: "Nueva Reserva",
    subTitle: "Estas son las transacciones de dinero del emprendimiento",
    description: "Revisar, filtrar, etc.",
    image: "/statics/imagens/menus/nueva_reserva.png",
    link: "/reservations/new",
    roles: ["user"]
  }, {
    title: "Reservas",
    subTitle: "Estas son las transacciones de dinero del emprendimiento",
    description: "Revisar, filtrar, etc.",
    image: "/statics/imagens/menus/ver_reservas.jpg",
    link: "/reservations",
    roles: ["user"]
  }, {
    title: "Nuevo Movimiento",
    subTitle: "Estas son las transacciones de dinero del emprendimiento",
    description: "Revisar, filtrar, etc.",
    image: "/statics/imagens/menus/nuevo_movimiento.png",
    link: "/movements/new",
    roles: ["user"]
  }, {
    title: "Movimientos",
    subTitle: "Estas son las transacciones de dinero del emprendimiento",
    description: "Revisar, filtrar, etc.",
    image: "/statics/imagens/menus/ver_movimientos.jpg",
    link: "/movements",
    roles: ["user"]
  }, {
    title: "Mi cuenta",
    subTitle: "Tus datos e informacion",
    description: "Aquí puedes encontrar tu informacion y datos personales que te identifican ante la distribuidora",
    image: "/statics/imagens/menus/mi_cuenta.jpg",
    link: "/mi-cuenta",
    roles: ["user"]
  }, {
    title: "Administracion",
    subTitle: "Panel de cambios",
    description: "Aquí podrá acceder a acciones privadas para gestionar su lista de productos",
    image: "/statics/imagens/menus/administracion.png",
    link: "/admin",
    roles: ["admin"]
  }
]


const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  background: "#ffffff",
  color: theme.palette.primary.dark
}));

interface HomeProps {
  roles: string[]
}
const Home: React.FC<HomeProps> = ({ roles }) => {
  const [keyShiftLeft, setKeyShiftLeft] = useState<boolean>(false)
  const [keyCtrl, setKeyCtrl] = useState<boolean>(false)
  const [keyX, setKeyX] = useState<boolean>(false)
  const history = useHistory()

  // const [alpha, setAlpha] = useState<number | null>();
  // const [beta, setBeta] = useState<number | null>();
  // const [gamma, setGamma] = useState<number | null>();

  function getKeyDown(event: KeyboardEvent) {
    if (event.code === "KeyX") {
      setKeyX(true)
    }
    if (event.code === "ControlLeft") {
      setKeyCtrl(true)
    }
    if (event.code === "ShiftLeft") {
      setKeyShiftLeft(true)
    }
  }
  function getKeyUp(event: KeyboardEvent) {
    if (event.code === "KeyX") {
      setKeyX(false)
    }
    if (event.code === "ControlLeft") {
      setKeyCtrl(false)
    }
    if (event.code === "ShiftLeft") {
      setKeyShiftLeft(false)
    }
  }

  // function handleFunc(event: DeviceOrientationEvent) {
  //   setAlpha(event.alpha);
  //   setBeta(event.beta);
  //   setGamma(event.gamma);
  // }

  useEffect(() => {
    if (keyX && keyCtrl && keyShiftLeft)
      history.push("/signin")

    document.addEventListener("keydown", getKeyDown, false);
    document.addEventListener('keyup', getKeyUp);

    // window.addEventListener('deviceorientation', handleFunc, false);

    return (() => {
      document.removeEventListener("keydown", getKeyDown, false);
      document.removeEventListener('keyup', getKeyUp);
      // window.removeEventListener('deviceorientation', handleFunc, false);
    })
  }, [keyShiftLeft, keyCtrl, keyX])
  return (
    <div className="Home">
      <MyAppBar title="Bienvenido" />
      <div className="Content">
        <Grid
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="stretch"
          spacing={4}
        >
          {tarjetas.filter(t => {
            return !!t.roles.filter(r => {
              return roles.includes(r) || r == "publico"
            }).length
          }).map(t => {
            return (
              <Grid item xs={12} sm={4} md={3}>
                <OptionCard
                  {...t}
                />
              </Grid>
            )
          })}
        </Grid>
      </div>
      {/*
      alpha: {alpha} <br />
      beta: {beta} <br />
      gamma: {gamma} <br />
      */}
    </div >
  )
}

export default Home;