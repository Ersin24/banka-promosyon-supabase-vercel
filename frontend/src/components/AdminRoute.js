//components/AdminRoute.js
import { Navigate } from 'react-router-dom';
import { isAdminUser } from '../utils/auth';

const AdminRoute = ({ children }) => {
  if (isAdminUser()) return children;

  // Token geçersiz veya admin değilse
  return <Navigate to="/giris-yap" replace />;
};

export default AdminRoute;
