// components/admin/CarouselManagement.jsx
// (Updated with image preview in table)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import CarouselModal from "./modals/CarouselModal";

const CarouselManagement = () => {
  const navigate = useNavigate();
  const [carousel, setCarousel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
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

  const fetchCarousel = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/carousel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data;
      if (data && data.data) data = data.data;
      if (Array.isArray(data)) {
        setCarousel(data);
      } else {
        setCarousel([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load carousel items");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setCarousel([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousel();
  }, [navigate]);

  // Updated to handle file uploads
  const handleCreate = async (data) => {
    const token = getToken();
    const formDataToSend = new FormData();
    
    // Append all fields
    Object.keys(data).forEach(key => {
      if (key !== 'image_file' && data[key] !== undefined) {
        formDataToSend.append(key, data[key]);
      }
    });
    
    // Append file if present
    if (data.image_file) {
      formDataToSend.append('image', data.image_file);
    }
    
    const res = await API.post("/admin/carousel", formDataToSend, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return res.data;
  };

  const handleUpdate = async (id, data) => {
    const token = getToken();
    const formDataToSend = new FormData();
    
    // Append all fields except file
    Object.keys(data).forEach(key => {
      if (key !== 'image_file' && data[key] !== undefined) {
        formDataToSend.append(key, data[key]);
      }
    });
    
    // Append file if new one is provided
    if (data.image_file) {
      formDataToSend.append('image', data.image_file);
    } else {
      // If no new file, append existing image_url
      formDataToSend.append('image_url', data.image_url || '');
    }
    
    const res = await API.put(`/admin/carousel/${id}`, formDataToSend, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/carousel/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openCreateModal = () => {
    setModalType("create");
    setCurrentItem(null);
    setFormData({});
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalType("edit");
    setCurrentItem(item);
    setFormData({ ...item });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.image_url?.trim() && !formData.image_file) {
      errors.image_url = "Image is required";
    }
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
        result = await handleUpdate(currentItem.id, formData);
      }
      if (result) {
        closeModal();
        fetchCarousel();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        setLoading(true);
        await handleDelete(id);
        fetchCarousel();
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

  // ... (rest of the component remains the same: filteredData, handleSort, etc.)
  const filteredData = () => carousel.filter(item => 
    Object.values(item).some(value => 
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
        <th style={{ width: '60px' }}>Image</th>
        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
        <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title</th>
        <th onClick={() => handleSort('subtitle')} style={{ cursor: 'pointer' }}>Subtitle</th>
        <th onClick={() => handleSort('display_order')} style={{ cursor: 'pointer' }}>Order</th>
        <th onClick={() => handleSort('is_active')} style={{ cursor: 'pointer' }}>Status</th>
        <th style={{ width: '120px' }}>Actions</th>
      </tr>
    </thead>
  );

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-4">
        <h3>Carousel Management</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Add Carousel Item</button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search carousel items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover">
              {renderTableHeader()}
              <tbody>
                {paginatedData().map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="img-thumbnail" 
                          style={{ width: '50px', height: '30px', objectFit: 'cover' }} 
                          onError={(e) => { e.target.style.display = 'none'; }} // Hide if broken
                        />
                      ) : (
                        <span className="text-muted small">No Image</span>
                      )}
                    </td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.subtitle}</td>
                    <td>{item.display_order}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(item)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData().length === 0 && (
                  <tr><td colSpan="7" className="text-center py-4">No carousel items found</td></tr>
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
        <CarouselModal
          type={modalType}
          item={currentItem}
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

export default CarouselManagement;