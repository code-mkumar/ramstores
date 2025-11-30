// components/admin/StatsOverview.jsx
import React from "react";
import PropTypes from "prop-types";

const StatsOverview = ({ stats, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-75">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Dashboard Overview</h3>
        <button className="btn btn-outline-primary" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
      <div className="row g-4">
        {[
          { title: "Total Users", value: stats.users || 0, color: "primary", icon: "👥", trend: "+12%" },
          { title: "Total Products", value: stats.products || 0, color: "success", icon: "📦", trend: "+5%" },
          { title: "Total Orders", value: stats.orders || 0, color: "warning", icon: "🛒", trend: "+8%" },
          { title: "Total Revenue", value: `₹${(stats.revenue || 0).toLocaleString() || 0}`, color: "info", icon: "💰", trend: "+15%" },
          { title: "Total Categories", value: stats.categories || 0, color: "secondary", icon: "📂", trend: "+2%" },
          { title: "Total Reviews", value: stats.reviews || 0, color: "danger", icon: "⭐", trend: "+20%" },
          { title: "Avg Order Value", value: `₹${(stats.avg_order_value || 0).toFixed(2)}`, color: "light", icon: "💳", trend: "+7%" }
        ].map((item, i) => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
            <div className={`card border-left-${item.color} shadow h-100`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className={`text-xs font-weight-bold text-${item.color} text-uppercase mb-1`}>
                      {item.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {item.value}
                    </div>
                    <div className="text-xs text-${item.color} mt-2">
                      <i className="bi bi-arrow-up me-1"></i>
                      {item.trend} from last month
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className={`fas fa-${item.icon === '📦' ? 'box' : item.icon === '🛒' ? 'shopping-cart' : item.icon === '💰' ? 'dollar-sign' : item.icon === '👥' ? 'users' : item.icon === '📂' ? 'folder' : item.icon === '⭐' ? 'star' : item.icon === '🏪' ? 'store' : 'credit-card'} fa-2x text-gray-300`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

StatsOverview.propTypes = {
  stats: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default StatsOverview;