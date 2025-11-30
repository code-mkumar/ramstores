import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Bell, Heart, Package, X } from "lucide-react";
import API,{baseAPI} from "../../utils/api";
import logo from "../../assets/logo.png";

export default function UserHeader({
  notifications = [],
  cartCount = 0,
  user = {}
}) {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();



  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    if (user && user.id) {
      loadOrders();
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      if (res.data.success) {
        const img = res.data.user.profile_image;
        setProfileImage(img);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await API.get("/user/orders");
      if (res.data.success) {
        setOrders(res.data.orders);
        setOrdersCount(res.data.pending_count || 0);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const profileImageSrc = `${baseAPI}${profileImage}`;

  return (
    <>
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3 shadow-sm position-relative"
        style={{
          background: scrolled
            ? "linear-gradient(90deg, #1e40af, #3b82f6, #a78bfa)"
            : "linear-gradient(90deg, rgba(30,64,175,0.55), rgba(59,130,246,0.55), rgba(167,139,250,0.55))",
          backdropFilter: "blur(10px)",
          transition: "background 0.3s ease-in-out",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          borderRadius: "0 0 18px 18px",
        }}
      >
        {/* LOGO */}
        <Link to="/" className="d-flex align-items-center">
          <img src={logo} alt="Logo" style={{ height: 55 }} />
        </Link>

        {/* RAM STORES TEXT */}
        <div className="flex-grow-1 text-center">
          <h2 
            className="mb-0 fw-bold" 
            style={{ 
              color: "white", 
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "2px"
            }}
          >
            RAM STORES
          </h2>
        </div>

        {/* RIGHT ICONS */}
        <div className="d-flex align-items-center gap-4">
          {/* Wishlist - Hidden on mobile */}
          <Link to="/wishlist" className="position-relative d-none d-md-flex">
            <Heart size={22} color="#fc0303ff" />
          </Link>

          {/* Notifications - Hidden on mobile */}
          <Link to="/notifications" className="position-relative d-none d-md-flex">
            <Bell size={22} color="#f8fc03ff" />
            {notifications.length > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {notifications.length}
              </span>
            )}
          </Link>

          {/* Cart - Always visible */}
          <Link to="/cart" className="position-relative">
            <ShoppingCart size={26} color="#d4cdbeff" />
            {cartCount > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {cartCount}
              </span>
            )}
          </Link>

          {/* My Orders - Hidden on mobile */}
          <Link to="/orders" className="position-relative d-none d-md-flex">
            <Package size={22} color="#5c4f07ff" />
            {ordersCount > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {ordersCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <div className="position-relative">
            {window.innerWidth >= 768 ? (
              <Link to="/profile">
                <img
                  src={profileImageSrc}
                  alt="User"
                  style={{
                    height: "45px",
                    width: "45px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onError={(e) => {
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
              </Link>
            ) : (
              <button
                type="button"
                className="border-0 bg-transparent p-0"
                onClick={toggleModal}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={profileImageSrc}
                  alt="User"
                  style={{
                    height: "45px",
                    width: "45px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-sm modal-dialog-centered"
            style={{ maxWidth: "300px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content rounded-4 border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                color: "white",
              }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: "white" }}>Menu</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  aria-label="Close"
                  style={{ filter: "invert(1)" }}
                >
                </button>
              </div>
              <div className="modal-body pt-2 pb-4">
                <div className="d-flex flex-column gap-3">
                  <Link
                    to="/profile"
                    className="d-flex align-items-center text-decoration-none py-2 px-3 rounded-3"
                    style={{ transition: "background 0.2s", color: "white" }}
                    onClick={closeModal}
                  >
                    <img
                      src={profileImageSrc}
                      alt="Profile"
                      style={{
                        height: "40px",
                        width: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "12px",
                      }}
                    />
                    <span style={{ color: "black" }}>Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="d-flex align-items-center text-decoration-none py-2 px-3 rounded-3 position-relative"
                    style={{ transition: "background 0.2s", color: "white" }}
                    onClick={closeModal}
                  >
                    <Package size={20} className="me-3" color="#5c4f07ff" />
                    <span style={{ color: "black" }}>Orders</span>
                    {ordersCount > 0 && (
                      <span className="badge bg-danger ms-auto rounded-pill">
                        {ordersCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    className="d-flex align-items-center text-decoration-none py-2 px-3 rounded-3"
                    style={{ transition: "background 0.2s", color: "white" }}
                    onClick={closeModal}
                  >
                    <Heart size={20} className="me-3" color="#fc0303ff" />
                    <span style={{ color: "black" }}>Wishlist</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="d-flex align-items-center text-decoration-none py-2 px-3 rounded-3 position-relative"
                    style={{ transition: "background 0.2s", color: "white" }}
                    onClick={closeModal}
                  >
                    <Bell size={20} className="me-3" color="#f8fc03ff" />
                    <span style={{ color: "black" }}>Notifications</span>
                    {notifications.length > 0 && (
                      <span className="badge bg-danger ms-auto rounded-pill">
                        {notifications.length}
                      </span>
                    )}
                  </Link>
                  <button
                    className="d-flex align-items-center text-decoration-none py-2 px-3 rounded-3 border-0 w-100"
                    style={{ 
                      transition: "background 0.2s", 
                      color: "white",
                      background: "rgba(220, 38, 38, 0.2)",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      localStorage.removeItem('token');
                      navigate('/login');
                      closeModal();
                    }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#ff0000" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="me-3"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span style={{ color: "red" }}>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}