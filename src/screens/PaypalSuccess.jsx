import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";

import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function PaypalSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const token = searchParams.get("token");
        const payerId = searchParams.get("PayerID") || searchParams.get("payer_id");

        if (!token) {
          throw new Error("Missing PayPal token in return URL.");
        }

        setStatus("loading");

        // backend captures + marks internal order PAID
        const res = await api.post("/api/payments/paypal/capture", {
          paypal_order_id: token,
          payer_id: payerId || undefined,
        });

        if (cancelled) return;
        setResult(res.data);
        setStatus("success");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(e?.response?.data?.detail || e?.message || "Payment capture failed.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="roots-checkout roots-checkout-confirmed">
      <div className="confirmed-content">
        <div className="confirmed-circle">
          <span className="confirmed-check" aria-hidden="true">
            ✦
          </span>
        </div>

        {status === "loading" && (
          <>
            <h2 className="confirmed-title">Confirming payment…</h2>
            <p className="confirmed-desc">Please wait while we verify your PayPal payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="confirmed-title">Order Placed</h2>
            <p className="confirmed-desc">Your PayPal payment was confirmed. Thank you for your order.</p>
            <button
              className="confirmed-btn"
              onClick={() => (window.location.href = "/")}
              type="button"
            >
              CONTINUE EXPLORING →
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="confirmed-title">Payment confirmation failed</h2>
            <p className="confirmed-desc">{errorMsg}</p>
            <button
              className="confirmed-btn"
              onClick={() => (window.location.href = "/checkout")}
              type="button"
            >
              RETURN TO CHECKOUT →
            </button>
          </>
        )}

        {result ? (
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap", marginTop: 16, opacity: 0.8 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}

