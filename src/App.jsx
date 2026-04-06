import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from './components/Nav';
import RootsLanding from './screens/Rootslanding';
import Basket from './components/Basket';

const App = () => {
  return (
<Router basename="/roots">
      <Nav />
      <Routes>
        <Route path="/" element={<RootsLanding />} />
        <Route path="/basket" element={<Basket />} />
      </Routes>
    </Router>
  );
};

export default App;
