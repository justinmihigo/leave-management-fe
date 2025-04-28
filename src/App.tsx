import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './auth/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeamCalendar from './pages/TeamCalendar';
import LeaveApplication from './pages/LeaveApplication';
import LeaveApproval from './pages/LeaveApproval';
import LeaveHistory from './pages/LeaveHistory';
import UserRoles from './pages/UserRoles';
import NotFound from './pages/NotFound';

const PrivateRoute: React.FC<{ children: React.ReactNode; path: string }> = ({ children, path }) => {
  const { user } = useAuth();
  return user ? <Route path={path}>{children}</Route> : <Redirect to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  return (
    <Switch>
      {/* Public Routes */}
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />

      {/* Protected Routes */}
      <PrivateRoute path="/dashboard">
        {isAdmin ? <AdminDashboard /> : <Dashboard />}
      </PrivateRoute>
      <PrivateRoute path="/team-calendar">
        <TeamCalendar />
      </PrivateRoute>
      <PrivateRoute path="/leave/apply">
        <LeaveApplication />
      </PrivateRoute>
      <PrivateRoute path="/leave/history">
        <LeaveHistory />
      </PrivateRoute>
      <PrivateRoute path="/leave/approval">
        <LeaveApproval />
      </PrivateRoute>
      <PrivateRoute path="/users">
        {isAdmin ? <UserRoles /> : <Redirect to="/dashboard" />}
      </PrivateRoute>

      {/* Default Route */}
      <Route exact path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="*" component={NotFound} />
    </Switch>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" />
      </Router>
    </AuthProvider>
  );
};

export default App;