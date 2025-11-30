// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import API from '../utils/api';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { GoogleLogin } from "@react-oauth/google";



export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', formData);
      console.log('Full login response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        console.log('Login successful, storing data...');
        
        // Store user data and token
        const userData = {
          ...response.data.user,
          token: response.data.access_token || response.data.token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        
        console.log('Stored user:', userData);
        console.log('Stored token:', userData.token);
        
        // Navigate based on role
        if (userData.role === 'admin') {
          navigate('/admin');
        } 
        else if(userData.role === 'user'){
          navigate('/dashboard');
        }
        else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      
      {/* Animated background elements */}
      <div className="position-absolute w-100 h-100" style={{ opacity: 0.1 }}>
        <div className="position-absolute rounded-circle" 
             style={{ 
               width: '500px', 
               height: '500px', 
               background: 'white', 
               top: '-10%', 
               right: '-5%',
               animation: 'float 6s ease-in-out infinite'
             }}></div>
        <div className="position-absolute rounded-circle" 
             style={{ 
               width: '400px', 
               height: '400px', 
               background: 'white', 
               bottom: '-10%', 
               left: '-5%',
               animation: 'float 8s ease-in-out infinite'
             }}></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg" 
                 style={{ 
                   borderRadius: '20px',
                   backdropFilter: 'blur(10px)',
                   background: 'rgba(255, 255, 255, 0.95)'
                 }}>
              <div className="card-body p-4 p-sm-5">
                
                {/* Logo/Icon Section */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                       style={{ 
                         width: '80px', 
                         height: '80px',
                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                         boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                       }}>
                    <Lock size={40} color="white" />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Welcome Back</h2>
                  <p className="text-muted mb-0">Please login to your account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center border-0 mb-4" 
                       style={{ 
                         borderRadius: '12px',
                         background: 'rgba(220, 53, 69, 0.1)',
                         color: '#dc3545'
                       }}>
                    <AlertCircle size={20} className="me-2" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Username Input */}
                  <div className="mb-4">
                    <label htmlFor="username" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
                      Username
                    </label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
                        <User size={20} />
                      </span>
                      <input
                        type="text"
                        className="form-control ps-5 py-3 border-0"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ 
                          borderRadius: '12px',
                          background: '#f7fafc',
                          fontSize: '15px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
                      Password
                    </label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
                        <Lock size={20} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control ps-5 pe-5 py-3 border-0"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ 
                          borderRadius: '12px',
                          background: '#f7fafc',
                          fontSize: '15px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 translate-middle-y end-0 me-2 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          border: 'none',
                          background: 'transparent',
                          color: '#a0aec0'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="remember"
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="remember" style={{ color: '#718096', cursor: 'pointer' }}>
                        Remember me
                      </label>
                    </div>
                    <a href="/forgetpass" className="text-decoration-none" 
                       style={{ 
                         color: '#667eea',
                         fontWeight: '500',
                         fontSize: '14px'
                       }}>
                      Forgot password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button 
                    type="submit" 
                    className="btn w-100 py-3 text-white fw-semibold border-0"
                    disabled={loading}
                    style={{ 
                      borderRadius: '12px',
                      background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : 'Login'}
                  </button>
                  <div className="mt-3">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        const token = credentialResponse.credential; // Google token

                        const response = await API.post("/auth/google-login", { token });

                        if (response.data.success) {
                          const userData = {
                            ...response.data.user,
                            token: response.data.access_token
                          };

                          localStorage.setItem("user", JSON.stringify(userData));
                          localStorage.setItem("token", userData.token);

                          if (userData.role === "admin") navigate("/admin");
                          else navigate("/");
                        }
                      }}
                      onError={() => {
                        console.log("Google Login Failed");
                      }}
                    />
                  </div>

                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-4">
                  <p className="mb-0" style={{ color: '#718096' }}>
                    Don't have an account? <Link to='/register' className="text-decoration-none fw-semibold" style={{ color: '#667eea' }}>Sign up</Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-center mt-4">
              <p className="text-white mb-0" style={{ fontSize: '14px', opacity: 0.9 }}>
                © 2024 Your Company. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        .form-control:focus {
          outline: none;
          border: none;
        }
        
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }
      `}</style>
    </div>
  );
}