import React, { useState, useEffect } from "react";
import { Filter, Grid, List } from "lucide-react";
import API from "../../utils/api";
import ProductCard from "./productcard";

export default function ProductList({ onAddToCart, onAddToWishlist }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    min_price: "",
    max_price: "",
    page: 1,
    per_page: 4
  });
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const res = await API.get(`/products/products?${params}`);
      if (res.data.success) {
        console.log("PRODUCTS RESPONSE:", res.data.products);  // ADD THIS
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      min_price: "",
      max_price: "",
      page: 1,
      per_page: 12
    });
  };

  return (
    <div>
      {/* Filters Section */}
      <div
        className="card shadow-lg border-0 mb-4"
        style={{
          borderRadius: "15px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0" style={{ color: "#2d3748" }}>
              <Filter size={20} className="me-2" />
              Filters
            </h5>
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${
                  viewMode === "grid"
                    ? "text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("grid")}
                style={{
                  borderRadius: "8px",
                  background: viewMode === "grid"
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "transparent"
                }}
              >
                <Grid size={16} />
              </button>
              <button
                className={`btn btn-sm ${
                  viewMode === "list"
                    ? "text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("list")}
                style={{
                  borderRadius: "8px",
                  background: viewMode === "list"
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "transparent"
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                style={{
                  borderRadius: "12px",
                  background: "#edf2f7",
                  border: "none"
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Category</label>
              <select
                className="form-select"
                value={filters.category_id}
                onChange={(e) => handleFilterChange("category_id", e.target.value)}
                style={{
                  borderRadius: "12px",
                  background: "#edf2f7",
                  border: "none"
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Min Price</label>
              <input
                type="number"
                className="form-control"
                placeholder="₹0"
                value={filters.min_price}
                onChange={(e) => handleFilterChange("min_price", e.target.value)}
                style={{
                  borderRadius: "12px",
                  background: "#edf2f7",
                  border: "none"
                }}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Max Price</label>
              <input
                type="number"
                className="form-control"
                placeholder="₹10000"
                value={filters.max_price}
                onChange={(e) => handleFilterChange("max_price", e.target.value)}
                style={{
                  borderRadius: "12px",
                  background: "#edf2f7",
                  border: "none"
                }}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-danger w-100"
                onClick={clearFilters}
                style={{ borderRadius: "12px" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#667eea" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div
          className="card shadow-lg border-0 text-center py-5"
          style={{
            borderRadius: "20px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)"
          }}
        >
          <h5 className="text-muted">No products found</h5>
          <p className="text-muted">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "row" : ""}>
            {products.map(product => (
              <div
                key={product.id}
                className={viewMode === "grid" ? "col-md-4 col-lg-3 mb-4" : "mb-3"}
              >
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={onAddToCart}
                  onWishlist={onAddToWishlist}
                />

              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{
                      borderRadius: "8px 0 0 8px",
                      color: "#667eea"
                    }}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(pagination.pages)].map((_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${pagination.page === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                      style={{
                        background: pagination.page === i + 1
                          ? "linear-gradient(135deg, #667eea, #764ba2)"
                          : "transparent",
                        color: pagination.page === i + 1 ? "white" : "#667eea",
                        border: "1px solid #667eea"
                      }}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      color: "#667eea"
                    }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}