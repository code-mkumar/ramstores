import React from "react";

export default function CartItem({ item, onUpdate, onRemove }) {
  const totalPrice = (item.price + (item.price * item.gst / 100)) * item.quantity;

  return (
    <div className="card mb-2">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6>{item.name}</h6>
          <p>Qty: {item.quantity} | Total: ₹{totalPrice.toFixed(2)}</p>
        </div>
        <div>
          <button className="btn btn-sm btn-secondary me-2" onClick={() => onUpdate(item, item.quantity + 1)}>+</button>
          <button className="btn btn-sm btn-secondary me-2" onClick={() => onUpdate(item, item.quantity - 1)}>-</button>
          <button className="btn btn-sm btn-danger" onClick={() => onRemove(item)}>Remove</button>
        </div>
      </div>
    </div>
  );
}
