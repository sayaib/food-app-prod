import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
router.post("/invoice/:customerId/:amount", async (req, res) => {
  try {
    const { customerId, amount } = req.params;
    const { orderId, orderBreakdown } = req.body;

    let totalAmount = Number(amount);

    // 1. Check for latest existing invoice
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 1,
    });

    if (invoices.data.length > 0) {
      let invoice = invoices.data[0];

      if (invoice.status === "draft") {
        invoice = await stripe.invoices.finalizeInvoice(invoice.id);
      }

      return res.json({
        success: true,
        message: "Existing invoice found",
        hosted_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        status: invoice.status,
      });
    }

    // 2. Create draft invoice first
    let invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: false,
      description: `Food Order Invoice - Order #${orderId?.slice(-6) || "N/A"}`,
    });

    // 3. Create detailed invoice items based on order breakdown
    if (orderBreakdown) {
      // Add subtotal
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(orderBreakdown.subtotal * 100),
        currency: "usd",
        description: "Food Items Subtotal",
        invoice: invoice.id,
      });

      // Add taxes
      if (orderBreakdown.taxes && orderBreakdown.taxes.length > 0) {
        for (const tax of orderBreakdown.taxes) {
          await stripe.invoiceItems.create({
            customer: customerId,
            amount: Math.round(tax.amount * 100),
            currency: "usd",
            description: `${tax.name}${tax.rate ? ` (${tax.rate}%)` : ""}`,
            invoice: invoice.id,
          });
        }
      }

      // Add fees
      if (orderBreakdown.fees && orderBreakdown.fees.length > 0) {
        for (const fee of orderBreakdown.fees) {
          await stripe.invoiceItems.create({
            customer: customerId,
            amount: Math.round(fee.amount * 100),
            currency: "usd",
            description:
              fee.name + (fee.description ? ` - ${fee.description}` : ""),
            invoice: invoice.id,
          });
        }
      }

      // Add discount if present
      if (orderBreakdown.promoDiscount && orderBreakdown.promoDiscount > 0) {
        await stripe.invoiceItems.create({
          customer: customerId,
          amount: -Math.round(orderBreakdown.promoDiscount * 100),
          currency: "usd",
          description: "Promo Discount",
          invoice: invoice.id,
        });
      }
    } else {
      // Fallback to simple invoice item
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(totalAmount),
        currency: "usd",
        description: `Food Order - Order #${orderId?.slice(-6) || "N/A"}`,
        invoice: invoice.id,
      });
    }

    // 4. Finalize invoice
    invoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.json({
      success: true,
      message: "New invoice created",
      hosted_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      status: invoice.status,
    });
  } catch (error) {
    console.error("Invoice API error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payment/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, finalTotal, orderBreakdown } = req.body;
    console.log("Creating checkout session with breakdown:", req.body);

    // Create line items for cart items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round((item.price || item.amount) * 100), // Ensure price is in cents
      },
      quantity: item.quantity,
    }));

    // Add tax line items if present
    if (orderBreakdown?.taxes && orderBreakdown.taxes.length > 0) {
      orderBreakdown.taxes.forEach((tax) => {
        if (tax.amount > 0) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: tax.name },
              unit_amount: Math.round(tax.amount * 100),
            },
            quantity: 1,
          });
        }
      });
    }

    // Add fee line items if present
    if (orderBreakdown?.fees && orderBreakdown.fees.length > 0) {
      orderBreakdown.fees.forEach((fee) => {
        if (fee.amount > 0) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: fee.name },
              unit_amount: Math.round(fee.amount * 100),
            },
            quantity: 1,
          });
        }
      });
    }

    // Add discount if present
    const discounts = [];
    if (orderBreakdown?.couponDiscount && orderBreakdown.couponDiscount > 0) {
      // Create a coupon for the discount
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(orderBreakdown.couponDiscount * 100),
        currency: "usd",
        duration: "once",
        name: orderBreakdown.couponCode ? `Coupon: ${orderBreakdown.couponCode}` : "Coupon Discount",
      });
      discounts.push({ coupon: coupon.id });
    }

    // Create compact metadata within 500 character limit
    const compactMetadata = {
      subtotal: orderBreakdown?.subtotal || 0,
      finalTotal: orderBreakdown?.finalTotal || finalTotal,
      distance: orderBreakdown?.distance || 0,
      couponCode: orderBreakdown?.couponCode || '',
      couponDiscount: orderBreakdown?.couponDiscount || 0,
      taxTotal: orderBreakdown?.taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0,
      feeTotal: orderBreakdown?.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts: discounts,
      customer_creation: "always",
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        orderData: JSON.stringify(compactMetadata),
      },
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

// GET /api/payment/session-info/:sessionId

export default router;
