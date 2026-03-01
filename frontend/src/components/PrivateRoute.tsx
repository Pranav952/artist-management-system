import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const ctx = useContext(AuthContext);
  if (!ctx) return <Navigate to="/login" replace />;
  if (!ctx.accessToken) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute;
