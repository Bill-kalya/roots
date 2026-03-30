import React from "react";
import "./Card.css";

const Card = ({ title, subtitle, description, price, emoji, children }) => {
  return (
    <div className="card">
      <div className="card-img">{emoji}</div>
      <div className="card-body">
        <p>{subtitle}</p>
        <h3>{title}</h3>
        <p>{description}</p>
        <div>
          <span>{price}</span>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;