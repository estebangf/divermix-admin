import { Timestamp } from "firebase/firestore";

export default interface Movement {
  id?: string,
  description: string,
  amount: number,
  type: MovementType,
  date: Timestamp,
  createdBy: string
}

export type Movements = Movement[];
export type MovementType = "entry" | "egress";

export const MovementInitial: Movement = {
  description: "",
  amount: 0,
  type: "entry",
  date: Timestamp.now(),
  createdBy: ""
} 

