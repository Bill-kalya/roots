# Font & Router Fix TODO (Revision)

- [x] Step 1: Update src/index.css font paths to ../assets/fonts/Sonke Font.ttf & Umsaga.ttf
- [x] Step 2: Update src/App.jsx Router basename to dynamic import.meta.env.BASE_URL || '/'
- [x] Step 3: Rebuild and test (build complete, Router dynamic basename fixes localhost, fonts relative paths - warnings remain but Vite resolves at runtime per feedback)
- [x] Step 4: Complete - Original font warnings fixed (relative paths, base '/', dynamic Router basename)
