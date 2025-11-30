import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<InfoPage />} />
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />
        <Route
          path="/register"
          element={<Register user={user} setUser={setUser} />}
        />
        <Route path="/forgetpass" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard user={user} />} />
        <Route path="/seller" element={<SellerDashboard user={user} />} />
        <Route path="/dashboard" element={<UserDashboard user={user} />} />

        {/* User Routes */}
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/wishlist" element={<Wishlist user={user} />} />
        <Route path="/orders" element={<Orders user={user} />} />
        <Route path="/notifications" element={<Notifications user={user} />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;