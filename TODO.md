# TODO

- [x] Inspect current implementation of token store adapter and auth APIs.
- [x] Validate whether the reported self-referential TDZ exists.
- [x] Locate where `tokenStoreLegacy` / `tokenStore` is imported and used.
- [ ] Implement canonical adapter changes (remove any self-reference, ensure required methods exist: get/set/getRefresh/setRefresh/clear/persist/session).
- [ ] Run lint/build/tests (or at least Vite build) to confirm no runtime/import errors.
- [ ] Update follow-up notes if any additional file needs edits.

