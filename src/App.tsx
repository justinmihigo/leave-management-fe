import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load components
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Home = React.lazy(() => import('./pages/home/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LeaveApplication = React.lazy(() => import('./pages/LeaveApplication'));
const LeaveHistory = React.lazy(() => import('./pages/LeaveHistory'));
const TeamCalendar = React.lazy(() => import('./pages/TeamCalendar'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <Switch>
            {/* Public routes */}
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />

            {/* Protected routes */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            </Route>

            <Route path="/leave/apply">
              <ProtectedRoute>
                <Layout>
                  <LeaveApplication />
                </Layout>
              </ProtectedRoute>
            </Route>

            <Route path="/leave/history">
              <ProtectedRoute>
                <Layout>
                  <LeaveHistory />
                </Layout>
              </ProtectedRoute>
            </Route>

            <Route path="/team-calendar">
              <ProtectedRoute>
                <Layout>
                  <TeamCalendar />
                </Layout>
              </ProtectedRoute>
            </Route>

            {/* Admin routes */}
            <Route path="/admin">
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            </Route>

            {/* 404 route */}
            <Route path="*" component={NotFound} />
          </Switch>
        </React.Suspense>
        <ToastContainer position="top-right" />
      </Router>
    </AuthProvider>
  );
};

export default App;