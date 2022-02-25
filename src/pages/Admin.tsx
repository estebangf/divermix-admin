import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import MyAppBar from "../components/MyAppBar";
import useDialogLoading from "../components/useDialogLoading";
import { addRolToUser, getAllUsers, newEventNotification } from "../database/firebase-functions";
import UserProfile, { UsersProfile } from "../models/UserProfile";

interface AdminProps {
  user: UserProfile
}
const Admin: React.FC<AdminProps> = ({ user }) => {
  const [users, setUsers] = useState<UsersProfile>([])
  const [newNotification, setNewNotification] = useState<{
    title: string, description: string, url: string
  }>({
    title: "", description: "", url: ""
  })
  const Loading = useDialogLoading(true)

  useEffect(() => {
    getAll();
  }, [])


  const getAll = () => {
    Loading.open();
    getAllUsers().then(_users => {
      setUsers(_users);
      Loading.close();
    }).catch(e => {
      alert(e)
      Loading.close();
    })
  }

  const addUserRole = (rol: string, id: string) => {
    Loading.open();
    addRolToUser(rol, id).then(r => {
      Loading.close();
    }).catch(e => {
      alert(e)
      Loading.close();
    })
  }

  function createNotification() {
    let {
      title,
      description,
      url
    } = newNotification;
    newEventNotification(title, description, url)
  }
  return (
    <div className="Admin">
      <MyAppBar title="Admin Page" />
      <List>
        {users.map(u => {
          return <ListItem>
            <ListItemAvatar>
              <Avatar alt="Travis Howard" src={u.photoURL ? u.photoURL : ""} />
            </ListItemAvatar>
            <ListItemText
              primary={u.displayName}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {u.email}
                  </Typography>
                  {u.roles.map(r => {
                    return ` — ${r}`
                  })}
                </React.Fragment>
              }
            />
            {!u.roles.includes("user") && <Button onClick={() => addUserRole("user", u.id!)}>User</Button>}
            {!u.roles.includes("admin") && <Button onClick={() => addUserRole("admin", u.id!)}>Admin</Button>}
          </ListItem>
        })}
      </List>
      <Paper elevation={3} sx={{
        margin: 4,
        padding: 3
      }}>
        <Typography variant="h6"
          sx={{
            paddingBottom: 2
          }}>
          Nueva notificación
        </Typography>
        <TextField
          sx={{
            marginBottom: 2,
          }}
          id="text"
          label="Titulo"
          type="text"
          value={newNotification.title}
          fullWidth={true}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={!newNotification.title && "Ingrese el titulo"}
          error={!newNotification.title}
          onChange={e => setNewNotification({ ...newNotification, title: e.target.value as string })}
        />
        <TextField
          sx={{
            marginBottom: 2,
          }}
          id="text"
          label="Descripción"
          type="text"
          value={newNotification.description}
          fullWidth={true}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={!newNotification.description && "Ingrese la descripcion"}
          error={!newNotification.description}
          onChange={e => setNewNotification({ ...newNotification, description: e.target.value as string })}
        />

        <TextField
          sx={{
            marginBottom: 2,
          }}
          id="text"
          label="URL"
          type="text"
          value={newNotification.url}
          fullWidth={true}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={!newNotification.url && "Ingrese la URL"}
          error={!newNotification.url}
          onChange={e => setNewNotification({ ...newNotification, url: e.target.value as string })}
        />
        <Button onClick={() => createNotification()}>Enviar Notificacion</Button>
      </Paper>
      <Loading.component />
    </div>
  )
}


export default Admin;