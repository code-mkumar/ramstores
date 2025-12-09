import React, { useState, useEffect } from "react";
import { Navigate, Link,useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import API,{baseAPI} from "../../utils/api";
import UserHeader from "./Header";

export default function Cart({ user }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartWithProducts, setCartWithProducts] = useState([]);
  const navigate = useNavigate();
  
  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await API.get(`/cart/${user.id}`);
   
      setCart(res.data);
      
      // Fetch product details for each cart item
      if (res.data.length > 0) {
        const cartWithDetails = await Promise.all(
          res.data.map(async (item) => {
            try {
              const productRes = await API.get(`/products/${item.product_id}`);
              return {
                ...item,
                product: productRes.data.product || productRes.data
              };
            } catch (error) {
              console.error(`Error fetching product ${item.product_id}:`, error);
              return item;
            }
          })
        );
        setCartWithProducts(cartWithDetails);
      } else {
        setCartWithProducts([]);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    
    try {
      await API.put(`/cart/update/${item.cart_id}`, { quantity: newQty });
      loadCart();
    } catch (error) {
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (item) => {
    if (!confirm("Remove this item from cart?")) return;
    
    try {
      await API.delete(`/cart/remove/${item.cart_id}`);
      loadCart();
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
    // Fetch the latest user profile from backend
    const profileRes = await API.get(`/user/profile`);
    const userProfile = profileRes.data.user;

    // Check phone and address
    if (!userProfile.phone || !userProfile.address) {
      alert("Please complete your phone number and address before placing an order.");
      navigate("/profile");
      return;
    }
   }catch(err){
      console.error("Checkout Error:", error);
   }

    setLoading(true);

    try {
      const items = cart.map(item => ({
        product_id: item.product_id || item.product?.id,
        quantity: item.quantity
      }));

      const res = await API.post("/orders/orders", { items });
      console.log(res)

      // Clear cart after all orders succeed
      const res1 = await API.delete(`/cart/clear/${user.id}`);
      console.log(res1)

      alert("Orders placed successfully!");
      loadCart();

    } catch (error) {
      console.error("Checkout Error:", error);
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity * item.gst / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Helper function to get image URL
  const getImageUrl = (item) => {
    // Check if product details are available
    if (item.product) {
      // Check for 'img' property (from backend)
      if (item.product.img) {
        try {
          const imgArray = JSON.parse(item.product.img);
          if (Array.isArray(imgArray) && imgArray.length > 0) {
            return `${baseAPI}${imgArray[0].startsWith("/") ? imgArray[0] : "/" + imgArray[0]}`;
          }
        } catch (e) {
          console.error("Error parsing images:", e);
        }
      }
      // Fallback checks
      if (item.product.images_files && Array.isArray(item.product.images_files) && item.product.images_files.length > 0) {
        return `${baseAPI}${item.product.images_files[0].startsWith("/") ? item.product.images_files[0] : "/" + item.product.images_files[0]}`;
      }
      if (item.product.image) {
        return `${baseAPI}${item.product.image.startsWith("/") ? item.product.image : "/" + item.product.image}`;
      }
      if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        return `${baseAPI}${item.product.images[0].startsWith("/") ? item.product.images[0] : "/" + item.product.images[0]}`;
      }
    }
    return "https://via.placeholder.com/80?text=No+Image";
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
      <UserHeader user={user} cartCount={cart.length} />

      <div className="container py-5 position-relative" style={{ zIndex: 5 }}>
        <div className="row">
          <div className="col-lg-8 mb-4">
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
                  <ShoppingBag size={24} className="me-2" />
                  Shopping Cart ({cart.length} items)
                </h4>

                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <ShoppingBag size={64} className="text-muted mb-3" />
                    <h5 className="text-muted">Your cart is empty</h5>
                    <Link
                      to="/dashboard"
                      className="btn text-white mt-3"
                      style={{
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #667eea, #764ba2)"
                      }}
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    {cartWithProducts.map((item) => (
                      <div
                        key={item.cart_id}
                        className="d-flex align-items-center border-bottom py-3"
                        style={{ minWidth: "600px" }}
                      >
                        <img
                          src={getImageUrl(item)}
                          alt={item.name || "Product"}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                        <div className="flex-grow-1 ms-3" style={{ minWidth: "150px" }}>
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <p className="text-muted mb-1">₹{item.price.toFixed(2)}</p>
                          <small className="text-muted">GST: {item.gst}%</small>
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{ borderRadius: "8px", width: "32px" }}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="fw-bold px-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            style={{ borderRadius: "8px", width: "32px" }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-end ms-3" style={{ width: "100px", flexShrink: 0 }}>
                          <p className="fw-bold mb-0">₹{item.total.toFixed(2)}</p>
                        </div>
                        <button
                          className="btn btn-sm btn-danger ms-3"
                          onClick={() => removeItem(item)}
                          style={{ borderRadius: "8px", flexShrink: 0 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div
              className="card shadow-lg border-0 sticky-top"
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
                top: "20px"
              }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
                  Order Summary
                </h5>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span className="fw-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (GST):</span>
                  <span className="fw-semibold">₹{calculateTax().toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-bold h5 mb-0" style={{ color: "#667eea" }}>
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  className="btn text-white w-100 py-2 mb-2"
                  onClick={checkout}
                  disabled={loading || cart.length === 0}
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)"
                  }}
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <Link
                  to="/dashboard"
                  className="btn btn-outline-secondary w-100 py-2"
                  style={{ borderRadius: "12px" }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}