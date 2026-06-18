import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import AuthProvider from './context/AuthContext.jsx';
import { useAuth } from './context/auth-context.js';
import CurrencyProvider from './contexts/CurrencyContext.jsx';


import Nav from './components/Nav';
import RootsLanding from './screens/Rootslanding';
import Basket from './components/Basket';
import Checkout from './screens/Checkout';
import Login from './screens/Login';
import Register from './screens/Register';
import AdminDashboard from './screens/AdminDashboard';
import MerchantDashboard from './screens/MerchantDashboard';
import MerchantProfile from './screens/MerchantProfile';
import MerchantPayoutSettings from './screens/MerchantPayoutSettings';

import Chat from './screens/Chat';
import Artisans from './screens/Artisans';
import Origins from './screens/Origins';
import About from './screens/About';
import Theme from './components/Theme';
import AppToaster from './components/Toaster';
import VerifyEmail from './screens/VerifyEmail';
import LoginMfaChallenge from './screens/LoginMfaChallenge';
import MfaSetup from './screens/MfaSetup';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';


import ProductDetails from './pages/ProductDetails';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';
import PaypalSuccess from './screens/PaypalSuccess';
import PaypalCancel from './screens/PaypalCancel';



// ─── Route guard ────────────────────────────────────────────────────────────

// allowedRoles: roles that may access this route.
// ADMIN always passes — highest privilege, can access everything.
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in — send to login
    return <Navigate to="/login" replace />;
  }

  // Admin can go anywhere
  if (user.role === 'ADMIN') return element;

  // Check if user's role is in the allowed list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role — send home
    return <Navigate to="/" replace />;
  }

  return element;
};

// ─── Nav visibility ─────────────────────────────────────────────────────────
const shouldHideNav = (pathname) => {
  const p = (pathname || '').toLowerCase();
  return (
    p === '/checkout' ||
    p === '/login' ||
    p === '/register' ||
    p === '/admin' ||
    p === '/merchant' ||
    p.startsWith('/admin/') ||
    p.startsWith('/merchant/')
  );
};

// ─── App shell ──────────────────────────────────────────────────────────────
const AppContent = () => {
  const location = useLocation();
  return (
    <>
      <div className="theme-switch-container">
        <Theme />
      </div>

      {!shouldHideNav(location.pathname) && <Nav />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootsLanding />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/mfa" element={<LoginMfaChallenge />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />

        <Route path="/artisans" element={<Artisans />} />
        <Route path="/origins" element={<Origins />} />
        <Route path="/about" element={<About />} />
        <Route path="/paypal/success" element={<PaypalSuccess />} />
        <Route path="/paypal/cancel" element={<PaypalCancel />} />




        {/* Protected pages */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={['USER', 'MERCHANT', 'ADMIN']}
              element={<ProfilePage />}
            />
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={['USER', 'MERCHANT', 'ADMIN']}
              element={<OrdersPage />}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={['USER', 'MERCHANT', 'ADMIN']}
              element={<SettingsPage />}
            />
          }
        />

        {/* Protected: MFA setup — any logged-in user */}
        <Route
          path="/settings/mfa"
          element={
            <ProtectedRoute
              allowedRoles={['USER', 'MERCHANT', 'ADMIN']}
              element={<MfaSetup />}
            />
          }
        />

        {/* Protected: Merchant dashboard — MERCHANT only (ADMIN passes via guard) */}
        <Route
          path="/merchant"
          element={
            <ProtectedRoute
              allowedRoles={['MERCHANT']}
              element={<MerchantDashboard />}
            />
          }
        />

        <Route
          path="/merchant/payout-settings"
          element={
            <ProtectedRoute
              allowedRoles={['MERCHANT']}
              element={<MerchantPayoutSettings />}
            />
          }
        />

        {/* Protected: Admin dashboard — ADMIN only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN']}
              element={<AdminDashboard />}
            />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

// ─── Root ────────────────────────────────────────────────────────────────────
const App = () => (
  <Router basename={import.meta.env.BASE_URL || '/'}>
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
        <AppToaster />
      </CurrencyProvider>
    </AuthProvider>
  </Router>
);

export default App;


