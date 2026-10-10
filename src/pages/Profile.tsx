import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  logOutOutline,
  settingsOutline,
  heartOutline,
  cartOutline,
  locationOutline,
  cardOutline,
  cameraOutline,
  saveOutline,
  closeOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import storageService from "../services/storage";
import "./Profile.css";

const Profile: React.FC = () => {
  const {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    loginWithGoogle,
    updateProfile,
  } = useAuth();
  const { getCartCount, wishlist } = useCart();
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const history = useHistory();

  // Load user data into edit form when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  // Get orders from localStorage
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const loadOrders = () => {
      try {
        const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

        if (user) {
          // Filter orders for the current user
          const userOrders = allOrders.filter(
            (order: any) => order.userId === user.id
          );
          setOrders(userOrders.slice(0, 3)); // Show last 3 orders
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      }
    };

    loadOrders();
  }, [user, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(loginData.email, loginData.password);
    setLoading(false);

    if (!success) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const success = await signup(
      signupData.name,
      signupData.email,
      signupData.password
    );
    setLoading(false);

    if (!success) {
      setError("Email already exists. Please use a different email or login.");
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    const success = await loginWithGoogle();
    setLoading(false);

    if (!success) {
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleLogout = () => {
    logout();
    setLoginData({ email: "", password: "" });
    setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    setError("");
  };

  const updateLoginData = (field: string, value: string) => {
    setLoginData({ ...loginData, [field]: value });
  };

  const updateSignupData = (field: string, value: string) => {
    setSignupData({ ...signupData, [field]: value });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
      });
    }
    setError("");
  };

  const handleSaveProfile = () => {
    if (!editData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!editData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(editData.email)) {
      setError("Please enter a valid email");
      return;
    }

    updateProfile(editData);
    setIsEditing(false);
    setError("");
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewAllOrders = () => {
    history.push("/orders");
  };

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        <div className="profile-main-content">
          {isAuthenticated ? (
            // Logged In View
            <div className="profile-container">
              <div className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <p className="profile-subtitle">Manage your cookie account</p>
              </div>

              <div className="profile-grid">
                {/* Profile Info Card */}
                <div className="profile-info-card">
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      {(
                        isEditing ? editData.profileImage : user?.profileImage
                      ) ? (
                        <img
                          src={
                            isEditing
                              ? editData.profileImage
                              : user?.profileImage || ""
                          }
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <IonIcon icon={personOutline} />
                      )}
                    </div>
                    {isEditing && (
                      <label className="change-photo-btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          style={{ display: "none" }}
                        />
                        <IonIcon icon={cameraOutline} />
                      </label>
                    )}
                  </div>

                  {isEditing ? (
                    <>
                      <div className="edit-form">
                        <div className="form-group">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            placeholder="Your name"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-input"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-input"
                            value={editData.phone}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editData.address}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                address: e.target.value,
                              })
                            }
                            placeholder="123 Main St, City, State"
                          />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                      </div>
                      <button
                        className="save-profile-btn"
                        onClick={handleSaveProfile}
                      >
                        <IonIcon icon={saveOutline} />
                        Save Changes
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={handleCancelEdit}
                      >
                        <IonIcon icon={closeOutline} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="profile-name">
                        {user?.name || "Cookie Lover"}
                      </h2>
                      <p className="profile-email">
                        {user?.email || "user@cookies.com"}
                      </p>
                      {user?.phone && (
                        <p className="profile-phone">📞 {user.phone}</p>
                      )}
                      {user?.address && (
                        <p className="profile-address">📍 {user.address}</p>
                      )}

                      <button
                        className="edit-profile-btn"
                        onClick={handleEditProfile}
                      >
                        <IonIcon icon={settingsOutline} />
                        Edit Profile
                      </button>
                    </>
                  )}

                  <button className="logout-btn" onClick={handleLogout}>
                    <IonIcon icon={logOutOutline} />
                    Logout
                  </button>

                  <div className="card-doodles">
                    <span className="doodle d1"></span>
                    <span className="doodle d2"></span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="stats-card">
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <h3 className="stats-title">Your Cookie Stats</h3>

                  <div className="stat-item">
                    <IonIcon icon={cartOutline} className="stat-icon" />
                    <div className="stat-info">
                      <span className="stat-value">{orders.length}</span>
                      <span className="stat-label">Orders Placed</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <IonIcon icon={heartOutline} className="stat-icon" />
                    <div className="stat-info">
                      <span className="stat-value">{wishlist.length}</span>
                      <span className="stat-label">Favorites</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <IonIcon icon={locationOutline} className="stat-icon" />
                    <div className="stat-info">
                      <span className="stat-value">
                        {user?.address ? 1 : 0}
                      </span>
                      <span className="stat-label">Addresses</span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <IonIcon icon={cartOutline} className="stat-icon" />
                    <div className="stat-info">
                      <span className="stat-value">{getCartCount()}</span>
                      <span className="stat-label">Cart Items</span>
                    </div>
                  </div>

                  <div className="card-doodles">
                    <span className="doodle d1"></span>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="orders-card">
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <h3 className="orders-title">Recent Orders</h3>

                  {orders.length === 0 ? (
                    <div className="no-orders">
                      <p>No orders yet</p>
                      <p className="no-orders-subtitle">
                        Start shopping to see your orders here!
                      </p>
                    </div>
                  ) : (
                    <>
                      {orders.map((order: any) => (
                        <div key={order.id} className="order-item">
                          <div className="order-info">
                            <span className="order-number">
                              #{order.id.slice(-5)}
                            </span>
                            <span className="order-date">
                              {new Date(order.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <span className="order-status delivered">
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  <button
                    className="view-all-btn"
                    onClick={handleViewAllOrders}
                  >
                    View All Orders
                  </button>

                  <div className="card-doodles">
                    <span className="doodle d2"></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Not Logged In View
            <div className="auth-container">
              <div className="auth-header">
                <h1 className="auth-title">My Profile</h1>
                <p className="auth-subtitle">Sign in to access your account</p>
              </div>

              {/* Toggle Buttons */}
              <div className="auth-toggle">
                <button
                  className={`toggle-btn ${showLoginForm ? "active" : ""}`}
                  onClick={() => setShowLoginForm(true)}
                >
                  Sign In
                </button>
                <button
                  className={`toggle-btn ${!showLoginForm ? "active" : ""}`}
                  onClick={() => setShowLoginForm(false)}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {showLoginForm ? (
                <div className="auth-card">
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="input-wrapper">
                        <IonIcon icon={mailOutline} className="input-icon" />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) =>
                            updateLoginData("email", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="input-wrapper">
                        <IonIcon
                          icon={lockClosedOutline}
                          className="input-icon"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-input"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) =>
                            updateLoginData("password", e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <IonIcon
                            icon={showPassword ? eyeOffOutline : eyeOutline}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="form-options">
                      <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Remember me</span>
                      </label>
                      <a href="#forgot" className="forgot-link">
                        Forgot Password?
                      </a>
                    </div>

                    {error && showLoginForm && (
                      <div className="error-message">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>

                    <div className="divider">
                      <span>OR</span>
                    </div>

                    <button
                      type="button"
                      className="google-btn"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                    >
                      <span className="google-icon">G</span>
                      Continue with Google
                    </button>
                  </form>
                </div>
              ) : (
                // Signup Form
                <div className="auth-card">
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="input-wrapper">
                        <IonIcon icon={personOutline} className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="John Doe"
                          value={signupData.name}
                          onChange={(e) =>
                            updateSignupData("name", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="input-wrapper">
                        <IonIcon icon={mailOutline} className="input-icon" />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="your@email.com"
                          value={signupData.email}
                          onChange={(e) =>
                            updateSignupData("email", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="input-wrapper">
                        <IonIcon
                          icon={lockClosedOutline}
                          className="input-icon"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-input"
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) =>
                            updateSignupData("password", e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <IonIcon
                            icon={showPassword ? eyeOffOutline : eyeOutline}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-wrapper">
                        <IonIcon
                          icon={lockClosedOutline}
                          className="input-icon"
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-input"
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            updateSignupData("confirmPassword", e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          <IonIcon
                            icon={
                              showConfirmPassword ? eyeOffOutline : eyeOutline
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="terms-checkbox">
                      <label className="checkbox-label">
                        <input type="checkbox" required />
                        <span>
                          I agree to the <a href="#terms">Terms & Conditions</a>
                        </span>
                      </label>
                    </div>

                    {error && !showLoginForm && (
                      <div className="error-message">{error}</div>
                    )}

                    <button
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <div className="divider">
                      <span>OR</span>
                    </div>

                    <button
                      type="button"
                      className="google-btn"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                    >
                      <span className="google-icon">G</span>
                      Sign up with Google
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
