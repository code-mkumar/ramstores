import React, { useEffect, useState } from "react";
import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{
          height: "85px",

          /* 🎨 MATCHED THEME FROM INFOPAGE */
          background: scrolled
            ? "linear-gradient(90deg, #1e40af, #3b82f6, #a78bfa)" // solid gradient when scrolled
            : "linear-gradient(90deg, rgba(30,64,175,0.55), rgba(59,130,246,0.55), rgba(167,139,250,0.55))", // transparent gradient on top

          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          transition: "0.35s ease",
          zIndex: "2000",
        }}
      >
        <div className="container">

          {/* LOGO */}
          <Link
            to="home"
            smooth={true}
            duration={500}
            offset={-85}
            className="navbar-brand d-flex align-items-center"
            style={{ cursor: "pointer" }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                height: "55px",
                marginRight: "12px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "26px",
                color: "#ffffff", // white to match theme
                textShadow: "0 0 8px rgba(0,0,0,0.3)",
              }}
            >
              Grocery Shop
            </span>
          </Link>

          {/* Mobile icon */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            style={{ 
              border: "none",
              filter: "invert(1)" // Makes the toggler white
            }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* LINKS */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul 
              className="navbar-nav ms-auto align-items-lg-center"
              style={{
                /* Mobile menu styling */
                background: "linear-gradient(135deg, rgba(30,64,175,0.95), rgba(59,130,246,0.95), rgba(167,139,250,0.95))",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "15px",
                padding: "15px",
                marginTop: "10px",
              }}
            >
              {["home", "about", "categories", "contact"].map((item) => (
                <li className="nav-item" key={item}>
                  <Link
                    to={item}
                    smooth={true}
                    duration={500}
                    offset={-85}
                    className="nav-link mx-3"
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      cursor: "pointer",
                      color: "#ffffff",
                      textShadow: "0 0 6px rgba(0,0,0,0.35)",
                      transition: "0.25s",
                      padding: "8px 15px",
                      borderRadius: "8px",
                    }}
                    activeClass="active"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Link>
                </li>
              ))}
              
              {/* Sign In / Sign Up Buttons */}
              <li className="nav-item">
                <RouterLink
                  to="/login"
                  className="btn mx-2"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e40af",
                    background: "#ffffff",
                    border: "2px solid #ffffff",
                    borderRadius: "25px",
                    padding: "8px 24px",
                    transition: "0.3s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ffffff";
                    e.target.style.color = "#1e40af";
                  }}
                >
                  Sign In
                </RouterLink>
              </li>
              <li className="nav-item">
                <RouterLink
                  to="/register"
                  className="btn mx-2"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#ffffff",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    border: "2px solid transparent",
                    borderRadius: "25px",
                    padding: "8px 24px",
                    transition: "0.3s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                  }}
                >
                  Sign Up
                </RouterLink>
              </li>
            </ul>
          </div>

        </div>
      </nav>

      <style jsx>{`
        @media (min-width: 992px) {
          .navbar-nav {
            background: transparent !important;
            backdrop-filter: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin-top: 0 !important;
          }
        }

        @media (max-width: 991px) {
          .nav-item .btn {
            width: 100%;
            margin: 5px 0 !important;
          }
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .navbar-toggler:focus {
          box-shadow: none;
        }
      `}</style>
    </>
  );
}