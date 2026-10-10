import React, { useState } from "react";
import { useHistory } from "react-router-dom";
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
  walletOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import storageService from "../services/storage";
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

interface PaymentInfo {
  paymentMethod: "card" | "gcash" | "cash";
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  gcashNumber: string;
  gcashName: string;
}

const Checkout: React.FC = () => {
  const history = useHistory();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

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

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    gcashNumber: "",
    gcashName: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 25 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "");
      value = value.replace(/(\d{4})/g, "$1 ").trim();
      value = value.substring(0, 19);
    }

    // Format expiry date
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      value = value.substring(0, 5);
    }

    // Limit CVV to 4 digits
    if (name === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 4);
    }

    // Format GCash number
    if (name === "gcashNumber") {
      value = value.replace(/\D/g, "").substring(0, 11);
      if (value.length >= 4) {
        value =
          value.substring(0, 4) +
          " " +
          value.substring(4, 7) +
          " " +
          value.substring(7);
      }
    }

    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentMethodChange = (method: "card" | "gcash" | "cash") => {
    setPaymentInfo((prev) => ({ ...prev, paymentMethod: method }));
    // Clear payment-related errors when switching methods
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors.cardNumber;
      delete newErrors.cardName;
      delete newErrors.expiryDate;
      delete newErrors.cvv;
      delete newErrors.gcashNumber;
      delete newErrors.gcashName;
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validate shipping info
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

    // Validate payment info based on selected method
    if (paymentInfo.paymentMethod === "card") {
      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }
      if (!paymentInfo.cardName.trim())
        newErrors.cardName = "Cardholder name is required";
      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = "Invalid format (MM/YY)";
      }
      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (paymentInfo.cvv.length < 3) {
        newErrors.cvv = "CVV must be 3-4 digits";
      }
    } else if (paymentInfo.paymentMethod === "gcash") {
      if (!paymentInfo.gcashNumber.trim()) {
        newErrors.gcashNumber = "GCash number is required";
      } else if (paymentInfo.gcashNumber.replace(/\s/g, "").length !== 11) {
        newErrors.gcashNumber = "GCash number must be 11 digits";
      }
      if (!paymentInfo.gcashName.trim())
        newErrors.gcashName = "Account name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        id: `ORD-${Date.now()}`,
        userId: user?.id || "guest",
        date: new Date().toISOString(),
        status: paymentInfo.paymentMethod === "cash" ? "pending" : "processing",
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
        paymentMethod: paymentInfo.paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        items: cart.map((item) => ({
          id: `ITEM-${Date.now()}-${Math.random()}`,
          orderId: `ORD-${Date.now()}`,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        contactInfo: {
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        },
      };

      // Save order to localStorage (you can replace this with your database service)
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      // Store order details for confirmation page
      localStorage.setItem("lastOrder", JSON.stringify(order));

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      history.push("/order-confirmation");
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
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
          message="Processing your order..."
          spinner="crescent"
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
            <div className="checkout-steps">
              <div className="step active">
                <span className="step-number">1</span>
                <span className="step-label">Shipping</span>
              </div>
              <div className="step-line"></div>
              <div className="step active">
                <span className="step-number">2</span>
                <span className="step-label">Payment</span>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-label">Confirmation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Content */}
        <section className="checkout-content-section">
          <div className="checkout-container">
            <div className="checkout-layout">
              {/* Left Side - Forms */}
              <div className="checkout-form-area">
                {/* Shipping Information */}
                <div className="form-card">
                  <h2 className="form-title">Shipping Information</h2>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-input ${
                          errors.firstName ? "error" : ""
                        }`}
                        value={shippingInfo.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                      />
                      {errors.firstName && (
                        <span className="error-message">
                          {errors.firstName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-input ${
                          errors.lastName ? "error" : ""
                        }`}
                        value={shippingInfo.lastName}
                        onChange={handleInputChange}
                        placeholder="Dela Cruz"
                      />
                      {errors.lastName && (
                        <span className="error-message">{errors.lastName}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`form-input ${errors.email ? "error" : ""}`}
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        placeholder="juan@example.com"
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Phone <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-input ${errors.phone ? "error" : ""}`}
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="0912 345 6789"
                      />
                      {errors.phone && (
                        <span className="error-message">{errors.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Address <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      className={`form-input ${errors.address ? "error" : ""}`}
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Barangay Sample"
                    />
                    {errors.address && (
                      <span className="error-message">{errors.address}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        className={`form-input ${errors.city ? "error" : ""}`}
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        placeholder="Manila"
                      />
                      {errors.city && (
                        <span className="error-message">{errors.city}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        State/Province <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        className={`form-input ${errors.state ? "error" : ""}`}
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        placeholder="Metro Manila"
                      />
                      {errors.state && (
                        <span className="error-message">{errors.state}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        ZIP Code <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        className={`form-input ${
                          errors.zipCode ? "error" : ""
                        }`}
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        placeholder="1000"
                      />
                      {errors.zipCode && (
                        <span className="error-message">{errors.zipCode}</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select
                        name="country"
                        className="form-input"
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
                <div className="form-card">
                  <h2 className="form-title">Payment Method</h2>

                  <div className="payment-methods">
                    <button
                      type="button"
                      className={`payment-method-btn ${
                        paymentInfo.paymentMethod === "card" ? "active" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange("card")}
                    >
                      <IonIcon icon={cardOutline} className="payment-icon" />
                      <span>Credit/Debit Card</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-method-btn ${
                        paymentInfo.paymentMethod === "gcash" ? "active" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange("gcash")}
                    >
                      <IonIcon icon={walletOutline} className="payment-icon" />
                      <span>GCash</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-method-btn ${
                        paymentInfo.paymentMethod === "cash" ? "active" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange("cash")}
                    >
                      <IonIcon icon={cashOutline} className="payment-icon" />
                      <span>Cash on Delivery</span>
                    </button>
                  </div>

                  {/* Card Payment Fields */}
                  {paymentInfo.paymentMethod === "card" && (
                    <div className="payment-fields">
                      <div className="form-group">
                        <label className="form-label">
                          Card Number <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          className={`form-input ${
                            errors.cardNumber ? "error" : ""
                          }`}
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                        {errors.cardNumber && (
                          <span className="error-message">
                            {errors.cardNumber}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Cardholder Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          className={`form-input ${
                            errors.cardName ? "error" : ""
                          }`}
                          value={paymentInfo.cardName}
                          onChange={handlePaymentInputChange}
                          placeholder="JUAN DELA CRUZ"
                        />
                        {errors.cardName && (
                          <span className="error-message">
                            {errors.cardName}
                          </span>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">
                            Expiry Date <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            className={`form-input ${
                              errors.expiryDate ? "error" : ""
                            }`}
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentInputChange}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors.expiryDate && (
                            <span className="error-message">
                              {errors.expiryDate}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            CVV <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            className={`form-input ${
                              errors.cvv ? "error" : ""
                            }`}
                            value={paymentInfo.cvv}
                            onChange={handlePaymentInputChange}
                            placeholder="123"
                            maxLength={4}
                          />
                          {errors.cvv && (
                            <span className="error-message">{errors.cvv}</span>
                          )}
                        </div>
                      </div>

                      <div className="payment-security-badge">
                        <span>🔒</span>
                        <span>
                          Your payment information is secure and encrypted
                        </span>
                      </div>
                    </div>
                  )}

                  {/* GCash Payment Fields */}
                  {paymentInfo.paymentMethod === "gcash" && (
                    <div className="payment-fields">
                      <div className="gcash-info-box">
                        <div className="gcash-logo">📱 GCash</div>
                        <p>Enter your GCash account details to continue</p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          GCash Mobile Number{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="gcashNumber"
                          className={`form-input ${
                            errors.gcashNumber ? "error" : ""
                          }`}
                          value={paymentInfo.gcashNumber}
                          onChange={handlePaymentInputChange}
                          placeholder="0917 123 4567"
                        />
                        {errors.gcashNumber && (
                          <span className="error-message">
                            {errors.gcashNumber}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Account Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="gcashName"
                          className={`form-input ${
                            errors.gcashName ? "error" : ""
                          }`}
                          value={paymentInfo.gcashName}
                          onChange={handlePaymentInputChange}
                          placeholder="Juan Dela Cruz"
                        />
                        {errors.gcashName && (
                          <span className="error-message">
                            {errors.gcashName}
                          </span>
                        )}
                      </div>

                      <div className="payment-note">
                        <p>
                          💡 You will receive a GCash payment request to
                          complete the transaction after placing your order.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {paymentInfo.paymentMethod === "cash" && (
                    <div className="payment-fields">
                      <div className="payment-info-note">
                        <h4>💵 Cash on Delivery</h4>
                        <p>
                          Pay with cash when your order is delivered to your
                          doorstep. Please prepare the exact amount.
                        </p>
                        <div className="cod-features">
                          <div className="feature-item">
                            ✓ No upfront payment needed
                          </div>
                          <div className="feature-item">
                            ✓ Pay upon delivery
                          </div>
                          <div className="feature-item">
                            ✓ Inspect before payment
                          </div>
                        </div>
                        <p className="note-highlight">
                          💡 Amount to prepare: ₱{(total * 56).toFixed(2)} or $
                          {total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Order Summary */}
              <div className="checkout-summary-area">
                <div className="summary-card">
                  <h2 className="summary-title">Order Summary</h2>

                  <div className="summary-items">
                    {cart.map((item) => (
                      <div key={item.product.id} className="summary-item">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="summary-item-image"
                        />
                        <div className="summary-item-info">
                          <span className="summary-item-name">
                            {item.product.name}
                          </span>
                          <span className="summary-item-qty">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="summary-item-price">
                          ₱{(item.product.price * item.quantity).toFixed(2)}
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
                      <span>Tax:</span>
                      <span>₱{tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </button>

                  <div className="secure-checkout-badge">
                    <span>🔒 Secure Checkout</span>
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
