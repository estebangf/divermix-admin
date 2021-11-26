import { styled } from '@mui/material/styles';

import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';



const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  background: "#ffffff",
  color: theme.palette.primary.dark
}));

interface PropsMyAppBar {
  title: string
}


const MyAppBar: React.FC<PropsMyAppBar> = ({title}) => {
  return (
      <AppBar position="sticky">
        <ToolbarStyled>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            {title}
          </Typography>
        </ToolbarStyled>
      </AppBar>
      )
}

export default MyAppBar;