import {
  Container,
  Stack,
  TextField,
  Checkbox,
  Button,
  Icon,
  FormGroup,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';

import { Google, Facebook, Instagram } from '@mui/icons-material';
import { signInGoogle } from '../database/firebase-functions';
import useDialogLoading from '../components/useDialogLoading';

import './SignIn.css'
import useSnackbarAlert from '../components/useSnackbarAlert';
import LinkStyled from '../components/LinkStyled';

const SignIn: React.FC = () => {
  const params = useParams<{ url: string }>()
  const location = useLocation()
  const history = useHistory();
  const Loading = useDialogLoading(false);
  const SnackbarAlert = useSnackbarAlert()


  const submitSignInGoogle = () => {
    Loading.open();
    signInGoogle()
      .then(user => {
        Loading.close();
        SnackbarAlert.open({
          message: `Bienvenido ${user.email}`,
          severity: "success"
        })
        history.push("/")
      })
      .catch(error => {
        Loading.close();
        // showToast({
        //   message: "LogIn: " + error.message,
        //   duration: 2000,
        //   color: "danger"
        // })
        SnackbarAlert.open({
          message: error.message,
          severity: "error"
        })
      })
  }



  const getRouterLinkToSignUp = () => {
    if (!location.pathname.includes("/signin"))
      return '/signup' + location.pathname
    else if (!!params.url)
      return '/signup/' + params.url
    else return '/signup'
  }
  return (
    <div className="SignIn">
      <Container
        className="login-grid"
        maxWidth="xs"
      >
        <Stack
          className="Stack"
          direction="column"
          justifyContent="center"
          spacing={1}
        >
          <h2>Iniciar Sesion</h2>

          <Button variant="contained" onClick={submitSignInGoogle} className="Google">
            <Google /> Google
          </Button>
        </Stack>
      </Container>
      <Loading.component />
      <SnackbarAlert.component />
    </div>
  );
};

export default SignIn;
