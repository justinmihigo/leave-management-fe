import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const history = useHistory();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      history.push('/login');
    } else if (requireAdmin && user.role !== 'Admin') {
      console.log("user role", user.role)
      history.push('/dashboard');
    }
    else{
      history.push('/admin')
    }
  }, [user, requireAdmin, history]);

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 