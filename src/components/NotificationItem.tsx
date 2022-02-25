import { MenuItem, Typography, IconButton, Button } from "@mui/material";
import React from "react";
import Notification from '../models/Notifications';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';

import LinkStyled from "./LinkStyled";

import "./NotificationItem.css"
import { getCurrentUser, seedNotification } from "../database/firebase-functions";

interface NotificationItemProps {
  notification: Notification
  handleClose: Function
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, handleClose }) => {
  const {
    id,
    title,
    description,
    date,
    url,
    createdBy,
    seedForUsers
  } = notification

  function onMarkReaded() {
    seedNotification(id!).then(r => {
      console.log("Leida => ", id)
    }).catch(e => {
      alert(e)
    })
  }

  const seed = () => {
    let user = getCurrentUser()
    if (user) return seedForUsers.includes(getCurrentUser()!.uid)
    else return false
  }

  function marckAndClose() {
    onMarkReaded()
    handleClose()
  }

  return (
    <MenuItem className={seed() ? "NotificationItem" : "NotificationItemUnread"}>
      <LinkStyled to={url} onClick={() => marckAndClose()} className="NotificationInformation">
        <Typography variant="overline" display="block" gutterBottom>
          {title}
        </Typography>
        <Typography variant="caption" display="block" gutterBottom className="Description">
          {description}
        </Typography>
      </LinkStyled>
      {!seed() &&
        <IconButton onClick={onMarkReaded}>
          <MarkChatReadIcon />
        </IconButton>
      }
    </MenuItem>
  );
}
export default NotificationItem;
