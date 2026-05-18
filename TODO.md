# TODO

## Auth + role-based routing fixes
- [x] Create `TODO.md` with steps.
- [ ] Create `src/context/AuthContext.jsx` to expose `{ user, syncUser, clearUser }` globally.
- [ ] Update `src/screens/Login.jsx` handleSubmit to sync AuthContext and redirect based on JWT role.
- [ ] Replace `src/App.jsx` with protected/case-consistent routes using `ProtectedRoute` and correct `/admin` + `/merchant` paths.
- [ ] Update any remaining navigations to `/dashboard` to match the new role routes if needed (e.g., MFA success, etc.).
- [ ] Run lint/build to ensure the project compiles.

