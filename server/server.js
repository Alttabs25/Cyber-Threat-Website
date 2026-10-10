// Stripe Payment Server
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Stripe Payment Server is running!" });
});

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems, shippingInfo, successUrl, cancelUrl, customerEmail } =
      req.body;
    if (!lineItems || !shippingInfo || !successUrl || !cancelUrl) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: lineItems, shippingInfo, successUrl, cancelUrl",
        });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || shippingInfo.email,
      metadata: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
      },
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      billing_address_collection: "required",
    });
    console.log("✅ Checkout session created:", session.id);
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create checkout session" });
  }
});

// Webhook endpoint for Stripe events (for production)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret_here";
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("💳 Payment successful:", session.id);
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("✅ PaymentIntent succeeded:", paymentIntent.id);
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("❌ Payment failed:", failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  }
);

// Retrieve checkout session (for order confirmation)
app.get("/checkout-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    console.error("❌ Error retrieving session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Refund payment (for order cancellation)
app.post("/refund", async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    console.log("💰 Refund processed:", refund.id);
    res.json({ success: true, refund });
  } catch (error) {
    console.error("❌ Refund error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(
    `\n🍪 Cookie App - Stripe Payment Server running on http://localhost:${PORT}\n`
  );
});
