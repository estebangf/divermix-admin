export default interface UserProfile {
  id?: string,
  displayName: string | null,
  email: string | null,
  emailVerified?: boolean,
  phoneNumber: string | null,
  photoURL: string | null,

  roles: string[]
}

export type UsersProfile = UserProfile[];