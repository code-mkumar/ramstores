import React, { useState } from "react";
import { ShoppingCart, Star, Heart } from "lucide-react";
import {baseAPI} from "../../utils/api";
export default function ProductCard({ product, onAdd, onWishlist }) {


  const [showModal, setShowModal] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);


  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating || 0);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={15}
          fill={i <= rounded ? "#fbbf24" : "none"}
          color={i <= rounded ? "#fbbf24" : "#d1d5db"}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <div
        className="card h-100 border-0 shadow position-relative"
        style={{
          borderRadius: "15px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          transition: "0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Wishlist */}
        {onWishlist && (
          <button
            className="btn btn-sm position-absolute top-0 end-0 m-2 bg-white"
            onClick={() => onWishlist(product)}
            style={{
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              padding: "0",
              zIndex: 10,
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Heart
              size={18}
              color="#ef4444"
              fill={product.isWishlisted ? "#ef4444" : "none"}
            />
          </button>
        )}

        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <div
            className="position-absolute top-0 start-0 m-2 badge bg-danger"
            style={{ zIndex: 10 }}
          >
            Out of Stock
          </div>
        )}

        {/* Image */}
        <div
          style={{
            height: "200px",
            borderRadius: "15px 15px 0 0",
            overflow: "hidden",
          }}
        >
          {product.images_files?.length > 0 ? (
            <img
              src={`${baseAPI}${product.images_files[0].startsWith("/") ? product.images_files[0] : "/" + product.images_files[0]}`}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          ) : (
            <img
              src="https://via.placeholder.com/400"
              alt="No Image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <div className="card-body p-3">
          {/* Name */}
          <h6
            className="fw-bold mb-2"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#2d3748",
            }}
          >
            {product.name}
          </h6>

          {/* Rating */}
          {product.average_rating > 0 && (
            <div className="d-flex align-items-center gap-1 mb-2">
              {renderStars(product.average_rating)}
              <small className="text-muted ms-1">
                ({product.review_count || 0})
              </small>
            </div>
          )}

          {/* Description (2 lines only + modal on click) */}
          <p
            className="text-muted small mb-2"
            style={{
              height: "40px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
            onClick={() => setShowModal(true)}
          >
            {product.description || "No description available"}
          </p>

          {/* Price */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "#667eea" }}>
                ₹{product.price.toFixed(2)}
              </h5>
              {product.gst > 0 && (
                <small className="text-muted">+ {product.gst}% GST</small>
              )}
            </div>

            {product.stock > 0 && (
              <small className="text-success">{product.stock} in stock</small>
            )}
          </div>

          {/* Add to Cart */}
          <button
            className="btn text-white w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => onAdd(product)}
            disabled={product.stock === 0}
            style={{
              borderRadius: "12px",
              padding: "8px 16px",
              background:
                product.stock === 0
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            <ShoppingCart size={18} />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* FULL DESCRIPTION MODAL */}
      {showModal && (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: "15px" }}>
            
            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{product.name}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* ---------------- IMAGE CAROUSEL ---------------- */}
              {product.images_files?.length > 0 ? (
                <div className="position-relative text-center">

                  {/* BIG IMAGE */}
                  <img
                    src={`${baseAPI}${product.images_files[currentImg]}`}
                    className="img-fluid mb-2"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    onClick={() =>
                      window.open(`${baseAPI}${product.images_files[currentImg]}`, "_blank")
                    }
                  />

                  {/* LEFT ARROW */}
                  <button
                    className="btn btn-light position-absolute"
                    style={{ top: "45%", left: "10px", borderRadius: "50%" }}
                    onClick={() =>
                      setCurrentImg(
                        currentImg === 0
                          ? product.images_files.length - 1
                          : currentImg - 1
                      )
                    }
                  >
                    ❮
                  </button>

                  {/* RIGHT ARROW */}
                  <button
                    className="btn btn-light position-absolute"
                    style={{ top: "45%", right: "10px", borderRadius: "50%" }}
                    onClick={() =>
                      setCurrentImg(
                        currentImg === product.images_files.length - 1
                          ? 0
                          : currentImg + 1
                      )
                    }
                  >
                    ❯
                  </button>

                  {/* DOTS */}
                  <div className="d-flex justify-content-center mt-2">
                    {product.images_files.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentImg(index)}
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: currentImg === index ? "#0d6efd" : "#bbb",
                          margin: "0 4px",
                          cursor: "pointer",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted">No images available</p>
              )}

              {/* ---------------- FULL DESCRIPTION ---------------- */}
              <p className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
                {product.description}
              </p>

              {/* ---------------- PRICE ---------------- */}
              <h5 className="fw-bold mt-2">
                ₹{product.price?.toFixed(2)}
                {product.gst > 0 && (
                  <small className="text-muted"> + {product.gst}% GST</small>
                )}
              </h5>

              {/* ---------------- STOCK ---------------- */}
              <p className={product.stock > 0 ? "text-success" : "text-danger"}>
                Stock: {product.stock}
              </p>
            </div>

            {/* FOOTER */}
            <div className="modal-footer d-flex justify-content-between">

              {/* ADD TO CART */}
              <button
                className="btn btn-success"
                onClick={() => {
                  onAdd(product);
                  setShowModal(false);
                }}
              >
                Add to Cart
              </button>

            

              {/* CLOSE */}
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>

            </div>
          </div>
        </div>
      </div>
    )}

    </>
  );
}
