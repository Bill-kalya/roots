import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Nav from './components/Nav';
import RootsLanding from './screens/Rootslanding';
import Basket from './components/Basket';
import Checkout from './screens/Checkout';
import Login from './screens/Login';
import Register from './screens/Register';
import AdminDashboard from './screens/AdminDashboard';
import MerchantDashboard from './screens/MerchantDashboard';
import Chat from './screens/Chat';
import Artisans from './screens/Artisans';
import Origins from './screens/Origins';
import About from './screens/About';
import Theme from './components/Theme';

const AppContent = () => {
  const location = useLocation();
  return (
    <>
      <div className="theme-switch-container">
        <Theme />
      </div>
{!['/login', '/register', '/Admin', '/Merchant'].includes(location.pathname) && <Nav />}
      <Routes>
        <Route path="/" element={<RootsLanding />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Admin" element={<AdminDashboard />} />
        <Route path="/Merchant" element={<MerchantDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/artisans" element={<Artisans />} />
        <Route path="/origins" element={<Origins />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <AppContent />
    </Router>
  );
};

export default App;

