import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import API from "../../../utils/api";

const ProductModal = ({
  type,
  product,
  formData,
  errors,
  loading,
  onSubmit,
  onClose,
  onChange,
}) => {
  const [preview, setPreview] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔥 SKU Generator
  const generateSKU = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 6; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "SKU-" + random;
  };

  // Token getter
  const getToken = () => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
      const parsed = JSON.parse(userData);
      return parsed.token || parsed.access_token;
    } catch {
      return null;
    }
  };

  // Fetch dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await API.get("/admin/dropdown/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Dropdown Fetch Failed", err);
      }
    };

    fetchOptions();
  }, []);

  // Auto-generate SKU in create mode
  useEffect(() => {
    if (type === "create") {
      onChange({
        target: {
          name: "sku",
          value: generateSKU(),
        },
      });
    }
  }, [type]);

  // Load existing product images in edit mode
  useEffect(() => {
    if (type === "edit" && product?.images) {
      try {
        const imgs = JSON.parse(product.images);
        setPreview(imgs);
      } catch {
        setPreview([]);
      }
    } else {
      setPreview([]);
    }
  }, [type, product]);

  // Handle multiple image selection
  const handleFile = (files) => {
    const arr = Array.from(files);

    arr.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      setImageFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    onChange({
      target: {
        name: "images_files",
        value: [...imageFiles, ...arr],
      },
    });
  };

  // Remove one image
  const removeImage = (index) => {
    setPreview((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));

    onChange({
      target: {
        name: "images_files",
        value: imageFiles.filter((_, i) => i !== index),
      },
    });
  };

  // Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files);
    }
  };

  // CAMERA FUNCTIONS
  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");

    setPreview((prev) => [...prev, dataURL]);

    // Convert to real file
    fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setImageFiles((prev) => [...prev, file]);

        onChange({
          target: {
            name: "images_files",
            value: [...imageFiles, file],
          },
        });
      });

    setShowCamera(false);
    stopCamera();
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">
              {type === "create" ? "Add Product" : "Edit Product"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit}>
            <div
              className="modal-body"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              {/* NAME */}
              <div className="mb-3">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name || ""}
                  onChange={onChange}
                  required
                />
              </div>

              {/* SKU + Generate */}
              <div className="mb-3">
                <label className="form-label">SKU *</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    className="form-control"
                    name="sku"
                    value={formData.sku || ""}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      onChange({
                        target: { name: "sku", value: generateSKU() },
                      })
                    }
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* PRICE + STOCK */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price (₹)*</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="price"
                    value={formData.price || ""}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    name="stock"
                    value={formData.stock || ""}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category_id"
                  value={formData.category_id || ""}
                  onChange={onChange}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* GST */}
              <div className="mb-3">
                <label className="form-label">GST (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  name="gst"
                  value={formData.gst || ""}
                  onChange={onChange}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={formData.description || ""}
                  onChange={onChange}
                />
              </div>

              {/* MULTIPLE IMAGES + CAMERA */}
              <div className="mb-3">
                <label className="form-label">Images</label>

                <div
                  className={`border p-4 text-center rounded ${
                    dragActive ? "bg-light" : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="d-none"
                    id="image-upload"
                    onChange={(e) => handleFile(e.target.files)}
                  />

                  {/* Preview */}
                  {preview.length > 0 ? (
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                      {preview.map((img, index) => (
                        <div key={index} className="position-relative">
                          <img
                            src={img}
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                            onClick={() => removeImage(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label htmlFor="image-upload">
                      <i className="bi bi-cloud-upload fs-1 text-muted"></i>
                      <p>Click or drag images here</p>
                    </label>
                  )}

                  {/* CAMERA BUTTON */}
                  <button
                    type="button"
                    className="btn btn-outline-primary mt-3"
                    onClick={openCamera}
                  >
                    <i className="bi bi-camera"></i> Use Camera
                  </button>
                </div>
              </div>

              {/* ACTIVE */}
              <div className="form-check form-switch mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="is_active"
                  checked={formData.is_active || false}
                  onChange={onChange}
                />
                <label className="form-check-label">Active</label>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : type === "create"
                  ? "Create Product"
                  : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {showCamera && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 99999 }}
        >
          <div className="bg-white p-4 rounded shadow-lg text-center">
            <h5 className="mb-3">Capture Photo</h5>

            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "320px",
                height: "240px",
                borderRadius: "10px",
                background: "#000",
              }}
            />

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="mt-3 d-flex justify-content-center gap-3">
              <button className="btn btn-success" onClick={capturePhoto}>
                Capture
              </button>

              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowCamera(false);
                  stopCamera();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProductModal.propTypes = {
  type: PropTypes.string.isRequired,
  product: PropTypes.object,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ProductModal;
