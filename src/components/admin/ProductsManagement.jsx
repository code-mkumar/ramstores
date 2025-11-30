// components/admin/ProductsManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API, { baseAPI } from "../../utils/api";
import ProductModal from "./modals/ProductModal";

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await API.get("/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let productsData = [];
      if (res.data.success && Array.isArray(res.data.products)) {
        productsData = res.data.products;
      } else if (Array.isArray(res.data.data)) {
        productsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        productsData = res.data;
      }

      // 🔥 Parse images JSON string → array
      productsData = productsData.map((p) => ({
        ...p,
        images_files:
          typeof p.images_files === "string" ? JSON.parse(p.images_files || "[]") : p.images_files,
      }));
      console.log(productsData);

      setProducts(productsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (data) => {
    const token = getToken();
    const formDataToSend = new FormData();

    Object.keys(data).forEach((key) => {
      if (
        key !== "images_files" &&
        data[key] !== undefined &&
        data[key] !== null &&
        data[key] !== ""
      ) {
        formDataToSend.append(key, data[key]);
      }
    });

    // Append multiple image files
    if (data.images_files) {
      for (let i = 0; i < data.images_files.length; i++) {
        formDataToSend.append("images_files", data.images_files[i]);
      }
    }

    const res = await API.post("/admin/products", formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  };

  const handleUpdate = async (id, data) => {
    const token = getToken();
    const formDataToSend = new FormData();

    Object.keys(data).forEach((key) => {
      if (key !== "images_files") {
        formDataToSend.append(key, data[key]);
      }
    });

    if (data.images_files) {
      for (let i = 0; i < data.images_files.length; i++) {
        formDataToSend.append("images_files", data.images_files[i]);
      }
    }

    const res = await API.put(`/admin/products/${id}`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openCreateModal = () => {
    setModalType("create");
    setCurrentProduct(null);
    setFormData({ is_active: true, stock: 0, price: 0, gst: 0 });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModalType("edit");
    setCurrentProduct(product);
    setFormData({ ...product });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.sku?.trim()) errors.sku = "SKU is required";
    if (!formData.price || formData.price <= 0) errors.price = "Valid price required";
    if (formData.stock === undefined || formData.stock < 0)
      errors.stock = "Stock cannot be negative";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      let result;
      if (modalType === "create") result = await handleCreate(formData);
      else result = await handleUpdate(currentProduct.id, formData);

      if (result) {
        closeModal();
        fetchProducts();
      }
    } catch (err) {
      console.error("Form submit error:", err);
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        await handleDelete(id);
        fetchProducts();
      } catch (err) {
        console.error("Delete error:", err);
        setError(err.response?.data?.message || "Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (files) {
      setFormData((prev) => ({
        ...prev,
        images_files: files,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const filteredData = () =>
    products.filter((product) => {
      const s = searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(s) ||
        product.sku?.toLowerCase().includes(s) ||
        product.description?.toLowerCase().includes(s) ||
        product.category_name?.toLowerCase().includes(s)
      );
    });

  const sortedData = () => {
    const data = filteredData();
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const paginatedData = () => {
    const data = sortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <i className="bi bi-chevron-expand ms-1"></i>;
    return sortConfig.direction === "asc" ? (
      <i className="bi bi-chevron-up ms-1"></i>
    ) : (
      <i className="bi bi-chevron-down ms-1"></i>
    );
  };

  const renderTableHeader = () => (
    <thead className="table-dark">
      <tr>
        <th>ID</th>
        <th>Images</th>
        <th>Name</th>
        <th>SKU</th>
        <th>Price</th>
        <th>Stock</th>
        <th>Category</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers (show 5 max, with ellipsis if more)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const renderPagination = () => (
    <nav aria-label="Product pagination">
      <ul className="pagination justify-content-center mt-4">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handlePrevPage}>
            Previous
          </button>
        </li>
        {getPageNumbers().map((page) => (
          <li
            key={page}
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => handlePageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handleNextPage}>
            Next
          </button>
        </li>
      </ul>
      <div className="text-center text-muted small mt-2">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData().length)} of {filteredData().length} products
      </div>
    </nav>
  );

  const API_BASE_URL =  baseAPI;
  return (
    <div>
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Products Management</h3>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="bi bi-plus-circle me-2"></i>Add Product
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {/* SEARCH BAR */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover align-middle">
              {renderTableHeader()}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <div className="spinner-border"></div>
                    </td>
                  </tr>
                ) : paginatedData().length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedData().map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      {/* ⭐ MULTIPLE IMAGE PREVIEW */}
                      <td>
                        {product.images_files && product.images_files.length > 0 ? (
                          <div className="d-flex gap-1 flex-wrap">
                            {product.images_files.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={`${API_BASE_URL}${img}`}
                                alt="Product"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(img, "_blank")}
                              />
                            ))}

                            {product.images_files.length > 3 && (
                              <span
                                className="badge bg-primary"
                                style={{
                                  cursor: "pointer",
                                  height: "60px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                onClick={() => window.open(product.images[0], "_blank")}
                              >
                                +{product.images_files.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">No Images</span>
                        )}
                      </td>

                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>₹{parseFloat(product.price).toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{product.category_name || "-"}</td>
                      <td>
                        <span className={`badge ${product.is_active ? "bg-success" : "bg-secondary"}`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
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

          {/* PAGINATION */}
          {totalPages > 1 && renderPagination()}
        </div>
      </div>

      {showModal && (
        <ProductModal
          type={modalType}
          product={currentProduct}
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

export default ProductsManagement;