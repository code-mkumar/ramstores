import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Bell, Check, Mail, MailOpen } from "lucide-react";
import API from "../../utils/api";
import UserHeader from "./Header";

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      const res = await API.put(`/user/notifications/${notifId}/read`);
      if (res.data.success) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => API.put(`/user/notifications/${n.id}/read`))
      );
      loadNotifications();
    } catch (error) {
      alert("Failed to mark all as read");
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundImage: "url('https://th.bing.com/th/id/OIP.7UNEHxyoWJr4NIYd-_D0iQHaE7?w=320&h=180&c=7&r=0&o=7&pid=1.7&rm=3')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <UserHeader user={user} notifications={notifications} />

      <div className="container py-5 position-relative" style={{ zIndex: 5 }}>
        <div
          className="card shadow-lg border-0"
          style={{
            borderRadius: "20px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="fw-bold mb-0" style={{ color: "#2d3748" }}>
                <Bell size={24} className="me-2" />
                Notifications
                {getUnreadCount() > 0 && (
                  <span
                    className="badge ms-2"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white"
                    }}
                  >
                    {getUnreadCount()} new
                  </span>
                )}
              </h4>
              {getUnreadCount() > 0 && (
                <button
                  className="btn btn-sm text-white"
                  onClick={markAllAsRead}
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)"
                  }}
                >
                  <Check size={16} className="me-1" />
                  Mark all as read
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: "#667eea" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5">
                <Bell size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No notifications yet</h5>
                <p className="text-muted">
                  You'll see notifications here when you have updates
                </p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`list-group-item border-0 mb-2 ${
                      !notif.is_read ? "" : ""
                    }`}
                    style={{
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: !notif.is_read
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(237, 242, 247, 0.5)"
                    }}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <div className="d-flex align-items-start">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          background: !notif.is_read
                            ? "linear-gradient(135deg, #667eea, #764ba2)"
                            : "#cbd5e0"
                        }}
                      >
                        {!notif.is_read ? (
                          <Mail size={20} color="white" />
                        ) : (
                          <MailOpen size={20} color="white" />
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-start justify-content-between">
                          <h6 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                            {notif.title}
                            {!notif.is_read && (
                              <span
                                className="badge ms-2 text-white"
                                style={{
                                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                                  fontSize: "10px"
                                }}
                              >
                                New
                              </span>
                            )}
                          </h6>
                          <small className="text-muted">
                            {formatDate(notif.created_at)}
                          </small>
                        </div>
                        <p className="mb-0 text-muted">{notif.message}</p>
                      </div>

                      {!notif.is_read && (
                        <button
                          className="btn btn-sm ms-2 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #667eea, #764ba2)"
                          }}
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}