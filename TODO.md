# TODO - PayPal redirect + capture integration (frontend)

- [ ] Update `src/api/payments.js` with PayPal endpoints:
  - [ ] `createPaypalOrder({ amount, currency })`
  - [ ] `capturePaypalOrder({ paypal_order_id })`
- [ ] Update `src/screens/Checkout.jsx` to implement PayPal flow:
  - [ ] call create-order with totals
  - [ ] redirect browser to `approval_url`
- [ ] Add PayPal return/cancel routes and pages:
  - [ ] Create `src/screens/PaypalSuccess.jsx` (calls capture on load)
  - [ ] Create `src/screens/PaypalCancel.jsx` (shows cancelled state)
  - [ ] Wire routes in `src/App.jsx`
- [ ] Basic UI handling:
  - [ ] loading state on success
  - [ ] error message if capture fails
- [ ] Smoke test:
  - [ ] PayPal checkout redirects properly
  - [ ] PayPal redirects back to `/paypal/success`
  - [ ] capture endpoint gets called and confirmation shows

