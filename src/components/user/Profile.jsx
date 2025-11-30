import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Camera, LogOut } from "lucide-react";
import API,{baseAPI} from "../../utils/api";
import UserHeader from "./Header";

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    profile_image: ""
  });
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      console.log(res.data);
      if (res.data.success) {
        setProfile(res.data.user);
        setPreviewUrl(res.data.user.profile_image);
        
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", profile.full_name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      
      if (imageFile) {
        formData.append("profile_image", imageFile);
      }

      const res = await API.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        alert("Profile updated successfully!");
        loadProfile();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.new_password !== passwords.confirm_password) {
      alert("New passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/user/change-password", {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });

      if (res.data.success) {
        alert("Password changed successfully!");
        setPasswords({ old_password: "", new_password: "", confirm_password: "" });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      navigate('/login');
    }
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
      <UserHeader user={user} />

      <div className="container py-5 position-relative" style={{ zIndex: 5 }}>
        <div className="row">
          {/* Profile Picture Section */}
          <div className="col-lg-4 mb-4">
            <div
              className="card shadow-lg border-0"
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="card-body text-center p-4">
                <div className="position-relative d-inline-block mb-3">
                    
                  <img
                    src={
                        previewUrl
                        ? `${baseAPI}${previewUrl}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="profile"
                    style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid #667eea",
                    }}
                    />

                  <label
                    htmlFor="profile-upload"
                    className="position-absolute bottom-0 end-0 rounded-circle p-2"
                    style={{
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "2px solid white"
                    }}
                  >
                    <Camera size={20} color="white" />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                </div>
                <h4 className="fw-bold mb-1" style={{ color: "#2d3748" }}>
                  {profile.full_name || "User"}
                </h4>
                <p className="text-muted mb-0">{profile.email}</p>
                <p className="text-muted small">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn text-white w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    padding: "10px"
                  }}
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="col-lg-8">
            <div
              className="card shadow-lg border-0 mb-4"
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
                  <User size={20} className="me-2" />
                  Profile Information
                </h5>
                <form onSubmit={handleProfileUpdate}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          borderRadius: "12px",
                          background: "#edf2f7",
                          border: "none"
                        }}
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            borderRadius: "12px 0 0 12px",
                            background: "#edf2f7",
                            border: "none"
                          }}
                        >
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          style={{
                            borderRadius: "0 12px 12px 0",
                            background: "#edf2f7",
                            border: "none"
                          }}
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Phone</label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            borderRadius: "12px 0 0 12px",
                            background: "#edf2f7",
                            border: "none"
                          }}
                        >
                          <Phone size={18} />
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          style={{
                            borderRadius: "0 12px 12px 0",
                            background: "#edf2f7",
                            border: "none"
                          }}
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Address</label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            borderRadius: "12px 0 0 12px",
                            background: "#edf2f7",
                            border: "none"
                          }}
                        >
                          <MapPin size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          style={{
                            borderRadius: "0 12px 12px 0",
                            background: "#edf2f7",
                            border: "none"
                          }}
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn text-white px-4"
                    disabled={loading}
                    style={{
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #667eea, #764ba2)"
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>

            {/* Change Password Section */}
            <div
              className="card shadow-lg border-0"
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4" style={{ color: "#2d3748" }}>
                  <Lock size={20} className="me-2" />
                  Change Password
                </h5>
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "12px",
                        background: "#edf2f7",
                        border: "none"
                      }}
                      value={passwords.old_password}
                      onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "12px",
                        background: "#edf2f7",
                        border: "none"
                      }}
                      value={passwords.new_password}
                      onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        borderRadius: "12px",
                        background: "#edf2f7",
                        border: "none"
                      }}
                      value={passwords.confirm_password}
                      onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn text-white px-4"
                    disabled={loading}
                    style={{
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #f59e0b, #ef4444)"
                    }}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}