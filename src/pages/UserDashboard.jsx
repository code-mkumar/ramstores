import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ShoppingCart, Heart, Package, Bell } from "lucide-react";
import API from "../utils/api";
import ProductList from "../components/user/ProductList";
import UserHeader from "../components/user/Header";

export default function UserDashboard({ user }) {
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadCartCount();
    loadNotifications();
  }, []);


  const loadCartCount = async () => {
    try {
      const res = await API.get(`/cart/${user.id}`);
      setCartCount(res.data.length || 0);
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await API.get("/user/notifications");
      if (res.data.success) {
        const unread = res.data.notifications.filter(n => !n.is_read);
        setNotifications(unread);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await API.post("/cart/add", {
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      });
      loadCartCount();
      alert("Added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await API.post("/user/wishlist", { product_id: product.id });
      alert("Added to wishlist!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to wishlist");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative"
      }}
    >
      {/* Animated Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('https://www.transparenttextures.com/patterns/cubes.png')",
          opacity: 0.1,
          zIndex: 0
        }}
      />

      <UserHeader
        user={user}
        onSearch={handleSearch}
        cartCount={cartCount}
        notifications={notifications}
      />

      <div className="container py-4 position-relative" style={{ zIndex: 5 }}>
        {/* Welcome Section */}
        <section className="py-3">
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div className="row align-items-center">
              <div className="col-md-8">
                <h2 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                  Welcome back, {user.full_name || user.username}! 👋
                </h2>
                <p className="text-muted mb-0">
                  Explore our collection and find what you're looking for
                </p>
              </div>
              <div className="col-md-4">
                <div className="row g-2">
                  <div className="col-6">
                    <Link
                      to="/cart"
                      className="btn btn-primary w-100 d-flex flex-column align-items-center py-3"
                      style={{ borderRadius: "12px" }}
                    >
                      <ShoppingCart size={24} />
                      <small className="mt-1">Cart ({cartCount})</small>
                    </Link>
                  </div>
                  <div className="col-6">
                    <Link
                      to="/wishlist"
                      className="btn btn-outline-danger w-100 d-flex flex-column align-items-center py-3"
                      style={{ borderRadius: "12px" }}
                    >
                      <Heart size={24} />
                      <small className="mt-1">Wishlist</small>
                    </Link>
                  </div>
                  <div className="col-6">
                    <Link
                      to="/orders"
                      className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                      style={{ borderRadius: "12px" }}
                    >
                      <Package size={24} />
                      <small className="mt-1">Orders</small>
                    </Link>
                  </div>
                  <div className="col-6">
                    <Link
                      to="/notifications"
                      className="btn btn-outline-warning w-100 d-flex flex-column align-items-center py-3 position-relative"
                      style={{ borderRadius: "12px" }}
                    >
                      <Bell size={24} />
                      <small className="mt-1">Alerts</small>
                      {notifications.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {notifications.length}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-3">
          <div
            className="card border-0 shadow-lg p-4"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            <ProductList
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        </section>
      </div>
    </div>
  );
}