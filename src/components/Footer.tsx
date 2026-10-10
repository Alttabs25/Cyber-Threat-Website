import React from "react";
import { IonIcon } from "@ionic/react";
import { logoFacebook, logoInstagram, logoTwitter } from "ionicons/icons";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-decorations">
        <span className="deco-circle c1"></span>
        <span className="deco-circle c2"></span>
        <span className="deco-circle c3"></span>
        <span className="deco-star s1">✦</span>
        <span className="deco-star s2">✦</span>
        <span className="deco-star s3">✦</span>
      </div>

      <div className="footer-content">
        <div className="footer-section about-section">
          <div className="section-header">
            <h3>About Cookie Haven</h3>
            <div className="header-underline"></div>
          </div>
          <p>
            Baking happiness since 2024! Fresh, delicious cookies made with
            love.
          </p>
        </div>

        <div className="footer-section links-section">
          <div className="section-header">
            <h3>Quick Links</h3>
            <div className="header-underline"></div>
          </div>
          <a href="/products">
            <span className="link-arrow">→</span> Menu
          </a>
          <a href="/our-story">
            <span className="link-arrow">→</span> About
          </a>
          <a href="#contact">
            <span className="link-arrow">→</span> Contact
          </a>
        </div>

        <div className="footer-section follow-us-section">
          <div className="section-header">
            <h3 className="follow-title">Follow Us</h3>
            <div className="header-underline"></div>
          </div>
          <p className="follow-subtitle">
            Stay connected for the latest treats!
          </p>
          <div className="social-links">
            <a href="#facebook" className="social-icon" aria-label="Facebook">
              <IonIcon icon={logoFacebook} />
            </a>
            <a href="#instagram" className="social-icon" aria-label="Instagram">
              <IonIcon icon={logoInstagram} />
            </a>
            <a href="#twitter" className="social-icon" aria-label="Twitter">
              <IonIcon icon={logoTwitter} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <p>&copy; 2024 Cookie Haven. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
