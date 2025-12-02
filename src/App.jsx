import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Profile from "./components/user/Profile.jsx";
import Cart from "./components/user/Cart.jsx";
import Wishlist from "./components/user/Wistlist.jsx";
import Orders from "./components/user/Orders.jsx";
import Notifications from "./components/user/Notifications.jsx";
import InfoPage from "./InfoPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Protected Route Component
const ProtectedRoute = ({ children, user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<InfoPage />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={
                user.role === 'admin' ? '/admin' : 
                user.role === 'seller' ? '/seller' : 
                '/dashboard'
              } replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={
                user.role === 'admin' ? '/admin' : 
                user.role === 'seller' ? '/seller' : 
                '/dashboard'
              } replace />
            ) : (
              <Register setUser={setUser} />
            )
          }
        />
        <Route path="/forgetpass" element={<ForgotPassword />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <AdminDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller" 
          element={
            <ProtectedRoute user={user} allowedRoles={['seller']}>
              <SellerDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user} allowedRoles={['user']}>
              <UserDashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />

        {/* Protected User Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute user={user}>
              <Cart user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute user={user}>
              <Wishlist user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute user={user}>
              <Orders user={user} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute user={user}>
              <Notifications user={user} />
            </ProtectedRoute>
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;