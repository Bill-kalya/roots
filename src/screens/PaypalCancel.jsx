import React, { useEffect } from "react";
import Footer from "../components/Footer";

import { useSearchParams } from "react-router-dom";
import { cancelPaypalOrder } from "../api/payments";

export default function PaypalCancel() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function run() {
      try {
        const token = searchParams.get("token");
        if (!token) return;
        // Tell the backend to fail the pending PayPal payment so it doesn't
        // linger as PENDING. Failures here are non-fatal (timeout reaper).
        await cancelPaypalOrder({ paypal_order_id: token });
      } catch {
        // ignore — cancellation is best-effort
      }
    }

    run();
  }, [searchParams]);

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
