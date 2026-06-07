# TODO (encryption/audit fixes)

- [ ] Inspect current encryption + chat + UI wiring to ensure encryption can be end-to-end.
- [x] Plan confirmed and repo state verified by reading `src/utils/encryption.js`, `src/hooks/useChat.js`, `src/screens/Chat.jsx`, `src/screens/chat.css`.
- [x] Update `src/utils/encryption.js`: added missing `encryptMessage()` + base64url helpers; kept wire format compatible with `decryptMessage()`.
- [ ] Update `src/hooks/useChat.js`: encrypt outbound frames when key is ready; fix `read` frame targeting to use `message_id`; expose `encryptionStatus`.
- [ ] Update `src/screens/Chat.jsx`: render lock indicator using `encryptionStatus`.
- [ ] Run `npm run build` and fix any compile/lint errors.

