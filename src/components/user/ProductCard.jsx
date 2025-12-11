import React, { useState } from "react";
import { ShoppingCart, Star, Heart } from "lucide-react";
import {baseAPI} from "../../utils/api";
export default function ProductCard({ product, onAdd, onWishlist }) {

  console.log(product);
  const [showModal, setShowModal] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  // Add these at the top of your component
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [ratingFilter, setRatingFilter] = useState("all");

  // Compute filtered reviews
  const filteredReviews = product.ratings?.filter((rev) => {
    if (ratingFilter === "all") return true;
    return rev.rating === parseInt(ratingFilter);
  }) || [];

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
      <style>
      {`
        @media (max-width: 576px) {
          .mobile-fullscreen {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            max-width: 100% !important;
          }

          .mobile-fullscreen .modal-content {
            height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}
      </style>
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg mobile-fullscreen">
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

                    <img
                      src={`${baseAPI}${product.images_files[currentImg]}`}
                      className="img-fluid mb-2"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
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

                {/* ---------------- RATINGS SECTION ---------------- */}
                <div className="mt-3 p-3 border rounded">

                  {/* ⭐ Average Rating */}
                  <h5 className="fw-bold d-flex align-items-center">
                    <span style={{ fontSize: "22px", color: "#fbbf24" }}>⭐</span>
                    <span className="ms-2">{product.average_rating} / 5</span>
                  </h5>
                  <small className="text-muted">
                    {product.review_count} reviews
                  </small>

                  {/* Rating Breakdown (Bars) */}
                  <div className="mt-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="d-flex align-items-center mb-1">
                        <span style={{ width: "30px" }}>{star}⭐</span>
                        <div className="progress flex-grow-1 mx-2" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${
                                product.rating_breakdown?.[star]?.count || 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {product.rating_breakdown?.[star]?.count || 0}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Latest Review */}
                  {product.ratings?.length > 0 ? (
                    <div className="mt-3">
                      <h6 className="fw-bold">Latest Review</h6>
                      <p className="m-0">⭐ {product.ratings[0].rating}</p>
                      <strong>{product.ratings[0].username}</strong>
                      <p>{product.ratings[0].comment}</p>

                      {/* Show All Button */}
                      {!showAllReviews && (
                        <button
                          className="btn btn-link p-0"
                          onClick={() => setShowAllReviews(true)}
                        >
                          Show all reviews →
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted mt-3">No reviews yet</p>
                  )}
                </div>

                {/* ---------------- FULL REVIEW LIST ---------------- */}
                {showAllReviews && (
                  <div className="mt-3 p-3 border rounded">

                    {/* Filter */}
                    <select
                      className="form-select mb-3"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>

                    {/* Reviews */}
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((rev, i) => (
                        <div key={i} className="mb-3 pb-2 border-bottom">
                          <p className="m-0">⭐ {rev.rating}</p>
                          <strong>{rev.username}</strong>
                          <p className="m-0">{rev.comment}</p>
                          <small className="text-muted">{rev.created_at}</small>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No reviews in this filter</p>
                    )}

                    <button
                      className="btn btn-link p-0 mt-2"
                      onClick={() => setShowAllReviews(false)}
                    >
                      Hide reviews ↑
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    onAdd(product);
                    setShowModal(false);
                  }}
                >
                  Add to Cart
                </button>

                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      {showAllReviews && (
        <div className="mt-3 p-3 border rounded">
          <select
            className="form-select mb-3"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev, i) => (
              <div key={i} className="mb-3 pb-2 border-bottom">
                <p className="m-0">⭐ {rev.rating}</p>
                <strong>{rev.username}</strong>
                <p className="m-0">{rev.comment}</p>
                <small className="text-muted">{rev.created_at}</small>
              </div>
            ))
          ) : (
            <p className="text-muted">No reviews in this filter</p>
          )}

          <button
            className="btn btn-link p-0 mt-2"
            onClick={() => setShowAllReviews(false)}
          >
            Hide reviews ↑
          </button>
        </div>
      )}


    </>
  );
}
