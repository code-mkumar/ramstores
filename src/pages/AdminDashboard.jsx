// pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AdminDashboard.css";

// Import child components
import StatsOverview from "../components/admin/StatsOverview";
import UsersManagement from "../components/admin/UsersManagement";
import ProductsManagement from "../components/admin/ProductsManagement";
import OrdersManagement from "../components/admin/OrdersManagement";
import CategoriesManagement from "../components/admin/CategoriesManagement";
import ReviewsManagement from "../components/admin/ReviewsManagement";
import CarouselManagement from "../components/admin/CarouselManagement";
import NotificationManagement from "../components/admin/NotificationManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser || parsedUser.role !== "admin") return null;
      return parsedUser.token || parsedUser.access_token;
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) navigate("/login");
    else fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Extract stats data, ignoring 'success' key if present
      const statsData = res.data.success ? { ...res.data } : res.data;
      setStats(statsData);
      console.log("Fetched stats:", statsData); // Debug log
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard stats");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats":
        return <StatsOverview stats={stats} loading={loading} onRefresh={fetchStats} />;
      case "users":
        return <UsersManagement />;
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "carousel":
        return <CarouselManagement />;
      case "notification":   // <-- lowercase matches sidebar id
        return <NotificationManagement />;
      default:
        return <div className="text-center py-5"><h4>Select a section from the sidebar</h4></div>;
    }
  };

  return (
    <div className="admin-dashboard d-flex h-100">
      {/* Sidebar */}
      <div className={`bg-dark text-white p-3 sidebar flex-shrink-0 ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">{sidebarOpen ? "Admin Panel" : "AP"}</h4>
        
        </div>
        <ul className="nav flex-column">
          {[
            { id: "stats", label: "Dashboard", icon: "📊" },
            { id: "users", label: "Users", icon: "👥" },
            { id: "products", label: "Products", icon: "📦" },
            { id: "orders", label: "Orders", icon: "🛒" },
            { id: "categories", label: "Categories", icon: "📑" },
            { id: "reviews", label: "Reviews", icon: "⭐" },
            { id: "carousel", label: "Carousel", icon: "🖼️" },
            { id: "notification", label: "Notification", icon: "🔔" }
          ].map(tab => (
            <li className="nav-item" key={tab.id}>
              <button 
                className={`btn text-start w-100 mb-2 d-flex align-items-center ${
                  activeTab === tab.id ? "btn-primary" : "btn-dark text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="me-2">{tab.icon}</span>
                <span className={sidebarOpen ? "" : "d-none"}>{tab.label}</span>
              </button>
            </li>
          ))}
          <li className="nav-item mt-auto">
            <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center" onClick={handleLogout}>
              <span className="me-2">🚪</span>
              <span className={sidebarOpen ? "" : "d-none"}>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className={`main-content flex-grow-1 d-flex flex-column overflow-hidden ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        {/* Header section */}
        <header className="bg-white border-bottom p-3 flex-shrink-0">
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <span className="flex-grow-1">{error}</span>
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}
          {loading && activeTab === "stats" && (
            <div className="alert alert-info d-flex align-items-center mb-3">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Loading...
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <button 
              className="btn btn-outline-secondary d-block d-md-block"
              onClick={toggleSidebar}
              title="Toggle sidebar"
            >
              {sidebarOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-grow-1 overflow-auto p-4 bg-light">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}