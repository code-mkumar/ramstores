import React, { useEffect, useState } from "react";
import API,{baseAPI} from "./utils/api";
import { Search, MapPin, Phone, Mail } from "lucide-react";
import Navbar from "./components/Navbar";
import { Link } from "react-router-dom";

export default function InfoPage() {
  const [carousel, setCarousel] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");





  
  useEffect(() => {
    const loadData = async () => {
      try {
        const car = await API.get("/carousel");
        console.log(car);
        setCarousel(car.data.data || []);
      

        const cat = await API.get("/categories");
        setCategories(cat.data.data || []);
        console.log(cat);
      } catch (err) {
        console.error(err)
        
      }
    };
    loadData();
  }, []);

  


  useEffect(() => {
    if (carousel.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === carousel.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [carousel]);

  const handleShowModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent("");
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
      <Navbar/>

      {/* ANIMATED GRADIENT CIRCLES */}
      <div className="position-absolute w-100 h-100" style={{ opacity: 0.15 }}>
        <div className="position-absolute rounded-circle"
          style={{
            width: "500px",
            height: "500px",
            background: "white",
            top: "-10%",
            right: "-5%",
            animation: "float 6s ease-in-out infinite"
          }}
        />
        <div className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            background: "white",
            bottom: "-10%",
            left: "-5%",
            animation: "float 8s ease-in-out infinite"
          }}
        />
      </div>

      {/* PAGE CONTENT */}
      <div className="container py-5 position-relative" style={{ zIndex: 5 }}>

        {/* ================= HOME ================= */}
        <section id="home" className="py-5">
          <div className="row align-items-center justify-content-center">
            
            {/* LEFT TEXT */}
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-lg p-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <h1 className="fw-bold" style={{ color: "#2d3748" }}>
                  Fresh Groceries Delivered Daily
                </h1>
                <p style={{ color: "#4a5568", fontSize: "17px" }}>
                  Your trusted store for organic vegetables, fruits, dairy, and essentials.
                </p>
                <button className="btn text-white px-4 py-2"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg,#667eea,#764ba2)"
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>

            {/* RIGHT CAROUSEL IMAGE */}
<div className="col-md-6 text-start">
  {carousel.length === 0 ? (
    <div className="text-white">Loading...</div>
  ) : (
    <div
      className="carousel-fade-container"
      style={{
        transition: "opacity 1s ease",
        opacity: 1,
      }}
    >
      <img
        src={`${baseAPI}${carousel[currentIndex].image_url}`}
        className="img-fluid shadow-lg"
        style={{
          borderRadius: "20px",
          maxHeight: "350px",
          width: "100%",
          objectFit: "cover",
          transition: "opacity 1s ease",
        }}
      />

      {/* Full width card under image */}
      <div
        style={{
          marginTop: "20px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "20px",
          padding: "20px",
          width: "100%",         // same width as the image
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            color: "#1e293b",
            marginBottom: "10px",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          {carousel[currentIndex].title}
        </h1>

        <p
          style={{
            color: "#475569",
            margin: 0,
            fontSize: "1rem",
          }}
        >
          {carousel[currentIndex].subtitle}
        </p>
      </div>
    </div>
  )}
</div>



          </div>

        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="py-2">
          <div className="card border-0 shadow-lg p-4"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.9)",
            }}
          >
            <div className="row align-items-center">
              
              {/* IMAGE */}
              <div className="col-md-5 mb-3">
                <img
                  src="https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg"
                  className="img-fluid rounded-4 shadow"
                />
              </div>

              {/* TEXT */}
              <div className="col-md-7">
                <h2 className="fw-bold" style={{ color: "#2d3748" }}>About Us</h2>
                <p style={{ color: "#4a5568", fontSize: "17px" }}>
                  We are committed to providing high-quality products at affordable prices.
                  From farm-fresh vegetables to premium packaged goods, we bring you everything under one roof.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
<section id="categories" className="py-2">
  <div
    className="card border-0 shadow-lg p-4 mb-4"
    style={{
      borderRadius: "20px",
      background: "rgba(255,255,255,0.9)",
    }}
  >
    <h2 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
      Categories
    </h2>

    {/* SEARCH BAR */}
    <div className="position-relative mb-4">
      <Search
        size={20}
        className="position-absolute top-50 translate-middle-y ms-3"
        style={{ color: "#718096" }}
      />
      <input
        type="text"
        placeholder="Search categories..."
        className="form-control ps-5 py-3"
        style={{
          borderRadius: "12px",
          background: "#edf2f7",
          border: "none",
        }}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />
    </div>

    {/* CATEGORY LIST */}
    <div
      className="d-flex overflow-auto py-3"
      style={{
        whiteSpace: "nowrap",
        gap: "15px",
        overflowX: "auto"
      }}
    >
      {categories
        .filter((c) => c.name.toLowerCase().includes(search))
        .map((cat) => (
          <div
            key={cat.id}
            className="card p-3 border-0 shadow"
            style={{
              width: "250px",
              height: "320px",
              display: "inline-block",
              borderRadius: "15px",
              whiteSpace: "normal",
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            <h5 className="fw-bold">{cat.name}</h5>

            <img
              src={`${baseAPI}${cat.image_url}`}
              alt={cat.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "10px",
              }}
            />

            <p
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                marginBottom: "10px",
              }}
              onClick={() => handleShowModal(cat.description)}
            >
              {cat.description.length > 100
                ? cat.description.slice(0, 100) + "… more"
                : cat.description}
            </p>

            <Link
              to="/login"
              className="btn text-white mt-2 text-decoration-none"
              style={{
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                borderRadius: "10px",
                width: "100%",
              }}
            >
              Explore
            </Link>
          </div>
        ))}

      {/* ➕ EXTRA ADD CATEGORY CARD */}
      <Link
        to="/login"
        className="card border-0 shadow d-flex align-items-center justify-content-center text-decoration-none"
        style={{
          width: "250px",
          height: "320px",
          display: "inline-block",
          borderRadius: "15px",
          whiteSpace: "normal",
          overflow: "hidden",
          flexShrink: 0
        }}
      >
        <h1
          style={{
            fontSize: "50px",
            color: "#667eea",
            background: "#fff",
            borderRadius: "30px",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
            userSelect: "none"
          }}
        >
          →
        </h1>

        <p className="fw-bold mt-2" style={{ color: "#2d3748" }}>More</p>
      </Link>
    </div>
  </div>

  {/* MODAL */}
  {showModal && (
    <div
      className="modal fade show d-block"
      id="descriptionModal"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content" style={{ borderRadius: "15px" }}>
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Category Description</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
            ></button>
          </div>

          <div
            className="modal-body"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            {modalContent}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCloseModal}
              style={{ borderRadius: "10px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</section>


        {/* ================= CONTACT ================= */}
        <section id="contact" className="py-2">
          <div className="card border-0 shadow-lg p-4"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.9)"
            }}
          >
            <h2 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
              Contact Us
            </h2>

            <div className="row">
              {/* CONTACT INFO */}
              <div className="col-md-5">
                <p><MapPin size={20} /> Main Market, Your City</p>
                <p><Phone size={20} /> +91 98765 43210</p>
                <p><Mail size={20} /> support@grocery.com</p>

                <textarea
                  className="form-control mt-3"
                  rows="4"
                  placeholder="Write your feedback..."
                  style={{
                    borderRadius: "12px",
                    background: "#edf2f7",
                    border: "none"
                  }}
                />
                <button className="btn w-100 mt-3 text-white"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg,#667eea,#764ba2)"
                  }}
                >
                  Submit Feedback
                </button>
              </div>

              {/* MAP */}
              <div className="col-md-7">
                <iframe
                  title="location"
                  src="https://maps.google.com/maps?q=india&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  style={{
                    width: "100%",
                    height: "300px",
                    border: "0",
                    borderRadius: "15px"
                  }}
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <div className="text-center py-4">
          <p className="text-white fw-semibold">
            © 2025 Grocery Store. All Rights Reserved.
          </p>
        </div>

      </div>

      {/* FLOAT CSS */}
      <style>
        {`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}
      </style>
    </div>
  );
}
