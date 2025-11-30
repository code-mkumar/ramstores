// components/admin/UsersManagement.jsx (Updated with Avatar Preview Column)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import UserModal from "./modals/UserModal";

const UsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      
      // Correctly extract the 'users' array from the response
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        if (!data.success) {
          setError(data.message || "Failed to load users");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const handleCreate = async (data) => {
    const token = getToken();
    const res = await API.post("/admin/users", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const handleUpdate = async (id, data) => {
    const token = getToken();
    const res = await API.put(`/admin/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openCreateModal = () => {
    setModalType("create");
    setCurrentUser(null);
    setFormData({});
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalType("edit");
    setCurrentUser(user);
    setFormData({ ...user });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username?.trim()) errors.username = "Username is required";
    if (!formData.email?.trim()) errors.email = "Email is required";
    if (modalType === "create" && !formData.password) errors.password = "Password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e, onSubmit) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError("");
      setLoading(true);
      let result;
      if (modalType === "create") {
        result = await handleCreate(formData);
      } else {
        result = await handleUpdate(currentUser.id, formData);
      }
      if (result) {
        closeModal();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        setLoading(true);
        await handleDelete(id);
        fetchUsers();
      } catch (err) {
        setError("Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredData = () => users.filter(user => 
    Object.values(user).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    const data = filteredData();
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const paginatedData = () => {
    const data = sortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);

  const renderTableHeader = () => (
    <thead className="table-dark">
      <tr>
        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
        <th>Avatar</th>
        <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>Username</th>
        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email</th>
        <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>Role</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-4">
        <h3>Users Management</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Add User</button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover">
              {renderTableHeader()}
              <tbody>
                {paginatedData().map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <span className="text-white small">{user.username?.charAt(0).toUpperCase()}</span>
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(user)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData().length === 0 && (
                  <tr><td colSpan="6" className="text-center py-4">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
      {showModal && (
        <UserModal
          type={modalType}
          user={currentUser}
          formData={formData}
          errors={formErrors}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default UsersManagement;