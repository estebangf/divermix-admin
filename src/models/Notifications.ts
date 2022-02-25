import { Timestamp } from "firebase/firestore";

export default interface Notification {
  id?: string,
  title: string,
  description: string,
  date: Timestamp,
  url: string,
  createdBy: string,
  seedForUsers: string[]
}

export type Notifications = Notification[];
export type NotificationType = "entry" | "egress";

export const NotificationInitial: Notification = {
  title: "",
  description: "",
  date: Timestamp.now(),
  url: "",
  createdBy: "",
  seedForUsers: []
}