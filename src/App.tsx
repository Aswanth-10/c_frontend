import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FormsList from './pages/FormsList';
import CreateForm from './pages/CreateForm';
import FormAnalytics from './pages/FormAnalytics';
import ResponsesList from './pages/ResponsesList';
import PublicFeedbackForm from './pages/PublicFeedbackForm';
import UserAccess from './pages/UserAccess';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes for users */}
              <Route path="/" element={<UserAccess />} />
              <Route path="/user" element={<UserAccess />} />
              <Route path="/feedback/:formId" element={<PublicFeedbackForm />} />
              
              {/* Admin authentication */}
              <Route path="/admin/login" element={<Login />} />
              
              {/* Protected admin routes */}
              <Route path="/admin" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="forms" element={<FormsList />} />
                <Route path="forms/create" element={<CreateForm />} />
                <Route path="forms/:id/analytics" element={<FormAnalytics />} />
                <Route path="responses" element={<ResponsesList />} />
              </Route>
              
              {/* Legacy redirect */}
              <Route path="/login" element={<Navigate to="/admin/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;