import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header'; // Navbar pública
import PrivateNavbar from './components/PrivateHeader'; // Navbar privada
import AppRoutes from './routes/AppRoutes'; // Rotas centralizadas

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      {token ? <PrivateNavbar onLogout={handleLogout} /> : <Header />}
      <AppRoutes token={token} handleLogin={handleLogin} handleLogout={handleLogout} />

    </Router>
  );
}

export default App;
