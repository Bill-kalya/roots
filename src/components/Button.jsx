import React from "react";
import "./Button.css";

const Button = ({ children }) => { 
  return (
    <div className="button-wrapper">
      <button className="custom-btn">{children}</button>
    </div>
  );
};

export default Button;
