import MyAppBar from "../components/MyAppBar";
import UserProfile from "../models/UserProfile";



interface UserAccountProps {
  user: UserProfile
}
const UserAccount: React.FC<UserAccountProps> = ({user}) => {



  return (
    <div className="UserAccount">
      <MyAppBar title="Perfil" />
      <h1>{user.displayName}</h1>
      <h2>{user.email}</h2>
      <h3>Verificado: {user.emailVerified}</h3>
      <h3>Telefono: {user.phoneNumber}</h3>
      <img src={user.photoURL!} />

      <h3>Roles:</h3>
      {user.roles.map(r => <h4>{r}</h4>)}
    </div>
  )
}


export default UserAccount;