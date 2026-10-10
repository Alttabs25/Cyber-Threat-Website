import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  checkmarkCircleOutline,
  homeOutline,
  receiptOutline,
  printOutline,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import { getProductImage } from "../data/products";
import "./OrderConfirmation.css";

interface Order {
  id: string;
  date: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingInfo: any;
  paymentMethod: string;
  discountAmount?: number;
}

const OrderConfirmation: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ order?: Order }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isStripePayment, setIsStripePayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // Check if coming from Stripe with session_id
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (sessionId) {
          console.log(
            "[ORDER CONFIRMATION] Stripe payment successful. Session ID:",
            sessionId
          );
          setIsStripePayment(true);
        }

        // Get order from location state or localStorage
        if (location.state?.order) {
          console.log("[ORDER CONFIRMATION] Order found in location state");
          setOrder(location.state.order);
          setLoading(false);
        } else {
          // Try to get from lastOrder in localStorage
          const lastOrder = localStorage.getItem("lastOrder");
          if (lastOrder) {
            console.log("[ORDER CONFIRMATION] Order found in lastOrder");
            setOrder(JSON.parse(lastOrder));
            setLoading(false);
          } else {
            // Get most recent order from orders array
            const ordersStr = localStorage.getItem("orders");
            console.log(
              "[ORDER CONFIRMATION] Orders in localStorage:",
              ordersStr
            );
            const orders = JSON.parse(ordersStr || "[]");
            if (orders.length > 0) {
              console.log(
                "[ORDER CONFIRMATION] Found",
                orders.length,
                "orders, using most recent"
              );
              setOrder(orders[orders.length - 1]); // Get last order
              setLoading(false);
            } else {
              // No order found
              console.log(
                "[ORDER CONFIRMATION] No order found, redirecting to home"
              );
              setLoading(false);
              setTimeout(() => history.push("/"), 2000);
            }
          }
        }
      } catch (error) {
        console.error("[ORDER CONFIRMATION] Error loading order:", error);
        setLoading(false);
        setTimeout(() => history.push("/"), 2000);
      }
    };

    loadOrder();
  }, [location, history]);

  const goToHome = () => {
    history.push("/");
  };

  const goToOrders = () => {
    history.push("/orders");
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <Navbar />
        </IonHeader>
        <IonContent fullscreen>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
              flexDirection: "column",
              fontFamily: '"Comic Neue", cursive',
              fontSize: "18px",
              color: "#3d2817",
            }}
          >
            <div style={{ marginBottom: "20px" }}>Loading your order...</div>
            <div>🍪</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!order) {
    return (
      <IonPage>
        <IonHeader>
          <Navbar />
        </IonHeader>
        <IonContent fullscreen>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
              flexDirection: "column",
              fontFamily: '"Comic Neue", cursive',
              fontSize: "18px",
              color: "#3d2817",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              No order found. Redirecting...
            </div>
            <div>🍪</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>

      <IonContent fullscreen>
        {/* Success Banner */}
        <section className="success-banner-section">
          <div className="cart-container">
            <div className="success-animation">
              <IonIcon icon={checkmarkCircleOutline} className="success-icon" />
            </div>
            <h1 className="cart-title-sketch">
              <span className="underline-sketch">Order Confirmed! 🎉</span>
            </h1>
            <p className="cart-subtitle">
              Thank you for your order! Your cookies have been delivered!
            </p>
            <div className="order-number-badge">Order #{order.id}</div>
          </div>
        </section>

        {/* Order Details */}
        <section className="cart-content-section">
          <div className="cart-container">
            <div className="cart-layout">
              {/* Order Items */}
              <div className="cart-items-area">
                <h2 className="section-title-sketch">Your Order</h2>
                {order.items.map((item, index) => (
                  <div key={index} className="cart-item-card">
                    <div className="cart-item-image">
                      <img
                        src={`/images/cookies/${getProductImage(
                          item.productId
                        )}`}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
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
                          : ""}
                      </p>
                      <span className="cart-item-price">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-quantity-display-static">
                        Qty: {item.quantity}
                      </div>
                      <div className="cart-item-total">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Shipping & Payment Info Cards */}
                <div className="info-cards-grid">
                  <div className="info-card-sketch">
                    <h3 className="info-card-title">📍 Shipping Address</h3>
                    <div className="info-card-content">
                      <p>
                        <strong>
                          {order.shippingInfo.firstName}{" "}
                          {order.shippingInfo.lastName}
                        </strong>
                      </p>
                      <p>{order.shippingInfo.address}</p>
                      <p>
                        {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
                        {order.shippingInfo.zipCode}
                      </p>
                      <p>{order.shippingInfo.country}</p>
                      <p>📧 {order.shippingInfo.email}</p>
                      <p>📞 {order.shippingInfo.phone}</p>
                    </div>
                  </div>

                  <div className="info-card-sketch">
                    <h3 className="info-card-title">💳 Payment Info</h3>
                    <div className="info-card-content">
                      <p>
                        <strong>Method:</strong> {order.paymentMethod}
                      </p>
                      <p>
                        <strong>Payment Status:</strong>{" "}
                        <span className="status-badge-paid">
                          {order.paymentStatus || "Paid"}
                        </span>
                      </p>
                      <p>
                        <strong>Order Status:</strong>{" "}
                        <span className="status-badge-delivered">
                          {order.status}
                        </span>
                      </p>
                      <p className="order-date">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="cart-summary-area">
                <div className="summary-card-sketch">
                  <h2 className="summary-title-sketch">Order Summary</h2>

                  <div className="summary-breakdown">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₱{order.subtotal.toFixed(2)}</span>
                    </div>

                    {order.discountAmount && order.discountAmount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount</span>
                        <span className="discount-amount">
                          -₱{order.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="summary-row">
                      <span>Shipping</span>
                      <span>
                        {order.shipping === 0 ? (
                          <span className="free-shipping">FREE</span>
                        ) : (
                          `₱${order.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="summary-row">
                      <span>Tax (12% VAT)</span>
                      <span>₱{order.tax.toFixed(2)}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                      <span>Total</span>
                      <span>₱{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="summary-actions">
                    <button
                      className="primary-btn-sketch"
                      onClick={printInvoice}
                    >
                      <IonIcon icon={printOutline} />
                      Print Invoice
                    </button>
                    <button
                      className="secondary-btn-sketch"
                      onClick={goToOrders}
                    >
                      <IonIcon icon={receiptOutline} />
                      View My Orders
                    </button>
                    <button className="secondary-btn-sketch" onClick={goToHome}>
                      <IonIcon icon={homeOutline} />
                      Back to Home
                    </button>
                  </div>

                  {/* Support Info */}
                  <div className="support-info-sketch">
                    <h3>Need Help? 🤔</h3>
                    <p>Contact our support team:</p>
                    <p className="support-contact">
                      📧 support@chiphappens.com
                      <br />
                      📞 (555) 123-4567
                    </p>
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

export default OrderConfirmation;
