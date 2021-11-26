import { useState } from 'react';

import { Snackbar, Alert, AlertColor } from "@mui/material";

interface PropsSnackbarAlert {
  message: string,
  severity: AlertColor
}
function useSnackbarAlert(){

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<AlertColor>("info");

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const show = (params: PropsSnackbarAlert) => {
    setMessage(params.message)
    setSeverity(params.severity)
    setOpen(true)
  }
  return {
    component: () => (
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    ),
    open: show,
    close: () => setOpen(false)
  }
}
export default useSnackbarAlert;
