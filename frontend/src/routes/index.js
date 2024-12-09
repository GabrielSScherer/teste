import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import existing components
import Login from '../components/Login';
import Register from '../components/Register';
import Profile from '../components/Profile';
import Game from '../components/Game';

const root = ReactDOM.createRoot(document.getElementById('root'));
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
          <Route path="/game/:id" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
