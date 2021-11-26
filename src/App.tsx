import React, { useEffect, useState } from 'react';
import { BrowserRouter, Switch, Redirect, Route } from "react-router-dom";
import './App.css';
import useDialogLoading from './components/useDialogLoading';
import { initStatesApp } from './database/firebase-functions';
import UserProfile from './models/UserProfile';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Movimiento from './pages/Movimiento';
import Movimientos from './pages/Movimientos';
import NotFound from './pages/NotFound';
import Reserva from './pages/Reserva';
import Reservas from './pages/Reservas';
import SignIn from './pages/SignIn';
import UserAccount from './pages/UserAccount';

function App() {
  const [user, setUser] = useState<UserProfile>();
  const [ready, setReadyState] = useState<boolean>(false)
  const Loading = useDialogLoading(true);

  function setReady(state: boolean) {
    setReadyState(state)
    if(state) Loading.close()
    else Loading.open()
  }

  useEffect(() => {
    initStatesApp(setUser, setReady)
  }, [])
  
  if (ready) return (
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      {user ?
        <Switch>
          <Route path="/" exact>
            <Home roles={user.roles} />
          </Route>
          <Route path="/mi-cuenta" exact>
            <UserAccount user={user} />
          </Route>
          <Route path="/movements" exact>
            <Movimientos />
          </Route>
          <Route path="/movements/:id" exact>
            <Movimiento />
          </Route>
          <Route path="/reservations" exact>
            <Reservas />
          </Route>
          <Route path="/reservations/:id" exact>
            <Reserva />
          </Route>
          <Route path="/admin" exact>
            {user.roles.includes("admin") ? <Admin user={user} /> : <NotFound />}
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
        :
        <SignIn />
      }
    </BrowserRouter>
  );
  else return (
    <Loading.component />
  );
}

export default App;
