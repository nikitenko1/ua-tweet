import React, { useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const Modal = (props) => {
  const modal = useRef();

  const handleClick = useCallback(
    (e) => {
      if (e.target === modal.current) {
        props.onClose();
      }
    },
    [props]
  );

  useEffect(() => {
    window.addEventListener('click', handleClick);

    // removeEventListener(type, listener); https://developer.mozilla.org/
    // type A string which specifies the type of event for which to remove an event listener
    // listener The EventListener function of the event handler to remove from the event target
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return ReactDOM.createPortal(
    <div ref={modal} className="modalContainer">
      <div className="modal">{props.children}</div>
    </div>,
    document.getElementById('portal')
  );
};

export default Modal;
