import React, { useEffect, useState } from "react";
import API from "../utils/api";
import ProductCard from "../components/ProductCard";

export default function SellerDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name:"", price:0, stock:0, category:"", description:"", gst:0, img:"" });

  const loadProducts = async () => {
    const res = await API.get(`/seller/products/${user.id}`);
    setProducts(res.data);
  };

  const handleAddProduct = async () => {
    await API.post("/seller/products", { ...form, seller_id:user.id });
    setForm({ name:"", price:0, stock:0, category:"", description:"", gst:0, img:"" });
    loadProducts();
  };

  const handleStockUpdate = async (id, stock) => {
    await API.put(`/seller/products/${id}/stock`, { stock });
    loadProducts();
  };

  useEffect(() => { loadProducts(); }, []);

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <hr />
      <div className="card p-3 mb-4">
        <h5>Add Product</h5>
        <input placeholder="Name" className="form-control mb-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input type="number" placeholder="Price" className="form-control mb-2" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value)})}/>
        <input type="number" placeholder="Stock" className="form-control mb-2" value={form.stock} onChange={e=>setForm({...form,stock:parseInt(e.target.value)})}/>
        <input placeholder="Category" className="form-control mb-2" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <input placeholder="Description" className="form-control mb-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input type="number" placeholder="GST %" className="form-control mb-2" value={form.gst} onChange={e=>setForm({...form,gst:parseFloat(e.target.value)})}/>
        <input placeholder="Image URL" className="form-control mb-2" value={form.img} onChange={e=>setForm({...form,img:e.target.value})}/>
        <button className="btn btn-primary" onClick={handleAddProduct}>Add Product</button>
      </div>

      <h5>My Products</h5>
      <div className="row">
        {products.map(p => (
          <div className="col-md-4" key={p.id}>
            <ProductCard product={p} onAdd={()=>{}} />
            <input type="number" className="form-control mb-2" placeholder="Update Stock" onBlur={e=>handleStockUpdate(p.id,parseInt(e.target.value)||p.stock)}/>
          </div>
        ))}
      </div>
    </div>
  );
}
