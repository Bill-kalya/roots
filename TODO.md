# TODO

## Current issue: CartContext export mismatch

- [ ] Update `src/contexts/CartContext.jsx` to export `useCart` (named export) matching `CartDrawer.jsx` import.
- [ ] Ensure the file also exports `CartProvider` (if it’s used anywhere else) and keeps existing default export behavior.
- [ ] Run `npm test` / `npm run lint` (or `npm run dev` build check) to confirm the runtime error is gone.

