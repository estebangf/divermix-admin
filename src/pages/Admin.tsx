import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import MyAppBar from "../components/MyAppBar";
import useDialogLoading from "../components/useDialogLoading";
import { addRolToUser, getAllUsers } from "../database/firebase-functions";
import UserProfile, { UsersProfile } from "../models/UserProfile";

interface AdminProps {
  user: UserProfile
}
const Admin: React.FC<AdminProps> = ({user}) => {
  const [users, setUsers] = useState<UsersProfile>([])
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

  const addUserRole = (rol: string, id:string) => {
    Loading.open();
    addRolToUser(rol,id).then(r => {
      Loading.close();
    }).catch(e => {
      alert(e)
      Loading.close();
    })
  }
  return (
    <div className="Admin">
      <MyAppBar title="Admin Page" />
      <ul>
        {users.map(u => {
          return <li>
            <img src={u.photoURL ? u.photoURL : ""} alt="" />{u.displayName} {u.email}
            <Button onClick={() => addUserRole("secretaria", u.id!)}>Secretaria</Button>
            <Button onClick={() => addUserRole("docente", u.id!)}>Docente</Button>
            </li>
        })}
      </ul>
      <Loading.component />
    </div>
  )
}


export default Admin;