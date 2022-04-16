import React from 'react';

const Spinner = ({ w = 25, h = 25 }) => {
  const style = {
    width: `${w}px`,
    height: `${h}px`,
  };
  return (
    <div className="spinner" style={style}>
      Loading ...
    </div>
  );
};

export default Spinner;
