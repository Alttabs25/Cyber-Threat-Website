import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonToolbar, IonIcon } from "@ionic/react";
import {
  cartOutline,
  heartOutline,
  menuOutline,
  closeOutline,
  personOutline,
} from "ionicons/icons";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const history = useHistory();
  const { getCartCount, wishlist } = useCart();

  return (
    <>
      {/* Scrolling Banner */}
      <IonToolbar className="sketch-banner">
        <div className="doodle-banner">
          <div className="banner-track">
            <span>Fresh Baked Daily</span>
            <span>Made with Love</span>
            <span>Handcrafted Treats</span>
            <span>Use Code: COOKIE20 for 20% Off</span>
            <span>Free Shipping on Orders ₱500+</span>
            <span>Fresh Baked Daily</span>
            <span>Made with Love</span>
            <span>Handcrafted Treats</span>
            <span>Use Code: COOKIE20 for 20% Off</span>
            <span>Free Shipping on Orders ₱500+</span>
            <span>Fresh Baked Daily</span>
            <span>Made with Love</span>
            <span>Handcrafted Treats</span>
            <span>Use Code: COOKIE20 for 20% Off</span>
            <span>Free Shipping on Orders ₱500+</span>
          </div>
        </div>
      </IonToolbar>

      {/* Main Header */}
      <IonToolbar className="cartoon-header">
        <div className="header-wrap">
          <div
            className="brand-logo"
            onClick={() => history.push("/")}
            style={{ cursor: "pointer" }}
          >
            <h1 className="sketch-logo">Chip Happens</h1>
          </div>
          <nav className="sketch-nav">
            <a
              href="/"
              className="nav-sketch"
              onClick={(e) => {
                e.preventDefault();
                history.push("/");
              }}
            >
              Home
            </a>
            <a
              href="/products"
              className="nav-sketch"
              onClick={(e) => {
                e.preventDefault();
                history.push("/products");
              }}
            >
              Shop
            </a>
            <a
              href="/favorites"
              className="nav-sketch"
              onClick={(e) => {
                e.preventDefault();
                history.push("/favorites");
              }}
            >
              Favorites
            </a>
            <a
              href="/our-story"
              className="nav-sketch"
              onClick={(e) => {
                e.preventDefault();
                history.push("/our-story");
              }}
            >
              Our Story
            </a>
            <a
              href="/developers"
              className="nav-sketch"
              onClick={(e) => {
                e.preventDefault();
                history.push("/developers");
              }}
            >
              Developers
            </a>
          </nav>
          <div className="header-icons">
            <button
              className="sketch-icon-btn"
              onClick={() => history.push("/profile")}
            >
              <IonIcon icon={personOutline} />
            </button>
            <button
              className="sketch-icon-btn favorites-icon-btn"
              onClick={() => history.push("/favorites")}
            >
              <IonIcon icon={heartOutline} />
              {wishlist.length > 0 && (
                <span className="wishlist-badge">{wishlist.length}</span>
              )}
            </button>
            <button
              className="sketch-icon-btn cart-sketch"
              onClick={() => history.push("/cart")}
            >
              <IonIcon icon={cartOutline} />
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </button>
            <button
              className="sketch-cta desktop-only-btn"
              onClick={() => history.push("/products")}
            >
              Order Now!
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <IonIcon icon={menuOutline} />
            </button>
          </div>
        </div>
      </IonToolbar>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Chip Happens</h2>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <a
            href="/"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/");
              setSidebarOpen(false);
            }}
          >
            Home
          </a>
          <a
            href="/products"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/products");
              setSidebarOpen(false);
            }}
          >
            Shop
          </a>
          <a
            href="/favorites"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/favorites");
              setSidebarOpen(false);
            }}
          >
            Favorites
          </a>
          <a
            href="/orders"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/orders");
              setSidebarOpen(false);
            }}
          >
            My Orders
          </a>
          <a
            href="#story"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/our-story");
              setSidebarOpen(false);
            }}
          >
            Our Story
          </a>
          <a
            href="/profile"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/profile");
              setSidebarOpen(false);
            }}
          >
            My Profile
          </a>
          <a
            href="/developers"
            className="sidebar-link"
            onClick={(e) => {
              e.preventDefault();
              history.push("/developers");
              setSidebarOpen(false);
            }}
          >
            Developers
          </a>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
