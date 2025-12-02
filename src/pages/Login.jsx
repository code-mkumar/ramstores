// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ setUser }) {
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const token = response.data.access_token || response.data.token;
        const userData = {
          ...response.data.user,
          token: token
        };
        
        console.log('Storing token:', token);
        console.log('User data:', userData);
        
        // Store credentials in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', token);
        
        // Update App state
        setUser(userData);
        
        console.log('Navigation to:', userData.role);
        
        // Navigate immediately
        const path = 
          userData.role === 'admin' ? '/admin' :
          userData.role === 'seller' ? '/seller' :
          userData.role === 'user' ? '/dashboard' : '/';
        
        navigate(path, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(
        err.response?.data?.message || 
        err.response?.data?.msg ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const googleToken = credentialResponse.credential;
      console.log('Google token received, length:', googleToken?.length);
      
      const response = await API.post("/auth/google-login", { token: googleToken });
      console.log('Google login response:', response.data);

      if (response.data.success) {
        const token = response.data.access_token || response.data.token;
        const userData = {
          ...response.data.user,
          token: token
        };

        console.log('Storing Google user token:', token);
        console.log('Google user data:', userData);

        // Store credentials in sessionStorage
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("token", token);

        // Update App state
        setUser(userData);

        console.log('Google login - Navigating to:', userData.role);

        // Navigate immediately
        const path = 
          userData.role === 'admin' ? '/admin' :
          userData.role === 'seller' ? '/seller' :
          userData.role === 'user' ? '/dashboard' : '/';
        
        navigate(path, { replace: true });
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      console.error('Google error response:', err.response?.data);
      setError(
        err.response?.data?.message ||
        err.response?.data?.msg ||
        'Google login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    setError('Google login was cancelled or failed.');
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
                    <AlertCircle size={20} className="me-2 flex-shrink-0" />
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label" htmlFor="remember" style={{ color: '#718096', cursor: 'pointer' }}>
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgetpass" className="text-decoration-none" 
                       style={{ 
                         color: '#667eea',
                         fontWeight: '500',
                         fontSize: '14px'
                       }}>
                      Forgot password?
                    </Link>
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

                  {/* Divider */}
                  <div className="position-relative my-4">
                    <hr style={{ borderColor: '#e2e8f0' }} />
                    <span className="position-absolute top-50 start-50 translate-middle px-3" 
                          style={{ background: 'rgba(255, 255, 255, 0.95)', color: '#718096', fontSize: '14px' }}>
                      Or continue with
                    </span>
                  </div>

                  {/* Google Login */}
                  <div className="d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      disabled={loading}
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