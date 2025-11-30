// pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { User, Lock, Mail, Phone, MapPin, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';

// ✅ Move InputField OUTSIDE the Register component
const InputField = ({ icon: Icon, type = "text", name, placeholder, value, onChange, showPassword, setShowPassword }) => (
  <div className="mb-3">
    <label htmlFor={name} className="form-label fw-semibold" style={{ color: '#4a5568', fontSize: '14px' }}>
      {placeholder}
    </label>
    <div className="position-relative">
      <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0', zIndex: 10 }}>
        <Icon size={18} />
      </span>
      <input
        type={type === "password" && showPassword ? "text" : type}
        name={name}
        id={name}
        placeholder={placeholder}
        value={value}
        className="form-control ps-5 py-2 border-0"
        onChange={onChange}
        required
        style={{ 
          borderRadius: '10px',
          background: '#f7fafc',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
      />
      {type === "password" && (
        <button
          type="button"
          className="btn position-absolute top-50 translate-middle-y end-0 me-2 p-0"
          onClick={() => setShowPassword(!showPassword)}
          style={{ 
            border: 'none',
            background: 'transparent',
            color: '#a0aec0',
            zIndex: 10
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

export default function Register({ setUser }) {
  const [form, setForm] = useState({
    username: "", 
    password: "", 
    full_name: "", 
    email: "", 
    phone: "", 
    address: "",
    role: "user"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await API.post("/auth/register", form);
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden py-5" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      
      {/* Animated background */}
      <div className="position-absolute w-100 h-100" style={{ opacity: 0.1 }}>
        <div className="position-absolute rounded-circle" 
             style={{ width: '500px', height: '500px', background: 'white', top: '-10%', right: '-5%', animation: 'float 6s ease-in-out infinite' }}></div>
        <div className="position-absolute rounded-circle" 
             style={{ width: '400px', height: '400px', background: 'white', bottom: '-10%', left: '-5%', animation: 'float 8s ease-in-out infinite' }}></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-7">
            <div className="card border-0 shadow-lg" 
                 style={{ borderRadius: '20px', backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="card-body p-4 p-sm-5">
                
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                       style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)' }}>
                    <UserPlus size={35} color="white" />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Create Account</h2>
                  <p className="text-muted mb-0">Join us today and get started</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center border-0 mb-4" 
                       style={{ borderRadius: '12px', background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                    <AlertCircle size={20} className="me-2" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegister}>

                  {/* Account Info */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#2d3748', fontSize: '16px' }}>
                      Account Information
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <InputField 
                          icon={User} 
                          name="username" 
                          placeholder="Username" 
                          value={form.username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField 
                          icon={Lock} 
                          type="password" 
                          name="password" 
                          placeholder="Password" 
                          value={form.password}
                          onChange={handleChange}
                          showPassword={showPassword}
                          setShowPassword={setShowPassword}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: '#2d3748', fontSize: '16px' }}>
                      Personal Information
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <InputField 
                          icon={User} 
                          name="full_name" 
                          placeholder="Full Name" 
                          value={form.full_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField 
                          icon={Mail} 
                          type="email" 
                          name="email" 
                          placeholder="Email" 
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField 
                          icon={Phone} 
                          name="phone" 
                          placeholder="Phone" 
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputField 
                          icon={MapPin} 
                          name="address" 
                          placeholder="Address" 
                          value={form.address}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="form-check mb-4">
                    <input className="form-check-input" type="checkbox" id="terms" required />
                    <label className="form-check-label" htmlFor="terms" style={{ color: '#718096', fontSize: '14px', cursor: 'pointer' }}>
                      I agree to the 
                      <span 
                        style={{ color: '#667eea', cursor: 'pointer' }}
                        onClick={openModal}
                        className="ms-1"
                      >
                        Terms & Conditions
                      </span>
                    </label>
                  </div>

                  {/* Register Button */}
                  <button 
                    type="submit" 
                    className="btn w-100 py-3 text-white fw-semibold border-0"
                    disabled={loading}
                    style={{ 
                      borderRadius: '12px',
                      background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : 'Create Account'}
                  </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="mb-0" style={{ color: '#718096' }}>
                    Already have an account? <a href="/login" style={{ color: '#667eea' }}>Login</a>
                  </p>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white mb-0" style={{ fontSize: '14px' }}>
                © 2024 Your Company. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>

      {/* Terms Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          id="termsModal"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: "15px" }}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Terms & Conditions</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div
                className="modal-body"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <h6 className="fw-bold">1. Account Usage</h6>
                <p>You agree to create an account using accurate and valid information. Any misuse or fraudulent activity may result in account termination.</p>
                
                <h6 className="fw-bold">2. Privacy Policy</h6>
                <p>Your personal data will be securely stored and will not be shared without your consent, except as required by law.</p>
                
                <h6 className="fw-bold">3. Security</h6>
                <p>You are responsible for keeping your account password confidential and notifying us of any unauthorized access.</p>
                
                <h6 className="fw-bold">4. Service Usage</h6>
                <p>You agree to use our platform only for legal and acceptable purposes and not to engage in harmful activities.</p>
                
                <h6 className="fw-bold">5. Modifications</h6>
                <p>We reserve the right to modify the Terms & Conditions at any time. Continued use of the service indicates acceptance of updated terms.</p>
                
                <h6 className="fw-bold">6. Contact</h6>
                <p>For any questions, contact our support team at support@example.com.</p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={closeModal}
                  style={{ borderRadius: "10px" }}
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}