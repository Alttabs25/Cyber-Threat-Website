import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const history = useHistory();
  const { signup, loginWithGoogle } = useAuth();

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePasswordStrength = (
    password: string
  ): {
    isValid: boolean;
    message: string;
  } => {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters",
      };
    }
    if (password.length < 8) {
      return { isValid: true, message: "Password strength: Weak" };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthCount = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (strengthCount >= 3 && password.length >= 10) {
      return { isValid: true, message: "Password strength: Strong" };
    } else if (strengthCount >= 2 && password.length >= 8) {
      return { isValid: true, message: "Password strength: Medium" };
    } else {
      return { isValid: true, message: "Password strength: Weak" };
    }
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
  };

  // Handle field change with validation
  const handleChange = (field: string, value: string) => {
    let sanitizedValue = value;

    // Sanitize name and email fields
    if (field === "name" || field === "email") {
      sanitizedValue = sanitizeInput(value);
    }

    // Normalize email to lowercase
    if (field === "email") {
      sanitizedValue = sanitizedValue.toLowerCase();
    }

    setFormData({ ...formData, [field]: sanitizedValue });

    // Clear error for this field
    setErrors({ ...errors, [field]: "" });
    setError("");
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Check terms agreement
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({ name: "", email: "", password: "", confirmPassword: "" });

    // Validate form
    if (!validateForm()) {
      console.log("[SIGNUP PAGE] Form validation failed");
      return;
    }

    setLoading(true);

    try {
      // Normalize and trim data
      const normalizedEmail = formData.email.toLowerCase().trim();
      const trimmedName = formData.name.trim();

      console.log(
        "[SIGNUP PAGE] Attempting signup with email:",
        normalizedEmail
      );

      const success = await signup(
        trimmedName,
        normalizedEmail,
        formData.password
      );

      console.log("[SIGNUP PAGE] Signup result:", success);

      if (success) {
        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setAgreedToTerms(false);
        console.log("[SIGNUP PAGE] Signup successful, redirecting to profile");
        history.push("/profile");
      } else {
        console.log("[SIGNUP PAGE] Signup failed - email already exists");
        setError(
          "This email is already registered. Please use a different email or sign in."
        );
      }
    } catch (err) {
      console.error("[SIGNUP PAGE] Signup error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setErrors({ name: "", email: "", password: "", confirmPassword: "" });
    setLoading(true);

    try {
      const success = await loginWithGoogle();

      if (success) {
        history.push("/profile");
      } else {
        setError(
          "Google sign up failed. Please try again or use email signup."
        );
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setError("An error occurred during Google sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        <div className="signup-main-content">
          <div className="signup-container">
            <div className="signup-header">
              <h1 className="signup-title">Join the Cookie Club!</h1>
              <p className="signup-subtitle">
                Create your account and start munching
              </p>
            </div>

            <div className="signup-card">
              <div className="card-corner tl"></div>
              <div className="card-corner tr"></div>
              <div className="card-corner bl"></div>
              <div className="card-corner br"></div>
              <div className="card-sketch-border"></div>

              <form onSubmit={handleSignup} className="signup-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <IonIcon icon={personOutline} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={loading}
                      autoComplete="name"
                      required
                    />
                  </div>
                  {errors.name && (
                    <div className="field-error">{errors.name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <IonIcon icon={mailOutline} className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className="field-error">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <IonIcon icon={lockClosedOutline} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <IonIcon
                        icon={showPassword ? eyeOffOutline : eyeOutline}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error">{errors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <IonIcon icon={lockClosedOutline} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      disabled={loading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      <IonIcon
                        icon={showConfirmPassword ? eyeOffOutline : eyeOutline}
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="field-error">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="terms-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        setError("");
                      }}
                      disabled={loading}
                      required
                    />
                    <span>
                      I agree to the <a href="#terms">Terms & Conditions</a> and{" "}
                      <a href="#privacy">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="signup-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="google-btn"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <span className="google-icon">G</span>
                  Sign up with Google
                </button>

                <p className="login-link">
                  Already have an account?{" "}
                  <a onClick={() => history.push("/login")}>Sign In</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
