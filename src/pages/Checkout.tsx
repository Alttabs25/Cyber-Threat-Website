import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonIcon,
  IonLoading,
  IonToast,
} from "@ionic/react";
import {
  arrowBackOutline,
  cardOutline,
  cashOutline,
  checkmarkCircle,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProductImage } from "../data/products";
import "./Checkout.css";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const Checkout: React.FC = () => {
  const history = useHistory();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cash">(
    "stripe"
  );
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
  });

  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get discount from localStorage if applied in Cart
  const getAppliedDiscount = () => {
    const savedDiscount = localStorage.getItem("appliedDiscount");
    if (savedDiscount) {
      const discountData = JSON.parse(savedDiscount);
      return discountData.amount || 0;
    }
    return 0;
  };

  const discount = getAppliedDiscount();
  const subtotal = getCartTotal();
  const discountAmount = subtotal * discount;
  const shipping = subtotal - discountAmount >= 500 ? 0 : 50; // Free shipping for orders ₱500+ after discount
  const tax = (subtotal - discountAmount) * 0.12; // 12% VAT after discount
  const total = subtotal - discountAmount + shipping + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!shippingInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!shippingInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!shippingInfo.phone.trim()) newErrors.phone = "Phone is required";
    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.state.trim())
      newErrors.state = "State/Province is required";
    if (!shippingInfo.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStripeCheckout = async () => {
    if (!validateForm()) {
      setToastMessage("Please fill in all required fields");
      setShowToast(true);
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Creating Stripe checkout session...");

      // Create order object before redirecting to Stripe
      const order = {
        id: `ORD-${Date.now()}`,
        userId: user?.id || "guest",
        date: new Date().toISOString(),
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "Credit/Debit Card (Stripe)",
        subtotal,
        tax,
        shipping,
        total,
        discountAmount: discount > 0 ? discountAmount : 0,
        items: cart.map((item) => ({
          id: `ITEM-${Date.now()}-${Math.random()}`,
          orderId: `ORD-${Date.now()}`,
          productId: item.product.id,
          name: item.product.name,
          price: item.price || item.product.price,
          quantity: item.quantity,
          boxSize: item.boxSize || "regular",
          image: item.product.image,
        })),
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
      };

      // Save order to localStorage before Stripe redirect
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      localStorage.setItem("lastOrder", JSON.stringify(order));
      console.log("[CHECKOUT] Order saved to localStorage:", order.id);
      console.log("[CHECKOUT] Total orders in storage:", existingOrders.length);

      // Call your Stripe server to create checkout session
      // Use production URL for Capacitor (mobile), localhost for web
      const isNative = Capacitor.isNativePlatform();
      const stripeServerUrl = isNative
        ? "https://server-hfbdttp2i-qpgdbraganza-4961s-projects.vercel.app"
        : import.meta.env.VITE_STRIPE_SERVER_URL || "http://localhost:4242";
      console.log("[CHECKOUT] Calling Stripe server at:", stripeServerUrl);
      console.log(
        "[CHECKOUT] Running on:",
        isNative ? "Mobile App (Native)" : "Web Browser"
      );
      console.log("[CHECKOUT] Platform:", Capacitor.getPlatform());
      // Create fetch with timeout (10 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${stripeServerUrl}/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: cart.map((item) => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.price || item.product.price,
              },
              quantity: item.quantity,
              boxSize: item.boxSize || "regular",
            })),
            shippingInfo,
            shipping,
            tax,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[CHECKOUT] Stripe session created:", data);
      console.log("[CHECKOUT] Checkout URL:", data.url);

      if (data.url) {
        // Clear cart and discount before redirecting to Stripe
        console.log("[CHECKOUT] Clearing cart before payment...");
        await clearCart();
        localStorage.removeItem("appliedDiscount");

        // For mobile, open in in-app browser; for web, redirect
        console.log("[CHECKOUT] Redirecting to:", data.url);
        if (isNative) {
          // Open Stripe in in-app browser for mobile
          await Browser.open({
            url: data.url,
            presentationStyle: "popover",
          });
          // After browser closes, navigate to order confirmation
          history.push("/order-confirmation");
        } else {
          // For web, regular redirect
          window.location.href = data.url;
        }
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error) {
      console.error("[CHECKOUT] Stripe checkout error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";
      setToastMessage(
        `Payment Error: ${errorMessage}. Make sure the Stripe server is running on port 4242.`
      );
      setShowToast(true);
      setIsProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!validateForm()) {
      setToastMessage("Please fill in all required fields");
      setShowToast(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Create order object immediately (no delay)
      const order = {
        id: `ORD-${Date.now()}`,
        userId: user?.id || "guest",
        date: new Date().toISOString(),
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "Cash on Delivery",
        subtotal,
        tax,
        shipping,
        total,
        items: cart.map((item) => ({
          id: `ITEM-${Date.now()}-${Math.random()}`,
          orderId: `ORD-${Date.now()}`,
          productId: item.product.id,
          name: item.product.name,
          price: item.price || item.product.price,
          quantity: item.quantity,
          boxSize: item.boxSize || "regular",
          image: item.product.image,
        })),
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      localStorage.setItem("lastOrder", JSON.stringify(order));

      // Redirect immediately to order confirmation
      history.push("/order-confirmation");
      
      // Clear cart and discount in background (after navigation)
      setTimeout(() => {
        clearCart();
        localStorage.removeItem("appliedDiscount");
      }, 100);
    } catch (error) {
      console.error("Order placement error:", error);
      setToastMessage("Failed to place order. Please try again.");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "stripe") {
      handleStripeCheckout();
    } else {
      handleCashOnDelivery();
    }
  };

  const goBack = () => {
    history.push("/cart");
  };

  if (cart.length === 0) {
    history.push("/cart");
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>

      <IonContent fullscreen>
        <IonLoading
          isOpen={isProcessing}
          message={
            paymentMethod === "stripe"
              ? "Redirecting to Stripe..."
              : "Processing your order..."
          }
          spinner="crescent"
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
          color="danger"
        />

        {/* Back Button Section */}
        <section className="back-nav-section">
          <div className="back-nav-wrap">
            <button onClick={goBack} className="back-btn-sketch">
              <IonIcon icon={arrowBackOutline} />
              <span>Back to Cart</span>
            </button>
          </div>
        </section>

        {/* Checkout Title */}
        <section className="checkout-title-section">
          <div className="checkout-container">
            <h1 className="checkout-title-sketch">
              <span className="underline-sketch">Checkout</span>
            </h1>
            <p className="checkout-subtitle">
              Almost there! Complete your order below
            </p>
          </div>
        </section>

        {/* Checkout Content */}
        <section className="checkout-content-section">
          <div className="checkout-container">
            <div className="checkout-layout">
              {/* Left Side - Forms */}
              <div className="checkout-form-area">
                {/* Shipping Information */}
                <div className="form-card-sketch">
                  <h2 className="form-title-sketch">Shipping Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-sketch">
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-input-sketch ${
                          errors.firstName ? "error" : ""
                        }`}
                        value={shippingInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                      />
                      {errors.firstName && (
                        <span className="error-message-sketch">
                          {errors.firstName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label-sketch">
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-input-sketch ${
                          errors.lastName ? "error" : ""
                        }`}
                        value={shippingInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Dela Cruz"
                      />
                      {errors.lastName && (
                        <span className="error-message-sketch">
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-sketch">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`form-input-sketch ${
                          errors.email ? "error" : ""
                        }`}
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        placeholder="juan@example.com"
                      />
                      {errors.email && (
                        <span className="error-message-sketch">
                          {errors.email}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label-sketch">
                        Phone <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-input-sketch ${
                          errors.phone ? "error" : ""
                        }`}
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="0912 345 6789"
                      />
                      {errors.phone && (
                        <span className="error-message-sketch">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-sketch">
                      Address <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      className={`form-input-sketch ${
                        errors.address ? "error" : ""
                      }`}
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Barangay Sample"
                    />
                    {errors.address && (
                      <span className="error-message-sketch">
                        {errors.address}
                      </span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-sketch">
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        className={`form-input-sketch ${
                          errors.city ? "error" : ""
                        }`}
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        placeholder="Manila"
                      />
                      {errors.city && (
                        <span className="error-message-sketch">
                          {errors.city}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label-sketch">
                        State/Province <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        className={`form-input-sketch ${
                          errors.state ? "error" : ""
                        }`}
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        placeholder="Metro Manila"
                      />
                      {errors.state && (
                        <span className="error-message-sketch">
                          {errors.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label-sketch">
                        ZIP Code <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        className={`form-input-sketch ${
                          errors.zipCode ? "error" : ""
                        }`}
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        placeholder="1000"
                      />
                      {errors.zipCode && (
                        <span className="error-message-sketch">
                          {errors.zipCode}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label-sketch">Country</label>
                      <select
                        name="country"
                        className="form-input-sketch"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                      >
                        <option value="Philippines">Philippines</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-card-sketch">
                  <h2 className="form-title-sketch">Payment Method</h2>

                  <div className="payment-methods-sketch">
                    <button
                      type="button"
                      className={`payment-method-btn-sketch ${
                        paymentMethod === "stripe" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("stripe")}
                    >
                      <div className="payment-method-content">
                        <IonIcon icon={cardOutline} className="payment-icon" />
                        <div className="payment-method-text">
                          <span className="payment-method-name">
                            Credit/Debit Card
                          </span>
                          <span className="payment-method-desc">
                            Secure payment via Stripe
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`payment-method-btn-sketch ${
                        paymentMethod === "cash" ? "active" : ""
                      }`}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <div className="payment-method-content">
                        <IonIcon icon={cashOutline} className="payment-icon" />
                        <div className="payment-method-text">
                          <span className="payment-method-name">
                            Cash on Delivery
                          </span>
                          <span className="payment-method-desc">
                            Pay when you receive
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === "stripe" && (
                    <div className="payment-info-box-sketch">
                      <div className="info-content">
                        <h4>Secure Stripe Checkout</h4>
                        <p>
                          You'll be redirected to Stripe's secure payment page
                          to complete your purchase. Stripe handles all payment
                          details securely.
                        </p>
                        <ul className="features-list">
                          <li>✓ PCI-DSS compliant</li>
                          <li>✓ 256-bit SSL encryption</li>
                          <li>✓ Multiple payment methods</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="payment-info-box-sketch cod">
                      <div className="info-content">
                        <h4>Cash on Delivery</h4>
                        <p>
                          Pay with cash when your order is delivered to your
                          doorstep. Please prepare the exact amount.
                        </p>
                        <div className="cod-features">
                          <div className="feature-item">
                            <span className="check">✓</span> No upfront payment
                          </div>
                          <div className="feature-item">
                            <span className="check">✓</span> Pay upon delivery
                          </div>
                          <div className="feature-item">
                            <span className="check">✓</span> Inspect before
                            payment
                          </div>
                        </div>
                        <div className="amount-box">
                          <span>Amount to prepare:</span>
                          <span className="amount">₱{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Order Summary */}
              <div className="checkout-summary-area">
                <div className="summary-card-sketch">
                  <h2 className="summary-title-sketch">Order Summary</h2>

                  <div className="summary-items">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.product.id}-${item.boxSize}-${index}`}
                        className="summary-item-sketch"
                      >
                        <img
                          src={`/images/cookies/${getProductImage(
                            item.product.id
                          )}`}
                          alt={item.product.name}
                          className="summary-item-image"
                        />
                        <div className="summary-item-info">
                          <span className="summary-item-name">
                            {item.product.name}
                          </span>
                          <span className="summary-item-details">
                            {item.boxSize && (
                              <>
                                {item.boxSize.charAt(0).toUpperCase() +
                                  item.boxSize.slice(1)}{" "}
                                Box •{" "}
                              </>
                            )}
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="summary-item-price">
                          ₱
                          {(
                            (item.price || item.product.price) * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-totals">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount (COOKIE20):</span>
                        <span className="discount-amount">
                          -₱{discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="free-shipping">FREE</span>
                        ) : (
                          `₱${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Tax (12%):</span>
                      <span>₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span className="price">₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="place-order-btn-sketch"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    <span>
                      {isProcessing
                        ? "Processing..."
                        : paymentMethod === "stripe"
                        ? "Proceed to Stripe"
                        : "Place Order"}
                    </span>
                    <IonIcon icon={checkmarkCircle} />
                  </button>

                  <div className="secure-badge-sketch">
                    <span></span>
                    <span>Secure Checkout Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Checkout;
