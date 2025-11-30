// components/admin/ReviewsManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import ReviewModal from "./modals/ReviewModal";

const ReviewsManagement = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentReview, setCurrentReview] = useState(null);
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

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data;
      if (data && data.data) data = data.data;
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [navigate]);

  const handleCreate = async (data) => {
    const token = getToken();
    const res = await API.post("/admin/reviews", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const handleUpdate = async (id, data) => {
    const token = getToken();
    const res = await API.put(`/admin/reviews/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openCreateModal = () => {
    setModalType("create");
    setCurrentReview(null);
    setFormData({});
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setModalType("edit");
    setCurrentReview(review);
    setFormData({ ...review });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentReview(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) errors.rating = "Rating must be 1-5";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError("");
      setLoading(true);
      let result;
      if (modalType === "create") {
        result = await handleCreate(formData);
      } else {
        result = await handleUpdate(currentReview.id, formData);
      }
      if (result) {
        closeModal();
        fetchReviews();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        setLoading(true);
        await handleDelete(id);
        fetchReviews();
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

  const filteredData = () => reviews.filter(review => 
    Object.values(review).some(value => 
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
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
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
        <th onClick={() => handleSort('user_id')} style={{ cursor: 'pointer' }}>User ID</th>
        <th onClick={() => handleSort('product_id')} style={{ cursor: 'pointer' }}>Product ID</th>
        <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>Rating</th>
        <th>Comment</th>
        <th onClick={() => handleSort('is_approved')} style={{ cursor: 'pointer' }}>Approved</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-4">
        <h3>Reviews Management</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Add Review</button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover">
              {renderTableHeader()}
              <tbody>
                {paginatedData().map(review => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.user_id}</td>
                    <td>{review.product_id}</td>
                    <td>
                      <span className="text-warning">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </td>
                    <td>{review.comment?.substring(0, 50)}...</td>
                    <td>
                      <span className={`badge ${review.is_approved ? 'bg-success' : 'bg-secondary'}`}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(review)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(review.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData().length === 0 && (
                  <tr><td colSpan="7" className="text-center py-4">No reviews found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
      {showModal && (
        <ReviewModal
          type={modalType}
          review={currentReview}
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

export default ReviewsManagement;