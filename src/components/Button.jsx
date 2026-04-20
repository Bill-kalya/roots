import React from "react";
import "./Button.css";

const Button = ({ children, onClick, ...props }) => { 
  return (
    <div className="button-wrapper">
      <button className="custom-btn" onClick={onClick} {...props}>{children}</button>
    </div>
  );
};

export default Button;
