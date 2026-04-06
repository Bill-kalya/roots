import React from "react";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose, cartItems }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Basket</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="empty">Your basket is empty</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>Ksh {item.price}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <button className="checkout-btn">Checkout</button>
        </div>
      </div>
    </>
  );
}

export default CartDrawer;

