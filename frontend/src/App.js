import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Admin from './pages/Admin';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './assets/global.css';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/login"       element={<Auth />} />
        <Route path="/register"    element={<Auth />} />
        <Route path="/booking"     element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin"       element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/reports"     element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
        <Route path="*"            element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          duration: 3000,
          style: { fontFamily:"'Jost',sans-serif", fontSize:13, background:'#1B211A', color:'#fff', borderRadius:2, padding:'12px 18px' },
          success: { iconTheme: { primary:'#8BAE66', secondary:'#fff' } },
          error:   { iconTheme: { primary:'#c44', secondary:'#fff' } },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
