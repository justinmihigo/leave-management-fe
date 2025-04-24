import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {/* Common routes for all authenticated users */}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/leave/apply"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Apply Leave
                </Link>
                <Link
                  to="/leave/history"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Leave History
                </Link>
                <Link
                  to="/team-calendar"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Team Calendar
                </Link>
              </>
            )}

            {/* Admin-only routes */}
            {user?.role === 'Admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-blue-600"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;