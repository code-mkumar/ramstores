import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import { useNavigate } from "react-router-dom";

const NotificationManagement = () => {
const navigate = useNavigate();
const [notifications, setNotifications] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({ user_id: "", title: "", message: "", sendToAll: false });

const getToken = () => {
const userData = localStorage.getItem("user");
if (!userData) return null;
try {
const parsedUser = JSON.parse(userData);
if (!parsedUser || parsedUser.role !== "admin") return null;
return parsedUser.token || parsedUser.access_token;
} catch (err) {
return null;
}
};

const fetchNotifications = async () => {
try {
setLoading(true);
setError("");
const token = getToken();
if (!token) return;


  const res = await API.get("/admin/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.data.success && Array.isArray(res.data.notifications)) {
    setNotifications(res.data.notifications);
  } else {
    setNotifications([]);
  }
} catch (err) {
  console.error(err);
  setError("Failed to load notifications");
  if (err.response?.status === 401 || err.response?.status === 403) {
    localStorage.removeItem("user");
    navigate("/login");
  }
  setNotifications([]);
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchNotifications();
}, []);

const toggleReadStatus = async (id, currentStatus) => {
const token = getToken();
try {
await API.put(
`/admin/notifications/${id}`,
{ is_read: !currentStatus },
{ headers: { Authorization: `Bearer ${token}` } }
);
fetchNotifications();
} catch (err) {
console.error(err);
setError("Failed to update notification");
}
};

const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this notification?")) return;
const token = getToken();
try {
await API.delete(`/admin/notifications/${id}`, {
headers: { Authorization: `Bearer ${token}` },
});
fetchNotifications();
} catch (err) {
console.error(err);
setError("Failed to delete notification");
}
};

const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData(prev => ({
...prev,
[name]: type === "checkbox" ? checked : value
}));
};

const handleFormSubmit = async (e) => {
e.preventDefault();
const token = getToken();
if (!token) return;


try {
  const payload = {
    title: formData.title,
    message: formData.message,
    user_id: formData.sendToAll ? "all" : formData.user_id || undefined
  };

  await API.post("/admin/notifications", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setShowModal(false);
  setFormData({ user_id: "", title: "", message: "", sendToAll: false });
  fetchNotifications();
} catch (err) {
  console.error(err);
  setError("Failed to create notification");
}


};

return ( <div> <h3 className="mb-4">Notifications Management</h3>
<button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
+ Add Notification </button>


  {error && <div className="alert alert-danger">{error}</div>}

  {loading ? (
    <div>Loading...</div>
  ) : (
    <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Title</th>
            <th>Message</th>
            <th>Read</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-3">
                No notifications found
              </td>
            </tr>
          ) : (
            notifications.map((n) => (
              <tr key={n.id} className={n.is_read ? "" : "table-warning"}>
                <td>{n.id}</td>
                <td>{n.username}</td>
                <td>{n.title}</td>
                <td>{n.message}</td>
                <td>
                  <span
                    className={`badge ${n.is_read ? "bg-success" : "bg-secondary"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleReadStatus(n.id, n.is_read)}
                  >
                    {n.is_read ? "Read" : "Unread"}
                  </span>
                </td>
                <td>{new Date(n.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(n.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* Modal */}
  {showModal && (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleFormSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add Notification</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Message</label>
                <textarea
                  name="message"
                  className="form-control"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  name="sendToAll"
                  className="form-check-input"
                  checked={formData.sendToAll}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">Send to all users</label>
              </div>
              {!formData.sendToAll && (
                <div className="mb-3">
                  <label>User ID</label>
                  <input
                    type="number"
                    name="user_id"
                    className="form-control"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    placeholder="Leave empty if sending to all users"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button type="submit" className="btn btn-primary">Send Notification</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
</div>


);
};

export default NotificationManagement;
