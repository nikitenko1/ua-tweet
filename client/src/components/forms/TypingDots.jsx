import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  dotsContainer: {},
  dot: {},
  '@keyframes wave': {},
});

const TypingDots = () => {
  const classes = useStyles();
  return (
    <div className={classes.dotsContainer}>
      <span className={classes.dot}></span>
      <span className={classes.dot}></span>
      <span className={classes.dot}></span>
    </div>
  );
};

export default TypingDots;
