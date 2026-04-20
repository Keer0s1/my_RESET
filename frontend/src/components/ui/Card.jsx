import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, hoverable = false, padded = false, className = '', ...props }) => {
  const classes = [
    styles.card,
    hoverable && styles.hoverable,
    padded && styles.padded,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
