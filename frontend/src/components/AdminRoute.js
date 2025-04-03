// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/giris-yap" replace />;
  }
  try {
    const decoded = jwtDecode(token);
    if (decoded.isAdmin === true) {
      return children;
    } else {
      // Admin değilse ana sayfaya yönlendir
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    return <Navigate to="/giris-yap" replace />;
  }
};

export default AdminRoute;
