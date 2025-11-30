// components/admin/modals/CarouselModal.jsx
// Updated with drag and drop image upload and preview
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CarouselModal = ({ type, item, formData, errors, loading, onSubmit, onClose, onChange }) => {
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (type === 'edit' && item?.image_url) {
      setPreview(item.image_url);
    } else {
      setPreview('');
    }
  }, [type, item]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };

  const handleFile = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      // Update parent formData with file
      onChange({ target: { name: 'image_file', value: file } });
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
  };

  const removeImage = () => {
    setPreview('');
    onChange({ target: { name: 'image_file', value: null } });
    onChange({ target: { name: 'image_url', value: '' } });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{type === 'create' ? 'Add' : 'Edit'} Carousel Item</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  className="form-control"
                  name="subtitle"
                  value={formData.subtitle || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Image {errors.image_url && <span className="text-danger">*</span>}</label>
                <div
                  className={`drop-zone border p-4 text-center ${dragActive ? 'bg-light border-primary' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{ minHeight: '200px', cursor: 'pointer' }}
                >
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageInput}
                    id="image-upload"
                  />
                  {preview ? (
                    <div className="position-relative">
                      <img src={preview} alt="Preview" className="img-fluid" style={{ maxHeight: '150px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1"
                        onClick={removeImage}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <i className="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                        <p className="mb-0">Drag & drop image here or click to browse</p>
                        <small className="text-muted">Supports JPG, PNG, GIF</small>
                      </label>
                    </div>
                  )}
                </div>
                {errors.image_url && <div className="text-danger mt-1">{errors.image_url}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  name="display_order"
                  value={formData.display_order || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3 form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="is_active"
                  checked={formData.is_active || false}
                  onChange={onChange}
                  id="isActive"
                />
                <label className="form-check-label" htmlFor="isActive">Active</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : type === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CarouselModal.propTypes = {
  type: PropTypes.string.isRequired,
  item: PropTypes.object,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CarouselModal;