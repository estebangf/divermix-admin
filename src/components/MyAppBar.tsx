import { styled } from '@mui/material/styles';

import { AppBar, IconButton, Toolbar, Typography, Badge, Avatar, Divider, ListItemIcon, Menu, MenuItem, List, ListItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useEffect, useState, useRef } from 'react';
import Notification, { Notifications } from '../models/Notifications';
import { getCurrentUser, newNotification, onSnapshotNotifications } from '../database/firebase-functions';
import { PersonAdd, Settings, Logout } from '@mui/icons-material';
import React from 'react';
import { Timestamp } from 'firebase/firestore';
import NotificationItem from './NotificationItem';

import "./MyAppBar.css"

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  background: "#ffffff",
  color: theme.palette.primary.dark
}));

interface PropsMyAppBar {
  title: string
}


const MyAppBar: React.FC<PropsMyAppBar> = ({ title }) => {
  const [notifications, setNotifications] = useState<Notifications>([]);
  const [unReaded, setUnReaded] = useState<number>(0);

  const [anchorElNoty, setAnchorElNoty] = useState<null | HTMLElement>(null);
  const openNoty = Boolean(anchorElNoty);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNoty(event.currentTarget)
  };
  const handleClose = () => {
    setAnchorElNoty(null)
  };



  useEffect(() => {
    getAll();
  }, [])

  function _setNotifications(_notifications: Notifications) {
    let user = getCurrentUser();
    let _unReaded = _notifications.filter(_notification => {
      return !_notification.seedForUsers.includes(user!.uid)
    }).length
    setUnReaded(_unReaded)
    setNotifications(_notifications)
  }

  function getAll() {
    onSnapshotNotifications(_setNotifications)
    // getNotifications().then(_notifications => {
    //   setNotifications(_notifications)
    // })
  }
  return (
    <AppBar className="MyAppBar" position="sticky">
      <ToolbarStyled>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton
          onClick={handleClick}
          sx={{ ml: 2 }}
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
          id="NotificationIcon"
        >
          {unReaded > 0 ?
            <Badge badgeContent={unReaded} color="error">
              <NotificationsIcon />
            </Badge> :
            <NotificationsIcon color="disabled" />
          }
        </IconButton>
      </ToolbarStyled>

      <Menu
        anchorEl={anchorElNoty}
        open={openNoty}
        className="BoxNotifications"
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: "75%",
          },
        }}
      >
        {notifications.map((notification, indexN) => {
          return (<>
            {indexN > 0 && <Divider className="Divider" />}
            <NotificationItem handleClose={handleClose} notification={notification} />
          </>)
        })}
        {notifications.length == 0 &&
          <MenuItem>No tienes notificaciones.</MenuItem>
        }
      </Menu>
    </AppBar >
  )
}

export default MyAppBar;