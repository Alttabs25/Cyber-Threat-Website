import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  arrowBackOutline,
  cardOutline,
  lockClosedOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import storageService from "../services/storage";
import "./Payment.css";

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const Payment: React.FC = () => {
  const history = useHistory();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<PaymentInfo>>({});
  const [processing, setProcessing] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 25 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "");
      value = value.replace(/(\d{4})/g, "$1 ").trim();
      value = value.substring(0, 19); // 16 digits + 3 spaces
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

    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof PaymentInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<PaymentInfo> = {};

    if (!paymentInfo.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!paymentInfo.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    if (validateForm()) {
      setProcessing(true);

      // Simulate payment processing
      setTimeout(async () => {
        // Get shipping and payment info from localStorage
        const shippingInfo = JSON.parse(
          localStorage.getItem("shippingInfo") || "{}"
        );
        const savedPaymentInfo = JSON.parse(
          localStorage.getItem("paymentInfo") || "{}"
        );

        // Determine payment method display
        let paymentMethodDisplay = "";
        if (savedPaymentInfo.paymentMethod === "card") {
          paymentMethodDisplay = `Card **** ${
            savedPaymentInfo.cardNumber?.slice(-4) || "****"
          }`;
        } else if (savedPaymentInfo.paymentMethod === "gcash") {
          paymentMethodDisplay = `GCash ${savedPaymentInfo.gcashNumber || ""}`;
        } else if (savedPaymentInfo.paymentMethod === "cash") {
          paymentMethodDisplay = "Cash on Delivery";
        } else {
          paymentMethodDisplay = `Card **** ${paymentInfo.cardNumber.slice(
            -4
          )}`;
        }

        // Create order using storage service
        const storageCartItems = await storageService.getCartItems(user.id);
        const order = await storageService.createOrder(
          user.id,
          storageCartItems,
          shippingInfo,
          paymentMethodDisplay,
          subtotal,
          shipping,
          tax,
          total
        );

        // Clear cart
        await clearCart();

        // Clear checkout data
        localStorage.removeItem("shippingInfo");
        localStorage.removeItem("paymentInfo");
        localStorage.removeItem("billingIsSameAsShipping");

        setProcessing(false);

        // Redirect to confirmation with order data
        history.push("/order-confirmation", {
          order: {
            id: order.id,
            date: order.date,
            items: cart.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image,
            })),
            subtotal,
            shipping,
            tax,
            total,
            status: order.status,
            shippingInfo,
            paymentMethod: paymentMethodDisplay,
          },
        });
      }, 2000);
    }
  };

  const goBack = () => {
    history.push("/checkout");
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
        {/* Back Button Section */}
        <section className="back-nav-section">
          <div className="back-nav-wrap">
            <button onClick={goBack} className="back-btn-sketch">
              <IonIcon icon={arrowBackOutline} />
              <span>Back to Shipping</span>
            </button>
          </div>
        </section>

        {/* Payment Title */}
        <section className="payment-title-section">
          <div className="payment-container">
            <h1 className="payment-title-sketch">
              <span className="underline-sketch">Payment</span>
            </h1>
            <div className="checkout-steps">
              <div className="step completed">
                <span className="step-number">✓</span>
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

        {/* Payment Content */}
        <section className="payment-content-section">
          <div className="payment-container">
            <div className="payment-layout">
              {/* Payment Form */}
              <div className="payment-form-area">
                <div className="form-card">
                  <div className="secure-badge">
                    <IonIcon icon={lockClosedOutline} />
                    <span>Secure Payment</span>
                  </div>

                  <h2 className="form-title">
                    <IonIcon icon={cardOutline} />
                    Card Information
                  </h2>

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
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <span className="error-message">{errors.cardNumber}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Cardholder Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      className={`form-input ${errors.cardName ? "error" : ""}`}
                      value={paymentInfo.cardName}
                      onChange={handleInputChange}
                      placeholder="JOHN DOE"
                    />
                    {errors.cardName && (
                      <span className="error-message">{errors.cardName}</span>
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
                        onChange={handleInputChange}
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
                        className={`form-input ${errors.cvv ? "error" : ""}`}
                        value={paymentInfo.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && (
                        <span className="error-message">{errors.cvv}</span>
                      )}
                    </div>
                  </div>

                  <div className="security-info">
                    <IonIcon icon={lockClosedOutline} />
                    <p>
                      Your payment information is encrypted and secure. We never
                      store your card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="payment-summary-area">
                <div className="summary-card">
                  <h2 className="summary-title">Order Summary</h2>

                  <div className="summary-items">
                    {cart.map((item) => (
                      <div key={item.product.id} className="summary-item">
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
                    className="place-order-btn-sketch"
                    onClick={handlePlaceOrder}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      <>Place Order - ₱{total.toFixed(2)}</>
                    )}
                  </button>

                  <div className="payment-methods-info">
                    <p>We accept:</p>
                    <div className="payment-icons">
                      <span>💳</span>
                      <span>🏦</span>
                      <span>📱</span>
                    </div>
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

export default Payment;
