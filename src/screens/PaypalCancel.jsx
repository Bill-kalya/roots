import React from "react";
import Footer from "../components/Footer";

export default function PaypalCancel() {
  return (
    <div className="roots-checkout">
      <div className="confirmed-content" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 className="confirmed-title">Payment cancelled</h2>
        <p className="confirmed-desc">
          You cancelled the PayPal payment. No payment was captured.
        </p>
        <button
          className="confirmed-btn"
          onClick={() => (window.location.href = "/checkout")}
          type="button"
        >
          RETURN TO CHECKOUT →
        </button>
      </div>
      <Footer />
    </div>
  );
}

