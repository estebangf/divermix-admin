import { Timestamp } from "firebase/firestore";

export default interface Reservation {
  id?: string,
  description: string,
  date: Timestamp,
  phone: string,
  phone2: string,
  address: string,
  budget: number,
  createdBy: string
}

export type Reservations = Reservation[]