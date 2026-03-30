import React from 'react';
import './Cart.css';

const Cart = ({ children, onClick }) => {
  return (
    <>
      <button className="button" onClick={onClick}>
        <div className="button-outer">
          <div className="button-inner">
            <span>{children || 'ADD TO CART'}</span>
          </div>
        </div>
      </button>
    </>
  );
}

export default Cart;
