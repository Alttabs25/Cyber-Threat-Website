import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins for mobile app
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Initialize Stripe with your secret key from environment variable
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Cookie Haven Stripe Server is running!",
    timestamp: new Date().toISOString(),
  });
});

app.post("/create-checkout-session", async (req, res) => {
  const { cart, shippingInfo, shipping, tax } = req.body;

  console.log("📦 Received checkout request:");
  console.log("- Cart items:", cart?.length || 0);
  console.log("- Customer:", shippingInfo?.email);
  console.log("- Shipping:", shipping);
  console.log("- Tax:", tax);

  try {
    const line_items = cart.map((item) => ({
      price_data: {
        currency: "php",
        product_data: {
          name: `${item.product.name} - ${
            item.boxSize
              ? item.boxSize.charAt(0).toUpperCase() +
                item.boxSize.slice(1) +
                " Box"
              : "Regular Box"
          }`,
          description: `${
            item.boxSize
              ? item.boxSize.charAt(0).toUpperCase() + item.boxSize.slice(1)
              : "Regular"
          } box`,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item
    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: "php",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: "php",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    console.log("💳 Creating Stripe session with", line_items.length, "items");

    // Determine the correct redirect URL based on the origin
    const origin = req.headers.origin || "http://localhost:5173";
    const isCapacitor =
      origin.includes("capacitor") || origin === "http://localhost";

    // For Capacitor apps, use the app's URL scheme
    const redirectBase = isCapacitor
      ? "https://cookie-haven-app.netlify.app" // Your deployed web app URL
      : origin;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${redirectBase}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectBase}/checkout`,
      customer_email: shippingInfo.email,
      metadata: {
        customerName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
      },
    });

    console.log("✅ Stripe session created:", session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Stripe server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});
