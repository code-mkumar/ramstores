// pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Mail, Lock, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';



export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/auth/forgot-password', {
        email: formData.email
      });
      
      if (response.data.success) {
        setSuccess('OTP has been sent to your email!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });
      
      if (response.data.success) {
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSendOTP}>
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
             style={{ 
               width: '80px', 
               height: '80px',
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
             }}>
          <Mail size={40} color="white" />
        </div>
        <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Forgot Password?</h2>
        <p className="text-muted mb-0">Enter your email to receive an OTP</p>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
          Email Address
        </label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
            <Mail size={20} />
          </span>
          <input
            type="email"
            className="form-control ps-5 py-3 border-0"
            id="email"
            name="email"
            placeholder="Enter your registered email"
            value={formData.email}
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

      <button 
        type="submit" 
        className="btn w-100 py-3 text-white fw-semibold border-0 mb-3"
        disabled={loading}
        style={{ 
          borderRadius: '12px',
          background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Sending OTP...
          </>
        ) : 'Send OTP'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleVerifyOTP}>
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
             style={{ 
               width: '80px', 
               height: '80px',
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
             }}>
          <Shield size={40} color="white" />
        </div>
        <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Verify OTP</h2>
        <p className="text-muted mb-0">Enter the 6-digit code sent to<br/><strong>{formData.email}</strong></p>
      </div>

      <div className="mb-4">
        <label htmlFor="otp" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
          OTP Code
        </label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
            <Shield size={20} />
          </span>
          <input
            type="text"
            className="form-control ps-5 py-3 border-0 text-center"
            id="otp"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleChange}
            required
            maxLength="6"
            style={{ 
              borderRadius: '12px',
              background: '#f7fafc',
              fontSize: '20px',
              letterSpacing: '8px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="btn w-100 py-3 text-white fw-semibold border-0 mb-3"
        disabled={loading}
        style={{ 
          borderRadius: '12px',
          background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Verifying...
          </>
        ) : 'Verify OTP'}
      </button>

      <button 
        type="button"
        className="btn btn-link w-100 text-decoration-none"
        onClick={handleSendOTP}
        disabled={loading}
        style={{ color: '#667eea' }}
      >
        Didn't receive OTP? Resend
      </button>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleResetPassword}>
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
        <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Set New Password</h2>
        <p className="text-muted mb-0">Create a strong password for your account</p>
      </div>

      <div className="mb-3">
        <label htmlFor="newPassword" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
          New Password
        </label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
            <Lock size={20} />
          </span>
          <input
            type="password"
            className="form-control ps-5 py-3 border-0"
            id="newPassword"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
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

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="form-label fw-semibold" style={{ color: '#4a5568' }}>
          Confirm Password
        </label>
        <div className="position-relative">
          <span className="position-absolute top-50 translate-middle-y ms-3" style={{ color: '#a0aec0' }}>
            <Lock size={20} />
          </span>
          <input
            type="password"
            className="form-control ps-5 py-3 border-0"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
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

      <button 
        type="submit" 
        className="btn w-100 py-3 text-white fw-semibold border-0 mb-3"
        disabled={loading}
        style={{ 
          borderRadius: '12px',
          background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Resetting Password...
          </>
        ) : 'Reset Password'}
      </button>
    </form>
  );

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
                
                {/* Back Button */}
                {step === 1 && (
                  <button 
                    className="btn btn-link text-decoration-none p-0 mb-3"
                    onClick={() => navigate('/login')}
                    style={{ color: '#667eea' }}
                  >
                    <ArrowLeft size={20} className="me-2" />
                    Back to Login
                  </button>
                )}

                {/* Success Alert */}
                {success && (
                  <div className="alert alert-success d-flex align-items-center border-0 mb-4" 
                       style={{ 
                         borderRadius: '12px',
                         background: 'rgba(40, 167, 69, 0.1)',
                         color: '#28a745'
                       }}>
                    <CheckCircle size={20} className="me-2" />
                    <span>{success}</span>
                  </div>
                )}

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

                {/* Render Current Step */}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                {/* Step Indicator */}
                <div className="d-flex justify-content-center mt-4 gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: step >= s ? '#667eea' : '#e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
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