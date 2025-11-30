// components/admin/modals/CategoryModal.jsx (Updated with drag and drop image upload and preview)
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CategoryModal = ({ type, category, formData, errors, loading, onSubmit, onClose, onChange }) => {
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (type === 'edit' && category?.image_url) {
      setPreview(category.image_url);
    } else {
      setPreview('');
    }
  }, [type, category]);

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
            <h5 className="modal-title">{type === 'create' ? 'Add' : 'Edit'} Category</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Image</label>
                <div
                  className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{ minHeight: '150px', cursor: 'pointer' }}
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
                      <img src={preview} alt="Preview" className="img-fluid" style={{ maxHeight: '120px', objectFit: 'cover' }} />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1"
                        onClick={removeImage}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <i className="bi bi-cloud-upload fs-1 text-muted mb-2 d-block"></i>
                        <p className="mb-1">Drag & drop image here or click to browse</p>
                        <small className="text-muted">Supports JPG, PNG, GIF (Optional)</small>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Parent ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="parent_id"
                  value={formData.parent_id || ''}
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

CategoryModal.propTypes = {
  type: PropTypes.string.isRequired,
  category: PropTypes.object,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CategoryModal;