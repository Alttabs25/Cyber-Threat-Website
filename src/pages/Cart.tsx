import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  addOutline,
  removeOutline,
  trashOutline,
  arrowBackOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../data/products";
import "./Cart.css";

const Cart: React.FC = () => {
  const history = useHistory();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const goBack = () => {
    history.push("/");
  };

  const increaseQuantity = (
    productId: string,
    boxSize?: "small" | "regular" | "large"
  ) => {
    const item = cart.find(
      (item) => item.product.id === productId && item.boxSize === boxSize
    );
    if (item) {
      updateQuantity(productId, item.quantity + 1, boxSize);
    }
  };

  const decreaseQuantity = (
    productId: string,
    boxSize?: "small" | "regular" | "large"
  ) => {
    const item = cart.find(
      (item) => item.product.id === productId && item.boxSize === boxSize
    );
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1, boxSize);
    }
  };

  const removeItem = (
    productId: string,
    boxSize?: "small" | "regular" | "large"
  ) => {
    removeFromCart(productId, boxSize);
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "COOKIE20") {
      setDiscount(0.2);
      setPromoApplied(true);
      // Save discount info to localStorage for checkout
      localStorage.setItem(
        "appliedDiscount",
        JSON.stringify({
          code: promoCode.toUpperCase(),
          amount: 0.2,
        })
      );
    } else {
      alert("Invalid promo code!");
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      history.push("/checkout");
    }
  };

  const subtotal = getCartTotal();
  const discountAmount = subtotal * discount;
  const shipping = subtotal >= 500 ? 0 : 50; // Free shipping for orders ₱500+
  const tax = (subtotal - discountAmount) * 0.12; // 12% VAT
  const total = subtotal - discountAmount + shipping + tax;

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>

      <IonContent fullscreen>
        {/* Back Button Section */}
        <section className="back-nav-section">
          <div className="back-nav-wrap">
            <button onClick={goBack} className="back-btn-sketch">
              <IonIcon icon={arrowBackOutline} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </section>

        {/* Cart Title Section */}
        <section className="cart-title-section">
          <div className="cart-container">
            <div className="cart-page-header">
              <h1 className="cart-page-title">Your Cart</h1>
              <p className="cart-page-subtitle">
                {cart.length} {cart.length === 1 ? "item" : "items"} in your
                basket
              </p>
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="cart-content-section">
          <div className="cart-container">
            <div className="cart-layout">
              {/* Cart Items */}
              <div className="cart-items-area">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-cart-icon-sketch">
                      <span>🛒</span>
                    </div>
                    <h2 className="empty-cart-title-sketch">
                      Your cart is empty
                    </h2>
                    <p className="empty-cart-text-sketch">
                      Add some delicious cookies to get started!
                    </p>
                    <button onClick={goBack} className="primary-sketch-btn">
                      Browse Cookies
                    </button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${
                        item.boxSize || "regular"
                      }-${index}`}
                      className="cart-item-card"
                    >
                      <div className="cart-item-image">
                        <img
                          src={`/images/cookies/${getProductImage(
                            item.product.id
                          )}`}
                          alt={item.product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div className="cart-item-right">
                        <div className="cart-item-top">
                          <div className="cart-item-details">
                            <h3 className="cart-item-name">
                              {item.product.name}
                            </h3>
                            <p className="cart-item-size">
                              {item.boxSize
                                ? `Box Size: ${
                                    item.boxSize.charAt(0).toUpperCase() +
                                    item.boxSize.slice(1)
                                  } (${
                                    item.boxSize === "small"
                                      ? "6"
                                      : item.boxSize === "regular"
                                      ? "12"
                                      : "24"
                                  } cookies)`
                                : item.product.description}
                            </p>
                            <span className="cart-item-price">
                              ₱{(item.price || item.product.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="cart-quantity-controls">
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                decreaseQuantity(item.product.id, item.boxSize)
                              }
                            >
                              <IonIcon icon={removeOutline} />
                            </button>
                            <span className="cart-qty-display">
                              {item.quantity}
                            </span>
                            <button
                              className="cart-qty-btn"
                              onClick={() =>
                                increaseQuantity(item.product.id, item.boxSize)
                              }
                            >
                              <IonIcon icon={addOutline} />
                            </button>
                          </div>
                          <div className="cart-item-total">
                            ₱
                            {(
                              (item.price || item.product.price) * item.quantity
                            ).toFixed(2)}
                          </div>
                          <button
                            className="remove-item-btn"
                            onClick={() =>
                              removeItem(item.product.id, item.boxSize)
                            }
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="cart-summary-area">
                  <div className="cart-summary-card">
                    <h2 className="summary-title">Order Summary</h2>

                    {/* Promo Code */}
                    <div className="promo-section">
                      <h3 className="promo-label">Have a promo code?</h3>
                      <div className="promo-input-group">
                        <input
                          type="text"
                          className="promo-input"
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                        />
                        <button
                          className="apply-promo-btn"
                          onClick={applyPromoCode}
                          disabled={promoApplied}
                        >
                          {promoApplied ? "Applied!" : "Apply"}
                        </button>
                      </div>
                      {promoApplied && (
                        <p className="promo-success">
                          🎉 COOKIE20 applied! 20% off
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Subtotal:</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="price-row discount-row">
                          <span>Discount (20%):</span>
                          <span>-₱{discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-row">
                        <span>Shipping:</span>
                        <span>
                          {shipping === 0 ? (
                            <span className="free-shipping">FREE</span>
                          ) : (
                            `₱${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      {subtotal < 25 && shipping > 0 && (
                        <p className="shipping-note">
                          Add ₱{(25 - subtotal).toFixed(2)} more for free
                          shipping!
                        </p>
                      )}
                      <div className="summary-row">
                        <span>Tax (12%):</span>
                        <span>₱{tax.toFixed(2)}</span>
                      </div>
                      <div className="price-row total-row">
                        <span>Total:</span>
                        <span>₱{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      className="checkout-btn-sketch"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default Cart;
