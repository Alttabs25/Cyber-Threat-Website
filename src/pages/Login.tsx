import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const history = useHistory();
  const { login, loginWithGoogle } = useAuth();

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, "");
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setEmail(sanitized);
    setEmailError("");
    setError("");
  };

  // Handle password change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    setError("");
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Normalize email to lowercase for case-insensitive comparison
      const normalizedEmail = email.toLowerCase().trim();
      const success = await login(normalizedEmail, password);

      if (success) {
        // Clear form
        setEmail("");
        setPassword("");
        history.push("/profile");
      } else {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    try {
      const success = await loginWithGoogle();

      if (success) {
        history.push("/profile");
      } else {
        setError("Google login failed. Please try again or use email login.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("An error occurred during Google login. Please try again.");
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
        <div className="login-main-content">
          <div className="login-container">
            <div className="login-header">
              <h1 className="login-title">Welcome Back!</h1>
              <p className="login-subtitle">Sign in to your cookie account</p>
            </div>

            <div className="login-card">
              <div className="card-corner tl"></div>
              <div className="card-corner tr"></div>
              <div className="card-corner bl"></div>
              <div className="card-corner br"></div>
              <div className="card-sketch-border"></div>

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <IonIcon icon={mailOutline} className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {emailError && (
                    <div className="field-error">{emailError}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <IonIcon icon={lockClosedOutline} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
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
                  {passwordError && (
                    <div className="field-error">{passwordError}</div>
                  )}
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

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <span className="google-icon">G</span>
                  Continue with Google
                </button>

                <p className="signup-link">
                  Don't have an account?{" "}
                  <a onClick={() => history.push("/signup")}>Sign Up</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
