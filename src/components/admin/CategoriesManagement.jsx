// components/admin/CategoriesManagement.jsx (Updated with Image Preview Column)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API,{baseAPI} from "../../utils/api";
import CategoryModal from "./modals/CategoryModal";

const CategoriesManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentCategory, setCurrentCategory] = useState(null);
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res);
      const data = res.data;
      
      // Correctly extract the 'categories' array from the response
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
        if (!data.success) {
          setError(data.message || "Failed to load categories");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  // Updated to handle file uploads
  const handleCreate = async (data) => {
    const token = getToken();
    const formDataToSend = new FormData();
    console.log(data)
    
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
    
    const res = await API.post("/admin/categories", formDataToSend, {
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
    
    const res = await API.put(`/admin/categories/${id}`, formDataToSend, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openCreateModal = () => {
    setModalType("create");
    setCurrentCategory(null);
    setFormData({});
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalType("edit");
    setCurrentCategory(category);
    setFormData({ ...category });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
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
        result = await handleUpdate(currentCategory.id, formData);
      }
      if (result) {
        closeModal();
        fetchCategories();
      }
      console.log('Backend message:', result?.message);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
  if (window.confirm("Are you sure? This may affect products.")) {
    try {
      setLoading(true);

      const res = await handleDelete(id);

      if (!res.success) {
        throw new Error(res.message || "Delete failed");
      }

      console.log("DELETE RESPONSE:", res);
      fetchCategories();

    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError(err.message || "Delete failed");
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

  const filteredData = () => categories.filter(category => 
    Object.values(category).some(value => 
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
        <th>Image</th>
        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name</th>
        <th>Description</th>
        <th onClick={() => handleSort('parent_id')} style={{ cursor: 'pointer' }}>Parent ID</th>
        <th onClick={() => handleSort('is_active')} style={{ cursor: 'pointer' }}>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
  );
  const API_BASE_URL = baseAPI;
  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-4">
        <h3>Categories Management</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Add Category</button>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover">
              {renderTableHeader()}
              <tbody>
                {paginatedData().map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>
                      {category.image_url ? (
                        <img 
                          src={category.image_url.startsWith('http') 
                            ? category.image_url 
                            : `${API_BASE_URL}${category.image_url}`
                          }
                          //src={"https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg"}
                          alt={category.name} 
                          className="img-thumbnail rounded" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>{category.parent_id || '-'}</td>
                    <td>
                      <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(category)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData().length === 0 && (
                  <tr><td colSpan="7" className="text-center py-4">No categories found</td></tr>
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
        <CategoryModal
          type={modalType}
          category={currentCategory}
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

export default CategoriesManagement;