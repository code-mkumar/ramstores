// components/admin/modals/ReviewModal.jsx
import React from "react";
import PropTypes from "prop-types";

const ReviewModal = ({ type, review, formData, errors, loading, onSubmit, onClose, onChange }) => {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{type === 'create' ? 'Add' : 'Edit'} Review</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">User ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="user_id"
                  value={formData.user_id || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Product ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="product_id"
                  value={formData.product_id || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rating (1-5) *</label>
                <select className={`form-control ${errors.rating ? 'is-invalid' : ''}`} name="rating" value={formData.rating || ''} onChange={onChange}>
                  <option value="">Select Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
                {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  name="comment"
                  value={formData.comment || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-3 form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="is_approved"
                  checked={formData.is_approved || false}
                  onChange={onChange}
                  id="isApproved"
                />
                <label className="form-check-label" htmlFor="isApproved">Approved</label>
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

ReviewModal.propTypes = {
  type: PropTypes.string.isRequired,
  review: PropTypes.object,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ReviewModal;