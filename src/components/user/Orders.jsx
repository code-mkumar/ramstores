// components/user/Orders.jsx
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Package,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Star,
} from "lucide-react";
import API from "../../utils/api";
import UserHeader from "./Header";

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // QR States
  const [qrCode, setQrCode] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/orders/orders");
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentQR = async (orderId) => {
    try {
      const res = await API.get(`/orders/orders/${orderId}/payment-qr`);
      if (res.data.success) {
        setQrCode(res.data.qr_code);
        setSelectedOrder(res.data);
        setShowQrModal(true);
      }
    } catch (error) {
      alert("Failed to generate QR code");
    }
  };

  // Open Review Modal
  const openReviewModal = (productId) => {
    setReviewProductId(productId);
    setRating(0);
    setReviewComment("");
    setShowReviewModal(true);
  };

  // Submit Review
  const submitReview = async () => {
    if (!rating) {
      alert("Please select rating");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/reviews/products/${reviewProductId}/review`,
        { rating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

 

      alert(res.data.message);
      setShowReviewModal(false);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={18} className="text-warning" />;
      case "Confirmed":
        return <CheckCircle size={18} className="text-info" />;
      case "Shipped":
        return <Truck size={18} style={{ color: "#667eea" }} />;
      case "Delivered":
        return <CheckCircle size={18} className="text-success" />;
      case "Cancelled":
        return <XCircle size={18} className="text-danger" />;
      default:
        return <Package size={18} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning";
      case "Confirmed":
        return "bg-info";
      case "Shipped":
        return "text-white";
      case "Delivered":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-success";
      case "Unpaid":
        return "bg-danger";
      case "Refunded":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div
      className="min-vh-100 position-relative"
      style={{
        backgroundImage:
          "url('https://th.bing.com/th/id/OIP.7UNEHxyoWJr4NIYd-_D0iQHaE7?w=320&h=180&c=7&r=0&o=7&pid=1.7&rm=3')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <UserHeader user={user} />

      <div className="container py-5 position-relative" style={{ zIndex: 5 }}>
        <div
          className="card shadow-lg border-0"
          style={{
            borderRadius: "20px",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="card-body p-4">
            <h4 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
              <Package size={24} className="me-2" />
              My Orders ({orders.length})
            </h4>

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  style={{ color: "#667eea" }}
                  role="status"
                ></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <Package size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No orders yet</h5>
              </div>
            ) : (
              <div className="accordion" id="ordersAccordion" >
                {orders.map((order) => (
                  <div className="accordion-item mb-3" key={order.id}>
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed fw-semibold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${order.id}`}
                      >
                        Order #{order.order_number} — ₹
                        {order.total_amount.toFixed(2)}
                      </button>
                    </h2>

                    <div
                      id={`collapse${order.id}`}
                      className="accordion-collapse collapse"
                    >
                      <div className="accordion-body">

                        <div className="mb-3">
                          <strong>Status:</strong>{" "}
                          <span
                            className={`badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mb-3">
                          <strong>Payment:</strong>{" "}
                          <span
                            className={`badge ${getPaymentStatusBadge(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status}
                          </span>
                        </div>

                        <h6 className="fw-bold">Items:</h6>
                        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                        <table className="table" >
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Review</th>
                            </tr>
                          </thead>

                          <tbody>
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.unit_price.toFixed(2)}</td>
                                <td className="fw-bold">
                                  ₹{item.total_price.toFixed(2)}
                                </td>

                                {/* Review Button */}
                                <td>
                                 {order.status === "Delivered" && (
                                  item.has_reviewed ? (
                                    <span className="badge bg-success">Reviewed</span>
                                  ) : (
                                    <button
                                      className="btn btn-sm text-white"
                                      style={{
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        borderRadius: "10px",
                                      }}
                                      onClick={() => openReviewModal(item.product_id)}
                                    >
                                      Write Review
                                    </button>
                                  )
                                )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>

                        {/* Unpaid → Show Pay Button */}
                        {order.payment_status === "Unpaid" && (
                          <button
                            className="btn text-white mt-3"
                            onClick={() => generatePaymentQR(order.id)}
                            style={{
                              borderRadius: "8px",
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                            }}
                          >
                            <QrCode size={16} className="me-1" /> Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR PAYMENT MODAL */}
      {showQrModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  <QrCode size={20} className="me-2" /> Payment QR Code
                </h5>
                <button className="btn-close" onClick={() => setShowQrModal(false)} />
              </div>

              <div className="modal-body text-center p-4">
                {qrCode && (
                  <img
                    src={qrCode}
                    alt="QR Code"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      borderRadius: "10px",
                    }}
                  />
                )}
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn text-white"
                  onClick={() => setShowQrModal(false)}
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: "20px" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Write a Review</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowReviewModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* Rating */}
                <div className="d-flex mb-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      size={28}
                      onClick={() => setRating(num)}
                      color={num <= rating ? "#fbbf24" : "#d4d4d4"}
                      fill={num <= rating ? "#fbbf24" : "none"}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Write your review..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ borderRadius: "10px" }}
                />
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn text-white"
                  onClick={submitReview}
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                  }}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
