import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import API,{baseAPI} from "../../utils/api";
import UserHeader from "./Header";

export default function Wishlist({ user }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/wishlist");
      console.log(res);
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    if (!confirm("Remove this item from wishlist?")) return;

    try {
      const res = await API.delete(`/user/wishlist/${wishlistId}`);
      if (res.data.success) {
        loadWishlist();
      }
    } catch (error) {
      alert("Failed to remove from wishlist");
    }
  };

  const addToCart = async (product) => {
    try {
      await API.post("/cart/add", {
        user_id: user.id,
        product_id: product.product_id,
        quantity: 1
      });
      alert("Added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= rating ? "#fbbf24" : "none"}
          color={i <= rating ? "#fbbf24" : "#d1d5db"}
        />
      );
    }
    return stars;
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
      <UserHeader user={user} />

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
            <h4 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
              <Heart size={24} className="me-2" color="#ef4444" />
              My Wishlist ({wishlist.length} items)
            </h4>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: "#667eea" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-5">
                <Heart size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Your wishlist is empty</h5>
                <p className="text-muted">Add products you love to your wishlist</p>
                <Link
                  to="/dashboard"
                  className="btn text-white mt-3"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)"
                  }}
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {wishlist.map((item) => (
                  <div key={item.wishlist_id} className="col-md-6 col-lg-4">
                    <div
                      className="card h-100 border-0 shadow"
                      style={{
                        borderRadius: "15px",
                        background: "white"
                      }}
                    >
                      {/* Product Image */}
                      <div className="position-relative">
                        <img
                          src={`${baseAPI}${item.images?.[0] || "/placeholder.jpg"}`}
                          alt={item.name}
                          className="card-img-top"
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "15px 15px 0 0"
                          }}
                        />
                        
                        {/* Stock Badge */}
                        {item.stock === 0 && (
                          <div
                            className="position-absolute top-0 start-0 m-2 badge bg-danger"
                          >
                            Out of Stock
                          </div>
                        )}

                        {/* Remove Button */}
                        <button
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          onClick={() => removeFromWishlist(item.wishlist_id)}
                          style={{
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            padding: "0"
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="card-body p-3">
                        {/* Product Name */}
                        <h6 className="fw-bold mb-2" style={{ color: "#2d3748" }}>
                          {item.name}
                        </h6>

                        {/* Rating */}
                        {item.average_rating > 0 && (
                          <div className="d-flex align-items-center gap-1 mb-2">
                            {renderStars(item.average_rating)}
                          </div>
                        )}

                        {/* Description */}
                        <p
                          className="text-muted small mb-3"
                          style={{
                            height: "40px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {item.description || "No description available"}
                        </p>

                        {/* Price */}
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="mb-0 fw-bold" style={{ color: "#667eea" }}>
                            ₹{item.price.toFixed(2)}
                          </h5>
                          {item.stock > 0 ? (
                            <small className="text-success">
                              {item.stock} in stock
                            </small>
                          ) : (
                            <small className="text-danger">Out of stock</small>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          className="btn text-white w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => addToCart(item)}
                          disabled={item.stock === 0}
                          style={{
                            borderRadius: "12px",
                            background: item.stock === 0
                              ? "#d1d5db"
                              : "linear-gradient(135deg, #667eea, #764ba2)"
                          }}
                        >
                          <ShoppingCart size={18} />
                          {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </button>

                        {/* Added Date */}
                        <small className="text-muted d-block text-center mt-2">
                          Added {new Date(item.added_at).toLocaleDateString()}
                        </small>
                      </div>
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