import { Dialog, Stack, CircularProgress } from "@mui/material";
import { useState } from 'react';

import "./useDialogLoading.css"


function useDialogLoading(init: boolean) {

  const [open, setOpen] = useState<boolean>(init)

  return {
    component: () => (
      <Dialog open={open}>
        <Stack className="DialogProgress" sx={{ color: 'grey.500' }}
          justifyContent="center"
          alignItems="center"
          spacing={3}
          direction="column">
          <CircularProgress />
          <h6>Cargando Datos</h6>
        </Stack>
      </Dialog>
    ),
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}

export default useDialogLoading;