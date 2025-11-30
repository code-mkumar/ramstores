import React from "react";

export default function ProductCard({ product, onAdd }) {
  const totalPrice = (product.price + (product.price * product.gst / 100)).toFixed(2);

  return (
    <div className="card mb-3">
      <img src={product.img || "https://via.placeholder.com/150"} className="card-img-top" alt={product.name} />
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">{product.description}</p>
        <p>Price: ₹{product.price} + GST: {product.gst}% = ₹{totalPrice}</p>
        <p>ykyrsxhfStock: {product.stock}</p>
        {onAdd && <button className="btn btn-primary" onClick={() => onAdd(product)}>Add to Cart</button>}
      </div>
    </div>
  );
}
