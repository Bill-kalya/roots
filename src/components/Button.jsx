import React from "react";
import "./Button.css";

const Button = ({ children, icon, onClick, ...props }) => { 
  return (
    <div className="button-wrapper">
      <button className={`custom-btn ${icon ? 'icon-only' : ''}`} onClick={onClick} {...props}>
        {icon && <span className="btn-icon">{icon}</span>}
{children && <span className="btn-text">{children}</span>}
      </button>
    </div>
  );
};

export default Button;
