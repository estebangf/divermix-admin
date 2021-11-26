import React from "react";

import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Card, CardMedia, CardHeader, CardContent, Typography } from "@mui/material";

import LinkStyled from "./LinkStyled";

const CardStyled = styled(Card)(({ theme }) => ({
  textDecoration: "none",
  textAlign: "center",
  height: "100%"
}));

const CardMediaStyled = styled(CardMedia)(({ theme }) => ({
  margin: 12,
  paddingTop: 100,
  backgroundSize: "contain",
}));

interface OptionCardProps {
  title: string,
  subTitle: string,
  description: string,
  image: string,
  link: string
}

const OptionCard: React.FC<OptionCardProps> = (props) => {

  const {
    title,
    subTitle,
    description,
    image,
    link
  } = props;

  return (
    <LinkStyled to={link}>
      <CardStyled>
        <CardMediaStyled
          image={image}
        />
        <CardHeader
          title={title}
          subheader={subTitle}
        />
        <CardContent>
          <Typography>
            {description}
          </Typography>
        </CardContent>
      </CardStyled>
    </LinkStyled>
  );
}

/*
OptionCard.propTypes = {
  user: PropTypes.object.isRequired,
};
*/
export default OptionCard;
