import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// POST /api/payment/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems } = req.body;
    console.log(req.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "samsung_pay"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: "Payment session creation failed" });
  }
});

// GET /api/payment/session-info/:sessionId
router.get("/session-info/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
      {
        expand: ["customer_details"],
      }
    );
    res.json(session);
  } catch (err) {
    console.error("Session fetch error:", err.message);
    res.status(400).json({ error: "Failed to fetch session details" });
  }
});

export default router;
