// components/admin/OrdersManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import OrderModal from "./modals/OrderModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) return;

      const res = await API.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data;
      console.log(data);
      if (data && data.orders) data = data.orders; // <-- use 'orders' instead of 'data'
      if (Array.isArray(data)) {
        const enhancedOrders = data.map(order => ({
          ...order,
          itemCount: order.items ? order.items.length : 0
        }));
        setOrders(enhancedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleUpdate = async (id, data) => {
    const token = getToken();
    const res = await API.put(`/admin/orders/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  const handleDelete = async (id) => {
    const token = getToken();
    await API.delete(`/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const openEditModal = (order) => {
    setModalType("edit");
    setCurrentOrder(order);
    setFormData({ status: order.status, payment_status: order.payment_status });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentOrder(null);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    // Basic validation if needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError("");
      setLoading(true);
      const result = await handleUpdate(currentOrder.id, formData);
      if (result) {
        closeModal();
        fetchOrders();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure? This will delete the order and items.")) {
      try {
        setLoading(true);
        await handleDelete(id);
        fetchOrders();
      } catch (err) {
        setError("Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };


const handleConfirmAll = async () => {
  try {
    const token = getToken();

    const res = await API.post(
      "/admin/orders/confirm-all",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.data.success) {
      alert(res.data.message);
      return;
    }

    const orders = res.data.orders;

    // ---- CREATE PDF ----
    const pdf = new jsPDF();

    orders.forEach((order, index) => {
      pdf.setFontSize(20);
      pdf.text("RAM STORES", 80, 15);

      pdf.setFontSize(12);
      pdf.text(`Order Number: ${order.order_number}`, 10, 30);
      pdf.text(`Customer: ${order.customer}`, 10, 40);
      pdf.text(`Order Date: ${order.created_at}`, 10, 50);

      // Table
      const tableData = order.items.map(item => [
        item.product,
        item.quantity,
        "₹" + item.unit_price,
        "₹" + item.total_price
      ]);

      autoTable(pdf, {
        startY: 60,
        head: [["Product", "Qty", "Price", "Total"]],
        body: tableData
      });

      pdf.text(`Grand Total: ₹${order.total_amount}`, 10, pdf.lastAutoTable.finalY + 10);

      if (index < orders.length - 1) {
        pdf.addPage();
      }
    });

    pdf.save("all_orders_bill.pdf");

    // Refresh orders
    setTimeout(() => fetchOrders(), 500);

  } catch (err) {
    console.error(err);
    alert("Error confirming orders");
  }
};



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredData = () => orders.filter(order => 
    Object.values(order).some(value => 
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

  const toggleExpanded = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const renderTableHeader = () => (
    <thead className="table-dark">
      <tr>
        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
        <th onClick={() => handleSort('order_number')} style={{ cursor: 'pointer' }}>Order Number</th>
        <th onClick={() => handleSort('user_id')} style={{ cursor: 'pointer' }}>User ID</th>
        <th onClick={() => handleSort('total_amount')} style={{ cursor: 'pointer' }}>Total Amount</th>
        <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
        <th onClick={() => handleSort('payment_status')} style={{ cursor: 'pointer' }}>Payment</th>
        <th>Items</th>
        <th>Actions</th>
      </tr>
    </thead>
  );

  const renderItemsRow = (order) => (
    <tr>
      <td colSpan="8" className="p-0">
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unit_price}</td>
                  <td>₹{item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-4">
        <h3>Orders Management</h3>
        <button 
          className="btn btn-primary mb-3"
          onClick={handleConfirmAll}
        >
          Confirm All Pending Orders & Download PDF
        </button>

      </div>
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="table-responsive" style={{ overflowX: "auto",overflowY :"auto" }}>
            <table className="table table-hover">
              {renderTableHeader()}
              <tbody>
                {paginatedData().map(order => (
                  <>
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td><strong>{order.order_number}</strong></td>
                      <td>{order.user_id}</td>
                      <td>₹{order.total_amount}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'Delivered' ? 'bg-success' : 
                          order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          order.payment_status === 'Paid' ? 'bg-success' : 
                          order.payment_status === 'Refunded' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info"
                          onClick={() => toggleExpanded(order.id)}
                        >
                          {order.itemCount} Items {expandedOrder === order.id ? '▼' : '▶'}
                        </button>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => openEditModal(order)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order.id && renderItemsRow(order)}
                  </>
                ))}
                {paginatedData().length === 0 && (
                  <tr><td colSpan="8" className="text-center py-4">
                    </td></tr>
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
        <OrderModal
          order={currentOrder}
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

export default OrdersManagement;