# TODO

## Register UX: email verification success shield card
- [x] Update `src/screens/Register.jsx`: add `registered` state and remove auto-login + conditional render success shield card
- [x] Update `handleSubmit` in `src/screens/Register.jsx` to set `registered=true` after successful `register()`
- [x] Update render in `src/screens/Register.jsx`: conditional UI (form vs shield success card)
- [ ] Update `src/screens/Register.css`: add `.shield-success` styles (clip-path shield), plus any container/layout needed
- [ ] Run lint/build (if available) to ensure no syntax issues

