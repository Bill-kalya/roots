import { useMemo, useRef } from "react";
import "./PaymentReceipt.css";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function PaymentReceipt({ order, onClose }) {
  const receiptRef = useRef(null);

  const fmt = useMemo(() => {
    const currency = order?.currency ?? "KES";

    return (n) =>
      new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency,
      }).format(Number(n ?? 0));
  }, [order?.currency]);

  if (!order) return null;

  const paymentLabel =
    {
      card: "CARD PAYMENT",
      paypal: "PAYPAL PAYMENT",
      mpesa: "M-PESA PAYMENT",
    }[order?.payment_method] ??
    String(order?.payment_method ?? "").toUpperCase();

  const handleDownload = () => {
    const createdAtStr = order?.created_at
      ? new Date(order.created_at).toLocaleString("en-KE", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "";

    const s = (v) => escapeHtml(v);

    const itemsHtml = (order?.items ?? [])
      .map((item) => {
        const qty = Number(item?.quantity ?? 0);
        const unit = Number(item?.unit_price ?? item?.price ?? 0);

        return `
          <tr>
            <td>${s(item?.name ?? "")}</td>
            <td>${qty}</td>
            <td>${s(fmt(qty * unit))}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Roots Receipt</title>
<style>
body{
  font-family: Arial, sans-serif;
  padding:40px;
  max-width:700px;
  margin:auto;
}
table{
  width:100%;
  border-collapse:collapse;
}
th,td{
  padding:10px;
  border-bottom:1px solid #ddd;
}
</style>
</head>
<body>

<h1>ROOTS</h1>
<h2>Payment Receipt</h2>

<p><strong>Receipt ID:</strong> ${s(order?.receipt_id ?? "")}</p>
<p><strong>Date:</strong> ${s(createdAtStr)}</p>
<p><strong>Payment Method:</strong> ${s(paymentLabel)}</p>

<table>
<thead>
<tr>
<th>Item</th>
<th>Qty</th>
<th>Amount</th>
</tr>
</thead>
<tbody>
${itemsHtml}
</tbody>
</table>

<p><strong>Subtotal:</strong> ${s(fmt(order?.subtotal ?? 0))}</p>
<p><strong>Shipping:</strong> ${s(fmt(order?.shipping_fee ?? 0))}</p>
<p><strong>Total Paid:</strong> ${s(fmt(order?.total ?? 0))}</p>

</body>
</html>
`;

    const blob = new Blob([html], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Roots-Receipt-${order?.receipt_id ?? "download"}.html`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal" ref={receiptRef}>
        <div className="receipt-brand">
          <div className="receipt-brand-name">Roots</div>
          <div className="receipt-brand-tag">
            African Art &amp; Craft
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-id-block">
          <span className="receipt-id-label">
            Payment Receipt
          </span>
          <span className="receipt-id-value">
            {order.receipt_id}
          </span>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-actions">
          <button
            type="button"
            className="receipt-download-btn"
            onClick={handleDownload}
          >
            Download Receipt
          </button>

          {onClose && (
            <button
              type="button"
              className="receipt-close-btn"
              onClick={onClose}
            >
              Continue Exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}