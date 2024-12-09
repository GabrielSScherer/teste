import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Hero from '../components/Hero'; // Componente público Hero
import Login from '../components/Login'; // Componente de login
import Register from '../components/Register'; // Componente de registro
import User from '../components/User'; // Componente de usuário
import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = ({ token, handleLogin, handleLogout }) => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/"
        element={
          <>
            <Hero />
          </>
        }
      />
      <Route
        path="/auth/login"
        element={
          token ? (
            <Navigate to="/user" />
          ) : (
            <Login
              onLogin={(token) => {
                handleLogin(token);
                window.location.href = '/user'; // Redireciona após login
              }}
            />
          )
        }
      />
      <Route
        path="/auth/register"
        element={
          token ? (
            <Navigate to="/user" />
          ) : (
            <Register
              onRegister={(token) => {
                handleLogin(token);
                window.location.href = '/user'; // Redireciona após registro
              }}
            />
          )
        }
      />

      {/* Rotas privadas */}
      <Route
        path="/user"
        element={
          <PrivateRoute token={token}>
            <User onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      {/* Rota padrão para redirecionar URLs inválidas */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
